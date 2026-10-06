# SEO overview report review — 6 October 2026

Source: `issues_overview_report.csv` (aggregate counts, no affected URL export).
Verification: live sitemap crawl plus article links, markup, resource requests,
TypeScript and focused ESLint. Audit script: `scripts/audit-public-seo.py`.

| Report finding | Resolution / assessment |
| --- | --- |
| Multiple H2s | Valid section hierarchy; retain meaningful section headings. |
| Long titles / pixel width | Shortened the three initial article search titles; editorial and share headlines retained. Pixel cutoffs vary by font and search layout. |
| Short titles | Expanded Contact and CogniFlow search titles. |
| URL parameters | Contact topic parameters preselect enquiry fields; Next image parameters select optimized assets. Keep functional parameters. |
| Canonicalised pages | Contact query variants deliberately canonicalize to `/contact/`. All audited public page canonicals match their URLs. |
| Low content | Aggregate report does not name the page. Word count is a heuristic; no filler added solely to exceed 200 words. Affected URL export needed to assess its content. |
| Difficult readability | Simplified long FAQ answers. Specialist product and legal wording retained; specific URLs needed for the report's three flagged pages. |
| Missing X-Frame-Options | Added SAMEORIGIN globally; same-origin CMS previews remain possible. |
| Missing secure Referrer-Policy | Added strict-origin-when-cross-origin globally. |
| Missing HSTS | Added max-age=31536000 without includeSubDomains/preload, so unrelated mail and hosted subdomains are unaffected. |
| Missing CSP | Added base-uri 'self', object-src 'none', frame-ancestors 'self'. This baseline restricts framing, base injection and plugins. It is not a strict script CSP; nonce-based script protection requires dynamic rendering and a separate integration change. |
| Non-sequential H2 | Added the Certifications and platform partnerships H2 before the credential-card H3s. |
| Duplicate H2s | Shared section labels are legitimate. No duplicate-page issue found in audited public canonicals. |
| Long H2s | Shortened homepage closing heading and FAQ questions. |
| Missing alt text | Reviewed duplicate logos, decorative badges and portrait overlay layers: intentional empty alt / aria-hidden. Informative images retain descriptions. |
| Long alt text | Shortened award-photo and award-badge descriptions without removing their meaning. |
| Missing image dimensions | Replaced fill-only team portraits with intrinsic dimensions and preserved absolute layout; added update-photo dimensions (800 × 500). |
| Image over 100 kB | Identified Indonesia careers event photo (204,819-byte JPEG optimizer response at q75); deliver it at q50 and retain responsive sizes. Verify actual bytes after deployment. |
| High external outlinks | Homepage has client/partner references and team LinkedIn links. These are relevant; no blanket nofollow/removal applied. |
| External 4xx | CARSOME returned 403 to audit requests; do not replace a valid customer website solely for bot refusal. Dynapack additionally produced a Python TLS chain error; no certificate checks bypassed. CSV does not name its two affected URLs; URL-level export needed to match them exactly. |

Also generate the sitemap on request: build workers cannot access the private CMS
database, so build-time snapshots omitted published articles and client stories.

Existing unrelated edits to the blog detail page and CMS cards were left untouched.
