import { ImageResponse } from "next/og"

import { site } from "@/content/site"
import { OG_SIZE, ogCard, ogFonts } from "@/lib/og"

/**
 * The site's share card, at /og.png: every page that has no card of its
 * own - the homepage, products, careers, contact and the listings - is
 * shared with this. Posts and stories draw theirs beside their pages.
 *
 * A route with an extension rather than Next's `opengraph-image.tsx`
 * convention, because that convention does not survive `trailingSlash`:
 * the generated URL has no extension, so it is redirected to a slash it
 * does not answer on. A `.png` path is exempt from the redirect, the same
 * reason llms.txt and sitemap.xml work. At the app root for the reason
 * given in CLAUDE.md for the other root files.
 */
export const revalidate = 86400

export async function GET() {
  return new ImageResponse(
    ogCard({
      kicker: "Procurement · Finance · Data · Integration",
      title: site.title.replace(/^Cogniviti Labs:\s*/, ""),
      meta: "cognivitilabs.com",
    }),
    { ...OG_SIZE, fonts: await ogFonts() }
  )
}
