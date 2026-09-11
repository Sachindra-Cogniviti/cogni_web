# cogni_web

Next.js App Router, deployed to Vercel.

## Hosting

Vercel builds from source on push. There is no build output in the repo and no
deploy script: the platform runs `next build` itself and serves the result.

This replaced Bluehost shared hosting, which had no Node runtime and forced the
whole site through `output: "export"`. That constraint is gone. API routes,
middleware, server actions, ISR and `next/image` optimisation are all available
now. If you are reading older comments or commits that say otherwise, they
predate the move.

What Vercel handles that Apache used to need `.htaccess` for: HTTPS forcing,
compression, MIME types, the immutable cache on `/_next/static`, and HTML
revalidation. The one header it does not add is
`X-Content-Type-Options: nosniff`, so that is set in `next.config.ts`.

`trailingSlash: true` is kept deliberately. Nothing needs it any more, but it
is the URL shape the sitemap, the canonical metadata and the 301s off the old
WordPress site were written against.

## Local

```bash
npm install
npm run dev
```

```bash
npm run build
npm start        # serve the production build locally
```

`next build` writes `.next/`, which is gitignored. Nothing needs to be
committed for a deploy beyond the source itself.

Do not leave `npm start` running and then start `npm run dev`. Both use
`.next/`, one serving it and the other rewriting it, and on Windows an open
file handle blocks the delete — so the dev server's child workers die and the
overlay reports `Jest worker encountered 2 child process exceptions, exceeding
retry limit` against whichever route was compiling. The message names neither
the real cause nor the real file. Check for stray `next start` processes,
stop them, delete `.next/`, and start one server.

## Deploy

1. Push to `master`
2. Vercel builds and deploys

Pull requests get their own preview URL. Rolling back is a promote of an
earlier deployment in the Vercel dashboard, not a revert commit.

## Structure

```
app/         layout, page, globals.css, robots, sitemap, font loader
components/  one file per section, plus DotField
content/     all copy. Marketing edits happen here, not in JSX.
public/      fonts, logo
```

Copy lives in `content/` so a wording change is a one-file edit.
`content/site.ts` also holds `siteUrl`, which feeds `robots.txt`,
`sitemap.xml` and `metadataBase`. It must match the production domain.

## Motion

Every block on the page arrives through one mechanism: `lib/scroll-flow.ts`.
The hidden start state lives in `app/globals.css`, scoped to `.js` so the page
is readable with scripting off, and Motion animates out of it when the element
comes into view.

Two numbers there govern how a group reads: `DURATION` and `STEP`. What makes a
stagger look like a stagger is the ratio between them, not either alone — at a
step much below a quarter of the duration every item in a group is in flight at
once and the whole thing lands as a block. Both were retuned for this reason;
do not tighten `STEP` without checking a group of eight.

The hero is the exception: its headline runs on React Bits' BlurText
(`components/BlurText.jsx`), timed from `HEADLINE_STEP` in
`components/hero.tsx`, with everything below it derived from that number.
`components/BlurText.jsx` and `components/TextPressure.jsx` are vendored and
locally modified — the reasons are documented at the top of each file, and a
re-install from the registry would overwrite them.

Because the hero's reveal is timed in JavaScript, anything that blocks the main
thread during it collapses the cascade. That is why `HeroGalaxy` takes a
`startDelay` and does not load three.js until the headline has landed.

## Payload

The CMS lives in this app. Schema is in `payload/collections/`, wired up in
`payload.config.ts`; the admin is `app/(payload)/`, the site is
`app/(frontend)/`. Route groups do not appear in URLs, so the site is still at
`/` and the admin at `/admin`. The site moved into a group because Payload's
admin needs its own root layout — the site's layout loads fonts, a theme
provider and a motion config, none of which belong around the admin.

Only the blog and client stories are modelled in Payload. Homepage copy stays
in `content/site.ts`: those fields are layout instructions, not prose.

Two things that fail confusingly if you forget them:

- **Regenerate the import map after changing plugins or admin components:**
  `npm run generate:importmap`. It is a checked-in file listing every admin
  component, and a stale one fails the build with a module-not-found against a
  package you have already removed.
- **`app/robots.ts` and `app/sitemap.ts` must stay at the app root**, not in
  `(frontend)`. Next silently declines to register `robots.ts` from inside a
  route group — no warning, the route just does not exist. `sitemap.ts` works
  either way, so moving both breaks only one.

Run `npm run generate:types` after a schema change to refresh
`payload-types.ts`. Schema changes need a migration too:
`npm run migrate:create <name>` then `npm run migrate`.

`trailingSlash: true` applies to `/api/*` as well, so a request to
`/api/posts` answers 308 to `/api/posts/`. Nothing breaks — 308 preserves the
method and body, and Payload's admin works through it — but server-to-server
callers should use the trailing slash to skip the extra hop.

There is no email adapter configured yet, so Payload writes password-reset
mail to the console. That needs wiring to Resend before real editors depend
on resetting their own passwords.

Media goes to Cloudflare R2 through the S3 adapter, served from a custom
domain bound to the bucket so it comes off Cloudflare's CDN rather than
through a serverless function. Uploads fall back to local disk when
`R2_BUCKET` is unset — fine locally, broken in production, because a
serverless filesystem does not persist.

## Design

The homepage design is the Claude Design project "Cogniviti Labs v1":
https://claude.ai/design/p/fb4ed92b-d5ca-4602-b442-2b1f02b05937?file=Cogniviti+Labs+v1.dc.html

Reading it needs a one-time `/design-login` from an interactive Claude Code
session. Build only from that file. Do not substitute older exports or the
sibling `cogniviti` project without asking first.

## Cutover

Point the domain at Vercel, verify the certificate issues, 301 the old
WordPress URLs, and leave WordPress in place as rollback. Do not delete it.
Indexing is switched on in `app/layout.tsx` and `app/robots.ts`; the WordPress
staging install has it disabled, so check the live site does not inherit a
`noindex`.
