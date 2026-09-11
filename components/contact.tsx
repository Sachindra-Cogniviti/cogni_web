"use client"

import * as React from "react"

import { Container, pressable } from "@/components/primitives"
import { Spotlight } from "@/components/scroll-motion"
import { Stagger } from "@/components/stagger"
import { contact, site } from "@/content/site"

/**
 * Closing contact section.
 *
 * Reprises the hero's discipline strip on a dark ground, which closes the loop
 * on the page: the same four words that opened it, now over the CTA, and
 * arriving the same way, one word at a time. A soft oxblood glow follows
 * the pointer across the dark ground on a spring.
 *
 * Both actions are mailto links. There is no form because there is no server -
 * this is a static export on shared hosting, so a form would need a standalone
 * PHP endpoint that does not exist yet.
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
          step={0.11}
          className="flex flex-wrap justify-center gap-[14px] font-mono text-[11px] font-medium tracking-[0.22em] text-oxblood-lift uppercase"
        >
          {contact.disciplines.map((item, index) => (
            <React.Fragment key={item}>
              {index > 0 && (
                <span data-stagger className="text-night-fg/30">
                  ·
                </span>
              )}
              <span data-stagger>{item}</span>
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
              href={`mailto:${site.email}`}
              className={
                action.variant === "solid"
                  ? `inline-block rounded-[2px] bg-night-fg px-[30px] py-[15px] text-[15px] font-medium text-ink transition-[background-color,transform] duration-200 hover:bg-oxblood-lift ${pressable}`
                  : `inline-block rounded-[2px] border border-night-fg/35 px-[30px] py-[14px] text-[15px] font-medium text-night-fg transition-[color,border-color,transform] duration-200 hover:border-oxblood-lift hover:text-oxblood-lift ${pressable}`
              }
            >
              {action.label}
            </a>
          ))}
        </div>
      </Container>
    </section>
  )
}
