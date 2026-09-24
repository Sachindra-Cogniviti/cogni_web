import { getPayload } from "payload"

import config from "@/payload.config"
import { publicSiteUrl } from "@/lib/deployment"
import type {
  Author,
  Category,
  ClientStory,
  Media,
  Post,
  Role,
} from "@/payload-types"

/**
 * Reads from Payload for the pages that render its content: the blog at
 * /blog and the client stories at /work.
 *
 * Every read returns an empty result rather than throwing when the database
 * cannot be reached. These pages are content, not transactions; a listing
 * that renders with nothing in it is a better failure than a 500 on a URL a
 * reader found in a search result, and the error is logged for whoever is
 * looking. Only published documents come back: drafts are for the admin.
 *
 * The one exception is a page in Next's draft mode, which asks for a single
 * post or story with `draft: true` and gets the latest draft in place of
 * the published version. Draft mode is only ever switched on by
 * app/preview/route.ts, and only for a browser signed in to the admin, so
 * the access check is skipped for that read rather than re-done: the
 * document is fetched as the system, on behalf of a user the route has
 * already verified. See lib/preview.ts for the whole arrangement.
 *
 * `depth: 1` resolves the relationships one level - the author, the
 * categories, the cover - and no further, which is all the pages show.
 */

async function db() {
  return getPayload({ config })
}

const PUBLISHED = { _status: { equals: "published" } } as const

type ReadOptions = {
  /** Read the latest draft instead of the published version. */
  draft?: boolean
}

export async function getPosts(limit = 50): Promise<Post[]> {
  try {
    const payload = await db()
    const { docs } = await payload.find({
      collection: "posts",
      where: PUBLISHED,
      sort: "-publishedAt",
      limit,
      depth: 1,
      pagination: false,
      overrideAccess: false,
    })
    return docs
  } catch (error) {
    console.error("Posts could not be loaded:", error)
    return []
  }
}

export async function getPost(
  slug: string,
  { draft = false }: ReadOptions = {}
): Promise<Post | null> {
  try {
    const payload = await db()
    const { docs } = await payload.find({
      collection: "posts",
      where: draft
        ? { slug: { equals: slug } }
        : { and: [PUBLISHED, { slug: { equals: slug } }] },
      draft,
      limit: 1,
      depth: 1,
      pagination: false,
      overrideAccess: draft,
    })
    return docs[0] ?? null
  } catch (error) {
    console.error(`Post ${slug} could not be loaded:`, error)
    return null
  }
}

/**
 * Open roles, newest first.
 *
 * Here rather than inline in the careers page because three things read them
 * now: that page, the role's own page at /careers/[slug], and the sitemap.
 * Same empty-list-on-failure contract as the rest of this module - a
 * candidate arriving from a job board should see a careers page with no
 * openings rather than a 500.
 */
export async function getRoles(limit = 50): Promise<Role[]> {
  try {
    const payload = await db()
    const { docs } = await payload.find({
      collection: "roles",
      where: PUBLISHED,
      sort: "-postedAt",
      limit,
      // No relationships on a role, so nothing to resolve.
      depth: 0,
      pagination: false,
      overrideAccess: false,
    })
    return docs
  } catch (error) {
    console.error("Roles could not be loaded:", error)
    return []
  }
}

export async function getRole(
  slug: string,
  { draft = false }: ReadOptions = {}
): Promise<Role | null> {
  try {
    const payload = await db()
    const { docs } = await payload.find({
      collection: "roles",
      where: draft
        ? { slug: { equals: slug } }
        : { and: [PUBLISHED, { slug: { equals: slug } }] },
      draft,
      limit: 1,
      depth: 0,
      pagination: false,
      overrideAccess: draft,
    })
    return docs[0] ?? null
  } catch (error) {
    console.error(`Role ${slug} could not be loaded:`, error)
    return null
  }
}

export async function getStories(limit = 50): Promise<ClientStory[]> {
  try {
    const payload = await db()
    const { docs } = await payload.find({
      collection: "client-stories",
      where: PUBLISHED,
      sort: "-publishedAt",
      limit,
      depth: 1,
      pagination: false,
      overrideAccess: false,
    })
    return docs
  } catch (error) {
    console.error("Client stories could not be loaded:", error)
    return []
  }
}

export async function getStory(
  slug: string,
  { draft = false }: ReadOptions = {}
): Promise<ClientStory | null> {
  try {
    const payload = await db()
    const { docs } = await payload.find({
      collection: "client-stories",
      where: draft
        ? { slug: { equals: slug } }
        : { and: [PUBLISHED, { slug: { equals: slug } }] },
      draft,
      limit: 1,
      depth: 1,
      pagination: false,
      overrideAccess: draft,
    })
    return docs[0] ?? null
  } catch (error) {
    console.error(`Client story ${slug} could not be loaded:`, error)
    return null
  }
}

/* ---------------------------------------------------------------------------
 * Shapes. A relationship arrives as the related document at depth 1 and as
 * its id at depth 0; these narrow to the document and give back null for an
 * id, so a template never has to care which it was handed.
 * ------------------------------------------------------------------------- */

export function mediaOf(
  value: number | Media | null | undefined
): Media | null {
  return value && typeof value === "object" ? value : null
}

export function authorOf(value: number | Author): Author | null {
  return typeof value === "object" ? value : null
}

export function categoriesOf(
  value: (number | Category)[] | null | undefined
): Category[] {
  return (value ?? []).filter((c): c is Category => typeof c === "object")
}

/**
 * An upload's URL as next/image wants it.
 *
 * Payload writes media URLs against `serverURL`, so a file served by this
 * app arrives as "http://localhost:3000/api/media/file/x.jpg" - which
 * next/image refuses, since no remote host is configured for it. The
 * origin is this deployment's own, so it is dropped and the path is used;
 * a file on the bucket's domain is left alone, and next.config.ts allows
 * that host.
 */
export function mediaUrl(url: string): string {
  const origin = publicSiteUrl()
  return url.startsWith(origin) ? url.slice(origin.length) : url
}

/**
 * The best rendition of an upload for a given use, with its dimensions.
 * A rendition larger than the original is never generated, so a small
 * upload falls back to itself rather than to nothing.
 */
export function imageSource(
  media: Media,
  size: "thumbnail" | "inline" | "cover"
): { src: string; width: number; height: number } | null {
  const rendition = media.sizes?.[size]
  const src = rendition?.url ?? media.url
  const width = rendition?.width ?? media.width
  const height = rendition?.height ?? media.height
  if (!src || !width || !height) return null
  return { src: mediaUrl(src), width, height }
}

/* ---------------------------------------------------------------------------
 * Text
 * ------------------------------------------------------------------------- */

type LexicalNode = { type?: string; text?: string; children?: LexicalNode[] }

/** The plain words of a rich-text field, for reading time and previews. */
export function plainText(
  body: { root: LexicalNode } | null | undefined
): string {
  if (!body?.root) return ""
  const out: string[] = []
  const walk = (node: LexicalNode) => {
    if (typeof node.text === "string") out.push(node.text)
    node.children?.forEach(walk)
    if (node.type === "paragraph" || node.type === "heading") out.push("\n")
  }
  walk(body.root)
  return out.join(" ").replace(/\s+/g, " ").trim()
}

/** Minutes at a reading pace of 220 words a minute, never less than one. */
export function readingTime(
  body: { root: LexicalNode } | null | undefined
): number {
  const words = plainText(body).split(" ").filter(Boolean).length
  return Math.max(1, Math.round(words / 220))
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

/**
 * A story's delivery path, as the stops before Production.
 *
 * The authored `stages` when the editor has written them - that is what a
 * delivery path is. Otherwise the story's platforms and then its regions,
 * which at least say what was implemented and where, so a story published
 * without a path still has stops rather than a blank line.
 */
export function deliveryPath(story: ClientStory): string[] {
  const stages = (story.stages ?? []).map((s) => s.label).filter(Boolean)
  if (stages.length) return stages
  return [
    ...(story.platform ?? []).map((p) => PLATFORM_LABEL[p]),
    ...(story.region ?? []).map((r) => REGION_LABEL[r]),
  ]
}

/* ---------------------------------------------------------------------------
 * Labels for the client-story taxonomy. The collection stores the machine
 * value; these are what the reader sees.
 * ------------------------------------------------------------------------- */

export const PLATFORM_LABEL: Record<
  NonNullable<ClientStory["platform"]>[number],
  string
> = {
  coupa: "Coupa",
  gep: "GEP",
  ivalua: "Ivalua",
  onestream: "OneStream",
  sap: "SAP",
  oracle: "Oracle",
  netsuite: "NetSuite",
  dynamics: "Dynamics 365",
}

export const REGION_LABEL: Record<
  NonNullable<ClientStory["region"]>[number],
  string
> = {
  singapore: "Singapore",
  india: "India",
  indonesia: "Indonesia",
  "united-kingdom": "United Kingdom",
  "south-africa": "South Africa",
  thailand: "Thailand",
}

/* ---------------------------------------------------------------------------
 * The same for roles. Typed against the collection's own select values, so
 * adding an option to payload/collections/roles.ts without a label here is a
 * type error rather than a machine value leaking onto the page.
 *
 * Shared rather than local to the careers page, because the role's own page
 * and the JobPosting structured data in lib/schema.ts need the same strings -
 * and `occupationalCategory` saying something different from the page would
 * be exactly the drift these maps exist to prevent.
 * ------------------------------------------------------------------------- */

export const DISCIPLINE_LABEL: Record<Role["discipline"], string> = {
  "platform-consulting": "Platform consulting",
  "integration-data": "Integration and data engineering",
  "product-engineering": "Product engineering",
  "applied-ai": "Applied AI",
}

export const ROLE_TYPE_LABEL: Record<Role["type"], string> = {
  "full-time": "Full time",
  contract: "Contract",
  internship: "Internship",
}

export const REMOTE_LABEL: Record<NonNullable<Role["remote"]>, string> = {
  onsite: "On site",
  hybrid: "Hybrid",
  remote: "Remote",
}
