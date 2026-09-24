"use client"

import Image, { type StaticImageData } from "next/image"

import { Container, Corners } from "@/components/primitives"
import { ScrambleText } from "@/components/scramble-text"
import { FlowRule } from "@/components/scroll-motion"
import { trustedBy } from "@/content/site"
import { useLogoRide } from "@/lib/logo-ride"

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
 * Client line with a stage at the centre.
 *
 * The third treatment, and the one taken from Sentry's welcome page: a single
 * row of clients travelling steadily sideways, with whatever reaches the
 * middle lifted out of the row, held large for a moment, and set back down as
 * it carries on. The row does not close up behind it - the empty slot travels
 * on and is there to catch it.
 *
 * What is deliberately not taken is the fiction around it. Sentry draws a
 * flying saucer over the centre and the lift is a tractor beam, which is
 * exactly right for Sentry and would be absurd here: this page is hairlines,
 * paper, ink and one accent, and it has spent ten sections earning a
 * particular kind of seriousness. So the mechanic is kept and the story is
 * replaced with the page's own vocabulary for "look at this one":
 *
 *   - **Brackets.** The same Corners that mark a cell on the logo wall and a
 *     card in the certifications, in oxblood rather than ghost, standing
 *     around the stage. They are the page's existing way of saying that a
 *     thing is being singled out.
 *   - **A wash, not a beam.** A pale oxblood gradient in a trapezoid that
 *     widens towards the line, so there is a lit place for the logo to be
 *     held in without anything being drawn that emits the light. It is faint
 *     enough to read as paper catching light rather than as a shape.
 *   - **The line itself.** A hairline the logos ride along, so the row has a
 *     floor and the lift is off something.
 *
 * The centre also dims its neighbours rather than brightening itself: logos
 * in the line sit back at 42% and only the held one comes to full strength.
 * That is what stops the band reading as twelve things competing, which is
 * the failure mode of every logo row, and it is why this one can be a single
 * line where the other two treatments need a grid or two rows to breathe.
 *
 * All the movement is in lib/logo-ride.ts - one rAF loop, no per-frame
 * measurement, and the same three gates as everything else that moves on this
 * page. The markup here is laid out so that it is a correct, evenly spaced,
 * static row before any of that runs: each slot's resting position is written
 * as a transform off `--arc-pitch`, the same variable the stylesheet sizes the
 * slots with, so the server's layout and the loop's first frame agree and
 * there is nothing to do under reduced motion or with scripting off.
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

export function TrustedByArc() {
  const { row, items } = useLogoRide(trustedBy.logos.length)

  return (
    <section
      aria-label="Trusted by"
      className="relative py-[clamp(48px,7vw,72px)]"
    >
      <Container>
        {/* Centred and above the line, where the label column of the other
            two treatments sits beside it: a single line has no side to put a
            column next to without making the line shorter than it wants. */}
        <div className="text-center">
          <div
            data-reveal="0"
            className="font-mono text-[11px] tracking-[0.2em] text-ink-faint uppercase"
          >
            <ScrambleText text={trustedBy.kicker} />
          </div>
          <p
            data-reveal="60"
            className="mx-auto mt-[10px] max-w-[62ch] text-[14.5px] leading-[1.55] text-ink-soft"
          >
            {trustedBy.body}
          </p>
        </div>
      </Container>

      {/* Full-bleed rather than inside the Container: the line is a thing that
          passes through the page, and a marquee that starts and stops at the
          text measure reads as a box with logos in it. */}
      <div data-reveal="120" className="mt-[clamp(28px,4vw,44px)]">
        <div ref={row} className="logo-arc">
          <div className="logo-arc-stage" aria-hidden="true">
            <div className="logo-arc-wash" />
            <Corners tone="oxblood" size={12} />
          </div>

          <ul className="logo-arc-track m-0 list-none p-0">
            {trustedBy.logos.map((logo, i) => (
              <li
                key={logo.id}
                ref={(el) => {
                  items.current[i] = el
                }}
                className="logo-arc-item"
                // The resting place of this slot, in the stylesheet's own
                // units. The loop overwrites it on the first frame with the
                // identical value in pixels.
                style={{
                  transform: `translate3d(calc(var(--arc-pitch) * ${i}), 0, 0)`,
                }}
              >
                <a
                  href={logo.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${logo.name} (opens in a new tab)`}
                  className="flex h-full items-center justify-center px-6 outline-none focus-visible:ring-2 focus-visible:ring-oxblood focus-visible:ring-inset"
                >
                  <Image
                    src={files[logo.id]}
                    alt={logo.name}
                    data-tone={"tone" in logo ? logo.tone : undefined}
                    // A slot is at most 210px wide, and the held logo is
                    // drawn at nearly twice that, so the rendition has to
                    // cover the stage rather than the slot.
                    sizes="420px"
                    className="logo-mark w-auto max-w-full"
                    style={{ height: logo.height }}
                  />
                </a>
              </li>
            ))}
          </ul>

          <div className="logo-arc-floor" aria-hidden="true" />
        </div>
      </div>

      <FlowRule drawn={false} />
    </section>
  )
}
