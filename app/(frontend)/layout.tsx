import type { Metadata } from "next"
import { MotionConfig } from "motion/react"

import "./globals.css"
import { fontMono, fontSans, fontSerif } from "@/app/fonts"
import { RevealObserver } from "@/components/reveal-observer"
import { SmoothAnchors } from "@/components/smooth-anchors"
import { ThemeProvider } from "@/components/theme-provider"
import { site } from "@/content/site"
import { isProductionDeployment, publicSiteUrl } from "@/lib/deployment"
import { cn } from "@/lib/utils"

const origin = publicSiteUrl()

export const metadata: Metadata = {
  // The origin this deployment actually answers on, not the production domain.
  // A preview emitting production canonicals and OG URLs is both confusing to
  // a colleague sharing the link and wrong to hand a crawler.
  metadataBase: new URL(origin),
  title: {
    default: site.title,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  // Indexing is ON for the production deployment only. Every preview and local
  // build says noindex, nofollow. The WordPress staging install also has it
  // off; make sure the live site does not inherit a noindex from there.
  robots: isProductionDeployment
    ? { index: true, follow: true }
    : { index: false, follow: false },
  openGraph: {
    type: "website",
    siteName: site.name,
    title: site.title,
    description: site.description,
    url: origin,
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
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
 */
const markScripted = `document.documentElement.classList.add('js')`

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
