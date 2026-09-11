"use client"

import { motion } from "motion/react"

import { SEEN_ABOVE } from "@/components/scroll-motion"

/**
 * The moving parts of the world map, split out so the map itself can stay
 * a server component (its dot grid is computed at build time and must not
 * be shipped to the browser).
 *
 * Arcs draw themselves from the hub outward once the map is in view, 220ms
 * apart, on the page's ease-out; a dashed partner arc fades instead, since
 * a path-length draw would override its dashes. Pins pop in on a small
 * spring as their arc lands, and the HTML labels rise in after them.
 */
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]
const VIEW = { once: true, amount: 0.3, margin: SEEN_ABOVE } as const

export function MapArc({
  d,
  dashed = false,
  delay,
}: {
  d: string
  dashed?: boolean
  /** Seconds after the map enters view. */
  delay: number
}) {
  if (dashed) {
    return (
      <motion.path
        d={d}
        fill="none"
        stroke="var(--color-oxblood)"
        strokeOpacity="0.85"
        strokeWidth="0.3"
        strokeLinecap="round"
        strokeDasharray="0.5 0.8"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={VIEW}
        transition={{ duration: 0.9, ease: "easeOut", delay }}
      />
    )
  }
  return (
    <motion.path
      d={d}
      fill="none"
      stroke="url(#map-arc-fade)"
      strokeWidth="0.26"
      strokeOpacity="0.85"
      strokeLinecap="round"
      initial={{ pathLength: 0 }}
      whileInView={{ pathLength: 1 }}
      viewport={VIEW}
      transition={{ duration: 1.4, ease: EASE, delay }}
    />
  )
}

export function MapPin({
  x,
  y,
  hollow = false,
  delay,
}: {
  x: number
  y: number
  hollow?: boolean
  delay: number
}) {
  return (
    <motion.circle
      cx={x}
      cy={y}
      r={hollow ? 0.7 : 0.75}
      fill={hollow ? "var(--color-paper-soft)" : "var(--color-oxblood)"}
      stroke={hollow ? "var(--color-oxblood)" : "var(--color-paper)"}
      strokeWidth={hollow ? 0.28 : 0.26}
      initial={{ scale: 0.6, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      viewport={VIEW}
      transition={{ type: "spring", duration: 0.5, bounce: 0.35, delay }}
    />
  )
}

export function MapLabel({
  className,
  style,
  delay,
  children,
}: {
  className?: string
  style?: React.CSSProperties
  delay: number
  children: React.ReactNode
}) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y: 4 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEW}
      transition={{ duration: 0.5, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  )
}
