"use client"

import * as React from "react"

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
 *   - The button is a sibling of the flipping element, not a child, so it
 *     stays upright and legible while the card rotates behind it.
 *   - The reverse face mirrors the gradient ramp rather than repeating it, so
 *     the two sides read as a pair rather than a duplicate.
 */
export function TwoSides() {
  const [flipped, setFlipped] = React.useState(false)
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

        <div
          data-reveal="80"
          className="relative self-start [perspective:1600px]"
        >
          <button
            type="button"
            onClick={() => setFlipped((value) => !value)}
            title={twoSides.flipLabel}
            aria-label={twoSides.flipLabel}
            aria-pressed={flipped}
            className="absolute bottom-[-26px] left-1/2 z-2 flex size-[52px] -translate-x-1/2 cursor-pointer items-center justify-center rounded-full border border-rule-strong bg-paper text-oxblood shadow-[0_8px_24px_rgb(23_20_15/0.2)] transition-[background-color,color,box-shadow] duration-200 hover:bg-oxblood hover:text-paper hover:shadow-[0_10px_30px_rgb(142_32_48/0.4)]"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 12a9 9 0 1 1-2.64-6.36" />
              <polyline points="21 3 21 9 15 9" />
            </svg>
          </button>

          <div
            className="relative transition-transform duration-700 ease-[cubic-bezier(.45,.15,.2,1)] [transform-style:preserve-3d]"
            style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
          >
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
      className={`overflow-hidden rounded-[4px] shadow-[0_20px_56px_rgb(142_32_48/0.28)] [backface-visibility:hidden] ${
        isBack
          ? "streak-gradient-reverse absolute inset-0 [transform:rotateY(180deg)]"
          : "streak-gradient relative"
      }`}
      // Keep the hidden face out of the tab order and off screen readers;
      // backface-visibility hides it visually but not semantically.
      aria-hidden={hidden}
      {...(hidden ? { inert: "" as unknown as boolean } : {})}
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
            className="inline-block rounded-[2px] bg-paper px-6 py-3 text-[14px] font-semibold text-ink transition-colors duration-200 hover:bg-ink hover:text-paper"
          >
            {face.cta.label}&nbsp;&nbsp;→
          </a>
        </div>
      </div>
    </div>
  )
}
