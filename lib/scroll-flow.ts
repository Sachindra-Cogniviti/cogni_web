import { animate, inView, type AnimationPlaybackControls } from "motion"

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
 * So an element is watched, and when it comes into view it plays. When it
 * leaves it is faded back to its start state, so it plays again the next
 * time it arrives - scrolling back up the page replays the page. The page's
 * continuous life comes from a separate layer that is still tied to the
 * scroll - the parallax, the drawn rules, the hero's exit
 * (components/scroll-motion.tsx) - and those never stop responding.
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
 * Whatever is currently moving each element, so an arrival can cut short a
 * departure and the other way round. Two animations on the same property at
 * once would fight, and the loser would be whichever the scheduler ran first.
 */
const inflight = new WeakMap<Element, AnimationPlaybackControls>()

function replace(element: Element, controls: AnimationPlaybackControls) {
  inflight.get(element)?.stop()
  inflight.set(element, controls)
  return controls
}

/**
 * Plays one element's arrival. The element is already offset and transparent
 * from the stylesheet, or part-way back to that after a departure; this
 * animates it to rest from wherever it is.
 */
export function flowIn(
  element: Element,
  { index = 0, step = STEP }: FlowOptions = {}
) {
  return replace(
    element,
    animate(
      element,
      { opacity: 1, translate: "0px 0px" },
      { duration: DURATION, ease: EASE, delay: delayFor(index, step) }
    )
  )
}

/**
 * Plays one element's departure: a short fade, after which the inline
 * styles the arrival wrote are cleared, so the stylesheet's start offset is
 * what the next arrival animates out of. The fade is much shorter than the
 * arrival because by the time it runs the element is all but off screen.
 *
 * The clear is skipped if something else has taken the element over in the
 * meantime - an arrival that began during the fade must not have its
 * starting values pulled out from under it.
 */
export function flowOut(element: Element) {
  const controls = replace(
    element,
    animate(element, { opacity: 0 }, { duration: 0.2, ease: "easeOut" })
  )
  controls.finished.then(() => {
    if (inflight.get(element) !== controls) return
    const style = (element as HTMLElement).style
    style.opacity = ""
    style.translate = ""
    inflight.delete(element)
  })
  return controls
}

/**
 * The viewport margin every replaying reveal on the page watches with. The
 * bottom inset holds the trigger back until an element is properly on
 * screen rather than one pixel over the edge; the top is the viewport's own
 * edge, so a block that has scrolled off the top has left and will play
 * again on the way back.
 *
 * An earlier version extended the top a long way up so that anything the
 * reader had scrolled past counted as seen, because a block that never
 * crossed the viewport after an anchor jump was stranded at its hidden
 * start state. With a replay there is nothing to strand: a hidden block
 * above the fold plays the moment it is scrolled back to.
 */
export const VIEW_MARGIN = "0px 0px -8% 0px"

/**
 * Watches an element. `play` runs each time it comes into view and
 * `leave`, if given, each time it goes out again.
 */
export function watch(element: Element, play: () => void, leave?: () => void) {
  return inView(
    element,
    () => {
      play()
      return leave
    },
    { amount: 0.15, margin: VIEW_MARGIN }
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
