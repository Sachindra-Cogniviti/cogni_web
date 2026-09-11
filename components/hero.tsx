"use client"

import * as React from "react"
import {
  cubicBezier,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from "motion/react"

import BlurText from "@/components/BlurText"
import TextPressure from "@/components/TextPressure"
import { HeroGalaxy } from "@/components/hero-galaxy"
import { Container, outlineButton, solidButton } from "@/components/primitives"
import { FlowRule } from "@/components/scroll-motion"
import { hero } from "@/content/site"

/**
 * Page hero.
 *
 * The entrance is Motion's, and it is the one place on the page that gets a
 * long, staged arrival: the discipline strip, then the headline a word at a
 * time (each word dropping in from a third of an em above and sharpening from
 * a light blur), then the paragraph, the buttons sliding in from the left,
 * and the footnote. The whole sequence is done in about two seconds, and it
 * establishes reading order; everything below the fold gets a shorter, capped
 * reveal instead. The delays are derived from the headline's own step (see
 * HEADLINE_LAST below) rather than written out one by one, so retiming the
 * line carries the rest of the block with it.
 *
 * The headline's word reveal is React Bits' BlurText (components/BlurText.jsx)
 * rather than a variant defined here. It runs as three pieces sharing one
 * cascade - the words before the accent, the accent itself, the words after -
 * because the accent is a serif italic <em> and cannot be a plain word in a
 * string. `indexOffset` continues the word count across the three so they
 * read as one sweep. The accent additionally carries TextPressure
 * (components/TextPressure.jsx): pointing at it pushes the nearest letters
 * heavier along Newsreader's weight axis, and they relax when the pointer
 * leaves. It plays itself once as the headline settles, so that behaviour is
 * shown rather than left for the reader to stumble on.
 *
 * The exit is the scroll's. As the hero leaves, the copy block rises ahead
 * of the page and fades, and the galaxy hangs back and shrinks a little, so
 * the two separate in depth on the way out and come back together on the
 * way up.
 *
 * From the large breakpoint up the hero is a two-column grid. The left column
 * is sized from the headline's font size (its widest line is about 6.5em) and
 * holds the kicker, headline and paragraph. The right column holds the galaxy
 * (components/hero-galaxy.tsx), centred on the headline without adding to
 * the row's height, with the buttons under it on the paragraph's baseline.
 * Galaxy and buttons share the column's left edge, so the two rows read as
 * one aligned block instead of the buttons floating at the far right. Below
 * the large breakpoint it is a single column and the galaxy is not rendered.
 *
 * The galaxy's label pills can reach past the container, so the header clips
 * on the x axis; without that the page would scroll sideways.
 */
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const strip: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
}

const stripWord: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
}

const block = (delay: number): Variants => ({
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE, delay } },
})

/**
 * The two buttons, entering from the left one after the other.
 *
 * Movement is on the independent `translate` property rather than `x`, which
 * Motion would write as an inline `transform`. The solid button carries
 * Tailwind's `hover:-translate-y-px`, and an inline transform left behind at
 * rest would outrank that class and kill the hover lift. This is the same
 * reason lib/scroll-flow.ts avoids `transform` everywhere.
 */
const actions = (delay: number): Variants => ({
  hidden: {},
  show: { transition: { delayChildren: delay, staggerChildren: 0.12 } },
})

const actionItem: Variants = {
  hidden: { opacity: 0, translate: "-32px 0px" },
  show: {
    opacity: 1,
    translate: "0px 0px",
    transition: { duration: 0.6, ease: EASE },
  },
}

/*
 * The headline's shared cascade. BlurText takes the first two in
 * milliseconds; the duration is seconds, because that is what it passes to
 * Motion.
 *
 * The step has to be read against the duration, not on its own. At 45ms a
 * step against a 700ms word, all eight words are in flight at once and only
 * the last 300ms of the line differs from the first - which arrives as a
 * block, whatever the numbers say. A step of about a fifth of the duration
 * is what actually reads as one word after another.
 */
const HEADLINE_LEAD = 200
const HEADLINE_STEP = 110
const HEADLINE_DURATION = 0.5

/** The same curve as EASE, as the easing function BlurText's prop expects. */
const EASE_FN = cubicBezier(...EASE)

/** How the words arrive: down from a third of an em above, out of a blur. */
const headlineFrom = { opacity: 0, y: "-0.35em", filter: "blur(6px)" }
const headlineTo = [{ opacity: 1, y: 0, filter: "blur(0px)" }]

/** Word counts, so each run picks the cascade up where the last one left it. */
const beforeWords = hero.headline.before.trim().split(" ").length
const afterWords = hero.headline.after.trim().split(" ").length
const headlineWords = beforeWords + 1 + afterWords

/**
 * When the last headline word starts, in seconds.
 *
 * Everything after the headline hangs off this rather than off a hand-tuned
 * number, so widening the step above cannot quietly leave the paragraph
 * arriving in the middle of the line.
 */
const HEADLINE_LAST =
  (HEADLINE_LEAD + (headlineWords - 1) * HEADLINE_STEP) / 1000

/**
 * When the accent word plays its pressure sweep, in milliseconds. It waits
 * for the whole line to settle: a wave travelling through one word while its
 * neighbours are still dropping in reads as a glitch rather than an invitation.
 */
const ACCENT_SWEEP_DELAY = (HEADLINE_LAST + HEADLINE_DURATION) * 1000 + 120

/*
 * What follows the headline. Each starts as the line's last word does, not
 * once it has finished: the blocks overlap the tail of the headline the way
 * they did before the step widened, so the sequence stays one movement
 * instead of a queue waiting its turn.
 */
const BODY_DELAY = HEADLINE_LAST
const ACTIONS_DELAY = HEADLINE_LAST + 0.15
const FOOTNOTE_DELAY = HEADLINE_LAST + 0.3

/**
 * When the galaxy is allowed to load three.js, in milliseconds.
 *
 * Not a style choice - a main-thread one. See the `startDelay` note in
 * components/hero-galaxy.tsx: booting it during the reveal is what turns the
 * word-by-word cascade into a block.
 */
const GALAXY_BOOT_DELAY = (HEADLINE_LAST + HEADLINE_DURATION) * 1000

export function Hero() {
  const ref = React.useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  // 0 at the top of the page, 1 once the hero has scrolled clear. Written
  // as percentages rather than "start start"/"end start": that pair is one
  // of Motion's presets, which it hands to a native ViewTimeline for the
  // opacity, and the named range it maps to ("exit") begins later than the
  // offsets ask for. The percentages mean the same thing and keep Motion
  // on its own scroll tracking, where the offsets are honoured.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0%", "end 0%"],
  })
  const blockY = useTransform(scrollYProgress, [0, 1], [0, -140])
  const blockOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0])
  const galaxyY = useTransform(scrollYProgress, [0, 1], [0, 70])
  const galaxyScale = useTransform(scrollYProgress, [0, 1], [1, 0.86])

  return (
    <motion.header
      ref={ref}
      id="top"
      initial="hidden"
      animate="show"
      // Was clamp(140px,18vh,190px), which covered the fixed nav's 68px plus
      // the opening gap. The HatchBand above now carries the nav clearance and
      // 56px of its own, so this is only the gap between that band and the
      // headline - the total above the hero is unchanged.
      className="relative overflow-x-clip pt-[clamp(32px,5vh,64px)]"
    >
      <Container>
        <motion.div
          style={reduced ? undefined : { y: blockY, opacity: blockOpacity }}
        >
          <div className="[--hero-size:clamp(42px,6.6vw,94px)] lg:grid lg:grid-cols-[calc(6.6*var(--hero-size))_minmax(0,1fr)] lg:gap-x-[clamp(32px,4vw,64px)] lg:gap-y-10">
            <div>
              <motion.div
                variants={strip}
                className="flex flex-wrap items-center gap-[14px] font-mono text-[11.5px] font-medium tracking-[0.22em] text-oxblood uppercase"
              >
                {hero.disciplines.map((item, index) => (
                  <React.Fragment key={item}>
                    {index > 0 && (
                      <motion.span variants={stripWord} className="text-edge">
                        ·
                      </motion.span>
                    )}
                    <motion.span variants={stripWord}>{item}</motion.span>
                  </React.Fragment>
                ))}
              </motion.div>

              <h1 className="mt-[26px] max-w-[15ch] text-(length:--hero-size) leading-[1.01] font-semibold tracking-[-0.035em] text-balance">
                <BlurText
                  as="span"
                  inline
                  text={hero.headline.before.trim()}
                  delay={HEADLINE_STEP}
                  startDelay={HEADLINE_LEAD}
                  stepDuration={HEADLINE_DURATION}
                  easing={EASE_FN}
                  animationFrom={headlineFrom}
                  animationTo={headlineTo}
                />{" "}
                {/* The serif italic accent. It is the page's typographic signature -
                    a genuine editorial contrast rather than the same grotesk in a
                    different colour - and the one word on the page that answers to
                    the pointer. It arrives on the same cascade as its neighbours,
                    so BlurText wraps it rather than being given a copy of the
                    animation. */}
                <BlurText
                  as="span"
                  inline
                  indexOffset={beforeWords}
                  delay={HEADLINE_STEP}
                  startDelay={HEADLINE_LEAD}
                  stepDuration={HEADLINE_DURATION}
                  easing={EASE_FN}
                  animationFrom={headlineFrom}
                  animationTo={headlineTo}
                >
                  <em className="font-serif font-medium tracking-[-0.015em] text-oxblood">
                    <TextPressure
                      text={hero.headline.accent}
                      // Newsreader is variable on weight only, so that is the
                      // axis the pressure moves. 500 is the <em>'s own weight,
                      // which is where the letters sit when nothing is near.
                      restWeight={500}
                      minWeight={300}
                      maxWeight={800}
                      // Play it once as the headline settles, so the reader
                      // sees the word is live without having to find it.
                      autoPlay
                      autoPlayDelay={ACCENT_SWEEP_DELAY}
                      autoPlayDuration={1100}
                    />
                  </em>
                </BlurText>{" "}
                <BlurText
                  as="span"
                  inline
                  text={hero.headline.after.trim()}
                  indexOffset={beforeWords + 1}
                  delay={HEADLINE_STEP}
                  startDelay={HEADLINE_LEAD}
                  stepDuration={HEADLINE_DURATION}
                  easing={EASE_FN}
                  animationFrom={headlineFrom}
                  animationTo={headlineTo}
                />
              </h1>
            </div>

            {/* An empty cell carries the galaxy, which is centred on the headline
                row but taken out of flow so its height does not set the row's
                and push the paragraph down. It overhangs the row a little at
                top and bottom; the particle field is sparse there. The cell
                is what the scroll moves, so the galaxy lags the copy. */}
            <motion.div
              style={reduced ? undefined : { y: galaxyY, scale: galaxyScale }}
              className="relative hidden lg:block"
            >
              <HeroGalaxy
                startDelay={GALAXY_BOOT_DELAY}
                className="absolute top-1/2 left-0 aspect-square w-full max-w-[560px] -translate-y-1/2"
              />
            </motion.div>

            <motion.p
              variants={block(BODY_DELAY)}
              className="mt-10 max-w-[56ch] text-[clamp(16px,1.4vw,18.5px)] leading-[1.6] text-pretty text-ink-soft lg:mt-0"
            >
              {hero.body}
            </motion.p>
            <motion.div
              variants={actions(ACTIONS_DELAY)}
              className="mt-8 flex flex-wrap gap-[14px] self-end lg:mt-0"
            >
              {hero.actions.map((action) => (
                <motion.a
                  key={action.label}
                  variants={actionItem}
                  href={action.href}
                  className={
                    action.variant === "solid"
                      ? `${solidButton} hover:-translate-y-px active:translate-y-0`
                      : outlineButton
                  }
                >
                  {action.label}
                </motion.a>
              ))}
            </motion.div>
          </div>

          <motion.p
            variants={block(FOOTNOTE_DELAY)}
            className="mt-[34px] font-mono text-[12px] tracking-[0.04em] text-ink-faint"
          >
            {hero.footnote}
          </motion.p>
        </motion.div>
      </Container>
      <div className="mt-16" />
      <FlowRule />
    </motion.header>
  )
}
