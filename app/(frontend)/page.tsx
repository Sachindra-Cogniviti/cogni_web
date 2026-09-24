import { Careers } from "@/components/careers"
import { Certifications } from "@/components/certifications"
import { ClientWork } from "@/components/client-work"
import { Contact } from "@/components/contact"
import { CoupaTraining } from "@/components/coupa-training"
import { Credentials } from "@/components/credentials"
import { Hero } from "@/components/hero"
import { OurStory } from "@/components/our-story"
import { People } from "@/components/people"
import { Container, HatchBand } from "@/components/primitives"
import { PlatformServices } from "@/components/platform-services"
import { ProductDesktop } from "@/components/product-desktop"
// import { ProductPortfolio } from "@/components/product-portfolio"
import { Resources } from "@/components/resources"
import { SectionRail } from "@/components/section-rail"
import { SiteFooter } from "@/components/site-footer"
import { SiteNav } from "@/components/site-nav"
import { Together } from "@/components/together"
import { TrustedBy } from "@/components/trusted-by"
import { TrustedByArc } from "@/components/trusted-by-arc"
import { TrustedByCards } from "@/components/trusted-by-cards"
import { TrustedByLoop } from "@/components/trusted-by-loop"
import { TwoSides } from "@/components/two-sides"
import { Updates } from "@/components/updates"
import { WhyCogniviti } from "@/components/why-cogniviti"
import type { ResourceItem } from "@/components/resources"
import type { WorkStory } from "@/components/client-work"
import {
  categoriesOf,
  deliveryPath,
  getPosts,
  getStories,
  imageSource,
  mediaOf,
} from "@/lib/cms"

/**
 * Two sections carry Payload content - the selected client work and the
 * resources row - so the page is revalidated every minute like the pages
 * that list that content in full. Everything else on it is static copy.
 */
export const revalidate = 60

/**
 * Homepage.
 *
 * Section order is the design's narrative, and it is the reason the page holds
 * together: position the company, prove it, split into the two halves of the
 * business, show the products twice in different registers, then the services
 * that deliver them, then the evidence, then the ask.
 *
 * "Prove it" is two sections, not one. The client wall answers who trusts us
 * and the certifications answer what we are independently held to, and they
 * are adjacent because either alone is half an answer. They share an armature
 * for the same reason - see components/certifications.tsx.
 *
 * The company block is four sections under one anchor, for the same reason:
 * the story says why the practice exists, the credentials give its scale, the
 * map gives its footprint and the team gives its faces. Only the first of the
 * four carries #company, so the rail holds "Company" across all of them.
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
export default async function Page() {
  const [stories, posts] = await Promise.all([getStories(3), getPosts(3)])

  // The three latest stories, each with its delivery path as the stops.
  // Undefined when there are none, so the section falls back to the
  // summaries in content.
  const work: WorkStory[] | undefined = stories.length
    ? stories.map((story, index) => ({
        num: String(index + 1).padStart(2, "0"),
        title: story.title,
        body: story.excerpt,
        tags: deliveryPath(story),
        href: `/work/${story.slug}/`,
      }))
    : undefined

  const reading: ResourceItem[] | undefined = posts.length
    ? posts.map((post) => {
        const category = categoriesOf(post.categories)[0]?.title ?? "Insight"
        const cover = mediaOf(post.coverImage)
        const image = cover ? imageSource(cover, "inline") : null
        return {
          eyebrow: category,
          title: post.title,
          href: `/blog/${post.slug}/`,
          image: image
            ? { ...image, alt: cover?.alt ?? "" }
            : `editorial photo · ${category}`,
        }
      })
    : undefined

  return (
    <>
      <SiteNav />
      <main>
        {/* The nav is fixed, so this clears it by the bar's own height rather
            than sitting at flow top, and the hero's top padding drops by the
            same amount it adds - the page opens at the height it always did,
            with the grid declared before the headline rather than after it. */}
        <HatchBand className="mt-[68px]" />
        <Hero />
        {/* TEMPORARY - four treatments of the client wall on the page at
            once so they can be compared in place. Delete the losing ones,
            this comment, TrialCaption and every caption below once a shape is
            chosen. */}
        <TrialCaption>1 &mdash; two counter-scrolling rows</TrialCaption>
        <TrustedByLoop />
        <TrialCaption>
          2 &mdash; hairline grid, one cell turning at a time
        </TrialCaption>
        <TrustedBy />
        <TrialCaption>3 &mdash; one line, centre stage</TrialCaption>
        <TrustedByArc />
        <TrialCaption>
          4 &mdash; fanned deck, middle card square on
        </TrialCaption>
        <TrustedByCards />
        <Certifications />
        {/* The announcement band. It sits here because the two blocks
            above are static proof - who trusts us, what we are held to -
            and this is the first thing on the page that is current. */}
        <Updates />
        <TwoSides />
        {/* <ProductPortfolio /> */}
        <ProductDesktop />
        <PlatformServices />
        <CoupaTraining />
        {/* The company block, in four movements under one #company anchor: why
            we exist, the scale of the practice, where it operates, and who is
            in it. People sit last on purpose - faces are the most concrete
            thing here, and they hand off to Careers below. */}
        <OurStory />
        <Credentials />
        <People />
        <ClientWork stories={work} />
        <WhyCogniviti />
        <Together />
        <Resources items={reading} />
        <Careers />
        <Contact />
      </main>
      <SiteFooter />
      <SectionRail />
    </>
  )
}

/** TEMPORARY. Goes with the two client-wall treatments above. */
function TrialCaption({ children }: { children: React.ReactNode }) {
  return (
    <Container>
      <p className="mt-8 border-l-2 border-oxblood pl-3 font-mono text-[11px] tracking-[0.18em] text-oxblood uppercase">
        {children}
      </p>
    </Container>
  )
}
