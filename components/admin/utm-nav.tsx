"use client"

import Link from "next/link"

import { useConfig } from "@payloadcms/ui"

/* The way into /admin/utm from the sidebar, registered under
 * admin.components.afterNavLinks. It borrows Payload's own `nav__link`
 * class so it sits and styles like the collection links above it - one
 * more of the fragile class selectors CLAUDE.md says to check after a
 * `@payloadcms/*` bump. */
export function UtmNavLink() {
  const { config } = useConfig()
  return (
    <Link className="nav__link" href={`${config.routes.admin}/utm`}>
      UTM links
    </Link>
  )
}
