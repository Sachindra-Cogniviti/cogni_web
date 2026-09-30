import type { PostHog } from "posthog-js"

/**
 * The one way the rest of the code sends a custom event.
 *
 * PostHog is loaded lazily by components/analytics.tsx - after the `load`
 * event and an idle callback - so anything that wants to capture cannot
 * import posthog-js directly without pulling the whole library into its
 * own bundle and ahead of that gate. This holds the instance once it is
 * up and drops events until then, which is fine for what goes through it:
 * user actions like a form submission, which cannot happen before a page
 * has long since loaded.
 *
 * The type-only import costs nothing at runtime.
 */

let client: PostHog | null = null

export function registerAnalytics(posthog: PostHog) {
  client = posthog
}

export function track(event: string, properties?: Record<string, unknown>) {
  client?.capture(event, properties)
}
