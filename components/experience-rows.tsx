"use client"

import * as React from "react"
import Image, { type StaticImageData } from "next/image"
import { AnimatePresence, motion } from "motion/react"

import { FlipTrack, Roll, WideRule } from "@/components/primitives"
import { ScrambleText } from "@/components/scramble-text"
import { Stagger } from "@/components/stagger"
import { services } from "@/content/site"

import api from "@/public/logos/platforms/api.png"
import coupa from "@/public/logos/platforms/coupa.png"
import dynamics from "@/public/logos/platforms/dynamics.svg"
import gep from "@/public/logos/platforms/gep.png"
import ivalua from "@/public/logos/platforms/ivalua.png"
import netsuite from "@/public/logos/platforms/netsuite.png"
import onestream from "@/public/logos/platforms/onestream.png"
import oracle from "@/public/logos/platforms/oracle.svg"
import sap from "@/public/logos/platforms/sap.svg"

/**
 * Platform logo files, keyed by the `logo` id used in content.
 *
 * Every mark here has a transparent background. That is a requirement, not a
 * preference: the tiles sit on `bg-paper`, so a logo carrying its own white or
 * coloured ground renders as a visible rectangle inside the cell. Vendor press
 * kits often ship the square app-icon instead - Oracle's and NetSuite's are
 * white artwork knocked out of a solid colour, which cannot simply have its
 * background removed because the colour *is* the mark. Use the wordmark.
 *
 * `api.png` is the one asset that had its background keyed out here rather
 * than arriving transparent, and that leaves it light-ground-only: the "API"
 * lettering inside the gear was white, so it is now transparent and reads as
 * letters purely because `bg-paper` shows through. Correct while the site is
 * pinned to the light theme in app/(frontend)/layout.tsx; if that ever
 * changes, this icon needs re-cutting rather than re-colouring.
 */
const logos: Record<string, StaticImageData> = {
  api,
  coupa,
  dynamics,
  gep,
  ivalua,
  netsuite,
  onestream,
  oracle,
  sap,
}

const EASE = [0.22, 1, 0.36, 1] as const

type Group = (typeof services.experience)[number]
type Item = Group["items"][number]
type Detail = Extract<Item, { detail: unknown }>["detail"]

const detailOf = (item: Item): Detail | undefined =>
  "detail" in item ? item.detail : undefined

/**
 * The experience lists: a row of logo tiles per group, and - where an item
 * carries detail copy - a panel that opens underneath it.
 *
 * The panel sits below the whole tile grid rather than being spliced into the
 * row after the tile that was clicked. Splicing is the more obvious idea and
 * the wrong one: the grid reflows from five columns to two, so which tiles
 * share a row is a function of viewport width, and the insertion point would
 * have to be recomputed from the current column count. Below the grid it is
 * correct at every width for free, and at the widths where the tiles form a
 * single row - the ones this was designed for - it is also exactly where
 * splicing would have put it.
 *
 * One panel is open at a time. Selecting another platform swaps the contents
 * rather than opening a second panel: these are alternatives to compare, and
 * two open at once would push the second below the fold to no purpose.
 */
export function ExperienceRows() {
  return (
    <div id="platforms" className="mt-16">
      {services.experience.map((group, index) => (
        <ExperienceGroup key={group.label} group={group} index={index} />
      ))}
    </div>
  )
}

function ExperienceGroup({ group, index }: { group: Group; index: number }) {
  // The open item's name, or null. Keyed by name rather than index so the
  // panel cannot silently point at a different platform if the list is
  // reordered in content.
  const [open, setOpen] = React.useState<string | null>(null)

  const hasLogos = group.items.some((item) => "logo" in item)
  const slug = group.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")
  const panelId = `${slug}-panel`

  const active = group.items.find((item) => item.name === open)
  const activeDetail = active ? detailOf(active) : undefined
  const hint = "hint" in group ? group.hint : undefined

  // Escape closes, matching every other dismissible thing on the page. Bound
  // only while something is open, so the page carries no idle key listener.
  React.useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(null)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open])

  return (
    // The rule above each row runs the full screen width, on a static wrapper
    // so it does not slide in with the row's reveal.
    <div className={index === 0 ? "relative" : "relative mt-8"}>
      <WideRule tone={index === 0 ? "strong" : "rule"} />
      <div
        data-reveal={160 + index * 40}
        data-flow="left"
        className="grid gap-x-[clamp(24px,4vw,64px)] gap-y-4 pt-6 lg:grid-cols-[minmax(180px,240px)_1fr]"
      >
        <div className="lg:pt-[2px]">
          <div className="font-mono text-[11px] tracking-[0.2em] text-ink-faint uppercase">
            <ScrambleText text={group.label} />
          </div>
          {hint ? (
            // Fades out once the reader has worked out what the tiles do, rather
            // than sitting there telling them something they have just done.
            <div
              aria-hidden="true"
              className={`mt-2 hidden font-mono text-[10.5px] tracking-[0.14em] text-ink-faint/70 uppercase transition-opacity duration-300 lg:block ${
                open ? "opacity-0" : "opacity-100"
              }`}
            >
              {hint}
            </div>
          ) : null}
        </div>

        <div>
          {hasLogos ? (
            <Stagger
              as="ul"
              from="fade"
              step={0.1}
              className={`m-0 grid list-none grid-cols-2 gap-px border border-rule bg-rule ${
                // Column count matches the item count so no tile is left
                // stranded alone on a second row. Written as whole class
                // names because Tailwind scans source text - an
                // interpolated `sm:grid-cols-${n}` is never generated.
                group.items.length === 5 ? "sm:grid-cols-5" : "sm:grid-cols-4"
              }`}
            >
              {group.items.map((item) => (
                <LogoTile
                  key={item.name}
                  item={item}
                  isOpen={item.name === open}
                  panelId={panelId}
                  tabId={`${slug}-tab-${item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                  onToggle={() =>
                    setOpen((current) =>
                      current === item.name ? null : item.name
                    )
                  }
                />
              ))}
            </Stagger>
          ) : (
            <Stagger
              from="left"
              step={0.09}
              className="flex flex-wrap gap-[10px]"
            >
              {group.items.map((item) => (
                <span
                  key={item.name}
                  data-stagger
                  className="rounded-[2px] border border-rule-strong px-[18px] py-[9px] text-[14.5px] font-medium"
                >
                  {item.name}
                </span>
              ))}
            </Stagger>
          )}

          {/* The panel animates its own height, and the grid above keeps its
            bottom border, so the panel needs only three sides to close the
            box. `overflow-hidden` is what makes height: auto safe to animate
            - without it the contents spill while the box is still short. */}
          <AnimatePresence initial={false}>
            {active && activeDetail ? (
              <motion.div
                key="panel"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.38, ease: EASE }}
                className="overflow-hidden"
              >
                <DetailPanel
                  id={panelId}
                  labelledBy={`${slug}-tab-${active.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                  name={active.name}
                  detail={activeDetail}
                  onClose={() => setOpen(null)}
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

/**
 * One tile in the logo grid.
 *
 * A tile with no detail copy is a plain `li` - not a button, no pointer, no
 * hover response and no focus stop. An affordance that leads nowhere is worse
 * than none, and a keyboard user should not have to tab through tiles that do
 * nothing to reach the ones that do.
 */
function LogoTile({
  item,
  isOpen,
  panelId,
  tabId,
  onToggle,
}: {
  item: Item
  isOpen: boolean
  panelId: string
  tabId: string
  onToggle: () => void
}) {
  const detail = detailOf(item)

  const mark =
    "logo" in item && logos[item.logo] ? (
      <Image
        src={logos[item.logo]}
        alt={item.name}
        sizes="(min-width: 640px) 240px, 45vw"
        className="w-auto max-w-full"
        style={{ height: item.height }}
      />
    ) : (
      <span className="text-[15px] font-semibold">{item.name}</span>
    )

  if (!detail) {
    return (
      <li
        data-stagger
        className="flex h-[88px] items-center justify-center bg-paper px-5"
      >
        {mark}
      </li>
    )
  }

  return (
    // The button fills the cell rather than the `li` carrying `display:
    // contents` to promote it: contents removes the box, and Stagger animates
    // these items with opacity and transform, neither of which a box-less
    // element can render.
    <li data-stagger className="bg-paper">
      <button
        type="button"
        id={tabId}
        onClick={onToggle}
        aria-expanded={isOpen}
        // Only while open: the panel does not exist otherwise, and an
        // aria-controls pointing at an absent id is an invalid reference.
        aria-controls={isOpen ? panelId : undefined}
        // Three grounds for three states, so hovering a closed tile never
        // looks like an open one. The open tile is a step darker than hover
        // rather than a different hue: these cells hold vendor logos in their
        // own brand colours, and anything with its own colour behind them
        // starts arguing with the marks.
        className={`group logo-flip relative flex h-[88px] w-full cursor-pointer items-center justify-center px-5 transition-colors duration-[250ms] ${
          isOpen ? "bg-paper-tint" : "bg-paper hover:bg-paper-soft"
        }`}
      >
        {/* Plus turning into a minus. The rotation is on the upright stroke
            alone, never on the box: rotating the box takes the horizontal
            stroke with it and the "minus" comes out standing on end. Turned a
            quarter and centred, the upright lands exactly on the crossbar and
            the two read as one line. */}
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute top-[10px] right-[10px] size-[9px] transition-opacity duration-300 ${
            isOpen ? "opacity-100" : "opacity-30 group-hover:opacity-100"
          }`}
        >
          <span
            className={`absolute top-1/2 left-0 h-px w-full -translate-y-1/2 transition-colors duration-200 ${
              isOpen ? "bg-oxblood" : "bg-ink"
            }`}
          />
          <span
            className={`absolute top-0 left-1/2 h-full w-px -translate-x-1/2 transition-[rotate,background-color] duration-300 ease-[cubic-bezier(.23,1,.32,1)] motion-reduce:transition-none ${
              isOpen ? "rotate-90 bg-oxblood" : "bg-ink"
            }`}
          />
        </span>

        {/* The mark turns over on hover the way the client logos do. A text
            chip has no set height, so it falls back to the track's default
            depth. */}
        <FlipTrack depth={"height" in item ? item.height / 2 : 12}>
          {mark}
        </FlipTrack>
      </button>
    </li>
  )
}

/**
 * The opened panel.
 *
 * The root carries the platform name as its React key, so switching platforms
 * remounts it and the contents fade in rather than mutating in place. A plain
 * key rather than an AnimatePresence swap, on purpose: an exit animation
 * unmounts the old contents before the new ones mount, and the height-animated
 * box above would collapse to nothing and rebound in between.
 */
function DetailPanel({
  id,
  labelledBy,
  name,
  detail,
  onClose,
}: {
  id: string
  labelledBy: string
  name: string
  detail: Detail
  onClose: () => void
}) {
  return (
    <motion.div
      key={name}
      id={id}
      role="region"
      aria-labelledby={labelledBy}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: EASE, delay: 0.06 }}
      className="border-r border-b border-l border-rule bg-paper px-[clamp(20px,3vw,40px)] pt-7 pb-8"
    >
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="font-mono text-[11px] tracking-[0.2em] text-oxblood uppercase">
            {name}
          </div>
          <h3 className="mt-[10px] max-w-[24ch] text-[clamp(22px,2.2vw,30px)] leading-[1.12] font-semibold tracking-[-0.025em] text-balance">
            {detail.tag}
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="-mt-1 -mr-2 shrink-0 cursor-pointer p-2 font-mono text-[11px] tracking-[0.14em] text-ink-faint uppercase transition-colors duration-[var(--roll-duration)] ease-[var(--roll-ease)] hover:text-oxblood"
        >
          <Roll>Close</Roll>
        </button>
      </div>

      {/* Two tracks: the prose reads down the left, the capability list sits
          as a scannable column on the right. They stack on narrow screens,
          prose first - the list is a summary of the prose, not a substitute,
          so it should not arrive before it. */}
      <div className="mt-7 grid gap-x-[clamp(28px,4vw,64px)] gap-y-8 lg:grid-cols-[1fr_minmax(220px,280px)]">
        <div>
          <p className="max-w-[62ch] text-[15.5px] leading-[1.65] text-pretty text-ink-soft">
            {detail.summary}
          </p>
          <p className="mt-5 max-w-[62ch] text-[14.5px] leading-[1.7] text-pretty text-ink-muted">
            {detail.body}
          </p>
        </div>

        <ul className="m-0 list-none border-t border-rule">
          {detail.capabilities.map((capability) => (
            <li
              key={capability}
              className="flex items-baseline gap-3 border-b border-rule py-[11px] text-[13.5px] leading-[1.45]"
            >
              <span
                aria-hidden="true"
                className="h-px w-[10px] shrink-0 translate-y-[-4px] bg-oxblood"
              />
              {capability}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  )
}
