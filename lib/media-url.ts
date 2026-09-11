/**
 * The public base URL that uploaded media is served from, or undefined if
 * there isn't one yet.
 *
 * R2 gives you two hostnames and only one of them is public:
 *
 *   <account>.r2.cloudflarestorage.com   the S3 API. Every request must be
 *                                        SigV4-signed, so a browser hitting it
 *                                        gets a 403. It is also the value of
 *                                        R2_ENDPOINT, which makes it the
 *                                        obvious thing to paste here.
 *   media.example.com                    a custom domain bound to the bucket.
 *                                        Public, and on Cloudflare's CDN.
 *
 * Pasting the first one produces a site whose images all fail with no clue
 * why, so it is rejected here rather than trusted. Returning undefined is a
 * safe state, not a broken one: Payload falls back to serving media through
 * the app's own route, which works, just without the CDN in front.
 */
const S3_API_HOST = ".r2.cloudflarestorage.com"

export function publicMediaBaseUrl(): string | undefined {
  const raw = process.env.R2_PUBLIC_URL?.trim()
  if (!raw) return undefined

  let url: URL
  try {
    url = new URL(raw)
  } catch {
    console.warn(`R2_PUBLIC_URL is not a valid URL (${raw}); serving media through the app.`)
    return undefined
  }

  if (url.hostname.endsWith(S3_API_HOST)) {
    console.warn(
      "R2_PUBLIC_URL points at the R2 S3 API endpoint, which is not publicly readable — " +
        "bind a custom domain to the bucket and use that. Serving media through the app for now."
    )
    return undefined
  }

  // Trailing slashes would double up when joined with the file key.
  return raw.replace(/\/+$/, "")
}
