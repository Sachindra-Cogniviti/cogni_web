import { Container, Kicker, sectionPadding } from "@/components/primitives"
import { FlowRule, Parallax } from "@/components/scroll-motion"
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
 * through the gaps between them as the section scrolls through the
 * viewport, with a marker landing on the crossing once it is drawn
 * (components/why-motion.tsx). The thread follows the scroll rather than a
 * timer, so it draws at the reader's pace.
 *
 * The four pillars follow, numbered, resolving one after another as the row
 * rises, each opening with a rule that draws in from the left.
 */
export function WhyCogniviti() {
  return (
    <section id="why" className={`relative ${sectionPadding}`}>
      <Container>
        <div className="grid gap-x-[clamp(40px,6vw,96px)] gap-y-12 lg:grid-cols-[minmax(0,11fr)_minmax(0,9fr)] lg:items-center">
          <Parallax y={20}>
          <div>
            <Kicker data-reveal="0" data-flow="left">
              {why.kicker}
            </Kicker>
            <h2
              data-reveal="60"
              data-flow="left"
              className="mt-5 text-[clamp(32px,3.8vw,54px)] leading-[1.05] font-semibold tracking-[-0.03em] text-balance"
            >
              {why.heading.before}
              <em className="font-serif font-medium tracking-[-0.015em] text-oxblood">
                {why.heading.accent}
              </em>
              {why.heading.after}
            </h2>
            <p
              data-reveal="120"
              data-flow="left"
              className="mt-6 max-w-[54ch] text-[16.5px] leading-[1.65] text-pretty text-ink-soft"
            >
              {why.body}
            </p>
          </div>
          </Parallax>

          <Parallax y={-14}>
            <WhyMap />
          </Parallax>
        </div>

        <Stagger
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
      <FlowRule />
    </section>
  )
}
