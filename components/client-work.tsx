"use client"

import * as React from "react"
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from "motion/react"

import { Container, Kicker, QuietLink, sectionPadding } from "@/components/primitives"
import { FlowRule, SEEN_ABOVE } from "@/components/scroll-motion"
import { clientWork } from "@/content/site"

/**
 * Selected client work - an index and a case sheet.
 *
 * The three stories sit in a numbered index on the left; the chosen one
 * opens on the right as a case sheet: a serif numeral, the title, the
 * narrative, and a "delivery path" that lays the story's stages out as
 * stops on a line that ends at a live Production node. That last node is
 * the section's argument - work that reaches production - made visible.
 *
 * Choosing a story is an AnimatePresence crossfade: the sheet blurs and
 * drops out in 160ms, the next one sharpens in over 220ms, and its path
 * draws stop by stop, 60ms apart, so the eye reads the stages in order.
 * The index marker slides to the chosen entry on a short spring rather than
 * jumping. Arrow keys move through the index, which is a proper tab list.
 * Reduced motion is honoured through the page's MotionConfig. Below the
 * large breakpoint the index becomes a row of numerals with a rule under
 * the chosen one, and the sheet carries the title alone, so the same words
 * are not printed twice a few lines apart.
 *
 * The serif numeral is tied to the scroll and runs ahead of the sheet by
 * thirty pixels over the section's passage, so the case sheet reads as two
 * planes rather than one flat block.
 */
const EASE: [number, number, number, number] = [0.23, 1, 0.32, 1]

const path: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}

const stop: Variants = {
  hidden: { opacity: 0, x: -6 },
  show: { opacity: 1, x: 0, transition: { duration: 0.32, ease: EASE } },
}

const link: Variants = {
  hidden: { scaleX: 0 },
  show: { scaleX: 1, transition: { duration: 0.32, ease: EASE, delay: 0.12 } },
}

export function ClientWork() {
  const [active, setActive] = React.useState(0)
  const listRef = React.useRef<HTMLDivElement>(null)
  const [marker, setMarker] = React.useState({ top: 0, height: 0 })

  const sectionRef = React.useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })
  const numeralY = useTransform(scrollYProgress, [0, 1], [30, -30])

  // Measure the active index entry for the sliding marker. Re-run on resize
  // since the entries wrap to different heights.
  React.useEffect(() => {
    const measure = () => {
      const tab = listRef.current?.querySelectorAll<HTMLElement>("[role='tab']")[active]
      if (tab) setMarker({ top: tab.offsetTop, height: tab.offsetHeight })
    }
    measure()
    window.addEventListener("resize", measure)
    return () => window.removeEventListener("resize", measure)
  }, [active])

  const onKey = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const forward = event.key === "ArrowDown" || event.key === "ArrowRight"
    const back = event.key === "ArrowUp" || event.key === "ArrowLeft"
    if (!forward && !back) return
    event.preventDefault()
    const n = clientWork.stories.length
    const next = forward ? (active + 1) % n : (active - 1 + n) % n
    setActive(next)
    listRef.current?.querySelectorAll<HTMLElement>("[role='tab']")[next]?.focus()
  }

  const story = clientWork.stories[active]

  return (
    <section id="work" ref={sectionRef} className={`relative ${sectionPadding}`}>
      <Container>
        <div>
          <Kicker data-reveal="0" data-flow="left">
            {clientWork.kicker}
          </Kicker>
          <h2
            data-reveal="60"
            data-flow="left"
            className="mt-5 text-[clamp(32px,3.8vw,54px)] leading-[1.05] font-semibold tracking-[-0.03em] text-balance"
          >
            {clientWork.heading}
          </h2>
        </div>

        <div
          data-reveal="120"
          className="mt-14 grid gap-x-[clamp(32px,5vw,80px)] gap-y-8 border-t border-rule-strong pt-8 lg:grid-cols-[minmax(240px,340px)_1fr] lg:pt-0"
        >
          {/* Index */}
          <div
            ref={listRef}
            role="tablist"
            aria-label={clientWork.kicker}
            onKeyDown={onKey}
            className="relative flex border-b border-rule lg:flex-col lg:border-b-0"
          >
            {/* A 1px bar, moved and scaled to the active entry in one
                transform, on a spring with just enough bounce to feel
                like it settled rather than stopped. */}
            <motion.span
              aria-hidden="true"
              initial={false}
              animate={{ y: marker.top, scaleY: marker.height }}
              transition={{ type: "spring", duration: 0.4, bounce: 0.12 }}
              className="absolute top-0 left-0 hidden h-px w-[2px] origin-top bg-oxblood lg:block"
            />
            {clientWork.stories.map((item, index) => {
              const selected = index === active
              return (
                <button
                  key={item.num}
                  type="button"
                  role="tab"
                  id={`work-tab-${index}`}
                  aria-selected={selected}
                  aria-controls="work-panel"
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActive(index)}
                  className={`work-tab group relative flex cursor-pointer items-start gap-4 px-4 py-3 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:bg-paper-soft lg:w-full lg:border-l lg:border-rule lg:px-6 lg:py-5 ${
                    selected ? "text-ink" : "text-ink-faint hover:text-ink"
                  }`}
                >
                  {/* Below lg the rule under the numeral is the marker. */}
                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-0 -bottom-px h-[2px] origin-left bg-oxblood transition-transform duration-250 ease-[cubic-bezier(.23,1,.32,1)] lg:hidden ${
                      selected ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                  <span
                    className={`font-mono text-[13px] transition-colors duration-200 lg:pt-[3px] lg:text-[11px] ${
                      selected ? "text-oxblood" : "text-ink-ghost group-hover:text-oxblood"
                    }`}
                  >
                    {item.num}
                  </span>
                  <span className="hidden max-w-[26ch] text-[15px] leading-[1.3] font-semibold tracking-[-0.01em] lg:inline">
                    {item.title}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Case sheet. Keyed on the story: a change is an exit and an
              entrance, not a mutation. */}
          <div className="lg:pt-8">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active}
                id="work-panel"
                role="tabpanel"
                aria-labelledby={`work-tab-${active}`}
                initial={{ opacity: 0, y: 4, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -4, filter: "blur(4px)", transition: { duration: 0.16, ease: EASE } }}
                transition={{ duration: 0.22, ease: EASE }}
              >
                <div className="flex items-start gap-6">
                  <motion.span
                    aria-hidden="true"
                    style={reduced ? undefined : { y: numeralY }}
                    className="font-serif text-[clamp(56px,7vw,96px)] leading-[0.85] font-medium tracking-[-0.03em] text-oxblood italic"
                  >
                    {story.num}
                  </motion.span>
                  <div className="min-w-0 pt-1">
                    <h3 className="max-w-[22ch] text-[clamp(24px,2.8vw,38px)] leading-[1.1] font-semibold tracking-[-0.025em] text-balance">
                      {story.title}
                    </h3>
                  </div>
                </div>

                <p className="mt-7 max-w-[58ch] text-[16px] leading-[1.65] text-pretty text-ink-soft">
                  {story.body}
                </p>

                {/* Delivery path. Draws when it scrolls into view, and again
                    on every story change since the sheet remounts. */}
                <div className="mt-9">
                  <div className="font-mono text-[10.5px] tracking-[0.2em] text-ink-faint uppercase">
                    {clientWork.pathLabel}
                  </div>
                  <motion.ol
                    variants={path}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.5, margin: SEEN_ABOVE }}
                    className="m-0 mt-4 flex list-none flex-wrap items-center gap-y-3"
                  >
                    {story.tags.map((tag) => (
                      <motion.li key={tag} variants={stop} className="flex items-center">
                        <span className="flex items-center gap-[10px]">
                          <span className="size-[8px] rounded-full border border-oxblood bg-paper" />
                          <span className="font-mono text-[11px] tracking-[0.08em] text-ink-muted uppercase">
                            {tag}
                          </span>
                        </span>
                        <motion.span
                          variants={link}
                          className="mx-[14px] h-px w-[clamp(18px,3vw,40px)] origin-left bg-rule-strong"
                        />
                      </motion.li>
                    ))}
                    <motion.li variants={stop} className="flex items-center">
                      <span className="flex items-center gap-[10px]">
                        <span className="relative flex size-[10px] items-center justify-center">
                          <span className="work-pulse absolute inset-0 rounded-full bg-oxblood" />
                          <span className="relative size-[10px] rounded-full bg-oxblood" />
                        </span>
                        <span className="font-mono text-[11px] font-medium tracking-[0.08em] text-oxblood uppercase">
                          {clientWork.pathEnd}
                        </span>
                      </span>
                    </motion.li>
                  </motion.ol>
                </div>

                <a
                  href={story.href}
                  className="group mt-9 inline-flex items-center gap-2 text-[14.5px] font-medium text-oxblood transition-[color,transform] duration-150 hover:text-ink active:scale-[0.97]"
                >
                  {clientWork.readLabel}
                  <span
                    aria-hidden="true"
                    className="inline-block transition-transform duration-200 ease-[cubic-bezier(.23,1,.32,1)] group-hover:translate-x-1"
                  >
                    →
                  </span>
                </a>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div data-reveal="0" data-flow="left" className="mt-12">
          <QuietLink href={clientWork.cta.href}>
            {clientWork.cta.label}&nbsp;&nbsp;→
          </QuietLink>
        </div>
      </Container>
      <FlowRule />
    </section>
  )
}
