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
export const sectionPadding = "py-[clamp(88px,10vw,140px)]"

/**
 * The small uppercase mono line that opens most sections. Oxblood on light
 * grounds, a lifted rose on dark ones where oxblood would not hold contrast.
 */
export function Kicker({
  className,
  tone = "accent",
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
    />
  )
}

/**
 * Underlined text link used for section-closing actions ("Explore Resources",
 * "View All Client Stories"). The rule under it is a real border rather than
 * text-decoration so its colour and offset can be controlled.
 */
export function QuietLink({ className, ...props }: React.ComponentProps<"a">) {
  return (
    <a
      className={cn(
        "border-b border-oxblood/35 pb-[3px] text-[15px] font-medium text-oxblood transition-[color,border-color] duration-200 hover:border-ink/35 hover:text-ink",
        className
      )}
      {...props}
    />
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
  className,
}: {
  edges?: "all" | "top" | "bottom"
  /** Arm length in px. */
  size?: number
  className?: string
}) {
  const arm = { width: size, height: size }
  // ink-ghost (#a69c8a) rather than rule-strong (#d8d2c4): against the default
  // rule (#e8e3d9), rule-strong is too near to register at a 10px arm and the
  // brackets just disappear into the border.
  const tone = "border-ink-ghost"
  return (
    <span
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 z-[2]", className)}
    >
      {edges !== "bottom" && (
        <>
          <i className={`absolute top-0 left-0 border-t border-l ${tone}`} style={arm} />
          <i className={`absolute top-0 right-0 border-t border-r ${tone}`} style={arm} />
        </>
      )}
      {edges !== "top" && (
        <>
          <i className={`absolute bottom-0 left-0 border-b border-l ${tone}`} style={arm} />
          <i className={`absolute right-0 bottom-0 border-r border-b ${tone}`} style={arm} />
        </>
      )}
    </span>
  )
}

/**
 * Shared by every pressable on the page: a 3% scale-down on press so the
 * control answers the finger, and full width below the small breakpoint so
 * a stacked pair keeps one edge. The focus ring is global (globals.css).
 */
export const pressable =
  "transition-transform duration-[160ms] ease-[cubic-bezier(.23,1,.32,1)] active:scale-[0.97] max-sm:w-full max-sm:text-center"

/** Solid ink button. Goes oxblood on hover, and lifts 1px on the hero pair. */
export const solidButton = `inline-block rounded-[2px] bg-ink px-[28px] py-[15px] text-[15px] font-medium text-paper transition-[background-color,transform] duration-200 hover:bg-oxblood ${pressable}`

/** Hairline-outlined button, the quieter half of a button pair. */
export const outlineButton = `inline-block rounded-[2px] border border-edge px-[28px] py-[14px] text-[15px] font-medium text-ink transition-[color,border-color,transform] duration-200 hover:border-oxblood hover:text-oxblood ${pressable}`
