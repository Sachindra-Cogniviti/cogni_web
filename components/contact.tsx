"use client"

import * as React from "react"
import { motion, type Variants } from "motion/react"

import { Container, pressable } from "@/components/primitives"
import { contact, site } from "@/content/site"

/**
 * Closing contact section.
 *
 * Reprises the hero's discipline strip on a dark ground, which closes the loop
 * on the page: the same four words that opened it, now over the CTA, and
 * arriving the same way, one word at a time.
 *
 * Both actions are mailto links. There is no form because there is no server -
 * this is a static export on shared hosting, so a form would need a standalone
 * PHP endpoint that does not exist yet.
 */
const strip: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}

const word: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

export function Contact() {
  return (
    <section
      id="contact"
      className="bg-night py-[clamp(96px,12vw,160px)] text-night-fg"
    >
      <Container className="max-w-[1000px] text-center">
        <motion.div
          variants={strip}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
          className="flex flex-wrap justify-center gap-[14px] font-mono text-[11px] font-medium tracking-[0.22em] text-oxblood-lift uppercase"
        >
          {contact.disciplines.map((item, index) => (
            <React.Fragment key={item}>
              {index > 0 && (
                <motion.span variants={word} className="text-night-fg/30">
                  ·
                </motion.span>
              )}
              <motion.span variants={word}>{item}</motion.span>
            </React.Fragment>
          ))}
        </motion.div>

        <h2
          data-reveal="80"
          className="mt-7 text-[clamp(32px,4.4vw,60px)] leading-[1.06] font-semibold tracking-[-0.03em] text-balance"
        >
          {contact.heading}
        </h2>

        <p
          data-reveal="140"
          className="mx-auto mt-[26px] max-w-[52ch] text-[16.5px] leading-[1.65] text-pretty text-night-muted"
        >
          {contact.body}
        </p>

        <div
          data-reveal="200"
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
