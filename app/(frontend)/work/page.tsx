import type { Metadata } from "next"

import { OG_IMAGE, pageMetadata } from "@/lib/metadata"
import { itemList } from "@/lib/schema"

import { StoryCard } from "@/components/cms-cards"
import { JsonLd } from "@/components/json-ld"
import { PageClose, PageHeader, PageShell } from "@/components/page-shell"
import { Container, sectionPadding } from "@/components/primitives"
import { FlowRule } from "@/components/scroll-motion"
import { Stagger } from "@/components/stagger"
import { workPage } from "@/content/pages"
import { getStories } from "@/lib/cms"

export const metadata: Metadata = pageMetadata({
  ...workPage.seo,
  path: "/work/",
  image: {
    url: "/work/og.png",
    ...OG_IMAGE,
    alt: workPage.header.heading,
  },
})

export const revalidate = 60

/**
 * /work
 *
 * Every published client story, newest first, each card carrying the
 * client, what was achieved and its two headline figures. The homepage's
 * "Selected client work" section is the curated three; this is all of them.
 */
export default async function WorkIndex() {
  const stories = await getStories()

  return (
    <PageShell>
      <JsonLd
        data={itemList({
          name: workPage.seo.title,
          description: workPage.seo.description,
          path: "/work/",
          items: stories.map((story) => ({
            name: `${story.client}: ${story.title}`,
            path: `/work/${story.slug}/`,
          })),
        })}
      />

      <PageHeader content={workPage.header}>
        <p
          data-reveal="240"
          data-flow="left"
          className="mt-8 font-mono text-[11px] tracking-[0.18em] text-ink-faint uppercase"
        >
          {stories.length === 0
            ? workPage.emptyCount
            : `${stories.length} ${stories.length === 1 ? "story" : "stories"}`}
        </p>
      </PageHeader>

      <section className={`relative ${sectionPadding}`}>
        <Container>
          {stories.length === 0 ? (
            <div data-reveal="0" data-flow="left" className="max-w-[58ch]">
              <h2 className="text-[clamp(24px,2.8vw,36px)] leading-[1.1] font-semibold tracking-[-0.03em] text-balance">
                {workPage.empty.heading}
              </h2>
              <p className="mt-5 text-[16px] leading-[1.7] text-pretty text-ink-soft">
                {workPage.empty.body}
              </p>
            </div>
          ) : (
            <Stagger
              as="ul"
              from="fade"
              step={0.09}
              className="grid list-none grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-px border border-rule bg-rule"
            >
              {stories.map((story) => (
                <li key={story.id} data-stagger className="bg-paper">
                  <StoryCard story={story} />
                </li>
              ))}
            </Stagger>
          )}
        </Container>
        <FlowRule />
      </section>

      <PageClose content={workPage.close} />
    </PageShell>
  )
}
