import * as React from "react"
import type { Metadata } from "next"

import { OG_IMAGE, pageMetadata } from "@/lib/metadata"
import { notFound } from "next/navigation"

import { JsonLd } from "@/components/json-ld"
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
import { experiencePage, productPages } from "@/content/pages"
import { products } from "@/content/site"
import { softwareApplication } from "@/lib/schema"

/**
 * Every product is known at build time, so all six pages are prerendered and
 * nothing else can be reached: `dynamicParams = false` makes a request for
 * /products/anything-else a 404 rather than a render attempt against a slug
 * that has no copy.
 */
export const dynamicParams = false

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = products.find((p) => p.slug === slug)
  if (!product) return {}
  return pageMetadata({
    title: product.name,
    description: productPages[slug]?.lede ?? product.desc,
    path: `/products/${slug}/`,
    // The card drawn beside this page, rather than the site card all six
    // products used to share. No cache-busting query: the copy it is drawn
    // from is in the repo, so it cannot change without a deploy.
    image: {
      url: `/products/${slug}/og.png`,
      ...OG_IMAGE,
      alt: `${product.name} - ${product.tag}`,
    },
  })
}

/**
 * /products/[slug]
 *
 * One argument per page, in the order a buyer actually asks it: what is this,
 * what is wrong today, what does it do about that, where does it sit in what
 * I already own, and is it for me. The stat rows from the homepage's product
 * desktop reappear under "where it sits", because they are the concrete
 * detail that makes the rest land.
 *
 * The copy is DRAFT (see content/pages.ts) - extrapolated from the one-line
 * descriptions rather than supplied by the business.
 */
export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = products.find((p) => p.slug === slug)
  const page = product ? productPages[slug] : undefined
  if (!product || !page) notFound()

  const demo = experiencePage.demos.find((d) => d.slug === slug)
  const others = products.filter((p) => p.slug !== slug)

  return (
    <PageShell>
      {/* SoftwareApplication rather than Product: there is no price, no SKU
          and no offer here, and Product without one earns nothing while
          warning about both. See lib/schema.ts. */}
      <JsonLd data={softwareApplication({ product, lede: page.lede })} />

      <PageHeader
        content={{
          trail: [
            { label: "Home", href: "/" },
            { label: "Products", href: "/products/" },
            { label: product.name },
          ],
          kicker: product.kicker,
          heading: product.name,
          body: page.lede,
        }}
      >
        <div
          data-reveal="240"
          data-flow="left"
          className="mt-9 flex flex-wrap items-center gap-6"
        >
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- a full page load by design: the scroll flow binds on load (components/reveal-observer.tsx), so page links are plain anchors site-wide */}
          <a
            href="/experience/"
            className="control-motion border-b border-oxblood/35 pb-[3px] text-[15px] font-medium text-oxblood hover:border-ink/35 hover:text-ink"
          >
            <Roll>
              {demo?.demoUrl
                ? "Run the demo"
                : "See it in the Experience Centre"}
              &nbsp;&nbsp;&rarr;
            </Roll>
          </a>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- a full page load by design: the scroll flow binds on load (components/reveal-observer.tsx), so page links are plain anchors site-wide */}
          <a
            href="/contact/?subject=products"
            className="control-motion border-b border-ink/20 pb-[3px] text-[15px] font-medium text-ink-soft hover:border-oxblood/35 hover:text-oxblood"
          >
            <Roll>Talk to us about it&nbsp;&nbsp;&rarr;</Roll>
          </a>
        </div>
      </PageHeader>

      {/* The problem. On the alternate band because it is the one section
          here written from the reader's side of the table, not ours. */}
      <section className={`relative bg-paper-alt ${sectionPadding}`}>
        <Container>
          <div className="grid gap-[clamp(32px,4vw,64px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div data-reveal="0" data-flow="left">
              <Kicker>The problem</Kicker>
              <h2 className="mt-5 max-w-[18ch] text-[clamp(26px,3vw,40px)] leading-[1.08] font-semibold tracking-[-0.03em] text-balance">
                {page.problem.heading}
              </h2>
              <p className="mt-6 max-w-[54ch] text-[16px] leading-[1.7] text-pretty text-ink-soft">
                {page.problem.body}
              </p>
            </div>

            <Stagger as="ul" step={0.09} className="list-none lg:pt-[52px]">
              {page.problem.symptoms.map((symptom) => (
                <li
                  key={symptom}
                  data-stagger
                  className="relative border-t border-rule-strong py-4 pl-7 text-[15px] leading-[1.6] text-pretty text-ink-soft last:border-b"
                >
                  <span
                    aria-hidden="true"
                    className="absolute top-[26px] left-0 h-px w-3.5 bg-oxblood"
                  />
                  {symptom}
                </li>
              ))}
            </Stagger>
          </div>
        </Container>
        <FlowRule />
      </section>

      <section className={`relative ${sectionPadding}`}>
        <Container>
          <Kicker data-reveal="0" data-flow="left">
            Capabilities
          </Kicker>
          <h2
            data-reveal="60"
            data-flow="left"
            className="mt-5 text-[clamp(28px,3.2vw,44px)] leading-[1.06] font-semibold tracking-[-0.03em] text-balance"
          >
            {page.capabilities.heading}
          </h2>

          <Stagger
            step={0.1}
            className="mt-12 grid grid-cols-[repeat(auto-fit,minmax(290px,1fr))] gap-px bg-rule"
          >
            {page.capabilities.items.map((item, index) => (
              <div
                key={item.title}
                data-stagger
                className="relative bg-paper p-8"
              >
                <Corners />
                <span className="font-mono text-[11px] tracking-[0.14em] text-oxblood">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-5 max-w-[22ch] text-[18.5px] leading-[1.25] font-semibold tracking-[-0.015em] text-balance">
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

      {/* Where it sits, and the readout. The two halves are the same claim
          said twice - in prose on the left, as figures on the right - which
          is the homepage's own pattern for a technical block. */}
      <section
        data-nav-dark
        className={`relative bg-night text-night-fg ${sectionPadding}`}
      >
        <Container>
          <div className="grid gap-[clamp(32px,4vw,64px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div data-reveal="0" data-flow="left">
              <Kicker tone="dark">In your landscape</Kicker>
              <h2 className="mt-5 max-w-[18ch] text-[clamp(26px,3vw,40px)] leading-[1.08] font-semibold tracking-[-0.03em] text-balance">
                {page.fit.heading}
              </h2>
              <p className="mt-6 max-w-[52ch] text-[16px] leading-[1.7] text-pretty text-night-muted">
                {page.fit.body}
              </p>
            </div>

            <div data-reveal="80" data-flow="right">
              <dl className="grid grid-cols-[minmax(0,auto)_minmax(0,1fr)] gap-x-8 border-t border-night-fg/15">
                {page.fit.rows.map(([label, value]) => (
                  <React.Fragment key={label}>
                    <dt className="border-b border-night-fg/10 py-4 font-mono text-[10.5px] tracking-[0.16em] text-ink-faint uppercase">
                      {label}
                    </dt>
                    <dd className="border-b border-night-fg/10 py-4 text-right font-mono text-[13px] text-night-value">
                      {value}
                    </dd>
                  </React.Fragment>
                ))}
              </dl>

              <h3 className="mt-12 font-mono text-[10.5px] tracking-[0.18em] text-ink-faint uppercase">
                Live readout
              </h3>
              <dl className="mt-4 grid grid-cols-[minmax(0,auto)_minmax(0,1fr)] gap-x-8 border-t border-night-fg/15">
                {product.rows.map(([label, value]) => (
                  <React.Fragment key={label}>
                    <dt className="border-b border-night-fg/10 py-4 text-[13.5px] text-night-muted">
                      {label}
                    </dt>
                    <dd className="border-b border-night-fg/10 py-4 text-right font-mono text-[13px] text-night-value">
                      {value}
                    </dd>
                  </React.Fragment>
                ))}
              </dl>
            </div>
          </div>
        </Container>
      </section>

      <section className={`relative ${sectionPadding}`}>
        <Container>
          <div className="flex flex-wrap items-start justify-between gap-10">
            <div className="max-w-[46ch]">
              <Kicker data-reveal="0" data-flow="left">
                Who it is for
              </Kicker>
              <Stagger as="ul" step={0.1} className="mt-7 list-none">
                {page.audience.map((who) => (
                  <li
                    key={who}
                    data-stagger
                    className="border-t border-rule py-4 text-[15.5px] leading-[1.6] text-pretty text-ink last:border-b"
                  >
                    {who}
                  </li>
                ))}
              </Stagger>
            </div>

            <div data-reveal="120" data-flow="right" className="max-w-[34ch]">
              <Kicker>The rest of the suite</Kicker>
              <ul className="mt-7 flex list-none flex-col gap-3">
                {others.map((other) => (
                  <li key={other.slug}>
                    <a
                      href={`/products/${other.slug}/`}
                      className="control-motion inline-flex items-baseline gap-3 text-[15px] text-ink-soft hover:text-oxblood"
                    >
                      <span
                        aria-hidden="true"
                        className="font-mono text-[11px] text-ink-ghost"
                      >
                        {other.glyph}
                      </span>
                      <Roll>{other.name}</Roll>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
        <FlowRule />
      </section>

      <PageClose
        content={{
          kicker: "Next step",
          heading: `See ${product.name} against your own process`,
          body: "Run it in the Experience Centre with sample data, or book a session and we will run it against your categories, your ERP and your approval chains.",
          cta: { label: "Open the Experience Centre", href: "/experience/" },
        }}
      />
    </PageShell>
  )
}
