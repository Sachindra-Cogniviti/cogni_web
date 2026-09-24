import type { Metadata } from "next"
import { draftMode } from "next/headers"
import Image from "next/image"
import { notFound } from "next/navigation"

import { ArticleNav } from "@/components/article-nav"
import { PostCard } from "@/components/cms-cards"
import { DraftPreview } from "@/components/draft-preview"
import { JsonLd } from "@/components/json-ld"
import { PageClose, PageHeader, PageShell } from "@/components/page-shell"
import {
  Container,
  Corners,
  Roll,
  sectionPadding,
} from "@/components/primitives"
import { Article } from "@/components/rich-text"
import { FlowRule } from "@/components/scroll-motion"
import { ShareRow } from "@/components/share-row"
import { Stagger } from "@/components/stagger"
import { blogPage } from "@/content/pages"
import {
  authorOf,
  categoriesOf,
  formatDate,
  getPost,
  getPosts,
  imageSource,
  mediaOf,
  readingTime,
} from "@/lib/cms"
import { publicSiteUrl } from "@/lib/deployment"
import { headingsOf } from "@/lib/headings"
import { OG_IMAGE, pageMetadata } from "@/lib/metadata"
import { blogPosting } from "@/lib/schema"

export const revalidate = 60

/** Known posts are prerendered; a post published later renders on request. */
export async function generateStaticParams() {
  const posts = await getPosts()
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const { isEnabled: draft } = await draftMode()
  const post = await getPost(slug, { draft })
  if (!post) return {}
  // The card drawn beside this page (og.png/route.tsx) is the share image
  // unless the editor chose one in the SEO panel, in which case that wins.
  // The query is the post's updated time, so a changed post gets a new
  // card while the old one stays cacheable.
  const chosen = mediaOf(post.meta?.image)
  const image = chosen ? imageSource(chosen, "cover") : null
  const author = authorOf(post.author)
  return pageMetadata({
    title: post.meta?.title ?? post.title,
    description: post.meta?.description ?? post.excerpt,
    path: `/blog/${slug}/`,
    article: {
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: author ? [author.name] : undefined,
      section: categoriesOf(post.categories)[0]?.title,
      tags: categoriesOf(post.categories).map((c) => c.title),
    },
    image: image
      ? {
          url: image.src,
          width: image.width,
          height: image.height,
          alt: chosen?.alt ?? undefined,
        }
      : {
          url: `/blog/${slug}/og.png?v=${Date.parse(post.updatedAt)}`,
          ...OG_IMAGE,
          alt: post.title,
        },
  })
}

/**
 * /blog/[slug]
 *
 * A masthead in the site's own voice - category as the kicker, the title as
 * the heading, the excerpt as the standfirst - then the byline, the cover,
 * and the article at a reading measure. The author signs off in a hairline
 * cell, and the three most recent other posts follow so the page has
 * somewhere to send a reader who finished.
 *
 * JSON-LD names the article for search engines and for whatever reads the
 * page next: the same title, author and dates the page shows, nothing
 * hidden.
 */
export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  // Draft mode is the preview (lib/preview.ts): the latest draft in place
  // of the published version, on this same page, for a signed-in editor.
  const { isEnabled: draft } = await draftMode()
  const post = await getPost(slug, { draft })
  if (!post) notFound()

  const author = authorOf(post.author)
  const categories = categoriesOf(post.categories)
  const cover = mediaOf(post.coverImage)
  const image = cover ? imageSource(cover, "cover") : null
  const minutes = readingTime(post.body)
  const headings = headingsOf(post.body)
  const url = `${publicSiteUrl()}/blog/${post.slug}/`
  const others = (await getPosts(4)).filter((p) => p.id !== post.id).slice(0, 3)
  const kicker = categories.map((c) => c.title).join(" · ") || "Insight"

  return (
    <PageShell>
      {/* The article, naming the same organisation the layout's graph
          describes rather than a second one of the same name - see
          lib/schema.ts. The breadcrumb comes from PageHeader. */}
      <JsonLd
        data={blogPosting({
          post,
          author,
          section: categories[0]?.title,
          image: image?.src,
        })}
      />

      <PageHeader
        content={{
          trail: [
            { label: "Home", href: "/" },
            { label: blogPage.header.kicker, href: "/blog/" },
            { label: post.title },
          ],
          kicker,
          heading: post.title,
          body: post.excerpt,
        }}
      >
        <div
          data-reveal="240"
          data-flow="left"
          className="mt-9 flex flex-wrap items-baseline gap-x-6 gap-y-2 text-[14px] text-ink-muted"
        >
          {author && (
            <span>
              <span className="font-medium text-ink">{author.name}</span>
              {author.role && (
                <span className="text-ink-faint"> · {author.role}</span>
              )}
            </span>
          )}
          <time dateTime={post.publishedAt}>
            {formatDate(post.publishedAt)}
          </time>
          <span className="font-mono text-[11px] tracking-[0.16em] text-ink-faint uppercase">
            {minutes} min read
          </span>
        </div>
      </PageHeader>

      <section className="relative pb-[clamp(72px,8vw,120px)]">
        <Container>
          {image && (
            <figure
              data-reveal="0"
              data-flow="fade"
              className="relative mb-[clamp(40px,5vw,72px)] border border-rule"
            >
              <Corners />
              <Image
                src={image.src}
                alt={cover?.alt ?? ""}
                width={image.width}
                height={image.height}
                sizes="(min-width: 1280px) 1184px, 100vw"
                className="block h-auto w-full"
                priority
              />
              {cover?.credit && (
                <figcaption className="border-t border-rule px-4 py-2 font-mono text-[10.5px] tracking-[0.12em] text-ink-faint uppercase">
                  {cover.credit}
                </figcaption>
              )}
            </figure>
          )}

          <div className="grid gap-x-[clamp(32px,5vw,80px)] lg:grid-cols-[minmax(200px,260px)_minmax(0,1fr)]">
            {/* A margin note that stays put while the article scrolls: where
                you are, and the way back. */}
            <aside className="hidden lg:block">
              <div className="sticky top-[120px]">
                <div className="font-mono text-[10.5px] tracking-[0.2em] text-ink-faint uppercase">
                  {kicker}
                </div>
                <div className="mt-3 max-w-[22ch] text-[14px] leading-[1.5] text-ink-muted">
                  {post.excerpt}
                </div>
                {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- a full page load by design: the scroll flow binds on load (components/reveal-observer.tsx), so page links are plain anchors site-wide */}
                <a
                  href="/blog/"
                  className="control-motion mt-6 inline-block border-b border-oxblood/35 pb-[3px] text-[14px] font-medium text-oxblood hover:border-ink/35 hover:text-ink"
                >
                  <Roll>&larr;&nbsp;&nbsp;{blogPage.backLabel}</Roll>
                </a>
                <ShareRow
                  url={url}
                  title={post.title}
                  text={post.excerpt}
                  label={blogPage.shareLabel}
                  className="mt-8"
                />
              </div>
            </aside>

            {/* No data-reveal here: the scroll flow fades an element back
                out when too little of it is on screen, and an article taller
                than the viewport would fade while being read. */}
            <div id="article" className="min-w-0">
              <Article body={post.body} className="max-w-[68ch]" dropCap />

              <ShareRow
                url={url}
                title={post.title}
                text={post.excerpt}
                label={blogPage.shareLabel}
                className="mt-[clamp(40px,5vw,64px)] max-w-[68ch] border-t border-rule pt-6"
              />

              {author && (
                <div className="relative mt-[clamp(48px,6vw,80px)] flex flex-wrap items-start gap-6 border border-rule bg-paper p-7">
                  <Corners />
                  <div className="min-w-0 flex-1">
                    <div className="font-mono text-[10.5px] tracking-[0.2em] text-ink-faint uppercase">
                      {blogPage.authorLabel}
                    </div>
                    <div className="mt-3 text-[16px] font-semibold tracking-[-0.01em]">
                      {author.name}
                      {author.role && (
                        <span className="font-normal text-ink-muted">
                          {" "}
                          · {author.role}
                        </span>
                      )}
                    </div>
                    {author.bio && (
                      <p className="mt-3 max-w-[56ch] text-[14.5px] leading-[1.6] text-pretty text-ink-soft">
                        {author.bio}
                      </p>
                    )}
                    {author.linkedIn && (
                      <a
                        href={author.linkedIn}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="control-motion mt-4 inline-block font-mono text-[11.5px] tracking-[0.12em] text-oxblood uppercase hover:text-ink"
                      >
                        <Roll>LinkedIn&nbsp;↗</Roll>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Container>
        <FlowRule />
      </section>

      {others.length > 0 && (
        <section className={`relative bg-paper-alt ${sectionPadding}`}>
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <h2
                data-reveal="0"
                data-flow="left"
                className="text-[clamp(24px,2.8vw,36px)] leading-[1.1] font-semibold tracking-[-0.03em]"
              >
                {blogPage.moreHeading}
              </h2>
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- a full page load by design: the scroll flow binds on load (components/reveal-observer.tsx), so page links are plain anchors site-wide */}
              <a
                data-reveal="60"
                data-flow="right"
                href="/blog/"
                className="control-motion border-b border-oxblood/35 pb-[3px] text-[15px] font-medium text-oxblood hover:border-ink/35 hover:text-ink"
              >
                <Roll>{blogPage.allLabel}&nbsp;&nbsp;&rarr;</Roll>
              </a>
            </div>
            <Stagger
              as="ul"
              from="fade"
              step={0.09}
              className="mt-10 grid list-none grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-px border border-rule bg-rule"
            >
              {others.map((other) => (
                <li key={other.id} data-stagger className="bg-paper">
                  <PostCard post={other} />
                </li>
              ))}
            </Stagger>
          </Container>
          <FlowRule />
        </section>
      )}

      <PageClose content={blogPage.close} />

      {/* Where the reader is in the article, and the way to any part of
          it. Withdraws once the article has been read past. */}
      <ArticleNav
        target="article"
        headings={headings}
        label={blogPage.contentsLabel}
      />

      {draft && <DraftPreview path={`/blog/${post.slug}/`} />}
    </PageShell>
  )
}
