"use client"

import * as React from "react"

/**
 * Which of the given section ids is currently "the" section on screen.
 *
 * A section is current from the moment its top passes a line a third of the
 * way down the viewport until the next one does; at the very bottom of the
 * page the last section wins even if it is short. This reads the layout on
 * scroll and resize, throttled to one measurement per frame, rather than
 * using an IntersectionObserver: observers report visibility, but "which
 * section am I in" is a question about position, and tall sections would
 * otherwise drop out while fully covering the viewport.
 *
 * Returns null until the first section has been reached.
 */
export function useActiveSection(ids: readonly string[]): string | null {
  const [active, setActive] = React.useState<string | null>(null)

  React.useEffect(() => {
    let frame: number | null = null

    const measure = () => {
      frame = null
      const line = window.scrollY + window.innerHeight * 0.34
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2

      // The lowest section on the page whose top has passed the line wins,
      // whatever order the ids were given in.
      let current: string | null = null
      let currentTop = -Infinity
      for (const id of ids) {
        const el = document.getElementById(id)
        if (!el) continue
        const top = el.getBoundingClientRect().top + window.scrollY
        if (top <= line && top > currentTop) {
          current = id
          currentTop = top
        }
      }
      if (atBottom) current = ids[ids.length - 1] ?? current
      setActive((prev) => (prev === current ? prev : current))
    }

    const schedule = () => {
      if (frame === null) frame = requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule)
    return () => {
      if (frame !== null) cancelAnimationFrame(frame)
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
    }
  }, [ids])

  return active
}
