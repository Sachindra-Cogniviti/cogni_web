import { MapArc, MapLabel, MapPin } from "@/components/ui/map-motion"
import { buildWorldMap, type MapRegion } from "@/lib/world-map"
import { cn } from "@/lib/utils"

/**
 * Dotted world map with pins, arcs between them, and HTML labels.
 *
 * Started from the Aceternity `world-map` registry component and reworked
 * for this site:
 *
 *   - It is a server component. The dot grid is computed at build time (see
 *     lib/world-map.ts) and arrives as a single SVG path, not a data-URI
 *     image built in the browser from the full country dataset.
 *   - Light-only, on the site's palette: rule-coloured dots on paper, oxblood
 *     pins and arcs. The next-themes dependency is gone.
 *   - Arcs, pins and labels animate with Motion (components/ui/map-motion.tsx)
 *     once the map is in view: arcs draw out from the hub, pins pop as their
 *     arc lands, labels rise after them. The map itself stays a server
 *     component so the dot grid never ships to the browser.
 *   - After that a dot runs along each solid arc from the hub, on a loop,
 *     in SMIL so the map stays static markup. Each arc has its own period
 *     so the dots never line up. Hidden under reduced motion (globals.css).
 *   - Labels are real HTML positioned by grid percentage, so they can carry
 *     live content such as the office clocks.
 */

export type WorldMapPin = {
  id: string
  lat: number
  lng: number
  /** Hollow pins mark partner markets; solid pins are owned offices. */
  hollow?: boolean
  /** Which side of the pin the label sits on. */
  anchor?: "top" | "bottom" | "left" | "right"
  label?: React.ReactNode
}

export type WorldMapArc = {
  from: string
  to: string
  /** Dashed arcs mark partner links. They fade in rather than draw. */
  dashed?: boolean
  /**
   * How far the arc rises above its straight line, as a multiple of the
   * default. Vary these so arcs into one hub leave it at different angles.
   */
  bow?: number
}

const ANCHOR: Record<NonNullable<WorldMapPin["anchor"]>, string> = {
  top: "-translate-x-1/2 -translate-y-full -mt-3",
  bottom: "-translate-x-1/2 mt-3",
  left: "-translate-x-full -translate-y-1/2 -ml-3 text-right",
  right: "-translate-y-1/2 ml-3",
}

function arcPath(
  a: { x: number; y: number },
  b: { x: number; y: number },
  mapHeight: number,
  bow: number
) {
  // A quadratic curve that rises out of the hub (a) and settles onto the
  // office (b), like a flight path. The control point sits above the chord:
  // straight north for a mostly east-west hop, easing toward the chord's
  // perpendicular as the hop turns north-south so a short southward hop
  // does not fold back on itself. Its size scales with the span and is
  // capped at a share of the map height so the longest hop stays inside the
  // top edge; `bow` scales it per arc so arcs into one hub do not stack.
  // Leaning the control toward the hub makes the departure steeper and the
  // arrival gentler.
  const dx = b.x - a.x
  const dy = b.y - a.y
  const span = Math.hypot(dx, dy)
  if (span === 0) return `M ${a.x} ${a.y}`
  let px = dy / span
  let py = -dx / span
  if (py > 0 || (py === 0 && px < 0)) {
    px = -px
    py = -py
  }
  const len = Math.hypot(px, py - 1)
  const ux = px / len
  const uy = (py - 1) / len
  const amount = Math.min(span * 0.32, mapHeight * 0.2) * bow
  const mx = (a.x + b.x) / 2
  const my = (a.y + b.y) / 2
  const lean = 0.25
  const cx = mx + ux * amount + (a.x - mx) * lean
  const cy = Math.max(1, my + uy * amount + (a.y - my) * lean)
  return `M ${a.x} ${a.y} Q ${r2(cx)} ${r2(cy)} ${b.x} ${b.y}`
}

const r2 = (n: number) => Math.round(n * 100) / 100

export function WorldMap({
  region,
  height = 56,
  pins,
  arcs = [],
  className,
  /** Hide labels below this breakpoint's width; see the caller for a list. */
  labelsFrom = "md",
}: {
  region: MapRegion
  height?: number
  pins: readonly WorldMapPin[]
  arcs?: readonly WorldMapArc[]
  className?: string
  labelsFrom?: "sm" | "md" | "lg"
}) {
  const map = buildWorldMap({ region, height, pins })
  // Arcs leave the hub 220ms apart from 300ms in; each pin lands when its
  // arc does (a 1.4s draw), and the hub itself pops first.
  const arcDelay = (i: number) => 0.3 + i * 0.22
  const pinDelay = (id: string) => {
    const i = arcs.findIndex((arc) => arc.to === id)
    return i === -1 ? 0.2 : arcDelay(i) + 1.1
  }
  const pct = (p: { x: number; y: number }) => ({
    left: `${(p.x / map.width) * 100}%`,
    top: `${(p.y / map.height) * 100}%`,
  })
  const labelVisibility = {
    sm: "hidden sm:block",
    md: "hidden md:block",
    lg: "hidden lg:block",
  }[labelsFrom]

  return (
    <div
      className={cn("relative w-full", className)}
      style={{ aspectRatio: `${map.width} / ${map.height}` }}
    >
      <svg
        viewBox={`0 0 ${map.width} ${map.height}`}
        className="absolute inset-0 h-full w-full select-none"
        aria-hidden="true"
      >
        <defs>
          {/* Arcs fade out at both ends, as in the Aceternity original. */}
          <linearGradient id="map-arc-fade" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-oxblood)" stopOpacity="0" />
            <stop offset="10%" stopColor="var(--color-oxblood)" stopOpacity="1" />
            <stop offset="90%" stopColor="var(--color-oxblood)" stopOpacity="1" />
            <stop offset="100%" stopColor="var(--color-oxblood)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* The land, as dots. Round caps on zero-length segments. */}
        <path
          d={map.d}
          fill="none"
          stroke="var(--color-ink-ghost)"
          strokeOpacity="0.55"
          strokeWidth="0.46"
          strokeLinecap="round"
        />

        {arcs.map((arc, i) => {
          const a = map.points[arc.from]
          const b = map.points[arc.to]
          if (!a || !b) return null
          const d = arcPath(a, b, map.height, arc.bow ?? 1)
          const period = `${(3.4 + i * 0.55).toFixed(2)}s`
          const begin = `${(arcDelay(i) + 1.6).toFixed(2)}s`
          return (
            <g key={`${arc.from}-${arc.to}`}>
              <MapArc d={d} dashed={arc.dashed} delay={arcDelay(i)} />
              {!arc.dashed && (
                <circle className="map-traveller" r="0.42" fill="var(--color-oxblood)" opacity="0">
                  <animateMotion dur={period} begin={begin} repeatCount="indefinite" path={d} />
                  <animate
                    attributeName="opacity"
                    values="0;0.9;0.9;0"
                    keyTimes="0;0.12;0.85;1"
                    dur={period}
                    begin={begin}
                    repeatCount="indefinite"
                  />
                </circle>
              )}
            </g>
          )
        })}

        {pins.map((pin) => {
          const p = map.points[pin.id]
          if (!p) return null
          return (
            <g key={pin.id}>
              {!pin.hollow && (
                <circle
                  className="map-pulse"
                  cx={p.x}
                  cy={p.y}
                  r="0.7"
                  fill="var(--color-oxblood)"
                  opacity="0.4"
                >
                  <animate attributeName="r" from="0.7" to="2.8" dur="2.2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.4" to="0" dur="2.2s" repeatCount="indefinite" />
                </circle>
              )}
              <MapPin x={p.x} y={p.y} hollow={pin.hollow} delay={pinDelay(pin.id)} />
            </g>
          )
        })}
      </svg>

      {pins.map((pin) => {
        const p = map.points[pin.id]
        if (!p || !pin.label) return null
        return (
          <MapLabel
            key={`label-${pin.id}`}
            className={cn(
              "absolute whitespace-nowrap",
              ANCHOR[pin.anchor ?? "top"],
              labelVisibility
            )}
            style={pct(p)}
            delay={pinDelay(pin.id) + 0.1}
          >
            {pin.label}
          </MapLabel>
        )
      })}
    </div>
  )
}
