import { withPayload } from "@payloadcms/next/withPayload"
import type { NextConfig } from "next"

import { indexingEnabled } from "./lib/indexing"
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
    // AVIF first, WebP for browsers without it. AVIF comes out a quarter to
    // a third smaller than WebP at the same quality; the only cost is a
    // slower first encode, which the optimiser caches.
    formats: ["image/avif", "image/webp"],
    remotePatterns: mediaHostname
      ? [{ protocol: "https", hostname: mediaHostname }]
      : [],
  },

  // sharp's native addon is loaded as an external module at runtime, and the
  // addon in @img/sharp-linux-x64 dlopens libvips-cpp.so from a second
  // package, @img/sharp-libvips-linux-x64. Next traces the require of the
  // .node file and stops there - a shared object pulled in by the dynamic
  // linker is invisible to tracing - so the function shipped the addon
  // without the library it links against and every route that imports
  // payload.config (which imports sharp) died on ERR_DLOPEN_FAILED:
  // libvips-cpp.so.8.18.6: cannot open shared object file. A 500 on /admin
  // and on every /api route, while the prerendered pages carried on serving
  // and hid it.
  //
  // Nothing reproduces this locally on Windows: the win32 binary carries its
  // own libvips DLL inside the one package, so there is no second package to
  // miss. The glob is evaluated on the build machine, where only that
  // platform's @img packages are installed, so it is a no-op here and the
  // linux-x64 pair on Vercel.
  outputFileTracingIncludes: {
    "**/*": ["./node_modules/@img/**"],
  },

  /*
   * The WordPress site this replaces, redirected.
   *
   * Taken from its sitemap index (sitemap_index.xml -> page, post, category
   * and author sitemaps), so this is the complete set of URLs it advertised
   * rather than a guess at what was linked. Two of those URLs are absent
   * here on purpose: /privacy-policy/ and /terms-conditions/ are served at
   * the same addresses by this site, and /, /blog/ and /products/ did not
   * move either. A redirect from a URL that still answers is a redirect loop.
   *
   * Permanent (308, which is Next's default for `permanent: true` and
   * preserves the method where a 301 historically did not). These are not
   * provisional: the old URLs are not coming back, and a temporary redirect
   * tells Google to keep the old URL indexed, which is the opposite of what
   * a migration wants.
   *
   * The six /solutions/* pages land on the homepage's platforms section.
   * There is no per-platform page on this site, and sending all six to /
   * would throw away the one piece of information the old URL carried. A
   * fragment is not sent to the server, but it is honoured by the browser
   * from the Location header, so a person lands on the right block; a
   * crawler reads it as the homepage, which is the honest answer given no
   * per-platform page exists. If those pages are ever built, these entries
   * are where they get pointed.
   *
   * Sources are written without the trailing slash and match either form:
   * `trailingSlash: true` normalises an unslashed request to the slashed one
   * before these rules are consulted. Every URL the old sitemap advertised
   * is slashed, so all of those resolve in a single hop. An inbound link
   * written without the slash costs one extra hop through that
   * normalisation, which is inherent to `trailingSlash` and not worth
   * duplicating every rule to avoid. Destinations are slashed, so nothing
   * lands on a URL that then redirects again.
   */
  async redirects() {
    const toPlatforms = [
      "/solutions",
      "/solutions/coupa-solutions",
      "/solutions/gep-solutions",
      "/solutions/ivalua-solutions",
      "/solutions/onestream-solutions",
      "/solutions/oracle-solutions",
      "/solutions/sap-solutions",
    ]

    const moved: [string, string][] = [
      // Company
      ["/about", "/#company"],
      ["/about/why-us", "/#why"],
      ["/team", "/#company"],
      ["/services", "/#services"],
      // Careers
      ["/about/careers", "/careers/"],
      ["/current-openings", "/careers/"],
      // Contact
      ["/contact-us", "/contact/"],
      ["/book-a-discovery-call", "/contact/"],
      // Evidence
      ["/case-studies", "/work/"],
      ["/category/case-studies", "/work/"],
      // The two posts and the leftover taxonomy archives. The EPM post has
      // no equivalent article here yet; /blog/ is the honest destination
      // until one is written, and it is where a reader looking for it will
      // find whatever replaces it.
      ["/enterprise-performance-management", "/blog/"],
      [
        "/maximizing-efficiency-with-proper-technology-implementation-coffee-success-story",
        "/work/",
      ],
      ["/category/uncategorized", "/blog/"],
      ["/author/mohammed-zafar", "/blog/"],
    ]

    return [
      ...toPlatforms.map((source) => ({
        source,
        destination: "/#platforms",
        permanent: true,
      })),
      ...moved.map(([source, destination]) => ({
        source,
        destination,
        permanent: true,
      })),
    ]
  },

  // Apache used to set this from .htaccess. Vercel sets compression, HTTPS,
  // MIME types and the immutable cache on /_next/static itself, but it does
  // not add this one, and dropping it silently would be a real regression.
  async headers() {
    const headers = [{ key: "X-Content-Type-Options", value: "nosniff" }]

    // Belt and braces over robots.txt and the noindex metadata, and the
    // strongest of the three: a header needs no file to be fetched and no
    // markup to be parsed, applies to assets and API routes as well as pages,
    // and is the one signal Google honours for non-HTML responses.
    //
    // Sent on EVERY deployment until launch, production included. Vercel adds
    // its own version on previews, but that stops applying the moment a domain
    // is attached to one - which is exactly when an internal build starts
    // looking like a real site. This does not rely on it.
    if (!indexingEnabled) {
      headers.push({ key: "X-Robots-Tag", value: "noindex, nofollow" })
    }

    return [{ source: "/:path*", headers }]
  },
}

// withPayload wires the admin route group, the server functions it needs and
// the externals that must not be bundled for the browser.
export default withPayload(nextConfig)
