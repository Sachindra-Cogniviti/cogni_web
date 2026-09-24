import type { Metadata } from "next"

import { PageClose, PageHeader, PageShell } from "@/components/page-shell"
import { Container, Corners, Roll } from "@/components/primitives"
import { FlowRule } from "@/components/scroll-motion"
import { Stagger } from "@/components/stagger"
import { notFoundPage } from "@/content/pages"
import { pageMetadata } from "@/lib/metadata"

/**
 * The 404, in the site's own shell.
 *
 * Next serves this for an unmatched URL and for every `notFound()` call in
 * the three [slug] routes. It answers 404 either way - that was already
 * right and is not what this file changes. What it changes is the dead end:
 * the default page has no nav, no footer and nowhere to go, which is a poor
 * result for a reader and a poor one for a crawler that followed a stale
 * link from somewhere else.
 *
 * `path: "/404/"` is a placeholder for a canonical that is never used: a
 * 404 response is not indexed, so the canonical is inert. It is set only
 * because pageMetadata writes the whole metadata set and an absent path
 * would be the odd one out.
 */
export const metadata: Metadata = {
  ...pageMetadata({ ...notFoundPage.seo, path: "/404/" }),
  // Belt and braces over the 404 status, which is the real signal. Costs
  // nothing and removes any question about a soft 404.
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return (
    <PageShell>
      <PageHeader content={notFoundPage.header} />

      <section className="relative pb-[clamp(72px,8vw,120px)]">
        <Container>
          <h2
            data-reveal="0"
            data-flow="left"
            className="font-mono text-[11px] tracking-[0.18em] text-ink-faint uppercase"
          >
            {notFoundPage.linksLabel}
          </h2>

          {/* The page's hairline cell grid, the same device the careers and
              products pages use for a set of peers. */}
          <Stagger
            as="ul"
            step={0.09}
            className="mt-7 grid list-none grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-px border border-rule bg-rule"
          >
            {notFoundPage.links.map((link) => (
              <li key={link.href} data-stagger className="bg-paper">
                <a
                  href={link.href}
                  className="control-motion group relative flex h-full flex-col p-7"
                >
                  <Corners />
                  <span className="text-[18px] font-semibold tracking-[-0.015em] group-hover:text-oxblood">
                    <Roll>{link.label}</Roll>
                  </span>
                  <span className="mt-3 text-[14.5px] leading-[1.6] text-pretty text-ink-soft">
                    {link.detail}
                  </span>
                </a>
              </li>
            ))}
          </Stagger>
        </Container>
        <FlowRule />
      </section>

      <PageClose content={notFoundPage.close} />
    </PageShell>
  )
}
