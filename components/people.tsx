"use client"

import * as React from "react"
import Image, { type StaticImageData } from "next/image"
import { motion, useScroll, useTransform } from "motion/react"

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

/**
 * Portraits, keyed by the `photo` id used in content.
 *
 * All thirteen are square, which is what lets the row use a plain 1:1 frame
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
 * Framing per portrait: a zoom about a point near the face, so thirteen
 * photographs taken at thirteen distances show a head of about one size.
 * Sushil, Manav and Leroy were shot from across a room and arrive as a
 * small head over a lot of jacket; John and Zafar were shot close and
 * need nothing. The origin is where the eyes sit, so zooming holds them
 * still and crops away shoulder and ceiling instead. Anyone not listed is
 * shown as cropped.
 */
const framing: Record<string, { zoom: number; eyes: string }> = {
  sushil: { zoom: 1.32, eyes: "26%" },
  manav: { zoom: 1.34, eyes: "22%" },
  leroy: { zoom: 1.32, eyes: "24%" },
  animesh: { zoom: 1.26, eyes: "22%" },
  joyce: { zoom: 1.24, eyes: "24%" },
  kriti: { zoom: 1.14, eyes: "24%" },
  rahul: { zoom: 1.14, eyes: "24%" },
  niko: { zoom: 1.1, eyes: "28%" },
  sandesh: { zoom: 1.08, eyes: "24%" },
  valentina: { zoom: 1.1, eyes: "26%" },
  robin: { zoom: 1.06, eyes: "28%" },
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
  zafar,
}

type Member = (typeof people.groups)[number]["members"][number]

/**
 * Founders and team. Closes the #company block, and hands off to Careers.
 *
 * One line of people, founders first and then the team, each group opened
 * by its label set on its side. The section pins while the reader scrolls
 * and the line travels sideways under them, one pixel of scroll for one
 * pixel of travel, so meeting everyone is the same gesture as reading the
 * rest of the page; a progress rule at the foot of the screen says how far
 * along the line they are. On a phone that is the same gesture again - a
 * vertical swipe carries the line - which is why it pins there too rather
 * than becoming a row to be scrolled sideways: a second axis on a page
 * that otherwise only goes down is the thing that gets missed. Under
 * reduced motion only, the row scrolls sideways by touch and snaps card to
 * card.
 *
 * The pin is the outer section's height: the viewport plus the distance
 * the row has to travel, with the row's frame stuck to the top of the
 * viewport for the whole of it. The frame fills from the top - heading,
 * then the line, then the rule - and the card width is derived from the
 * viewport height on the pin, so the whole thing fits under the bar on a
 * short laptop screen as well as a tall one. Heights are in svh, the
 * small viewport: on a phone 100vh is the screen with the browser's bars
 * hidden, and a frame that tall has its rule under the address bar.
 *
 * The portraits are treated until hovered - or, on a touch screen, tapped
 * (components/tap-reveal.tsx): desaturated, contrast lifted, and warmed
 * slightly so they sit on the paper ground rather than floating as neutral
 * grey. Thirteen photographs with thirteen unrelated backgrounds read as a
 * jumble at this size and pull the eye away from the names; one tonal
 * range makes them a group. Colour on hover keeps the real photograph
 * available rather than replacing it.
 *
 * Written as an explicit four-function filter in both states rather than
 * Tailwind's `grayscale` / `grayscale-0` pair. CSS only interpolates
 * between filter lists that hold the same functions in the same order, so
 * listing all four at their identity values on hover is what makes this a
 * transition instead of a snap.
 */
export function People() {
  const outer = React.useRef<HTMLElement>(null)
  const frame = React.useRef<HTMLDivElement>(null)
  const row = React.useRef<HTMLUListElement>(null)

  const [pinned, setPinned] = React.useState(false)
  const [travel, setTravel] = React.useState(0)

  // Pin wherever motion is welcome.
  React.useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => setPinned(!reduced.matches)
    sync()
    reduced.addEventListener("change", sync)
    return () => reduced.removeEventListener("change", sync)
  }, [])

  // How far the row has to move for its last card to reach the frame's
  // right edge. Measured, because the row's width is the sum of thirteen
  // cards at a width that follows the viewport.
  React.useEffect(() => {
    if (!pinned) return
    const measure = () => {
      const list = row.current
      const box = frame.current
      if (!list || !box) return
      setTravel(Math.max(0, list.scrollWidth - box.clientWidth))
    }
    measure()
    const observer = new ResizeObserver(measure)
    if (row.current) observer.observe(row.current)
    if (frame.current) observer.observe(frame.current)
    return () => observer.disconnect()
  }, [pinned])

  const { scrollYProgress } = useScroll({
    target: outer,
    offset: ["start start", "end end"],
  })
  const x = useTransform(scrollYProgress, [0, 1], [0, -travel])
  const progress = useTransform(scrollYProgress, [0, 1], [0.04, 1])

  return (
    <section
      ref={outer}
      className={
        pinned
          ? "relative"
          : "pt-[clamp(88px,10vw,140px)] pb-[clamp(88px,10vw,140px)]"
      }
      style={pinned ? { height: `calc(100svh + ${travel}px)` } : undefined}
    >
      <div
        className={
          pinned
            ? // The card width: what is left of the viewport once the bar,
              // the heading, the caption under a portrait and the rule have
              // taken theirs, between 150px and the full 280px - or 360px on
              // a tablet held upright, which is tall enough to show two
              // larger cards where 280px left a third of the screen bare. The phone
              // figure is larger because the heading and the body wrap to
              // more lines there, and the frame's own padding is tighter to
              // give some of that back.
              "sticky top-0 flex h-svh flex-col overflow-hidden pt-[calc(68px+clamp(24px,4vh,48px))] pb-[clamp(16px,2vh,28px)] [--card:clamp(150px,calc(100svh-560px),280px)] max-sm:pt-[84px] max-sm:pb-3 max-sm:[--card:clamp(140px,calc(100svh-560px),280px)] md:max-lg:[--card:clamp(150px,calc(100svh-560px),360px)]"
            : ""
        }
      >
        <Container>
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

        {/* The line. Its frame is the page measure; the row inside it starts
            at the measure's left gutter and runs off the right edge. Off the
            pin the frame is the scroller, snapping card to card. */}
        <div
          ref={frame}
          data-reveal="180"
          className={`people-scroller mt-[clamp(28px,4vh,48px)] max-sm:mt-6 ${
            pinned
              ? "overflow-hidden"
              : "snap-x snap-mandatory [scroll-padding-left:clamp(20px,4vw,48px)] overflow-x-auto"
          }`}
        >
          <motion.ul
            ref={row}
            style={pinned ? { x } : undefined}
            className="people-row m-0 flex w-max list-none items-start gap-x-[clamp(16px,2vw,28px)] pr-[clamp(20px,4vw,48px)] pl-[max(clamp(20px,4vw,48px),calc((100vw-1280px)/2+clamp(20px,4vw,48px)))]"
          >
            {people.groups.map((group) => (
              <React.Fragment key={group.label}>
                <GroupLabel label={group.label} />
                {group.members.map((member) => (
                  <PersonCard key={member.name} member={member} />
                ))}
              </React.Fragment>
            ))}
          </motion.ul>
        </div>

        {/* The progress rule, at the foot of the screen on the pin, with
            the hint that this is the scroll's doing. */}
        <Container
          className={pinned ? "mt-auto pt-[clamp(20px,3vh,36px)]" : "mt-8"}
        >
          <div className="flex items-center gap-5">
            <span className="relative block h-px flex-1 bg-rule-strong">
              <motion.span
                aria-hidden="true"
                style={{ scaleX: pinned ? progress : 1 }}
                className="absolute inset-0 origin-left bg-oxblood"
              />
            </span>
            {pinned && (
              <span className="font-mono text-[10.5px] tracking-[0.18em] text-ink-faint uppercase">
                {people.scrollHint}
              </span>
            )}
          </div>
        </Container>
      </div>
    </section>
  )
}

/** A group's name, set on its side at the head of its run of cards. */
function GroupLabel({ label }: { label: string }) {
  return (
    <li
      aria-hidden="true"
      className="flex w-[26px] shrink-0 snap-start items-start justify-center self-stretch border-l border-rule-strong pt-1"
    >
      <span className="font-mono text-[10.5px] tracking-[0.2em] whitespace-nowrap text-ink-faint uppercase [writing-mode:vertical-rl]">
        <ScrambleText text={label} />
      </span>
    </li>
  )
}

function PersonCard({ member }: { member: Member }) {
  const portrait = portraits[member.photo]
  const tenure = "tenure" in member ? member.tenure : undefined
  const frame = framing[member.photo]
  // The zoom sits on a wrapper around each layer, on the `scale` property,
  // so the hover's own scale on the image inside composes with it rather
  // than replacing it.
  const framed: React.CSSProperties | undefined = frame
    ? { scale: String(frame.zoom), transformOrigin: `50% ${frame.eyes}` }
    : undefined

  const sizes = "(min-width: 1024px) 280px, 62vw"

  // One gesture, one curve. The wipe, the rule and the brackets all run on
  // these numbers so they read as a single thing travelling across the card
  // rather than three effects that happen to fire together. Each answers
  // hover and, through data-tap, a tap.
  const SWEEP =
    "duration-[420ms] ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:transition-none"

  return (
    <li
      data-tap
      className="group flex w-[var(--card,clamp(200px,62vw,250px))] shrink-0 snap-start flex-col"
    >
      <div className="people-card flex flex-1 flex-col">
        <div className="relative aspect-square w-full overflow-hidden bg-paper-tint">
          {/* Rest layer: the treated photograph. It stays put and grows
              a little while the colour layer is wiped over the top of it. */}
          <div aria-hidden="true" className="absolute inset-0" style={framed}>
            <Image
              src={portrait}
              alt={member.name}
              fill
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
                fill
                sizes={sizes}
                className={`object-cover transition-transform ${SWEEP} group-hover:scale-[1.02] group-data-active:scale-[1.02] motion-reduce:group-hover:scale-100`}
              />
            </div>
          </div>

          {/* Brackets, inset so they sit on the photograph rather than on
              its edge. Oxblood rather than the default ink-ghost: these
              land on thirteen different photographs, and a pale bracket
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
        <div className="relative mt-4 h-px w-full bg-rule">
          <span
            aria-hidden="true"
            className={`absolute inset-0 origin-left scale-x-0 bg-oxblood transition-transform ${SWEEP} group-hover:scale-x-100 group-data-active:scale-x-100`}
          />
        </div>

        <div className="mt-4 flex flex-1 flex-col">
          <div className="text-[15px] leading-[1.25] font-semibold tracking-[-0.01em]">
            {member.name}
          </div>

          {/* Role and tenure are separate fields; the middle dot is drawn
            here so it is punctuation rather than part of the copy. */}
          {/* One line, always: a title that does not fit is cut with an
              ellipsis rather than wrapped, because the caption's height is
              what the card budget above is built on. The full title is
              in the tooltip. */}
          <div
            title={tenure ? `${member.role} · ${tenure}` : member.role}
            className="mt-[6px] truncate font-mono text-[10px] leading-[1.4] tracking-[0.14em] text-ink-faint uppercase"
          >
            {member.role}
            {tenure ? (
              <>
                <span className="px-[6px] text-ink-ghost">·</span>
                {tenure}
              </>
            ) : null}
          </div>

          <div
            title={`Ex-${member.previously.join(" · ")}`}
            className="mt-[9px] truncate text-[12.5px] leading-[1.45] text-oxblood"
          >
            Ex-{member.previously.join(" · ")}
          </div>

          <p className="mt-[9px] line-clamp-3 text-[13px] leading-[1.5] text-pretty text-ink-muted max-sm:line-clamp-2">
            {member.body}
          </p>

          <a
            href={member.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${member.name} on LinkedIn`}
            className="mt-auto inline-flex min-h-[44px] w-fit items-center gap-[7px] pt-3 text-[12.5px] font-medium text-ink-soft transition-colors duration-[var(--roll-duration)] ease-[var(--roll-ease)] hover:text-oxblood"
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
