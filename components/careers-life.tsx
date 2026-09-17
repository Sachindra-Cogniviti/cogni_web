import Image, { type StaticImageData } from "next/image"

import { Container, Kicker, Roll, solidButton } from "@/components/primitives"
import { Stagger } from "@/components/stagger"
import { careersPage } from "@/content/pages"

import eventKit from "@/public/life/1769611089031.jpg"
import indonesiaEvent from "@/public/life/1769611089114.jpg"
import inspireStage from "@/public/life/1778560983877.jpg"
import partnerAward from "@/public/life/1778560983893.jpg"
import goLiveTeam from "@/public/life/1781084481055.jpg"
import goLiveCake from "@/public/life/1781084481689.jpg"

/**
 * Life at Cogniviti Labs: a strip of photographs before the footer.
 *
 * Six prints laid out like snapshots dropped on a table - each in a white
 * frame, tilted its own way, and tucked well under its neighbours: the
 * prints overlap by a third or more of their width, so no print stands on
 * its own. The pile stacks the way a real one would, with the prints that
 * sit lower in front and the ones that sit higher underneath, so each raised
 * print slides under the lower prints on both sides of it. The low prints
 * also hang below the band's bottom edge, which is the footer's top: the
 * footer is stacked over this section (see components/site-footer.tsx), so
 * their bottoms are tucked under it the way the raised prints are tucked
 * under them. On a fine pointer, the print under the pointer
 * comes up: it straightens, lifts, grows a little and its shadow deepens,
 * over the rest of the pile. The lift is CSS (`.snap` in globals.css) on an
 * inner frame, not on the cell the scroll flow animates, because the flow
 * leaves an inline `translate` on the cell that would beat any hover
 * utility on it.
 *
 * Where each print sits, how far it leans and where it is in the stack is
 * here, as custom properties on the cell, and nowhere else: these are
 * layout, not copy. From `md` up the cells are positioned absolutely in a
 * band of fixed height; below that the band is a two-column flow, still
 * tilted, because six absolutely placed prints do not fit a phone.
 *
 * The photographs are in public/life, imported statically so the build gets
 * correct paths and next/image gets their sizes, and keyed here by the id
 * used in `careersPage.life.photos`.
 */
const photos: Record<
  (typeof careersPage.life.photos)[number]["id"],
  StaticImageData
> = {
  "go-live-team": goLiveTeam,
  "indonesia-event": indonesiaEvent,
  "go-live-cake": goLiveCake,
  "inspire-stage": inspireStage,
  "event-kit": eventKit,
  "partner-award": partnerAward,
}

/**
 * Per print: position (from the left, from the bottom), width, lean, and
 * place in the stack. The prints alternate low and raised across the band,
 * each starting well inside the one before it, so the raised ones (the two
 * portraits and the last print) are tucked under a low print on either
 * side. A negative bottom hangs a print below the band, under the footer.
 * `z` is the rank by height off the bottom edge, lowest in front. The
 * portrait widths are sized so their tops clear the band at the narrowest
 * width the band is used at, and the side margins leave room for a leaning
 * print's corners, which swing past its box by a few percent.
 */
const layout = [
  { left: "2%", bottom: "-14%", width: "27%", tilt: "-6deg", z: 6 },
  { left: "17%", bottom: "6%", width: "20%", tilt: "4deg", z: 2 },
  { left: "31%", bottom: "-12%", width: "26%", tilt: "-3deg", z: 5 },
  { left: "48%", bottom: "4%", width: "20%", tilt: "5deg", z: 1 },
  { left: "62%", bottom: "-14%", width: "27%", tilt: "-2deg", z: 4 },
  { left: "76%", bottom: "-2%", width: "22%", tilt: "7deg", z: 3 },
] as const

export function CareersLife() {
  const { life } = careersPage

  return (
    <section aria-label={life.kicker} className="relative pt-[clamp(88px,10vw,140px)]">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-8">
          <div>
            <Kicker data-reveal="0" data-flow="left">
              {life.kicker}
            </Kicker>
            <h2
              data-reveal="60"
              data-flow="left"
              className="mt-5 max-w-[18ch] text-[clamp(28px,3.2vw,44px)] leading-[1.06] font-semibold tracking-[-0.03em] text-balance"
            >
              {life.heading}
            </h2>
            <p
              data-reveal="120"
              data-flow="left"
              className="mt-6 max-w-[50ch] text-[15.5px] leading-[1.65] text-pretty text-ink-soft"
            >
              {life.body}
            </p>
          </div>
          <div data-reveal="180" data-flow="right">
            <a href={life.cta.href} className={solidButton}>
              <Roll>{life.cta.label}</Roll>
            </a>
          </div>
        </div>
      </Container>

      {/* The band. Wider than the column on purpose, so the prints at
          either end can reach past it towards the frame. */}
      <Stagger
        as="ul"
        from="up"
        step={0.08}
        className="snap-band relative m-0 mt-10 list-none md:mt-4"
      >
        {life.photos.map((photo, index) => {
          const place = layout[index % layout.length]
          return (
            <li
              key={photo.id}
              data-stagger
              data-tap
              className="snap-cell"
              style={
                {
                  "--l": place.left,
                  "--b": place.bottom,
                  "--w": place.width,
                  "--tilt": place.tilt,
                  "--z": place.z,
                } as React.CSSProperties
              }
            >
              <div className="snap bg-white p-[3.5%]">
                <Image
                  src={photos[photo.id]}
                  alt={photo.alt}
                  sizes="(min-width: 768px) 28vw, 48vw"
                  className="block h-auto w-full"
                />
              </div>
            </li>
          )
        })}
      </Stagger>
    </section>
  )
}
