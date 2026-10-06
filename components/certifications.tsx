import Image, { type StaticImageData } from "next/image"

import { Container, Corners } from "@/components/primitives"
import { ScrambleText } from "@/components/scramble-text"
import { FlowRule, Parallax } from "@/components/scroll-motion"
import { Stagger } from "@/components/stagger"
import { certifications } from "@/content/site"

import coupaPartner from "@/public/logos/certifications/coupa-partner.png"
import gepPartner from "@/public/logos/certifications/gep-partner.png"
import iso9001 from "@/public/logos/certifications/iso-9001.png"
import iso27001 from "@/public/logos/certifications/iso-27001.png"
import ivaluaPartner from "@/public/logos/certifications/ivalua-partner.png"

/**
 * Certifications, directly under the client line.
 *
 * The two sections are one argument - who trusts us, then what we are
 * independently held to - so this takes the line's shape: the copy centred
 * above, the credentials in one row across the measure, the same beat. The
 * cells are the page's existing card motif from platform-services (oxblood
 * tick riding the top rule, growing across the cell on hover), so a
 * credential reads as a sibling of a delivery stage rather than as a fourth
 * kind of object.
 *
 * The band is the line's flat 72px rather than the page's fluid section
 * rhythm, for the same reason: an identical band makes the two read as one
 * block instead of two unrelated strips. FlowRule draws the hairline at the
 * bottom edge of each, and TwoSides adds the normal section gap below.
 *
 * Each card leads with its mark, but the designation is still set as type
 * beneath it: the discipline, the standard and - once they exist - the
 * auditing body and certificate number are the things a procurement buyer
 * can actually check, and they must survive the artwork being swapped.
 */

/**
 * Artwork supplied by the company (Sept 2026), backgrounds removed. The two
 * ISO seals are generic "certified company" graphics rather than the auditing
 * body's own mark - if the certifier's badge (with their accreditation mark
 * and the certificate number) becomes available, it belongs here instead.
 * The Coupa, GEP and Ivalua marks are those vendors' logos / partner badges.
 */
const badges: Record<string, StaticImageData> = {
  "iso-27001": iso27001,
  "iso-9001": iso9001,
  "coupa-partner": coupaPartner,
  "gep-partner": gepPartner,
  "ivalua-partner": ivaluaPartner,
}

export function Certifications() {
  return (
    <section
      aria-label="Certifications"
      className="relative py-[clamp(48px,7vw,72px)]"
    >
      <Container>
        {/* Centred above the row, as the client line's copy is. Five cells
            across the measure leave no side for a label column, and the
            two blocks reading alike is the point of putting them together. */}
        <div className="text-center">
          <h2 className="sr-only">Certifications and platform partnerships</h2>
          <div
            data-reveal="0"
            className="font-mono text-[11px] tracking-[0.2em] text-ink-faint uppercase"
          >
            <ScrambleText text={certifications.kicker} />
          </div>
          <p
            data-reveal="60"
            className="mx-auto mt-[10px] max-w-[62ch] text-[14.5px] leading-[1.55] text-ink-soft"
          >
            {certifications.body}
          </p>
        </div>

        {/* Five cells in a row from lg up. Below that, five cards stacked
            would be five screens, and a grid of two or three leaves a cell
            empty in the last row with the hairlines open around it - so
            they are the same row, scrolling sideways under the gutter and
            snapping card to card. The rules move from the list to the
            cards, which are what scroll. */}
        {/* min-w-0 is load-bearing: the row of five cards is wider than the
            screen, and without it the wrapper sizes itself to the row
            rather than to the measure. */}
        <Parallax y={-8} className="mt-[clamp(28px,4vw,44px)] min-w-0">
          <Stagger
            as="ul"
            from="fade"
            className="scroll-row m-0 list-none max-lg:-mx-[clamp(20px,4vw,48px)] max-lg:flex max-lg:snap-x max-lg:snap-mandatory max-lg:overflow-x-auto max-lg:px-[clamp(20px,4vw,48px)] max-lg:[scroll-padding-inline:clamp(20px,4vw,48px)] lg:grid lg:grid-cols-5 lg:border-t lg:border-l lg:border-t-rule-strong lg:border-l-rule"
          >
            {certifications.items.map((item) => {
              const badge = badges[item.id]
              const provenance = [item.issuer, item.reference].filter(Boolean)
              return (
                <li
                  key={item.id}
                  data-stagger
                  data-tap
                  className="group relative flex flex-col border-r border-b border-rule px-[clamp(16px,1.7vw,24px)] pt-7 pb-8 transition-colors duration-[250ms] hover:bg-paper-soft data-active:bg-paper-soft max-lg:w-[78vw] max-lg:max-w-[320px] max-lg:shrink-0 max-lg:snap-start max-lg:border-t max-lg:border-l max-lg:border-t-rule-strong max-lg:[&+li]:border-l-0"
                >
                  {/* One rule, not two. The short oxblood tick that marks
                      the cell is itself what grows to the full width on
                      hover. The delivery stages fake the same effect with a
                      second line scaling over a static first - identical to
                      look at, and cheaper to animate, but it is two elements
                      and the tick never actually moves. Here it does. */}
                  <div className="absolute top-[-1px] left-0 h-[2px] w-9 bg-oxblood transition-[width] duration-300 ease-[cubic-bezier(.23,1,.32,1)] group-hover:w-full group-data-active:w-full motion-reduce:transition-none" />

                  {/* Bottom pair only. The top corners are where the oxblood
                      tick lives, and a bracket half-covered by it reads as a
                      mistake rather than as a mark. */}
                  <Corners edges="bottom" />

                  {badge && (
                    <Image
                      src={badge}
                      // The designation below already names the credential,
                      // so the mark is decoration to a screen reader.
                      alt=""
                      aria-hidden
                      sizes="140px"
                      // `self-start` is load-bearing, not tidying. The card
                      // is a column flex container, so its children stretch
                      // to the full cross axis - the width - and that beats
                      // `w-auto`. Without it a round mark is pulled to the
                      // card's width against a pinned height and renders as
                      // an ellipse.
                      //
                      // The box is a flat 96px tall on every card so the
                      // designations below line up across the row: a round
                      // seal needs that much diameter before "27001"
                      // resolves. The wordmarks (GEP, Ivalua) are wider than
                      // the cell at that height, so `max-w-full` clamps them
                      // and `object-contain` keeps the clamp from squashing
                      // the mark against the pinned height. `object-left`
                      // holds every mark to the text edge.
                      className="mb-5 h-24 w-auto max-w-full self-start object-contain object-left"
                    />
                  )}

                  {/* The eyebrow and the designation each get a flat
                      two-line zone (`min-h-[2lh]`), because the row reads
                      as five copies of one card and the copy does not
                      cooperate: two eyebrows wrap to a second line and one
                      designation does, and without the reservation every
                      card's rows sat at a different height. `lh` tracks the
                      element's own line-height, so the zones follow the
                      fluid type size; a browser without the unit drops the
                      min-height and degrades to the unaligned layout. */}
                  <div className="min-h-[2lh] font-mono text-[11px] tracking-[0.16em] text-ink-faint uppercase">
                    {item.eyebrow}
                  </div>
                  <h3 className="mt-[14px] min-h-[2lh] text-[clamp(20px,1.85vw,25px)] leading-[1.15] font-semibold tracking-[-0.025em] text-balance">
                    {item.standard}
                  </h3>
                  <p className="mt-[10px] text-[13.5px] leading-[1.6] text-pretty text-ink-muted">
                    {item.body}
                  </p>

                  {provenance.length > 0 && (
                    <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-6 font-mono text-[10.5px] tracking-[0.08em] text-ink-muted uppercase">
                      {provenance.map((line) => (
                        <span key={line}>{line}</span>
                      ))}
                    </div>
                  )}
                </li>
              )
            })}
          </Stagger>
        </Parallax>
      </Container>
      <FlowRule />
    </section>
  )
}
