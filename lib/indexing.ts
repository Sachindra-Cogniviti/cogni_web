/*
 * The cutover switches. Both are off, and each is turned on by its own
 * deliberate one-line commit.
 *
 * They are separate on purpose: indexing and the WordPress redirects are two
 * different decisions that happen at two different moments. The domain can
 * move to Vercel before the site is ready to be indexed, and the redirects
 * have to be proven on the live domain before crawlers are invited in.
 *
 * This file deliberately imports nothing. next.config.ts reads it, and that is
 * loaded by Next's own config loader, which transpiles TypeScript but does not
 * resolve the "@/" path alias - an import here would break the build.
 */

/**
 * The launch switch. Flip to true when the site goes live, and only then.
 *
 * While this is false EVERY deployment refuses crawlers - Vercel production
 * included. That is the point: the earlier version of this keyed off
 * VERCEL_ENV, which meant whether the site was indexable depended on a Git
 * setting in the Vercel dashboard rather than on anything visible in the repo.
 * Deploy from the production branch by accident and the whole thing was live
 * to Google with no warning and no diff to review.
 *
 * A constant cannot drift. It is in the diff, it is the same on every
 * environment, and turning indexing on is a deliberate one-line commit rather
 * than a side effect of where a branch happened to deploy.
 *
 * To go live: set this to true, push, then confirm /robots.txt says "Allow: /"
 * and the response carries no X-Robots-Tag.
 */
export const indexingEnabled = false

/**
 * The WordPress redirects. Off until the cutover is actually being done.
 *
 * The map itself lives in `redirects()` in next.config.ts and is complete -
 * all 26 URLs the old sitemap_index.xml advertised, verified to resolve in a
 * single hop. This switch decides whether it is served.
 *
 * Off by default because these rules answer for URLs that only make sense
 * once this app is the site on cognivitilabs.com. While WordPress still
 * serves the domain, the rules are unreachable there and merely surprising
 * here - /about/ on a preview deployment bouncing to /#company is a
 * confusing thing to hand a colleague reviewing a build. More to the point,
 * the moment the domain is pointed at Vercel they would all begin firing
 * with no further decision taken, and a redirect map is not something that
 * should switch itself on as a side effect of a DNS change.
 *
 * Turning it on is therefore its own step, taken when the cutover is being
 * run and watched, and it is reversible in one commit if a destination turns
 * out to be wrong.
 *
 * Order at cutover: point the domain, confirm the certificate, turn this on
 * and check the old URLs against the live domain, and only then set
 * `indexingEnabled`. Handing Google a sitemap before the redirects answer is
 * how a migration loses the rankings it was meant to carry over.
 */
export const wordpressRedirectsEnabled = false
