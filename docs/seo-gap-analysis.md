# SEO gap analysis — cogni_web

**Date:** 2026-09-24 · **Branch:** `client-wall-treatments` · **Scope:** the public site
(`app/(frontend)/`), the root SEO routes (`app/robots.ts`, `app/sitemap.ts`,
`app/llms.txt`, `app/og.png`), `lib/metadata.ts`, and the content that feeds them.

Crawling is switched off site-wide right now (`lib/indexing.ts` → `indexingEnabled =
false`), so nothing here is a live ranking loss. Everything below is a *pre-launch*
finding: what will be wrong on the day the switch is thrown. The launch switch itself is
correct and is not a gap — it is the reason this audit can be done calmly.

Pagination is deliberately out of scope, as requested. One line on it sits at the end for
completeness.

> **Status: findings 1–15 were fixed on 2026-09-24.** Indexing remains off — that was
> deliberate and is the one thing not touched. This document is kept as the record of
> what was wrong and why each fix is shaped the way it is; the table below carries the
> current state per finding. Only #16 (the sitemap route manifest) is outstanding, and
> the parts of it that mattered — the roles, the honest `lastModified`, dropping
> `changeFrequency`/`priority` — were done anyway.

---

## 1. Verdict at a glance

| # | Area | Finding | Severity | Status |
|---|------|---------|----------|--------|
| 1 | URL shape | Nearly every internal link omits the trailing slash → a 308 on every click and every crawl hop | **P0** | Fixed — 56 hrefs, plus `npm run check:links` |
| 2 | Canonical | The homepage emits no `<link rel="canonical">` at all | **P0** | Fixed |
| 3 | Structured data | No `Organization` / `WebSite` on the site; only `BlogPosting` exists | **P0** | Fixed — `lib/schema.ts` |
| 4 | Titles | Site title 77 chars, meta description 227 chars — both truncate in SERPs | **P1** | Fixed — 58 / 148 |
| 5 | Titles | Sub-page titles are bare nouns ("Products", "Insights") with no qualifier | **P1** | Fixed |
| 6 | Structured data | Breadcrumbs are rendered but not marked up as `BreadcrumbList` | **P1** | Fixed |
| 7 | Structured data | Client stories carry no `Article`; products carry no `Product`/`SoftwareApplication` | **P1** | Fixed |
| 8 | Careers | Roles have full `JobPosting` data and no schema, and no URL of their own | **P1** | Fixed — `/careers/[slug]/` |
| 9 | Titles | SEO-plugin `generateTitle` double-suffixes "\| Cogniviti Labs" | **P1** | Fixed |
| 10 | OG image | Products, services and the listings all share one generic card | **P2** | Fixed — 12 cards |
| 11 | Locale | `html lang="en"` vs `og:locale en_GB` | **P2** | Fixed — `en-GB` |
| 12 | Icons | Only `favicon.ico` — no PNG/SVG icon set, no web manifest | **P2** | Fixed |
| 13 | 404 | No `not-found.tsx`, so the site's 404 is Next's bare default | **P2** | Fixed |
| 14 | Sitemap | Hand-maintained route list; `changeFrequency`/`priority` are noise | **P3** | Partly — noise dropped, roles added; still a hand-kept list |

Nothing is *missing* in the sense of being unbuilt — the metadata layer in
`lib/metadata.ts` is genuinely well made and the `trailingSlash`/robots/OG traps are all
documented and handled. The gaps are (a) a URL-shape inconsistency between the config and
the links, and (b) structured data, which is 90% absent.

---

## 2. What is already right

Worth stating, because it changes what the fix list has to cover:

- **`pageMetadata` writes the complete set** — title, description, canonical, the whole
  `openGraph` object and the whole `twitter` object — precisely because Next does not
  deep-merge those two from the layout. That is the single most commonly botched thing in
  a Next App Router site and it is correct here (`lib/metadata.ts:52-75`).
- **Canonicals and OG URLs follow the deployment**, not the production domain
  (`publicSiteUrl()` in `lib/deployment.ts`). A preview does not emit
  `cognivitilabs.com` canonicals.
- **Indexing is refused three ways** until launch: `robots.txt` disallow, `robots` meta,
  and an `X-Robots-Tag` header in `next.config.ts` that also covers assets and API
  routes. The sitemap returns empty rather than leaking either origin's URLs.
- **Share cards are route handlers with a `.png` extension**, not Next's
  `opengraph-image.tsx` convention — correct, because that convention's extensionless URL
  does not survive `trailingSlash: true`.
- **Alt text is required at the schema level** (`payload/collections/media.ts`), and every
  `<Image>` in the tree passes an alt. The empty ones are decorative or de-duplicated
  repeats in the logo loops, which is the right call.
- **One `<h1>` per page**, from `components/hero.tsx:276` on the homepage and
  `components/page-shell.tsx:106` everywhere else. No heading levels are skipped
  (29 × h2/h3, zero h4/h5).
- **`/llms.txt` is generated from the same content files as the pages**, so it cannot
  drift.

---

## 3. P0 — URL shape: every internal link is a redirect

`next.config.ts` sets `trailingSlash: true`, so `/contact/` is the URL that answers 200
and `/contact` answers a 308. The sitemap was written against that and is right. The
links were not.

Written **without** the slash, in content:

```
content/site.ts:33   { label: "Products",   href: "/products" }
content/site.ts:35   { label: "Experience", href: "/experience" }
content/site.ts:38   { label: "Careers",    href: "/careers" }
content/site.ts:40   cta: { href: "/contact" }
content/site.ts:333  href: "/products/agentic-operating-system"
content/site.ts:506  href: "/products"
content/site.ts:1160 href: "/work"
content/site.ts:1269 href: "/blog"
content/pages.ts:347, 391, 866, 470  …and ~20 more
```

and in JSX:

```
app/(frontend)/blog/[slug]/page.tsx:219, 303   href="/blog"
app/(frontend)/work/[slug]/page.tsx:360, 434   href="/work"
app/(frontend)/work/[slug]/page.tsx:467        href="/blog"
app/(frontend)/products/[slug]/page.tsx:92     href="/experience"
```

Written **with** the slash, correctly: `components/cms-cards.tsx:46,124`
(`/blog/${slug}/`), the breadcrumb trails, and the whole sitemap.

### Why it matters

Every crawl of the nav spends a request on a 308 before reaching the page. Link equity
still flows through a 308, so this is not a ranking catastrophe — but it doubles crawl
requests for the site's most-linked URLs, and Googlebot's crawl budget is spent on the
redirect, not the page. It also means the internal link graph and the sitemap disagree
about what the canonical URL is, which is exactly the ambiguity canonicals exist to
remove.

The query-string variants are worse: `/contact?subject=products`
(`content/site.ts:537,556`, `content/pages.ts:444,470`) redirects to
`/contact/?subject=products`, and a redirect carrying a query string is the shape most
likely to be mishandled by a third-party crawler or a link-checker.

### Fix

One pass over `content/site.ts`, `content/pages.ts` and the four JSX files, adding the
slash before any `?`:

```
"/products"                  → "/products/"
"/contact?subject=products"  → "/contact/?subject=products"
```

Then a guard so it cannot regress. The cheapest is a unit assertion over the content
objects — walk every `href` starting `/` and assert it matches `^/([^?#]*\/)?(\?.*)?$`.

---

## 4. P0 — The homepage has no canonical

Every sub-page gets `alternates: { canonical: path }` through `pageMetadata`
(`lib/metadata.ts:58`). The homepage does not: `app/(frontend)/page.tsx` exports
`revalidate` and nothing else, so it inherits the layout's metadata — and
`app/(frontend)/layout.tsx:17-49` sets `metadataBase`, `title`, `description`,
`openGraph` and `twitter`, but **no `alternates`**.

`metadataBase` does not emit a canonical. It only resolves relative URLs. So the
site's single most important page ships with no self-referencing canonical, on a site
where `/` and any `?utm_*` variant are all separately addressable.

### Fix

Either add `alternates: { canonical: "/" }` to the layout metadata — it inherits
correctly, unlike `openGraph` — or, more consistently, give the homepage its own
`pageMetadata({ title, description, path: "/" })` export, which also fixes §5 below in
the same edit.

---

## 5. P1 — Titles and descriptions

Measured against the ~60-char title / ~155-char description that Google renders:

| Page | Title | Chars | Description source | Chars |
|------|-------|-------|--------------------|-------|
| `/` | `Cogniviti Labs: Engineering the systems behind modern procurement and finance` | **77** ✗ | `site.description` | **227** ✗ |
| `/products/` | `Products \| Cogniviti Labs` | 25 ⚠ | `productsPage.header.body` | **201** ✗ |
| `/experience/` | `Experience Centre \| Cogniviti Labs` | 34 ✓ | `experiencePage.header.body` | 148 ✓ |
| `/careers/` | `Careers \| Cogniviti Labs` | 24 ⚠ | `careersPage.header.body` | 159 ⚠ |
| `/contact/` | `Contact Us \| Cogniviti Labs` | 27 ⚠ | `contactPage.header.body` | **162** ⚠ |
| `/blog/` | `Insights \| Cogniviti Labs` | 25 ⚠ | `blogPage.header.body` | 152 ✓ |
| `/work/` | `Client work \| Cogniviti Labs` | 28 ⚠ | `workPage.header.body` | 134 ✓ |

Three distinct problems:

**(a) The homepage title overflows by ~17 characters.** It renders as
"Cogniviti Labs: Engineering the systems behind modern…" — the tail, which carries
*procurement* and *finance*, is the part that gets cut. The two highest-value keywords
on the site are in the truncated half of its most important title.

**(b) The homepage description overflows by ~70 characters.** `site.description`
(`content/site.ts:15`) is a 227-char list of six product areas. It is good hero copy
and a bad meta description: everything from "spend intelligence" onward is cut.
`productsPage.header.body` at 201 chars has the same problem.

The root cause is structural — `site.description` and the `header.body` fields serve two
jobs at once (on-page standfirst, and meta description) and are written for the first.

**(c) Sub-page titles are bare nouns.** "Products", "Insights", "Careers", "Client work"
carry no qualifier. With the template they become "Products | Cogniviti Labs" — accurate,
but it competes for nothing. Nobody searches "products". These pages should name the
category they want to be found for:

```
"Products"     → "Procurement & EPM Products"
"Insights"     → "Insights on Procurement & Finance Platforms"
"Careers"      → "Careers in Procurement, Finance & Applied AI"
"Client work"  → "Client Stories"
"Contact Us"   → "Contact"            (drop "Us"; it costs 3 chars for nothing)
```

### Fix

Add a dedicated `seo` block per page in `content/` — `{ title, description }`, hard-capped
at 60/155 — and have `pageMetadata` read that, falling back to `header.body` so nothing
breaks in the meantime. Keep the on-page standfirsts exactly as they are; they are good
copy. This decouples the two jobs rather than compromising either.

For the homepage specifically:

```
title:       "Procurement & Finance Systems Engineering"      (41)
description: "Cogniviti Labs implements and supports enterprise procurement
              and EPM platforms, and builds products for master data,
              integrations and spend intelligence."            (148)
```

---

## 6. P1 — The SEO plugin double-suffixes the title

`payload.config.ts:201`:

```ts
generateTitle: ({ doc }) => `${doc?.title ?? ""} | Cogniviti Labs`,
```

That value lands in `post.meta.title`. `app/(frontend)/blog/[slug]/page.tsx:61` then
passes it into `pageMetadata` as `title`, and the layout's
`title.template: "%s | Cogniviti Labs"` (`app/(frontend)/layout.tsx:22-25`) applies to
any child that sets `title` as a string.

Result, the moment an editor clicks auto-generate in the SEO panel:

```
<title>Why Data Governance Fails | Cogniviti Labs | Cogniviti Labs</title>
<meta property="og:title" content="Why Data Governance Fails | Cogniviti Labs | Cogniviti Labs">
```

The OG title is doubled twice over, because `lib/metadata.ts:62` *also* appends
`| ${site.name}`.

It does not bite today only because no post has a hand-saved `meta.title`. It will bite
the first time an editor uses the panel as designed, and it will look like a CMS bug
rather than a config one.

### Fix

Drop the suffix from `generateTitle`:

```ts
generateTitle: ({ doc }) => doc?.title ?? "",
```

The template and `pageMetadata` each add the site name exactly once, which is what the
rest of the site relies on.

---

## 7. P0/P1 — Structured data

This is the largest gap in the audit. Exactly one JSON-LD block exists on the entire
site: `BlogPosting` at `app/(frontend)/blog/[slug]/page.tsx:120-137`. It is well formed —
correct `@context`, real `datePublished`/`dateModified`, `Person` author with `jobTitle`,
`Organization` publisher, `image` when there is a cover. Everything else has none.

### 7.1 No `Organization` — P0

Nothing on the site tells a search engine what Cogniviti Labs *is*. No entity, no logo
association, no `sameAs`, no contact point. This is the block that feeds the Knowledge
Panel and the one that a B2B site with a strong brand name least affords to omit.

Every field it needs already exists in content:

| Schema property | Source |
|---|---|
| `name` | `site.name` |
| `url` | `publicSiteUrl()` |
| `logo` | `public/cogniviti-labs-logo.webp` |
| `description` | `site.description` |
| `email` | `site.email` |
| `sameAs` | `content/site.ts:1347-1350` (LinkedIn company page) |
| `areaServed` | `globalPresence` — Singapore, India, Indonesia, UK, South Africa |
| `employee` | `content/site.ts:1040-1146` — 13 people with names, roles, LinkedIn |
| `department` / `brand` | the six `products` entries |

Belongs in `app/(frontend)/layout.tsx` so it is on every page, or on `/` alone as an
`@graph` with `WebSite` beside it.

### 7.2 No `WebSite` — P1

No `WebSite` node, and so no `potentialAction`/`SearchAction`. Worth noting the site has
no search page either, so `SearchAction` would be a lie for now — just the `WebSite` node
with `name`, `url` and `publisher` pointing at the `Organization`.

### 7.3 No `BreadcrumbList` — P1

`components/page-shell.tsx:67-100` renders a proper semantic breadcrumb:
`<nav aria-label="Breadcrumb">` → `<ol>` → `<li>`, with `aria-current="page"` on the last
crumb. The accessibility is right and the markup is right. There is simply no
`BreadcrumbList` JSON-LD, so Google reconstructs the breadcrumb from the URL instead of
reading the one already on the page.

The `content.trail` array is already `{ label, href }[]` — exactly the shape
`BreadcrumbList.itemListElement` needs. This is the cheapest high-value fix on the list:
one helper in `PageHeader`, and every sub-page on the site gets it at once.

### 7.4 Client stories have no `Article` — P1

`app/(frontend)/work/[slug]/page.tsx` sets full OG article metadata
(`publishedTime`, `modifiedTime`, `section`, `tags` — lines 57-64) and emits no JSON-LD.
The blog's sibling page does. The story page has strictly *more* structured content
available than a post: `story.client`, `story.sector`, `story.metrics[]`,
`story.platform[]`, `story.region[]`, plus challenge/approach/outcomes beats.

Minimum: `Article` mirroring the `BlogPosting` block. Better: `Article` with `about` →
`Organization` (the client) and the metrics as a `mentions` set.

### 7.5 Products have no `Product` / `SoftwareApplication` — P1

Six products at `/products/[slug]/`, each with `name`, `desc`, a `lede`, feature lists and
a defined problem — and no schema. These are the commercial pages. `SoftwareApplication`
with `applicationCategory: "BusinessApplication"` fits CogniFlow, Cogniviti Bridge, Spend
Analytics, Adoption Copilot, Master Data Management and the Agentic Operating System
better than `Product` does, since there is no price or SKU.

### 7.6 Roles have no `JobPosting`, and no URL — P1

`payload/collections/roles.ts` models a job posting almost exactly as Google's
`JobPosting` spec asks: `title`, `discipline`, `type` (full-time/contract/internship),
`location`, `remote` (onsite/hybrid/remote), `summary`, `responsibilities[]`,
`requirements[]`, `body`, `postedAt`, `applyEmail`.

Two things block it from earning a Google Jobs listing:

1. **No `JobPosting` JSON-LD anywhere.**
2. **No `/careers/[slug]/` route.** Roles render as sections inside `/careers/`
   (`app/(frontend)/careers/page.tsx:266-292`) and are explicitly excluded from the
   sitemap ("The open roles on /careers are not pages of their own, so they are not
   here" — `app/sitemap.ts`). Google Jobs wants one canonical URL per posting. Several
   `JobPosting` blocks on one page is valid markup but a weak candidate.

This is the one gap with a direct, measurable commercial payoff — Google Jobs is free
distribution for a services firm hiring across five markets — and it needs a new route,
so it is the largest piece of work on the list. `postedAt` also means `validThrough` can
be derived, which Google warns about when absent.

### 7.7 No `ItemList` on the listings — P2

`/blog/` and `/work/` are collection pages with no `ItemList`/`CollectionPage`. Low value
compared with the above, but trivial once the JSON-LD helper exists.

### Suggested shape

Rather than seven scattered `<script>` tags, one `lib/schema.ts` exporting builders
(`organization()`, `webSite()`, `breadcrumbs(trail)`, `article(post)`,
`softwareApplication(product)`, `jobPosting(role)`) plus a small `<JsonLd data={…}>`
component. The existing block in `blog/[slug]/page.tsx` becomes the first caller. That
keeps the `publicSiteUrl()` discipline in one place — a hardcoded `cognivitilabs.com` in
a JSON-LD `@id` would reintroduce the preview-leak the rest of the codebase carefully
avoids.

---

## 8. P2 — Open Graph images

The mechanism is solid. Coverage is thin.

**What works:** `lib/og.tsx` + `next/og`, three fonts checked into `assets/fonts` because
the renderer has no fallback and fails with none loaded. Posts and stories each draw their
own card at `[slug]/og.png`, cache-busted by `?v={updatedAt}`
(`blog/[slug]/page.tsx:77`), with the editor's SEO-panel image overriding it when set.
`revalidate = 86400`. `og:image:width`/`height` and `og:image:alt` all present via
`OG_IMAGE`/`DEFAULT_OG_IMAGE`. `summary_large_image` on Twitter. This is more careful than
most sites manage.

**The gap:** everything that is not a post or a story shares `/og.png`, whose card is
hardcoded to the site kicker and the homepage headline (`app/og.png/route.tsx:22-25`). So
`/products/cogniflow/`, `/experience/`, `/careers/` and `/contact/` all share an identical
image. A LinkedIn post about CogniFlow and one about the Experience Centre are visually
indistinguishable — on LinkedIn, which is the channel a procurement-services firm actually
gets shared on.

`ogCard()` already takes `{ kicker, title, meta }`, so a per-product card is a route
handler passing three different strings. Suggested order: the six product pages first,
then `/experience/`, then the listings.

**Two smaller notes:**

- `twitter:site` / `twitter:creator` are unset. Harmless if there is no X account; if
  there is, it belongs in `lib/metadata.ts:68-73`.
- The OG title is built as `${title} | ${site.name}` (`lib/metadata.ts:62`). Social cards
  have less room than SERPs, and the site name is already shown as `og:site_name` directly
  beneath. Dropping the suffix from the OG title would leave more of the actual title
  visible. Minor, and a judgement call.

---

## 9. P2/P3 — Smaller findings

**Locale mismatch.** `html lang="en"` (`site.locale = "en"`, `content/site.ts:17`) against
`og:locale: "en_GB"` (`lib/metadata.ts:61` and the layout). Pick one. Given Singapore /
India / UK / South Africa, `en-GB` is the right answer for both — British spelling is
already used throughout the copy ("optimisation", "programme"). Set
`site.locale = "en-GB"`.

**No `alternates.languages`.** Correct today — one language, one region — but the market
list makes a future `/sg/`, `/in/` split plausible. Nothing to do now; flagging so the
decision is conscious rather than inherited.

**Icon set is one file.** `app/favicon.ico` only. No `icon.svg`, no `apple-icon.png`, no
`manifest.ts`. Google shows a favicon in mobile SERPs and prefers a 48×48-divisible PNG or
SVG; an `.ico` is accepted but is the weakest of the three. The logo already exists at
`public/cogniviti-labs-logo.webp` and `components/admin/logo.tsx` already crops it.

**No `not-found.tsx`.** Neither `app/not-found.tsx` nor `app/(frontend)/not-found.tsx`
exists, so a bad URL — and `notFound()` from `blog/[slug]`, `work/[slug]` and
`products/[slug]` — renders Next's bare default page. The status code is correct, so this
is not an indexing problem; it is a crawl and UX dead end with no nav, no footer and no
way back. A `PageShell`-wrapped 404 with links to `/products/`, `/blog/` and `/contact/`
is about twenty lines.

**Sitemap: hand-maintained list.** `app/sitemap.ts` hardcodes eight routes and generates
only the product paths from `products`. A new top-level page is two edits — the route and
the sitemap — and the second is the one that gets forgotten. Posts and stories are read
from Payload correctly with real `lastModified`, so the dynamic half is right.

Also: `changeFrequency` and `priority` are set on every entry (`"monthly"`, `1` / `0.7` /
`0.6`). Google has stated it ignores both. They are harmless, but they read as signals
that do something, and they don't — worth a comment saying so, or dropping.

**`lastModified` on fixed routes is `new Date()`.** Every fixed route claims to have been
modified at the moment the sitemap was regenerated, which is hourly. That tells a crawler
the whole site changes every hour, which is false, and it devalues the *accurate*
`lastModified` on the posts and stories in the same file. Better to omit `lastModified`
for the fixed routes than to state something untrue.

**Pagination** (out of scope, one line): `getPosts()`/`getStories()` take `limit = 50` and
`/blog/` and `/work/` render everything in one page with no paging. Fine at current
volume; revisit past ~50 posts.

---

## 10. Prioritised fix list

**P0 — before the indexing switch is thrown**

1. Add the trailing slash to every internal `href` in `content/site.ts`,
   `content/pages.ts` and the four `[slug]` pages; add a test that asserts the shape.
2. Give `/` a canonical — either `alternates` in the layout or its own `pageMetadata`.
3. Add `Organization` + `WebSite` JSON-LD, sourced from existing content, via a new
   `lib/schema.ts`.

**P1 — launch week**

4. Split meta copy from on-page copy: a capped `seo: { title, description }` per page.
   Fix the homepage title (77→~45) and description (227→~150) first.
5. Rewrite the bare sub-page titles to name their category.
6. Drop the `| Cogniviti Labs` suffix from `generateTitle` in `payload.config.ts`.
7. `BreadcrumbList` in `PageHeader` — one change, every sub-page benefits.
8. `Article` JSON-LD on `/work/[slug]/`, mirroring the post page.
9. `SoftwareApplication` JSON-LD on `/products/[slug]/`.

**P1/P2 — the one that needs new routes**

10. `/careers/[slug]/` + `JobPosting` JSON-LD + the roles in the sitemap. Largest effort,
    clearest commercial return.

**P2 — polish**

11. Per-page OG cards: six products, then `/experience/`, then the listings.
12. `site.locale` → `en-GB`, consistently with `og:locale`.
13. A `PageShell` 404.
14. `icon.svg` + `apple-icon.png` + `manifest.ts`.
15. `ItemList` on `/blog/` and `/work/`.

**P3**

16. Generate the sitemap's fixed routes from a single route manifest; drop or annotate
    `changeFrequency`/`priority`; stop claiming hourly `lastModified` on static pages.

---

## 11. What the fix changed

Three things are worth knowing that the audit above could not have predicted, because
they only showed up once the fixes were built and the output inspected.

**`title.template` does not apply to the segment that defines it.** The homepage sits in
the same segment as the layout that sets `title.template`, so the template never applied
to it. Left alone, the homepage would have shipped as the one page on the site with no
brand in its title — the opposite of the intent. `app/(frontend)/page.tsx` therefore
spells the site name out, and says why.

**A `not-found.tsx` inside a route group does not catch unmatched URLs.** It answers only
for `notFound()` raised by its own group's segments. A URL matching nothing belongs to no
group, so `/nonsense` still got Next's bare default. Fixed with a catch-all at
`app/(frontend)/[...notFound]/page.tsx` that simply calls `notFound()`. It was verified
not to shadow `/admin` or `/api/*` — Next matches literal segments before dynamic ones
and dynamic before catch-all, and both were curled against a production build to confirm.

**Adding the trailing slashes made ESLint see three anchors it had not seen before.**
`@next/next/no-html-link-for-pages` only recognises a link as internal once it resolves
to a real route, so `/experience` was invisible to it and `/experience/` is not. The
three now carry the same documented disable the rest of the site already used: plain
anchors are deliberate here, because the scroll flow binds on load.

---

## 12. Launch-day verification

The existing note in `lib/indexing.ts` covers the first two. The rest is what this audit
adds:

- [ ] `indexingEnabled = true`, pushed, deployed to **production** (`isLiveSite` requires
      both that flag and `VERCEL_ENV === "production"`).
- [ ] `/robots.txt` says `Allow: /` and advertises the sitemap.
- [ ] `curl -I` on `/` and on one sub-page: **no** `X-Robots-Tag` header.
- [ ] View source on `/`: `robots` meta is `index, follow`, not `noindex`.
- [ ] `/sitemap.xml` is non-empty, lists every URL **with** a trailing slash, and includes
      published posts and stories.
- [ ] `siteUrl` in `content/site.ts` matches the live domain exactly, including `www` or
      its absence.
- [ ] Every canonical points at the production domain, not a `*.vercel.app` preview.
- [ ] `/og.png`, `/blog/<slug>/og.png` and `/work/<slug>/og.png` all return an image, not
      a 500 — the font loading is the fragile part.
- [ ] Paste `/`, one product page and one post into LinkedIn's Post Inspector and Slack;
      confirm the card renders.
- [ ] Rich Results Test on `/`, one post, one story, one product.
- [ ] Confirm the live site does not inherit a `noindex` from the WordPress staging
      install, which has indexing disabled.
- [ ] 301s from the old WordPress URLs land on trailing-slash targets, not on a redirect
      that then 308s.
