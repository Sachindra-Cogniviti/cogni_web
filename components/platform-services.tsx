import { ExperienceRows } from "@/components/experience-rows"
import {
  Container,
  Kicker,
  QuietLink,
  sectionPadding,
} from "@/components/primitives"
import { FlowRule, Parallax } from "@/components/scroll-motion"
import { Stagger } from "@/components/stagger"
import { services } from "@/content/site"

/**
 * Platform services: the five delivery stages, then the platform and
 * integration experience lists.
 *
 * The stage grid uses uniform cells with hairlines on every edge. An earlier
 * version padded cells asymmetrically, which looked fine on one row and fell
 * apart the moment the grid wrapped - rows no longer lined up with each other.
 * Uniform padding plus borders on all four sides survives any wrap.
 *
 * The stage cells resolve one after another as the row rises through the
 * viewport (components/stagger.tsx) instead of arriving as a block.
 *
 * The experience lists are their own file. They hold open/closed state for the
 * detail panels, so they are a client component, and keeping them separate
 * leaves this section — the heading, the stage grid, the CTA — on the server.
 * It also keeps the platform logo imports out of the client bundle boundary of
 * anything else. The #platforms anchor the nav points at lives there with
 * them.
 */
export function PlatformServices() {
  return (
    <section id="services" className={`relative ${sectionPadding}`}>
      <Container>
        <Parallax y={16}>
          <div>
            <Kicker data-reveal="0" data-flow="left">
              {services.kicker}
            </Kicker>
            <div className="mt-5 flex flex-wrap items-end justify-between gap-8">
              <h2
                data-reveal="60"
                data-flow="left"
                className="max-w-[17ch] text-[clamp(32px,3.8vw,54px)] leading-[1.05] font-semibold tracking-[-0.03em] text-balance"
              >
                {services.heading}
              </h2>
              <p
                data-reveal="120"
                data-flow="left"
                className="max-w-[42ch] text-[15.5px] leading-[1.6] text-pretty text-ink-soft"
              >
                {services.body}
              </p>
            </div>
          </div>
        </Parallax>

        <Stagger
          from="fade"
          step={0.11}
          className="mt-16 grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] border-t border-l border-t-rule-strong border-l-rule"
        >
          {services.stages.map((stage) => (
            <div
              key={stage.num}
              data-stagger
              className="group relative border-r border-b border-rule px-6 pt-7 pb-8 transition-colors duration-[250ms] hover:bg-paper-soft"
            >
              {/* Short oxblood tick riding the top rule, marking each cell. On
                  hover a second line grows from it across the whole cell: a
                  transform, not a width, so it costs nothing to animate. */}
              <div className="absolute top-[-1px] left-0 h-[2px] w-9 bg-oxblood" />
              <div className="absolute top-[-1px] left-0 h-[2px] w-full origin-left scale-x-0 bg-oxblood transition-transform duration-300 ease-[cubic-bezier(.23,1,.32,1)] group-hover:scale-x-100 motion-reduce:transition-none" />
              <div className="font-mono text-[11px] text-oxblood">
                {stage.num}
              </div>
              <div className="mt-[14px] text-[17px] leading-[1.25] font-semibold tracking-[-0.01em]">
                {stage.title}
              </div>
              <p className="mt-[10px] text-[13.5px] leading-[1.6] text-pretty text-ink-muted">
                {stage.body}
              </p>
            </div>
          ))}
        </Stagger>

        <ExperienceRows />

        <div data-reveal="200" data-flow="left" className="mt-12">
          <QuietLink href={services.cta.href}>
            {services.cta.label}&nbsp;&nbsp;→
          </QuietLink>
        </div>
      </Container>
      <FlowRule />
    </section>
  )
}
