import type { Metadata } from "next"
import { draftMode } from "next/headers"
import Image from "next/image"
import { notFound } from "next/navigation"

import { ArticleNav } from "@/components/article-nav"
import { DraftPreview } from "@/components/draft-preview"
import { PageClose, PageHeader, PageShell } from "@/components/page-shell"
import {
  Container,
  Corners,
  Kicker,
  Roll,
  sectionPadding,
} from "@/components/primitives"
import { Article } from "@/components/rich-text"
import { FlowRule } from "@/components/scroll-motion"
import { ShareRow } from "@/components/share-row"
import { Stagger } from "@/components/stagger"
import { workPage } from "@/content/pages"
import {
  deliveryPath,
  formatDate,
  getPosts,
  getStories,
  getStory,
  imageSource,
  mediaOf,
  PLATFORM_LABEL,
  REGION_LABEL,
} from "@/lib/cms"
import { publicSiteUrl } from "@/lib/deployment"
import { headingsOf, type Heading } from "@/lib/headings"
import { OG_IMAGE, pageMetadata } from "@/lib/metadata"
import type { ClientStory, Post } from "@/payload-types"

export const revalidate = 60

export async function generateStaticParams() {
  const stories = await getStories()
  return stories.map((story) => ({ slug: story.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const { isEnabled: draft } = await draftMode()
  const story = await getStory(slug, { draft })
  if (!story) return {}
  const chosen = mediaOf(story.meta?.image)
  const image = chosen ? imageSource(chosen, "cover") : null
  return pageMetadata({
    title: story.meta?.title ?? `${story.client}: ${story.title}`,
    description: story.meta?.description ?? story.excerpt,
    path: `/work/${slug}/`,
    article: {
      publishedTime: story.publishedAt,
      modifiedTime: story.updatedAt,
      section: story.sector ?? undefined,
      tags: (story.platform ?? []).map((p) => PLATFORM_LABEL[p]),
    },
    image: image
      ? {
          url: image.src,
          width: image.width,
          height: image.height,
          alt: chosen?.alt ?? undefined,
        }
      : {
          url: `/work/${slug}/og.png?v=${Date.parse(story.updatedAt)}`,
          ...OG_IMAGE,
          alt: `${story.client}: ${story.title}`,
        },
  })
}

/**
 * /work/[slug]
 *
 * The three beats every case study needs, in the order a prospect reads
 * them: the figures first, because they are what the reader came for; then
 * challenge, approach and outcomes as numbered stages on a spine, the same
 * device the homepage's story uses for a causal chain; then whatever
 * long-form detail the story carries.
 *
 * The story runs in a reading column with a rail beside it: the other
 * stories and the latest insights, so a reader who finishes has somewhere
 * to go without scrolling to a footer, and the column is not a text
 * measure alone on a wide page. The rail sticks on large screens and
 * follows the story on small ones.
 *
 * Nothing tall carries `data-reveal`. The scroll flow needs a share of an
 * element on screen before it plays and fades it back out below that
 * share, and an article taller than the viewport never reaches it - or
 * fades while it is being read. The beats and the rail's blocks reveal;
 * the article is simply there.
 */
export default async function StoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  // Draft mode is the preview (lib/preview.ts): the latest draft in place
  // of the published version, on this same page, for a signed-in editor.
  const { isEnabled: draft } = await draftMode()
  const story = await getStory(slug, { draft })
  if (!story) notFound()

  const logo = mediaOf(story.logo)
  const logoImage = logo ? imageSource(logo, "thumbnail") : null
  const platforms = (story.platform ?? []).map((p) => PLATFORM_LABEL[p])
  const regions = (story.region ?? []).map((r) => REGION_LABEL[r])
  const metrics = story.metrics ?? []
  const path = deliveryPath(story)
  const [others, updates] = await Promise.all([
    getStories(4).then((all) =>
      all.filter((s) => s.id !== story.id).slice(0, 3)
    ),
    getPosts(3),
  ])
  const url = `${publicSiteUrl()}/work/${story.slug}/`

  const beats = [
    {
      id: "challenge",
      num: "01",
      label: workPage.beats.challenge,
      body: story.challenge,
    },
    {
      id: "approach",
      num: "02",
      label: workPage.beats.approach,
      body: story.approach,
    },
  ]

  // The reading pill lists the three beats and then the detail's own
  // headings, and only appears when there is detail to navigate: three
  // beats on their own are shorter than the control.
  const detail = story.body ? headingsOf(story.body) : []
  const headings: Heading[] = detail.length
    ? [
        ...beats.map((beat) => ({
          id: beat.id,
          text: beat.label,
          level: 2 as const,
        })),
        { id: "outcomes", text: workPage.beats.outcomes, level: 2 },
        { id: "detail", text: workPage.detailLabel, level: 2 },
        ...detail.map((h) => ({ ...h, level: 3 as const })),
      ]
    : []

  const facts: { label: string; value: string }[] = []
  if (story.sector)
    facts.push({ label: workPage.facts.sector, value: story.sector })
  if (platforms.length)
    facts.push({ label: workPage.facts.platform, value: platforms.join(", ") })
  if (regions.length)
    facts.push({ label: workPage.facts.region, value: regions.join(", ") })

  return (
    <PageShell>
      <PageHeader
        content={{
          trail: [
            { label: "Home", href: "/" },
            { label: workPage.header.kicker, href: "/work/" },
            { label: story.client },
          ],
          kicker: story.sector ?? workPage.header.kicker,
          heading: story.title,
          body: story.excerpt,
        }}
      >
        <div
          data-reveal="240"
          data-flow="left"
          className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4"
        >
          {logoImage ? (
            <Image
              src={logoImage.src}
              alt={logo?.alt ?? story.client}
              width={logoImage.width}
              height={logoImage.height}
              sizes="160px"
              className="h-9 w-auto"
            />
          ) : (
            <span className="text-[18px] font-semibold tracking-[-0.015em]">
              {story.client}
            </span>
          )}
          <dl className="flex flex-wrap gap-x-8 gap-y-2">
            {facts.map((fact) => (
              <div key={fact.label} className="flex items-baseline gap-3">
                <dt className="font-mono text-[10.5px] tracking-[0.18em] text-ink-faint uppercase">
                  {fact.label}
                </dt>
                <dd className="text-[14px] text-ink">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </PageHeader>

      {metrics.length > 0 && (
        <section className="relative border-y border-rule bg-paper-alt">
          <Container>
            <Stagger
              as="dl"
              from="fade"
              step={0.1}
              className="grid grid-cols-2 gap-px bg-rule lg:grid-cols-4"
              // Four cells at most (the collection caps metrics there); an
              // odd count leaves the last cell to the ground, which reads as
              // intended rather than as a gap.
            >
              {metrics.map((metric, index) => (
                <div
                  key={metric.id ?? index}
                  data-stagger
                  className="relative bg-paper-alt px-[clamp(20px,3vw,40px)] py-[clamp(28px,4vw,52px)]"
                >
                  <Corners />
                  <dd className="font-serif text-[clamp(40px,5vw,72px)] leading-[0.9] font-medium tracking-[-0.04em] text-oxblood italic">
                    {metric.value}
                  </dd>
                  <dt className="mt-4 max-w-[18ch] text-[14px] leading-[1.45] text-ink-muted">
                    {metric.label}
                  </dt>
                </div>
              ))}
            </Stagger>
          </Container>
        </section>
      )}

      <section id="story" className={`relative ${sectionPadding}`}>
        <Container>
          {/* The delivery path, as the homepage draws it: the stages as
              stops on a line that ends at a live Production node. */}
          {path.length > 0 && (
            <div
              data-reveal="0"
              data-flow="left"
              className="mb-[clamp(48px,6vw,80px)]"
            >
              <div className="font-mono text-[10.5px] tracking-[0.2em] text-ink-faint uppercase">
                {workPage.pathLabel}
              </div>
              <ol className="m-0 mt-4 flex list-none flex-wrap items-center gap-y-3">
                {path.map((stop) => (
                  <li key={stop} className="flex items-center">
                    <span className="flex items-center gap-[10px]">
                      <span className="size-[8px] rounded-full border border-oxblood bg-paper" />
                      <span className="font-mono text-[11px] tracking-[0.08em] text-ink-muted uppercase">
                        {stop}
                      </span>
                    </span>
                    <span className="mx-[14px] h-px w-[clamp(18px,3vw,40px)] bg-rule-strong" />
                  </li>
                ))}
                <li className="flex items-center">
                  <span className="flex items-center gap-[10px]">
                    <span className="relative flex size-[10px] items-center justify-center">
                      <span className="work-pulse absolute inset-0 rounded-full bg-oxblood" />
                      <span className="relative size-[10px] rounded-full bg-oxblood" />
                    </span>
                    <span className="font-mono text-[11px] font-medium tracking-[0.08em] text-oxblood uppercase">
                      {workPage.pathEnd}
                    </span>
                  </span>
                </li>
              </ol>
            </div>
          )}

          <div className="grid gap-x-[clamp(32px,5vw,80px)] gap-y-16 lg:grid-cols-[minmax(0,1fr)_minmax(240px,300px)]">
            <div className="min-w-0">
              <ol className="m-0 list-none border-l border-rule-strong pl-0">
                {beats.map((beat, index) => (
                  <Beat
                    key={beat.num}
                    id={beat.id}
                    num={beat.num}
                    label={beat.label}
                  >
                    {/* The story opens on its challenge, so that is where
                        the drop cap goes. */}
                    <p
                      className={`max-w-[62ch] text-[16px] leading-[1.7] text-pretty text-ink-soft ${index === 0 ? "drop-cap" : ""}`}
                    >
                      {beat.body}
                    </p>
                  </Beat>
                ))}
                <Beat
                  id="outcomes"
                  num="03"
                  label={workPage.beats.outcomes}
                  last
                >
                  <ul className="m-0 flex list-none flex-col gap-3">
                    {story.outcomes.map((outcome, index) => (
                      <li
                        key={outcome.id ?? index}
                        className="relative pl-6 text-[16px] leading-[1.6] text-pretty text-ink"
                      >
                        <span
                          aria-hidden="true"
                          className="absolute top-[13px] left-0 h-px w-3 bg-oxblood"
                        />
                        {outcome.text}
                      </li>
                    ))}
                  </ul>
                </Beat>
              </ol>

              {story.body && (
                <div
                  id="detail"
                  className="mt-[clamp(56px,7vw,96px)] scroll-mt-[96px] border-t border-rule pt-[clamp(40px,5vw,64px)]"
                >
                  <Kicker data-reveal="0" data-flow="left">
                    {workPage.detailLabel}
                  </Kicker>
                  <Article body={story.body} className="mt-8 max-w-[72ch]" />
                </div>
              )}

              <ShareRow
                url={url}
                title={`${story.client}: ${story.title}`}
                text={story.excerpt}
                label={workPage.shareLabel}
                className="mt-[clamp(48px,6vw,80px)] max-w-[72ch] border-t border-rule pt-6"
              />

              <div
                data-reveal="0"
                data-flow="left"
                className="mt-10 flex flex-wrap gap-x-8 gap-y-3"
              >
                <a
                  href="/contact?subject=platform-implementation"
                  className="control-motion border-b border-oxblood/35 pb-[3px] text-[15px] font-medium text-oxblood hover:border-ink/35 hover:text-ink"
                >
                  <Roll>{workPage.ctaLabel}&nbsp;&nbsp;&rarr;</Roll>
                </a>
                {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- a full page load by design: the scroll flow binds on load (components/reveal-observer.tsx), so page links are plain anchors site-wide */}
                <a
                  href="/work"
                  className="control-motion border-b border-ink/20 pb-[3px] text-[15px] font-medium text-ink-soft hover:border-oxblood/35 hover:text-oxblood"
                >
                  <Roll>{workPage.allLabel}&nbsp;&nbsp;&rarr;</Roll>
                </a>
              </div>
            </div>

            <Rail others={others} updates={updates} />
          </div>
        </Container>
        <FlowRule />
      </section>

      <PageClose content={workPage.close} />

      <ArticleNav
        target="story"
        headings={headings}
        label={workPage.contentsLabel}
      />

      {draft && <DraftPreview path={`/work/${story.slug}/`} />}
    </PageShell>
  )
}

/**
 * The rail beside the story: the other stories as compact entries with
 * their headline figure, and the latest insights. Sticky from lg, so it
 * keeps pace with a long article; below that it follows the story.
 */
function Rail({ others, updates }: { others: ClientStory[]; updates: Post[] }) {
  if (others.length === 0 && updates.length === 0) return null
  return (
    <aside className="min-w-0 border-t border-rule pt-10 lg:border-t-0 lg:pt-0">
      <div className="flex flex-col gap-12 lg:sticky lg:top-[120px]">
        {others.length > 0 && (
          <div data-reveal="0" data-flow="right">
            <Kicker tone="muted">{workPage.rail.stories}</Kicker>
            <ul className="mt-5 flex list-none flex-col divide-y divide-rule border-y border-rule">
              {others.map((other) => {
                const metric = other.metrics?.[0]
                return (
                  <li key={other.id}>
                    <a
                      href={`/work/${other.slug}/`}
                      className="group flex items-start justify-between gap-4 py-4 transition-colors duration-[var(--roll-duration)] ease-[var(--roll-ease)] hover:text-oxblood"
                    >
                      <span className="min-w-0">
                        <span className="block font-mono text-[10.5px] tracking-[0.16em] text-ink-faint uppercase">
                          {other.client}
                        </span>
                        <span className="mt-1 block text-[14.5px] leading-[1.4] font-medium tracking-[-0.01em] text-pretty">
                          {other.title}
                        </span>
                      </span>
                      {metric && (
                        <span className="shrink-0 text-right">
                          <span className="block font-serif text-[26px] leading-none font-medium tracking-[-0.03em] text-oxblood italic">
                            {metric.value}
                          </span>
                          <span className="mt-1 block max-w-[12ch] text-[11px] leading-[1.3] text-ink-muted">
                            {metric.label}
                          </span>
                        </span>
                      )}
                    </a>
                  </li>
                )
              })}
            </ul>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- a full page load by design: the scroll flow binds on load (components/reveal-observer.tsx), so page links are plain anchors site-wide */}
            <a
              href="/work"
              className="control-motion mt-5 inline-block border-b border-oxblood/35 pb-[3px] text-[14px] font-medium text-oxblood hover:border-ink/35 hover:text-ink"
            >
              <Roll>{workPage.allLabel}&nbsp;&nbsp;&rarr;</Roll>
            </a>
          </div>
        )}

        {updates.length > 0 && (
          <div data-reveal="60" data-flow="right">
            <Kicker tone="muted">{workPage.rail.updates}</Kicker>
            <ul className="mt-5 flex list-none flex-col divide-y divide-rule border-y border-rule">
              {updates.map((post) => (
                <li key={post.id}>
                  <a
                    href={`/blog/${post.slug}/`}
                    className="block py-4 transition-colors duration-[var(--roll-duration)] ease-[var(--roll-ease)] hover:text-oxblood"
                  >
                    <span className="block text-[14.5px] leading-[1.4] font-medium tracking-[-0.01em] text-pretty">
                      {post.title}
                    </span>
                    <time
                      dateTime={post.publishedAt}
                      className="mt-1 block font-mono text-[10.5px] tracking-[0.14em] text-ink-faint uppercase"
                    >
                      {formatDate(post.publishedAt)}
                    </time>
                  </a>
                </li>
              ))}
            </ul>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- a full page load by design: the scroll flow binds on load (components/reveal-observer.tsx), so page links are plain anchors site-wide */}
            <a
              href="/blog"
              className="control-motion mt-5 inline-block border-b border-oxblood/35 pb-[3px] text-[14px] font-medium text-oxblood hover:border-ink/35 hover:text-ink"
            >
              <Roll>{workPage.rail.allUpdates}&nbsp;&nbsp;&rarr;</Roll>
            </a>
          </div>
        )}
      </div>
    </aside>
  )
}

/** One stage on the spine: a node on the rule, the number and label, the content. */
function Beat({
  id,
  num,
  label,
  last = false,
  children,
}: {
  id: string
  num: string
  label: string
  last?: boolean
  children: React.ReactNode
}) {
  return (
    <li
      id={id}
      data-reveal="0"
      data-flow="left"
      className={`relative scroll-mt-[96px] pl-[clamp(24px,4vw,56px)] ${last ? "pb-0" : "pb-[clamp(36px,4vw,64px)]"}`}
    >
      <span
        aria-hidden="true"
        className="absolute top-[6px] left-0 flex size-[11px] -translate-x-1/2 items-center justify-center rounded-full bg-paper"
      >
        <span className="size-[7px] rounded-full bg-oxblood" />
      </span>
      <div className="grid gap-x-[clamp(24px,4vw,64px)] gap-y-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
        <div className="flex items-baseline gap-x-3">
          <span className="font-mono text-[11px] text-oxblood">{num}</span>
          <h2 className="text-[clamp(20px,2vw,26px)] leading-[1.2] font-semibold tracking-[-0.02em]">
            {label}
          </h2>
        </div>
        <div className="lg:pt-[3px]">{children}</div>
      </div>
    </li>
  )
}
