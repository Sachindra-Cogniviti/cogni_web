import { draftMode, headers } from "next/headers"
import { notFound } from "next/navigation"
import { getPayload } from "payload"

import config from "@/payload.config"
import type { PreviewCollection } from "@/lib/preview"
import { verifySharedPreview } from "@/lib/shared-preview"

/** A guest grant is checked on every request and authorizes one article only. */
export async function previewAccess(
  collection: PreviewCollection,
  slug: string,
  token?: string | string[]
): Promise<{ draft: boolean; sharedExpiresAt?: string }> {
  if (token !== undefined) {
    const grant = typeof token === "string"
      ? verifySharedPreview(token, process.env.PAYLOAD_SECRET || "")
      : null
    if (!grant || grant.collection !== collection || grant.slug !== slug) notFound()
    return { draft: true, sharedExpiresAt: new Date(grant.expiresAt * 1000).toISOString() }
  }
  const { isEnabled } = await draftMode()
  if (!isEnabled) return { draft: false }
  // An editor's bypass cookie alone must never grant a guest access to other drafts.
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  return { draft: Boolean(user) }
}
