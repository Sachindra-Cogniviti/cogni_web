"use client"

import * as React from "react"

import { registerAnalytics } from "@/lib/analytics"
import { getConsent, subscribeConsent } from "@/lib/consent"

/**
 * Boots PostHog, under two gates.
 *
 * The first is timing. Like the hero galaxy, this waits for the `load`
 * event and then an idle callback before importing posthog-js: an effect
 * alone fires the moment React hydrates, which on a throttled phone is the
 * middle of the headline's reveal, and parsing another library there is a
 * main-thread task the LCP pays for. Nothing analytics measures needs to
 * exist that early - the pageview is captured whenever init runs.
 *
 * The second is consent (lib/consent.ts), in the cookieless-first model:
 *
 * - No choice yet, or declined: PostHog runs with `persistence: "memory"`
 *   and no session recording. No cookie, no localStorage, no identity that
 *   outlives the tab - visits are counted, anonymously.
 * - Accepted: persistence moves to cookies (so a return visit is the same
 *   visitor) and session recording starts, with input masking left on
 *   PostHog's default. Withdrawing calls reset() while the cookie store is
 *   still current, so what it held is cleared, then drops back to memory.
 *
 * Requests go to `/ingest`, rewritten in next.config.ts to PostHog's EU
 * ingest hosts, so they are first-party and survive ad-blockers. The
 * `ui_host` points debug links and the toolbar at the EU app. `defaults`
 * pins the config generation: it makes pageview capture follow App Router
 * navigations (`history_change`) and keeps person profiles to identified
 * users, so anonymous traffic stays anonymous on PostHog's side too.
 *
 * The key is the project's publishable token - in the bundle by design,
 * not a secret. Unset (a fork, a bare clone), this renders nothing and
 * boots nothing.
 */
export function Analytics() {
  React.useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
    if (!key) return

    let cancelled = false
    let unsubscribe: (() => void) | undefined
    let idle: number | undefined

    const boot = async () => {
      const { default: posthog } = await import("posthog-js")
      if (cancelled) return

      const granted = getConsent() === "granted"
      posthog.init(key, {
        api_host: "/ingest",
        ui_host: "https://eu.posthog.com",
        defaults: "2025-05-24",
        persistence: granted ? "localStorage+cookie" : "memory",
        disable_session_recording: !granted,
      })

      unsubscribe = subscribeConsent(() => {
        if (getConsent() === "granted") {
          posthog.set_config({ persistence: "localStorage+cookie" })
          posthog.startSessionRecording()
        } else if (posthog.config.persistence !== "memory") {
          // Withdrawal. reset() clears the *current* store, so it must run
          // before persistence changes hands, or the cookie identity would
          // survive the very thing meant to remove it.
          posthog.stopSessionRecording()
          posthog.reset()
          posthog.set_config({ persistence: "memory" })
        }
      })

      registerAnalytics(posthog)
    }

    const whenIdle = () => {
      if ("requestIdleCallback" in window) {
        idle = window.requestIdleCallback(() => void boot(), { timeout: 4000 })
      } else {
        void boot()
      }
    }

    if (document.readyState === "complete") whenIdle()
    else window.addEventListener("load", whenIdle, { once: true })

    return () => {
      cancelled = true
      window.removeEventListener("load", whenIdle)
      if (idle !== undefined) window.cancelIdleCallback?.(idle)
      unsubscribe?.()
    }
  }, [])

  return null
}
