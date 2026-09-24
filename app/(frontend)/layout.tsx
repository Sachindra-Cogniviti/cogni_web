import type { Metadata } from "next"
import { MotionConfig } from "motion/react"

import "./globals.css"
import { fontMono, fontSans, fontSerif } from "@/app/fonts"
import { JsonLd } from "@/components/json-ld"
import { RevealObserver } from "@/components/reveal-observer"
import { SmoothAnchors } from "@/components/smooth-anchors"
import { TapReveal } from "@/components/tap-reveal"
import { ThemeProvider } from "@/components/theme-provider"
import { site } from "@/content/site"
import { isLiveSite, publicSiteUrl } from "@/lib/deployment"
import { DEFAULT_OG_IMAGE } from "@/lib/metadata"
import { siteGraph } from "@/lib/schema"
import { cn } from "@/lib/utils"

const origin = publicSiteUrl()

export const metadata: Metadata = {
  // The origin this deployment actually answers on, not the production domain.
  // A preview emitting production canonicals and OG URLs is both confusing to
  // a colleague sharing the link and wrong to hand a crawler.
  metadataBase: new URL(origin),
  // The fallback for a page that sets no title of its own, and the template
  // every page that does sets one through. Search-length copy rather than the
  // positioning statement in `site.title` - see `site.seo` in content/site.ts.
  title: {
    default: `${site.seo.title} | ${site.name}`,
    template: `%s | ${site.name}`,
  },
  description: site.seo.description,
  /**
   * Named explicitly rather than through Next's file convention in app/, for
   * the same reason the share cards are (see app/og.png/route.tsx): the
   * convention's generated URLs and `trailingSlash: true` do not agree.
   * These are plain files in public/, cropped from the one logo the site
   * ships - the dot mark occupies its left 384px square.
   *
   * The .ico stays for old browsers. Google's mobile result favicon prefers
   * a PNG whose size divides by 48, which the .ico was not.
   */
  icons: {
    icon: [
      { url: "/icon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
  },
  manifest: "/manifest.webmanifest",
  // noindex everywhere until the launch switch in lib/indexing.ts is thrown,
  // and after that on the production deployment only. The WordPress staging
  // install also has indexing off; make sure the live site does not inherit a
  // noindex from there on top of this one.
  robots: isLiveSite
    ? { index: true, follow: true }
    : { index: false, follow: false },
  // A share card has room the result listing does not, so this keeps the
  // full positioning statement rather than the trimmed search copy.
  openGraph: {
    type: "website",
    siteName: site.name,
    title: site.title,
    description: site.description,
    url: origin,
    locale: "en_GB",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
    images: [DEFAULT_OG_IMAGE],
  },
}

/**
 * Marks the document as scripted before first paint.
 *
 * The scroll-reveal hidden state in globals.css is scoped to `.js`, so that
 * with scripting off the page renders fully visible instead of hiding its own
 * copy behind an animation that can never run. Setting the class from an
 * inline head script rather than an effect means it lands before the browser
 * paints, so there is no flash of revealed content.
 *
 * Development only: a page reached with the browser's back or forward
 * button is left unmarked. The dev server does not hydrate a document the
 * browser reloads for a history navigation (a fresh load and the
 * production build both hydrate it - verified with both), so the entrance
 * states would never play and the page would sit blank until a refresh.
 * Unmarked, it is simply static, as it is with scripting off. Production
 * hydrates such loads and gets its entrances, so it is left alone.
 */
const markScripted =
  process.env.NODE_ENV === "production"
    ? `document.documentElement.classList.add('js')`
    : `if (performance.getEntriesByType('navigation')[0]?.type !== 'back_forward') document.documentElement.classList.add('js')`

/**
 * The page with scripting off.
 *
 * Two things hide content that only JavaScript could ever bring back. The
 * scroll flow is one, and it is already handled: its hidden state is scoped
 * to `.js`, a class the inline script above sets, so it simply never applies
 * here. Motion is the other, and it cannot be scoped that way - it serialises
 * each component's `initial` state as an inline style during the static
 * export, and inline styles win over any stylesheet. On a static export
 * served from plain files that would leave the hero, the map and the product
 * screen blank for anyone without scripting.
 *
 * So this undoes them. It is only ever parsed when scripting is off, costs
 * nothing otherwise, and leaves a page that is simply static rather than one
 * waiting for an animation that will never run. The one decorative layer that
 * has no static meaning - the pointer glow - is dropped instead of frozen.
 *
 * The `translate` reset clears both spellings: a transform function, and the
 * independent `translate` property that the scroll flow and the hero's buttons
 * use so they do not trample Tailwind's hover transforms.
 */
const noScriptStyles = `
[style*="opacity:0"] { opacity: 1 !important; }
[style*="blur("] { filter: none !important; }
[style*="translate"], [style*="scale("], [style*="rotate"] {
  transform: none !important;
  translate: none !important;
}
.pointer-glow { display: none !important; }
`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang={site.locale}
      suppressHydrationWarning
      className={cn(
        "font-sans antialiased",
        fontSans.variable,
        fontMono.variable,
        fontSerif.variable
      )}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: markScripted }} />
        <noscript>
          <style dangerouslySetInnerHTML={{ __html: noScriptStyles }} />
        </noscript>
        {/* Who we are and what this site is, on every page. Everything else
            that emits JSON-LD - an article, a product, a role - refers back
            to the organisation by @id rather than describing it again, so a
            crawler reads one entity instead of several near-identical ones.
            See lib/schema.ts. */}
        <JsonLd data={siteGraph(origin)} />
      </head>
      {/* Browser extensions (the VS Code preview adds class="vsc-initialized")
          mutate <body> before React hydrates. The warning is scoped to this
          element's own attributes; children still hydrate strictly. */}
      <body suppressHydrationWarning>
        {/* The design is light-only: its dark sections are deliberate contrast
            against a light page, not a dark theme. forcedTheme pins it there
            while leaving the provider wired up, so a real dark mode can be
            added later without re-plumbing the app. */}
        <ThemeProvider forcedTheme="light">
          {/* Every Motion component on the page honours the visitor's
              reduced-motion setting: transforms are dropped, opacity stays. */}
          <MotionConfig reducedMotion="user">
            <RevealObserver />
            <SmoothAnchors />
            <TapReveal />
            {/* The two vertical rules that frame the page measure. Fixed and
                full height rather than a border on every Container: a frame
                should not break at each section boundary, and one element
                cannot fall out of step with sixteen. */}
            <div className="page-frame" aria-hidden="true" />
            {children}
          </MotionConfig>
        </ThemeProvider>
      </body>
    </html>
  )
}
