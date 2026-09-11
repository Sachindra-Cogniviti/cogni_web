"use client"

import * as React from "react"
import {
  cubicBezier,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react"

import { cn } from "@/lib/utils"

/**
 * Scroll-linked and ambient motion primitives.
 *
 * Everything else on the page animates once, when it first arrives. These
 * are what keep it moving afterwards: each is tied to the scroll position
 * itself (Motion's `useScroll` on the element, so it runs forwards and
 * backwards, every time) or loops quietly on its own. They are decorative
 * and never gate interaction, and every one of them goes still under
 * reduced motion.
 *
 *   - Parallax: the wrapped block drifts a few pixels against the scroll as
 *     it crosses the viewport. Positive `y` runs ahead of the page (copy),
 *     negative lags it (media), and the two together read as depth.
 *   - FlowRule: a hairline that draws in from the left as it nears the
 *     viewport's lower third. It replaces a section's static bottom border,
 *     so the rule leading into the next section is drawn by the scroll.
 *   - ScrollWords: a heading that brightens a word at a time as the reader
 *     scrolls through it, so the copy is read at the pace of the scroll.
 *   - Spin: a slow continuous rotation for a small mark.
 *   - Spotlight: a soft glow that follows the pointer over a dark section,
 *     on a spring so it trails rather than tracks. Fine pointers only.
 */
const EASE_OUT = cubicBezier(0.22, 1, 0.36, 1)
const FINE_POINTER = "(hover: hover) and (pointer: fine)"

/**
 * Root margin for every once-only reveal on the page. It extends the
 * detection area a long way above the viewport, so anything the reader has
 * already scrolled past counts as seen and shows at once. Without it, a
 * jump (an anchor link, a restored scroll position, reduced motion) can
 * leave whole blocks above the fold sitting at their hidden start state,
 * because they never crossed the viewport. Entering from below is unchanged.
 */
export const SEEN_ABOVE = "100000px 0px 0px 0px"

export function Parallax({
  as: Tag = "div",
  y = 24,
  scale,
  className,
  children,
}: {
  as?: "div" | "span" | "li"
  /** Pixels of travel: from +y as the block enters to -y as it leaves. */
  y?: number
  /** Optional scale range, entering to leaving. */
  scale?: [number, number]
  className?: string
  children: React.ReactNode
}) {
  const ref = React.useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })
  const ty = useTransform(scrollYProgress, [0, 1], [y, -y])
  const ts = useTransform(scrollYProgress, [0, 1], scale ?? [1, 1])
  const Element = motion[Tag] as typeof motion.div
  return (
    <Element
      ref={ref as React.Ref<HTMLDivElement>}
      style={reduced ? undefined : scale ? { y: ty, scale: ts } : { y: ty }}
      className={className}
    >
      {children}
    </Element>
  )
}

export function FlowRule({ className }: { className?: string }) {
  const ref = React.useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start 62%"],
  })
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1], {
    ease: EASE_OUT,
  })
  return (
    <motion.div
      ref={ref}
      aria-hidden="true"
      style={reduced ? undefined : { scaleX }}
      className={cn(
        "absolute inset-x-0 bottom-0 h-px origin-left bg-rule",
        className
      )}
    />
  )
}

function ScrollWord({
  progress,
  from,
  to,
  children,
}: {
  progress: ReturnType<typeof useScroll>["scrollYProgress"]
  from: number
  to: number
  children: React.ReactNode
}) {
  const opacity = useTransform(progress, [from, to], [0.16, 1])
  return <motion.span style={{ opacity }}>{children}</motion.span>
}

export function ScrollWords({
  as: Tag = "h2",
  text,
  className,
}: {
  as?: "h2" | "p"
  text: string
  className?: string
}) {
  const ref = React.useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 88%", "end 52%"],
  })
  const words = text.split(" ")
  const Element = Tag
  if (reduced) {
    return (
      <Element ref={ref as React.Ref<HTMLHeadingElement>} className={className}>
        {text}
      </Element>
    )
  }
  return (
    <Element ref={ref as React.Ref<HTMLHeadingElement>} className={className}>
      {words.map((word, i) => (
        <React.Fragment key={`${word}-${i}`}>
          <ScrollWord
            progress={scrollYProgress}
            from={i / words.length}
            to={(i + 1) / words.length}
          >
            {word}
          </ScrollWord>
          {i < words.length - 1 ? " " : null}
        </React.Fragment>
      ))}
    </Element>
  )
}

export function Spin({
  className,
  duration = 14,
  from = 45,
}: {
  className?: string
  /** Seconds per turn. */
  duration?: number
  /** Starting angle in degrees. */
  from?: number
}) {
  return (
    <motion.span
      aria-hidden="true"
      className={className}
      initial={{ rotate: from }}
      animate={{ rotate: from + 360 }}
      transition={{ duration, ease: "linear", repeat: Infinity }}
    />
  )
}

export function Spotlight({
  className,
  color = "rgb(142 32 48 / 0.24)",
  size = 560,
}: {
  className?: string
  color?: string
  size?: number
}) {
  const ref = React.useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const visible = useMotionValue(0)
  const spring = { stiffness: 140, damping: 26, mass: 0.7 }
  const sx = useSpring(x, spring)
  const sy = useSpring(y, spring)
  const opacity = useSpring(visible, { stiffness: 120, damping: 24 })
  const background = useMotionTemplate`radial-gradient(${size}px circle at ${sx}px ${sy}px, ${color}, transparent 65%)`

  React.useEffect(() => {
    const host = ref.current?.parentElement
    if (!host || !window.matchMedia(FINE_POINTER).matches) return
    let inside = false
    const move = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect()
      const px = event.clientX - rect.left
      const py = event.clientY - rect.top
      if (!inside || reduced) {
        // Arrive where the pointer is rather than sliding in from the
        // corner the spring last rested at.
        sx.jump(px)
        sy.jump(py)
        inside = true
      }
      x.set(px)
      y.set(py)
      visible.set(1)
    }
    const leave = () => {
      inside = false
      visible.set(0)
    }
    host.addEventListener("pointermove", move, { passive: true })
    host.addEventListener("pointerleave", leave)
    return () => {
      host.removeEventListener("pointermove", move)
      host.removeEventListener("pointerleave", leave)
    }
  }, [x, y, sx, sy, visible, reduced])

  return (
    <motion.div
      ref={ref}
      aria-hidden="true"
      style={{ background, opacity }}
      className={cn(
        "pointer-glow pointer-events-none absolute inset-0",
        className
      )}
    />
  )
}
