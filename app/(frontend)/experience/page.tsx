import type { Metadata } from "next"

import { OG_IMAGE, pageMetadata } from "@/lib/metadata"

import { ExperienceCentre } from "@/components/experience-centre"
import { PageClose, PageHeader, PageShell } from "@/components/page-shell"
import {
  Container,
  Corners,
  Kicker,
  sectionPadding,
} from "@/components/primitives"
import { FlowRule } from "@/components/scroll-motion"
import { Stagger } from "@/components/stagger"
import { experiencePage } from "@/content/pages"

export const metadata: Metadata = pageMetadata({
  ...experiencePage.seo,
  path: "/experience/",
  image: {
    url: "/experience/og.png",
    ...OG_IMAGE,
    alt: experiencePage.header.heading,
  },
})

/**
 * /experience
 *
 * The demonstration surface. The switcher and the frame are a client
 * component; everything around them is static, so the page ships as markup
 * with one interactive island in it rather than as an application.
 *
 * The "before you start" notes sit below the demo rather than above it. A
 * visitor who arrived to try something should reach the thing they came for
 * without reading three caveats first - and the caveats are reassurance, so
 * they land better once there is something on screen to be reassured about.
 */
export default function ExperiencePage() {
  return (
    <PageShell>
      <PageHeader content={experiencePage.header} />

      <section className={`relative ${sectionPadding}`}>
        <Container>
          <ExperienceCentre />
        </Container>
        <FlowRule />
      </section>

      <section className={`relative bg-paper-alt ${sectionPadding}`}>
        <Container>
          <Kicker data-reveal="0" data-flow="left">
            {experiencePage.notes.kicker}
          </Kicker>
          <Stagger
            step={0.1}
            className="mt-10 grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-px bg-rule"
          >
            {experiencePage.notes.items.map((note) => (
              <div
                key={note.title}
                data-stagger
                className="relative bg-paper-alt p-8"
              >
                <Corners />
                <h3 className="max-w-[22ch] text-[17.5px] leading-[1.25] font-semibold tracking-[-0.015em] text-balance">
                  {note.title}
                </h3>
                <p className="mt-4 text-[14.5px] leading-[1.65] text-pretty text-ink-soft">
                  {note.body}
                </p>
              </div>
            ))}
          </Stagger>
        </Container>
        <FlowRule />
      </section>

      <PageClose content={experiencePage.close} />
    </PageShell>
  )
}
