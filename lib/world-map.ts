import DottedMap from "dotted-map"

/**
 * Build-time dot map.
 *
 * dotted-map carries the world's country outlines (a few hundred KB) and
 * rasterises them into a dot grid. Running that in the browser, as the
 * Aceternity component does, would ship the dataset to every visitor. This
 * runs inside a server component instead, so on a static export it executes
 * once at `next build` and the page only carries the result: one compact
 * SVG path of dots and the grid coordinates of each pin.
 */

export type MapRegion = {
  lat: { min: number; max: number }
  lng: { min: number; max: number }
}

export type MapPinInput = { id: string; lat: number; lng: number }

export type BuiltWorldMap = {
  /** One path of zero-length, round-capped segments: one dot per point. */
  d: string
  /** Grid units. Use as the SVG viewBox and for label percentages. */
  width: number
  height: number
  /** Pin id to grid coordinate, snapped to the nearest map dot. */
  points: Record<string, { x: number; y: number }>
}

const r2 = (n: number) => Math.round(n * 100) / 100

export function buildWorldMap({
  region,
  height,
  pins,
}: {
  region: MapRegion
  height: number
  pins: readonly MapPinInput[]
}): BuiltWorldMap {
  // Equirectangular keeps the crop at a banner-like aspect. Mercator, the
  // library default, stretches the high latitudes and made the same region
  // nearly square.
  const map = new DottedMap({
    height,
    grid: "diagonal",
    region,
    projection: { name: "equirectangular" },
  })

  // One path, encoded row by row with relative moves. Every dot is a
  // zero-length segment that the round line cap turns into a circle. The
  // grid is regular, so after the first dot in a row each further dot is a
  // short "m<dx> 0h0", which keeps ten thousand dots to a few tens of KB.
  const rows = new Map<number, number[]>()
  for (const p of map.getPoints()) {
    const y = r2(p.y)
    const row = rows.get(y)
    if (row) row.push(p.x)
    else rows.set(y, [p.x])
  }
  let d = ""
  for (const [y, xs] of [...rows.entries()].sort((a, b) => a[0] - b[0])) {
    xs.sort((a, b) => a - b)
    let prev = 0
    xs.forEach((x, i) => {
      d += i === 0 ? `M${r2(x)} ${y}h0` : `m${r2(x - prev)} 0h0`
      prev = x
    })
  }

  const points: BuiltWorldMap["points"] = {}
  for (const pin of pins) {
    // Undefined when the pin falls outside the cropped region; the caller
    // then simply has nothing to draw for it.
    const g = map.getPin({ lat: pin.lat, lng: pin.lng })
    if (g) points[pin.id] = { x: r2(g.x), y: r2(g.y) }
  }

  return { d, width: map.image.width, height: map.image.height, points }
}
