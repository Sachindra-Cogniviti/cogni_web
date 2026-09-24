"use client"

import Image, { type StaticImageData } from "next/image"

import { Container, FlipTrack } from "@/components/primitives"
import { ScrambleText } from "@/components/scramble-text"
import { FlowRule, Parallax } from "@/components/scroll-motion"
import { trustedBy } from "@/content/site"

import aeci from "@/public/logos/aeci.svg"
import bangchak from "@/public/logos/bangchak.png"
import carsome from "@/public/logos/carsome.png"
import digitalEdge from "@/public/logos/digital_edge.png"
import dynapack from "@/public/logos/dynapack.png"
import fidelity from "@/public/logos/fsg-logo.png"
import indosat from "@/public/logos/indosat.png"
import mirvac from "@/public/logos/mirvac.png"
import nets from "@/public/logos/nets.png"
import pil from "@/public/logos/pil.png"
import tfg from "@/public/logos/tfg.svg"
import wearnes from "@/public/logos/wearnes.png"

/**
 * Client logo wall, as two counter-scrolling rows.
 *
 * The alternative shape to the hairline grid in components/trusted-by.tsx,
 * built for the same content and the same label column, so the two can be put
 * on the page together and compared. It is the marquee treatment - the logos
 * never stop moving - taken as far as it can go without becoming a ticker.
 *
 * Three decisions carry it:
 *
 *   - **Two rows, opposite directions.** One row drifting in one direction
 *     is a news ticker and the eye tries to read it. Two rows passing each
 *     other cancel out: there is no single direction to follow, so the band
 *     reads as texture rather than as a queue of announcements.
 *   - **Different durations.** 46s against 58s. Equal speeds would put the
 *     two rows into a repeating pattern against each other, and a pattern
 *     that repeats is a pattern the eye learns and then finds static again.
 *     Two lengths that do not divide into one another never line up twice
 *     the same way.
 *   - **Slow.** A full pass takes the better part of a minute. Anything
 *     quicker and a reader who looks up mid-page sees movement instead of
 *     clients, which is the opposite of what a logo wall is for.
 *
 * The loop itself is four copies of the row translated by exactly a quarter
 * of the track, so the frame the animation ends on is pixel-identical to the
 * one it starts on and there is no seam. Four rather than the minimum two
 * because a quarter is exact where a third is 33.333% and drifts; and
 * because two copies of six logos is not reliably wider than a large screen,
 * and a track narrower than its window shows the gap at the end of the pass.
 * Only the first copy is in the accessibility tree - the rest are
 * `aria-hidden`, or a screen reader is read the client list four times.
 *
 * Motion is CSS, not Motion: it is a single linear transform with no state,
 * no interruption and no scroll coupling, which is the one case where the
 * compositor should be left to it with no JavaScript involved at all. It
 * also means the rows are already moving before React has hydrated.
 *
 * The band stops for a pointer (hovering a row pauses that row, so a logo
 * can actually be aimed at and clicked) and for keyboard focus, and does not
 * start at all under `prefers-reduced-motion`, where it falls back to a
 * static row - see `.logo-loop-*` in globals.css.
 *
 * The pause is also what makes the wall's own hover legible here. The mark
 * sits in the same FlipTrack the grid uses, so pointing at a logo turns it a
 * quarter over its top edge - but a turn on something still sliding past is
 * unreadable, and the row it belongs to has already stopped by the time the
 * turn begins. Stopping and turning are one gesture: the band notices the
 * pointer, holds, and the logo under it answers.
 */
const files: Record<(typeof trustedBy.logos)[number]["id"], StaticImageData> = {
  aeci,
  bangchak,
  carsome,
  digitalEdge,
  dynapack,
  fidelity,
  indosat,
  mirvac,
  nets,
  pil,
  tfg,
  wearnes,
}

/** Copies of the row inside the track. See the note above on why four. */
const COPIES = 4

type Logo = (typeof trustedBy.logos)[number]

/**
 * Dealt alternately rather than cut in half, so neither row ends up holding
 * all the wide wordmarks - the two rows are then about the same length, and
 * two rows of the same length at different speeds is what the design wants.
 */
const rows: Logo[][] = [
  trustedBy.logos.filter((_, i) => i % 2 === 0),
  trustedBy.logos.filter((_, i) => i % 2 === 1),
]

function LogoLoopRow({
  logos,
  seconds,
  reverse = false,
}: {
  logos: Logo[]
  seconds: number
  reverse?: boolean
}) {
  return (
    <div
      className="logo-loop-row"
      data-reverse={reverse || undefined}
      style={{ "--loop-duration": `${seconds}s` } as React.CSSProperties}
    >
      <ul className="logo-loop-track m-0 flex list-none">
        {Array.from({ length: COPIES }).flatMap((_, copy) =>
          logos.map((logo) => (
            <li
              key={`${copy}-${logo.id}`}
              aria-hidden={copy > 0 || undefined}
              className="shrink-0"
            >
              <a
                href={logo.href}
                target="_blank"
                rel="noopener noreferrer"
                tabIndex={copy > 0 ? -1 : undefined}
                aria-label={`${logo.name} (opens in a new tab)`}
                className="logo-link logo-flip flex h-[104px] w-[clamp(140px,18vw,200px)] items-center justify-center px-6 outline-none focus-visible:ring-2 focus-visible:ring-oxblood focus-visible:ring-inset"
              >
                <FlipTrack depth={logo.height / 2}>
                  <Image
                    src={files[logo.id]}
                    alt={copy > 0 ? "" : logo.name}
                    data-tone={"tone" in logo ? logo.tone : undefined}
                    // The cell is at most 200px wide with 24px of padding
                    // either side, so 240px covers the densest screen without
                    // a phone fetching a rendition it has no room for.
                    sizes="240px"
                    className="logo-mark w-auto max-w-full"
                    style={{ height: logo.height }}
                  />
                </FlipTrack>
              </a>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}

export function TrustedByLoop() {
  return (
    <section
      aria-label="Trusted by"
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
                <ScrambleText text={trustedBy.kicker} />
              </div>
              <p
                data-reveal="60"
                data-flow="left"
                className="mt-[10px] max-w-[34ch] text-[14.5px] leading-[1.55] text-ink-soft max-lg:mx-auto"
              >
                {trustedBy.body}
              </p>
            </div>
          </Parallax>

          {/* min-w-0 is load-bearing, as on the certification row: the track
              is several times wider than the screen and the grid would
              otherwise size this column to it. */}
          <div data-reveal="0" data-flow="right" className="min-w-0">
            <div className="divide-y divide-rule border-y border-rule">
              <LogoLoopRow logos={rows[0]} seconds={46} />
              <LogoLoopRow logos={rows[1]} seconds={58} reverse />
            </div>
          </div>
        </div>
      </Container>
      <FlowRule drawn={false} />
    </section>
  )
}
