import type { MetadataRoute } from "next"

import { isLiveSite, publicSiteUrl } from "@/lib/deployment"

export const dynamic = "force-static"

/*
 * Kept at the app root alongside robots.ts. This one does work from inside a
 * route group, but the two belong together and splitting them is how the
 * robots.ts trap gets sprung (see the note there).
 *
 * Still a hardcoded list. Once the blog and client stories are live this
 * should query Payload for slugs and their publishedAt, and drop
 * `force-static` so new posts appear without a rebuild.
 */
const routes = ["/"]

export default function sitemap(): MetadataRoute.Sitemap {
  // Anything that is not the live site lists nothing. Emitting production URLs
  // would hand a crawler the live site's routes from a deployment that is not
  // the live site; emitting the deployment's own URLs would be asking for the
  // staging copy to be indexed. Neither is wanted, and an empty sitemap is
  // both.
  if (!isLiveSite) return []

  const origin = publicSiteUrl()
  const lastModified = new Date()
  return routes.map((path) => ({
    url: `${origin}${path}`,
    lastModified,
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : 0.7,
  }))
}
