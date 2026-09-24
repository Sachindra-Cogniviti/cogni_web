import { ImageResponse } from "next/og"

import { products } from "@/content/site"
import { OG_SIZE, ogCard, ogFonts } from "@/lib/og"

/**
 * A product's share card, at /products/[slug]/og.png.
 *
 * All six product pages shared the site card until now, so a link to
 * CogniFlow and a link to the Experience Centre arrived in a LinkedIn feed
 * as the same image - on the channel this company is actually shared on.
 *
 * The right third takes the product's first stat row as its figure. Those
 * rows are the concrete detail on the product page itself (they are what
 * the homepage's product desktop shows), so the card leads with the same
 * thing the page does rather than inventing a number for the card.
 *
 * Static: the six products are in content, so every card is known at build
 * time and none of them change without a deploy.
 */
export const dynamicParams = false

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }))
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const product = products.find((p) => p.slug === slug)
  const fonts = await ogFonts()

  if (!product) {
    return new ImageResponse(
      ogCard({
        kicker: "Products",
        title: "Cogniviti Labs products",
        meta: "cognivitilabs.com",
      }),
      { ...OG_SIZE, fonts, status: 404 }
    )
  }

  const [label, value] = product.rows[0] ?? []

  return new ImageResponse(
    ogCard({
      kicker: `Products · ${product.kicker}`,
      // The tag, not the name: the name is already the biggest thing on the
      // card's left, and the tag is the one line that says what it is for.
      title: product.tag,
      meta: `${product.name} · cognivitilabs.com`,
      figure: value && label ? { value, label } : undefined,
    }),
    { ...OG_SIZE, fonts }
  )
}

