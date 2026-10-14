import { cookies, draftMode } from "next/headers"
import { getPayload } from "payload"

import config from "@/payload.config"
import { publicSiteUrl } from "@/lib/deployment"
import { isPreviewCollection, pagePath } from "@/lib/preview"
import { SHARED_PREVIEW_COOKIE, createSharedPreview, verifySharedPreview } from "@/lib/shared-preview"

const privateHeaders = {
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
  "Referrer-Policy": "no-referrer",
}

/** Only signed-in editors can generate links, and only for a readable saved document. */
export async function POST(request: Request) {
  const origin = request.headers.get("origin")
  const siteOrigin = new URL(publicSiteUrl()).origin
  if (origin && origin.replace("://www.", "://") !== siteOrigin.replace("://www.", "://")) {
    return Response.json({ error: "Invalid request origin." }, { status: 403, headers: privateHeaders })
  }
  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    return Response.json({ error: "Send a JSON request." }, { status: 415, headers: privateHeaders })
  }
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: request.headers })
  if (!user) return Response.json({ error: "Sign in to create a preview link." }, { status: 401, headers: privateHeaders })
  let input: { collection?: unknown; id?: unknown }
  try { input = await request.json() } catch {
    return Response.json({ error: "Invalid request." }, { status: 400, headers: privateHeaders })
  }
  if (!isPreviewCollection(typeof input.collection === "string" ? input.collection : null) || typeof input.id !== "number" || !Number.isSafeInteger(input.id) || input.id < 1) {
    return Response.json({ error: "Choose a saved post or client story." }, { status: 400, headers: privateHeaders })
  }
  const collection = input.collection as "posts" | "client-stories"
  const { docs } = await payload.find({
    collection, where: { id: { equals: input.id } }, draft: true,
    limit: 1, depth: 0, overrideAccess: false, user,
  })
  const doc = docs[0]
  if (!doc?.slug) return Response.json({ error: "Save this article with a slug first." }, { status: 404, headers: privateHeaders })
  const { token, expiresAt } = createSharedPreview(collection, doc.slug, process.env.PAYLOAD_SECRET || "")
  const url = new URL("/preview/share/", publicSiteUrl())
  url.searchParams.set("token", token)
  return Response.json({ url: url.toString(), expiresAt }, { headers: privateHeaders })
}

/** No login: the signature grants access to this one article, through a cookie that expires with it. */
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") || ""
  const grant = verifySharedPreview(token, process.env.PAYLOAD_SECRET || "")
  if (!grant) return new Response("This preview link has expired or is invalid. Ask the editor for a new 24-hour link.", { status: 410, headers: privateHeaders })
  const draft = await draftMode()
  draft.enable()
  const jar = await cookies()
  jar.set(SHARED_PREVIEW_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    expires: new Date(grant.expiresAt * 1000),
  })
  const url = new URL(pagePath(grant.collection, grant.slug), publicSiteUrl())
  return new Response(null, { status: 307, headers: { ...privateHeaders, Location: url.toString() } })
}
