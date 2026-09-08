"use client"

import * as React from "react"
import Image from "next/image"
import { motion, useScroll } from "motion/react"

import logoFile from "@/public/cogniviti-labs-logo.webp"

import { nav, rail, site } from "@/content/site"
import { useActiveSection } from "@/lib/use-active-section"

const sectionIds = nav.links.map((link) => link.href.slice(1))

/** Sections that sit on the night ground, from the rail's content. */
const darkIds = rail.sections
  .filter((section) => "dark" in section && section.dark)
  .map((section) => section.id)

/** Height of the bar. The ground under this line decides the palette. */
const BAR = 68

/**
 * Fixed page navigation.
 *
 * Below 1120px the seven links no longer fit beside the logo and the CTA, and
 * left to wrap they broke into a ragged second row. Instead they collapse into
 * a Menu toggle backed by a stacked panel. The panel enters over 180ms (CSS,
 * via @starting-style) and leaves at once; Escape, a tap outside, or choosing
 * a link closes it.
 *
 * The breakpoint is measured rather than expressed as a CSS media query
 * because the same value drives the toggle's own presence, and matchMedia
 * keeps the two in step. It starts closed on the server, so first paint is the
 * full bar; the effect corrects it before the user can interact.
 *
 * The bar also reads the ground beneath it. When a dark section (or the
 * footer) crosses the bar's bottom edge, `data-dark` flips the palette to
 * night, so the bar and the section rail never disagree about the surface
 * they sit on. Colours live in custom properties in globals.css.
 *
 * Two pieces of Motion: a 2px progress line along the bar's bottom edge,
 * scaled directly from scroll progress (no spring, so it never lags the
 * page), and the dot under the current link, which slides between links
 * with a short spring via a shared layoutId instead of fading out and in.
 */
export function SiteNav() {
  // Which section is on screen, to colour its link. The Platforms anchor
  // lives inside Services, so it takes over partway down that section.
  const active = useActiveSection(sectionIds)
  const [compact, setCompact] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const [dark, setDark] = React.useState(false)
  const navRef = React.useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll()

  React.useEffect(() => {
    const query = window.matchMedia("(max-width: 1119px)")

    const sync = () => {
      setCompact(query.matches)
      if (!query.matches) setOpen(false)
    }

    sync()
    query.addEventListener("change", sync)
    return () => query.removeEventListener("change", sync)
  }, [])

  // Ground detection: is a dark block under the bar's bottom edge?
  React.useEffect(() => {
    let frame: number | null = null
    const measure = () => {
      frame = null
      const blocks = [
        ...darkIds.map((id) => document.getElementById(id)),
        document.querySelector("footer"),
      ]
      const under = blocks.some((el) => {
        if (!el) return false
        const r = el.getBoundingClientRect()
        return r.top <= BAR && r.bottom > BAR
      })
      setDark((prev) => (prev === under ? prev : under))
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

  // Close the panel on Escape or a pointer down outside the bar.
  React.useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    const onPointerDown = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener("keydown", onKey)
    document.addEventListener("pointerdown", onPointerDown)
    return () => {
      document.removeEventListener("keydown", onKey)
      document.removeEventListener("pointerdown", onPointerDown)
    }
  }, [open])

  return (
    <nav
      ref={navRef}
      data-dark={dark || undefined}
      className="site-nav fixed inset-x-0 top-0 z-100 border-b backdrop-blur-[8px]"
    >
      <div className="mx-auto flex h-[68px] max-w-[1280px] items-center justify-between gap-6 px-[clamp(20px,4vw,48px)]">
        <a href="#top" className="flex items-center text-ink">
          <Image
            src={logoFile}
            alt={site.logo.alt}
            priority
            className="nav-logo block h-[30px] w-auto"
          />
        </a>

        {!compact && (
          <div className="flex items-center gap-[clamp(16px,1.8vw,28px)] text-[13.5px] font-medium whitespace-nowrap">
            {nav.links.map((link) => {
              const isActive = link.href.slice(1) === active
              return (
                <a
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "true" : undefined}
                  className="nav-link relative"
                >
                  {link.label}
                  {/* A dot under the current link, so the colour change has an
                      anchor even for a reader who missed the moment it moved.
                      One dot, shared by layoutId, slides between links. */}
                  {isActive && (
                    <motion.span
                      layoutId="nav-dot"
                      aria-hidden="true"
                      className="nav-dot absolute -bottom-[7px] left-1/2 size-[4px] -translate-x-1/2 rounded-full"
                      transition={{ type: "spring", duration: 0.45, bounce: 0.2 }}
                    />
                  )}
                </a>
              )
            })}
          </div>
        )}

        <div className="flex items-center gap-3">
          {compact && (
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              className="nav-toggle min-w-[78px] cursor-pointer rounded-[2px] border px-[18px] py-[9px] font-sans text-[13.5px] font-medium"
            >
              {open ? "Close" : "Menu"}
            </button>
          )}
          <a
            href={nav.cta.href}
            className="nav-cta inline-block rounded-[2px] px-5 py-[10px] text-[13.5px] font-medium whitespace-nowrap"
          >
            {nav.cta.label}
          </a>
        </div>
      </div>

      <motion.span
        aria-hidden="true"
        className="nav-progress absolute inset-x-0 -bottom-px h-[2px] origin-left"
        style={{ scaleX: scrollYProgress }}
      />

      {compact && open && (
        <div className="nav-panel flex flex-col border-t px-[clamp(20px,4vw,48px)] pt-2 pb-[18px]">
          {nav.links.map((link, index) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`nav-panel-link py-[13px] text-base font-medium ${
                index < nav.links.length - 1 ? "border-b" : ""
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  )
}
