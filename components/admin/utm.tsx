/* The UTM link builder's view, at /admin/utm.
 *
 * Registered as admin.components.views.utm in payload.config.ts, with the
 * nav link in components/admin/utm-nav.tsx. A custom root view is rendered
 * bare - Payload hands over the whole route - so this wraps DefaultTemplate
 * itself to keep the admin's header and sidebar, and does its own auth
 * check: unlike the dashboard, a custom view is public until it decides
 * otherwise.
 *
 * The server side's one real job is the destination list. The static pages
 * are spelled out here (they change when a route is added, which is a code
 * change anyway), the products come from content/pages.ts so a new product
 * page appears by itself, and the posts, stories and roles are read through
 * the local API as the signed-in user - published only, titled the way the
 * admin titles them - so the dropdown always offers the site as it stands.
 */
import { redirect } from "next/navigation"

import { DefaultTemplate } from "@payloadcms/next/templates"
import type { AdminViewServerProps, CollectionSlug } from "payload"

import { UtmBuilder, type UtmPage } from "@/components/admin/utm-builder"
import { productPages } from "@/content/pages"
import { siteUrl } from "@/content/site"

export async function UtmView({
  initPageResult,
  params,
  searchParams,
}: AdminViewServerProps) {
  const { locale, permissions, req, visibleEntities } = initPageResult
  const { i18n, payload, user } = req

  if (!user) redirect(`${payload.config.routes.admin}/login`)

  const staticPages: UtmPage[] = [
    { label: "Homepage", path: "/", group: "Pages" },
    { label: "Products", path: "/products/", group: "Pages" },
    { label: "Experience Centre", path: "/experience/", group: "Pages" },
    { label: "Careers", path: "/careers/", group: "Pages" },
    { label: "Contact", path: "/contact/", group: "Pages" },
    { label: "FAQ", path: "/faq/", group: "Pages" },
    { label: "Blog", path: "/blog/", group: "Pages" },
    { label: "Client stories", path: "/work/", group: "Pages" },
  ]

  const products: UtmPage[] = Object.keys(productPages).map((slug) => ({
    label: titleCase(slug),
    path: `/products/${slug}/`,
    group: "Products",
  }))

  const [posts, stories, roles] = await Promise.all([
    fromCollection("posts", "/blog/", "Posts"),
    fromCollection("client-stories", "/work/", "Client stories"),
    fromCollection("roles", "/careers/", "Open roles"),
  ])

  return (
    <DefaultTemplate
      i18n={i18n}
      locale={locale}
      params={params}
      payload={payload}
      permissions={permissions}
      searchParams={searchParams}
      user={user ?? undefined}
      visibleEntities={visibleEntities}
    >
      <UtmBuilder
        origin={siteUrl}
        pages={[...staticPages, ...products, ...posts, ...stories, ...roles]}
      />
    </DefaultTemplate>
  )

  /* The published documents of one collection as destinations, titled by
   * the collection's own useAsTitle, exactly as the list views title them. */
  async function fromCollection(
    slug: CollectionSlug,
    prefix: string,
    group: string
  ): Promise<UtmPage[]> {
    const collection = payload.collections[slug]
    if (!collection) return []
    const config = collection.config

    const { docs } = await payload.find({
      collection: slug,
      where: config.versions?.drafts
        ? { _status: { equals: "published" } }
        : undefined,
      limit: 50,
      sort: "-updatedAt",
      depth: 0,
      overrideAccess: false,
      user,
    })

    const titleField =
      config.admin.useAsTitle && config.admin.useAsTitle !== "id"
        ? config.admin.useAsTitle
        : "id"

    return docs.flatMap((doc) => {
      const record = doc as unknown as Record<string, unknown>
      if (typeof record.slug !== "string" || !record.slug) return []
      const title = record[titleField]
      return [
        {
          label:
            typeof title === "string" && title.trim()
              ? title
              : `#${String(record.id)}`,
          path: `${prefix}${record.slug}/`,
          group,
        },
      ]
    })
  }
}

/* "master-data-management" reads as "Master Data Management" in a dropdown.
 * The product pages have no display-name field to borrow; the slug is the
 * one name they all carry. */
function titleCase(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}
