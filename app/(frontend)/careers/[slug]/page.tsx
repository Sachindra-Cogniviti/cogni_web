import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { JsonLd } from "@/components/json-ld"
import { PageClose, PageHeader, PageShell } from "@/components/page-shell"
import { Container, Corners, Roll, sectionPadding } from "@/components/primitives"
import { Article } from "@/components/rich-text"
import { FlowRule } from "@/components/scroll-motion"
import { careersPage } from "@/content/pages"
import { site } from "@/content/site"
import {
  DISCIPLINE_LABEL,
  formatDate,
  getRole,
  getRoles,
  REMOTE_LABEL,
  ROLE_TYPE_LABEL,
} from "@/lib/cms"
import { pageMetadata } from "@/lib/metadata"
import { jobPosting } from "@/lib/schema"
import type { Role } from "@/payload-types"

export const revalidate = 60

/**
 * Open roles are prerendered; one published later renders on request rather
 * than 404ing, which matters more here than elsewhere - a role goes live and
 * is circulated the same hour.
 */
export async function generateStaticParams() {
  const roles = await getRoles()
  return roles.map((role) => ({ slug: role.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const role = await getRole(slug)
  if (!role) return {}
  const where = [role.location, role.remote ? REMOTE_LABEL[role.remote] : null]
    .filter(Boolean)
    .join(" · ")
  return pageMetadata({
    title: role.title,
    // The summary is capped at 320 in the collection, which is longer than a
    // result shows, so it is trimmed on a word boundary rather than mid-word.
    description: trim(`${role.title} - ${where}. ${role.summary}`, 155),
    path: `/careers/${slug}/`,
  })
}

/** Cuts to a length at the last space before it, so no word is halved. */
function trim(text: string, limit: number): string {
  if (text.length <= limit) return text
  const cut = text.slice(0, limit)
  const lastSpace = cut.lastIndexOf(" ")
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : limit).trimEnd()}…`
}

/**
 * /careers/[slug]
 *
 * One role, on a URL of its own.
 *
 * The roles were sections inside /careers until now, which read fine and
 * cost the site the two things a posting needs: Google Jobs wants one
 * canonical URL per posting, and a candidate sent "the integration role"
 * should land on the role rather than on a list to scroll. The listing still
 * carries the full summary and both lists - this page is where the detail,
 * the structured data and the link live.
 *
 * Deliberately plain. A job description is read closely by someone deciding
 * whether to spend an evening on an application, and the page's job is to
 * not get in the way of that.
 */
export default async function RolePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const role = await getRole(slug)
  if (!role) notFound()

  const to = role.applyEmail || site.email
  const subject = encodeURIComponent(`Application: ${role.title}`)
  const others = (await getRoles(4))
    .filter((other) => other.id !== role.id)
    .slice(0, 3)

  const facts = [
    {
      label: careersPage.roles.disciplineLabel,
      value: DISCIPLINE_LABEL[role.discipline] ?? role.discipline,
    },
    {
      label: careersPage.roles.locationLabel,
      value: [role.location, role.remote ? REMOTE_LABEL[role.remote] : null]
        .filter(Boolean)
        .join(" · "),
    },
    {
      label: careersPage.roles.typeLabel,
      value: ROLE_TYPE_LABEL[role.type] ?? role.type,
    },
    {
      label: careersPage.roles.postedLabel,
      value: formatDate(role.postedAt),
    },
  ]

  return (
    <PageShell>
      {/* The posting, for Google Jobs and anything else that reads a page
          before a person does. lib/schema.ts derives validThrough from
          postedAt: an absent one expires a listing silently. */}
      <JsonLd data={jobPosting({ role })} />

      <PageHeader
        content={{
          trail: [
            { label: "Home", href: "/" },
            { label: careersPage.header.kicker, href: "/careers/" },
            { label: role.title },
          ],
          kicker: DISCIPLINE_LABEL[role.discipline] ?? role.discipline,
          heading: role.title,
          body: role.summary,
        }}
      >
        <div
          data-reveal="240"
          data-flow="left"
          className="mt-9 flex flex-wrap items-baseline gap-x-8 gap-y-3"
        >
          <a
            href={`mailto:${to}?subject=${subject}`}
            className="control-motion border-b border-oxblood/35 pb-[3px] text-[15px] font-medium text-oxblood hover:border-ink/35 hover:text-ink"
          >
            <Roll>{careersPage.roles.apply}&nbsp;&nbsp;&rarr;</Roll>
          </a>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- a full page load by design: the scroll flow binds on load (components/reveal-observer.tsx), so page links are plain anchors site-wide */}
          <a
            href="/careers/"
            className="control-motion text-[14.5px] text-ink-muted hover:text-ink"
          >
            <Roll>&larr;&nbsp;&nbsp;{careersPage.roles.backLabel}</Roll>
          </a>
        </div>
      </PageHeader>

      <section className={`relative pb-[clamp(56px,6vw,88px)]`}>
        <Container>
          <div className="grid gap-x-[clamp(32px,5vw,80px)] gap-y-12 lg:grid-cols-[minmax(0,1fr)_minmax(220px,300px)]">
            <div className="min-w-0">
              {role.responsibilities && role.responsibilities.length > 0 && (
                <RoleList
                  title={careersPage.roles.ownLabel}
                  items={role.responsibilities}
                />
              )}
              {role.requirements && role.requirements.length > 0 && (
                <RoleList
                  title={careersPage.roles.bringLabel}
                  items={role.requirements}
                  className="mt-10"
                />
              )}

              {/* Optional longer detail. No data-reveal: the scroll flow
                  fades an element back out when too little of it is on
                  screen, and a description longer than the viewport would
                  fade while it is being read. */}
              {role.body && (
                <Article
                  body={role.body}
                  className="mt-12 max-w-[64ch] border-t border-rule pt-10"
                />
              )}
            </div>

            {/* The facts, and the way to apply, held beside the description
                on a wide screen and above it on a narrow one. */}
            <aside data-reveal="0" data-flow="right">
              <div className="relative border border-rule bg-paper p-7 lg:sticky lg:top-[120px]">
                <Corners />
                <dl className="flex flex-col gap-5">
                  {facts.map((fact) => (
                    <div key={fact.label}>
                      <dt className="font-mono text-[10.5px] tracking-[0.18em] text-ink-faint uppercase">
                        {fact.label}
                      </dt>
                      <dd className="mt-1.5 text-[15px] leading-[1.5] text-ink">
                        {fact.value}
                      </dd>
                    </div>
                  ))}
                </dl>
                <a
                  href={`mailto:${to}?subject=${subject}`}
                  className="control-motion mt-7 inline-block border-b border-oxblood/35 pb-[3px] text-[15px] font-medium text-oxblood hover:border-ink/35 hover:text-ink"
                >
                  <Roll>{careersPage.roles.apply}</Roll>
                </a>
              </div>
            </aside>
          </div>
        </Container>
        <FlowRule />
      </section>

      {others.length > 0 && (
        <section className={`relative bg-paper-alt ${sectionPadding}`}>
          <Container>
            <h2
              data-reveal="0"
              data-flow="left"
              className="text-[clamp(24px,2.8vw,36px)] leading-[1.1] font-semibold tracking-[-0.03em]"
            >
              {careersPage.roles.heading}
            </h2>
            <ul className="mt-10 list-none border-t border-rule">
              {others.map((other) => (
                <li key={other.id} className="border-b border-rule">
                  <a
                    href={`/careers/${other.slug}/`}
                    className="control-motion group flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 py-6"
                  >
                    <span className="text-[18px] font-semibold tracking-[-0.015em] group-hover:text-oxblood">
                      {other.title}
                    </span>
                    <span className="font-mono text-[11px] tracking-[0.14em] text-ink-faint uppercase">
                      {other.location}
                      {other.remote ? ` · ${REMOTE_LABEL[other.remote]}` : ""}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </Container>
          <FlowRule />
        </section>
      )}

      <PageClose content={careersPage.close} />
    </PageShell>
  )
}

/** The same hairline-dash list the careers page uses for these two sets. */
function RoleList({
  title,
  items,
  className = "",
}: {
  title: string
  items: NonNullable<Role["responsibilities"]>
  className?: string
}) {
  return (
    <div data-reveal="0" data-flow="left" className={className}>
      <h2 className="font-mono text-[11px] tracking-[0.18em] text-ink-faint uppercase">
        {title}
      </h2>
      <ul className="mt-5 flex list-none flex-col gap-3">
        {items.map((item, index) => (
          <li
            key={item.id ?? index}
            className="relative max-w-[64ch] pl-5 text-[15.5px] leading-[1.65] text-pretty text-ink-soft"
          >
            <span
              aria-hidden="true"
              className="absolute top-[11px] left-0 h-px w-2.5 bg-oxblood"
            />
            {item.text}
          </li>
        ))}
      </ul>
    </div>
  )
}
