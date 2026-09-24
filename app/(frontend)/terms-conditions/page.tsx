import type { Metadata } from "next"

import { LegalPage } from "@/components/legal-page"
import { termsPage } from "@/content/legal"
import { OG_IMAGE, pageMetadata } from "@/lib/metadata"

/** /terms-conditions/ - the WordPress address, kept. See content/legal.ts. */
export const metadata: Metadata = pageMetadata({
  ...termsPage.seo,
  path: "/terms-conditions/",
  image: {
    url: "/terms-conditions/og.png",
    ...OG_IMAGE,
    alt: termsPage.header.heading,
  },
})

export default function Terms() {
  return <LegalPage doc={termsPage} />
}
