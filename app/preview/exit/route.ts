import { draftMode } from "next/headers"
import { redirect } from "next/navigation"

/**
 * GET /preview/exit/?path=/blog/some-post/
 *
 * Switches draft mode off for this browser and returns to the page, which
 * then serves the published version again - or a 404, if there is not one
 * yet. Only a path on this site is accepted as the destination, so the
 * route cannot be used to bounce a visitor elsewhere.
 */
export async function GET(request: Request) {
  const path = new URL(request.url).searchParams.get("path") ?? "/"
  const draft = await draftMode()
  draft.disable()
  redirect(path.startsWith("/") && !path.startsWith("//") ? path : "/")
}
