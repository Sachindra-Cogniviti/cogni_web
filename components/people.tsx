import Image, { type StaticImageData } from "next/image"

import { Container, Corners, Kicker } from "@/components/primitives"
import { Stagger } from "@/components/stagger"
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

/**
 * Portraits, keyed by the `photo` id used in content.
 *
 * All thirteen are square, which is what lets the grid use a plain 1:1 frame
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
  zafar,
}

type Member = (typeof people.groups)[number]["members"][number]

/**
 * Founders and team. Closes the #company block, and hands off to Careers.
 *
 * Not a hairline cell grid, which is the section's default language and wrong
 * here: seven team members in a four-column bordered grid leave a visibly
 * broken last row, and unlike the logo tiles these cells are different heights
 * anyway. Cards separated by gaps, each with its own top rule under the
 * portrait, tolerate any item count at any width.
 *
 * Founders run three across and the team four, so the founders' cards are
 * larger. That is the whole hierarchy - same card, same fields, same order,
 * one wider column - rather than a different treatment for each group.
 *
 * The portraits are treated until hovered: desaturated, contrast lifted, and
 * warmed slightly so they sit on the paper ground rather than floating as
 * neutral grey. Thirteen photographs with thirteen unrelated backgrounds -
 * brick, foliage, office glass, studio white - read as a jumble at this size
 * and pull the eye away from the names; one tonal range makes them a group.
 * Colour on hover keeps the real photograph available rather than replacing
 * it.
 *
 * Written as an explicit four-function filter in both states rather than
 * Tailwind's `grayscale` / `grayscale-0` pair. CSS only interpolates between
 * filter lists that hold the same functions in the same order, so listing all
 * four at their identity values on hover is what makes this a transition
 * instead of a snap.
 *
 * A true ink-to-paper duotone via an SVG feComponentTransfer was the other
 * candidate and is very close to this by eye - both endpoints of the brand
 * ramp are near-neutral, so the duotone mostly just adds contrast, which this
 * does in one line and can animate. An oxblood ramp was tried and rejected
 * outright: it is the obvious on-brand choice and it makes every face look
 * unwell, with the features failing to read at card size.
 */
export function People() {
  return (
    <section className="pt-[clamp(88px,10vw,140px)] pb-[clamp(88px,10vw,140px)]">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <Kicker data-reveal="0" data-flow="left">
              {people.kicker}
            </Kicker>
            <h2
              data-reveal="60"
              data-flow="left"
              className="mt-5 max-w-[16ch] text-[clamp(32px,3.8vw,54px)] leading-[1.05] font-semibold tracking-[-0.03em] text-balance"
            >
              {people.heading}
            </h2>
          </div>
          <p
            data-reveal="120"
            data-flow="right"
            className="max-w-[46ch] text-[15.5px] leading-[1.6] text-pretty text-ink-soft"
          >
            {people.body}
          </p>
        </div>

        {people.groups.map((group, index) => (
          <div
            key={group.label}
            className={index === 0 ? "mt-16" : "mt-[clamp(56px,6vw,88px)]"}
          >
            <div
              data-reveal={160 + index * 40}
              data-flow="left"
              className="border-t border-rule-strong pt-5 font-mono text-[11px] tracking-[0.2em] text-ink-faint uppercase"
            >
              {group.label}
            </div>

            <Stagger
              as="ul"
              from="fade"
              step={0.08}
              className={`people-grid m-0 mt-10 grid list-none grid-cols-2 gap-x-[clamp(20px,3vw,40px)] gap-y-[clamp(36px,4vw,56px)] ${
                // Whole class names - Tailwind scans source text, so an
                // interpolated column count is never generated.
                index === 0 ? "sm:grid-cols-3" : "sm:grid-cols-3 lg:grid-cols-4"
              }`}
            >
              {group.members.map((member) => (
                <PersonCard key={member.name} member={member} />
              ))}
            </Stagger>
          </div>
        ))}
      </Container>
    </section>
  )
}

function PersonCard({ member }: { member: Member }) {
  const portrait = portraits[member.photo]
  const tenure = "tenure" in member ? member.tenure : undefined

  const sizes = "(min-width: 1024px) 300px, (min-width: 640px) 33vw, 50vw"

  // One gesture, one curve. The wipe, the rule and the brackets all run on
  // these numbers so they read as a single thing travelling across the card
  // rather than three effects that happen to fire together.
  const SWEEP =
    "duration-[420ms] ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:transition-none"

  return (
    <li data-stagger className="group flex flex-col">
      <div className="people-card flex flex-1 flex-col">
        <div className="relative aspect-square w-full overflow-hidden bg-paper-tint">
          {/* Rest layer: the treated photograph, always present. */}
          <Image
            src={portrait}
            alt={member.name}
            fill
            sizes={sizes}
            className={`object-cover [filter:grayscale(1)_contrast(1.14)_brightness(1.03)_sepia(0.14)] transition-transform ${SWEEP} group-hover:scale-[1.02] motion-reduce:group-hover:scale-100`}
          />

          {/* Colour layer, wiped in from the left. Same file as the layer
              beneath - Next emits the same srcset, so the browser fetches it
              once - and no alt text, because this is the same person the rest
              layer has already named and a screen reader should not hear them
              twice.

              The clip-path is on this wrapper while the scale is on the image
              inside it, so the wipe edge stays put while the picture grows
              behind it. Putting both on one element makes the boundary drift
              as it scales. */}
          <div
            aria-hidden="true"
            className={`absolute inset-0 transition-[clip-path] [clip-path:inset(0_100%_0_0)] ${SWEEP} group-hover:[clip-path:inset(0_0_0_0)]`}
          >
            <Image
              src={portrait}
              alt=""
              fill
              sizes={sizes}
              className={`object-cover transition-transform ${SWEEP} group-hover:scale-[1.02] motion-reduce:group-hover:scale-100`}
            />
          </div>

          {/* Brackets, inset so they sit on the photograph rather than on its
              edge. Oxblood rather than the default ink-ghost: these land on
              thirteen different photographs, and a pale bracket that reads
              over a studio backdrop disappears over a dark suit. The inset
              comes from this wrapper, not a class on Corners, so it does not
              depend on how the class merger resolves two `inset-*` rules. */}
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute inset-[10px] opacity-0 transition-opacity ${SWEEP} group-hover:opacity-100`}
          >
            <Corners tone="oxblood" size={12} />
          </span>
        </div>

        {/* The rule runs out beneath the wipe on the same curve, so the colour
            arriving and the line drawing are one movement. A transform, so it
            costs nothing to animate. */}
        <div className="relative mt-4 h-px w-full bg-rule">
          <span
            aria-hidden="true"
            className={`absolute inset-0 origin-left scale-x-0 bg-oxblood transition-transform ${SWEEP} group-hover:scale-x-100`}
          />
        </div>

        <div className="mt-4 flex flex-1 flex-col">
          <div className="text-[15.5px] leading-[1.25] font-semibold tracking-[-0.01em]">
            {member.name}
          </div>

          {/* Role and tenure are separate fields; the middle dot is drawn here
            so it is punctuation rather than part of the copy. */}
          <div className="mt-[6px] font-mono text-[10.5px] leading-[1.4] tracking-[0.14em] text-ink-faint uppercase">
            {member.role}
            {tenure ? (
              <>
                <span className="px-[6px] text-ink-ghost">·</span>
                {tenure}
              </>
            ) : null}
          </div>

          <div className="mt-[10px] text-[12.5px] leading-[1.45] text-oxblood">
            Ex-{member.previously.join(" · ")}
          </div>

          <p className="mt-[10px] text-[13px] leading-[1.55] text-pretty text-ink-muted">
            {member.body}
          </p>

          <a
            href={member.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${member.name} on LinkedIn`}
            className="mt-auto inline-flex w-fit items-center gap-[7px] pt-4 text-[12.5px] font-medium text-ink-soft transition-colors hover:text-oxblood"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false"
              className="size-[13px] shrink-0 fill-current"
            >
              <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
            </svg>
            {people.connectLabel}
          </a>
        </div>
      </div>
    </li>
  )
}
