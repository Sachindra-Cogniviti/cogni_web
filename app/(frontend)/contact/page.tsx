import type { Metadata } from "next"

import { OG_IMAGE, pageMetadata } from "@/lib/metadata"

import { ContactForm } from "@/components/contact-form"
import { PageClose, PageHeader, PageShell } from "@/components/page-shell"
import { PresenceMap } from "@/components/presence-map"
import {
  Container,
  Corners,
  Kicker,
  Roll,
  sectionPadding,
} from "@/components/primitives"
import { FlowRule } from "@/components/scroll-motion"
import { Stagger } from "@/components/stagger"
import { contactPage } from "@/content/pages"
import { globalPresence } from "@/content/site"

export const metadata: Metadata = pageMetadata({
  ...contactPage.seo,
  path: "/contact/",
  image: {
    url: "/contact/og.png",
    ...OG_IMAGE,
    alt: contactPage.header.heading,
  },
})

/**
 * /contact
 *
 * Two columns at desktop: the ways to reach a person on the left, the form on
 * the right. That order is deliberate - somebody who already knows what they
 * want should find the phone number before they find a form, and somebody who
 * does not gets the structure the form gives them. On a narrow screen the
 * direct channels come first for the same reason.
 *
 * The map is the site's own dotted world map, not a tile map. The offices are
 * already pinned by coordinate in `globalPresence`, so a second map with a
 * second set of coordinates would be one more thing to fall out of step - and
 * a tile map would put a third-party script, a different visual language and
 * a cookie banner on the page to show four pins.
 *
 * `searchParams` carries a subject through from links elsewhere on the site
 * ("Request a Demonstration" arrives with ?subject=products), so the form
 * opens on the right topic instead of asking a question the visitor has
 * already answered by clicking.
 */
export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string }>
}) {
  const { subject } = await searchParams
  const known = contactPage.form.subjects.some((s) => s.value === subject)

  return (
    <PageShell>
      <PageHeader content={contactPage.header} />

      <section className={`relative ${sectionPadding}`}>
        <Container>
          <div className="grid gap-[clamp(40px,5vw,72px)] lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
            <div data-reveal="0" data-flow="left">
              <Kicker>{contactPage.direct.kicker}</Kicker>
              <h2 className="mt-4 max-w-[16ch] text-[clamp(24px,2.6vw,34px)] leading-[1.12] font-semibold tracking-[-0.025em] text-balance">
                {contactPage.direct.heading}
              </h2>
              <p className="mt-4 max-w-[46ch] text-[15.5px] leading-[1.65] text-pretty text-ink-soft">
                {contactPage.direct.body}
              </p>

              {/* A description list, because that is what it is: each channel
                  is a term and its value. A screen reader announces the pair,
                  which a stack of divs would not. */}
              <Stagger as="dl" step={0.1} className="mt-10 flex flex-col">
                {contactPage.direct.channels.map((channel) => (
                  <div
                    key={channel.label}
                    data-stagger
                    className="border-t border-rule py-5 last:border-b"
                  >
                    <dt className="font-mono text-[10.5px] tracking-[0.18em] text-ink-faint uppercase">
                      {channel.label}
                    </dt>
                    <dd className="mt-2">
                      {"href" in channel && channel.href ? (
                        <a
                          href={channel.href}
                          className="control-motion text-[17px] font-medium text-ink hover:text-oxblood"
                        >
                          <Roll>{channel.value}</Roll>
                        </a>
                      ) : (
                        <span className="text-[17px] font-medium text-ink">
                          {channel.value}
                        </span>
                      )}
                      <span className="mt-1 block text-[13px] text-ink-muted">
                        {channel.note}
                      </span>
                    </dd>
                  </div>
                ))}
              </Stagger>
            </div>

            <div data-reveal="80" data-flow="right">
              <ContactForm defaultSubject={known ? subject : undefined} />
            </div>
          </div>
        </Container>
        <FlowRule />
      </section>

      <section className={`relative bg-paper-alt ${sectionPadding}`}>
        <Container>
          <Kicker data-reveal="0" data-flow="left">
            {contactPage.offices.kicker}
          </Kicker>
          <h2
            data-reveal="60"
            data-flow="left"
            className="mt-5 max-w-[16ch] text-[clamp(28px,3.2vw,44px)] leading-[1.06] font-semibold tracking-[-0.03em] text-balance"
          >
            {contactPage.offices.heading}
          </h2>

          <div data-reveal="120" className="mt-12">
            <PresenceMap />
          </div>

          <Stagger
            step={0.1}
            className="mt-14 grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-px bg-rule"
          >
            {contactPage.offices.items.map((office) => {
              const pin = globalPresence.locations.find(
                (l) => l.id === office.mapId
              )
              return (
                <div
                  key={office.city}
                  data-stagger
                  className="relative bg-paper-alt p-7"
                >
                  <Corners />
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-[18px] font-semibold tracking-[-0.015em]">
                      {office.city}
                    </h3>
                    <span className="font-mono text-[10.5px] tracking-[0.14em] text-oxblood uppercase">
                      {office.role}
                    </span>
                  </div>
                  {pin && (
                    <div className="mt-1 font-mono text-[11px] text-ink-faint">
                      {pin.offset}
                    </div>
                  )}
                  <address className="mt-4 text-[14px] leading-[1.6] text-ink-soft not-italic">
                    {office.address}
                  </address>
                </div>
              )
            })}
          </Stagger>

          <p
            data-reveal="0"
            className="mt-12 max-w-[68ch] text-[15px] leading-[1.7] text-pretty text-ink-soft"
          >
            {contactPage.offices.body}
          </p>
        </Container>
        <FlowRule />
      </section>

      <PageClose content={contactPage.close} />
    </PageShell>
  )
}
