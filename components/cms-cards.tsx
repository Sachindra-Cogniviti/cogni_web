import Image from "next/image"

import { Corners, Roll } from "@/components/primitives"
import {
  authorOf,
  categoriesOf,
  formatDate,
  imageSource,
  mediaOf,
  PLATFORM_LABEL,
  readingTime,
  REGION_LABEL,
} from "@/lib/cms"
import type { ClientStory, Post } from "@/payload-types"

/**
 * The cards the blog and the client stories are listed with, shared by the
 * index pages and the "more" rails at the foot of each article, so a post
 * looks the same wherever it is offered.
 *
 * Both are hairline cells in the page's grid idiom, the whole cell a link.
 * A post card leads with its category and reading time, then the title,
 * then the excerpt, and signs off with the author and date. A story card
 * leads with the client, then what was achieved, and carries up to two of
 * the story's headline figures at display size - the numbers are what a
 * prospect scans for, so they are on the card rather than behind it.
 *
 * `featured` gives the post card a cover, if the post has one, and room to
 * breathe: the blog's index opens on the latest post at that size.
 */
export function PostCard({
  post,
  featured = false,
}: {
  post: Post
  featured?: boolean
}) {
  const categories = categoriesOf(post.categories)
  const author = authorOf(post.author)
  const cover = mediaOf(post.coverImage)
  const image = cover ? imageSource(cover, featured ? "cover" : "inline") : null
  const minutes = readingTime(post.body)

  return (
    <a
      href={`/blog/${post.slug}/`}
      className={`group relative flex h-full flex-col bg-paper transition-colors duration-[var(--roll-duration)] ease-[var(--roll-ease)] hover:bg-paper-soft ${
        featured ? "lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]" : ""
      }`}
    >
      <Corners />
      {featured && image && (
        <div className="relative overflow-hidden border-b border-rule lg:order-2 lg:border-b-0 lg:border-l">
          <Image
            src={image.src}
            alt={cover?.alt ?? ""}
            width={image.width}
            height={image.height}
            sizes="(min-width: 1024px) 560px, 100vw"
            className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(.23,1,.32,1)] group-hover:scale-[1.02] motion-reduce:group-hover:scale-100"
            priority
          />
        </div>
      )}

      <div
        className={`flex flex-1 flex-col ${featured ? "p-[clamp(28px,4vw,56px)]" : "p-8"}`}
      >
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 font-mono text-[10.5px] tracking-[0.16em] uppercase">
          {categories.length > 0 ? (
            <span className="text-oxblood">
              {categories.map((c) => c.title).join(" · ")}
            </span>
          ) : (
            <span className="text-oxblood">Insight</span>
          )}
          <span className="text-ink-faint">{minutes} min read</span>
        </div>

        <h2
          className={`mt-6 font-semibold tracking-[-0.025em] text-balance ${
            featured
              ? "max-w-[20ch] text-[clamp(26px,3.2vw,44px)] leading-[1.08]"
              : "text-[21px] leading-[1.2]"
          }`}
        >
          {post.title}
        </h2>
        <p
          className={`mt-4 text-pretty text-ink-soft ${
            featured
              ? "max-w-[52ch] text-[16px] leading-[1.65]"
              : "text-[14.5px] leading-[1.6]"
          }`}
        >
          {post.excerpt}
        </p>

        <div className="mt-auto flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 pt-8">
          <span className="text-[13px] text-ink-muted">
            {author?.name ?? "Cogniviti Labs"}
            <span className="text-ink-ghost"> · </span>
            <time dateTime={post.publishedAt}>
              {formatDate(post.publishedAt)}
            </time>
          </span>
          <span className="text-[14px] font-medium text-oxblood">
            <Roll>Read&nbsp;&nbsp;&rarr;</Roll>
          </span>
        </div>
      </div>
    </a>
  )
}

export function StoryCard({ story }: { story: ClientStory }) {
  const metrics = (story.metrics ?? []).slice(0, 2)
  const platforms = (story.platform ?? []).map((p) => PLATFORM_LABEL[p])
  const regions = (story.region ?? []).map((r) => REGION_LABEL[r])
  const facts = [story.sector, ...regions].filter(Boolean)

  return (
    <a
      href={`/work/${story.slug}/`}
      className="group relative flex h-full flex-col bg-paper p-8 transition-colors duration-[var(--roll-duration)] ease-[var(--roll-ease)] hover:bg-paper-soft"
    >
      <Corners />
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span className="text-[15px] font-semibold tracking-[-0.01em]">
          {story.client}
        </span>
        {facts.length > 0 && (
          <span className="font-mono text-[10.5px] tracking-[0.16em] text-ink-faint uppercase">
            {facts.join(" · ")}
          </span>
        )}
      </div>

      <h2 className="mt-6 max-w-[24ch] text-[21px] leading-[1.2] font-semibold tracking-[-0.025em] text-balance">
        {story.title}
      </h2>
      <p className="mt-4 text-[14.5px] leading-[1.6] text-pretty text-ink-soft">
        {story.excerpt}
      </p>

      {metrics.length > 0 && (
        <dl className="mt-7 grid grid-cols-2 gap-x-6 border-t border-rule pt-5">
          {metrics.map((metric) => (
            <div key={metric.id ?? metric.label}>
              <dd className="font-serif text-[clamp(28px,2.6vw,36px)] leading-none font-medium tracking-[-0.03em] text-oxblood italic">
                {metric.value}
              </dd>
              <dt className="mt-2 text-[12.5px] leading-[1.4] text-ink-muted">
                {metric.label}
              </dt>
            </div>
          ))}
        </dl>
      )}

      <div className="mt-auto flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 pt-8">
        <span className="font-mono text-[10.5px] tracking-[0.14em] text-ink-faint uppercase">
          {platforms.join(" · ")}
        </span>
        <span className="text-[14px] font-medium text-oxblood">
          <Roll>Read the story&nbsp;&nbsp;&rarr;</Roll>
        </span>
      </div>
    </a>
  )
}
