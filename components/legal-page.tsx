import { JsonLd } from "@/components/json-ld"
import { PageHeader, PageShell } from "@/components/page-shell"
import { Container, Corners } from "@/components/primitives"
import { FlowRule } from "@/components/scroll-motion"
import type { LegalDocument } from "@/content/legal"
import { site } from "@/content/site"
import { publicSiteUrl } from "@/lib/deployment"
import { legalDocument } from "@/lib/schema"

/**
 * A legal document, at a reading measure.
 *
 * Both documents have the same shape, so they share a component and differ
 * only in the content passed in. Deliberately the plainest page on the site:
 * no stagger, no reveal on the prose. The scroll flow fades an element back
 * out when too little of it is on screen, and a policy longer than the
 * viewport would fade while it is being read - the same reason the article
 * body on a post carries no `data-reveal`.
 *
 * The `article` class is the stylesheet's own long-form treatment, the one
 * a blog post gets, so a policy is set like the rest of the site's prose
 * rather than in a second style nobody maintains.
 */
export function LegalPage({ doc }: { doc: LegalDocument }) {
  const origin = publicSiteUrl()

  return (
    <PageShell>
      <JsonLd data={legalDocument({ doc, origin })} />

      <PageHeader content={doc.header}>
        <p
          data-reveal="240"
          data-flow="left"
          className="mt-8 font-mono text-[11px] tracking-[0.18em] text-ink-faint uppercase"
        >
          Effective{" "}
          <time dateTime={doc.effectiveIso}>{doc.effective}</time>
        </p>
      </PageHeader>

      <section className="relative pb-[clamp(72px,8vw,120px)]">
        <Container>
          <div className="article max-w-[68ch]">
            {doc.intro.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}

            {doc.sections.map((section) => (
              <section key={section.heading}>
                <h2>{section.heading}</h2>
                {section.blocks.map((block, index) =>
                  "p" in block ? (
                    <p key={index}>{block.p}</p>
                  ) : (
                    <ul key={index}>
                      {block.ul.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )
                )}
              </section>
            ))}

            <h2>{doc.contact.heading}</h2>
            <p>{doc.contact.body}</p>
          </div>

          {/* The address itself, out of the prose and into the site's own
              hairline cell - it is the one part of the page a reader comes
              looking for rather than reads through. */}
          <address className="relative mt-10 max-w-[68ch] border border-rule bg-paper p-7 not-italic">
            <Corners />
            <div className="flex flex-col gap-1.5 text-[15px] leading-[1.6]">
              {doc.contact.attention && (
                <span className="font-semibold">{doc.contact.attention}</span>
              )}
              <span className="font-semibold">Cogniviti Labs Pte. Ltd.</span>
              <a
                href={`mailto:${site.email}`}
                className="control-motion w-fit border-b border-oxblood/35 pb-[2px] text-oxblood hover:border-ink/35 hover:text-ink"
              >
                {site.email}
              </a>
              <a
                href={`${origin}/`}
                className="control-motion w-fit text-ink-muted hover:text-ink"
              >
                {origin.replace(/^https?:\/\//, "")}
              </a>
            </div>
          </address>
        </Container>
        <FlowRule />
      </section>
    </PageShell>
  )
}
