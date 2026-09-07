import {
  Container,
  Kicker,
  QuietLink,
  sectionPadding,
} from "@/components/primitives"
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
 * The #platforms anchor lives on the experience block rather than the section,
 * because that is what the nav link is pointing at.
 */
export function PlatformServices() {
  return (
    <section id="services" className={`border-b border-rule ${sectionPadding}`}>
      <Container>
        <div data-reveal="0">
          <Kicker>{services.kicker}</Kicker>
          <div className="mt-5 flex flex-wrap items-end justify-between gap-8">
            <h2 className="max-w-[17ch] text-[clamp(32px,3.8vw,54px)] leading-[1.05] font-semibold tracking-[-0.03em] text-balance">
              {services.heading}
            </h2>
            <p className="max-w-[42ch] text-[15.5px] leading-[1.6] text-pretty text-ink-soft">
              {services.body}
            </p>
          </div>
        </div>

        <div
          data-reveal="120"
          className="mt-16 grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] border-t border-l border-t-rule-strong border-l-rule"
        >
          {services.stages.map((stage) => (
            <div
              key={stage.num}
              className="relative border-r border-b border-rule px-6 pt-7 pb-8 transition-colors duration-[250ms] hover:bg-paper-soft"
            >
              {/* Short oxblood tick riding the top rule, marking each cell. */}
              <div className="absolute top-[-1px] left-0 h-[2px] w-9 bg-oxblood" />
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
        </div>

        <div
          id="platforms"
          data-reveal="160"
          className="mt-16 grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-[clamp(24px,4vw,64px)]"
        >
          {services.experience.map((group) => (
            <div key={group.label} className="border-t border-rule-strong pt-5">
              <div className="font-mono text-[11px] tracking-[0.2em] text-ink-faint uppercase">
                {group.label}
              </div>
              <div className="mt-4 flex flex-wrap gap-[10px]">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="rounded-[2px] border border-rule-strong px-[18px] py-[9px] text-[14.5px] font-medium"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div data-reveal="200" className="mt-12">
          <QuietLink href={services.cta.href}>
            {services.cta.label}&nbsp;&nbsp;→
          </QuietLink>
        </div>
      </Container>
    </section>
  )
}
