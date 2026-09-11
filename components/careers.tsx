import { Container, Kicker, outlineButton } from "@/components/primitives"
import { FlowRule, Parallax } from "@/components/scroll-motion"
import { careers } from "@/content/site"

/** Careers - a short band with the CTA pulled out to the right edge. */
export function Careers() {
  return (
    <section
      id="careers"
      className="relative py-[clamp(72px,8vw,110px)]"
    >
      <Container className="flex flex-wrap items-center justify-between gap-10">
        <Parallax y={12} className="max-w-[640px]">
        <div>
          <Kicker data-reveal="0" data-flow="left">
            {careers.kicker}
          </Kicker>
          <h2
            data-reveal="60"
            data-flow="left"
            className="mt-[18px] text-[clamp(26px,3vw,40px)] leading-[1.1] font-semibold tracking-[-0.025em] text-balance"
          >
            {careers.heading}
          </h2>
          <p
            data-reveal="120"
            data-flow="left"
            className="mt-[18px] text-[15.5px] leading-[1.6] text-pretty text-ink-soft"
          >
            {careers.body}
          </p>
        </div>
        </Parallax>
        <Parallax y={-14}>
        <a
          data-reveal="180"
          data-flow="right"
          href={careers.cta.href}
          className={`${outlineButton} px-[30px] py-[15px] whitespace-nowrap`}
        >
          {careers.cta.label}&nbsp;&nbsp;→
        </a>
        </Parallax>
      </Container>
      <FlowRule />
    </section>
  )
}
