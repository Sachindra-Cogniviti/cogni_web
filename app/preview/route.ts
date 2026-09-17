import { draftMode } from "next/headers"
import { redirect } from "next/navigation"
import { getPayload } from "payload"

import config from "@/payload.config"
import { isPreviewCollection, pagePath } from "@/lib/preview"

/**
 * GET /preview/?collection=posts&slug=…
 *
 * The door into a draft (see lib/preview.ts). Whoever arrives must already
 * be signed in to the admin: Payload's session cookie comes along because
 * the admin and the site are one origin, and `payload.auth` reads it the
 * same way the admin does. With a user, Next's draft mode is switched on
 * for this browser - a cookie of its own - and the visitor is sent to the
 * page, which now renders the latest draft and skips the static cache.
 * Without one, a 401 and nothing else: no redirect, no cookie.
 *
 * At the app root rather than in (frontend) for the same reason robots.ts
 * is - see the Payload section in CLAUDE.md.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const collection = searchParams.get("collection")
  const slug = searchParams.get("slug")

  if (!isPreviewCollection(collection) || !slug || !/^[a-z0-9-]+$/.test(slug)) {
    return new Response("Nothing to preview.", { status: 400 })
  }

  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: request.headers })
  if (!user) {
    return new Response("Sign in to the admin to preview a draft.", {
      status: 401,
    })
  }

  const draft = await draftMode()
  draft.enable()
  redirect(pagePath(collection, slug))
}
