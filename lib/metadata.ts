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
}: {
  /** As it should read on the tab and the card; the site name is added. */
  title: string
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
}): Metadata {
  const url = `${publicSiteUrl()}${path}`
  const card = image ?? DEFAULT_OG_IMAGE
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      siteName: site.name,
      locale: "en_GB",
      url,
      title: `${title} | ${site.name}`,
      description,
      ...(article ? { type: "article", ...article } : { type: "website" }),
      images: [card],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${site.name}`,
      description,
      images: [card],
    },
  }
}
