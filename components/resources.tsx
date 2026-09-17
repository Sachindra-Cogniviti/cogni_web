import Image from "next/image"

import {
  Container,
  Kicker,
  QuietLink,
  Roll,
  sectionPadding,
} from "@/components/primitives"
import { FlowRule, Parallax } from "@/components/scroll-motion"
import { Stagger } from "@/components/stagger"
import { resources } from "@/content/site"

/**
 * One card on the resources row. `image` is either a real picture or the
 * caption of the hatched slot that stands in for one.
 */
export type ResourceItem = {
  eyebrow: string
  title: string
  href: string
  image: string | { src: string; alt: string; width: number; height: number }
}

/**
 * Resources: the three most recent blog posts.
 *
 * The cards are handed in by the homepage, which reads them from Payload
 * (lib/cms.ts), so a post published in the admin appears here within a
 * minute. When nothing is published the three placeholder cards in
 * content/site.ts stand in, so the section never renders empty.
 *
 * A card with a cover shows it; one without gets the hatched slot, captioned
 * with the art direction it is waiting for. The brief was explicit about
 * what this photography must not be - no stock boardrooms, no handshakes,
 * no teams pointing at laptops - so the caption records the intent rather
 * than letting a stand-in image set the wrong expectation.
 *
 * The three cards resolve one after another as the row rises
 * (components/stagger.tsx) rather than landing as one block, matching the
 * logo wall and the Why tiles. After that each runs at its own rate against
 * the scroll, the third fastest, so the row never sits quite flat.
 */
export function Resources({
  items = resources.items,
}: {
  items?: readonly ResourceItem[]
}) {
  return (
    <section id="resources" className={`relative ${sectionPadding}`}>
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <Kicker data-reveal="0" data-flow="left">
              {resources.kicker}
            </Kicker>
            <h2
              data-reveal="60"
              data-flow="left"
              className="mt-5 text-[clamp(32px,3.6vw,50px)] leading-[1.06] font-semibold tracking-[-0.03em] text-balance"
            >
              {resources.heading}
            </h2>
          </div>
          <p
            data-reveal="120"
            data-flow="right"
            className="max-w-[42ch] text-[15.5px] leading-[1.6] text-pretty text-ink-soft"
          >
            {resources.body}
          </p>
        </div>

        <Stagger className="mt-[52px] grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
          {items.map((item, index) => (
            <Parallax
              key={item.href}
              y={[10, 24, 40][index] ?? 10}
              className="flex"
            >
              <a
                href={item.href}
                data-stagger
                // The lift is written as `transform` rather than a
                // translate utility: the scroll flow owns the independent
                // `translate` property on this card, and the two would
                // otherwise overwrite each other.
                className="group flex flex-1 flex-col overflow-hidden rounded-[3px] border border-rule text-ink transition-[border-color,transform] duration-[var(--roll-duration)] ease-[var(--roll-ease)] hover:[transform:translateY(-3px)] hover:border-oxblood active:scale-[0.985] active:[transform:none] active:duration-100 motion-reduce:hover:[transform:none]"
              >
                {typeof item.image === "string" ? (
                  <div className="placeholder-hatch-lg flex h-40 items-center justify-center border-b border-rule font-mono text-[10.5px] tracking-[0.12em] text-ink-ghost uppercase">
                    {item.image}
                  </div>
                ) : (
                  <div className="relative h-40 overflow-hidden border-b border-rule">
                    <Image
                      src={item.image.src}
                      alt={item.image.alt}
                      width={item.image.width}
                      height={item.image.height}
                      sizes="(min-width: 1024px) 400px, 100vw"
                      className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(.23,1,.32,1)] group-hover:scale-[1.03] motion-reduce:group-hover:scale-100"
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col gap-3 px-6 pt-6 pb-7">
                  <div className="font-mono text-[10.5px] tracking-[0.16em] text-oxblood uppercase">
                    {item.eyebrow}
                  </div>
                  <div className="text-[18.5px] leading-[1.3] font-semibold tracking-[-0.015em] text-balance">
                    {item.title}
                  </div>
                  <div className="mt-auto text-[14px] font-medium text-oxblood">
                    <Roll>{resources.readLabel}&nbsp;&nbsp;→</Roll>
                  </div>
                </div>
              </a>
            </Parallax>
          ))}
        </Stagger>

        <div data-reveal="160" data-flow="left" className="mt-10">
          <QuietLink href={resources.cta.href}>
            {resources.cta.label}&nbsp;&nbsp;→
          </QuietLink>
        </div>
      </Container>
      <FlowRule />
    </section>
  )
}
