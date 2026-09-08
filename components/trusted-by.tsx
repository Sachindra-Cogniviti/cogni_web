"use client"

import Image, { type StaticImageData } from "next/image"
import { motion, type Variants } from "motion/react"

import { Container } from "@/components/primitives"
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
 * Motion: the cells rise in 45ms apart once the wall scrolls into view, and
 * on a fine pointer the mark lifts two pixels on a short spring under the
 * hover tint. The cell itself stays put so the hairline grid never opens.
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

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const wall: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.045 } },
}

const cell: Variants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
}

const mark: Variants = {
  rest: { y: 0, scale: 1 },
  hover: { y: -2, scale: 1.04 },
}

export function TrustedBy() {
  return (
    <section aria-label="Trusted by" className="border-b border-rule py-[72px]">
      <Container>
        <div className="grid gap-x-[clamp(32px,5vw,80px)] gap-y-9 lg:grid-cols-[minmax(220px,300px)_1fr]">
          <div data-reveal="0">
            <div className="font-mono text-[11px] tracking-[0.2em] text-ink-faint uppercase">
              {trustedBy.kicker}
            </div>
            <p className="mt-[10px] max-w-[34ch] text-[14.5px] leading-[1.55] text-ink-soft">
              {trustedBy.body}
            </p>
          </div>

          <motion.ul
            variants={wall}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            className="m-0 grid list-none grid-cols-2 gap-px border border-rule bg-rule sm:grid-cols-4"
          >
            {trustedBy.logos.map((logo) => (
              <motion.li key={logo.id} variants={cell} className="bg-paper">
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
                  <motion.span variants={mark} className="flex items-center justify-center">
                    <Image
                      src={files[logo.id]}
                      alt={logo.name}
                      data-tone={"tone" in logo ? logo.tone : undefined}
                      className="logo-mark w-auto max-w-full"
                      style={{ height: logo.height }}
                    />
                  </motion.span>
                </motion.a>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </Container>
    </section>
  )
}
