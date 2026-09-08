"use client"

import * as React from "react"
import { stagger, useAnimate, useInView, useReducedMotion } from "motion/react"

/**
 * Group entrance for a grid or list.
 *
 * Children marked `data-stagger` start hidden (CSS, scoped to `.js` so they
 * are visible with scripting off) and rise in a few tens of milliseconds
 * apart once the group scrolls into view, on the same curve as the rest of
 * the page's reveals. It is decorative and never gates interaction: links
 * inside are real anchors from the first paint. Under reduced motion the
 * items appear at once.
 *
 * `as` picks the wrapper element so lists stay lists.
 */
export function Stagger({
  as: Tag = "div",
  children,
  className,
  step = 0.06,
  amount = 0.2,
}: {
  as?: "div" | "ul" | "ol"
  children: React.ReactNode
  className?: string
  /** Seconds between items. */
  step?: number
  /** How much of the group must be visible before it starts. */
  amount?: number
}) {
  const [scope, animate] = useAnimate<HTMLElement>()
  const inView = useInView(scope, { once: true, amount })
  const reduced = useReducedMotion()

  React.useEffect(() => {
    if (!inView) return
    const items = scope.current.querySelectorAll<HTMLElement>("[data-stagger]")
    if (items.length === 0) return
    if (reduced) {
      animate(items, { opacity: 1, y: 0 }, { duration: 0 })
      return
    }
    animate(
      items,
      { opacity: [0, 1], y: [6, 0] },
      { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: stagger(step) }
    )
  }, [inView, reduced, animate, scope, step])

  // The ref type is HTMLElement; the tag union is narrower than JSX wants,
  // so it is widened once here.
  const Element = Tag as "div"
  return (
    <Element ref={scope as unknown as React.Ref<HTMLDivElement>} className={className}>
      {children}
    </Element>
  )
}
