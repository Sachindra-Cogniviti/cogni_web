import * as React from "react"

import { Container, outlineButton, solidButton } from "@/components/primitives"
import { hero } from "@/content/site"

/**
 * Page hero.
 *
 * `data-reveal-scope="hero"` marks this subtree as the one place that gets the
 * full staggered entrance - the observer reads it to decide between the long
 * hero timing and the capped mid-page timing.
 *
 * The design carried an interactive particle canvas to the right of the
 * headline through several iterations and then removed it, returning to this
 * text-only composition. That removal is intentional and the canvas is not
 * reinstated here.
 */
export function Hero() {
  return (
    <header
      id="top"
      data-reveal-scope="hero"
      className="pt-[clamp(140px,18vh,190px)]"
    >
      <Container className="relative">
        <div
          data-reveal="0"
          className="flex flex-wrap items-center gap-[14px] font-mono text-[11.5px] font-medium tracking-[0.22em] text-oxblood uppercase"
        >
          {hero.disciplines.map((word, index) => (
            <React.Fragment key={word}>
              {index > 0 && <span className="text-edge">·</span>}
              <span>{word}</span>
            </React.Fragment>
          ))}
        </div>

        <h1
          data-reveal="80"
          className="mt-[26px] max-w-[15ch] text-[clamp(42px,6.6vw,94px)] leading-[1.01] font-semibold tracking-[-0.035em] text-balance"
        >
          {hero.headline.before}
          {/* The serif italic accent. It is the page's typographic signature -
              a genuine editorial contrast rather than the same grotesk in a
              different colour. */}
          <em className="font-serif font-medium tracking-[-0.015em] text-oxblood">
            {hero.headline.accent}
          </em>
          {hero.headline.after}
        </h1>

        <div className="mt-10 flex flex-wrap items-end justify-between gap-x-12 gap-y-8">
          <p
            data-reveal="160"
            className="max-w-[56ch] text-[clamp(16px,1.4vw,18.5px)] leading-[1.6] text-pretty text-ink-soft"
          >
            {hero.body}
          </p>
          <div data-reveal="240" className="flex flex-wrap gap-[14px]">
            {hero.actions.map((action) => (
              <a
                key={action.label}
                href={action.href}
                className={
                  action.variant === "solid"
                    ? `${solidButton} hover:-translate-y-px`
                    : outlineButton
                }
              >
                {action.label}
              </a>
            ))}
          </div>
        </div>

        <p
          data-reveal="320"
          className="mt-[34px] font-mono text-[12px] tracking-[0.04em] text-ink-faint"
        >
          {hero.footnote}
        </p>
      </Container>
      <div className="mt-16 border-b border-rule" />
    </header>
  )
}
