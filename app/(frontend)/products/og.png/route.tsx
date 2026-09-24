import { ImageResponse } from "next/og"

import { productsPage } from "@/content/pages"
import { products } from "@/content/site"
import { OG_SIZE, ogCard, ogFonts } from "@/lib/og"

/**
 * The products index card. The figure is the count, which is also what the
 * page leads with. Static: the six products are in content.
 */
export const dynamic = "force-static"

export async function GET() {
  return new ImageResponse(
    ogCard({
      kicker: productsPage.header.kicker,
      title: productsPage.header.heading,
      meta: "cognivitilabs.com",
      figure: { value: String(products.length), label: "Products" },
    }),
    { ...OG_SIZE, fonts: await ogFonts() }
  )
}
