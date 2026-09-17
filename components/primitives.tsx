import { ScrambleText } from "@/components/scramble-text"
import { cn } from "@/lib/utils"

/**
 * Shared layout and type primitives for the landing page.
 *
 * The design repeats a small number of exact measurements across every
 * section - a 1280px measure, a fluid gutter, a fluid section rhythm, and a
 * mono kicker. They live here so the numbers are declared once and a change
 * to the page rhythm is a one-line edit rather than sixteen.
 */

/** 1280px measure with the page's fluid gutter. */
export function Container({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "mx-auto max-w-[1280px] px-[clamp(20px,4vw,48px)]",
        className
      )}
      {...props}
    />
  )
}

/** The page's vertical rhythm between major sections. */
export const sectionPadding = "py-[clamp(56px,10vw,140px)]"

/**
 * The small uppercase mono line that opens most sections. Oxblood on light
 * grounds, a lifted rose on dark ones where oxblood would not hold contrast.
 *
 * A plain string child decodes itself as it scrolls into view (ScrambleText
 * in components/scramble-text.tsx), the way the client-wall and
 * certification eyebrows do. That is safe here and nowhere else on the page
 * because the kicker is the one mono line: the effect depends on every
 * substituted glyph being exactly as wide as the real one. Anything other
 * than a string is rendered as given.
 */
export function Kicker({
  className,
  tone = "accent",
  children,
  ...props
}: React.ComponentProps<"div"> & { tone?: "accent" | "dark" | "muted" }) {
  return (
    <div
      className={cn(
        "font-mono text-[11px] font-medium tracking-[0.22em] uppercase",
        tone === "accent" && "text-oxblood",
        tone === "dark" && "text-oxblood-lift",
        tone === "muted" && "text-ink-faint",
        className
      )}
      {...props}
    >
      {typeof children === "string" ? (
        <ScrambleText text={children} />
      ) : (
        children
      )}
    </div>
  )
}

/**
 * Underlined text link used for section-closing actions ("Explore Resources",
 * "View All Client Stories"). The rule under it is a real border rather than
 * text-decoration so its colour and offset can be controlled.
 *
 * The label rolls (see Roll), so the colour and the rule under it move on the
 * roll's own duration and curve rather than the 200ms they used to: a fast
 * recolour under a slower slide reads as two events instead of one.
 */
export function QuietLink({
  className,
  children,
  ...props
}: React.ComponentProps<"a">) {
  return (
    <a
      className={cn(
        "border-b border-oxblood/35 pb-[3px] text-[15px] font-medium text-oxblood transition-[color,border-color] duration-[var(--roll-duration)] ease-[var(--roll-ease)] hover:border-ink/35 hover:text-ink",
        className
      )}
      {...props}
    >
      <Roll>{children}</Roll>
    </a>
  )
}

/**
 * A ruled band: full-bleed bottom hairline, with the hatch running the full
 * width between the page frame's two vertical rules.
 *
 * It is inset with `--frame-inset` rather than wrapped in a Container, so it
 * reaches the frame instead of stopping a gutter short of it at the content
 * edge. It carries no side borders of its own for the same reason - the frame
 * rules are its sides, and drawing a second pair on top of them would only
 * thicken the line.
 *
 * It is structure, not content - it states where the page grid begins and
 * gives the eye a beat between two blocks - so it is `aria-hidden` and has no
 * text. The texture is `.rule-hatch`, deliberately not the placeholder
 * hatching, which means something else entirely (see globals.css).
 */
/**
 * A section divider that runs the full width of the screen from inside the
 * content column.
 *
 * Every rule that separates one block of a section from the next is drawn
 * edge to edge, like the scroll-drawn rule between sections (FlowRule in
 * components/scroll-motion.tsx), rather than stopping at the column's gutter.
 * A `border-t` on the block would stop at the gutter, so this is a separate
 * element: a hairline as wide as the viewport, centred on the column. The
 * host block must be `relative`, and the rule sits on its top edge.
 *
 * Keep it on a static wrapper, not on the block that scroll-flow reveals.
 * Blocks arriving from the side start beyond their resting place, and a
 * screen-wide line that slides in with them shows a gap at the edge.
 *
 * `w-screen` is 100vw, which counts the scrollbar's width, so the line runs
 * a few pixels past each edge. The html element clips horizontal overflow,
 * so nothing widens the page.
 */
export function WideRule({
  tone = "rule",
  className,
}: {
  tone?: "rule" | "strong"
  className?: string
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute top-0 left-1/2 h-px w-screen -translate-x-1/2",
        tone === "strong" ? "bg-rule-strong" : "bg-rule",
        className
      )}
    />
  )
}

export function HatchBand({
  height = 56,
  className,
}: {
  /** Band height in px. */
  height?: number
  className?: string
}) {
  return (
    <div
      aria-hidden="true"
      className={cn("border-b border-rule px-[var(--frame-inset)]", className)}
    >
      <div className="rule-hatch" style={{ height }} />
    </div>
  )
}

/**
 * Corner brackets: four small L-shapes sitting on the corners of a hairline
 * cell. The host needs `relative`.
 *
 * The colour is the whole trick. Where this device comes from, the cells have
 * no border and the brackets *are* the boundary. Here every cell already
 * carries a full hairline, so a bracket at the same weight and tone lands
 * exactly on top of the border and is invisible. Drawn a step darker than the
 * rule it reads as corner emphasis instead - the grid thickening where the
 * lines meet, which is what makes it look surveyed rather than decorated.
 *
 * `edges` drops a pair where something else already occupies that edge: the
 * cards in certifications.tsx carry an oxblood tick across the top rule, and
 * a bracket underneath it would be half-covered and read as a mistake.
 */
export function Corners({
  edges = "all",
  size = 10,
  tone: toneName = "ghost",
  className,
}: {
  edges?: "all" | "top" | "bottom"
  /** Arm length in px. */
  size?: number
  /**
   * `ghost` is the default and belongs on a hairline cell. `oxblood` is for
   * brackets that land on a photograph, where ink-ghost is legible over a
   * pale background and gone over a dark one - the accent holds against both,
   * and ties the brackets to the rule they appear alongside.
   */
  tone?: "ghost" | "oxblood"
  className?: string
}) {
  const arm = { width: size, height: size }
  // ink-ghost (#a69c8a) rather than rule-strong (#d8d2c4): against the default
  // rule (#e8e3d9), rule-strong is too near to register at a 10px arm and the
  // brackets just disappear into the border.
  const tone = toneName === "oxblood" ? "border-oxblood" : "border-ink-ghost"
  return (
    <span
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 z-[2]", className)}
    >
      {edges !== "bottom" && (
        <>
          <i
            className={`absolute top-0 left-0 border-t border-l ${tone}`}
            style={arm}
          />
          <i
            className={`absolute top-0 right-0 border-t border-r ${tone}`}
            style={arm}
          />
        </>
      )}
      {edges !== "top" && (
        <>
          <i
            className={`absolute bottom-0 left-0 border-b border-l ${tone}`}
            style={arm}
          />
          <i
            className={`absolute right-0 bottom-0 border-r border-b ${tone}`}
            style={arm}
          />
        </>
      )}
    </span>
  )
}

/**
 * Shared by every pressable on the page: a 3% scale-down on press so the
 * control answers the finger, and full width below the small breakpoint so
 * a stacked pair keeps one edge. The focus ring is global (globals.css).
 *
 * The transition itself is `.control-motion` in globals.css rather than
 * utilities here, because a control needs two timings at once: its colours
 * travel with the label roll, while the press stays at 160ms - a press that
 * took the roll's 360ms would feel like the button was sticking. Two
 * `transition-*` utilities cannot express that, and worse, both set
 * `transition-property`, so one silently loses to the other in the cascade.
 * One declaration with per-property timing has no such argument to lose.
 */
export const pressable =
  "control-motion active:scale-[0.97] max-sm:w-full max-sm:text-center"

/** Solid ink button. Goes oxblood on hover, and lifts 1px on the hero pair. */
export const solidButton = `inline-block rounded-[2px] bg-ink px-[28px] py-[15px] text-[15px] font-medium text-paper hover:bg-oxblood ${pressable}`

/**
 * The solid button inverted, for the night ground.
 *
 * A separate string rather than `solidButton` plus `bg-night-fg text-ink`.
 * Both halves of that override set the same property as something already in
 * `solidButton`, and two competing utilities are resolved by their order in
 * the generated stylesheet, not by their order in the string - so the
 * override silently lost and the closing CTA rendered paper-on-paper, a 1.02
 * contrast ratio. Written out once here, there is nothing to lose to.
 */
export const invertedButton = `inline-block rounded-[2px] bg-night-fg px-[28px] py-[15px] text-[15px] font-medium text-ink hover:bg-oxblood-lift ${pressable}`

/** Hairline-outlined button, the quieter half of a button pair. */
export const outlineButton = `inline-block rounded-[2px] border border-edge px-[28px] py-[14px] text-[15px] font-medium text-ink hover:border-oxblood hover:text-oxblood ${pressable}`

/**
 * A label that rolls on hover: the word travels up out of its line and an
 * identical copy arrives from below, so a control answers the pointer with
 * movement rather than only a colour change. It is the page's one hover
 * idiom for pressable text - the nav, every button, and every text link use
 * it, so the whole page answers the same way.
 *
 * Two copies of the same label stacked in a one-line window, and the stack is
 * moved rather than either copy, so there is nothing to keep in step. The
 * second is aria-hidden - the control already carries its label, and a screen
 * reader should not hear it twice.
 *
 * The window is exactly `1lh` tall, so the clip follows the inherited line box
 * and the control keeps the height it had before the roll existed. That
 * matters wherever something is positioned off a control's own edge, like the
 * dot under the current nav link.
 *
 * Wrap the label only, never the control. What triggers the roll is the
 * nearest enclosing `a` or `button` being hovered or focused (see globals.css),
 * so a label nested inside a larger link - the "Read more" line on a resources
 * card - rolls when the card does.
 *
 * Two things it is not for. A label that can wrap to a second line: the window
 * is one line tall and would clip the rest. And a label whose text changes on
 * the same gesture, like the nav's Menu/Close toggle - rolling one word into a
 * different one reads as a glitch rather than a flourish.
 */
export function Roll({ children }: { children: React.ReactNode }) {
  return (
    <span className="roll">
      <span className="roll-track">
        <span>{children}</span>
        <span aria-hidden="true">{children}</span>
      </span>
    </span>
  )
}

/**
 * The roll taken into depth, for a logo mark.
 *
 * Same idea as Roll - two copies, the second aria-hidden - but the copies are
 * the front and underside of a box rather than two lines in a window, and
 * hover turns the box a quarter over its top edge (`.logo-flip` in
 * globals.css): the mark leaves upward and its twin rises into its place.
 *
 * `depth` is how far each face sits from the axis, in pixels. Half the
 * mark's rendered height makes the turn a tight roll over the mark's own
 * edge; anything larger swings it around the cell.
 *
 * The trigger is the nearest `.logo-flip` ancestor being hovered or focused,
 * so the class goes on the link or button that owns the cell, and the track
 * goes around the mark alone.
 */
export function FlipTrack({
  depth,
  children,
}: {
  depth: number
  children: React.ReactNode
}) {
  return (
    <span
      className="logo-flip-track"
      style={{ "--logo-flip-depth": `${depth}px` } as React.CSSProperties}
    >
      <span>{children}</span>
      <span aria-hidden="true">{children}</span>
    </span>
  )
}
