import type { Metadata } from "next"

import { OG_IMAGE, pageMetadata } from "@/lib/metadata"
import { itemList } from "@/lib/schema"

import { PostCard } from "@/components/cms-cards"
import { JsonLd } from "@/components/json-ld"
import { PageClose, PageHeader, PageShell } from "@/components/page-shell"
import { Container, sectionPadding } from "@/components/primitives"
import { FlowRule } from "@/components/scroll-motion"
import { Stagger } from "@/components/stagger"
import { blogPage } from "@/content/pages"
import { getPosts } from "@/lib/cms"

export const metadata: Metadata = pageMetadata({
  ...blogPage.seo,
  path: "/blog/",
  image: {
    url: "/blog/og.png",
    ...OG_IMAGE,
    alt: blogPage.header.heading,
  },
})

/**
 * Posts are published from the admin without a deploy, so the listing is
 * revalidated every minute: a post appears while its author is still
 * looking at the tab, and the page is not a database query per visitor.
 */
export const revalidate = 60

/**
 * /blog
 *
 * The latest post is set large, with its cover if it has one, and the rest
 * follow in the page's hairline grid. Newest first throughout; there is no
 * category navigation yet because there are not enough posts to need one,
 * and a filter over four articles is a control with nothing to do.
 */
export default async function BlogIndex() {
  const posts = await getPosts()
  const [latest, ...rest] = posts

  return (
    <PageShell>
      {/* What this page lists, in order. Names and URLs only - each post's
          own page carries its description, and two descriptions of one
          thing is a reconciliation a crawler should not have to do. */}
      <JsonLd
        data={itemList({
          name: blogPage.seo.title,
          description: blogPage.seo.description,
          path: "/blog/",
          items: posts.map((post) => ({
            name: post.title,
            path: `/blog/${post.slug}/`,
          })),
        })}
      />

      <PageHeader content={blogPage.header}>
        <p
          data-reveal="240"
          data-flow="left"
          className="mt-8 font-mono text-[11px] tracking-[0.18em] text-ink-faint uppercase"
        >
          {posts.length === 0
            ? blogPage.emptyCount
            : `${posts.length} ${posts.length === 1 ? "article" : "articles"}`}
        </p>
      </PageHeader>

      <section className={`relative ${sectionPadding}`}>
        <Container>
          {posts.length === 0 ? (
            <div data-reveal="0" data-flow="left" className="max-w-[58ch]">
              <h2 className="text-[clamp(24px,2.8vw,36px)] leading-[1.1] font-semibold tracking-[-0.03em] text-balance">
                {blogPage.empty.heading}
              </h2>
              <p className="mt-5 text-[16px] leading-[1.7] text-pretty text-ink-soft">
                {blogPage.empty.body}
              </p>
            </div>
          ) : (
            <>
              <div data-reveal="0" className="border border-rule">
                <PostCard post={latest} featured />
              </div>

              {rest.length > 0 && (
                <Stagger
                  as="ul"
                  from="fade"
                  step={0.09}
                  className="mt-px grid list-none grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-px border border-t-0 border-rule bg-rule"
                >
                  {rest.map((post) => (
                    <li key={post.id} data-stagger className="bg-paper">
                      <PostCard post={post} />
                    </li>
                  ))}
                </Stagger>
              )}
            </>
          )}
        </Container>
        <FlowRule />
      </section>

      <PageClose content={blogPage.close} />
    </PageShell>
  )
}
