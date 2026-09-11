"use client"

import * as React from "react"

import { flowIn, settle, STEP, watch, type FlowDirection } from "@/lib/scroll-flow"

/**
 * Group entrance for a grid or list.
 *
 * Children marked `data-stagger` start hidden and offset (CSS, scoped to
 * `.js` so they are visible with scripting off) and arrive one clear beat
 * after another once the group comes into view, so the eye follows the row
 * instead of seeing it appear at once. It is decorative and never gates
 * interaction: links inside are real anchors from the first paint. Under
 * reduced motion the items are simply shown.
 *
 * `as` picks the wrapper element so lists stay lists. `from` is the side the
 * items enter from, set on the wrapper and inherited by every item through a
 * custom property. `step` is the beat between them: widen it for a short row
 * you want to read one at a time, tighten it for a long list that would
 * otherwise drag.
 */
export function Stagger({
  as: Tag = "div",
  children,
  className,
  from = "up",
  step = STEP,
}: {
  as?: "div" | "ul" | "ol"
  children: React.ReactNode
  className?: string
  /** Which side the items arrive from. */
  from?: FlowDirection
  /** Seconds between one item and the next. */
  step?: number
}) {
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const host = ref.current
    if (!host) return
    const items = Array.from(host.querySelectorAll<HTMLElement>("[data-stagger]"))
    if (items.length === 0) return

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      items.forEach(settle)
      return
    }

    // One watcher for the group, not one per item: the row should read as a
    // single cascade that starts when the row arrives.
    const stop = watch(host, () => {
      items.forEach((item, index) => flowIn(item, { index, step }))
    })

    return () => stop()
  }, [step])

  // The tag union is narrower than JSX wants, so it is widened once here.
  const Element = Tag as "div"
  return (
    <Element ref={ref} className={className} data-flow={from}>
      {children}
    </Element>
  )
}
