# cogni_web

Next.js App Router, deployed to Vercel.

## Hosting

Vercel builds from source on push. There is no build output in the repo and no
deploy script: the platform runs `next build` itself and serves the result.

This replaced Bluehost shared hosting, which had no Node runtime and forced the
whole site through `output: "export"`. That constraint is gone. API routes,
middleware, server actions, ISR and `next/image` optimisation are all available
now.

Vercel handles HTTPS forcing, compression, MIME types, the immutable cache on
`/_next/static` and HTML revalidation — all the things `.htaccess` used to do.
The one header it does not add is `X-Content-Type-Options: nosniff`, so that is
set in `next.config.ts`.

`trailingSlash: true` is kept deliberately: it is the URL shape the sitemap,
the canonical metadata and the 301s off the old WordPress site were written
against.

## Local

```bash
npm install
npm run dev
```

```bash
npm run build
npm start        # serve the production build locally
```

`next build` writes `.next/`, which is gitignored.

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
