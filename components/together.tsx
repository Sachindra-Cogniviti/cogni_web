import { Container, Kicker, solidButton } from "@/components/primitives"
import { FlowRule, ScrollWords } from "@/components/scroll-motion"
import { together } from "@/content/site"

/**
 * "Products and services, working together" - a narrow centred interlude.
 *
 * The only centred, measure-constrained block on the page. It sits between the
 * two halves of the argument and gives the layout somewhere to breathe before
 * the resources grid, which is why it is deliberately the quietest section
 * here. Its one move is the heading, which brightens a word at a time as the
 * reader scrolls through it (components/scroll-motion.tsx).
 */
export function Together() {
  return (
    <section
      id="together"
      className="relative bg-paper-alt py-[clamp(88px,10vw,130px)]"
    >
      <Container className="max-w-[900px] text-center">
        <Kicker data-reveal="0">{together.kicker}</Kicker>
        <ScrollWords
          as="h2"
          text={together.heading}
          className="mt-[22px] text-[clamp(28px,3.4vw,46px)] leading-[1.1] font-semibold tracking-[-0.03em] text-balance"
        />
        <p
          data-reveal="120"
          className="mx-auto mt-6 max-w-[62ch] text-[16px] leading-[1.65] text-pretty text-ink-soft"
        >
          {together.body}
        </p>
        <div data-reveal="180" className="mt-8">
          <a href={together.cta.href} className={`${solidButton} px-[30px]`}>
            {together.cta.label}
          </a>
        </div>
      </Container>
      <FlowRule />
    </section>
  )
}
