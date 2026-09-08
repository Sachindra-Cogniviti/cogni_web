import type { Metadata } from "next"
import { MotionConfig } from "motion/react"

import "./globals.css"
import { fontMono, fontSans, fontSerif } from "@/app/fonts"
import { RevealObserver } from "@/components/reveal-observer"
import { SmoothAnchors } from "@/components/smooth-anchors"
import { ThemeProvider } from "@/components/theme-provider"
import { site, siteUrl } from "@/content/site"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: site.title,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  // Indexing is ON. The WordPress staging install has it off; make sure the
  // live site does not inherit a noindex from there.
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: site.name,
    title: site.title,
    description: site.description,
    url: siteUrl,
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
            {children}
          </MotionConfig>
        </ThemeProvider>
      </body>
    </html>
  )
}
