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
comes into view. It plays every time the element arrives, not once: on the
way out a block fades back to that start state, so scrolling back up replays
the page. The mono kickers decode on every arrival and again on hover.

Two numbers there govern how a group reads: `DURATION` and `STEP`. What makes a
stagger look like a stagger is the ratio between them, not either alone — at a
step much below a quarter of the duration every item in a group is in flight at
once and the whole thing lands as a block. Both were retuned for this reason;
do not tighten `STEP` without checking a group of eight.

Anything that answers hover - a portrait colouring in, a print lifting off
the careers pile, a certification or delivery-stage cell filling - also
answers a tap on a touch screen, through `components/tap-reveal.tsx`: mark
the element `data-tap`, and a tap toggles `data-active` on it, which the
stylesheet (and Tailwind's `group-data-active:` / `data-active:`) styles
the same way as hover. Hover rules themselves stay behind `(hover: hover)`,
because on a touch screen :hover latches after a tap and never clears.

The hero is the exception: its entrance runs on CSS keyframes
(`hero-arrive` and `blur-text-in` in `app/(frontend)/globals.css`), not
Motion, timed from `HEADLINE_STEP` in `components/hero.tsx` with everything
below the headline derived from that number. CSS because of the largest
contentful paint: a Motion entrance cannot start until React has hydrated,
which on a slow phone is a second or more after the hero is painted, and for
all of that time the biggest text on the page sat invisible. Keyframes start
at first paint, with or without JavaScript. The headline's word-by-word
reveal is still React Bits' BlurText (`components/BlurText.jsx`), rewritten
to emit the spans and delays for those keyframes. `components/BlurText.jsx`
and `components/TextPressure.jsx` are vendored and locally modified — the
reasons are documented at the top of each file, and a re-install from the
registry would overwrite them.

The cascade no longer depends on the main thread, but `HeroGalaxy` still
takes a `startDelay` and does not load three.js until the headline has
landed: parsing three.js during the reveal would still stall the accent
word's pressure sweep and the scramble on the strip, which are JavaScript.

## Small screens

Below the small breakpoint several sections change shape rather than just
stacking, all of it in `max-sm:` classes so nothing waits on a measurement:

- **The nav** collapses to a hamburger and a sheet from the left
  (`components/site-nav.tsx`). The sheet is `absolute` under the bar, not
  `fixed`: the bar's backdrop-filter makes it the containing block for
  fixed descendants anyway, so `fixed` would mean the same thing and say
  something false. The page behind is scroll-locked while it is open.
- **The hero** centres, sets the discipline strip on one line, and shows a
  small galaxy between headline and paragraph (`compact` on
  `HeroGalaxy`: fewer particles, lower pixel ratio, no label pills). The
  scroll drift of the copy block is wide-screen only; in one column it
  opened a gap under the footnote.
- **Certifications** become a row that scrolls sideways and snaps. The
  `min-w-0` on its grid column is load-bearing: the row is wider than the
  screen and the grid would otherwise size its column to the row.
- **The product desktop** wears phone chrome: bezel, status bar with the
  time and a notch, no window controls, the window body scrolling inside a
  fixed-height screen, the Dock as a phone dock over a home indicator. Same
  state and controls; only the chrome changes.
- **The people row** pins on every screen (reduced motion is the only
  exception) with heights in `svh`, so the rule is above a phone's
  address bar. The card width is derived from the viewport height with a
  separate figure per breakpoint, because the heading wraps to more lines
  on a phone and less fits under it. Portraits carry a per-photograph zoom
  (`framing` in `components/people.tsx`) so heads come out one size.
- **The footer** is two columns, with the logo across both.
- `sectionPadding` in `components/primitives.tsx` clamps down to 56px on
  a phone; at 88px each side, two adjacent sections left a screen of
  nothing between one block's end and the next block's reveal.

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
  either way, so moving both breaks only one. `app/llms.txt/route.ts` sits at
  the root for the same reason, and is built from the same content files as
  the pages, so it cannot drift from them.

Run `npm run generate:types` after a schema change to refresh
`payload-types.ts`. Schema changes need a migration too:
`npm run migrate:create <name>` then `npm run migrate`.

The rich-text editor is configured once in `payload.config.ts`: Payload's
defaults plus a table, a code block (`payload/blocks/code.ts`, a block
inside the editor), a caption on inline images, and a fixed toolbar.
Everything it can produce is drawn by `components/rich-text.tsx`, which
overrides Payload's converters where the default markup is wrong for the
page (headings get ids, images become figures, tables and checklists get
the page's own markup, internal links and relationships resolve to
`/blog/` and `/work/` URLs). Adding an editor feature means adding its
converter there and its styles under `.article` in globals.css, then
regenerating the import map.

The admin wears the site's palette and type. `app/(payload)/custom.css`
re-points Payload's `--theme-elevation-*` ramp at paper-to-ink (and, under
`html[data-theme="dark"]`, night-to-night-fg), and `app/(payload)/layout.tsx`
hands the three faces from `app/fonts.ts` to `<html>` as inline properties
under the names Payload reads. It is variable overrides inside Payload's own
`@layer payload`, so Payload's markup is untouched and an upgrade cannot
break the palette. The fragile part is the four class selectors at the
bottom of that file (`.nav__link`, `.nav__link-indicator`,
`.nav-group__toggle`, `.field-label`): check those after bumping
`@payloadcms/*`. The login logo and header mark are
`components/admin/logo.tsx`, cropped out of the one logo file the site
ships, registered under `admin.components.graphics`.

The dashboard is also ours: `components/admin/dashboard.tsx`, registered as
`admin.components.views.dashboard`, replaces Payload's grid of collection
cards with a row per collection (live and draft counts, last edit, a way
in) grouped the way the sidebar is, and a strip for new enquiries. It
reads through the local API as the signed-in user, so it shows exactly
what that user may see. Payload's own widget dashboard
(`admin.dashboard`) is unused while this is in place.

## Pages

The homepage is not the whole site any more:

```
/                     content/site.ts
/products             content/pages.ts  productsPage
/products/[slug]      content/pages.ts  productPages, keyed by Product.slug
/experience           content/pages.ts  experiencePage
/careers              content/pages.ts  careersPage + the Payload roles collection
/contact              content/pages.ts  contactPage + the Payload enquiries collection
/blog                 content/pages.ts  blogPage + the Payload posts collection
/blog/[slug]          the post itself, rich text via components/rich-text.tsx
/work                 content/pages.ts  workPage + the Payload client-stories collection
/work/[slug]          the story itself
```

Everything off the homepage is assembled by `components/page-shell.tsx`:
`PageShell` (nav, hatch band, footer), `PageHeader` (breadcrumb and masthead)
and `PageClose` (the dark closing ask). Sub-pages get no section rail - the
rail lists the homepage's eleven sections and would say less than the
scrollbar on a four-section page.

Three things are easy to break here:

- **Nav and footer hash links are written `/#services`, not `#services`**, so
  they work from a sub-page. `components/smooth-anchors.tsx` recognises both
  and still scrolls in place when the reader is already on `/`.
- **A dark block on a sub-page needs `data-nav-dark`.** The fixed bar decides
  its palette from the homepage section ids in `rail`, which no sub-page has.
- **Do not override a utility that is already in `solidButton` and friends.**
  Two competing utilities are resolved by stylesheet order, not string order,
  so `${solidButton} text-ink` silently lost and rendered paper on paper. Use
  `invertedButton` for the night ground.

The Experience Centre frames each product demo in an iframe. Every `demoUrl`
in `experiencePage.demos` is `null` today, and a product with none shows a
request-a-demonstration panel instead - so each demo goes live by setting one
string. A demo must allow framing: an app sending `X-Frame-Options: DENY`
renders a blank frame with no error the page can catch.

The blog and the client stories read Payload through `lib/cms.ts`, which
returns an empty list rather than throwing when the database is down, and
every one of those pages revalidates each minute.

A draft post or story is previewed on its real page, `/blog/[slug]` or
`/work/[slug]`, in Next's draft mode. Both of Payload's preview surfaces
(the Preview button and the Live Preview panel, set on each collection
from `lib/preview.ts`) open `app/preview/route.ts`, which checks for an
admin session with `payload.auth`, enables draft mode and redirects to the
page. The page reads the latest draft through the `draft` option on
`getPost` and `getStory` and mounts `components/draft-preview.tsx`: a
listener that refreshes the route when the admin saves, and a bottom strip
with the exit link, `app/preview/exit/route.ts`. Live Preview updates on
save, not on every keystroke: that would need autosave on the collections,
which adds a column to the versions tables and so a migration. The route
files are at the app root for the same reason `robots.ts` is. `npm run seed:demo` writes
three fictional posts and three fictional client stories (plus their author,
categories and six photographs from `public/life`) for reviewing the
layouts; the bodies use every node the editor can produce. `npm run
seed:demo:remove` deletes exactly those. Both are in `scripts/seed-demo.ts`.

Media URLs come back from Payload absolute on `serverURL`, and next/image
refuses an absolute URL on an unlisted host - `mediaUrl` in `lib/cms.ts`
turns this app's own origin back into a path. Go through `imageSource`
rather than reading `media.url` directly.

A post or story page carries three things beyond the article: the reading
pill (`components/article-nav.tsx`, a table of contents built from the
body's headings by `lib/headings.ts`, which is also what gives the headings
their ids), a share row (`components/share-row.tsx`), and a share card.

Share cards are `og.png` route handlers - `app/og.png` for the site,
`app/(frontend)/blog/[slug]/og.png` and `app/(frontend)/work/[slug]/og.png`
for a post and a story - drawn by `lib/og.tsx` with `next/og`. Not Next's
`opengraph-image.tsx` convention: with `trailingSlash` on, its
extensionless URL is redirected to a slash it does not answer on. The
renderer has no fallback font and fails with none loaded, so the three
faces are checked in under `assets/fonts` and read from disk. Every page
names its card through `pageMetadata` in `lib/metadata.ts`, which also
writes the full Open Graph and Twitter sets - Next does not merge those
objects from the layout, so a page that set only a title would share with
the site's description.

The contact form is a server action writing to the `enquiries` collection.
Every new enquiry is announced by email from an `afterChange` hook on the
collection, not from the action, so an enquiry created any other way is
notified too. It goes to `ENQUIRY_NOTIFY_TO`, or the site's contact address
if that is unset.

`trailingSlash: true` applies to `/api/*` as well, so a request to
`/api/posts` answers 308 to `/api/posts/`. Nothing breaks — 308 preserves the
method and body, and Payload's admin works through it — but server-to-server
callers should use the trailing slash to skip the extra hop.

Outbound mail is Resend, through `@payloadcms/email-resend`, switched on by
`RESEND_API_KEY`. Without the key Payload prints each email to the server
log instead of sending it, which is fine locally and means nobody can reset a
password in production. Going live needs: a Resend account, the sending
domain verified there (DNS records from the Resend dashboard), an API key
with sending access, and `RESEND_API_KEY` plus `EMAIL_FROM` (an address on
the verified domain) set in Vercel for Production and Preview. The reset link
is built from `serverURL`, which follows the deployment, so a reset asked
for on a preview links back to that preview.

Accounts: the first user is made at `/admin/create-first-user` and is always
an admin. Only admins create or remove users and set roles; editors edit
content and their own account. Nobody can remove themselves or the last
admin.

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
