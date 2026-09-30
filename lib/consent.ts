/**
 * The visitor's analytics choice.
 *
 * One module-level store rather than React context, because the three
 * parties involved sit in different trees: the banner
 * (components/consent-banner.tsx), the footer's "Cookie settings" button
 * (components/cookie-settings.tsx) and the PostHog boot
 * (components/analytics.tsx). A context would force a provider around the
 * whole frontend layout to share one string.
 *
 * The choice persists in localStorage. Every read and write is wrapped
 * because storage can throw (private windows, blocked site data), and an
 * unreadable store just means the banner shows again - the safe failure.
 *
 * No choice yet is `null`, and it is a real state, not a pending one: the
 * banner is open and analytics run cookieless. See components/analytics.tsx
 * for what each state means to PostHog.
 */

export type ConsentChoice = "granted" | "denied"

const STORAGE_KEY = "cogniviti-consent"

type Listener = () => void
const listeners = new Set<Listener>()

/** Reopened from the footer after a choice was already made. */
let reopened = false

export function getConsent(): ConsentChoice | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)
    return value === "granted" || value === "denied" ? value : null
  } catch {
    return null
  }
}

export function setConsent(choice: ConsentChoice) {
  try {
    window.localStorage.setItem(STORAGE_KEY, choice)
  } catch {
    // Nothing to do: the choice still applies for this page view through
    // the notification below, it just will not be remembered.
  }
  reopened = false
  notify()
}

/** Whether the banner should be showing right now. */
export function isConsentBannerOpen(): boolean {
  return reopened || getConsent() === null
}

export function openConsentBanner() {
  reopened = true
  notify()
}

export function subscribeConsent(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function notify() {
  for (const listener of listeners) listener()
}
