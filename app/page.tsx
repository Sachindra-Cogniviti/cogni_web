import { Careers } from "@/components/careers"
import { ClientWork } from "@/components/client-work"
import { Contact } from "@/components/contact"
import { CoupaTraining } from "@/components/coupa-training"
import { Credentials } from "@/components/credentials"
import { Hero } from "@/components/hero"
import { PlatformServices } from "@/components/platform-services"
import { ProductDesktop } from "@/components/product-desktop"
// import { ProductPortfolio } from "@/components/product-portfolio"
import { Resources } from "@/components/resources"
import { SectionRail } from "@/components/section-rail"
import { SiteFooter } from "@/components/site-footer"
import { SiteNav } from "@/components/site-nav"
import { Together } from "@/components/together"
import { TrustedBy } from "@/components/trusted-by"
import { TwoSides } from "@/components/two-sides"
import { WhyCogniviti } from "@/components/why-cogniviti"

/**
 * Homepage.
 *
 * Section order is the design's narrative, and it is the reason the page holds
 * together: position the company, prove it, split into the two halves of the
 * business, show the products twice in different registers, then the services
 * that deliver them, then the evidence, then the ask.
 *
 * The light/dark alternation is structural, not decorative. The two dark
 * blocks - portfolio plus desktop, then contact plus footer - bracket the
 * light editorial middle, so the page has two deliberate technical moments
 * rather than one uniform surface.
 *
 * The product portfolio table is hidden for now, not removed: the component
 * and its content stay in place, and the `#products` anchor has moved to the
 * desktop so every link to the products still lands. Restore it by
 * uncommenting the import and the element below and moving the id back.
 */
export default function Page() {
  return (
    <>
      <SiteNav />
      <main>
        <Hero />
        <TrustedBy />
        <TwoSides />
        {/* <ProductPortfolio /> */}
        <ProductDesktop />
        <PlatformServices />
        <CoupaTraining />
        <Credentials />
        <ClientWork />
        <WhyCogniviti />
        <Together />
        <Resources />
        <Careers />
        <Contact />
      </main>
      <SiteFooter />
      <SectionRail />
    </>
  )
}
