import { withPayload } from "@payloadcms/next/withPayload"
import type { NextConfig } from "next"

import { publicMediaBaseUrl } from "./lib/media-url"

// The host media is served from, taken from R2_PUBLIC_URL so the bucket's
// domain is configured in one place rather than duplicated here as a literal.
// Undefined until a custom domain is bound, in which case media is served
// from this app's own origin and needs no remote pattern at all.
const mediaBaseUrl = publicMediaBaseUrl()
const mediaHostname = mediaBaseUrl ? new URL(mediaBaseUrl).hostname : undefined

const nextConfig: NextConfig = {
  // Trailing slashes are kept from the Bluehost era on purpose. Nothing here
  // needs them any more, but they are the URL shape the sitemap, the canonical
  // metadata and the 301s off the old WordPress site were all written against.
  // Changing it would move every URL for no gain.
  trailingSlash: true,

  // Media uploaded through the admin is served from the Cloudflare R2 bucket's
  // public domain, so next/image has to be told that host may be optimised.
  // Driven by env because the hostname is whatever custom domain is bound to
  // the bucket; an unset value simply allows nothing, which fails loudly at
  // the first image rather than silently serving unoptimised originals.
  images: {
    remotePatterns: mediaHostname
      ? [{ protocol: "https", hostname: mediaHostname }]
      : [],
  },

  // Apache used to set this from .htaccess. Vercel sets compression, HTTPS,
  // MIME types and the immutable cache on /_next/static itself, but it does
  // not add this one, and dropping it silently would be a real regression.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [{ key: "X-Content-Type-Options", value: "nosniff" }],
      },
    ]
  },
}

// withPayload wires the admin route group, the server functions it needs and
// the externals that must not be bundled for the browser.
export default withPayload(nextConfig)
