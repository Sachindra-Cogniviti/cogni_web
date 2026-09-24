# Pre-launch checklist — cogni_web

**Last updated:** 2026-09-24 · **Companion to:** [seo-gap-analysis.md](./seo-gap-analysis.md)

The SEO audit is done and its findings are fixed. This is what is left between
here and switching indexing on — content, legal, analytics and the cutover
itself. The audit covers *how the site describes itself*; this covers *whether
what it describes is true and measured*.

**Two switches are deliberately off**, both in
[lib/indexing.ts](../lib/indexing.ts), and each is turned on by its own
one-line commit:

- `indexingEnabled` — every deployment refuses crawlers four ways:
  `robots.txt`, the `robots` meta, the `X-Robots-Tag` header from
  [next.config.ts](../next.config.ts), and an empty sitemap.
- `wordpressRedirectsEnabled` — the old-URL map is written and verified but
  not served. Old WordPress paths 404 on this site until it is turned on.

They are separate because they happen at different moments. The domain can
move to Vercel before the site is ready to be indexed, and the redirects need
proving on the live domain before crawlers are invited in. Nothing on this
list should be done by flipping either switch early.

---

## 1. Blockers — the site must not be indexed until these are done

### 1.1 Fictional content is in the database

`npm run seed:demo` writes three invented client stories (Northline Logistics,
Harbour & Vale Property, Solaris Energy) and three invented posts. The last
build prerendered all six as real pages. They exist to review the layouts, and
they read as genuine case studies with genuine figures.

**Do:** `npm run seed:demo:remove` against the production database, then
confirm `/work/` and `/blog/` before launch. The script deletes exactly what it
created — see [scripts/seed-demo.ts](../scripts/seed-demo.ts).

### 1.2 Three blocks of copy are marked DRAFT by their authors

Not flagged by the audit — flagged in the source, by whoever wrote them:

| Where | What |
|---|---|
| [content/pages.ts](../content/pages.ts) — `productPages` | All six product pages. "Extrapolated from the one-line descriptions, not supplied by the business." Named integrations, compliance language and anything that reads as a number all need a read. |
| [content/site.ts](../content/site.ts) — the integration blocks | Five blocks. "Still a claim about what we have actually built." |
| ~~[content/site.ts](../content/site.ts) — `updates`~~ | **Resolved.** The carousel now carries only the three confirmed LinkedIn announcements — the Coupa Breakout Partner award, the Carsome go-live and the Jakarta session — each with the photograph from its post. The four derived items are gone. |

These are the pages most likely to rank and the ones a prospect quotes back in
a meeting.

### 1.3 The "Official Coupa Training Partner" claim is still on the site

The news carousel is resolved — it now carries only the three confirmed
LinkedIn announcements, each with the photograph from its post, and the four
derived items are gone.

But removing the carousel item did **not** remove the claim. "Official Coupa
Training Partner" still appears twice in
[content/site.ts](../content/site.ts): in the certifications block, and as the
badge and body of the entire Coupa Training homepage section. The Breakout
Partner award confirms a strong Coupa relationship; it does not confirm that
specific accreditation. It needs confirming on its own, and if it cannot be,
a homepage section has to change — not just a line.

**Also worth deciding:** the Coupa New Breakout Partner of the Year award is
the strongest third-party credential the company has, and it currently appears
only as one slide in a rotating carousel. It may deserve a fixed position —
next to the certifications, or in the homepage credentials block.

### 1.4 Certification logos are placeholders

`public/logos/certifications/` holds `placeholder-coupa-partner.png`,
`placeholder-iso-9001.png` and `placeholder-iso-27001.png`. Displaying an ISO
mark the company does not hold is a different order of problem from a typo.
Either supply the real marks or remove the strip.

### 1.5 Confirm the canonical host

`siteUrl` in [content/site.ts](../content/site.ts) is
`https://cognivitilabs.com` — no `www`. The supplied legal copy writes
`https://www.cognivitilabs.com`. One of them is wrong. Whichever host is live
must:

- match `siteUrl` exactly,
- be the one the certificate is issued for,
- have the other host 301 to it, not serve a duplicate.

Everything downstream — canonicals, `metadataBase`, the sitemap, the JSON-LD
`@id`s, the legal pages — reads `siteUrl`, so this is one edit in one place,
but it must be the right one.

---

## 2. Done since the audit

Recorded so nobody redoes them.

- **Legal pages exist.** `/privacy-policy/` and `/terms-conditions/`, content
  in [content/legal.ts](../content/legal.ts). The footer links pointed at
  `/#top` on every page of the site until now.
- **They keep the WordPress addresses.** Both were in the old sitemap, so
  keeping the URL means no redirect to maintain and nothing lost.
- **The WordPress 301 map is written but not switched on**, in
  [next.config.ts](../next.config.ts), built from the old `sitemap_index.xml`
  rather than guessed — see §4.
- **FAQ page** at `/faq/` with `FAQPage` structured data — see §3 for three
  things in the supplied copy that need a decision.
- **Office addresses are in the `Organization` schema**: the Singapore
  headquarters as `address`, all four as `location`, each with a country code.

---

## 3. Open decisions on the FAQ copy

Three changes were made to the supplied FAQ text rather than shipping it as
given. All three are flagged in [content/pages.ts](../content/pages.ts) and are
one edit to reverse.

**"CogniPurge" does not exist on this site.** It was named twice as the
procurement data-quality product. The site's data-quality product is Master
Data Management, at `/products/master-data-management/`. A reader following
that name would have found nothing. The FAQ now names Master Data Management
and links to it.

→ *Decide:* is CogniPurge a new product, a rename of MDM, or an error? If it is
real, it needs a product page before it is named in copy that ranks.

**The third question did not match its answer.** The question asked about APAC
timezone-aligned delivery and multi-country rollout. The answer supplied was a
list of what buyers should assess when evaluating any partner — a different
subject. Shipping that pairing would have put a mismatched Q/A into `FAQPage`
structured data, which is what Google's spam guidance on FAQ markup is aimed
at. The list now sits under a question it answers, and the timezone question is
answered separately using only the markets and GMT offsets already in
`globalPresence`.

→ *Decide:* whether the fourth answer says what you want it to say. It claims
nothing the site does not already claim, but it is new marketing prose.

**"avIntegration capability"** was a typo for "Integration capability".

---

## 4. The WordPress migration

The old site advertised 26 URLs across five sitemaps. All are mapped — and the
map is **off** until `wordpressRedirectsEnabled` is set. Until then these
paths 404 on this site, which is correct while WordPress still serves the
domain and they are unreachable here anyway.

| Old URL | Goes to | Why |
|---|---|---|
| `/` `/blog/` `/products/` | unchanged | Same address on the new site |
| `/privacy-policy/` `/terms-conditions/` | unchanged | New pages serve these addresses |
| `/solutions/` and its 6 children | `/#platforms` | No per-platform page exists |
| `/about/` `/team/` | `/#company` | |
| `/about/why-us/` | `/#why` | |
| `/services/` | `/#services` | |
| `/about/careers/` `/current-openings/` | `/careers/` | |
| `/contact-us/` `/book-a-discovery-call/` | `/contact/` | |
| `/case-studies/` `/category/case-studies/` | `/work/` | |
| `/enterprise-performance-management/` | `/blog/` | Post with no equivalent yet |
| `/maximizing-efficiency-…-coffee-success-story/` | `/work/` | Case study post |
| `/category/uncategorized/` `/author/mohammed-zafar/` | `/blog/` | Archives |

Verified against a production build with the switch on: each redirects in one
hop, `308`. Verified again with it off: each returns `404`, and no real route
is affected.

**Two things to know.** The six `/solutions/*` redirects land on a fragment; a
browser honours it and scrolls, but a crawler reads it as the homepage. That is
the honest answer while no per-platform page exists — if those get built, the
entries in `next.config.ts` are where they get repointed. And the EPM post
redirects to `/blog/` because nothing replaces it yet; if that article is worth
keeping, rewriting it as a post is better than a redirect.

**Still to do:** leave WordPress running as the rollback until the new site has
been live and stable for a week. Do not delete it.

---

## 5. Analytics, tag manager and verification

**Nothing is installed.** No GA, no GTM, no Vercel Analytics, no consent
tooling — verified by grep across the source.

### 5.1 Where each ID comes from

| What | ID format | Where to get it |
|---|---|---|
| Google Tag Manager container | `GTM-XXXXXXX` | tagmanager.google.com → create account → container, type **Web**. ID is in the workspace top bar. |
| GA4 measurement ID | `G-XXXXXXXXXX` | analytics.google.com → Admin → Create property → **Web** data stream. ID is on the stream detail page. |
| Search Console verification | a TXT record or a `content` string | search.google.com/search-console |
| Bing Webmaster Tools | — | bing.com/webmasters — can import the property from Search Console rather than re-verifying |
| Vercel Analytics / Speed Insights | no ID | Toggle in the Vercel project dashboard, then add the packages |

GTM is a container that fires other tags; it measures nothing by itself. If GA4
is the only tag you will ever have, installing GA4 directly is simpler and one
less redirect of responsibility.

### 5.2 Order

1. **Verify Search Console first**, before launch. Verification works while the
   site is `noindex` — you simply get no data until indexing is on. Prefer the
   **Domain** property with a DNS TXT record: it covers every subdomain and
   both protocols, which matters while the `www` question in §1.4 is open.
2. Add the token to `metadata.verification.google` in
   [app/(frontend)/layout.tsx](<../app/(frontend)/layout.tsx>). Next has the
   field; no new markup is needed.
3. Import the property into Bing Webmaster Tools. Ten minutes, and it feeds
   ChatGPT search as well as Bing.
4. Install GTM/GA4 **with consent mode already configured** — see §5.3.
5. Turn on Vercel Speed Insights for real-user Core Web Vitals. Worth it here
   specifically: the hero's LCP behaviour is delicate and documented at length
   in CLAUDE.md, and field data is the only way to know whether it holds up.
6. Submit the sitemap in Search Console **after** indexing is switched on, not
   before.

### 5.3 Consent is not optional for this company

Operations in the UK mean GDPR, which means analytics cookies must not fire
before consent — so GTM needs Consent Mode v2 and a real banner. Singapore's
PDPA and India's DPDP Act apply to the enquiry form data as well.

Decide this **before** installing the tags. Retrofitting consent onto a live
GTM container is harder than configuring it once, and the privacy policy's
cookies section (§10) should describe what you actually run.

### 5.4 Two cautions specific to this codebase

- The `X-Robots-Tag: noindex` header applies to **every** path while indexing
  is off. It does not block analytics, so do not read a quiet dashboard as a
  broken tag.
- Any third-party script competes with the hero's largest contentful paint.
  CLAUDE.md documents two load-bearing numbers there and a 5.1s → measured
  improvement that was hard won. GTM must load after interactive, never in the
  head, and Speed Insights should be watched after it goes in.

---

## 6. Smaller open items

- **`twitter:site` / `twitter:creator`** are unset in
  [lib/metadata.ts](../lib/metadata.ts). Fill them in if the X account in
  `footer.social` is ever created; it is deliberately blank today.
- **All six `demoUrl` values are `null`** in `experiencePage.demos`, so the
  Experience Centre shows request-a-demo panels throughout. Each demo goes live
  by setting one string — and the app behind it must allow framing, or the
  iframe renders blank with no error the page can catch.
- **Sitemap fixed routes are still a hand-kept list** (audit finding #16). Low
  risk; the parts that mattered are done.
- **No `LocalBusiness` schema.** `Organization` now carries all four addresses,
  which is the right call for a services company with no walk-in trade. Revisit
  only if local pack visibility becomes a goal.

---

## 7. Launch sequence

1. Resolve §1 in full — seed data, DRAFT copy, certification marks, host.
2. Legal pages reviewed by whoever owns them; confirm the effective date.
3. Search Console + Bing verified.
4. Consent decided; GTM/GA4 installed; Speed Insights on.
5. Point the domain at Vercel; confirm the certificate issues.
6. Set `wordpressRedirectsEnabled = true`, deploy, then confirm the old URLs
   301 correctly **on the live domain**, not just locally. Walk the table in
   §4. This is its own step so that the redirects start answering when
   someone is watching, rather than as a side effect of the DNS change.
7. Only once §6 is proven: set `indexingEnabled = true`, push, deploy to
   production. Handing Google a sitemap before the redirects answer is how a
   migration loses the rankings it was meant to carry over.
8. Work §12 of [seo-gap-analysis.md](./seo-gap-analysis.md) — the verification
   checklist.
9. Submit the sitemap in Search Console.
10. Leave WordPress in place as rollback.
