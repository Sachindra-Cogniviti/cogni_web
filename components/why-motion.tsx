"use client"

import * as React from "react"
import { motion, type Variants } from "motion/react"

import { why } from "@/content/site"

/**
 * The moving parts of the Why section, on Motion.
 *
 * WhyMap is the boundary grid: six tiles rise in 50ms apart, an oxblood
 * thread draws through the gaps between them (across, then down, then
 * down), and the marker lands on the crossing on a small spring. The SVG
 * is stretched over the grid with `preserveAspectRatio="none"`, so
 * percentage coordinates land in the gaps at any width, and
 * `vector-effect: non-scaling-stroke` keeps the thread's weight.
 *
 * PillarRule is the line that draws in from the left over each pillar.
 */
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]
const VIEW = { once: true, amount: 0.4 } as const

const grid: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
}

const tile: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
}

const threads: { d: string; delay: number }[] = [
  { d: "M 0 50 H 100", delay: 0.15 },
  { d: "M 33.1 0 V 100", delay: 0.45 },
  { d: "M 66.9 0 V 100", delay: 0.6 },
]

export function WhyMap() {
  return (
    <motion.div
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

      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
      >
        {threads.map((thread) => (
          <motion.path
            key={thread.d}
            d={thread.d}
            className="why-thread"
            variants={{
              hidden: { pathLength: 0 },
              show: { pathLength: 1, transition: { duration: 0.9, ease: EASE, delay: thread.delay } },
            }}
          />
        ))}
      </svg>

      {/* The marker sits on the crossing at the centre of the grid. */}
      <motion.div
        variants={{
          hidden: { opacity: 0, scale: 0.9 },
          show: {
            opacity: 1,
            scale: 1,
            transition: { type: "spring", duration: 0.5, bounce: 0.3, delay: 0.9 },
          },
        }}
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
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.6, ease: EASE, delay: index * 0.07 + 0.12 }}
      className="absolute top-0 left-0 h-[2px] w-full origin-left bg-ink"
    />
  )
}
