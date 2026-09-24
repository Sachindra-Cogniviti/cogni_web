import type { Metadata } from "next"

import { site } from "@/content/site"
import { publicSiteUrl } from "@/lib/deployment"

/**
 * The metadata for one page, complete.
 *
 * Next does not deep-merge `openGraph` or `twitter` from the layout: a page
 * that sets either replaces the layout's whole object, and a page that sets
 * neither inherits the site's title and description into its share card.
 * Both are wrong for a sub-page, so every page builds the whole set here -
 * title, description, canonical, Open Graph and the Twitter card - from the
 * three things that differ, and the site name, locale and origin are
 * written once.
 *
 * The share image is the site card at /og.png unless the page passes one:
 * a post or a story passes the card drawn beside it, or the image its
 * editor chose in the SEO panel. Named explicitly rather than through
 * Next's `opengraph-image.tsx` convention, which does not survive
 * `trailingSlash` - see app/og.png/route.tsx.
 */

export const OG_IMAGE = { width: 1200, height: 630 }
export const DEFAULT_OG_IMAGE = {
  url: "/og.png",
  ...OG_IMAGE,
  alt: site.title,
}
export function pageMetadata({
  title,
  description,
  path,
  article,
  image,
  share,
}: {
  /**
   * As it should read in a search result. The site name is appended by the
   * layout's title template, so do not include it. Aim under ~45 characters:
   * Google renders about 60 including the " | Cogniviti Labs".
   */
  title: string
  /** Under ~155 characters, and a complete sentence at that length. */
  description: string
  /** The canonical path, with its trailing slash: "/blog/why-data/". */
  path: string
  /** Set for a post or a story, which are articles to a crawler. */
  article?: {
    publishedTime: string
    modifiedTime?: string
    authors?: string[]
    section?: string
    tags?: string[]
  }
  /** The page's share image, in place of the site card. */
  image?: { url: string; width?: number; height?: number; alt?: string }
  /**
   * Longer title and description for the share card only.
   *
   * A card is not a result listing: it has room for a full sentence, and it
   * is read by someone who has already been handed the link rather than
   * someone scanning ten results. The homepage uses this to keep its whole
   * positioning statement on the card while the listing gets the trimmed
   * version. Most pages want the same copy in both and pass nothing.
   */
  share?: { title?: string; description?: string }
}): Metadata {
  const url = `${publicSiteUrl()}${path}`
  const card = image ?? DEFAULT_OG_IMAGE
  // No " | Cogniviti Labs" here, unlike the tab title: og:site_name is
  // emitted directly below and every network renders it beside the title, so
  // appending it spends the card's limited width saying the same thing twice.
  const shareTitle = share?.title ?? title
  const shareDescription = share?.description ?? description
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      siteName: site.name,
      locale: "en_GB",
      url,
      title: shareTitle,
      description: shareDescription,
      ...(article ? { type: "article", ...article } : { type: "website" }),
      images: [card],
    },
    twitter: {
      card: "summary_large_image",
      title: shareTitle,
      description: shareDescription,
      images: [card],
    },
  }
}
