import { siteUrl } from "@/content/site"
import { indexingEnabled } from "@/lib/indexing"

export { indexingEnabled }

/**
 * Whether this deployment is the real, public site.
 *
 * Both halves are required. The switch in lib/indexing.ts is the deliberate
 * launch decision; VERCEL_ENV === "production" keeps previews from claiming to
 * be the live site afterwards, when that switch is true for every build.
 */
export const isLiveSite =
  indexingEnabled && process.env.VERCEL_ENV === "production"

/**
 * The origin this deployment is actually reachable at.
 *
 * Anything that is not the live site emits its own hostname. Canonicals, OG
 * tags and metadataBase would otherwise all point at cognivitilabs.com - which
 * is not merely untidy: metadataBase resolves relative OG image paths against
 * it, so a link shared in Slack from a preview would try to load its preview
 * image from a domain that is not serving this site yet, and show nothing.
 *
 * VERCEL_URL is the per-deployment hostname with no protocol; it is always
 * https.
 */
export function publicSiteUrl(): string {
  if (isLiveSite) return siteUrl
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return "http://localhost:3000"
}
