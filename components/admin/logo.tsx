/* The two graphics Payload lets a site supply: the logo above the login
 * form and the small icon at the left of the admin header. Registered in
 * payload.config.ts under admin.components.graphics, and listed in the
 * checked-in import map - so a rename here needs `npm run
 * generate:importmap` (see the Payload section in CLAUDE.md).
 *
 * Both draw the one logo file the site already ships rather than a second
 * colourway for the admin. The file is crimson on transparent and reads on
 * paper as it is; on the night ground of the dark theme it is lifted by a
 * filter set in app/(payload)/custom.css, the same one the site footer
 * uses for the same reason.
 *
 * The header slot is 18px square (.step-nav__home), which a wordmark five
 * times wider than it is tall cannot fill. The file's left 384px is the dot
 * mark on its own, centred in a square, so a `cover` fit anchored to the
 * left edge crops the mark out of the wordmark without a second asset. The
 * image is drawn 24px and pulled in by 3px on each side so the mark fills
 * the slot rather than sitting inside its padding. */
import Image from "next/image"

import logoFile from "@/public/cogniviti-labs-logo.webp"
import { site } from "@/content/site"

const lift = "var(--admin-logo-lift, none)"

export function Logo() {
  return (
    <Image
      src={logoFile}
      alt={site.logo.alt}
      priority
      sizes="200px"
      style={{ filter: lift, height: 36, width: "auto" }}
    />
  )
}

export function Icon() {
  return (
    <Image
      src={logoFile}
      alt={site.logo.alt}
      sizes="128px"
      style={{
        filter: lift,
        height: 24,
        width: 24,
        margin: -3,
        objectFit: "cover",
        objectPosition: "left center",
      }}
    />
  )
}
