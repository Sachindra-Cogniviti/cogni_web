"use client"

import * as React from "react"
import { animate, useInView, useReducedMotion } from "motion/react"

/**
 * A stat numeral that counts up each time it scrolls into view.
 *
 * The final value is what the HTML carries, so the number is right with
 * scripting off and in the crawler. With scripting on, the count runs from
 * zero over 700ms on the page's ease-out, each of the four offset by 60ms,
 * and is done before the eye settles on the block. Tabular figures keep the
 * width still while the digits change. Under reduced motion the value is
 * simply shown. Non-numeric values render as they are.
 *
 * When the block leaves the viewport the count is stopped and the final
 * value put back, so the numeral is never left mid-count, and the next
 * arrival starts from zero again.
 */
export function StatValue({ value, index = 0 }: { value: string; index?: number }) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { amount: 0.5 })
  const reduced = useReducedMotion()
  const target = Number(value)

  React.useEffect(() => {
    const node = ref.current
    if (!inView || !node || Number.isNaN(target) || reduced) return
    node.textContent = "0"
    const controls = animate(0, target, {
      duration: 0.7,
      ease: [0.23, 1, 0.32, 1],
      delay: index * 0.06,
      onUpdate: (v) => {
        node.textContent = String(Math.round(v))
      },
    })
    return () => {
      controls.stop()
      node.textContent = value
    }
  }, [inView, target, reduced, index, value])

  return (
    <span ref={ref} className="tabular-nums">
      {value}
    </span>
  )
}
