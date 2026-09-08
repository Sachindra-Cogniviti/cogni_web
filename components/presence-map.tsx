import { LocalTime } from "@/components/local-time"
import { WorldMap, type WorldMapArc, type WorldMapPin } from "@/components/ui/world-map"
import { globalPresence } from "@/content/site"

/**
 * Global presence, as a map.
 *
 * Replaces the earlier meridian time line. Offices are pinned by coordinate
 * on a dotted world map (Antarctica and the polar fringe cropped away); arcs
 * run from the Singapore hub to every other office, and a dashed one to the
 * partner market. Each pin keeps its live local clock.
 *
 * Below the medium breakpoint the map is too small for labels, so they hide
 * and the offices repeat as a compact list under the map with the same
 * clocks. The map itself stays as a visual at every width.
 */
export function PresenceMap() {
  const hub = globalPresence.hub

  const pins: WorldMapPin[] = [
    ...globalPresence.locations.map((loc) => ({
      id: loc.id,
      lat: loc.lat,
      lng: loc.lng,
      anchor: loc.anchor,
      label: (
        <div>
          <div className="text-[14px] font-semibold tracking-[-0.01em] text-ink">
            {loc.name}
          </div>
          <div className="mt-0.5 font-mono text-[11px] text-ink-faint">
            {loc.offset}&nbsp;&nbsp;
            <LocalTime timeZone={loc.tz} />
          </div>
        </div>
      ),
    })),
    {
      id: globalPresence.partner.id,
      lat: globalPresence.partner.lat,
      lng: globalPresence.partner.lng,
      hollow: true,
      anchor: globalPresence.partner.anchor,
      label: (
        <div className="font-mono text-[10px] leading-[1.4] tracking-[0.1em] text-ink-faint uppercase">
          {globalPresence.partner.label}
          <br />
          {globalPresence.partner.detail}
        </div>
      ),
    },
  ]

  const arcs: WorldMapArc[] = [
    ...globalPresence.locations
      .filter((loc) => loc.id !== hub)
      .map((loc) => ({ from: hub, to: loc.id, bow: loc.bow })),
    { from: hub, to: globalPresence.partner.id, dashed: true, bow: globalPresence.partner.bow },
  ]

  return (
    <div className="border-y border-rule bg-paper-soft">
      <WorldMap
        region={globalPresence.region}
        height={100}
        pins={pins}
        arcs={arcs}
        className="mx-auto max-w-[1280px] px-[clamp(20px,4vw,48px)] py-[clamp(20px,4vw,44px)]"
      />

      {/* Narrow viewports: the same offices and clocks as a list. */}
      <ul className="m-0 grid list-none grid-cols-2 gap-x-6 gap-y-4 border-t border-rule px-5 py-5 md:hidden">
        {globalPresence.locations.map((loc) => (
          <li key={loc.id}>
            <div className="text-[14px] font-semibold tracking-[-0.01em]">{loc.name}</div>
            <div className="mt-0.5 font-mono text-[11px] text-ink-faint">
              {loc.offset}&nbsp;&nbsp;
              <LocalTime timeZone={loc.tz} />
            </div>
          </li>
        ))}
        <li className="col-span-2 font-mono text-[10px] tracking-[0.1em] text-ink-faint uppercase">
          {globalPresence.partner.label} · {globalPresence.partner.detail}
        </li>
      </ul>
    </div>
  )
}
