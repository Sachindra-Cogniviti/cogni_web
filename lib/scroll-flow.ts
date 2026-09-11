import { animate, inView } from "motion"

/**
 * The page's scroll flow: the one mechanism every block on the page arrives
 * by, and the only one. Motion drives all of it.
 *
 * An earlier version bound each element's arrival to the scroll position
 * itself, with a native CSS scroll timeline where the browser supported one.
 * It read well when you inched down the page and disappeared entirely when
 * you did not: because the animation *is* the scroll, a normal flick
 * compresses the whole thing into a handful of frames and nothing is seen.
 * A timed animation always takes its full length however fast the reader
 * moves, which is why every interface that feels choreographed uses one.
 *
 * So an element is watched, and when it comes into view it plays. Once. The
 * page's continuous life comes from a separate layer that is still tied to
 * the scroll - the parallax, the drawn rules, the Why threads, the hero's
 * exit (components/scroll-motion.tsx) - and those never stop responding.
 *
 * Three things make the arrival legible where the old one was not:
 *
 *   - Distance. A block travels far enough to register rather than the few
 *     pixels that read as a flicker.
 *   - Direction. A block can enter from the left or the right, not only from
 *     below, so the two halves of a split section arrive from their own
 *     sides and the page has lateral movement in it.
 *   - Separation. Items in a group are a clear beat apart, long enough that
 *     the eye follows the row rather than seeing it appear at once.
 *
 * Movement uses the independent `translate` property rather than `transform`,
 * so it composes with the Tailwind hover transforms already on cards and
 * links instead of overwriting them. Nothing here sets a from-value: the
 * hidden state lives in globals.css and Motion animates out of whatever it
 * finds, so the two can never disagree.
 */
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

/**
 * How long one element takes to arrive.
 *
 * Read this together with STEP below: what makes a group look staggered is
 * the ratio between the two, not either on its own.
 */
export const DURATION = 0.5

/**
 * The beat between one item in a group and the next, in seconds.
 *
 * This was 90ms against a 700ms arrival, which is roughly an eighth. At that
 * ratio every item in a group of eight is in flight at once and only the last
 * fraction of the group differs from the first, so the whole thing lands as a
 * block however carefully the delays are set - and a group that only fades,
 * like the logo wall, has no movement to give the order away either.
 *
 * A beat of about a quarter of the arrival is what actually reads as one
 * item after another.
 */
export const STEP = 0.13

/** Past this many items the delay stops growing, so a long list never drags. */
const MAX_INDEX = 9

/**
 * "fade" holds an item still and only brings the opacity up. Hairline grids
 * need it: a cell that slides tears open the very rules that make the grid,
 * and the join is what those sections are built out of.
 */
export type FlowDirection = "up" | "left" | "right" | "fade"

/** Delay for an item at `index`, in seconds. */
export function delayFor(index: number, step: number = STEP) {
  return Math.min(index, MAX_INDEX) * step
}

export type FlowOptions = {
  /** Position in a staggered group; each step is one beat later. */
  index?: number
  /** Seconds between items. */
  step?: number
}

/**
 * Plays one element's arrival. The element is already offset and transparent
 * from the stylesheet; this animates it to rest.
 */
export function flowIn(
  element: Element,
  { index = 0, step = STEP }: FlowOptions = {}
) {
  return animate(
    element,
    { opacity: 1, translate: "0px 0px" },
    { duration: DURATION, ease: EASE, delay: delayFor(index, step) }
  )
}

/**
 * Watches an element and calls back the first time it comes into view.
 *
 * The watch area reaches far above the viewport so that anything the reader
 * has already scrolled past counts as seen and plays at once. Without it a
 * jump - an anchor link, a restored scroll position - would leave whole
 * blocks stranded at their hidden starting state above the fold. Entering
 * from below is unaffected: the bottom margin holds the trigger back until
 * the element is properly on screen rather than one pixel over the edge.
 */
export function watch(element: Element, play: () => void) {
  return inView(
    element,
    () => {
      play()
      // Returning nothing keeps it from firing again on the way out.
    },
    { amount: 0.15, margin: "100000px 0px -8% 0px" }
  )
}

/**
 * Drops an element at its settled state with no animation. Used under
 * reduced motion and by the safety nets, where the flow cannot run but the
 * content must still be visible.
 */
export function settle(element: Element) {
  const style = (element as HTMLElement).style
  style.opacity = "1"
  style.translate = "none"
}
