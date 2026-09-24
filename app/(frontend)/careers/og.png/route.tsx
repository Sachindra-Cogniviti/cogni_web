import { ImageResponse } from "next/og"

import { careersPage } from "@/content/pages"
import { OG_SIZE, ogCard, ogFonts } from "@/lib/og"

/**
 * This page's share card. Static: the copy it is drawn from is in the repo,
 * so the card cannot change without a deploy.
 *
 * A card of its own rather than the site card, which every page that was not
 * a post or a story used to share - so four different links arrived in a
 * feed as one identical image. See app/og.png/route.tsx for why these are
 * routes with an extension rather than Next's image convention.
 */
export const dynamic = "force-static"

export async function GET() {
  return new ImageResponse(
    ogCard({
      kicker: careersPage.header.kicker,
      title: careersPage.header.heading,
      meta: "cognivitilabs.com",
    }),
    { ...OG_SIZE, fonts: await ogFonts() }
  )
}
