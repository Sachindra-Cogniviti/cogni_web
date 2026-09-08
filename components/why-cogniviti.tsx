import { Container, Kicker, sectionPadding } from "@/components/primitives"
import { Stagger } from "@/components/stagger"
import { PillarRule, WhyMap } from "@/components/why-motion"
import { why } from "@/content/site"

/**
 * Why Cogniviti Labs.
 *
 * Carries the second Newsreader italic accent - "between" - which is the whole
 * argument of the section compressed into one word, and pays off the same
 * device introduced in the hero.
 *
 * The argument is then drawn rather than restated: the six things enterprise
 * programs break between (processes, data, integrations, controls, users,
 * ownership) sit as tiles in a grid, and an oxblood thread draws itself
 * through the gaps between them once the section scrolls into view, with a
 * marker at the crossing (components/why-motion.tsx).
 *
 * The four pillars follow, numbered, rising in 70ms apart, each opening with
 * a rule that draws in from the left.
 */
export function WhyCogniviti() {
  return (
    <section id="why" className={`border-b border-rule ${sectionPadding}`}>
      <Container>
        <div className="grid gap-x-[clamp(40px,6vw,96px)] gap-y-12 lg:grid-cols-[minmax(0,11fr)_minmax(0,9fr)] lg:items-center">
          <div data-reveal="0">
            <Kicker>{why.kicker}</Kicker>
            <h2 className="mt-5 text-[clamp(32px,3.8vw,54px)] leading-[1.05] font-semibold tracking-[-0.03em] text-balance">
              {why.heading.before}
              <em className="font-serif font-medium tracking-[-0.015em] text-oxblood">
                {why.heading.accent}
              </em>
              {why.heading.after}
            </h2>
            <p className="mt-6 max-w-[54ch] text-[16.5px] leading-[1.65] text-pretty text-ink-soft">
              {why.body}
            </p>
          </div>

          <WhyMap />
        </div>

        <Stagger
          step={0.07}
          className="mt-[clamp(56px,7vw,96px)] grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-x-[clamp(28px,3vw,44px)] gap-y-10"
        >
          {why.pillars.map((pillar, i) => (
            <div key={pillar.title} data-stagger className="relative pt-[22px]">
              <PillarRule index={i} />
              <div className="font-mono text-[11px] text-oxblood">{String(i + 1).padStart(2, "0")}</div>
              <div className="mt-3 text-[17px] leading-[1.3] font-semibold tracking-[-0.01em]">
                {pillar.title}
              </div>
              <p className="mt-3 text-[14px] leading-[1.6] text-pretty text-ink-muted">
                {pillar.body}
              </p>
            </div>
          ))}
        </Stagger>
      </Container>
    </section>
  )
}
