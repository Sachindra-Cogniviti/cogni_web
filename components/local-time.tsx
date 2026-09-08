"use client"

import * as React from "react"

/**
 * A clock for one office, formatted in the visitor's browser.
 *
 * Wall time is an external store, so it is read with useSyncExternalStore
 * rather than mirrored into state from an effect. That gets the correct time
 * into the first post-hydration render - no cascading re-render, and no window
 * where the clock is briefly wrong.
 *
 * The server snapshot is an em dash, deliberately. This is a static export:
 * "now" on the server is whatever moment the site was compiled, so rendering a
 * real time there would bake a stale clock into the HTML. React swaps the dash
 * for the live value once hydrated, which is also what the design shows before
 * the clocks resolve.
 */
export function LocalTime({
  timeZone,
  hour12 = false,
  withDay = false,
}: {
  /** IANA zone. Omit for the visitor's own zone. */
  timeZone?: string
  hour12?: boolean
  /** Prefix the short weekday and date, as a menu bar clock does. */
  withDay?: boolean
}) {
  const subscribe = React.useCallback((onChange: () => void) => {
    // 30s is enough for a minute-resolution clock and keeps five of these
    // from waking the main thread more than necessary.
    const timer = window.setInterval(onChange, 30_000)
    return () => window.clearInterval(timer)
  }, [])

  const getSnapshot = React.useCallback(
    () =>
      new Intl.DateTimeFormat("en-GB", {
        ...(withDay ? { weekday: "short", day: "numeric", month: "short" } : {}),
        hour: "2-digit",
        minute: "2-digit",
        hour12,
        timeZone,
      }).format(new Date()),
    [timeZone, hour12, withDay]
  )

  const time = React.useSyncExternalStore(subscribe, getSnapshot, () => "—")

  return <span>{time}</span>
}
