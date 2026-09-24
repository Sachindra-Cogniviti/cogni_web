import { notFound } from "next/navigation"

/**
 * Catches every URL that matches nothing else, so that it 404s inside the
 * site's own route group.
 *
 * Without this, an unmatched address gets Next's bare built-in 404 rather
 * than app/(frontend)/not-found.tsx: a not-found file inside a route group
 * only answers for `notFound()` raised by that group's own segments, and a
 * URL matching no segment at all belongs to no group. The alternative is a
 * not-found.tsx at the app root, which - because the root has no layout,
 * each group having its own - would have to render its own <html> and
 * <body> and so its own copy of the fonts, the theme and the motion config.
 * One 404 page in the site's shell is better than two that must be kept in
 * step.
 *
 * It cannot shadow /admin or /api: Next matches a literal segment before a
 * dynamic one and a dynamic one before a catch-all, so this is only ever
 * reached once every real route has declined. Verified against both.
 */
export default function CatchAll(): never {
  notFound()
}
