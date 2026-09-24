"use client"

import Image, { type StaticImageData } from "next/image"
import { motion } from "motion/react"

import { Container, Corners, FlipTrack } from "@/components/primitives"
import { ScrambleText } from "@/components/scramble-text"
import { FlowRule, Parallax } from "@/components/scroll-motion"
import { Stagger } from "@/components/stagger"
import { trustedBy } from "@/content/site"
import { useIdleTurns } from "@/lib/idle-turns"

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
 * Client logo wall.
 *
 * Twelve logos in a hairline grid beside the section copy, in their own
 * colours, each linking out to the company. A white logo is flagged in
 * content and rendered dark (`.logo-mark` in globals.css) so it does not
 * vanish into the paper.
 *
 * Files are imported statically so the build gets correct paths. Each logo
 * has its own rendered height, set in content, because a 1:1 stacked mark
 * and a 6:1 wordmark at the same height never look the same size.
 *
 * Motion: the cells resolve one after another as the wall rises through the
 * viewport. On a fine pointer the mark turns over the way a link label rolls
 * (`.roll` in globals.css), but in depth: the logo and a copy of it are two
 * faces of a box half the logo's height deep, and hover turns the box a
 * quarter over its top edge, so the mark leaves upward and its twin rises
 * from underneath on the same timing as the labels (FlipTrack in
 * primitives). The cell itself stays put so the hairline grid never opens.
 * The copy runs a little ahead of the page as the section crosses the
 * viewport; the wall does not move with the scroll at all. It used to lag
 * eight pixels behind, and a one-pixel rule under a fractional translate is
 * rasterised across two pixels at half strength, so the grid's borders faded
 * in and out as the reader scrolled. Hairlines and parallax do not mix.
 *
 * The wall does not wait for a pointer to move, either. Once it is properly
 * in view a cell turns over every couple of seconds on its own, in a shuffled
 * order, through the same box and the same quarter turn the hover uses
 * (`lib/idle-turns.ts`). It is the one piece of the section that is alive
 * without the reader doing anything, and it is deliberately the smallest such
 * piece that works: one mark in twelve moving at a time reads as a wall that
 * is awake, where all twelve moving reads as a screensaver. The hook holds
 * the gates - off-screen, hidden tab and reduced motion all stop it.
 *
 * The rule under the section is static, not scroll-drawn: this section sits
 * within the first viewport on a tall screen, where a drawn rule would start
 * life part-way across and finish only once the reader moved.
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

export function TrustedBy() {
  const { scope, tracks } = useIdleTurns(trustedBy.logos.length)

  return (
    <section
      aria-label="Trusted by"
      className="relative py-[clamp(48px,7vw,72px)]"
    >
      <Container>
        <div className="grid gap-x-[clamp(32px,5vw,80px)] gap-y-9 lg:grid-cols-[minmax(220px,300px)_1fr]">
          {/* Beside the wall from lg up; above it and centred below, where
              a left-set label over a full-width grid reads as off-axis. */}
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

          <div ref={scope}>
            <Stagger
              as="ul"
              from="fade"
              // Slightly tighter than the page's beat because twelve cells at
              // the full step drags, but nowhere near the 55ms it used to be:
              // these only fade, so the order has to come from the timing alone.
              step={0.11}
              className="m-0 grid list-none grid-cols-2 gap-px border border-rule bg-rule sm:grid-cols-4"
            >
              {trustedBy.logos.map((logo, i) => {
                const mark = (
                  <Image
                    src={files[logo.id]}
                    alt={logo.name}
                    data-tone={"tone" in logo ? logo.tone : undefined}
                    // Two columns on a phone, four from sm up; a cell is
                    // at most ~185px wide at the largest layout. Telling
                    // next/image the real width is what keeps a phone from
                    // fetching a 640px rendition for a 160px cell.
                    sizes="(min-width: 640px) 240px, 45vw"
                    className="logo-mark w-auto max-w-full"
                    style={{ height: logo.height }}
                  />
                )
                return (
                  <li key={logo.id} data-stagger className="relative bg-paper">
                    {/* All four corners here, unlike the certification cards:
                        nothing occupies the top rule of a logo cell. */}
                    <Corners />
                    <motion.a
                      href={logo.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${logo.name} (opens in a new tab)`}
                      whileTap={{ scale: 0.97 }}
                      transition={{
                        type: "spring",
                        duration: 0.35,
                        bounce: 0.2,
                      }}
                      className="logo-link logo-flip flex h-[104px] items-center justify-center px-5 outline-none focus-visible:ring-2 focus-visible:ring-oxblood focus-visible:ring-inset"
                    >
                      <FlipTrack
                        depth={logo.height / 2}
                        trackRef={(el) => {
                          tracks.current[i] = el
                        }}
                      >
                        {mark}
                      </FlipTrack>
                    </motion.a>
                  </li>
                )
              })}
            </Stagger>
          </div>
        </div>
      </Container>
      <FlowRule drawn={false} />
    </section>
  )
}
