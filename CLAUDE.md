# cogni_web

Next.js App Router with `output: 'export'`, deployed to
Bluehost shared hosting as plain files behind Apache.

## Hard constraints

There is no Node runtime on the server. Everything ships as static HTML, CSS,
JS and fonts. That rules out API routes, middleware, server actions, ISR,
`getServerSideProps` and `next/image` optimisation. If a change needs one of
those, it cannot go on this host as written.

Server-side work goes in a standalone `.php` file next to the static output
(PHP 8.3 is available), never in Next.

`node_modules` must never reach the server. The account sits near its inode
limit.

Enforcement in the repo:

- `next.config.ts` sets `output: "export"`, `trailingSlash: true` and
  `images.unoptimized: true`. `next build` fails on anything dynamic.
- `eslint.config.mjs` errors on imports of `next/headers`, `next/server`,
  `next/cache` and `server-only`.
- There is no `start` script. `next start` does not apply to an export.
- `.cpanel.yml` copies only `out/*` and `.htaccess`.

## Local

```bash
npm install
npm run dev
```

```bash
npm run build
```

`npm run build` writes `out/`. That directory is committed on purpose: cPanel
Git Version Control pulls the repo and `.cpanel.yml` copies `out/*` to the
document root. The server never builds.

## Serving from a subfolder

Asset paths are root-absolute (`/_next/...`), so the site must sit at a document
root. To serve it from a subfolder instead, set `BASE_PATH` to that subfolder:

```bash
# PowerShell
$env:BASE_PATH="/new"; npm run build

# bash
BASE_PATH=/new npm run build
```

Assets then emit as `/new/_next/...`. Also change `ErrorDocument 404 /404.html`
in `.htaccess` to `/new/404.html`, since that path is resolved from the document
root and not from the folder the file sits in.

Unset `BASE_PATH` for the real cutover, where the site is at a domain root.

## Deploy

1. `npm run build`
2. Commit the changed files including `out/`
3. Push
4. cPanel to Git Version Control to Update from Remote, then Deploy HEAD Commit

`.cpanel.yml` copies to `/home1/mdniwpmy/public_html/new/`. The two-space
indent and the trailing slash on `DEPLOYPATH` both matter.

`.htaccess` handles HTTPS forcing, the 404, gzip, cache headers and MIME types.
It is copied separately by `.cpanel.yml` because it is not part of `out/`.

## Structure

```
app/         layout, page, globals.css, robots, sitemap, font loader
components/  one file per section, plus DotField
content/     all copy. Marketing edits happen here, not in JSX.
public/      fonts, logo
```

Copy lives in `content/` so a wording change is a one-file edit.
`content/site.ts` also holds `siteUrl`, which feeds `robots.txt`,
`sitemap.xml` and `metadataBase`. Set it before cutover.

## Design

The homepage design is the Claude Design project "Cogniviti Labs v1":
https://claude.ai/design/p/fb4ed92b-d5ca-4602-b442-2b1f02b05937?file=Cogniviti+Labs+v1.dc.html

Reading it needs a one-time `/design-login` from an interactive Claude Code
session. Build only from that file. Do not substitute older exports or the
sibling `cogniviti` project without asking first.

## Cutover

Point the document root at the new folder, verify SSL re-issued, 301 the old
WordPress URLs, and leave WordPress in place as rollback. Do not delete it.
Indexing is switched on in `app/layout.tsx` and `app/robots.ts`; the WordPress
staging install has it disabled, so check the live site does not inherit a
`noindex`.
