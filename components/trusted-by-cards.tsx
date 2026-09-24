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
 * Client deck, fanned, with the middle card upright.
 *
 * A hand of cards spread across the page: the card at the centre stands
 * square on, forward and at full strength, and the ones either side lean away
 * from it, sit lower and fall back. The deck turns, so each client comes up
 * through the fan, has its moment square on, and leans away again on the
 * other side.
 *
 * The same loop as the stage treatment in components/trusted-by-arc.tsx
 * (lib/logo-ride.ts) with its fan tuning switched on. Four things make it a
 * fan rather than a row:
 *
 *   - **The slots overlap.** A card is close to twice the width of the slot
 *     it sits in, so each one covers part of the one behind. That is what
 *     makes it a deck; at a pitch wider than the card it is a row of cards
 *     with gaps between them, which is what this was before.
 *   - **They turn about their own bottom edge.** The transform origin is the
 *     foot of the card, so a tilt swings the top out and leaves the bottoms
 *     gathered - a hand of cards held at one end. Turning about the centre
 *     slides the whole card sideways as it tilts and the gather is lost.
 *   - **The fall is parabolic.** The outer cards sit lower, but slowly near
 *     the middle and steeply at the edges, so the tops read as an arc rather
 *     than as a V.
 *   - **Dimming is done to the contents, not to the card.** A fan overlaps,
 *     so a card at reduced opacity would show the card behind it through its
 *     own face. The card stays opaque and a paper scrim over it takes the
 *     contents back toward the ground instead - driven by the `--ride-b`
 *     custom property, which is how far up the curve the loop has that card.
 *
 * Only one card is ever square on: the window that marks it is narrower than
 * the spacing between two slots, so two can never be inside it at once.
 *
 * The card is still the hairline cell the rest of the page is built from - a
 * rule border and ghost brackets, going to rule-strong and oxblood brackets
 * when it is the one being read. The lit card is also the one place outside
 * the section rail that carries a shadow. It earns it: for that moment it
 * genuinely is the floating element, which is the test this system sets
 * before spending one.
 *
 * Laid out so that it is a correct, evenly spaced, static deck before any
 * script runs: each slot's resting position is written as a transform off
 * `--card-pitch`, the variable the stylesheet sizes the slots with.
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

/**
 * Times the client list is dealt into the deck.
 *
 * The loop wraps a slot back to the far right once it has left on the left,
 * so the deck only stays full while the whole line is longer than the window
 * plus one slot. Twelve cards at this pitch is about 1580px of line, and the
 * window is the full width of the page - so from roughly 1600px up the deck
 * would run out and a hole would travel through the fan. Dealing the list
 * twice doubles the line and puts that limit past 3000px.
 *
 * It is the overlap that forces this. The stage treatment gets away with one
 * pass because its slots are half as wide again, and it is the same trade:
 * the tighter the deck, the more cards it takes to fill a screen.
 */
const DEALS = 2

/**
 * The fanned reading of the ride. Every number that differs from the stage
 * treatment's default is here, and the reasons are in the note above.
 *
 * `dim` is 1 - the loop leaves the slot's own opacity alone, because a card
 * in a fan cannot be dimmed by being made transparent. `lit` is high rather
 * than low because at this `reach` and `hold` the curve is still at 0.75 a
 * half-slot out from the middle; anything below that and two cards would be
 * square on at once.
 */
const CARD_RIDE = {
  reach: 1,
  hold: 0.25,
  grip: 0,
  swell: 0.1,
  dim: 1,
  lift: 10,
  lit: 0.78,
  spread: 2.6,
  tilt: 15,
  drop: 34,
} as const

/**
 * The deck, dealt. Only the first pass is in the accessibility tree and only
 * its cards are reachable by keyboard - the rest are the same twelve clients
 * again, and a screen reader should not be read the list twice.
 */
const deck = Array.from({ length: DEALS }).flatMap((_, deal) =>
  trustedBy.logos.map((logo) => ({ logo, deal }))
)

export function TrustedByCards() {
  const { row, items } = useLogoRide(deck.length, CARD_RIDE)

  return (
    <section
      aria-label="Trusted by"
      className="relative py-[clamp(48px,7vw,72px)]"
    >
      <Container>
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

      <div data-reveal="120" className="mt-[clamp(28px,4vw,44px)]">
        <div ref={row} className="logo-cards">
          <ul className="logo-cards-track m-0 list-none p-0">
            {deck.map(({ logo, deal }, i) => (
              <li
                key={`${deal}-${logo.id}`}
                ref={(el) => {
                  items.current[i] = el
                }}
                aria-hidden={deal > 0 || undefined}
                className="logo-card"
                style={{
                  transform: `translate3d(calc(var(--card-pitch) * ${i}), 0, 0)`,
                }}
              >
                <a
                  href={logo.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  tabIndex={deal > 0 ? -1 : undefined}
                  aria-label={`${logo.name} (opens in a new tab)`}
                  className="logo-card-face flex items-center justify-center px-6 outline-none focus-visible:ring-2 focus-visible:ring-oxblood focus-visible:ring-inset"
                >
                  <Corners size={10} />
                  <Image
                    src={files[logo.id]}
                    alt={deal > 0 ? "" : logo.name}
                    data-tone={"tone" in logo ? logo.tone : undefined}
                    // A card is at most 252px wide and grows a tenth when it
                    // comes square on, so 300 covers it.
                    sizes="300px"
                    className="logo-mark w-auto max-w-full"
                    style={{ height: logo.height }}
                  />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <FlowRule drawn={false} />
    </section>
  )
}
