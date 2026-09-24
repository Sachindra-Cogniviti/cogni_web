import type { MetadataRoute } from "next"

import { products } from "@/content/site"
import { getPosts, getRoles, getStories } from "@/lib/cms"
import { isLiveSite, publicSiteUrl } from "@/lib/deployment"

// Rebuilt hourly rather than fixed at build: posts, client stories and open
// roles are published from the admin without a deploy, and the sitemap has to
// say so.
export const revalidate = 3600

/*
 * Kept at the app root alongside robots.ts. This one does work from inside a
 * route group, but the two belong together and splitting them is how the
 * robots.ts trap gets sprung (see the note there).
 *
 * Trailing slashes throughout, because `trailingSlash: true` means that is
 * the URL that actually answers 200. Listing "/contact" would hand a crawler
 * a 308 for every page on the site. `npm run check:links` holds the rest of
 * the site to the same shape.
 *
 * What is NOT here, deliberately:
 *
 * - `changeFrequency` and `priority`. Google has said plainly that it ignores
 *   both. They are not harmless: they read like signals that do something,
 *   and the next person to touch this file would reasonably spend time
 *   tuning numbers that no crawler reads.
 *
 * - `lastModified` on the fixed routes. It used to be `new Date()`, which
 *   claimed every static page changed at the moment the sitemap regenerated -
 *   hourly, and false. Worse, it devalued the accurate `lastModified` on the
 *   posts and stories in the same file, which are real. A crawler that learns
 *   a site lies about one is entitled to discount the other. Omitting it says
 *   "no claim", which is true.
 */

/**
 * The pages that exist because a file exists, as against the ones that exist
 * because something was published. Product pages are generated from the same
 * array the routes are, so a seventh product is one edit rather than two.
 *
 * The open roles on /careers are pages of their own now (/careers/[slug]),
 * so unlike before they belong in the published half below.
 */
const fixedRoutes = [
  "/",
  "/products/",
  ...products.map((product) => `/products/${product.slug}/`),
  "/experience/",
  "/careers/",
  "/contact/",
  "/blog/",
  "/work/",
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Anything that is not the live site lists nothing. Emitting production URLs
  // would hand a crawler the live site's routes from a deployment that is not
  // the live site; emitting the deployment's own URLs would be asking for the
  // staging copy to be indexed. Neither is wanted, and an empty sitemap is
  // both.
  if (!isLiveSite) return []

  const origin = publicSiteUrl()
  const fixed: MetadataRoute.Sitemap = fixedRoutes.map((path) => ({
    url: `${origin}${path}`,
  }))

  // Each read falls back to an empty list if the database is unreachable, so
  // the fixed routes are always listed even when Payload is down.
  const [posts, stories, roles] = await Promise.all([
    getPosts(),
    getStories(),
    getRoles(),
  ])

  const published: MetadataRoute.Sitemap = [
    ...posts.map((post) => ({
      url: `${origin}/blog/${post.slug}/`,
      lastModified: new Date(post.updatedAt),
    })),
    ...stories.map((story) => ({
      url: `${origin}/work/${story.slug}/`,
      lastModified: new Date(story.updatedAt),
    })),
    ...roles.map((role) => ({
      url: `${origin}/careers/${role.slug}/`,
      lastModified: new Date(role.updatedAt),
    })),
  ]

  return [...fixed, ...published]
}
