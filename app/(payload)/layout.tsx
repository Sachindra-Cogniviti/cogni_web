/* Payload's own root layout. It is a sibling route group to (frontend), which
 * is the whole reason the site moved into a group: the site's layout loads
 * fonts, a theme provider and the page's motion config, and wrapping the admin
 * in all of that would fight Payload's own styling. Neither layout sees the
 * other, and route groups do not appear in the URL, so the site stays at /. */
import type { ServerFunctionClient } from "payload"

import config from "@payload-config"
import { RootLayout, handleServerFunctions } from "@payloadcms/next/layouts"

import { importMap } from "./admin/importMap.js"

import "@payloadcms/next/css"

const serverFunction: ServerFunctionClient = async function (args) {
  "use server"
  return handleServerFunctions({ ...args, config, importMap })
}

export default function PayloadLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
      {children}
    </RootLayout>
  )
}
