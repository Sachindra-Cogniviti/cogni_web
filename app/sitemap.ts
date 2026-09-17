import type { MetadataRoute } from "next"

import { products } from "@/content/site"
import { getPosts, getStories } from "@/lib/cms"
import { isLiveSite, publicSiteUrl } from "@/lib/deployment"

// Rebuilt hourly rather than fixed at build: posts and client stories are
// published from the admin without a deploy, and the sitemap has to say so.
export const revalidate = 3600

/*
 * Kept at the app root alongside robots.ts. This one does work from inside a
 * route group, but the two belong together and splitting them is how the
 * robots.ts trap gets sprung (see the note there).
 *
 * Still a hardcoded list, except for the product pages, which are generated
 * from the same array the routes themselves are - so a seventh product is one
 * edit rather than two.
 *
 * Trailing slashes throughout, because `trailingSlash: true` means that is
 * the URL that actually answers 200. Listing "/contact" would hand a crawler
 * a 308 for every page on the site.
 *
 * The blog posts and client stories come from Payload, with their last
 * update as lastModified. Both reads fall back to an empty list if the
 * database is unreachable, so the fixed routes are always listed. The open
 * roles on /careers are not pages of their own, so they are not here.
 */
const routes = [
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
  const lastModified = new Date()
  const fixed: MetadataRoute.Sitemap = routes.map((path) => ({
    url: `${origin}${path}`,
    lastModified,
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : 0.7,
  }))

  const [posts, stories] = await Promise.all([getPosts(), getStories()])
  const published: MetadataRoute.Sitemap = [
    ...posts.map((post) => ({
      url: `${origin}/blog/${post.slug}/`,
      lastModified: new Date(post.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...stories.map((story) => ({
      url: `${origin}/work/${story.slug}/`,
      lastModified: new Date(story.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ]

  return [...fixed, ...published]
}
