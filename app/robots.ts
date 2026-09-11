import type { MetadataRoute } from "next"

import { siteUrl } from "@/content/site"

export const dynamic = "force-static"

/*
 * This file has to sit at the app root, NOT inside the (frontend) route group
 * with the pages it describes. Next silently declines to register robots.ts
 * from inside a group - no warning, no build error, the route simply never
 * exists and /robots.txt 404s. sitemap.ts does not have the same problem,
 * which is what makes it easy to miss: move both and only one breaks.
 *
 * Keep it here. A tidy-up that files it next to layout.tsx un-indexes the site.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
