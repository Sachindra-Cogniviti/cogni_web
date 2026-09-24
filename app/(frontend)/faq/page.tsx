import type { Metadata } from "next"

import { JsonLd } from "@/components/json-ld"
import { PageClose, PageHeader, PageShell } from "@/components/page-shell"
import { Container, Corners } from "@/components/primitives"
import { FlowRule } from "@/components/scroll-motion"
import { Stagger } from "@/components/stagger"
import { faqPage } from "@/content/pages"
import { OG_IMAGE, pageMetadata } from "@/lib/metadata"
import { faqPage as faqSchema } from "@/lib/schema"

export const metadata: Metadata = pageMetadata({
  ...faqPage.seo,
  path: "/faq/",
  image: {
    url: "/faq/og.png",
    ...OG_IMAGE,
    alt: faqPage.header.heading,
  },
})

/**
 * /faq
 *
 * Buyer questions, answered in full on the page. Every question in the
 * FAQPage structured data is rendered here in visible text - see the note in
 * content/pages.ts about why that is not optional.
 *
 * Numbered on a spine, the device the site already uses for an ordered set
 * (the careers tracks, the delivery stages). A disclosure widget would have
 * hidden the answers behind a click, which is wrong for a page whose whole
 * job is to be read by someone evaluating a supplier - and wrong for a page
 * that tells a crawler those answers are present.
 */
export default function Faq() {
  const items = faqPage.items

  return (
    <PageShell>
      <JsonLd
        data={faqSchema({
          name: faqPage.seo.title,
          description: faqPage.seo.description,
          path: "/faq/",
          items: items.map((item) => ({
            question: item.question,
            // The whole answer, in the order the page renders it, so the
            // structured text and the visible text say the same thing.
            answer: [
              ...item.answer,
              ...("list" in item ? item.list : []),
              ...("after" in item ? item.after : []),
            ],
          })),
        })}
      />

      <PageHeader content={faqPage.header} />

      <section className="relative pb-[clamp(72px,8vw,120px)]">
        <Container>
          <Stagger as="ol" step={0.1} className="list-none border-t border-rule">
            {items.map((item, index) => (
              <li
                key={item.question}
                data-stagger
                className="grid gap-x-10 gap-y-4 border-b border-rule py-9 md:grid-cols-[64px_minmax(0,1fr)]"
              >
                <span className="font-mono text-[11px] tracking-[0.14em] text-oxblood">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div className="min-w-0">
                  <h2 className="max-w-[46ch] text-[clamp(19px,2vw,24px)] leading-[1.2] font-semibold tracking-[-0.02em] text-balance">
                    {item.question}
                  </h2>

                  <div className="mt-5 flex flex-col gap-4">
                    {item.answer.map((paragraph) => (
                      <p
                        key={paragraph}
                        className="max-w-[64ch] text-[15.5px] leading-[1.7] text-pretty text-ink-soft"
                      >
                        {paragraph}
                      </p>
                    ))}

                    {"list" in item && (
                      <ul className="flex list-none flex-col gap-2.5">
                        {item.list.map((entry) => (
                          <li
                            key={entry}
                            className="relative max-w-[64ch] pl-5 text-[15px] leading-[1.6] text-pretty text-ink-soft"
                          >
                            <span
                              aria-hidden="true"
                              className="absolute top-[11px] left-0 h-px w-2.5 bg-oxblood"
                            />
                            {entry}
                          </li>
                        ))}
                      </ul>
                    )}

                    {"after" in item &&
                      item.after.map((paragraph) => (
                        <p
                          key={paragraph}
                          className="max-w-[64ch] text-[15.5px] leading-[1.7] text-pretty text-ink-soft"
                        >
                          {paragraph}
                        </p>
                      ))}
                  </div>
                </div>
              </li>
            ))}
          </Stagger>

          {/* The one place the FAQ points a reader who is now convinced. */}
          <div
            data-reveal="0"
            data-flow="fade"
            className="relative mt-12 border border-rule bg-paper-alt p-8"
          >
            <Corners />
            <p className="max-w-[60ch] text-[15.5px] leading-[1.7] text-pretty text-ink-soft">
              Data quality is the part most evaluations underweight. Ours is{" "}
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- a full page load by design: the scroll flow binds on load (components/reveal-observer.tsx), so page links are plain anchors site-wide */}
              <a
                href="/products/master-data-management/"
                className="control-motion border-b border-oxblood/35 pb-[2px] font-medium text-oxblood hover:border-ink/35 hover:text-ink"
              >
                Master Data Management
              </a>
              , and it is the reason platform delivery and data readiness are
              one conversation here rather than two suppliers.
            </p>
          </div>
        </Container>
        <FlowRule />
      </section>

      <PageClose content={faqPage.close} />
    </PageShell>
  )
}
