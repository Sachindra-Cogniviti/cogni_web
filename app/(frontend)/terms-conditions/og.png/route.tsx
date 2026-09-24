import { ImageResponse } from "next/og"

import { termsPage } from "@/content/legal"
import { OG_SIZE, ogCard, ogFonts } from "@/lib/og"

export const dynamic = "force-static"

export async function GET() {
  return new ImageResponse(
    ogCard({
      kicker: termsPage.header.kicker,
      title: termsPage.header.heading,
      meta: "cognivitilabs.com",
    }),
    { ...OG_SIZE, fonts: await ogFonts() }
  )
}
