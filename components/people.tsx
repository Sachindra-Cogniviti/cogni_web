"use client"

import * as React from "react"
import Image, { type StaticImageData } from "next/image"

import { Container, Corners, Kicker, Roll } from "@/components/primitives"
import { ScrambleText } from "@/components/scramble-text"
import { people } from "@/content/site"

import john from "@/public/founders/founder-john.jpg"
import kriti from "@/public/founders/founder-kriti.jpg"
import manav from "@/public/founders/founder-manav.jpg"
import robin from "@/public/founders/founder-robin.jpg"
import sushil from "@/public/founders/founder-sushil.jpg"
import zafar from "@/public/founders/founder-zafar.jpg"

import animesh from "@/public/team/team-animesh.jpg"
import joyce from "@/public/team/team-joyce.jpg"
import leroy from "@/public/team/team-leroy.jpg"
import niko from "@/public/team/team-niko.jpg"
import rahul from "@/public/team/team-rahul.jpg"
import sandesh from "@/public/team/team-sandesh.jpg"
import valentina from "@/public/team/team-valentina.jpg"
import vinay from "@/public/team/team-vinay.jpg"

/**
 * Portraits, keyed by the `photo` id used in content.
 *
 * All portraits are square, which is what lets the row use a plain 1:1 frame
 * with no art direction per person. They are otherwise inconsistent - studio
 * white, a brick wall, an office window, an outdoor shot - and that is the
 * reason for the greyscale treatment below rather than a stylistic preference.
 *
 * They are square because they were made square. Every founder portrait
 * arrived as a ~3:4 photograph padded out to a square with a flat band of
 * colour down each side, which object-cover cannot do anything about - the
 * band is inside the image. Each was trimmed back to the real photograph and
 * re-cropped square from the top, so faces keep their headroom. If a
 * replacement portrait is dropped in here later, crop it square first or the
 * bands come back.
 */
/**
 * Framing per portrait: a zoom about a point near the face, so
 * photographs taken at different distances show a head of about one size.
 * Sushil, Manav and Leroy were shot from across a room and arrive as a
 * small head over a lot of jacket. The origin is where the eyes sit, so zooming holds them
 * still and crops away shoulder and ceiling instead. Anyone not listed is
 * shown as cropped.
 */
const framing: Record<string, { zoom: number; eyes: string }> = {
  // Crop John's padded sides and excess headroom out of both image layers.
  john: { zoom: 1.32, eyes: "40%" },
  // Sushil's hair already touches the top of his file, so the zoom is
  // about the top edge: it grows the head downward into the jacket rather
  // than pushing the crown out of the frame, which an origin at the eyes did.
  sushil: { zoom: 1.28, eyes: "0%" },
  manav: { zoom: 1.34, eyes: "22%" },
  leroy: { zoom: 1.32, eyes: "24%" },
  animesh: { zoom: 1.26, eyes: "22%" },
  joyce: { zoom: 1.24, eyes: "24%" },
  kriti: { zoom: 1.14, eyes: "24%" },
  rahul: { zoom: 1.14, eyes: "24%" },
  niko: { zoom: 1.1, eyes: "28%" },
  sandesh: { zoom: 1.08, eyes: "24%" },
  valentina: { zoom: 1.1, eyes: "26%" },
}

const portraits: Record<string, StaticImageData> = {
  animesh,
  john,
  joyce,
  kriti,
  leroy,
  manav,
  niko,
  rahul,
  robin,
  sandesh,
  sushil,
  valentina,
  vinay,
  zafar,
}

type Member = (typeof people.groups)[number]["members"][number]

/** Founders and team, each in a separate row with its own heading. */
export function People() {
  return (
    <section className="pt-[clamp(88px,10vw,140px)] pb-[clamp(24px,3vw,40px)]">
      <Container className="max-w-none">
        <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-6">
          <div>
            <Kicker data-reveal="0" data-flow="left">
              {people.kicker}
            </Kicker>
            <h2
              data-reveal="60"
              data-flow="left"
              className="mt-4 max-w-[16ch] text-[clamp(30px,3.4vw,48px)] leading-[1.05] font-semibold tracking-[-0.03em] text-balance"
            >
              {people.heading}
            </h2>
          </div>
          <p
            data-reveal="120"
            data-flow="right"
            className="max-w-[46ch] text-[15px] leading-[1.6] text-pretty text-ink-soft max-sm:text-[14px]"
          >
            {people.body}
          </p>
        </div>
      </Container>

      <div className="mt-[clamp(36px,5vw,64px)] space-y-[clamp(40px,6vw,72px)]">
        {people.groups.map((group, index) => (
          <section key={group.label} aria-labelledby={`people-group-${index}`}>
            <Container className="max-w-none">
              <h3
                id={`people-group-${index}`}
                className="mb-6 border-t border-rule-strong pt-5 font-mono text-[12px] tracking-[0.2em] text-ink-soft uppercase"
              >
                <ScrambleText text={group.label} />
              </h3>
              <div
                className="people-scroller snap-x snap-mandatory overflow-x-auto pb-2"
                role="region"
                aria-labelledby={`people-group-${index}`}
                tabIndex={0}
              >
                <ul className="people-row m-0 grid list-none auto-cols-[minmax(200px,62vw)] grid-flow-col items-stretch gap-5 p-0 sm:auto-cols-[220px] lg:auto-cols-[calc((100%-120px)/6)] lg:gap-6">
                  {group.members.map((member) => (
                    <PersonCard key={member.name} member={member} />
                  ))}
                </ul>
              </div>
            </Container>
          </section>
        ))}
      </div>
    </section>
  )
}

function PersonCard({ member }: { member: Member }) {
  const portrait = portraits[member.photo]
  const certified =
    "certifications" in member && member.certifications.length > 0
      ? `${member.certifications.join(" · ")} certified`
      : null
  const frame = framing[member.photo]
  // The zoom sits on a wrapper around each layer, on the `scale` property,
  // so the hover's own scale on the image inside composes with it rather
  // than replacing it.
  const framed: React.CSSProperties | undefined = frame
    ? { scale: String(frame.zoom), transformOrigin: `50% ${frame.eyes}` }
    : undefined

  const sizes = "(min-width: 1024px) 17vw, (min-width: 640px) 220px, 62vw"

  // One gesture, one curve. The wipe, the rule and the brackets all run on
  // these numbers so they read as a single thing travelling across the card
  // rather than three effects that happen to fire together. Each answers
  // hover and, through data-tap, a tap.
  const SWEEP =
    "duration-[420ms] ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:transition-none"

  return (
    <li data-tap className="group flex min-w-0 snap-start flex-col">
      <div className="people-card flex flex-1 flex-col">
        <div className="relative aspect-square w-full overflow-hidden bg-paper-tint">
          {/* Rest layer: the treated photograph. It stays put and grows
              a little while the colour layer is wiped over the top of it. */}
          <div aria-hidden="true" className="absolute inset-0" style={framed}>
            <Image
              src={portrait}
              alt={member.name}
              width={portrait.width}
              height={portrait.height}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
              }}
              sizes={sizes}
              className={`object-cover [filter:grayscale(1)_contrast(1.14)_brightness(1.03)_sepia(0.14)] transition-transform ${SWEEP} group-hover:scale-[1.02] group-data-active:scale-[1.02] motion-reduce:group-hover:scale-100`}
            />
          </div>

          {/* The colour layer, wiped in from the left. One photograph, so
              the change is a grade rather than a cut. The clip-path sits on
              this wrapper and the scale on the image inside it, so the wipe
              edge stays put while the picture grows behind it. Same file as
              the layer beneath - Next emits the same srcset, so the browser
              fetches it once - and no alt text, because the rest layer has
              already named this person. */}
          <div
            aria-hidden="true"
            className={`absolute inset-0 transition-[clip-path] [clip-path:inset(0_100%_0_0)] ${SWEEP} group-hover:[clip-path:inset(0_0_0_0)] group-data-active:[clip-path:inset(0_0_0_0)]`}
          >
            <div className="absolute inset-0" style={framed}>
              <Image
                src={portrait}
                alt=""
                width={portrait.width}
                height={portrait.height}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                }}
                sizes={sizes}
                className={`object-cover transition-transform ${SWEEP} group-hover:scale-[1.02] group-data-active:scale-[1.02] motion-reduce:group-hover:scale-100`}
              />
            </div>
          </div>

          {/* Brackets, inset so they sit on the photograph rather than on
              its edge. Oxblood rather than the default ink-ghost: these
              land on different photographs, and a pale bracket
              that reads over a studio backdrop disappears over a dark
              suit. */}
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute inset-[10px] opacity-0 transition-opacity ${SWEEP} group-hover:opacity-100 group-data-active:opacity-100`}
          >
            <Corners tone="oxblood" size={12} />
          </span>
        </div>

        {/* The rule runs out beneath the wipe on the same curve, so the
            colour arriving and the line drawing are one movement. */}
        <div className="relative mt-3 h-px w-full bg-rule">
          <span
            aria-hidden="true"
            className={`absolute inset-0 origin-left scale-x-0 bg-oxblood transition-transform ${SWEEP} group-hover:scale-x-100 group-data-active:scale-x-100`}
          />
        </div>

        <div className="mt-3 flex flex-1 flex-col">
          <div className="text-[15px] leading-[1.25] font-semibold tracking-[-0.01em]">
            {member.name}
          </div>

          {/* Reserve two lines for roles so biographies align across the row. */}
          <div
            title={member.role}
            className="mt-1 min-h-[2lh] font-mono text-[10px] leading-[1.35] tracking-[0.1em] text-ink-faint uppercase"
          >
            {member.role}
          </div>

          {certified && (
            <div
              title={certified}
              className="mt-1 min-h-[1lh] truncate text-[12.5px] leading-[1.4] text-oxblood"
            >
              {certified}
            </div>
          )}

          {/* Three lines reserved whether or not the biography fills them
              (two where the phone budget clamps it to two), so the Connect
              link lands on the same level on every card. */}
          <p className="mt-1 line-clamp-3 min-h-[3lh] text-[13px] leading-[1.4] text-pretty text-ink-muted max-sm:line-clamp-2 max-sm:min-h-[2lh]">
            {member.body}
          </p>

          <a
            href={member.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${member.name} on LinkedIn`}
            className="mt-auto inline-flex min-h-[44px] w-fit items-center gap-[7px] pt-1 text-[12.5px] font-medium text-ink-soft transition-colors duration-[var(--roll-duration)] ease-[var(--roll-ease)] hover:text-oxblood"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false"
              className="size-[13px] shrink-0 fill-current"
            >
              <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
            </svg>
            <Roll>{people.connectLabel}</Roll>
          </a>
        </div>
      </div>
    </li>
  )
}
