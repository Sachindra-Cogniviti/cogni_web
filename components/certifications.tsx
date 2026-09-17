import Image, { type StaticImageData } from "next/image"

import { Container, Corners } from "@/components/primitives"
import { ScrambleText } from "@/components/scramble-text"
import { FlowRule, Parallax } from "@/components/scroll-motion"
import { Stagger } from "@/components/stagger"
import { certifications } from "@/content/site"

import coupaPartner from "@/public/logos/certifications/placeholder-coupa-partner.png"
import iso9001 from "@/public/logos/certifications/placeholder-iso-9001.png"
import iso27001 from "@/public/logos/certifications/placeholder-iso-27001.png"

/**
 * Certifications, directly under the client wall.
 *
 * The two sections are one argument - who trusts us, then what we are
 * independently held to - so this reuses the wall's armature: the same label
 * column, the same fluid gutter, the same beat. The cells are the page's
 * existing card motif from platform-services (oxblood tick riding the top
 * rule, growing across the cell on hover), so a credential reads as a sibling
 * of a delivery stage rather than as a fourth kind of object.
 *
 * The band is the wall's flat 72px rather than the page's fluid section
 * rhythm, for the same reason: an identical band makes the two read as one
 * block instead of two unrelated strips. FlowRule draws the hairline at the
 * bottom edge of each, and TwoSides adds the normal section gap below.
 *
 * It is set as type rather than as a row of badge graphics. That is not a
 * placeholder standing in for artwork - it is the finished treatment, and the
 * reason is in content/site.ts: ISO issues no logo to certified organisations,
 * so a badge scraped off the web certifies nothing. The designation, the
 * discipline and - once they exist - the auditing body and certificate number
 * are the things a procurement buyer can actually check.
 */

/**
 * PLACEHOLDER ARTWORK - MUST BE SWAPPED BEFORE LAUNCH.
 *
 * These three seals are drawn in the site's own palette. They are not any
 * certification body's mark and are not meant to pass as one: they exist so
 * the section can be judged with artwork in place. The `placeholder-` prefix
 * on every filename is the guard - it makes an accidental launch obvious in
 * a file listing and in a diff.
 *
 * The real mark comes from whichever body performed the audit (BSI, TUV, DNV,
 * SGS, Bureau Veritas...), carries their accreditation mark and your
 * certificate number, and is governed by their rules on placement and minimum
 * size. Coupa's partner badge comes from the partner portal and is specific to
 * the partner tier.
 *
 * Do NOT substitute a badge found on the web. ISO performs no certification
 * and issues no logo to certified organisations - its globe mark is a
 * trademark reserved to ISO itself - so a generic "ISO 27001 certified"
 * graphic attests to nothing and is not ours to display.
 *
 * To swap: replace the file, drop the `placeholder-` prefix, update the
 * import. Nothing else changes.
 */
const badges: Record<string, StaticImageData> = {
  "iso-27001": iso27001,
  "iso-9001": iso9001,
  "coupa-partner": coupaPartner,
}

export function Certifications() {
  return (
    <section
      aria-label="Certifications"
      className="relative py-[clamp(48px,7vw,72px)]"
    >
      <Container>
        <div className="grid gap-x-[clamp(32px,5vw,80px)] gap-y-9 lg:grid-cols-[minmax(220px,300px)_1fr]">
          <Parallax y={18} className="min-w-0">
            <div className="max-lg:text-center">
              <div
                data-reveal="0"
                data-flow="left"
                className="font-mono text-[11px] tracking-[0.2em] text-ink-faint uppercase"
              >
                <ScrambleText text={certifications.kicker} />
              </div>
              <p
                data-reveal="60"
                data-flow="left"
                className="mt-[10px] max-w-[34ch] text-[14.5px] leading-[1.55] text-ink-soft max-lg:mx-auto"
              >
                {certifications.body}
              </p>
            </div>
          </Parallax>

          {/* Three cells in a row from sm up. Below that they were a stack
              of three tall cards; now they are the same row, scrolling
              sideways under the gutter and snapping card to card, so all
              three are one gesture away rather than three screens. The
              rules move from the list to the cards, which are what scroll. */}
          {/* min-w-0 is load-bearing: the row of three cards is wider than
              a phone, and without it the grid sizes its one column to the
              row rather than to the screen. */}
          <Parallax y={-8} className="min-w-0">
            <Stagger
              as="ul"
              from="fade"
              className="scroll-row m-0 list-none max-sm:-mx-[20px] max-sm:flex max-sm:snap-x max-sm:snap-mandatory max-sm:overflow-x-auto max-sm:px-[20px] max-sm:[scroll-padding-inline:20px] sm:grid sm:grid-cols-3 sm:border-t sm:border-l sm:border-t-rule-strong sm:border-l-rule"
            >
              {certifications.items.map((item) => {
                const badge = badges[item.id]
                const provenance = [item.issuer, item.reference].filter(Boolean)
                return (
                  <li
                    key={item.id}
                    data-stagger
                    data-tap
                    className="group relative flex flex-col border-r border-b border-rule px-6 pt-7 pb-8 transition-colors duration-[250ms] hover:bg-paper-soft data-active:bg-paper-soft max-sm:w-[78vw] max-sm:max-w-[320px] max-sm:shrink-0 max-sm:snap-start max-sm:border-t max-sm:border-l max-sm:border-t-rule-strong max-sm:[&+li]:border-l-0"
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
                        className="mb-5 w-auto max-w-full self-start"
                        // A round mark reads smaller than a wordmark of the
                        // same height, and a circle only offers its diameter
                        // at the centre line - a five-character mark inside
                        // one needs real diameter before it resolves. 96px is
                        // where "27001" becomes comfortably readable.
                        style={{ height: 96 }}
                      />
                    )}

                    <div className="font-mono text-[11px] tracking-[0.16em] text-ink-faint uppercase">
                      {item.eyebrow}
                    </div>
                    <h3 className="mt-[14px] text-[clamp(20px,1.85vw,25px)] leading-[1.15] font-semibold tracking-[-0.025em] text-balance">
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
        </div>
      </Container>
      <FlowRule />
    </section>
  )
}
