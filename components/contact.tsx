"use client"

import * as React from "react"

import { Container, pressable, Roll } from "@/components/primitives"
import { ScrambleText } from "@/components/scramble-text"
import { Spotlight } from "@/components/scroll-motion"
import { Stagger } from "@/components/stagger"
import { contact } from "@/content/site"

/** The discipline strip's stagger, and what each word's decode is timed from. */
const STRIP_STEP = 0.11

/**
 * Closing contact section.
 *
 * Reprises the hero's discipline strip on a dark ground, which closes the loop
 * on the page: the same four words that opened it, now over the CTA, and
 * arriving the same way, one word at a time. A soft oxblood glow follows
 * the pointer across the dark ground on a spring.
 *
 * Both actions open the enquiry form on /contact with the subject already
 * chosen - a services requirement or a product demonstration - so the
 * reader lands on the form rather than in a mail client. The address itself
 * is still on the footer for anyone who prefers to write.
 */
export function Contact() {
  return (
    <section
      id="contact"
      className="relative overflow-clip bg-night py-[clamp(96px,12vw,160px)] text-night-fg"
    >
      <Spotlight color="rgb(200 106 114 / 0.14)" size={620} />
      <Container className="relative max-w-[1000px] text-center">
        <Stagger
          step={STRIP_STEP}
          className="flex flex-wrap justify-center gap-[14px] font-mono text-[11px] font-medium tracking-[0.22em] text-oxblood-lift uppercase"
        >
          {contact.disciplines.map((item, index) => (
            <React.Fragment key={item}>
              {index > 0 && (
                <span data-stagger className="text-night-fg/30">
                  ·
                </span>
              )}
              <span data-stagger>
                {/* Decodes as it arrives. The separators are stagger children
                    too, so word n is child 2n. */}
                <ScrambleText text={item} delay={index * 2 * STRIP_STEP} />
              </span>
            </React.Fragment>
          ))}
        </Stagger>

        <h2
          data-reveal="120"
          className="mt-7 text-[clamp(32px,4.4vw,60px)] leading-[1.06] font-semibold tracking-[-0.03em] text-balance"
        >
          {contact.heading}
        </h2>

        <p
          data-reveal="180"
          className="mx-auto mt-[26px] max-w-[52ch] text-[16.5px] leading-[1.65] text-pretty text-night-muted"
        >
          {contact.body}
        </p>

        <div
          data-reveal="240"
          className="mt-[38px] flex flex-wrap justify-center gap-[14px]"
        >
          {contact.actions.map((action) => (
            <a
              key={action.label}
              href={action.href}
              className={
                action.variant === "solid"
                  ? `inline-block rounded-[2px] bg-night-fg px-[30px] py-[15px] text-[15px] font-medium text-ink hover:bg-oxblood-lift ${pressable}`
                  : `inline-block rounded-[2px] border border-night-fg/35 px-[30px] py-[14px] text-[15px] font-medium text-night-fg hover:border-oxblood-lift hover:text-oxblood-lift ${pressable}`
              }
            >
              <Roll>{action.label}</Roll>
            </a>
          ))}
        </div>
      </Container>
    </section>
  )
}
