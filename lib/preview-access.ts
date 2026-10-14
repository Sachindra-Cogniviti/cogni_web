import { cookies, draftMode, headers } from "next/headers"
import { getPayload } from "payload"

import config from "@/payload.config"
import type { PreviewCollection } from "@/lib/preview"
import { SHARED_PREVIEW_COOKIE, verifySharedPreview } from "@/lib/shared-preview"

/**
 * Who may see the latest draft of this one article. Reads only cookies and
 * headers, never searchParams: these pages are ISR (`revalidate`), and a
 * query-string read on one throws DYNAMIC_SERVER_USAGE. The share route
 * (app/preview/share) switches draft mode on, which makes Next render the
 * request dynamically, and sets a signed cookie naming the one article.
 * That cookie is re-verified on every request, so expiry is enforced here.
 */
export async function previewAccess(
  collection: PreviewCollection,
  slug: string
): Promise<{ draft: boolean; sharedExpiresAt?: string }> {
  const { isEnabled } = await draftMode()
  if (!isEnabled) return { draft: false }
  const token = (await cookies()).get(SHARED_PREVIEW_COOKIE)?.value
  const grant = token ? verifySharedPreview(token, process.env.PAYLOAD_SECRET || "") : null
  if (grant && grant.collection === collection && grant.slug === slug) {
    return { draft: true, sharedExpiresAt: new Date(grant.expiresAt * 1000).toISOString() }
  }
  // An editor's bypass cookie alone must never grant a guest access to drafts.
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  return { draft: Boolean(user) }
}
