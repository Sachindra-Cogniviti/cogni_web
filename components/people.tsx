import Image, { type StaticImageData } from "next/image"

import { Container, Kicker } from "@/components/primitives"
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
 * The portraits are greyscale until hovered. Thirteen photographs with
 * thirteen unrelated backgrounds - brick, foliage, office glass, studio white
 * - read as a jumble at this size and pull the eye away from the names; one
 * tonal range makes them a group. Colour on hover keeps the real photograph
 * available rather than replacing it.
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
              className={`m-0 mt-10 grid list-none grid-cols-2 gap-x-[clamp(20px,3vw,40px)] gap-y-[clamp(36px,4vw,56px)] ${
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

  return (
    <li data-stagger className="group flex flex-col">
      <div className="relative aspect-square w-full overflow-hidden bg-paper-tint">
        <Image
          src={portrait}
          alt={member.name}
          fill
          sizes="(min-width: 1024px) 300px, (min-width: 640px) 33vw, 50vw"
          className="object-cover grayscale transition-[filter,transform] duration-[450ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.02] group-hover:grayscale-0 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      </div>

      {/* The rule carries the hover, the way the oxblood tick does elsewhere:
          a short mark that runs the width of the card. A transform, so it
          costs nothing to animate. */}
      <div className="relative mt-4 h-px w-full bg-rule">
        <span
          aria-hidden="true"
          className="absolute inset-0 origin-left scale-x-0 bg-oxblood transition-transform duration-[350ms] ease-[cubic-bezier(.23,1,.32,1)] group-hover:scale-x-100 motion-reduce:transition-none"
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
    </li>
  )
}
