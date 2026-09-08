"use client"

import * as React from "react"
import { motion, type Variants } from "motion/react"

import { HeroGalaxy } from "@/components/hero-galaxy"
import { Container, outlineButton, solidButton } from "@/components/primitives"
import { hero } from "@/content/site"

/**
 * Page hero.
 *
 * The entrance is Motion's, and it is the one place on the page that gets a
 * long, staged arrival: the discipline strip, then the headline a word at a
 * time (each word rising a third of an em and sharpening from a light blur),
 * then the paragraph, the buttons, and the footnote. The whole sequence is
 * done in about 1.2 seconds, and it establishes reading order; everything
 * below the fold gets a shorter, capped reveal instead.
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

const headline: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.045, delayChildren: 0.2 } },
}

const word: Variants = {
  hidden: { opacity: 0, y: "0.35em", filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: EASE },
  },
}

const block = (delay: number): Variants => ({
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE, delay } },
})

/** Splits a run of text into word spans that each take the `word` variant. */
function Words({ text }: { text: string }) {
  const parts = text.split(" ")
  return (
    <>
      {parts.map((part, index) => {
        if (part === "") return index < parts.length - 1 ? " " : null
        return (
          <React.Fragment key={`${part}-${index}`}>
            <motion.span variants={word} className="inline-block">
              {part}
            </motion.span>
            {index < parts.length - 1 ? " " : null}
          </React.Fragment>
        )
      })}
    </>
  )
}

export function Hero() {
  return (
    <motion.header
      id="top"
      initial="hidden"
      animate="show"
      className="overflow-x-clip pt-[clamp(140px,18vh,190px)]"
    >
      <Container>
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

            <motion.h1
              variants={headline}
              className="mt-[26px] max-w-[15ch] text-(length:--hero-size) leading-[1.01] font-semibold tracking-[-0.035em] text-balance"
            >
              <Words text={hero.headline.before} />
              {/* The serif italic accent. It is the page's typographic signature -
                  a genuine editorial contrast rather than the same grotesk in a
                  different colour. */}
              <motion.em
                variants={word}
                className="inline-block font-serif font-medium tracking-[-0.015em] text-oxblood"
              >
                {hero.headline.accent}
              </motion.em>
              <Words text={hero.headline.after} />
            </motion.h1>
          </div>

          {/* An empty cell carries the galaxy, which is centred on the headline
              row but taken out of flow so its height does not set the row's
              and push the paragraph down. It overhangs the row a little at
              top and bottom; the particle field is sparse there. */}
          <div className="relative hidden lg:block">
            <HeroGalaxy className="absolute top-1/2 left-0 aspect-square w-full max-w-[560px] -translate-y-1/2" />
          </div>

          <motion.p
            variants={block(0.55)}
            className="mt-10 max-w-[56ch] text-[clamp(16px,1.4vw,18.5px)] leading-[1.6] text-pretty text-ink-soft lg:mt-0"
          >
            {hero.body}
          </motion.p>
          <motion.div
            variants={block(0.7)}
            className="mt-8 flex flex-wrap gap-[14px] self-end lg:mt-0"
          >
            {hero.actions.map((action) => (
              <a
                key={action.label}
                href={action.href}
                className={
                  action.variant === "solid"
                    ? `${solidButton} hover:-translate-y-px active:translate-y-0`
                    : outlineButton
                }
              >
                {action.label}
              </a>
            ))}
          </motion.div>
        </div>

        <motion.p
          variants={block(0.85)}
          className="mt-[34px] font-mono text-[12px] tracking-[0.04em] text-ink-faint"
        >
          {hero.footnote}
        </motion.p>
      </Container>
      <div className="mt-16 border-b border-rule" />
    </motion.header>
  )
}
