import { createHmac, randomBytes, timingSafeEqual } from "node:crypto"

import { isPreviewCollection, type PreviewCollection } from "./preview"

export const PREVIEW_LIFETIME_SECONDS = 24 * 60 * 60

type PreviewGrant = {
  version: 1
  collection: PreviewCollection
  slug: string
  issuedAt: number
  expiresAt: number
  nonce: string
}

function signature(value: string, secret: string) {
  if (!secret) throw new Error("A signing secret is required for shared previews.")
  return createHmac("sha256", secret)
    .update(`cogniviti-shared-preview-v1:${value}`)
    .digest()
}

export function createSharedPreview(
  collection: PreviewCollection,
  slug: string,
  secret: string,
  now = Math.floor(Date.now() / 1000)
) {
  if (!isPreviewCollection(collection) || !/^[a-z0-9-]+$/.test(slug)) {
    throw new Error("Invalid preview target.")
  }
  const grant: PreviewGrant = {
    version: 1,
    collection,
    slug,
    issuedAt: now,
    expiresAt: now + PREVIEW_LIFETIME_SECONDS,
    nonce: randomBytes(16).toString("base64url"),
  }
  const body = Buffer.from(JSON.stringify(grant)).toString("base64url")
  return {
    token: `${body}.${signature(body, secret).toString("base64url")}`,
    expiresAt: new Date(grant.expiresAt * 1000).toISOString(),
  }
}

export function verifySharedPreview(
  token: string,
  secret: string,
  now = Math.floor(Date.now() / 1000)
): PreviewGrant | null {
  if (!secret || token.length > 2048) return null
  const parts = token.split(".")
  if (parts.length !== 2 || !/^[A-Za-z0-9_-]+$/.test(parts[0]) || !/^[A-Za-z0-9_-]{43}$/.test(parts[1])) return null
  const received = Buffer.from(parts[1], "base64url")
  const expected = signature(parts[0], secret)
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) return null
  try {
    const grant = JSON.parse(Buffer.from(parts[0], "base64url").toString())
    if (
      grant.version !== 1 ||
      !isPreviewCollection(grant.collection) ||
      typeof grant.slug !== "string" || !/^[a-z0-9-]+$/.test(grant.slug) ||
      !Number.isSafeInteger(grant.issuedAt) || !Number.isSafeInteger(grant.expiresAt) ||
      grant.issuedAt > now || grant.expiresAt - grant.issuedAt !== PREVIEW_LIFETIME_SECONDS ||
      now >= grant.expiresAt || typeof grant.nonce !== "string"
    ) return null
    return grant
  } catch {
    return null
  }
}
