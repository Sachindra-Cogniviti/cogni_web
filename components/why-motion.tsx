"use client"

import * as React from "react"
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from "motion/react"

import { SEEN_ABOVE } from "@/components/scroll-motion"
import { why } from "@/content/site"

/**
 * The moving parts of the Why section, on Motion.
 *
 * WhyMap is the boundary grid: six tiles rise in 50ms apart when the grid
 * first arrives, and then the scroll takes over. An oxblood thread draws
 * through the gaps between them (across, then down, then down) as the grid
 * travels from the lower edge of the viewport to its middle, and the marker
 * lands on the crossing once the thread is complete. Because the draw is
 * tied to the scroll position it runs at the reader's pace, forwards and
 * back. The threads are plain positioned elements scaled along their axis,
 * not SVG paths: a stroke-dasharray draw inside a stretched SVG breaks into
 * dashes while it is part way, and a transform on a div cannot. The gaps
 * are found with calc from the grid's three equal columns and 14px gutters,
 * so the threads sit centred in them at any width.
 *
 * PillarRule is the line that draws in from the left over each pillar.
 */
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]
const VIEW = { once: true, amount: 0.4, margin: SEEN_ABOVE } as const

const grid: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
}

const tile: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
}

/**
 * Each thread's share of the scroll passage, as [start, end] progress, and
 * where it sits. The gutter centres: with three equal columns and 14px
 * gutters, the first gutter's centre is a third of the width less 2.33px
 * and the second is two thirds plus 2.33px; the row gutter's centre is
 * exactly half the height.
 */
const ACROSS: [number, number] = [0.05, 0.42]
const DOWN_LEFT: [number, number] = [0.3, 0.66]
const DOWN_RIGHT: [number, number] = [0.46, 0.82]
const GUTTER_LEFT = "calc(33.333% - 2.33px)"
const GUTTER_RIGHT = "calc(66.667% + 2.33px)"

export function WhyMap() {
  const ref = React.useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 92%", "end 48%"],
  })
  const across = useTransform(scrollYProgress, ACROSS, [0, 1])
  const downLeft = useTransform(scrollYProgress, DOWN_LEFT, [0, 1])
  const downRight = useTransform(scrollYProgress, DOWN_RIGHT, [0, 1])
  const markerOpacity = useTransform(scrollYProgress, [0.78, 0.92], [0, 1])
  const markerScale = useTransform(scrollYProgress, [0.78, 0.92], [0.88, 1])

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      whileInView="show"
      viewport={VIEW}
      className="relative"
    >
      <motion.div variants={grid} className="grid grid-cols-3 gap-[14px]">
        {why.boundaries.map((item) => (
          <motion.div
            key={item}
            variants={tile}
            className="flex min-h-[96px] items-end border border-rule bg-paper-soft p-4 sm:min-h-[112px]"
          >
            <span className="text-[13px] leading-[1.25] font-semibold tracking-[-0.01em] text-balance sm:text-[14px]">
              {item}
            </span>
          </motion.div>
        ))}
      </motion.div>

      {/* The threads: across the row gutter, then down each column gutter. */}
      <motion.div
        aria-hidden="true"
        style={reduced ? undefined : { scaleX: across }}
        className="why-thread pointer-events-none absolute top-1/2 left-0 h-[1.5px] w-full origin-left -translate-y-1/2"
      />
      <motion.div
        aria-hidden="true"
        style={reduced ? { left: GUTTER_LEFT } : { left: GUTTER_LEFT, scaleY: downLeft }}
        className="why-thread pointer-events-none absolute top-0 h-full w-[1.5px] origin-top -translate-x-1/2"
      />
      <motion.div
        aria-hidden="true"
        style={reduced ? { left: GUTTER_RIGHT } : { left: GUTTER_RIGHT, scaleY: downRight }}
        className="why-thread pointer-events-none absolute top-0 h-full w-[1.5px] origin-top -translate-x-1/2"
      />

      {/* The marker sits on the crossing at the centre of the grid. */}
      <motion.div
        style={reduced ? undefined : { opacity: markerOpacity, scale: markerScale }}
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <span className="flex items-center gap-2 rounded-full border border-oxblood bg-paper px-3 py-[6px] font-mono text-[10px] tracking-[0.14em] whitespace-nowrap text-oxblood uppercase shadow-[0_4px_16px_rgb(23_20_15/0.08)]">
          <span className="relative flex size-[7px] items-center justify-center">
            <span className="why-pulse absolute inset-0 rounded-full bg-oxblood" />
            <span className="relative size-[7px] rounded-full bg-oxblood" />
          </span>
          {why.betweenLabel}
        </span>
      </motion.div>
    </motion.div>
  )
}

export function PillarRule({ index }: { index: number }) {
  return (
    <motion.span
      aria-hidden="true"
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, amount: 0.6, margin: SEEN_ABOVE }}
      transition={{ duration: 0.6, ease: EASE, delay: index * 0.07 + 0.12 }}
      className="absolute top-0 left-0 h-[2px] w-full origin-left bg-ink"
    />
  )
}
