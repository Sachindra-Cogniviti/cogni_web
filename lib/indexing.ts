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
 *
 * This file deliberately imports nothing. next.config.ts reads it, and that is
 * loaded by Next's own config loader, which transpiles TypeScript but does not
 * resolve the "@/" path alias - an import here would break the build.
 */
export const indexingEnabled = false
