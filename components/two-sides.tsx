"use client"

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"

import { Container, Kicker, sectionPadding } from "@/components/primitives"
import { twoSides } from "@/content/site"

/**
 * "Two sides of Cogniviti Labs" - a card that flips in 3D between the services
 * face and the products face.
 *
 * This section went through the most iteration in the design: a two-column
 * list, then a tabbed card, then a flip triggered by a corner button, and
 * finally this - a circular control sitting half on and half off the card's
 * bottom edge. The overhang is the point, so the perspective wrapper must not
 * clip it.
 *
 * Two details worth preserving:
 *
 *   - The button is a sibling of the faces, not a child, so it stays
 *     upright and legible while the card rotates behind it. Its arrow
 *     mirrors (Motion, 300ms) once the reverse is showing.
 *   - The reverse face mirrors the gradient ramp rather than repeating it, so
 *     the two sides read as a pair rather than a duplicate.
 */
export function TwoSides() {
  const [flipped, setFlipped] = React.useState(false)
  const reduced = useReducedMotion()
  const [front, back] = twoSides.faces

  return (
    <section id="two-sides" className={sectionPadding}>
      <Container className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-[clamp(40px,5vw,80px)]">
        <div data-reveal="0">
          <Kicker>{twoSides.kicker}</Kicker>
          <h2 className="mt-5 max-w-[16ch] text-[clamp(32px,3.6vw,52px)] leading-[1.06] font-semibold tracking-[-0.03em] text-balance">
            {twoSides.heading}
          </h2>
          <p className="mt-6 max-w-[44ch] text-[16.5px] leading-[1.6] text-pretty text-ink-soft">
            {twoSides.body}
          </p>
        </div>

        <div data-reveal="80" className="relative self-start">
          <motion.button
            type="button"
            onClick={() => setFlipped((value) => !value)}
            title={twoSides.flipLabel}
            aria-label={twoSides.flipLabel}
            aria-pressed={flipped}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: "spring", duration: 0.3, bounce: 0.3 }}
            className="absolute bottom-[-26px] left-1/2 z-2 flex size-[52px] -translate-x-1/2 cursor-pointer items-center justify-center rounded-full border border-rule-strong bg-paper text-oxblood shadow-[0_8px_24px_rgb(23_20_15/0.2)] transition-[background-color,color,box-shadow] duration-200 hover:bg-oxblood hover:text-paper hover:shadow-[0_10px_30px_rgb(142_32_48/0.4)]"
          >
            {/* The arrow mirrors when the card is on its reverse, so the
                control reads "turn back" rather than looking untouched. */}
            <motion.svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              animate={{ scaleX: flipped ? -1 : 1 }}
              transition={reduced ? { duration: 0 } : { duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            >
              <path d="M21 12a9 9 0 1 1-2.64-6.36" />
              <polyline points="21 3 21 9 15 9" />
            </motion.svg>
          </motion.button>

          {/* Each face turns on its own axis rather than inside a shared
              rotating parent. Nested 3D (preserve-3d) is flattened by some
              browsers and embedded webviews, which then either show the
              front mirrored or nothing at all. Two independent rotations
              under one perspective need no nesting and work everywhere.
              Perspective applies to direct children only, so it sits here on
              the faces' parent. */}
          <div className="relative [perspective:1600px]">
            <CardFace face={front} side="front" hidden={flipped} />
            <CardFace face={back} side="back" hidden={!flipped} />
          </div>
        </div>
      </Container>
    </section>
  )
}

function CardFace({
  face,
  side,
  hidden,
}: {
  face: (typeof twoSides.faces)[number]
  side: "front" | "back"
  hidden: boolean
}) {
  const isBack = side === "back"

  return (
    <div
      // The reverse face is absolutely positioned over the front so the card
      // has a single height driven by whichever face is taller.
      //
      //
      // The front turns 0 to 180 degrees and the back -180 to 0, so both
      // rotate the same way and the reverse arrives as the front leaves.
      // backface-visibility hides whichever is facing away, and as a belt
      // and braces each face is also switched with `visibility`, delayed to
      // the midpoint of the 700ms turn: the instant the card is edge-on and
      // the swap cannot be seen.
      className={`overflow-hidden rounded-[4px] shadow-[0_20px_56px_rgb(142_32_48/0.28)] [backface-visibility:hidden] [transition:transform_700ms_cubic-bezier(.45,.15,.2,1),visibility_0s_linear_350ms] ${
        hidden ? "invisible" : "visible"
      } ${isBack ? "streak-gradient-reverse absolute inset-0" : "streak-gradient relative"}`}
      style={{
        transform: isBack
          ? `rotateY(${hidden ? -180 : 0}deg)`
          : `rotateY(${hidden ? 180 : 0}deg)`,
      }}
      // Keep the hidden face out of the tab order and off screen readers;
      // backface-visibility hides it visually but not semantically. React 19
      // takes `inert` as a real boolean.
      aria-hidden={hidden}
      inert={hidden}
    >
      <div className="streak-lines absolute inset-0" />
      <div className="streak-sheen absolute inset-0" />
      <div className="streak-grain absolute inset-0" />

      <div className="relative flex min-h-[300px] flex-col p-[clamp(28px,3.5vw,44px)]">
        <span className="font-mono text-[11.5px] tracking-[0.18em] text-[rgb(255_214_205/0.9)] uppercase">
          {face.index}
        </span>
        <div className="mt-[22px] max-w-[18ch] text-[clamp(24px,2.4vw,32px)] font-semibold tracking-[-0.02em] text-balance text-paper">
          {face.title}
        </div>
        <p className="mt-[14px] max-w-[46ch] text-[15.5px] leading-[1.65] text-pretty text-[rgb(255_236_232/0.85)]">
          {face.body}
        </p>
        <div className="mt-auto pt-6">
          <a
            href={face.cta.href}
            tabIndex={hidden ? -1 : undefined}
            className="inline-block rounded-[2px] bg-paper px-6 py-3 text-[14px] font-semibold text-ink transition-[background-color,color,transform] duration-200 hover:bg-ink hover:text-paper active:scale-[0.97] active:duration-100"
          >
            {face.cta.label}&nbsp;&nbsp;→
          </a>
        </div>
      </div>
    </div>
  )
}
