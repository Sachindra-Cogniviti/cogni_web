import type { MetadataRoute } from "next"

import { siteUrl } from "@/content/site"

// Required for output: "export" on metadata routes.
export const dynamic = "force-static"

// Rendered to out/robots.txt at build time.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
