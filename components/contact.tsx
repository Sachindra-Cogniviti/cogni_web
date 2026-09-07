import * as React from "react"

import { Container } from "@/components/primitives"
import { contact, site } from "@/content/site"

/**
 * Closing contact section.
 *
 * Reprises the hero's discipline strip on a dark ground, which closes the loop
 * on the page: the same four words that opened it, now over the CTA.
 *
 * Both actions are mailto links. There is no form because there is no server -
 * this is a static export on shared hosting, so a form would need a standalone
 * PHP endpoint that does not exist yet.
 */
export function Contact() {
  return (
    <section
      id="contact"
      className="bg-night py-[clamp(96px,12vw,160px)] text-night-fg"
    >
      <Container className="max-w-[1000px] text-center">
        <div
          data-reveal="0"
          className="flex flex-wrap justify-center gap-[14px] font-mono text-[11px] font-medium tracking-[0.22em] text-oxblood-lift uppercase"
        >
          {contact.disciplines.map((word, index) => (
            <React.Fragment key={word}>
              {index > 0 && <span className="text-night-fg/30">·</span>}
              <span>{word}</span>
            </React.Fragment>
          ))}
        </div>

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
                  ? "rounded-[2px] bg-night-fg px-[30px] py-[15px] text-[15px] font-medium text-ink transition-colors duration-200 hover:bg-oxblood-lift"
                  : "rounded-[2px] border border-night-fg/35 px-[30px] py-[14px] text-[15px] font-medium text-night-fg transition-colors duration-200 hover:border-oxblood-lift hover:text-oxblood-lift"
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
