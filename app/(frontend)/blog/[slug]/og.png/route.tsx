import { ImageResponse } from "next/og"

import { blogPage } from "@/content/pages"
import {
  authorOf,
  categoriesOf,
  formatDate,
  getPost,
  imageSource,
  mediaOf,
} from "@/lib/cms"
import { OG_SIZE, ogCard, ogFonts, ogImageData } from "@/lib/og"

/**
 * A post's share card, at /blog/[slug]/og.png: its category as the kicker,
 * its title, the byline and date at the foot, and its cover on the right
 * if it has one. The page links to it with the post's updated time as a
 * query, so a retitled post gets a fresh card without a deploy while the
 * old URL stays cacheable. See app/og.png/route.tsx for why this is a
 * route rather than Next's image convention.
 */
export const revalidate = 60

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const post = await getPost(slug)
  const fonts = await ogFonts()

  if (!post) {
    return new ImageResponse(
      ogCard({
        kicker: blogPage.header.kicker,
        title: blogPage.header.heading,
        meta: "cognivitilabs.com",
      }),
      { ...OG_SIZE, fonts, status: 404 }
    )
  }

  const category = categoriesOf(post.categories)[0]?.title
  const author = authorOf(post.author)
  const cover = mediaOf(post.coverImage)
  const image = await ogImageData(
    cover ? imageSource(cover, "inline")?.src : undefined
  )

  return new ImageResponse(
    ogCard({
      kicker: [blogPage.header.kicker, category].filter(Boolean).join(" · "),
      title: post.title,
      meta: [author?.name, formatDate(post.publishedAt)]
        .filter(Boolean)
        .join(" · "),
      image,
    }),
    { ...OG_SIZE, fonts }
  )
}
