/* The admin's front page, in place of Payload's grid of empty cards.
 *
 * Registered as admin.components.views.dashboard in payload.config.ts, so
 * Payload still owns the route, the auth check, the header and the
 * sidebar; this component is only what fills the page. It is a server
 * component and reads through the local API with access control on, so an
 * editor sees the same collections here as in the sidebar and nothing
 * more.
 *
 * What it shows, and why. Payload's default dashboard is one card per
 * collection with a plus in the corner - the sidebar again, larger. What a
 * person opening the admin actually wants to know is whether anything is
 * waiting for them and what state the content is in, so each collection is
 * a row with its counts (live and draft for the ones with a publish step,
 * new and total for enquiries), the last thing edited and how long ago,
 * and the way in. New enquiries, the one thing here that arrives without
 * anyone in the team doing anything, get a strip at the top so they are
 * seen before the reader scrolls.
 *
 * The grouping is Payload's own (admin.group on each collection), read from
 * the nav groups the view already computes, so a collection added to the
 * config appears here without a change to this file. Styles are the
 * `.cl-dash` rules in app/(payload)/custom.css, written against Payload's
 * theme variables so both themes work. */
import Link from "next/link"

import type { DashboardViewServerProps } from "@payloadcms/next/views"
import type { CollectionSlug, StaticLabel, Where } from "payload"

type Row = {
  slug: string
  label: string
  href: string
  createHref: string | null
  meta: string
  /* Live and draft counts, for the collections with a publish step. */
  live?: number
  drafts?: number
  /* Things waiting on a person: new enquiries. */
  attention: number
  latest: { title: string; when: string } | null
}

type Group = { label: string; rows: Row[] }

export async function Dashboard(props: DashboardViewServerProps) {
  const { navGroups = [], payload, permissions, user } = props
  const adminRoute = payload.config.routes.admin

  // Every collection at once: each row is two or three round trips to the
  // database, and there are eight of them, so in series this page would
  // wait on twenty queries one after another.
  const groups: Group[] = (
    await Promise.all(
      navGroups.map(async (group) => ({
        label: label(group.label),
        rows: await Promise.all(
          group.entities
            .filter((entity) => entity.type === "collections")
            .map((entity) =>
              describe(entity.slug as CollectionSlug, label(entity.label))
            )
        ),
      }))
    )
  ).filter((group) => group.rows.length > 0)

  const enquiries = groups
    .flatMap((g) => g.rows)
    .find((r) => r.slug === "enquiries")
  const waiting = enquiries?.attention ?? 0

  return (
    <div className="cl-dash">
      <header className="cl-dash__mast">
        <p className="cl-dash__kicker cl-dash__kicker--accent">
          Cogniviti Labs · Admin
        </p>
        <h1>Hello, {firstName(user?.name)}.</h1>
        <p className="cl-dash__lede">{lede(groups)}</p>
      </header>

      {enquiries && waiting > 0 && (
        <Link
          className="cl-dash__alert"
          href={`${enquiries.href}?where[status][equals]=new`}
        >
          <span className="cl-dash__alert-count">
            {waiting} new {waiting === 1 ? "enquiry" : "enquiries"}
          </span>
          <span className="cl-dash__alert-detail">
            {enquiries.latest
              ? `Most recent from ${enquiries.latest.title}, ${enquiries.latest.when}.`
              : "Waiting for a reply."}
          </span>
          <span className="cl-dash__alert-go">Open</span>
        </Link>
      )}

      {groups.map((group) => (
        <section className="cl-dash__group" key={group.label}>
          <div className="cl-dash__group-head">
            <h2 className="cl-dash__kicker">{group.label}</h2>
          </div>
          <ul className="cl-dash__rows">
            {group.rows.map((row) => (
              <li className="cl-dash__row" key={row.slug}>
                <Link className="cl-dash__row-title" href={row.href}>
                  {row.label}
                  {row.attention > 0 && (
                    <span className="cl-dash__dot" aria-hidden="true" />
                  )}
                </Link>
                <span className="cl-dash__row-meta">{row.meta}</span>
                <span className="cl-dash__row-last">
                  {row.latest ? (
                    <>
                      <span className="cl-dash__row-last-title">
                        {row.latest.title}
                      </span>
                      <span className="cl-dash__row-last-when">
                        {" "}
                        · {row.latest.when}
                      </span>
                    </>
                  ) : (
                    "Nothing here yet"
                  )}
                </span>
                {row.createHref ? (
                  <Link className="cl-dash__row-new" href={row.createHref}>
                    + New
                  </Link>
                ) : (
                  <span />
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )

  /* One row's worth of facts about a collection. Every query runs as the
   * signed-in user so the counts match what the list view will show. */
  async function describe(slug: CollectionSlug, name: string): Promise<Row> {
    const collection = payload.collections[slug]
    const config = collection.config
    const access = permissions?.collections?.[slug]
    const href = `${adminRoute}/collections/${slug}`
    const createHref = access?.create ? `${href}/create` : null

    const count = async (where?: Where) =>
      (
        await payload.count({
          collection: slug,
          where,
          overrideAccess: false,
          user,
        })
      ).totalDocs

    const total = await count()

    let meta: string
    let attention = 0
    let live: number | undefined
    let drafts: number | undefined
    if (config.versions?.drafts) {
      live = await count({ _status: { equals: "published" } })
      drafts = total - live
      meta = `${live} live · ${drafts} ${drafts === 1 ? "draft" : "drafts"}`
    } else if (slug === "enquiries") {
      attention = await count({ status: { equals: "new" } })
      meta = `${attention} new · ${total} total`
    } else if (config.upload) {
      meta = `${total} ${total === 1 ? "file" : "files"}`
    } else {
      meta = `${total} ${total === 1 ? "entry" : "entries"}`
    }

    let latest: Row["latest"] = null
    if (total > 0) {
      const { docs } = await payload.find({
        collection: slug,
        limit: 1,
        sort: "-updatedAt",
        depth: 0,
        overrideAccess: false,
        user,
      })
      const doc = docs[0] as unknown as Record<string, unknown> | undefined
      if (doc) {
        const titleField =
          config.admin.useAsTitle && config.admin.useAsTitle !== "id"
            ? config.admin.useAsTitle
            : config.upload
              ? "filename"
              : "id"
        const title = doc[titleField]
        latest = {
          title:
            typeof title === "string" && title.trim()
              ? title
              : `#${String(doc.id)}`,
          when: ago(String(doc.updatedAt)),
        }
      }
    }

    return {
      slug,
      label: name,
      href,
      createHref,
      meta,
      live,
      drafts,
      attention,
      latest,
    }
  }
}

/* Payload labels are a string or a map of translations. The admin runs in
 * English only, so take that or the first one there is. */
function label(value: StaticLabel | string): string {
  if (typeof value === "string") return value
  return value.en ?? Object.values(value)[0] ?? ""
}

function firstName(name: string | null | undefined): string {
  const first = (name ?? "").trim().split(/\s+/)[0]
  return first || "there"
}

/* One sentence for the masthead built from whatever the reader can see:
 * "12 posts live and 3 in draft. 2 enquiries waiting for a reply." */
function lede(groups: Group[]): string {
  const rows = groups.flatMap((g) => g.rows)
  const parts: string[] = []

  const posts = rows.find((r) => r.slug === "posts")
  if (posts) {
    const live = posts.live ?? 0
    const drafts = posts.drafts ?? 0
    parts.push(
      `${live} ${live === 1 ? "post" : "posts"} live` +
        (drafts > 0 ? ` and ${drafts} in draft` : "") +
        "."
    )
  }

  const enquiries = rows.find((r) => r.slug === "enquiries")
  if (enquiries) {
    parts.push(
      enquiries.attention > 0
        ? `${enquiries.attention} ${
            enquiries.attention === 1 ? "enquiry" : "enquiries"
          } waiting for a reply.`
        : "No enquiries waiting."
    )
  }

  return parts.length
    ? parts.join(" ")
    : "What is live, what is waiting, and where to start."
}

/* "just now", "4 hours ago", "3 days ago", then a date. Rendered on the
 * server, so the clock is the server's; at day granularity that is fine. */
function ago(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ""
  const seconds = Math.round((Date.now() - then) / 1000)
  if (seconds < 60) return "just now"
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`
  const days = Math.round(hours / 24)
  if (days < 14) return `${days} ${days === 1 ? "day" : "days"} ago`
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}
