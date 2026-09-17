import { ImageResponse } from "next/og"

import { workPage } from "@/content/pages"
import { getStory, PLATFORM_LABEL } from "@/lib/cms"
import { OG_SIZE, ogCard, ogFonts } from "@/lib/og"

/**
 * A story's share card, at /work/[slug]/og.png: the sector as the kicker,
 * what was achieved as the title, the client and platform at the foot, and
 * the story's first headline figure on the right - the number is what the
 * story is shared for. See app/og.png/route.tsx for why this is a route
 * rather than Next's image convention.
 */
export const revalidate = 60

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const story = await getStory(slug)
  const fonts = await ogFonts()

  if (!story) {
    return new ImageResponse(
      ogCard({
        kicker: workPage.header.kicker,
        title: workPage.header.heading,
        meta: "cognivitilabs.com",
      }),
      { ...OG_SIZE, fonts, status: 404 }
    )
  }

  const platforms = (story.platform ?? []).map((p) => PLATFORM_LABEL[p])
  const metric = story.metrics?.[0]

  return new ImageResponse(
    ogCard({
      kicker: [workPage.header.kicker, story.sector].filter(Boolean).join(" · "),
      title: story.title,
      meta: [story.client, platforms.join(" + ")].filter(Boolean).join(" · "),
      figure: metric ? { value: metric.value, label: metric.label } : undefined,
    }),
    { ...OG_SIZE, fonts }
  )
}
