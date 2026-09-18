"use client"

import * as React from "react"
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react"

import BlurText from "@/components/BlurText"
import TextPressure from "@/components/TextPressure"
import { HeroGalaxy } from "@/components/hero-galaxy"
import {
  Container,
  outlineButton,
  Roll,
  solidButton,
} from "@/components/primitives"
import { ScrambleText } from "@/components/scramble-text"
import { FlowRule } from "@/components/scroll-motion"
import { hero } from "@/content/site"

/**
 * Page hero.
 *
 * The entrance is the one place on the page that gets a long, staged
 * arrival: the discipline strip, then the headline a word at a time (each
 * word dropping in from a third of an em above and sharpening from a light
 * blur), then the paragraph, the buttons sliding in from the left, and the
 * footnote. The whole sequence is done in about two seconds, and it
 * establishes reading order; everything below the fold gets a shorter, capped
 * reveal instead. The delays are derived from the headline's own step (see
 * HEADLINE_LAST below) rather than written out one by one, so retiming the
 * line carries the rest of the block with it.
 *
 * It runs on CSS keyframes (`hero-arrive` and `blur-text-in` in
 * globals.css), not Motion, and that is a performance decision rather than a
 * stylistic one: a Motion entrance cannot start until React has hydrated,
 * which on a slow phone is a second or more after the hero is painted, and
 * for all of that time the largest text on the page sat invisible. CSS
 * starts at first paint. The constants below are still the single source of
 * the timing; they reach the stylesheet as inline delays and custom
 * properties (`arrive` below). Only the scroll-linked exit is Motion's.
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
 * the large breakpoint it is a single centred column, and a small galaxy
 * sits between the headline and the paragraph - the same scene at a
 * fraction of the size, with fewer particles and no labels (see the
 * `compact` prop in components/hero-galaxy.tsx).
 *
 * The galaxy's label pills can reach past the container, so the header clips
 * on the x axis; without that the page would scroll sideways.
 */
/** The page's ease-out, as the stylesheet spells it. */
const EASE_CSS = "cubic-bezier(0.22, 1, 0.36, 1)"

/**
 * The discipline strip's cascade. The two numbers are also what each word's
 * decode is timed from, so the scramble and the fade arrive together.
 */
const STRIP_LEAD = 0.05
const STRIP_STEP = 0.06

/** The beat between the two buttons, which enter from the left in turn. */
const ACTION_STEP = 0.12

/**
 * One element's arrival, for the `hero-arrive` keyframes: when it starts,
 * in seconds, and where it starts from, in pixels. Movement is on the
 * independent `translate` property, and the animation fills backwards only,
 * so once it has played the element is back on the stylesheet's own values -
 * which is what lets the solid button's `hover:-translate-y-px` work
 * afterwards.
 */
const arrive = (
  delay: number,
  fromY = 14,
  fromX = 0,
  duration = 0.6
): React.CSSProperties =>
  ({
    "--from-x": `${fromX}px`,
    "--from-y": `${fromY}px`,
    "--arrive-duration": `${duration}s`,
    animationDelay: `${delay}s`,
  }) as React.CSSProperties

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


/*
 * How the words arrive: down from a third of an em above, out of a blur.
 *
 * The opacity starts a fraction above zero, and that fraction is the whole
 * point. Chrome does not count an element painted at opacity 0 as a candidate
 * for the largest contentful paint, and the largest element on this page is a
 * word of this headline - so at a flat 0 the page's LCP was not the moment the
 * headline was painted, it was the moment the last word's animation delay
 * elapsed and it finally became visible. Measured on the deployment, that was
 * 1.6s of "element render delay" hung on the end of a first paint that had
 * already happened: an entrance the reader enjoys, charged as a page that
 * takes five seconds to show its headline.
 *
 * At 0.28 the words are on screen from first paint and the same cascade plays
 * over the top of them. It reads as type coming into focus rather than type
 * arriving from nothing, which is a real change to the first half-second of
 * the page - but it is the only version of this entrance that does not cost
 * the reader the headline. Lowering it towards 0 walks back towards the old
 * measurement; raising it flattens the reveal.
 */
const headlineFrom = { opacity: 0.28, y: "-0.35em", filter: "blur(6px)" }

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

/** Where the two-column layout begins, and with it the scroll drift. */
const WIDE_QUERY = "(min-width: 1024px)"

export function Hero() {
  const ref = React.useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  // The exit drift is a wide-screen effect. In the single column the copy
  // block runs to the rule under it, and lifting the block away from that
  // rule as the reader scrolls opened a gap under the footnote.
  const [wide, setWide] = React.useState(false)
  React.useEffect(() => {
    const query = window.matchMedia(WIDE_QUERY)
    const sync = () => setWide(query.matches)
    sync()
    query.addEventListener("change", sync)
    return () => query.removeEventListener("change", sync)
  }, [])
  // 0 at the top of the page, 1 once the hero has scrolled clear. Written
  // as percentages rather than "start start"/"end start": that pair is one
  // of Motion's presets, which it hands to a native ViewTimeline, and the
  // named range it maps to ("exit") begins later than the offsets ask for.
  // The percentages mean the same thing and keep Motion on its own scroll
  // tracking, where the offsets are honoured.
  //
  // The block drifts up against the scroll but does not fade: it used to
  // dissolve to nothing by three quarters of the way out, which read as the
  // headline blurring away under the reader while it was still on screen.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0%", "end 0%"],
  })
  const blockY = useTransform(scrollYProgress, [0, 1], [0, -140])
  const galaxyY = useTransform(scrollYProgress, [0, 1], [0, 70])
  const galaxyScale = useTransform(scrollYProgress, [0, 1], [1, 0.86])

  return (
    <header
      ref={ref}
      id="top"
      // Was clamp(140px,18vh,190px), which covered the fixed nav's 68px plus
      // the opening gap. The HatchBand above now carries the nav clearance and
      // 56px of its own, so this is only the gap between that band and the
      // headline - the total above the hero is unchanged.
      className="relative overflow-x-clip pt-[clamp(32px,5vh,64px)]"
    >
      <Container>
        <motion.div
          style={reduced || !wide ? undefined : { y: blockY }}
        >
          <div className="[--hero-size:clamp(42px,6.6vw,94px)] lg:grid lg:grid-cols-[calc(6.6*var(--hero-size))_minmax(0,1fr)] lg:gap-x-[clamp(32px,4vw,64px)] lg:gap-y-10">
            <div className="max-lg:text-center">
              {/* One line on a phone: the strip is the page's first words
                  and a strip that wraps reads as two strips. Smaller type
                  and tighter tracking below the small breakpoint, and it
                  never wraps. */}
              <div className="flex flex-wrap items-center gap-[14px] font-mono text-[11.5px] font-medium tracking-[0.22em] text-oxblood uppercase max-lg:justify-center max-sm:flex-nowrap max-sm:gap-[8px] max-sm:text-[9.5px] max-sm:tracking-[0.14em] max-sm:whitespace-nowrap max-[360px]:text-[8.5px]">
                {/* The separators take a beat of the cascade too, so word n
                    is beat 2n and the separator before it beat 2n - 1. */}
                {hero.disciplines.map((item, index) => (
                  <React.Fragment key={item}>
                    {index > 0 && (
                      <span
                        className="hero-arrive text-edge"
                        style={arrive(
                          STRIP_LEAD + (index * 2 - 1) * STRIP_STEP,
                          8,
                          0,
                          0.5
                        )}
                      >
                        ·
                      </span>
                    )}
                    <span
                      className="hero-arrive"
                      style={arrive(
                        STRIP_LEAD + index * 2 * STRIP_STEP,
                        8,
                        0,
                        0.5
                      )}
                    >
                      <ScrambleText
                        text={item}
                        delay={STRIP_LEAD + index * 2 * STRIP_STEP}
                      />
                    </span>
                  </React.Fragment>
                ))}
              </div>

              <h1 className="mt-[26px] max-w-[15ch] text-(length:--hero-size) leading-[1.01] font-semibold tracking-[-0.035em] text-balance max-lg:mx-auto">
                <BlurText
                  as="span"
                  inline
                  text={hero.headline.before.trim()}
                  delay={HEADLINE_STEP}
                  startDelay={HEADLINE_LEAD}
                  stepDuration={HEADLINE_DURATION}
                  easing={EASE_CSS}
                  animationFrom={headlineFrom}
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
                  easing={EASE_CSS}
                  animationFrom={headlineFrom}
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
                  easing={EASE_CSS}
                  animationFrom={headlineFrom}
                />
              </h1>

              {/* The small galaxy, in the single column only. It arrives
                  with the paragraph and boots on the same delay as the
                  large one, for the same reason. */}
              <div
                className="hero-arrive mx-auto mt-6 w-[min(86vw,340px)] lg:hidden"
                style={arrive(BODY_DELAY, 0, 0, 0.9)}
              >
                <HeroGalaxy
                  compact
                  startDelay={GALAXY_BOOT_DELAY}
                  className="relative aspect-square w-full"
                />
              </div>
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

            <p
              className="hero-arrive mt-8 max-w-[56ch] text-[clamp(16px,1.4vw,18.5px)] leading-[1.6] text-pretty text-ink-soft max-lg:mx-auto max-lg:text-center lg:mt-0"
              style={arrive(BODY_DELAY)}
            >
              {hero.body}
            </p>
            <div className="mt-8 flex flex-wrap gap-[14px] self-end max-lg:justify-center lg:mt-0">
              {hero.actions.map((action, index) => (
                <a
                  key={action.label}
                  href={action.href}
                  className={`hero-arrive ${
                    action.variant === "solid"
                      ? `${solidButton} hover:-translate-y-px active:translate-y-0`
                      : outlineButton
                  }`}
                  style={arrive(ACTIONS_DELAY + index * ACTION_STEP, 0, -32)}
                >
                  <Roll>{action.label}</Roll>
                </a>
              ))}
            </div>
          </div>

          <p
            className="hero-arrive mt-[34px] font-mono text-[12px] tracking-[0.04em] text-ink-faint max-lg:mx-auto max-lg:max-w-[52ch] max-lg:text-center"
            style={arrive(FOOTNOTE_DELAY)}
          >
            {hero.footnote}
          </p>
        </motion.div>
      </Container>
      <div className="mt-[clamp(40px,6vw,64px)]" />
      {/* Static: this rule is on screen at load, and a rule that draws
          itself in while the reader has not yet moved reads as a fault. */}
      <FlowRule drawn={false} />
    </header>
  )
}
