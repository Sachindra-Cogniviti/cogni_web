import { footer, globalPresence, products, site } from "@/content/site"
import { publicSiteUrl } from "@/lib/deployment"
import { DISCIPLINE_LABEL, PLATFORM_LABEL } from "@/lib/cms"
import type { ClientStory, Post, Role } from "@/payload-types"

/**
 * JSON-LD, built from the same content the pages render.
 *
 * One module rather than a `<script>` tag written out at each call site, for
 * the same reason lib/metadata.ts exists: the parts that must not vary - the
 * origin, the organisation's identity, the publisher on every article - are
 * written once. In particular every URL goes through `publicSiteUrl()`, so a
 * preview deployment describes itself and not the production domain. A
 * hardcoded cognivitilabs.com in an `@id` would undo the care taken
 * everywhere else about exactly that.
 *
 * The organisation is emitted once per page with a stable `@id`, and
 * everything else refers to it by that id rather than repeating it. That is
 * what lets a crawler tie an article's publisher, a job's hiring
 * organisation and the site's owner together as one entity instead of three
 * similarly-named ones.
 */

/** Stable node ids, so nodes can refer to each other rather than repeat. */
export function ids(origin = publicSiteUrl()) {
  return {
    organization: `${origin}/#organization`,
    website: `${origin}/#website`,
  }
}

type Json = Record<string, unknown>

/** Drops undefined and empty arrays, which schema.org readers treat as noise. */
function clean<T extends Json>(node: T): T {
  for (const key of Object.keys(node)) {
    const value = node[key]
    if (
      value === undefined ||
      value === null ||
      value === "" ||
      (Array.isArray(value) && value.length === 0)
    ) {
      delete node[key]
    }
  }
  return node
}

/**
 * The company. Every field comes from content/site.ts, so a change there
 * reaches the structured data in the same edit.
 *
 * `sameAs` takes only the social entries that have an href - the X entry is
 * deliberately blank until the account exists (see content/site.ts), and an
 * empty string in sameAs is worse than an absent one.
 */
export function organization(origin = publicSiteUrl()): Json {
  const id = ids(origin)
  return clean({
    "@type": "Organization",
    "@id": id.organization,
    name: site.name,
    url: `${origin}/`,
    logo: {
      "@type": "ImageObject",
      url: `${origin}/cogniviti-labs-logo.webp`,
    },
    image: `${origin}/og.png`,
    description: site.description,
    email: site.email,
    slogan: footer.tagline,
    sameAs: footer.social.filter((link) => link.href).map((link) => link.href),
    areaServed: globalPresence.locations.map((location) => ({
      "@type": "Country",
      name: location.name,
    })),
    knowsAbout: [
      "Enterprise procurement",
      "Source-to-pay",
      "Enterprise performance management",
      "Master data management",
      "Spend analytics",
      "System integration",
      "Platform adoption",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      email: site.email,
      url: `${origin}/contact/`,
      areaServed: globalPresence.locations.map((location) => location.name),
    },
  })
}

/** The site itself, owned by the organisation. No SearchAction: no search. */
export function webSite(origin = publicSiteUrl()): Json {
  const id = ids(origin)
  return clean({
    "@type": "WebSite",
    "@id": id.website,
    name: site.name,
    url: `${origin}/`,
    description: site.description,
    inLanguage: site.locale,
    publisher: { "@id": id.organization },
  })
}

/**
 * The site-wide graph: who we are and what this is. Emitted from the
 * frontend layout, so it is on every page including the homepage, which is
 * the one a crawler resolving the brand will look at.
 */
export function siteGraph(origin = publicSiteUrl()): Json {
  return {
    "@context": "https://schema.org",
    "@graph": [organization(origin), webSite(origin)],
  }
}

/**
 * The breadcrumb a sub-page already draws, in the form a crawler reads.
 *
 * Takes the same `trail` array components/page-shell.tsx renders, so the
 * markup and the structured data cannot describe different paths. The last
 * crumb has no href by convention (it is the current page) and is listed
 * without an `item`, which is what the spec asks for.
 */
export function breadcrumbs(
  trail: readonly { label: string; href?: string }[],
  origin = publicSiteUrl()
): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((step, index) =>
      clean({
        "@type": "ListItem",
        position: index + 1,
        name: step.label,
        item: step.href ? `${origin}${step.href}` : undefined,
      })
    ),
  }
}

/** A blog post. */
export function blogPosting({
  post,
  author,
  section,
  image,
  origin = publicSiteUrl(),
}: {
  post: Post
  author?: { name: string; role?: string | null } | null
  section?: string
  image?: string | null
  origin?: string
}): Json {
  const url = `${origin}/blog/${post.slug}/`
  const id = ids(origin)
  return {
    "@context": "https://schema.org",
    ...clean({
      "@type": "BlogPosting",
      "@id": url,
      url,
      headline: post.title,
      description: post.excerpt,
      datePublished: post.publishedAt,
      dateModified: post.updatedAt,
      articleSection: section,
      inLanguage: site.locale,
      author: author
        ? clean({
            "@type": "Person",
            name: author.name,
            jobTitle: author.role ?? undefined,
            worksFor: { "@id": id.organization },
          })
        : { "@id": id.organization },
      publisher: { "@id": id.organization },
      isPartOf: { "@id": id.website },
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      image: image ? `${origin}${image}` : undefined,
    }),
  }
}

/**
 * A client story, as an Article about the client.
 *
 * The metrics become `about` on a quantitative note rather than being
 * flattened into the description: they are the figures the page leads with,
 * and they are the client's own.
 */
export function clientStory({
  story,
  image,
  origin = publicSiteUrl(),
}: {
  story: ClientStory
  image?: string | null
  origin?: string
}): Json {
  const url = `${origin}/work/${story.slug}/`
  const id = ids(origin)
  return {
    "@context": "https://schema.org",
    ...clean({
      "@type": "Article",
      "@id": url,
      url,
      headline: `${story.client}: ${story.title}`,
      description: story.excerpt,
      datePublished: story.publishedAt,
      dateModified: story.updatedAt,
      articleSection: story.sector ?? undefined,
      inLanguage: site.locale,
      keywords: (story.platform ?? []).map((p) => PLATFORM_LABEL[p]),
      author: { "@id": id.organization },
      publisher: { "@id": id.organization },
      isPartOf: { "@id": id.website },
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      about: clean({
        "@type": "Organization",
        name: story.client,
        ...(story.sector ? { industry: story.sector } : {}),
      }),
      image: image ? `${origin}${image}` : undefined,
    }),
  }
}

/**
 * A product.
 *
 * SoftwareApplication rather than Product: there is no price, no SKU and no
 * offer, and Product without an offer or a review earns nothing while
 * warning about both. These are business applications, which is exactly what
 * `applicationCategory` is for.
 */
export function softwareApplication({
  product,
  lede,
  origin = publicSiteUrl(),
}: {
  product: (typeof products)[number]
  lede?: string
  origin?: string
}): Json {
  const url = `${origin}/products/${product.slug}/`
  const id = ids(origin)
  return {
    "@context": "https://schema.org",
    ...clean({
      "@type": "SoftwareApplication",
      "@id": url,
      url,
      name: product.name,
      applicationCategory: "BusinessApplication",
      applicationSubCategory: product.kicker,
      description: lede ?? product.desc,
      operatingSystem: "Web",
      publisher: { "@id": id.organization },
      provider: { "@id": id.organization },
      isPartOf: { "@id": id.website },
      image: `${origin}/products/${product.slug}/og.png`,
    }),
  }
}

/**
 * An open role.
 *
 * Google Jobs wants `datePosted`, `validThrough`, `hiringOrganization` and a
 * `jobLocation` - or `jobLocationType: TELECOMMUTE` for a remote role, which
 * is a different field rather than a location named "Remote". `validThrough`
 * is derived from `postedAt` because an absent one makes a posting expire
 * silently and Google warns about it; six months is the convention and the
 * role can simply be unpublished sooner.
 *
 * `location` in the collection is free text ("Singapore", "Mumbai, India"),
 * so it is passed as `addressLocality` and the country is left for the
 * editor to include in that string. Guessing a country code from free text
 * would be worse than omitting it.
 */
export function jobPosting({
  role,
  origin = publicSiteUrl(),
}: {
  role: Role
  origin?: string
}): Json {
  const url = `${origin}/careers/${role.slug}/`
  const id = ids(origin)
  const posted = role.postedAt ?? role.createdAt
  const validThrough = new Date(posted)
  validThrough.setMonth(validThrough.getMonth() + 6)

  const remote = role.remote === "remote"
  const description = [
    role.summary,
    ...(role.responsibilities?.length
      ? [
          "Responsibilities:",
          ...role.responsibilities.map((item) => `- ${item.text}`),
        ]
      : []),
    ...(role.requirements?.length
      ? [
          "Requirements:",
          ...role.requirements.map((item) => `- ${item.text}`),
        ]
      : []),
  ]
    .filter(Boolean)
    .join("\n")

  return {
    "@context": "https://schema.org",
    ...clean({
      "@type": "JobPosting",
      "@id": url,
      url,
      title: role.title,
      description,
      datePosted: posted,
      validThrough: validThrough.toISOString(),
      employmentType: EMPLOYMENT_TYPE[role.type] ?? undefined,
      occupationalCategory: role.discipline
        ? DISCIPLINE_LABEL[role.discipline]
        : undefined,
      hiringOrganization: { "@id": id.organization },
      directApply: true,
      ...(remote ? { jobLocationType: "TELECOMMUTE" } : {}),
      ...(role.location
        ? {
            jobLocation: {
              "@type": "Place",
              address: {
                "@type": "PostalAddress",
                addressLocality: role.location,
              },
            },
          }
        : {}),
      ...(remote && role.location
        ? {
            applicantLocationRequirements: {
              "@type": "Country",
              name: role.location,
            },
          }
        : {}),
    }),
  }
}

/**
 * Schema.org's employment vocabulary for the collection's own `type` values.
 * Its spelling, not ours: CONTRACTOR and INTERN are the terms Google reads.
 */
const EMPLOYMENT_TYPE: Record<Role["type"], string> = {
  "full-time": "FULL_TIME",
  contract: "CONTRACTOR",
  internship: "INTERN",
}

/**
 * A listing page: the items it lists, in the order it lists them.
 *
 * Only the URLs and names, not the whole article again - the article's own
 * page carries its full description, and repeating it here would be two
 * descriptions of one thing for a crawler to reconcile.
 */
export function itemList({
  name,
  description,
  path,
  items,
  origin = publicSiteUrl(),
}: {
  name: string
  description: string
  path: string
  items: readonly { name: string; path: string }[]
  origin?: string
}): Json {
  const id = ids(origin)
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${origin}${path}`,
    url: `${origin}${path}`,
    name,
    description,
    inLanguage: site.locale,
    isPartOf: { "@id": id.website },
    publisher: { "@id": id.organization },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: items.length,
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        url: `${origin}${item.path}`,
      })),
    },
  }
}
