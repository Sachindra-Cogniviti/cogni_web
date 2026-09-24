"use client"

import { useEffect, useRef } from "react"

/** How fast the line travels, in pixels a second. */
const SPEED = 46

/**
 * How far either side of centre the stage reaches, as a multiple of the gap
 * between two logos.
 *
 * Half, and it has to be half. Slots are one pitch apart, so a window wider
 * than half a pitch either side of centre catches the next slot before it has
 * let go of the last one: at 1.2 there were three logos off the floor at once
 * and two of them 49px apart while each was drawn at 1.8 scale, which is the
 * handover landing on top of itself. At exactly half, the window is one slot
 * wide and the two are complementary - the outgoing logo reaches the edge of
 * the stage and touches down at the same instant the incoming one reaches the
 * other edge and starts to rise. One leaves, then one arrives, and the stage
 * is never asked to hold two.
 *
 * It is tied to the pitch rather than set in pixels for the same reason: the
 * pitch is a responsive clamp, and a fixed window would stop being one slot
 * wide the moment the row was resized.
 */
const REACH = 0.5

/**
 * The flat top of the lift curve, as a fraction of REACH.
 *
 * Without it the logo turns round the instant it touches the top and the
 * centre reads as a bounce. With it the curve has a plateau: the logo is
 * carried up, *held* at the top across the middle of the stage, and then let
 * down. The hold is the whole effect - it is the difference between a line
 * that bumps and a line that presents one client at a time.
 *
 * Against the pitch and the speed above it works out at a little under two
 * seconds held, inside a turn of about four and a half seconds a logo - long
 * enough to read a mark that may be unfamiliar, short enough that the whole
 * client list comes round inside a minute.
 */
const HOLD = 0.4

/**
 * How much of the horizontal drift is taken out of a logo while it is held.
 *
 * At 0 the held logo keeps sailing across the stage and the hold is only
 * vertical. At 1 it parks dead centre and then has to teleport to catch its
 * slot up again. Most of the way is right: the logo slows almost to a stop
 * under the light, the line carries on underneath it, and the gap it left
 * opens and closes on its own.
 */
const CATCH = 0.82

/**
 * Extra scale at the top of the lift. The mark is being presented, not
 * nudged. Its ceiling is the stage: the tallest mark on the wall is 60px, and
 * 1.8 of that has to fit inside `--arc-stage` at its smallest, which is where
 * the 120px floor on that clamp comes from.
 */
const SWELL = 0.8

/** Opacity of a logo in the line, against 1 on the stage. */
const DIM = 0.42

/**
 * The line of clients that hands one up to the centre.
 *
 * The mechanic is Sentry's: a single row of logos travelling steadily
 * sideways, and whatever reaches the middle is lifted out of the row, held
 * large for a moment and set back down. Sentry draws a flying saucer and a
 * tractor beam over the middle. This does not - see components/trusted-by-arc
 * for what stands in for it - but the movement is the same, including the
 * part that makes it work: the row does not close the gap. The slot the
 * lifted logo came out of travels on empty and is still there waiting when it
 * comes down.
 *
 * All of it is one requestAnimationFrame loop writing `transform` and
 * `opacity`, because the vertical position of every logo is a function of
 * where it is horizontally, and CSS has no way to say that. What it is not is
 * a loop that measures: nothing is read back from the DOM per frame, so there
 * is no forced layout. Each logo's place is worked out from its index, the
 * pitch and one accumulated offset.
 *
 * `offset` accumulates rather than being derived from a start timestamp, for
 * the reason the galaxy's clock does (components/hero-galaxy.tsx): a loop
 * that parks off-screen or pauses under the pointer and then reads the wall
 * clock on waking snaps the whole line forward by however long it slept.
 * A frame gap is also clamped, so a tab that was busy resumes rather than
 * jumps.
 *
 * The gates are the ones the idle turns use (lib/idle-turns.ts) and exist for
 * the same reason: off-screen the loop does not run, a hidden tab does not run
 * it, and `prefers-reduced-motion` gets a single static pass and no loop at
 * all - a row of logos, evenly spaced, none of them lifted.
 *
 * Pitch is read off the first item's own width rather than computed here, so
 * the spacing lives in the stylesheet as a normal responsive clamp and the
 * server-rendered layout, which uses that same variable, cannot disagree with
 * the first frame this draws.
 *
 * The constants above are one tuning of it - the Sentry-style abduction, where
 * a logo is taken clear of the row and presented. `RideTuning` opens every one
 * of them, so a second treatment can be the same movement read quietly: a
 * shorter lift, no grip, and the brightness rather than the height carrying
 * the emphasis. One loop, two readings; there is no second loop to keep in
 * step with this one.
 */
export type RideTuning = {
  /** Pixels a second the line travels. */
  speed?: number
  /** Window half-width, as a multiple of the slot pitch. See REACH. */
  reach?: number
  /** Flat top of the lift curve, as a fraction of `reach`. See HOLD. */
  hold?: number
  /** How much horizontal drift is taken out of a slot at the top. See CATCH. */
  grip?: number
  /** Extra scale at the top. */
  swell?: number
  /** Opacity of a slot in the line, against 1 at the top. */
  dim?: number
  /**
   * How far a slot rises, in pixels. Left out, it is half the row - the
   * geometry that centres a slot in a stage above the line, which is what the
   * Sentry-style treatment wants. A treatment whose lift is a nudge rather
   * than an abduction passes its own number instead.
   */
  lift?: number
  /**
   * Above this much lift, a slot is marked `data-lit` so the stylesheet can
   * answer - a brighter ground, a darker border, accent brackets. Left out,
   * nothing is marked and the only signals are the transform and the opacity.
   */
  lit?: number
  /**
   * Turns the line into a fan: how many slots either side of the middle the
   * tilt and the fall are spread over. Left out, slots stay upright and level
   * and the line is a line.
   *
   * Unlike everything above, the fan reads the SIGNED distance from the
   * middle, because a fan is not symmetric - the slot to the left of centre
   * leans the other way from the one to its right. `lift`, `swell` and the
   * opacity all still come off the unsigned curve.
   */
  spread?: number
  /** Degrees a slot is turned at the outer edge of `spread`. */
  tilt?: number
  /**
   * Pixels the outermost slot sits below the middle one. Parabolic, so the
   * fall is slow around the middle and steep at the edges - which is what
   * makes the tops of the cards read as an arc rather than as a V.
   */
  drop?: number
}

export function useLogoRide(
  count: number,
  {
    speed = SPEED,
    reach: reachRatio = REACH,
    hold: holdTop = HOLD,
    grip = CATCH,
    swell = SWELL,
    dim = DIM,
    lift: liftPx,
    lit,
    spread,
    tilt = 0,
    drop = 0,
  }: RideTuning = {}
) {
  const row = useRef<HTMLDivElement | null>(null)
  const items = useRef<(HTMLLIElement | null)[]>([])

  useEffect(() => {
    const host = row.current
    if (!host || count === 0) return

    const still = window.matchMedia("(prefers-reduced-motion: reduce)")

    let pitch = 0
    let span = 0
    let width = 0
    let lift = 0
    let offset = 0
    let last = 0
    let frame = 0
    let held = false
    let onScreen = false
    const depth: number[] = []
    const glow: boolean[] = []

    const measure = () => {
      width = host.clientWidth
      pitch = items.current[0]?.offsetWidth || 180
      span = count * pitch
      // The line has to be longer than the window plus one slot, or a logo
      // would wrap back into view before the one ahead of it has left.
      if (span < width + pitch) span = width + pitch
      // Half the row, which is exactly what puts a lifted slot's centre in
      // the centre of the stage: a slot at rest is centred half a band above
      // the floor, the stage is centred half a stage below the top, and the
      // distance between those two is half of band plus stage. Scaling then
      // grows the mark about the middle of the stage rather than off its
      // floor, so nothing has to be nudged afterwards to look centred.
      //
      // A caller that only wants the slot to rise clear of its neighbours
      // gives a flat number instead, and the row is sized around that.
      lift = liftPx ?? host.clientHeight / 2
    }

    const draw = () => {
      const mid = width / 2
      const reach = pitch * reachRatio
      for (let i = 0; i < items.current.length; i++) {
        const el = items.current[i]
        if (!el) continue

        // Centre of this logo's slot, wrapped into a window that starts one
        // whole slot off the left edge, so a logo leaves completely before it
        // comes back on the right.
        const slot =
          ((((i * pitch + pitch / 2 - offset) % span) + span) % span) - pitch

        const u = Math.min(1, Math.abs(slot - mid) / reach)
        const b =
          u <= holdTop
            ? 1
            : 0.5 * (1 + Math.cos((Math.PI * (u - holdTop)) / (1 - holdTop)))

        // Squared, so the catch belongs to the logo actually being held. On a
        // linear b the neighbours either side are drawn inwards too - only
        // slightly, but enough that the widest wordmark on the stage and the
        // one behind it overlap at the moment of the handover.
        const x = slot - pitch / 2 + (mid - slot) * b * b * grip

        // The fan. `d` is signed and clamped to the spread, so a slot past
        // the edge of the fan keeps the outermost card's angle instead of
        // winding on round as it leaves.
        let turn = ""
        let fall = 0
        if (spread) {
          const d = Math.max(-1, Math.min(1, (slot - mid) / (pitch * spread)))
          turn = ` rotate(${(tilt * d).toFixed(2)}deg)`
          fall = drop * d * d
        }

        el.style.transform = `translate3d(${x}px, ${fall - lift * b}px, 0)${turn} scale(${1 + swell * b})`
        el.style.opacity = `${dim + (1 - dim) * b}`
        // How far up the curve this slot is, for the stylesheet to read. A
        // fan overlaps, so it cannot dim a card by making the card itself
        // transparent - you would see the card behind through it. Handing the
        // number over lets the CSS dim the contents instead and leave the
        // card opaque.
        el.style.setProperty("--ride-b", b.toFixed(3))

        // Only written when it changes: a z-index write invalidates stacking
        // for the whole row. Level, that is two values and it almost never
        // changes; fanned, the cards overlap and have to stack by how near
        // the middle they are, so it is quantised to eight steps rather than
        // written every frame.
        const z = spread
          ? 40 - Math.round((Math.abs(slot - mid) / (pitch * spread)) * 8)
          : b > 0.02
            ? 2
            : 1
        if (depth[i] !== z) {
          el.style.zIndex = String(z)
          depth[i] = z
        }

        // Likewise: an attribute write re-matches selectors on the element,
        // and this one only flips twice per slot per pass.
        if (lit !== undefined) {
          const on = b > lit
          if (glow[i] !== on) {
            el.toggleAttribute("data-lit", on)
            glow[i] = on
          }
        }
      }
    }

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick)
      const dt = last ? Math.min(now - last, 100) / 1000 : 0
      last = now
      if (!held) offset = (offset + speed * dt) % span
      draw()
    }

    const stop = () => {
      cancelAnimationFrame(frame)
      frame = 0
      last = 0
    }

    const sync = () => {
      if (still.matches) {
        stop()
        measure()
        // One frame, then nothing. The same code path as the loop, simply
        // never advanced: the line is laid out, whichever slot the parked
        // offset puts at the centre is on the stage, and it stays there.
        // A composition that happens to have a logo presented in it is not
        // motion, and it is a better still than a flat row would be.
        offset = 0
        draw()
        return
      }
      if (onScreen && !document.hidden) {
        if (!frame) {
          last = 0
          frame = requestAnimationFrame(tick)
        }
      } else {
        stop()
      }
    }

    measure()
    draw()

    const watcher = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting
        sync()
      },
      { threshold: 0.2 }
    )
    watcher.observe(host)

    const sizes = new ResizeObserver(() => {
      measure()
      draw()
    })
    sizes.observe(host)

    // A logo on the stage is a link the reader may be about to click, and a
    // link that is still travelling cannot be aimed at.
    const hold = () => {
      held = true
    }
    const release = () => {
      held = false
    }
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)")
    if (fine.matches) {
      host.addEventListener("pointerenter", hold)
      host.addEventListener("pointerleave", release)
    }
    host.addEventListener("focusin", hold)
    host.addEventListener("focusout", release)

    document.addEventListener("visibilitychange", sync)
    still.addEventListener("change", sync)

    return () => {
      stop()
      watcher.disconnect()
      sizes.disconnect()
      host.removeEventListener("pointerenter", hold)
      host.removeEventListener("pointerleave", release)
      host.removeEventListener("focusin", hold)
      host.removeEventListener("focusout", release)
      document.removeEventListener("visibilitychange", sync)
      still.removeEventListener("change", sync)
    }
  }, [
    count,
    speed,
    reachRatio,
    holdTop,
    grip,
    swell,
    dim,
    liftPx,
    lit,
    spread,
    tilt,
    drop,
  ])

  return { row, items }
}
