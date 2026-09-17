"use client"

import * as React from "react"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  type Variants,
} from "motion/react"

import logoFile from "@/public/cogniviti-labs-logo.webp"

import { Roll } from "@/components/primitives"
import { footer, nav, rail, site } from "@/content/site"
import { flowIn, settle } from "@/lib/scroll-flow"
import { useActiveSection } from "@/lib/use-active-section"

/**
 * The homepage sections a nav link points at. Only the hash links: the rest
 * are real pages now, and those are matched on the path instead.
 */
const sectionIds = nav.links
  .filter((link) => link.href.includes("#"))
  .map((link) => link.href.slice(link.href.indexOf("#") + 1))

/** Sections that sit on the night ground, from the rail's content. */
const darkIds = rail.sections
  .filter((section) => "dark" in section && section.dark)
  .map((section) => section.id)

/**
 * Which link, if any, the current URL makes current.
 *
 * A hash link is current when its section is the one on screen, and only on
 * the homepage - the ids do not exist anywhere else. A page link is current
 * when the path is that page or sits beneath it, so /products/cogniflow keeps
 * "Products" lit.
 */
function isCurrent(href: string, pathname: string, active: string | null) {
  if (href.includes("#")) {
    return pathname === "/" && href.slice(href.indexOf("#") + 1) === active
  }
  return pathname === href || pathname.startsWith(`${href}/`)
}

/** Height of the bar. The ground under this line decides the palette. */
const BAR = 68

/** The page's arrival curve, shared with the scroll flow. */
const EASE = [0.22, 1, 0.36, 1] as const

/**
 * The beat between one piece of the bar and the next. Tighter than the page's
 * scroll flow (70ms against 90ms) because the bar is one line of small type
 * read straight across, not a grid of cards the eye has to settle on.
 */
const BAR_STEP = 0.07

/**
 * The compact menu: a sheet that slides in from the left edge under the bar,
 * with the links cascading down it a beat apart, so the stack reads top to
 * bottom instead of landing as a block. Closing is quicker and unstaggered:
 * a reader who has already chosen a link should not wait for a row of
 * animations to unwind.
 *
 * The sheet runs on the drawer curve rather than the page's ease-out - it is
 * a surface being pulled into place, not a block arriving - and takes 380ms
 * in and 260ms out. A scrim dims the page behind it and closes it on a tap.
 *
 * Motion owns this one outright, unlike the bar. The sheet exists only after
 * a tap, so it is never in the exported HTML and its start state can safely
 * be inline.
 */
const DRAWER_EASE = [0.32, 0.72, 0, 1] as const

const sheet: Variants = {
  rest: { x: "-100%" },
  enter: { x: 0, transition: { duration: 0.38, ease: DRAWER_EASE } },
  exit: { x: "-100%", transition: { duration: 0.26, ease: DRAWER_EASE } },
}

const scrim: Variants = {
  rest: { opacity: 0 },
  enter: { opacity: 1, transition: { duration: 0.3, ease: EASE } },
  exit: { opacity: 0, transition: { duration: 0.22, ease: EASE } },
}

const panelGroup: Variants = {
  rest: {},
  enter: { transition: { delayChildren: 0.12, staggerChildren: 0.045 } },
  exit: {},
}

const panelItem: Variants = {
  rest: { opacity: 0, x: -10 },
  enter: { opacity: 1, x: 0, transition: { duration: 0.36, ease: EASE } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
}

/**
 * Fixed page navigation.
 *
 * Below 1120px the seven links no longer fit beside the logo and the CTA, and
 * left to wrap they broke into a ragged second row. Instead they collapse
 * behind a hamburger that opens a sheet from the left. Escape, a tap on the
 * scrim, or choosing a link closes it, and the page behind does not scroll
 * while it is open.
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
 * Four pieces of motion. The bar's own entrance on load, staggered piece by
 * piece through the page's scroll flow (lib/scroll-flow.ts), so the row uses
 * the same curve and the same script-off safety net as every block below it:
 * the start state is CSS scoped to `.js`, never inline, because the bar is in
 * the exported HTML and must not hide behind an animation that cannot run. The
 * panel's staggered entrance on open, which is Motion's outright (see above).
 * A 2px progress line along the bar's bottom edge, scaled directly from scroll
 * progress, with no spring, so it never lags the page. And the dot under the
 * current link, which slides between links with a short spring via a shared
 * layoutId instead of fading out and in.
 */
export function SiteNav() {
  // Which section is on screen, to colour its link. The Platforms anchor
  // lives inside Services, so it takes over partway down that section.
  const active = useActiveSection(sectionIds)
  const pathname = usePathname()
  const reduced = useReducedMotion()
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

  // The bar's entrance: logo, then each link, then the toggle and the CTA,
  // one beat apart, so the row assembles left to right instead of appearing
  // whole. It plays on mount rather than on view because the bar is on screen
  // from the first frame.
  //
  // Keyed to `compact` because that is what decides which pieces exist. The
  // first pass runs against the server's markup and the breakpoint effect
  // above corrects it in the same commit, so on a narrow screen the desktop
  // links are replaced by the toggle before anything is painted and the second
  // pass cascades the row that actually shipped. Crossing the breakpoint later
  // replays it, which is the right answer for a row that has just been rebuilt.
  React.useEffect(() => {
    const host = navRef.current
    if (!host) return
    const items = Array.from(
      host.querySelectorAll<HTMLElement>("[data-nav-enter]")
    )

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      items.forEach(settle)
      return
    }

    const plays = items.map((item, index) =>
      flowIn(item, { index, step: BAR_STEP })
    )
    return () => plays.forEach((play) => play.stop())
  }, [compact])

  // Ground detection: is a dark block under the bar's bottom edge?
  React.useEffect(() => {
    let frame: number | null = null
    const measure = () => {
      frame = null
      const blocks = [
        ...darkIds.map((id) => document.getElementById(id)),
        // Sub-pages have none of the homepage's section ids, so a dark block
        // there marks itself with data-nav-dark instead.
        ...document.querySelectorAll("[data-nav-dark]"),
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

  // Close the sheet on Escape or a pointer down outside the bar, and hold
  // the page still behind it: a sheet over a page that keeps scrolling reads
  // as two things moving at once.
  React.useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    const onPointerDown = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const { overflow } = document.body.style
    document.body.style.overflow = "hidden"
    document.addEventListener("keydown", onKey)
    document.addEventListener("pointerdown", onPointerDown)
    return () => {
      document.body.style.overflow = overflow
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
        {/* "/#top", not "#top": from a sub-page a bare hash stays on that
            page, and the logo should always lead home. On the homepage
            smooth-anchors scrolls to the top in place - which is why this is
            a plain anchor and not next/link: Link would jump to the hash
            itself, before the smooth handler ran, and every other "/#" link
            on the site is a plain anchor for the same reason. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- see above */}
        <a
          data-nav-enter
          href="/#top"
          aria-label={site.logo.alt}
          className="flex items-center text-ink"
        >
          <Image
            src={logoFile}
            alt={site.logo.alt}
            priority
            // The mark is 30px tall, so about 160px wide. Without this next/image
            // assumes the full viewport and ships a 3840px variant for it.
            sizes="200px"
            className="nav-logo block h-[30px] w-auto"
          />
        </a>

        {!compact && (
          <div className="flex items-center gap-[clamp(16px,1.8vw,28px)] text-[13.5px] font-medium whitespace-nowrap">
            {nav.links.map((link) => {
              const isActive = isCurrent(link.href, pathname, active)
              return (
                <a
                  key={link.href}
                  data-nav-enter
                  href={link.href}
                  aria-current={isActive ? "true" : undefined}
                  className="nav-link relative"
                >
                  <Roll>{link.label}</Roll>
                  {/* A dot under the current link, so the colour change has an
                      anchor even for a reader who missed the moment it moved.
                      One dot, shared by layoutId, slides between links. */}
                  {isActive && (
                    <motion.span
                      layoutId="nav-dot"
                      aria-hidden="true"
                      className="nav-dot absolute -bottom-[7px] left-1/2 size-[4px] -translate-x-1/2 rounded-full"
                      transition={{
                        type: "spring",
                        duration: 0.45,
                        bounce: 0.2,
                      }}
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
              data-nav-enter
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="site-menu"
              aria-label={open ? nav.closeLabel : nav.menuLabel}
              className="nav-toggle flex size-[42px] cursor-pointer items-center justify-center rounded-[2px] border"
            >
              {/* Three lines that fold into a cross. */}
              <span
                aria-hidden="true"
                data-open={open || undefined}
                className="nav-burger"
              >
                <span />
                <span />
                <span />
              </span>
            </button>
          )}
          {/* On the compact bar the CTA is in the sheet instead, so the
              row is logo and toggle and nothing competes with the toggle
              for the tap. */}
          {!compact && (
            <a
              data-nav-enter
              href={nav.cta.href}
              className="nav-cta inline-block rounded-[2px] px-5 py-[10px] text-[13.5px] font-medium whitespace-nowrap"
            >
              <Roll>{nav.cta.label}</Roll>
            </a>
          )}
        </div>
      </div>

      <motion.span
        aria-hidden="true"
        className="nav-progress absolute inset-x-0 -bottom-px h-[2px] origin-left"
        style={{ scaleX: scrollYProgress }}
      />

      {/* The sheet and its scrim hang from the bar's bottom edge and run
          to the foot of the screen. Absolute rather than fixed: the bar's
          backdrop blur makes it the containing block for fixed descendants
          anyway, so the two mean the same thing here and absolute says so. */}
      <AnimatePresence>
        {compact && open && (
          <motion.div
            key="scrim"
            variants={scrim}
            initial={reduced ? "enter" : "rest"}
            animate="enter"
            exit={reduced ? "enter" : "exit"}
            onClick={() => setOpen(false)}
            aria-hidden="true"
            className="nav-scrim absolute inset-x-0 top-full h-[calc(100dvh-68px)]"
          />
        )}
        {compact && open && (
          <motion.div
            key="sheet"
            id="site-menu"
            variants={sheet}
            // Reduced motion holds every stage at the settled state, so the
            // sheet appears and disappears without travel.
            initial={reduced ? "enter" : "rest"}
            animate="enter"
            exit={reduced ? "enter" : "exit"}
            className="nav-panel absolute top-full left-0 flex h-[calc(100dvh-68px)] w-[min(84vw,360px)] flex-col overflow-y-auto overscroll-contain border-r px-[clamp(20px,6vw,40px)] pt-3 pb-[max(28px,env(safe-area-inset-bottom))]"
          >
            <motion.div
              variants={panelGroup}
              initial={reduced ? "enter" : "rest"}
              animate="enter"
              exit={reduced ? "enter" : "exit"}
              className="flex flex-1 flex-col"
            >
              <div className="flex flex-col">
                {nav.links.map((link) => {
                  const isActive = isCurrent(link.href, pathname, active)
                  return (
                    <motion.a
                      key={link.href}
                      variants={panelItem}
                      href={link.href}
                      aria-current={isActive ? "true" : undefined}
                      onClick={() => setOpen(false)}
                      className="nav-panel-link flex min-h-[54px] items-center justify-between border-b text-[21px] font-semibold tracking-[-0.02em]"
                    >
                      {link.label}
                      <span
                        aria-hidden="true"
                        className="nav-panel-arrow font-mono text-[13px]"
                      >
                        →
                      </span>
                    </motion.a>
                  )
                })}
              </div>

              <motion.div variants={panelItem} className="mt-7">
                <a
                  href={nav.cta.href}
                  onClick={() => setOpen(false)}
                  className="nav-cta block rounded-[2px] px-5 py-[14px] text-center text-[15px] font-medium"
                >
                  {nav.cta.label}
                </a>
              </motion.div>

              <motion.div
                variants={panelItem}
                className="nav-panel-foot mt-auto flex flex-col gap-[10px] pt-10 font-mono text-[12px]"
              >
                <a href={`mailto:${site.email}`} className="nav-panel-quiet">
                  {site.email}
                </a>
                <span className="flex gap-5">
                  {footer.social
                    .filter((network) => network.href)
                    .map((network) => (
                      <a
                        key={network.label}
                        href={network.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${network.label} (opens in a new tab)`}
                        className="nav-panel-quiet"
                      >
                        {network.label}&nbsp;↗
                      </a>
                    ))}
                </span>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
