import { Container, Kicker, outlineButton } from "@/components/primitives"
import { careers } from "@/content/site"

/** Careers - a short band with the CTA pulled out to the right edge. */
export function Careers() {
  return (
    <section
      id="careers"
      className="border-b border-rule py-[clamp(72px,8vw,110px)]"
    >
      <Container className="flex flex-wrap items-center justify-between gap-10">
        <div data-reveal="0" className="max-w-[640px]">
          <Kicker>{careers.kicker}</Kicker>
          <h2 className="mt-[18px] text-[clamp(26px,3vw,40px)] leading-[1.1] font-semibold tracking-[-0.025em] text-balance">
            {careers.heading}
          </h2>
          <p className="mt-[18px] text-[15.5px] leading-[1.6] text-pretty text-ink-soft">
            {careers.body}
          </p>
        </div>
        <a
          data-reveal="100"
          href={careers.cta.href}
          className={`${outlineButton} px-[30px] py-[15px] whitespace-nowrap`}
        >
          {careers.cta.label}&nbsp;&nbsp;→
        </a>
      </Container>
    </section>
  )
}
