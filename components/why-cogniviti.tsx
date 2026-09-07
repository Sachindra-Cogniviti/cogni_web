import { Container, Kicker, sectionPadding } from "@/components/primitives"
import { why } from "@/content/site"

/**
 * Why Cogniviti Labs.
 *
 * Carries the second Newsreader italic accent - "between" - which is the whole
 * argument of the section compressed into one word, and pays off the same
 * device introduced in the hero.
 *
 * The four pillars open with a 2px ink rule rather than sitting in bordered
 * boxes. It is a lighter treatment than the services grid on purpose: these
 * are positioning statements, not a service catalogue, and they should not
 * compete with it.
 */
export function WhyCogniviti() {
  return (
    <section id="why" className={`border-b border-rule ${sectionPadding}`}>
      <Container>
        <div data-reveal="0" className="max-w-[760px]">
          <Kicker>{why.kicker}</Kicker>
          <h2 className="mt-5 text-[clamp(32px,3.8vw,54px)] leading-[1.05] font-semibold tracking-[-0.03em] text-balance">
            {why.heading.before}
            <em className="font-serif font-medium tracking-[-0.015em] text-oxblood">
              {why.heading.accent}
            </em>
            {why.heading.after}
          </h2>
          <p className="mt-6 text-[16.5px] leading-[1.65] text-pretty text-ink-soft">
            {why.body}
          </p>
        </div>

        <div
          data-reveal="120"
          className="mt-16 grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-[clamp(28px,3vw,44px)]"
        >
          {why.pillars.map((pillar) => (
            <div key={pillar.title} className="border-t-2 border-ink pt-[22px]">
              <div className="text-[17px] leading-[1.3] font-semibold tracking-[-0.01em]">
                {pillar.title}
              </div>
              <p className="mt-3 text-[14px] leading-[1.6] text-pretty text-ink-muted">
                {pillar.body}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
