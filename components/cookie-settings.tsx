"use client"

import { Roll } from "@/components/primitives"
import { cookieNotice } from "@/content/site"
import { openConsentBanner } from "@/lib/consent"

/**
 * Reopens the cookie notice from the footer's legal row.
 *
 * Consent that cannot be withdrawn as easily as it was given is not
 * consent, so this sits beside the privacy policy on every page. A button
 * styled as the links around it, because it acts on the page rather than
 * navigating - and its own client component so the footer stays on the
 * server.
 */
export function CookieSettings() {
  return (
    <button
      type="button"
      onClick={openConsentBanner}
      className="cursor-pointer text-ink-faint transition-colors duration-[var(--roll-duration)] ease-[var(--roll-ease)] hover:text-night-fg"
    >
      <Roll>{cookieNotice.settings}</Roll>
    </button>
  )
}
