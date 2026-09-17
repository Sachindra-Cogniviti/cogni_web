import type { Metadata } from "next"

import { pageMetadata } from "@/lib/metadata"
import { getPayload } from "payload"

import config from "@/payload.config"
import { CareersLife } from "@/components/careers-life"
import { PageClose, PageHeader, PageShell } from "@/components/page-shell"
import {
  Container,
  Corners,
  Kicker,
  Roll,
  sectionPadding,
} from "@/components/primitives"
import { FlowRule } from "@/components/scroll-motion"
import { Stagger } from "@/components/stagger"
import { careersPage } from "@/content/pages"
import { site } from "@/content/site"
import type { Role } from "@/payload-types"

export const metadata: Metadata = pageMetadata({
  title: "Careers",
  description: careersPage.header.body,
  path: "/careers/",
})

/**
 * Openings change without a deploy, so the page cannot be static. Sixty
 * seconds is short enough that a role published in the admin appears while
 * the person who published it is still looking at the tab, and long enough
 * that the careers page is not a database query per visitor.
 */
export const revalidate = 60

/** Track value -> the label used on the page above. One source, two uses. */
const DISCIPLINES: Record<string, string> = {
  "platform-consulting": "Platform consulting",
  "integration-data": "Integration and data engineering",
  "product-engineering": "Product engineering",
  "applied-ai": "Applied AI",
}

const TYPES: Record<string, string> = {
  "full-time": "Full time",
  contract: "Contract",
  internship: "Internship",
}

const REMOTE: Record<string, string> = {
  onsite: "On site",
  hybrid: "Hybrid",
  remote: "Remote",
}

/**
 * Open roles, newest first.
 *
 * Returns an empty list rather than throwing if Payload cannot be reached.
 * The careers page is mostly stable copy about how we work, and it is better
 * for that to render with no openings than for a database blip to 500 a page
 * a candidate reached from a job board.
 */
async function openRoles(): Promise<Role[]> {
  try {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: "roles",
      where: { _status: { equals: "published" } },
      sort: "-postedAt",
      limit: 50,
      depth: 0,
      // No page count: that is a second round trip to the database for a
      // number nothing here shows.
      pagination: false,
      overrideAccess: false,
    })
    return docs
  } catch (error) {
    console.error("Roles could not be loaded:", error)
    return []
  }
}

/**
 * /careers
 *
 * Built for the empty case first. Most of the time there is nothing
 * advertised, and a careers page whose only content is "no current openings"
 * wastes the visit of exactly the person worth keeping - so how we work and
 * the four tracks we hire into carry the page, and the roles list is an
 * addition to it rather than the point of it.
 */
export default async function CareersPage() {
  const roles = await openRoles()

  return (
    <PageShell>
      <PageHeader content={careersPage.header} />

      <section className={`relative ${sectionPadding}`}>
        <Container>
          <Kicker data-reveal="0" data-flow="left">
            {careersPage.principles.kicker}
          </Kicker>
          <h2
            data-reveal="60"
            data-flow="left"
            className="mt-5 max-w-[18ch] text-[clamp(28px,3.2vw,44px)] leading-[1.06] font-semibold tracking-[-0.03em] text-balance"
          >
            {careersPage.principles.heading}
          </h2>

          {/* A hairline cell grid - the page's existing device for a set of
              peers. One gap-px on a ruled ground draws every internal rule
              exactly once, so no cell has a double border. */}
          <Stagger
            step={0.1}
            className="mt-12 grid grid-cols-[repeat(auto-fit,minmax(290px,1fr))] gap-px bg-rule"
          >
            {careersPage.principles.items.map((item) => (
              <div
                key={item.title}
                data-stagger
                className="relative bg-paper p-8"
              >
                <Corners />
                <h3 className="max-w-[22ch] text-[18.5px] leading-[1.25] font-semibold tracking-[-0.015em] text-balance">
                  {item.title}
                </h3>
                <p className="mt-4 text-[14.5px] leading-[1.65] text-pretty text-ink-soft">
                  {item.body}
                </p>
              </div>
            ))}
          </Stagger>
        </Container>
        <FlowRule />
      </section>

      <section className={`relative bg-paper-alt ${sectionPadding}`}>
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-8">
            <div>
              <Kicker data-reveal="0" data-flow="left">
                {careersPage.disciplines.kicker}
              </Kicker>
              <h2
                data-reveal="60"
                data-flow="left"
                className="mt-5 text-[clamp(28px,3.2vw,44px)] leading-[1.06] font-semibold tracking-[-0.03em] text-balance"
              >
                {careersPage.disciplines.heading}
              </h2>
            </div>
            <p
              data-reveal="120"
              data-flow="right"
              className="max-w-[40ch] text-[15.5px] leading-[1.6] text-pretty text-ink-soft"
            >
              {careersPage.disciplines.body}
            </p>
          </div>

          {/* Numbered, because these are four named tracks a candidate picks
              between - the number is an index, not a sequence, so it reads as
              a register rather than a set of steps. */}
          <Stagger
            as="ol"
            step={0.1}
            className="mt-12 list-none border-t border-rule"
          >
            {careersPage.disciplines.items.map((item, index) => (
              <li
                key={item.name}
                data-stagger
                className="grid gap-x-8 gap-y-3 border-b border-rule py-7 md:grid-cols-[64px_minmax(0,1fr)_minmax(0,1.4fr)]"
              >
                <span className="font-mono text-[11px] tracking-[0.14em] text-oxblood">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="text-[18px] font-semibold tracking-[-0.015em]">
                  {item.name}
                </h3>
                <p className="text-[14.5px] leading-[1.65] text-pretty text-ink-soft">
                  {item.detail}
                </p>
              </li>
            ))}
          </Stagger>
        </Container>
        <FlowRule />
      </section>

      <section id="roles" className={`relative ${sectionPadding}`}>
        <Container>
          {roles.length === 0 ? (
            <div className="max-w-[62ch]">
              <Kicker data-reveal="0" data-flow="left">
                {careersPage.noRoles.kicker}
              </Kicker>
              <h2
                data-reveal="60"
                data-flow="left"
                className="mt-5 text-[clamp(28px,3.2vw,44px)] leading-[1.06] font-semibold tracking-[-0.03em] text-balance"
              >
                {careersPage.noRoles.heading}
              </h2>
              <p
                data-reveal="120"
                data-flow="left"
                className="mt-6 text-[16px] leading-[1.7] text-pretty text-ink-soft"
              >
                {careersPage.noRoles.body}
              </p>
            </div>
          ) : (
            <>
              <Kicker data-reveal="0" data-flow="left">
                {careersPage.roles.kicker}
              </Kicker>
              <h2
                data-reveal="60"
                data-flow="left"
                className="mt-5 text-[clamp(28px,3.2vw,44px)] leading-[1.06] font-semibold tracking-[-0.03em] text-balance"
              >
                {careersPage.roles.heading}
              </h2>
              <p
                data-reveal="120"
                data-flow="left"
                className="mt-6 max-w-[58ch] text-[15.5px] leading-[1.65] text-pretty text-ink-soft"
              >
                {careersPage.roles.body}
              </p>

              <Stagger as="ul" step={0.1} className="mt-12 list-none">
                {roles.map((role) => (
                  <RoleCard key={role.id} role={role} />
                ))}
              </Stagger>
            </>
          )}
        </Container>
        <FlowRule />
      </section>

      <PageClose content={careersPage.close} />

      {/* Last before the footer. */}
      <CareersLife />
    </PageShell>
  )
}

/**
 * One opening.
 *
 * A mailto rather than an application form. Sending a CV means an attachment,
 * and an attachment means upload handling, virus scanning and a storage
 * policy for personal data - none of which is worth building for a page that
 * will list a handful of roles a year. Mail already does all of it.
 */
function RoleCard({ role }: { role: Role }) {
  const to = role.applyEmail || site.email
  const subject = encodeURIComponent(`Application: ${role.title}`)

  return (
    <li
      data-stagger
      className="relative border-t border-rule py-9 last:border-b"
    >
      <div className="grid gap-x-10 gap-y-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div>
          <h3 className="text-[clamp(20px,2.1vw,26px)] leading-[1.15] font-semibold tracking-[-0.02em] text-balance">
            {role.title}
          </h3>
          <p className="mt-3 max-w-[56ch] text-[15px] leading-[1.65] text-pretty text-ink-soft">
            {role.summary}
          </p>

          {(role.responsibilities?.length || role.requirements?.length) && (
            <div className="mt-6 grid gap-x-10 gap-y-6 sm:grid-cols-2">
              {role.responsibilities && role.responsibilities.length > 0 && (
                <RoleList
                  title="What you will own"
                  items={role.responsibilities}
                />
              )}
              {role.requirements && role.requirements.length > 0 && (
                <RoleList
                  title="What you will bring"
                  items={role.requirements}
                />
              )}
            </div>
          )}
        </div>

        <div className="lg:pt-2">
          <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-3 text-[13.5px]">
            <Meta label={careersPage.roles.disciplineLabel}>
              {DISCIPLINES[role.discipline] ?? role.discipline}
            </Meta>
            <Meta label={careersPage.roles.locationLabel}>
              {role.location}
              {role.remote ? ` · ${REMOTE[role.remote] ?? role.remote}` : ""}
            </Meta>
            <Meta label={careersPage.roles.typeLabel}>
              {TYPES[role.type] ?? role.type}
            </Meta>
          </dl>
          <a
            href={`mailto:${to}?subject=${subject}`}
            className="control-motion mt-7 inline-block border-b border-oxblood/35 pb-[3px] text-[15px] font-medium text-oxblood hover:border-ink/35 hover:text-ink"
          >
            <Roll>{careersPage.roles.apply}</Roll>
          </a>
        </div>
      </div>
    </li>
  )
}

function RoleList({
  title,
  items,
}: {
  title: string
  items: { text: string; id?: string | null }[]
}) {
  return (
    <div>
      <h4 className="font-mono text-[10.5px] tracking-[0.18em] text-ink-faint uppercase">
        {title}
      </h4>
      <ul className="mt-3 flex list-none flex-col gap-2">
        {items.map((item, index) => (
          <li
            key={item.id ?? index}
            className="relative pl-4 text-[14px] leading-[1.6] text-pretty text-ink-soft"
          >
            <span
              aria-hidden="true"
              className="absolute top-[9px] left-0 h-px w-2 bg-oxblood"
            />
            {item.text}
          </li>
        ))}
      </ul>
    </div>
  )
}

function Meta({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <>
      <dt className="font-mono text-[10.5px] tracking-[0.18em] text-ink-faint uppercase">
        {label}
      </dt>
      <dd className="text-ink">{children}</dd>
    </>
  )
}
