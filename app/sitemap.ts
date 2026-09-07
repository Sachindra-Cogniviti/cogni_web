import type { MetadataRoute } from "next"

import { siteUrl } from "@/content/site"

// Required for output: "export" on metadata routes.
export const dynamic = "force-static"

// Rendered to out/sitemap.xml at build time. Add a line per public route.
const routes = ["/"]

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
  return routes.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified,
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : 0.7,
  }))
}
