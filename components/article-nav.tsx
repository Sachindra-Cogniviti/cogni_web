"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import type { Heading } from "@/lib/headings"
import { cn } from "@/lib/utils"

/**
 * The reading pill: where you are in the article, and the way to anywhere
 * else in it.
 *
 * A dark capsule pinned to the bottom of the viewport while the article is
 * on screen. It names the section being read and carries a ring that fills
 * as the article is read. Pressed, it opens upward into the table of
 * contents - every h2 and h3, the current one lit - and any entry is a
 * plain anchor, so the smooth scroll in components/smooth-anchors.tsx takes
 * it from there and the URL carries the hash.
 *
 * Both the current section and the progress come from one scroll listener,
 * throttled to a frame: the current section is the last heading above a
 * reading line a third of the way down the viewport, and progress is that
 * line's position through the article. Nothing is measured until the
 * article is near, and the pill withdraws once the article has passed, so
 * the rails and the closing ask are not overlaid by a control for a page
 * that has ended.
 *
 * `target` is the id of the element the reading spans - the article body,
 * or the whole story section - and `headings` is what lib/headings.ts
 * produced from the same body the article rendered, so the ids agree.
 */

/** The reading line, as a share of the viewport height from the top. */
const READING_LINE = 0.34
/** Matches NAV_OFFSET in components/smooth-anchors.tsx. */
const NAV_OFFSET = 88

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

export function ArticleNav({
  target,
  headings,
  label = "Table of contents",
}: {
  target: string
  headings: readonly Heading[]
  label?: string
}) {
  const [open, setOpen] = React.useState(false)
  const [visible, setVisible] = React.useState(false)
  const [active, setActive] = React.useState(0)
  const [progress, setProgress] = React.useState(0)
  const root = React.useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  React.useEffect(() => {
    const article = document.getElementById(target)
    if (!article) return
    const nodes = headings
      .map((h) => document.getElementById(h.id))
      .filter((n): n is HTMLElement => n !== null)

    let frame = 0
    const measure = () => {
      frame = 0
      const rect = article.getBoundingClientRect()
      const height = window.innerHeight
      const line = height * READING_LINE

      // On screen while the article's top has risen past the reading line
      // and its bottom has not yet cleared it. Withdrawing closes the panel.
      const onScreen = rect.top < line && rect.bottom > line + 40
      setVisible(onScreen)
      if (!onScreen) setOpen(false)

      const span = Math.max(1, rect.height)
      setProgress(Math.min(1, Math.max(0, (line - rect.top) / span)))

      let current = 0
      nodes.forEach((node, index) => {
        if (node.getBoundingClientRect().top <= line + NAV_OFFSET / 2)
          current = index
      })
      setActive(current)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure)
    }
    measure()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [target, headings])

  // Closed by Escape, by a press outside, and when the pill withdraws.
  React.useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    const onPress = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener("keydown", onKey)
    document.addEventListener("pointerdown", onPress)
    return () => {
      document.removeEventListener("keydown", onKey)
      document.removeEventListener("pointerdown", onPress)
    }
  }, [open])

  if (headings.length < 2) return null

  const current = headings[active] ?? headings[0]
  const radius = 8
  const circumference = 2 * Math.PI * radius

  return (
    <div
      ref={root}
      className="pointer-events-none fixed inset-x-0 bottom-[max(20px,env(safe-area-inset-bottom))] z-40 flex justify-center px-4"
    >
      <motion.div
        initial={false}
        animate={
          visible
            ? { opacity: 1, y: 0, scale: 1 }
            : { opacity: 0, y: reduced ? 0 : 24, scale: reduced ? 1 : 0.96 }
        }
        transition={{ duration: 0.45, ease: EASE }}
        style={{ pointerEvents: visible ? "auto" : "none" }}
        className="relative w-full max-w-[560px]"
      >
        <AnimatePresence>
          {open && (
            <motion.nav
              key="panel"
              id="article-nav-panel"
              aria-label={label}
              initial={{ opacity: 0, y: reduced ? 0 : 14, scale: reduced ? 1 : 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: reduced ? 0 : 10, scale: reduced ? 1 : 0.98 }}
              transition={{ duration: 0.32, ease: EASE }}
              style={{ transformOrigin: "50% 100%" }}
              className="absolute inset-x-0 bottom-[calc(100%+10px)] max-h-[min(60vh,520px)] overflow-y-auto rounded-[22px] bg-night p-3 text-night-fg shadow-[0_24px_60px_-20px_rgb(0_0_0/0.55)]"
            >
              <div className="px-3 pt-2 pb-2 font-mono text-[10.5px] tracking-[0.2em] text-night-muted uppercase">
                {label}
              </div>
              <ol className="m-0 list-none p-0">
                {headings.map((heading, index) => {
                  const isActive = index === active
                  return (
                    <li key={heading.id}>
                      <a
                        href={`#${heading.id}`}
                        aria-current={isActive ? "location" : undefined}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center justify-between gap-4 rounded-[12px] px-3 py-[10px] text-[15px] leading-[1.35] transition-colors duration-150",
                          heading.level === 3 && "pl-7 text-[14px]",
                          isActive
                            ? "bg-white/10 text-night-fg"
                            : "text-night-muted hover:bg-white/5 hover:text-night-fg"
                        )}
                      >
                        <span className="min-w-0 text-pretty">
                          {heading.text}
                        </span>
                        {isActive && (
                          <span
                            aria-hidden="true"
                            className="size-[6px] shrink-0 rounded-full bg-night-fg"
                          />
                        )}
                      </a>
                    </li>
                  )
                })}
              </ol>
            </motion.nav>
          )}
        </AnimatePresence>

        <button
          type="button"
          aria-expanded={open}
          aria-controls="article-nav-panel"
          onClick={() => setOpen((value) => !value)}
          className="mx-auto flex h-[48px] w-full max-w-[420px] items-center gap-3 rounded-full bg-night pr-[14px] pl-[18px] text-left text-night-fg shadow-[0_18px_48px_-16px_rgb(0_0_0/0.6)] transition-transform duration-[var(--roll-duration)] ease-[var(--roll-ease)] hover:scale-[1.015] active:scale-[0.99]"
        >
          <span
            aria-hidden="true"
            className="size-[7px] shrink-0 rounded-full bg-night-fg"
          />
          <span className="min-w-0 flex-1 truncate text-[14.5px] font-medium">
            {current.text}
          </span>
          <span className="sr-only">
            {open ? "Close" : "Open"} {label}
          </span>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="reading-ring size-[24px] shrink-0 -rotate-90"
          >
            <circle className="track" cx="12" cy="12" r={radius} />
            <circle
              className="fill"
              cx="12"
              cy="12"
              r={radius}
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
            />
          </svg>
        </button>
      </motion.div>
    </div>
  )
}
