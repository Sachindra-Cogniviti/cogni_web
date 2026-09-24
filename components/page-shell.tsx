import type { PageHeader as PageHeaderContent } from "@/content/pages"

import { JsonLd } from "@/components/json-ld"
import { breadcrumbs } from "@/lib/schema"
import {
  Container,
  HatchBand,
  invertedButton,
  Kicker,
  Roll,
  sectionPadding,
} from "@/components/primitives"
import { FlowRule } from "@/components/scroll-motion"
import { SiteFooter } from "@/components/site-footer"
import { SiteNav } from "@/components/site-nav"

/**
 * The frame every page off the homepage sits in.
 *
 * The homepage assembles its own shell inline because it is the only page
 * with a section rail and the only one whose order is an argument. Everything
 * else is nav, one header, content, footer - so it lives here once rather
 * than being retyped per route, and a change to how sub-pages open is a
 * change to this file.
 *
 * No section rail. The rail lists the homepage's eleven sections and exists
 * because that page is long enough to get lost in; a four-section product
 * page would get a rail that says less than the scrollbar does.
 */
export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteNav />
      <main>
        {/* Clears the fixed bar by its own height and states the page grid
            before the first line of type, exactly as the homepage does. */}
        <HatchBand className="mt-[68px]" />
        {children}
      </main>
      <SiteFooter />
    </>
  )
}

/**
 * The opening block of a sub-page: breadcrumb, kicker, heading, standfirst.
 *
 * Deliberately not a hero. The homepage has the only hero on the site - a
 * full-height galaxy with a headline animating in word by word - and giving
 * every sub-page a smaller version of it would make the front door look like
 * a room. This is a masthead: it names where you are and gets out of the way.
 *
 * The breadcrumb is a real <nav> with an ordered list, because that is what
 * it is, and the trail is what tells a reader arriving from a search result
 * where this page sits. The last entry is the current page and carries
 * aria-current rather than a link to itself.
 */
export function PageHeader({
  content,
  children,
}: {
  content: PageHeaderContent
  /** Optional trailing element - a CTA, a count, a status line. */
  children?: React.ReactNode
}) {
  return (
    <section className="relative pt-[clamp(40px,5vw,64px)] pb-[clamp(48px,6vw,80px)]">
      <Container>
        {/* The same trail the <ol> below renders, in the form a crawler
            reads. Built from one array, so the visible breadcrumb and the
            structured one cannot describe different paths. */}
        <JsonLd data={breadcrumbs(content.trail)} />
        <nav aria-label="Breadcrumb" data-reveal="0" data-flow="left">
          <ol className="flex flex-wrap items-center gap-2 font-mono text-[11px] tracking-[0.14em] text-ink-faint uppercase">
            {content.trail.map((step, index) => {
              const last = index === content.trail.length - 1
              return (
                <li
                  key={step.label}
                  className={`flex items-center gap-2 ${last ? "min-w-0 max-w-full" : ""}`}
                >
                  {index > 0 && (
                    <span aria-hidden="true" className="text-ink-ghost">
                      /
                    </span>
                  )}
                  {step.href && !last ? (
                    <a
                      href={step.href}
                      className="transition-colors duration-[var(--roll-duration)] ease-[var(--roll-ease)] hover:text-oxblood"
                    >
                      <Roll>{step.label}</Roll>
                    </a>
                  ) : (
                    <span
                      aria-current={last ? "page" : undefined}
                      title={last ? step.label : undefined}
                      className={last ? "min-w-0 truncate" : undefined}
                    >
                      {step.label}
                    </span>
                  )}
                </li>
              )
            })}
          </ol>
        </nav>

        <Kicker data-reveal="60" data-flow="left" className="mt-8">
          {content.kicker}
        </Kicker>
        <h1
          data-reveal="120"
          data-flow="left"
          className="mt-5 max-w-[20ch] text-[clamp(34px,4.4vw,62px)] leading-[1.03] font-semibold tracking-[-0.035em] text-balance"
        >
          {content.heading}
        </h1>
        <p
          data-reveal="180"
          data-flow="left"
          className="mt-6 max-w-[62ch] text-[17px] leading-[1.65] text-pretty text-ink-soft"
        >
          {content.body}
        </p>
        {children}
      </Container>
      <FlowRule />
    </section>
  )
}

/**
 * The closing ask, on the night ground.
 *
 * Every sub-page ends with one, for the same reason the homepage does: the
 * dark block is where the page stops explaining and asks for something, and
 * a reader who has got this far should not have to go looking for the way to
 * start a conversation.
 *
 * `data-nav-dark` is what tells the fixed bar to switch to its night palette
 * when this block passes under it. The homepage flips on section ids listed
 * in `rail`, which no sub-page has - see the ground detection in
 * components/site-nav.tsx.
 */
export function PageClose({
  content,
}: {
  content: {
    kicker: string
    heading: string
    body: string
    cta: { label: string; href: string }
  }
}) {
  return (
    <section
      data-nav-dark
      className={`relative bg-night text-night-fg ${sectionPadding}`}
    >
      <Container className="max-w-[860px] text-center">
        <Kicker tone="dark" data-reveal="0">
          {content.kicker}
        </Kicker>
        <h2
          data-reveal="60"
          className="mt-[22px] text-[clamp(28px,3.4vw,46px)] leading-[1.1] font-semibold tracking-[-0.03em] text-balance"
        >
          {content.heading}
        </h2>
        <p
          data-reveal="120"
          className="mx-auto mt-6 max-w-[58ch] text-[16px] leading-[1.65] text-pretty text-night-muted"
        >
          {content.body}
        </p>
        <div data-reveal="180" className="mt-9">
          <a href={content.cta.href} className={invertedButton}>
            <Roll>{content.cta.label}</Roll>
          </a>
        </div>
      </Container>
    </section>
  )
}
