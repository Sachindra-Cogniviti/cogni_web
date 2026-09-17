"use client"

import * as React from "react"
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from "motion/react"

import {
  Container,
  Kicker,
  QuietLink,
  Roll,
  WideRule,
  sectionPadding,
} from "@/components/primitives"
import { FlowRule, VIEW_MARGIN } from "@/components/scroll-motion"
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
 *
 * The stories are handed in by the homepage, which reads the three most
 * recent client stories from Payload (lib/cms.ts) and lays each one's
 * platforms and regions out as the stops on its delivery path. When nothing
 * is published the three summaries in content/site.ts stand in, so the
 * section never renders empty.
 *
 * The index turns on its own, the way the updates carousel does: the next
 * story opens after a dwell, on the same rules the carousel keeps. It only
 * runs while the section is on screen, it holds while the pointer or focus
 * is inside, a manual choice restarts the dwell rather than inheriting the
 * rest of the last one, there is a real pause control, and reduced motion
 * stops the rotation outright rather than only its transitions. The clock
 * is a line under the index that fills as the dwell runs out.
 */

/** One entry in the index: a numbered story with the stops on its path. */
export type WorkStory = {
  num: string
  title: string
  body: string
  tags: readonly string[]
  href: string
}
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

export function ClientWork({
  stories = clientWork.stories,
}: {
  stories?: readonly WorkStory[]
}) {
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

  // The rotation. `held` is the reader being in the section; `paused` is
  // the reader having asked; `onScreen` is whether there is anyone to
  // rotate for. Reduced motion is read from the page's MotionConfig.
  const [paused, setPaused] = React.useState(false)
  const [held, setHeld] = React.useState(false)
  const onScreen = useInView(sectionRef, { amount: 0.35 })
  const running = !paused && !held && !reduced && onScreen
  const n = stories.length

  React.useEffect(() => {
    if (!running || n < 2) return
    const timer = window.setTimeout(
      () => setActive((current) => (current + 1) % n),
      clientWork.dwell * 1000
    )
    // Keyed on `active` too, so a manual choice restarts the dwell.
    return () => window.clearTimeout(timer)
  }, [running, active, n])

  // Measure the active index entry for the sliding marker. Re-run on resize
  // since the entries wrap to different heights.
  React.useEffect(() => {
    const measure = () => {
      const tab =
        listRef.current?.querySelectorAll<HTMLElement>("[role='tab']")[active]
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
    const n = stories.length
    const next = forward ? (active + 1) % n : (active - 1 + n) % n
    setActive(next)
    listRef.current
      ?.querySelectorAll<HTMLElement>("[role='tab']")
      [next]?.focus()
  }

  const story = stories[active]

  return (
    <section
      id="work"
      ref={sectionRef}
      className={`relative ${sectionPadding}`}
      // Hold while the reader is in here - focus as well as hover, since
      // someone tabbing the index is reading it just as much.
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      // Keyboard focus only. A click leaves focus on the chosen entry, and
      // holding on that would stop the rotation for good the moment a
      // reader picked a story with the mouse and moved on.
      onFocusCapture={(event) => {
        if (event.target.matches(":focus-visible")) setHeld(true)
      }}
      onBlurCapture={() => setHeld(false)}
    >
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

        <div className="relative mt-14">
          <WideRule tone="strong" />
          <div
            data-reveal="120"
            className="grid gap-x-[clamp(32px,5vw,80px)] gap-y-8 pt-8 lg:grid-cols-[minmax(240px,340px)_1fr] lg:pt-0"
          >
            {/* Index, with the dwell clock and the pause control under it. */}
            <div>
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
                {stories.map((item, index) => {
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
                      className={`work-tab group relative flex cursor-pointer items-start gap-4 px-4 py-3 text-left transition-colors duration-200 focus-visible:bg-paper-soft focus-visible:outline-none lg:w-full lg:border-l lg:border-rule lg:px-6 lg:py-5 ${
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
                          selected
                            ? "text-oxblood"
                            : "text-ink-ghost group-hover:text-oxblood"
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

              {/* The clock: fills over the dwell, so the reader can see the
                next story coming. Hidden under reduced motion, where there
                is no rotation to time or to pause. */}
              {!reduced && n > 1 && (
                <div className="mt-5 flex items-center gap-4 lg:pl-6">
                  <span
                    aria-hidden="true"
                    className="relative block h-[2px] w-[64px] overflow-hidden bg-oxblood/20"
                  >
                    <span
                      key={active}
                      className="updates-progress absolute inset-0 block origin-left bg-oxblood"
                      style={{
                        animationDuration: `${clientWork.dwell}s`,
                        animationPlayState: running ? "running" : "paused",
                      }}
                    />
                  </span>
                  <button
                    type="button"
                    onClick={() => setPaused((p) => !p)}
                    aria-pressed={paused}
                    className="control-motion cursor-pointer font-mono text-[10.5px] tracking-[0.14em] text-ink-faint uppercase hover:text-oxblood"
                  >
                    <Roll>
                      {paused ? clientWork.playLabel : clientWork.pauseLabel}
                    </Roll>
                  </button>
                </div>
              )}
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
                  exit={{
                    opacity: 0,
                    y: -4,
                    filter: "blur(4px)",
                    transition: { duration: 0.16, ease: EASE },
                  }}
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

                  {/* Delivery path. Draws each time it scrolls into view, and
                    on every story change since the sheet remounts. */}
                  <div className="mt-9">
                    <div className="font-mono text-[10.5px] tracking-[0.2em] text-ink-faint uppercase">
                      {clientWork.pathLabel}
                    </div>
                    <motion.ol
                      variants={path}
                      initial="hidden"
                      whileInView="show"
                      viewport={{ amount: 0.5, margin: VIEW_MARGIN }}
                      className="m-0 mt-4 flex list-none flex-wrap items-center gap-y-3"
                    >
                      {story.tags.map((tag) => (
                        <motion.li
                          key={tag}
                          variants={stop}
                          className="flex items-center"
                        >
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
                    className="control-motion mt-9 inline-flex items-center text-[14.5px] font-medium text-oxblood hover:text-ink active:scale-[0.97]"
                  >
                    <Roll>{clientWork.readLabel}&nbsp;&nbsp;→</Roll>
                  </a>
                </motion.div>
              </AnimatePresence>
            </div>
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
