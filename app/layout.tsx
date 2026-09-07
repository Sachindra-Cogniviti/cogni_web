import type { Metadata } from "next"

import "./globals.css"
import { fontMono, fontSans } from "@/app/fonts"
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
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang={site.locale}
      suppressHydrationWarning
      className={cn("antialiased font-sans", fontSans.variable, fontMono.variable)}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
