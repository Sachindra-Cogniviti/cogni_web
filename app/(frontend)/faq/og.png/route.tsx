import { ImageResponse } from "next/og"

import { faqPage } from "@/content/pages"
import { OG_SIZE, ogCard, ogFonts } from "@/lib/og"

export const dynamic = "force-static"

export async function GET() {
  return new ImageResponse(
    ogCard({
      kicker: faqPage.header.kicker,
      title: faqPage.header.heading,
      meta: "cognivitilabs.com",
      figure: { value: String(faqPage.items.length), label: "Questions" },
    }),
    { ...OG_SIZE, fonts: await ogFonts() }
  )
}
