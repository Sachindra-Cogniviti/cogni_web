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
        "border-b border-oxblood/35 pb-[3px] text-[15px] font-medium text-oxblood transition-colors hover:text-ink",
        className
      )}
      {...props}
    />
  )
}

/** Solid ink button. Goes oxblood on hover, and lifts 1px on the hero pair. */
export const solidButton =
  "inline-block rounded-[2px] bg-ink px-[28px] py-[15px] text-[15px] font-medium text-paper transition-[background-color,transform] duration-200 hover:bg-oxblood"

/** Hairline-outlined button, the quieter half of a button pair. */
export const outlineButton =
  "inline-block rounded-[2px] border border-edge px-[28px] py-[14px] text-[15px] font-medium text-ink transition-colors duration-200 hover:border-oxblood hover:text-oxblood"
