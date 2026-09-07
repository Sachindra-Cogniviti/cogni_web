import {
  Container,
  Kicker,
  QuietLink,
  sectionPadding,
} from "@/components/primitives"
import { clientWork } from "@/content/site"

/**
 * Selected client work.
 *
 * Full-width rows rather than a card grid. Each story is a two-column split -
 * numbered title and capability tags on the left, narrative and the read link
 * on the right - and the whole row is one link target, so the hover fill reads
 * as a single object rather than a card with a button in it.
 */
export function ClientWork() {
  return (
    <section id="work" className={`border-b border-rule ${sectionPadding}`}>
      <Container>
        <div data-reveal="0">
          <Kicker>{clientWork.kicker}</Kicker>
          <h2 className="mt-5 text-[clamp(32px,3.8vw,54px)] leading-[1.05] font-semibold tracking-[-0.03em] text-balance">
            {clientWork.heading}
          </h2>
        </div>

        <div className="mt-14 border-t border-rule-strong">
          {clientWork.stories.map((story) => (
            <a
              key={story.num}
              href={story.href}
              data-reveal="0"
              className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-[clamp(24px,4vw,64px)] border-b border-rule-strong py-11 text-ink transition-colors duration-[250ms] hover:bg-paper-soft"
            >
              <div className="flex gap-6">
                <span className="pt-2 font-mono text-[12px] text-oxblood">
                  {story.num}
                </span>
                <div>
                  <h3 className="max-w-[20ch] text-[clamp(24px,2.8vw,38px)] leading-[1.12] font-semibold tracking-[-0.025em] text-balance">
                    {story.title}
                  </h3>
                  <div className="mt-[18px] flex flex-wrap gap-2">
                    {story.tags.map((tag) => (
                      <span
                        key={tag}
                        className="border border-rule-strong px-[10px] py-[5px] font-mono text-[10.5px] tracking-[0.08em] text-ink-muted uppercase"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-between gap-5">
                <p className="max-w-[52ch] text-[15.5px] leading-[1.65] text-pretty text-ink-soft">
                  {story.body}
                </p>
                <div className="text-[14.5px] font-medium text-oxblood">
                  {clientWork.readLabel}&nbsp;&nbsp;→
                </div>
              </div>
            </a>
          ))}
        </div>

        <div data-reveal="0" className="mt-11">
          <QuietLink href={clientWork.cta.href}>
            {clientWork.cta.label}&nbsp;&nbsp;→
          </QuietLink>
        </div>
      </Container>
    </section>
  )
}
