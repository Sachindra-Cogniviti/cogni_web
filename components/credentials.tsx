import { Container, Kicker } from "@/components/primitives"
import { PresenceMap } from "@/components/presence-map"
import { Parallax } from "@/components/scroll-motion"
import { Stagger } from "@/components/stagger"
import { StatValue } from "@/components/stat-value"
import { credentials, globalPresence } from "@/content/site"

/**
 * Experience and credentials, then global presence.
 *
 * These share one <section> because they share the #company anchor and read as
 * one argument: here is the scale of the practice, and here is where it
 * operates.
 *
 * The stats are a hard 2x2 quadrant, not an auto-fitting grid. Four figures
 * across a wide viewport wrapped 3+1 and left a dead cell; forcing two columns
 * keeps the block square at every width and lets the numerals run to 96px,
 * which is what gives the section its weight. The numerals count up once on
 * first view (components/stat-value.tsx); the markup carries the final value.
 * Afterwards the two columns drift at different rates with the scroll, and
 * the map below lags the page a little, so the block keeps some depth.
 */
export function Credentials() {
  return (
    <section id="company" className="pt-[clamp(88px,10vw,140px)]">
      <Container>
        <Kicker data-reveal="0" data-flow="left">
          {credentials.kicker}
        </Kicker>
        <h2
          data-reveal="60"
          data-flow="left"
          className="mt-5 max-w-[18ch] text-[clamp(32px,3.8vw,54px)] leading-[1.05] font-semibold tracking-[-0.03em] text-balance"
        >
          {credentials.heading}
        </h2>

        <Stagger
          from="fade"
          step={0.12}
          className="mt-14 grid grid-cols-2 border-t border-l border-rule-strong"
        >
          {credentials.stats.map((stat, index) => (
            <div
              key={stat.label}
              data-stagger
              className="border-r border-b border-rule-strong px-[clamp(20px,3vw,40px)] py-[clamp(28px,4vw,52px)]"
            >
              <Parallax y={index % 2 ? -8 : 14}>
                <div className="text-[clamp(52px,6.5vw,96px)] leading-none font-semibold tracking-[-0.045em]">
                  <StatValue value={stat.value} index={index} />
                  {stat.suffix && (
                    <span className="text-oxblood">{stat.suffix}</span>
                  )}
                </div>
                <p className="mt-4 max-w-[30ch] text-[14.5px] leading-[1.5] text-ink-soft">
                  {stat.label}
                </p>
              </Parallax>
            </div>
          ))}
        </Stagger>
      </Container>

      <Container className="pt-[clamp(88px,10vw,140px)]">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <Kicker data-reveal="0" data-flow="left">
              {globalPresence.kicker}
            </Kicker>
            <h2
              data-reveal="60"
              data-flow="left"
              className="mt-5 text-[clamp(32px,3.8vw,54px)] leading-[1.05] font-semibold tracking-[-0.03em] text-balance"
            >
              {globalPresence.heading}
            </h2>
          </div>
          <p
            data-reveal="120"
            data-flow="right"
            className="max-w-[44ch] text-[15.5px] leading-[1.6] text-pretty text-ink-soft"
          >
            {globalPresence.body}
          </p>
        </div>

        {/* The map. Offices pinned by coordinate on a dotted map cropped to
            the footprint, arcs radiating from the Singapore hub, each pin
            carrying its live clock. See components/presence-map.tsx. */}
        <div data-reveal="180" className="mt-[72px]">
          <Parallax y={-16}>
            <PresenceMap />
          </Parallax>
        </div>
      </Container>
    </section>
  )
}
