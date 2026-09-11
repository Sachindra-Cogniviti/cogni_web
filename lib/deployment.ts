import { siteUrl } from "@/content/site"

/**
 * Which deployment this is, and what it may tell search engines.
 *
 * Vercel sets VERCEL_ENV to "production", "preview" or "development" on every
 * build and at runtime. Only a production deployment is allowed to present
 * itself as the real site.
 *
 * Anything that is NOT explicitly a Vercel production deployment is treated as
 * non-indexable, local builds included. That direction is deliberate: the
 * failure mode of getting this wrong is asymmetric. A production site briefly
 * marked noindex costs a few days of ranking and is fixed by redeploying; a
 * staging copy that gets indexed competes with the real domain, splits link
 * equity, and can take months to clear out. So the safe state is the default
 * and the live site is the exception.
 */
export const isProductionDeployment = process.env.VERCEL_ENV === "production"

/**
 * The origin this deployment is actually reachable at.
 *
 * A preview must not emit production URLs. Canonicals, OG tags and the sitemap
 * would all point at cognivitilabs.com, which at best is confusing when the
 * team shares a link and at worst feeds a crawler production URLs from a page
 * that is not production.
 *
 * VERCEL_URL is the per-deployment hostname with no protocol; it is always
 * https.
 */
export function publicSiteUrl(): string {
  if (isProductionDeployment) return siteUrl
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return "http://localhost:3000"
}
