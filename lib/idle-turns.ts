"use client"

import { useEffect, useRef } from "react"

/**
 * How much longer an unprompted turn takes than a hover turn.
 *
 * The roll is 360ms because it is an answer to a pointer and has to keep up
 * with one. A turn nobody asked for is read peripherally, and at 360ms it
 * registers as a flicker at the edge of vision rather than as a logo turning
 * over. This stretches it to a length the eye can follow without ever having
 * to look straight at it.
 */
const SLOWER = 1.7

/**
 * The idle roll on the client logo wall.
 *
 * The wall's cells already turn over under a pointer (FlipTrack in
 * components/primitives.tsx, `.logo-flip` in globals.css): the mark and a copy
 * of it are two faces of a shallow box, and a quarter turn over the top edge
 * swaps one for the other. This drives that same quarter turn on a timer
 * instead of a pointer, one cell at a time in a shuffled order, so the wall is
 * never entirely still without ever becoming a thing that scrolls.
 *
 * Both faces carry the same mark, so the turn has no end state to hold: the
 * animation is played with the default `fill`, which means the track is back
 * at rest the moment it finishes and the front face is showing again. Nothing
 * is left on the element and the hover transition takes over untouched.
 *
 * Three gates, and all three exist for the same reason the galaxy settles
 * (components/hero-galaxy.tsx): an animation that never stops is a page that
 * never finishes drawing.
 *
 *   - Off-screen the timer does not run at all, through one observer on the
 *     wrapper rather than one per cell.
 *   - A hidden tab does not run it either. A background tab's timers are
 *     clamped and its animations do not composite, so the turns queued while
 *     it was away would otherwise all land at once on return.
 *   - `prefers-reduced-motion` disables it outright. The hover turn is a
 *     reply to something the reader did; this one is not, so it is exactly
 *     the kind of motion that setting is asking to be spared.
 *
 * The order is reshuffled each time it is exhausted rather than being drawn
 * at random per tick, so no cell is picked twice running and none sits out a
 * whole pass - a plain random pick over twelve cells visibly clusters.
 *
 * Returns the ref for the wrapper to watch and the array the cells register
 * their flip tracks in, in the order they are rendered.
 */
export function useIdleTurns(count: number, { interval = 2000 } = {}) {
  const tracks = useRef<(HTMLSpanElement | null)[]>([])
  const scope = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const host = scope.current
    if (!host || count === 0) return

    const still = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (still.matches) return

    // The ease is the label roll's, read off the stylesheet rather than
    // repeated here, so a logo turning on its own and a logo turning under
    // the pointer are recognisably the same movement. The duration is not:
    // see SLOWER above.
    const styles = getComputedStyle(document.documentElement)
    const roll = styles.getPropertyValue("--roll-duration").trim()
    const parsed = roll.endsWith("ms")
      ? parseFloat(roll)
      : parseFloat(roll) * 1000
    const duration = (Number.isFinite(parsed) ? parsed : 360) * SLOWER
    const easing = styles.getPropertyValue("--roll-ease").trim() || "ease"

    let order: number[] = []
    let next = 0
    let timer: ReturnType<typeof setInterval> | undefined
    let onScreen = false

    const shuffle = () => {
      order = Array.from({ length: count }, (_, i) => i)
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[order[i], order[j]] = [order[j], order[i]]
      }
      next = 0
    }

    const turn = () => {
      if (next >= order.length) shuffle()
      const track = tracks.current[order[next]]
      next += 1
      if (!track) return

      const depth = track.style.getPropertyValue("--logo-flip-depth") || "20px"
      const back = `translateZ(calc(-1 * ${depth}))`
      track.animate(
        [{ transform: back }, { transform: `${back} rotateX(90deg)` }],
        { duration, easing },
      )
    }

    const stop = () => {
      clearInterval(timer)
      timer = undefined
    }

    const sync = () => {
      if (onScreen && !document.hidden) {
        if (!timer) {
          shuffle()
          timer = setInterval(turn, interval)
        }
      } else {
        stop()
      }
    }

    const watcher = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting
        sync()
      },
      // A cell half out of the viewport turning over is a cell the reader
      // cannot read the result of, so the wall has to be properly in view.
      { threshold: 0.35 },
    )
    watcher.observe(host)

    const onQuiet = () => {
      stop()
      onScreen = false
    }
    document.addEventListener("visibilitychange", sync)
    still.addEventListener("change", onQuiet)

    return () => {
      stop()
      watcher.disconnect()
      document.removeEventListener("visibilitychange", sync)
      still.removeEventListener("change", onQuiet)
    }
  }, [count, interval])

  return { scope, tracks }
}
