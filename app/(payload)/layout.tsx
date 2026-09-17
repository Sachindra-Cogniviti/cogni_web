/* Payload's own root layout. It is a sibling route group to (frontend), which
 * is the whole reason the site moved into a group: the site's layout wraps
 * the page in a theme provider and a motion config, neither of which belongs
 * around the admin. Neither layout sees the other, and route groups do not
 * appear in the URL, so the site stays at /.
 *
 * What the two do share is the type. The site's three faces are handed to
 * Payload as inline properties on <html>, under the names Payload reads
 * (--font-body, --font-mono, --font-serif). Inline rather than a class
 * because app/fonts.ts names its mono variable --font-mono, which is also
 * the name Payload declares on :root, and an inline value settles that
 * without leaning on layer order. The palette lives in custom.css. */
import type { CSSProperties } from "react"
import type { ServerFunctionClient } from "payload"

import config from "@payload-config"
import { RootLayout, handleServerFunctions } from "@payloadcms/next/layouts"

import { fontMono, fontSans, fontSerif } from "@/app/fonts"

import { importMap } from "./admin/importMap.js"

import "@payloadcms/next/css"
import "./custom.css"

const serverFunction: ServerFunctionClient = async function (args) {
  "use server"
  return handleServerFunctions({ ...args, config, importMap })
}

const fonts = {
  "--font-body": fontSans.style.fontFamily,
  "--font-mono": fontMono.style.fontFamily,
  "--font-serif": fontSerif.style.fontFamily,
} as CSSProperties

export default function PayloadLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RootLayout
      config={config}
      importMap={importMap}
      serverFunction={serverFunction}
      htmlProps={{ style: fonts }}
    >
      {children}
    </RootLayout>
  )
}
