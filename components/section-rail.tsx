"use client"

import * as React from "react"
import { motion } from "motion/react"

import { rail } from "@/content/site"
import { useActiveSection } from "@/lib/use-active-section"

const ids = rail.sections.map((section) => section.id)

/**
 * Section rail - a capsule of ticks fixed to the left edge, one tick per
 * section, that appears once the hero has scrolled away.
 *
 * Closed, the capsule is a narrow ruler: the current section's tick is
 * longer and oxblood. Pointing at it, or tabbing into it, opens the capsule
 * to its full width and the section names appear beside their ticks, inside
 * the same box. The box is always 184px; a rounded clip-path is what
 * animates, so nothing here touches layout, and since clip-path also clips
 * hit testing the pointer target is only ever the visible capsule. The
 * labels start 46px in, past the closed clip, so no letter peeks out. The
 * labels stay in the DOM unhidden, so each link keeps its accessible name
 * while closed. Leaving the capsule closes it.
 *
 * Each tick is a plain anchor, so the page's smooth scroll and the URL hash
 * come for free. The rail takes no layout space and is not rendered below
 * the large breakpoint, where there is no margin to sit in. Sections marked
 * dark in content flip it to light ink.
 *
 * The active tick is one element shared by layoutId, so as the reader
 * scrolls from section to section it slides down the ruler on a short
 * spring rather than switching off in one row and on in the next.
 */
export function SectionRail() {
  const active = useActiveSection(ids)
  const [pastHero, setPastHero] = React.useState(false)
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    let frame: number | null = null
    const measure = () => {
      frame = null
      const hero = document.getElementById("top")
      const threshold = hero ? hero.getBoundingClientRect().bottom + window.scrollY - 160 : 600
      setPastHero(window.scrollY > threshold)
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
  }, [])

  const current = rail.sections.find((section) => section.id === active)
  const dark = current !== undefined && "dark" in current && current.dark

  return (
    <nav
      aria-label={rail.label}
      data-dark={dark || undefined}
      data-visible={pastHero || undefined}
      data-open={open || undefined}
      onPointerEnter={() => setOpen(true)}
      onPointerLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false)
      }}
      className="section-rail fixed top-1/2 left-[clamp(10px,1.2vw,22px)] z-90 hidden -translate-y-1/2 lg:block"
    >
      <div className="rail-box rounded-[14px] border p-[8px]">
        <ul className="m-0 flex list-none flex-col gap-[2px]">
          {rail.sections.map((section, i) => {
            const isActive = section.id === active
            return (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  aria-current={isActive ? "true" : undefined}
                  onClick={() => setOpen(false)}
                  className="rail-item relative flex h-[22px] items-center gap-[18px] rounded-[7px] px-[6px] outline-none"
                  style={{ "--i": i } as React.CSSProperties}
                >
                  <span className="rail-tick" />
                  {isActive && (
                    <motion.span
                      layoutId="rail-active"
                      aria-hidden="true"
                      className="rail-active-tick"
                      transition={{ type: "spring", duration: 0.45, bounce: 0.15 }}
                    />
                  )}
                  <span className="rail-label">{section.label}</span>
                </a>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
