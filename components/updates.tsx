"use client"

import * as React from "react"
import Image from "next/image"
import { AnimatePresence, motion, type Variants } from "motion/react"

import {
  Container,
  Corners,
  Kicker,
  Roll,
  WideRule,
} from "@/components/primitives"
import { FlowRule } from "@/components/scroll-motion"
import { updates, type Update } from "@/content/site"

/** The page's arrival curve, shared with the scroll flow and the nav. */
const EASE = [0.22, 1, 0.36, 1] as const

/**
 * The slide, direction-aware.
 *
 * `custom` carries +1 or -1, so the outgoing announcement always leaves the
 * way the reader is going and the incoming one arrives from behind it.
 * Without that, stepping backwards still looks like going forwards and the
 * arrows feel broken even though they work.
 *
 * The picture and the words travel together but not in step: the picture
 * leads and each line of type follows a beat behind, which is what stops a
 * two-column card reading as one flat rectangle sliding past.
 */
const card: Variants = {
  enter: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
  exit: { transition: { staggerChildren: 0.035, staggerDirection: -1 } },
}

const piece: Variants = {
  rest: (dir: number) => ({
    opacity: 0,
    x: dir > 0 ? 44 : -44,
    filter: "blur(6px)",
  }),
  enter: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: EASE },
  },
  exit: (dir: number) => ({
    opacity: 0,
    x: dir > 0 ? -44 : 44,
    filter: "blur(6px)",
    transition: { duration: 0.24, ease: "easeIn" },
  }),
}

/**
 * Updates - the news carousel after the certifications.
 *
 * One announcement at a time: picture on the left, the news on the right,
 * pagination underneath. The picture is what makes it read as news rather
 * than as a notice, which is the whole reason the section is this size.
 *
 * Every `image` is null today and a null renders the hatched placeholder, so
 * the section is complete now and each picture arrives by filling in one
 * object in content/site.ts. Content moves to Payload once the design is
 * signed off.
 *
 * Three things here are accessibility requirements rather than choices.
 *
 * **It stops.** Content that updates on its own needs a way to pause it (WCAG
 * 2.2.2), so there is a real pause control, and it also holds while the
 * pointer is over the section or focus is anywhere inside it - otherwise the
 * announcement someone is part-way through is taken away mid-sentence.
 *
 * **Reduced motion stops the rotation outright**, not just the transitions. A
 * reader who asked for less motion did not ask for the content to keep
 * changing underneath them, and the global MotionConfig only drops transforms.
 * They get the first announcement and the pagination to reach the rest.
 *
 * **No aria-live.** The card changes every seven seconds; a live region would
 * interrupt a screen-reader user unbidden. The arrows and dots are ordinary
 * buttons, so the announcements are reachable on demand.
 */
export function Updates() {
  const items = updates.items
  const count = items.length
  // The direction travels with the index so the exit knows which way to go.
  const [[index, dir], setPosition] = React.useState<[number, number]>([0, 1])
  const [paused, setPaused] = React.useState(false)
  const [held, setHeld] = React.useState(false)
  const [reduced, setReduced] = React.useState(false)

  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => setReduced(query.matches)
    sync()
    query.addEventListener("change", sync)
    return () => query.removeEventListener("change", sync)
  }, [])

  const running = !paused && !held && !reduced

  const step = React.useCallback(
    (delta: number) =>
      setPosition(([i]) => [(i + delta + count) % count, delta]),
    [count]
  )

  React.useEffect(() => {
    if (!running) return
    const timer = window.setTimeout(() => step(1), updates.dwell * 1000)
    // Keyed on `index` too, so a manual step restarts the dwell instead of
    // inheriting whatever was left of the last one.
    return () => window.clearTimeout(timer)
  }, [running, index, step])

  const item = items[index]

  return (
    <section
      id="updates"
      className="relative bg-paper-alt pt-[clamp(64px,7vw,100px)] pb-[clamp(28px,3vw,42px)]"
      // Hold while the reader is in here. Focus as well as hover: someone
      // tabbing the pagination is reading it just as much.
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      onFocusCapture={() => setHeld(true)}
      onBlurCapture={() => setHeld(false)}
    >
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
          <div>
            <Kicker data-reveal="0" data-flow="left">
              {updates.kicker}
            </Kicker>
            <h2
              data-reveal="60"
              data-flow="left"
              className="mt-4 text-[clamp(24px,2.8vw,38px)] leading-[1.08] font-semibold tracking-[-0.03em] text-balance"
            >
              {updates.heading}
            </h2>
          </div>
        </div>

        {/* min-h holds the card steady as announcements of different lengths
            come through, so the pagination below never moves. */}
        <div
          data-reveal="180"
          className="relative mt-10 min-h-[clamp(300px,30vw,380px)]"
        >
          <AnimatePresence mode="wait" initial={false} custom={dir}>
            <motion.article
              key={item.title}
              custom={dir}
              variants={card}
              initial="rest"
              animate="enter"
              exit="exit"
              className="grid gap-x-[clamp(28px,4vw,64px)] gap-y-7 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center"
            >
              <motion.div custom={dir} variants={piece}>
                <Picture item={item} />
              </motion.div>

              <div>
                <motion.div
                  custom={dir}
                  variants={piece}
                  className="flex items-center gap-4 font-mono text-[10.5px] tracking-[0.16em] uppercase"
                >
                  <span className="text-oxblood">{item.kind}</span>
                  <span
                    aria-hidden="true"
                    className="h-px w-8 bg-rule-strong"
                  />
                  <span className="text-ink-faint">{item.date}</span>
                </motion.div>

                <motion.h3
                  custom={dir}
                  variants={piece}
                  className="mt-5 max-w-[20ch] text-[clamp(23px,2.6vw,34px)] leading-[1.1] font-semibold tracking-[-0.03em] text-balance"
                >
                  {item.title}
                </motion.h3>

                <motion.p
                  custom={dir}
                  variants={piece}
                  className="mt-4 max-w-[52ch] text-[15.5px] leading-[1.65] text-pretty text-ink-soft"
                >
                  {item.body}
                </motion.p>

                <motion.div custom={dir} variants={piece} className="mt-7">
                  <a
                    href={item.cta.href}
                    className="control-motion border-b border-oxblood/35 pb-[3px] text-[15px] font-medium text-oxblood hover:border-ink/35 hover:text-ink"
                  >
                    <Roll>{item.cta.label}&nbsp;&nbsp;&rarr;</Roll>
                  </a>
                </motion.div>
              </div>
            </motion.article>
          </AnimatePresence>
        </div>

        {/* Pagination. Under the card, on its own rule, because it belongs to
            the whole carousel rather than to the announcement showing. */}
        <div className="relative mt-9 flex flex-wrap items-center justify-between gap-x-8 gap-y-5 pt-5">
          <WideRule tone="strong" />
          <div className="flex items-center gap-5">
            <span className="font-mono text-[11px] tracking-[0.16em] text-ink-faint uppercase tabular-nums">
              {String(index + 1).padStart(2, "0")}
              <span className="text-ink-ghost"> / </span>
              {String(count).padStart(2, "0")}
            </span>

            <ol className="flex list-none items-center gap-2">
              {items.map((entry, i) => (
                <li key={entry.title} className="flex">
                  <button
                    type="button"
                    onClick={() => setPosition([i, i > index ? 1 : -1])}
                    aria-label={entry.title}
                    aria-current={i === index ? "true" : undefined}
                    // A generous target around a small mark: the dash is 22px
                    // wide, the button is 32 by 28.
                    className="group flex h-7 w-9 cursor-pointer items-center justify-center"
                  >
                    {/* The current dash is marked by its own colour, not by
                        the clock on top of it. The clock starts at zero width
                        and does not exist at all under reduced motion, so a
                        dash relying on it would leave the pagination with no
                        visible current item - at the start of every dwell,
                        and permanently for a reader who asked for less
                        motion. */}
                    <span
                      aria-hidden="true"
                      className={`relative block h-[2px] w-[26px] overflow-hidden transition-colors duration-[var(--roll-duration)] ease-[var(--roll-ease)] ${
                        i === index
                          ? "bg-oxblood/30"
                          : "bg-ink-ghost/45 group-hover:bg-ink-soft"
                      }`}
                    >
                      {/* On the current dash this fills as the dwell runs out,
                        so the pagination is the clock as well as the index -
                        one device doing two jobs instead of two devices. */}
                      {i === index && (
                        <span
                          key={index}
                          className={`absolute inset-0 block origin-left bg-oxblood ${
                            reduced ? "" : "updates-progress"
                          }`}
                          style={
                            reduced
                              ? undefined
                              : {
                                  animationDuration: `${updates.dwell}s`,
                                  animationPlayState: running
                                    ? "running"
                                    : "paused",
                                }
                          }
                        />
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </div>

          <div className="flex items-center gap-5">
            {/* Hidden under reduced motion, where there is no rotation to
                pause and this would be a button that does nothing. */}
            {!reduced && (
              <button
                type="button"
                onClick={() => setPaused((p) => !p)}
                aria-pressed={paused}
                className="control-motion cursor-pointer font-mono text-[10.5px] tracking-[0.14em] text-ink-faint uppercase hover:text-oxblood"
              >
                <Roll>{paused ? updates.playLabel : updates.pauseLabel}</Roll>
              </button>
            )}
            <div className="flex items-center">
              <Step label="Previous update" onClick={() => step(-1)}>
                &larr;
              </Step>
              <Step label="Next update" onClick={() => step(1)}>
                &rarr;
              </Step>
            </div>
          </div>
        </div>
      </Container>
      <FlowRule />
    </section>
  )
}

/**
 * The announcement's picture, or the hatched stand-in for one that does not
 * exist yet.
 *
 * `fill` inside a fixed 16:10 box rather than intrinsic sizing: the source is
 * a runtime string, so next/image has no width or height to read, and a
 * declared ratio also means a late-loading picture cannot shift the card.
 */
function Picture({ item }: { item: Update }) {
  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden border border-rule bg-paper">
      <Corners />
      {item.image ? (
        <Image
          src={item.image.src}
          alt={item.image.alt}
          fill
          sizes="(min-width: 1024px) 46vw, 92vw"
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            aria-hidden="true"
            className="placeholder-hatch-lg absolute inset-0"
          />
          <span className="relative font-mono text-[10.5px] tracking-[0.18em] text-ink-ghost uppercase">
            {updates.imagePending}
          </span>
        </div>
      )}
    </div>
  )
}

/** One arrow. Square, hairline, and quiet until it is wanted. */
function Step({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="control-motion flex size-9 cursor-pointer items-center justify-center border border-rule-strong text-[13px] text-ink-soft first:border-r-0 hover:border-oxblood hover:text-oxblood active:scale-[0.97]"
    >
      <span aria-hidden="true">{children}</span>
    </button>
  )
}
