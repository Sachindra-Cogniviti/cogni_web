import Link from "next/link"
import { PageClose, PageHeader, PageShell } from "@/components/page-shell"
import { Container, sectionPadding } from "@/components/primitives"
import { services } from "@/content/site"
import { platformServices } from "@/content/services"
import { pageMetadata } from "@/lib/metadata"

export const metadata = pageMetadata({
  title: "Procurement & EPM Consulting Services",
  description:
    "Implementation, ERP integration and managed support for Coupa, OneStream, Ivalua and GEP. Procurement and finance transformation from assessment to adoption.",
  path: "/services/",
})

export default function ServicesPage() {
  return (
    <PageShell>
      <PageHeader
        content={{
          trail: [{ label: "Home", href: "/" }, { label: "Services" }],
          kicker: "Platform services",
          heading: "Procurement and EPM consulting services",
          body: "Cogniviti Labs delivers enterprise platform implementation, ERP integration, data readiness and managed support. We help procurement and finance teams deploy Coupa, OneStream, Ivalua and GEP, then improve the systems through adoption and optimisation.",
        }}
      />
      <section className={sectionPadding}>
        <Container>
          <h2 className="text-3xl font-semibold tracking-tight">
            Choose your platform
          </h2>
          <div className="mt-8 grid gap-px border border-rule bg-rule md:grid-cols-2">
            {platformServices.map((platform) => (
              <Link
                key={platform.slug}
                href={`/services/${platform.slug}/`}
                className="bg-paper p-8 transition-colors hover:bg-paper-soft focus-visible:outline-2 focus-visible:outline-oxblood"
              >
                <h3 className="text-xl font-semibold">{platform.title}</h3>
                <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
                  {platform.description}
                </p>
                <span className="mt-6 block text-sm font-medium text-oxblood">
                  Explore {platform.name} services →
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>
      <section className={`bg-paper-alt ${sectionPadding}`}>
        <Container>
          <h2 className="text-3xl font-semibold tracking-tight">
            From assessment to managed support
          </h2>
          <div className="mt-8 grid gap-8 md:grid-cols-2">
            {services.stages.map((stage) => (
              <div key={stage.num} className="border-t border-rule pt-6">
                <h3 className="text-xl font-semibold">{stage.title}</h3>
                <p className="mt-3 leading-relaxed text-ink-soft">
                  {stage.body}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-10 max-w-[65ch] leading-relaxed text-ink-soft">
            Our teams operate across Singapore, India, Indonesia and South
            Africa. Delivery scope and rollout plans are agreed around your
            organisation, its systems and its local requirements.
          </p>
          <Link
            href="/work/"
            className="mt-6 inline-block text-oxblood underline underline-offset-4"
          >
            Explore our client work
          </Link>
        </Container>
      </section>
      <PageClose
        content={{
          kicker: "Start with your requirements",
          heading: "Plan your next platform initiative",
          body: "Talk to our team about implementation, integration, data preparation or support for an existing deployment.",
          cta: {
            label: "Discuss your project",
            href: "/contact/?subject=platform-implementation",
          },
        }}
      />
    </PageShell>
  )
}
