import type { Metadata } from "next"

import { LegalPage } from "@/components/legal-page"
import { privacyPage } from "@/content/legal"
import { OG_IMAGE, pageMetadata } from "@/lib/metadata"

/**
 * /privacy-policy/
 *
 * The WordPress address, kept on purpose - it is in the old sitemap and
 * linked from every page of the site being replaced, so keeping it means no
 * redirect to maintain. See content/legal.ts.
 */
export const metadata: Metadata = pageMetadata({
  ...privacyPage.seo,
  path: "/privacy-policy/",
  image: {
    url: "/privacy-policy/og.png",
    ...OG_IMAGE,
    alt: privacyPage.header.heading,
  },
})

export default function Privacy() {
  return <LegalPage doc={privacyPage} />
}
