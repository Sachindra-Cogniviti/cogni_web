import { publicSiteUrl } from "@/lib/deployment"
import {
  careersPage,
  contactPage,
  experiencePage,
  productsPage,
} from "@/content/pages"
import {
  globalPresence,
  products,
  services,
  site,
  training,
} from "@/content/site"

export const dynamic = "force-static"

/**
 * /llms.txt - the site described for language models, in the format proposed
 * at llmstxt.org: a title, a one-paragraph summary, then sections of links
 * with a line of context each. An assistant asked about Cogniviti Labs can
 * read this one file instead of scraping the homepage's markup, which was
 * built for a reader with eyes and a scroll wheel rather than for a parser.
 *
 * Assembled from the same content files as the pages, so it cannot drift
 * from them: a product renamed in content/site.ts is renamed here in the
 * same build. Prerendered, like robots.txt.
 *
 * At the app root, not in the (frontend) route group, for the same reason
 * robots.ts is (see the note there). The trailing-slash setting does not
 * touch paths with a file extension, so this is served at /llms.txt exactly.
 */
export function GET() {
  const base = publicSiteUrl()
  const url = (path: string) => `${base}${path}`

  const lines: string[] = [
    `# ${site.name}`,
    "",
    `> ${site.description}`,
    "",
    `${site.name} is an enterprise technology company working in procurement and finance. It implements and supports platforms such as Coupa, Ivalua, GEP and OneStream, integrates them with ERPs including SAP, Oracle, Microsoft Dynamics 365 and NetSuite, and builds its own products on a shared data, integration and governance foundation. ${globalPresence.body}`,
    "",
    `Contact: ${site.email}. Markets: ${globalPresence.locations.map((l) => l.name).join(", ")}, with partner-supported delivery in ${globalPresence.partner.detail}.`,
    "",
    "## Services",
    "",
    `${services.body}`,
    "",
    ...services.stages.map((stage) =>
      `- [${stage.title}](${url("/#services")}): ${"body" in stage ? stage.body : ""}`.trimEnd()
    ),
    `- [${training.badge}](${url("/#training")}): ${training.body}`,
    "",
    "## Products",
    "",
    `${productsPage.header.body}`,
    "",
    ...products.map(
      (p) =>
        `- [${p.name}](${url(`/products/${p.slug}/`)}): ${p.tag}. ${p.desc}`
    ),
    `- [Products overview](${url("/products/")}): all six products and how they fit together.`,
    `- [Experience Centre](${url("/experience/")}): ${experiencePage.header.body}`,
    "",
    "## Company",
    "",
    `- [Our story](${url("/#company")}): how a platform-implementation practice came to build an Agentic Operating System.`,
    `- [Client work](${url("/work/")}): client stories - the platform, the problem, what was done and what changed.`,
    `- [Insights](${url("/blog/")}): articles on implementation, integration and adoption from the consulting and engineering team.`,
    `- [Careers](${url("/careers/")}): ${careersPage.header.body}`,
    `- [Contact](${url("/contact/")}): ${contactPage.header.body}`,
    "",
    "## Optional",
    "",
    `- [Sitemap](${url("/sitemap.xml")}): every indexable page.`,
    "",
  ]

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
