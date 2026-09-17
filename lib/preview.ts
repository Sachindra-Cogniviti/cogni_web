import type { LivePreviewConfig } from "payload"

import { publicSiteUrl } from "@/lib/deployment"

/**
 * Previewing a draft on the real page.
 *
 * A post or client story is previewed on the same route that will serve it
 * once published - /blog/[slug] or /work/[slug] - not in a mock-up of it.
 * Both of Payload's preview surfaces go through one door, the route at
 * app/preview/route.ts: the Preview button opens it in a tab, and the Live
 * Preview panel loads it in an iframe. The route checks that the visitor is
 * signed in to the admin, switches Next's draft mode on for their browser,
 * and sends them to the page, which then reads the latest draft instead of
 * the published version (lib/cms.ts). Nobody without an admin session can
 * get the page to show a draft, whatever they put in the URL.
 *
 * The one thing the config here has to know is which page a collection is
 * served at. It is written once for the collections and once, inverted,
 * for the route, so that a new previewable collection is a one-line change
 * in PAGE_BASE.
 */

export type PreviewCollection = "posts" | "client-stories"

export const PAGE_BASE: Record<PreviewCollection, string> = {
  posts: "/blog",
  "client-stories": "/work",
}

export function isPreviewCollection(
  value: string | null
): value is PreviewCollection {
  return value !== null && value in PAGE_BASE
}

/** The public path a document is (or will be) served at. */
export function pagePath(collection: PreviewCollection, slug: string): string {
  return `${PAGE_BASE[collection]}/${slug}/`
}

/**
 * The URL Payload opens to preview a document, or null before the document
 * has a slug - a brand-new, unsaved post has nowhere to be previewed yet,
 * and null is how Payload is told not to offer it.
 */
export function previewUrl(
  collection: PreviewCollection,
  slug: unknown
): null | string {
  if (typeof slug !== "string" || slug.length === 0) return null
  const query = new URLSearchParams({ collection, slug })
  return `${publicSiteUrl()}/preview/?${query}`
}

/**
 * The Live Preview panel's settings for a collection. The breakpoints are
 * the widths the site is actually designed at: the nav collapses below
 * 1120px and the article measure is set for the desktop column.
 */
export function livePreview(collection: PreviewCollection): LivePreviewConfig {
  return {
    url: ({ data }) => previewUrl(collection, data.slug),
    breakpoints: [
      { name: "phone", label: "Phone", width: 390, height: 844 },
      { name: "tablet", label: "Tablet", width: 834, height: 1194 },
      { name: "laptop", label: "Laptop", width: 1280, height: 800 },
    ],
  }
}
