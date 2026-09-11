"use client"

import * as React from "react"
import { useInView, useReducedMotion } from "motion/react"

/**
 * A label that decodes itself: every character cycles through random glyphs
 * and locks into place left to right, once, when it scrolls into view.
 *
 * FOR MONOSPACE TEXT ONLY. The whole effect rests on the substituted glyphs
 * being exactly as wide as the real ones, which is true in a mono face and
 * false in every other. In a proportional face the line rewraps on almost
 * every frame, and avoiding that costs a per-character span, a measuring pass
 * and a width lock on each one. Used on the page's mono kickers, where it is
 * free.
 *
 * The real string is what the server renders and what stays in the DOM, so
 * the label is correct with scripting off, for a crawler, and in the moment
 * before the element is seen. Only the visible text is swapped while the
 * animation runs - same character count throughout, so nothing moves.
 *
 * Glyphs are drawn from an alphabet of capitals and digits so a mid-flight
 * label still reads as a technical label rather than as noise, and the swap
 * rate is deliberately slower than the frame rate: at 60fps the characters
 * blur into a smear instead of reading as cycling.
 */

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

/** How long each character churns before locking, in seconds. */
const SETTLE = 0.32
/** Delay between one character locking and the next, in seconds. */
const STEP = 0.035
/** Seconds between glyph swaps. Faster than this and it reads as a blur. */
const SWAP = 0.045

export function ScrambleText({
  text,
  className,
  delay = 0,
}: {
  text: string
  className?: string
  /** Seconds to wait after the label comes into view. */
  delay?: number
}) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const reduced = useReducedMotion()

  React.useEffect(() => {
    const node = ref.current
    if (!inView || !node || reduced) return

    const chars = Array.from(text)
    const start = performance.now()
    let lastSwap = 0
    let frame = 0

    const tick = (now: number) => {
      const t = (now - start) / 1000 - delay
      const swap = t - lastSwap >= SWAP

      if (t >= 0 && swap) {
        lastSwap = t
        node.textContent = chars
          .map((ch, i) => {
            // Whitespace never churns: a moving gap reads as a glitch rather
            // than as decoding.
            if (ch === " ") return ch
            return t >= i * STEP + SETTLE
              ? ch
              : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
          })
          .join("")
      }

      if (t < (chars.length - 1) * STEP + SETTLE) {
        frame = requestAnimationFrame(tick)
      } else {
        node.textContent = text
      }
    }

    frame = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame)
      // Whatever the state when this unmounts or the text changes, the real
      // string is what must be left behind.
      node.textContent = text
    }
  }, [inView, text, delay, reduced])

  return (
    <span ref={ref} className={className}>
      {text}
    </span>
  )
}
