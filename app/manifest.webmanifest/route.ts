import { site } from "@/content/site"

export const dynamic = "force-static"

/**
 * The web app manifest.
 *
 * A route with the extension in its path rather than Next's `manifest.ts`
 * convention, which serves at `/manifest.webmanifest` but is declined from
 * inside a route group - and at the app root it would sit beside robots.ts
 * and sitemap.ts anyway, which is where the files that must not be moved
 * live. See the note in app/robots.ts.
 *
 * Minimal on purpose. This site is not an installable application and does
 * not want to be one: `display: "browser"` keeps an install, if anyone makes
 * one, opening in a normal tab with the address bar the site's own
 * navigation assumes. What the manifest is actually here for is the icon
 * set and the name, which Android uses for a home-screen shortcut and some
 * crawlers read as a second source for the site name.
 */
export function GET() {
  return Response.json({
    name: site.name,
    short_name: site.name,
    description: site.seo.description,
    start_url: "/",
    scope: "/",
    display: "browser",
    // The page ground and the crimson the mark is drawn in.
    background_color: "#faf8f5",
    theme_color: "#faf8f5",
    lang: site.locale,
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icon-maskable.png",
        sizes: "512x512",
        type: "image/png",
        // Inset inside the safe zone so a platform that crops to a circle
        // does not clip the mark.
        purpose: "maskable",
      },
    ],
  })
}
