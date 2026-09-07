import {
  Container,
  Kicker,
  QuietLink,
  sectionPadding,
} from "@/components/primitives"
import { resources } from "@/content/site"

/**
 * Resources.
 *
 * PLACEHOLDER: the three image wells are hatched slots, each captioned with
 * the art direction it is waiting for ("editorial photo — data
 * infrastructure"). The brief was explicit about what this photography must
 * not be - no stock boardrooms, no handshakes, no teams pointing at laptops -
 * so the caption records the intent rather than letting a stand-in image set
 * the wrong expectation. Swap `image` in content/site.ts for { src, alt }.
 */
export function Resources() {
  return (
    <section
      id="resources"
      className={`border-b border-rule ${sectionPadding}`}
    >
      <Container>
        <div
          data-reveal="0"
          className="flex flex-wrap items-end justify-between gap-8"
        >
          <div>
            <Kicker>{resources.kicker}</Kicker>
            <h2 className="mt-5 text-[clamp(32px,3.6vw,50px)] leading-[1.06] font-semibold tracking-[-0.03em] text-balance">
              {resources.heading}
            </h2>
          </div>
          <p className="max-w-[42ch] text-[15.5px] leading-[1.6] text-pretty text-ink-soft">
            {resources.body}
          </p>
        </div>

        <div
          data-reveal="120"
          className="mt-[52px] grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6"
        >
          {resources.items.map((item) => (
            <a
              key={item.title}
              href={item.href}
              className="flex flex-col overflow-hidden rounded-[3px] border border-rule text-ink transition-[border-color,transform] duration-[250ms] hover:-translate-y-[3px] hover:border-oxblood motion-reduce:hover:translate-y-0"
            >
              <div className="placeholder-hatch-lg flex h-40 items-center justify-center border-b border-rule font-mono text-[10.5px] tracking-[0.12em] text-ink-ghost uppercase">
                {item.image}
              </div>
              <div className="flex flex-1 flex-col gap-3 px-6 pt-6 pb-7">
                <div className="font-mono text-[10.5px] tracking-[0.16em] text-oxblood uppercase">
                  {item.eyebrow}
                </div>
                <div className="text-[18.5px] leading-[1.3] font-semibold tracking-[-0.015em] text-balance">
                  {item.title}
                </div>
                <div className="mt-auto text-[14px] font-medium text-oxblood">
                  {resources.readLabel}&nbsp;&nbsp;→
                </div>
              </div>
            </a>
          ))}
        </div>

        <div data-reveal="160" className="mt-10">
          <QuietLink href={resources.cta.href}>
            {resources.cta.label}&nbsp;&nbsp;→
          </QuietLink>
        </div>
      </Container>
    </section>
  )
}
