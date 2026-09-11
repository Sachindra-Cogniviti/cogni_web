"use client"

import Image, { type StaticImageData } from "next/image"
import { motion, type Variants } from "motion/react"

import { Container, Corners } from "@/components/primitives"
import { ScrambleText } from "@/components/scramble-text"
import { FlowRule, Parallax } from "@/components/scroll-motion"
import { Stagger } from "@/components/stagger"
import { trustedBy } from "@/content/site"

import bangchak from "@/public/logos/bangchak.png"
import carsome from "@/public/logos/carsome.png"
import dynapack from "@/public/logos/dynapack.png"
import indosat from "@/public/logos/indosat.png"
import mirvac from "@/public/logos/mirvac.png"
import nets from "@/public/logos/nets.png"
import pil from "@/public/logos/pil.png"
import wearnes from "@/public/logos/wearnes.png"

/**
 * Client logo wall.
 *
 * Eight logos in a hairline grid beside the section copy, in their own
 * colours, each linking out to the company. A white logo is flagged in
 * content and rendered dark (`.logo-mark` in globals.css) so it does not
 * vanish into the paper.
 *
 * Files are imported statically so the build gets correct paths. Each logo
 * has its own rendered height, set in content, because a 1:1 stacked mark
 * and a 6:1 wordmark at the same height never look the same size.
 *
 * Motion: the cells resolve one after another as the wall rises through the
 * viewport, and on a fine pointer the mark lifts two pixels on a short
 * spring under the hover tint. The cell itself stays put so the hairline
 * grid never opens. The copy runs a little ahead of the wall as the section
 * crosses the viewport, and the rule under the section is drawn by the
 * scroll.
 */
const files: Record<(typeof trustedBy.logos)[number]["id"], StaticImageData> = {
  bangchak,
  carsome,
  dynapack,
  indosat,
  mirvac,
  nets,
  pil,
  wearnes,
}

const mark: Variants = {
  rest: { y: 0, scale: 1 },
  hover: { y: -2, scale: 1.04 },
}

export function TrustedBy() {
  return (
    <section aria-label="Trusted by" className="relative py-[72px]">
      <Container>
        <div className="grid gap-x-[clamp(32px,5vw,80px)] gap-y-9 lg:grid-cols-[minmax(220px,300px)_1fr]">
          <Parallax y={18}>
            <div>
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
                className="mt-[10px] max-w-[34ch] text-[14.5px] leading-[1.55] text-ink-soft"
              >
                {trustedBy.body}
              </p>
            </div>
          </Parallax>

          <Parallax y={-8}>
            <Stagger
              as="ul"
              from="fade"
              // Slightly tighter than the page's beat because eight cells at the
              // full step drags, but nowhere near the 55ms it used to be: these
              // only fade, so the order has to come from the timing alone.
              step={0.11}
              className="m-0 grid list-none grid-cols-2 gap-px border border-rule bg-rule sm:grid-cols-4"
            >
              {trustedBy.logos.map((logo) => (
                <li key={logo.id} data-stagger className="relative bg-paper">
                  {/* All four corners here, unlike the certification cards:
                      nothing occupies the top rule of a logo cell. */}
                  <Corners />
                  <motion.a
                    href={logo.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${logo.name} (opens in a new tab)`}
                    initial="rest"
                    whileHover="hover"
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", duration: 0.35, bounce: 0.2 }}
                    className="logo-link flex h-[104px] items-center justify-center px-5 outline-none focus-visible:ring-2 focus-visible:ring-oxblood focus-visible:ring-inset"
                  >
                    <motion.span
                      variants={mark}
                      className="flex items-center justify-center"
                    >
                      <Image
                        src={files[logo.id]}
                        alt={logo.name}
                        data-tone={"tone" in logo ? logo.tone : undefined}
                        // A cell is at most ~185px wide at the largest layout.
                        sizes="240px"
                        className="logo-mark w-auto max-w-full"
                        style={{ height: logo.height }}
                      />
                    </motion.span>
                  </motion.a>
                </li>
              ))}
            </Stagger>
          </Parallax>
        </div>
      </Container>
      <FlowRule />
    </section>
  )
}
