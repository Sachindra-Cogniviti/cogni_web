"use client"

import * as React from "react"
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react"

import { Container, Kicker } from "@/components/primitives"
import { ScrambleText } from "@/components/scramble-text"
import { Parallax } from "@/components/scroll-motion"
import { story } from "@/content/site"

/**
 * Our story: how a platform-implementation practice ended up building an
 * Agentic Operating System. Opens the #company block.
 *
 * Read as chapters. The four stages are a causal chain - each exists because
 * of the one before it - so they are laid out to be read one at a time, in
 * order, at the reader's pace:
 *
 *   - On the left, a panel that stays put while the stages scroll past it: a
 *     serif numeral the height of a paragraph, the chapter's label under it,
 *     and a rail of the four chapters with a line that draws down it as the
 *     reader moves through the list. The numeral changes as each chapter
 *     reaches the middle of the screen - the old one lifts out through a
 *     blur, the new one drops in - and the label decodes.
 *   - On the right, the chapters themselves. The one in the middle of the
 *     screen is at full strength and sits forward; the others fall back to a
 *     third, so the eye is held on one thing at a time and the page is read
 *     rather than skimmed. A short oxblood tick on the chapter's top rule
 *     draws in when it becomes the current one.
 *
 * Which chapter is current is a plain intersection test against a band
 * across the middle of the viewport, not a scroll offset, so it stays right
 * whatever the chapters' heights are. The rail's line is the one thing tied
 * to the scroll position itself, because a progress line that animates on a
 * timer would lie about where the reader is.
 *
 * Under the large breakpoint the panel is not shown; each chapter carries
 * its own numeral and label instead, the way it always did.
 *
 * Motion throughout, not a second animation library: the site's one motion
 * layer is Motion, and everything here - the crossfade, the scroll-tied
 * line, the lighting - is what it is for.
 */
const EASE: [number, number, number, number] = [0.23, 1, 0.32, 1]

export function OurStory() {
  const [active, setActive] = React.useState(0)
  const listRef = React.useRef<HTMLOListElement>(null)
  const reduced = useReducedMotion()

  // The rail's line: 0 as the list's top reaches the middle of the screen,
  // 1 as its bottom does - the same band the chapters become current in.
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ["start center", "end center"],
  })
  const drawn = useTransform(scrollYProgress, [0, 1], [0, 1])

  const current = story.stages[active]

  const jumpTo = (index: number) => {
    const target = listRef.current?.children[index]
    target?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "center",
    })
  }

  return (
    <section id="company" className="relative pt-[clamp(88px,10vw,140px)]">
      <Container>
        <Parallax y={16}>
          <div>
            <Kicker data-reveal="0" data-flow="left">
              {story.kicker}
            </Kicker>
            <div className="mt-5 flex flex-wrap items-end justify-between gap-8">
              <h2
                data-reveal="60"
                data-flow="left"
                className="max-w-[18ch] text-[clamp(32px,3.8vw,54px)] leading-[1.05] font-semibold tracking-[-0.03em] text-balance"
              >
                {story.heading}
              </h2>
              <p
                data-reveal="120"
                data-flow="left"
                className="max-w-[44ch] text-[15.5px] leading-[1.6] text-pretty text-ink-soft"
              >
                {story.body}
              </p>
            </div>
          </div>
        </Parallax>

        <div className="mt-16 grid gap-x-[clamp(32px,5vw,80px)] lg:mt-20 lg:grid-cols-[minmax(240px,340px)_1fr]">
          {/* The chapter panel. Sticky for the length of the list. */}
          <div className="hidden lg:block">
            <div className="sticky top-[120px]">
              {/* The numeral. Absolutely placed inside a fixed-height stage
                  so the crossfade never reflows the panel below it. */}
              <div
                aria-hidden="true"
                className="relative h-[clamp(110px,10vw,150px)]"
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={current.num}
                    initial={
                      reduced
                        ? false
                        : { opacity: 0, y: 24, filter: "blur(8px)" }
                    }
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={
                      reduced
                        ? undefined
                        : {
                            opacity: 0,
                            y: -24,
                            filter: "blur(8px)",
                            transition: { duration: 0.26, ease: EASE },
                          }
                    }
                    transition={{ duration: 0.42, ease: EASE }}
                    className="absolute top-0 left-0 font-serif text-[clamp(104px,10vw,156px)] leading-[0.85] font-medium tracking-[-0.04em] text-oxblood italic"
                  >
                    {current.num}
                  </motion.span>
                </AnimatePresence>
              </div>

              {/* The label decodes on every change: keyed on the chapter so
                  it remounts, and a fresh ScrambleText runs as it appears. */}
              <div className="mt-6 font-mono text-[11px] tracking-[0.2em] text-ink-faint uppercase">
                <ScrambleText key={current.num} text={current.label} />
              </div>

              {/* The rail. One hairline for the whole list, an oxblood line
                  drawn down it by the scroll, and a stop per chapter. */}
              <ol className="relative m-0 mt-10 list-none border-l border-rule-strong pl-0">
                <motion.span
                  aria-hidden="true"
                  style={reduced ? undefined : { scaleY: drawn }}
                  className="absolute top-0 -left-px h-full w-px origin-top bg-oxblood"
                />
                {story.stages.map((stage, index) => {
                  const selected = index === active
                  return (
                    <li key={stage.num}>
                      <button
                        type="button"
                        onClick={() => jumpTo(index)}
                        aria-current={selected ? "step" : undefined}
                        className={`group flex w-full cursor-pointer items-baseline gap-4 py-[9px] pl-6 text-left transition-colors duration-300 ${
                          selected
                            ? "text-ink"
                            : "text-ink-faint hover:text-ink"
                        }`}
                      >
                        {/* The stop: sits astride the rule, painted with the
                            page ground so the line reads as passing behind. */}
                        <span
                          aria-hidden="true"
                          className="absolute left-0 flex size-[9px] -translate-x-1/2 translate-y-[3px] items-center justify-center rounded-full bg-paper"
                        >
                          <span
                            className={`size-[5px] rounded-full transition-[background-color,scale] duration-300 ${
                              selected
                                ? "scale-[1.4] bg-oxblood"
                                : "bg-rule-strong group-hover:bg-ink-faint"
                            }`}
                          />
                        </span>
                        <span
                          className={`font-mono text-[11px] transition-colors duration-300 ${
                            selected ? "text-oxblood" : "text-ink-ghost"
                          }`}
                        >
                          {stage.num}
                        </span>
                        <span className="text-[13.5px] font-medium tracking-[-0.01em]">
                          {stage.label}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ol>
            </div>
          </div>

          {/* The chapters. */}
          <ol ref={listRef} className="m-0 list-none">
            {story.stages.map((stage, index) => (
              <Chapter
                key={stage.num}
                stage={stage}
                index={index}
                onCurrent={setActive}
              />
            ))}
          </ol>
        </div>
      </Container>
    </section>
  )
}

/**
 * One chapter. Current while it crosses the middle fifth of the viewport;
 * current is full strength and forward, otherwise dimmed and a step back.
 */
function Chapter({
  stage,
  index,
  onCurrent,
}: {
  stage: (typeof story.stages)[number]
  index: number
  onCurrent: (index: number) => void
}) {
  const ref = React.useRef<HTMLLIElement>(null)
  const reduced = useReducedMotion()
  const current = useInView(ref, { margin: "-40% 0px -40% 0px" })

  React.useEffect(() => {
    if (current) onCurrent(index)
  }, [current, index, onCurrent])

  const lit = current || reduced

  return (
    <li
      ref={ref}
      className="relative border-t border-rule py-[clamp(44px,7vh,88px)] last:border-b"
    >
      {/* The tick on the top rule, drawn when the chapter becomes current. */}
      <motion.span
        aria-hidden="true"
        initial={false}
        animate={{ scaleX: lit ? 1 : 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="absolute top-[-1px] left-0 h-[2px] w-[56px] origin-left bg-oxblood"
      />

      <motion.div
        initial={false}
        animate={{ opacity: lit ? 1 : 0.3, x: lit || reduced ? 0 : -10 }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        {/* Below lg the panel is gone, so the chapter names itself. */}
        <div className="flex items-baseline gap-4 lg:hidden">
          <span className="font-serif text-[40px] leading-none font-medium tracking-[-0.03em] text-oxblood italic">
            {stage.num}
          </span>
          <span className="font-mono text-[11px] tracking-[0.2em] text-ink-faint uppercase">
            <ScrambleText text={stage.label} />
          </span>
        </div>

        <h3 className="mt-5 max-w-[22ch] text-[clamp(26px,3.1vw,44px)] leading-[1.08] font-semibold tracking-[-0.03em] text-balance lg:mt-0">
          {stage.title}
        </h3>
        <p className="mt-6 max-w-[58ch] text-[16px] leading-[1.7] text-pretty text-ink-soft">
          {stage.body}
        </p>
      </motion.div>
    </li>
  )
}
