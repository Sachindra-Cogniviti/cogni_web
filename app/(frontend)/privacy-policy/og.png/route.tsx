import { ImageResponse } from "next/og"

import { privacyPage } from "@/content/legal"
import { OG_SIZE, ogCard, ogFonts } from "@/lib/og"

export const dynamic = "force-static"

export async function GET() {
  return new ImageResponse(
    ogCard({
      kicker: privacyPage.header.kicker,
      title: privacyPage.header.heading,
      meta: "cognivitilabs.com",
    }),
    { ...OG_SIZE, fonts: await ogFonts() }
  )
}
