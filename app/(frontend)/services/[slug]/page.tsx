import Link from "next/link"
import { notFound } from "next/navigation"
import { JsonLd } from "@/components/json-ld"
import { PageClose, PageHeader, PageShell } from "@/components/page-shell"
import { Container, sectionPadding } from "@/components/primitives"
import { platformServices } from "@/content/services"
import { pageMetadata } from "@/lib/metadata"
import { publicSiteUrl } from "@/lib/deployment"

export const dynamicParams = false
export function generateStaticParams() {
  return platformServices.map(({ slug }) => ({ slug }))
}
type Props = { params: Promise<{ slug: string }> }
function findPlatform(slug: string) {
  const platform = platformServices.find((item) => item.slug === slug)
  if (!platform) notFound()
  return platform
}
export async function generateMetadata({ params }: Props) {
  const platform = findPlatform((await params).slug)
  return pageMetadata({
    title: platform.title,
    description: platform.description,
    path: `/services/${platform.slug}/`,
  })
}

export default async function PlatformServicePage({ params }: Props) {
  const platform = findPlatform((await params).slug)
  const origin = publicSiteUrl()
  return (
    <PageShell>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: platform.title,
          description: platform.description,
          serviceType: platform.heading,
          url: `${origin}/services/${platform.slug}/`,
          provider: {
            "@id": `${origin}/#organization`,
            "@type": "Organization",
            name: "Cogniviti Labs",
            url: origin,
          },
        }}
      />
      <PageHeader
        content={{
          trail: [
            { label: "Home", href: "/" },
            { label: "Services", href: "/services/" },
            { label: platform.name },
          ],
          kicker: `${platform.name} services`,
          heading: platform.heading,
          body: platform.intro,
        }}
      />
      <section className={sectionPadding}>
        <Container>
          <div className="grid gap-10 lg:grid-cols-3">
            {platform.sections.map((section) => (
              <div key={section.title} className="border-t border-rule pt-6">
                <h2 className="text-2xl font-semibold tracking-tight">
                  {section.title}
                </h2>
                <p className="mt-5 leading-relaxed text-ink-soft">
                  {section.body}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-12 flex flex-wrap gap-6 text-oxblood">
            <Link
              href={platform.related.href}
              className="underline underline-offset-4"
            >
              {platform.related.label}
            </Link>
            <Link href="/work/" className="underline underline-offset-4">
              Explore client work
            </Link>
            {platform.slug === "coupa" && (
              <Link href="/#training" className="underline underline-offset-4">
                Coupa training for your team
              </Link>
            )}
          </div>
        </Container>
      </section>
      <section className={`bg-paper-alt ${sectionPadding}`}>
        <Container>
          <h2 className="text-3xl font-semibold tracking-tight">
            {platform.name} implementation questions
          </h2>
          <div className="mt-8 max-w-[800px]">
            {platform.faq.map((faq) => (
              <div key={faq.question} className="border-t border-rule py-6">
                <h3 className="text-xl font-semibold">{faq.question}</h3>
                <p className="mt-3 leading-relaxed text-ink-soft">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
          <Link
            href="/services/"
            className="mt-6 inline-block text-oxblood underline underline-offset-4"
          >
            Explore all platform services →
          </Link>
        </Container>
      </section>
      <PageClose
        content={{
          kicker: `${platform.name} delivery`,
          heading: `Discuss your ${platform.name} requirements`,
          body: "Share your current systems, project priorities and support needs so we can agree the right delivery scope.",
          cta: {
            label: "Talk to our team",
            href: `/contact/?subject=${platform.slug}-services`,
          },
        }}
      />
    </PageShell>
  )
}
