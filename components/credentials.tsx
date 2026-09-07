import { Container, Kicker } from "@/components/primitives"
import { LocalTime } from "@/components/local-time"
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
 * which is what gives the section its weight.
 */
export function Credentials() {
  return (
    <section id="company" className="pt-[clamp(88px,10vw,140px)]">
      <Container>
        <Kicker data-reveal="0">{credentials.kicker}</Kicker>
        <h2
          data-reveal="60"
          className="mt-5 max-w-[18ch] text-[clamp(32px,3.8vw,54px)] leading-[1.05] font-semibold tracking-[-0.03em] text-balance"
        >
          {credentials.heading}
        </h2>

        <div
          data-reveal="140"
          className="mt-14 grid grid-cols-2 border-t border-l border-rule-strong"
        >
          {credentials.stats.map((stat) => (
            <div
              key={stat.label}
              className="border-r border-b border-rule-strong px-[clamp(20px,3vw,40px)] py-[clamp(28px,4vw,52px)]"
            >
              <div className="text-[clamp(52px,6.5vw,96px)] leading-none font-semibold tracking-[-0.045em]">
                {stat.value}
                {stat.suffix && (
                  <span className="text-oxblood">{stat.suffix}</span>
                )}
              </div>
              <p className="mt-4 max-w-[30ch] text-[14.5px] leading-[1.5] text-ink-soft">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </Container>

      <Container className="pt-[clamp(88px,10vw,140px)]">
        <div
          data-reveal="0"
          className="flex flex-wrap items-end justify-between gap-8"
        >
          <div>
            <Kicker>{globalPresence.kicker}</Kicker>
            <h2 className="mt-5 text-[clamp(32px,3.8vw,54px)] leading-[1.05] font-semibold tracking-[-0.03em] text-balance">
              {globalPresence.heading}
            </h2>
          </div>
          <p className="max-w-[44ch] text-[15.5px] leading-[1.6] text-pretty text-ink-soft">
            {globalPresence.body}
          </p>
        </div>

        {/* The meridian. Offices are pinned along a single horizontal rule in
            longitude order, labels alternating above and below so adjacent
            entries never collide. It is a time line, not a map - which is why
            it can carry live clocks without pretending to be geography.

            Pins are placed by percentage, so below roughly 880px the labels
            start colliding and running out of the frame. Rather than stack the
            offices vertically - which would destroy the single-line idea the
            section is built on - the track keeps its proportions and scrolls
            horizontally. Above 880px this is inert and the composition is
            exactly as designed. */}
        <div
          data-reveal="120"
          className="mt-[72px] overflow-x-auto border-y border-rule bg-paper-soft"
        >
          <div className="relative h-[260px] min-w-[880px]">
            <div className="absolute inset-x-0 top-1/2 h-px bg-edge" />

            {globalPresence.locations.map((location) => (
              <div key={location.name}>
                <div
                  className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${location.left}%` }}
                >
                  <div className="size-[9px] rotate-45 bg-oxblood" />
                </div>
                <div
                  className="absolute -translate-x-2"
                  style={{
                    left: `${location.left}%`,
                    ...(location.above
                      ? { bottom: "50%", marginBottom: "22px" }
                      : { top: "50%", marginTop: "22px" }),
                  }}
                >
                  <div className="text-[15px] font-semibold tracking-[-0.01em]">
                    {location.name}
                  </div>
                  <div className="mt-1 font-mono text-[11.5px] text-ink-faint">
                    {location.offset}&nbsp;&nbsp;
                    <LocalTime timeZone={location.tz} />
                  </div>
                </div>
              </div>
            ))}

            {/* Partner markets: hollow pin, sitting lower than the owned
              offices so the hierarchy is unmistakable. */}
            <div
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${globalPresence.partner.left}%` }}
            >
              <div className="size-[9px] rotate-45 border-[1.5px] border-ink-ghost bg-paper-soft" />
            </div>
            {/* Cleared to 72px rather than the design's 56px. At 56px this
              caption sat on top of Indonesia's clock line, which reads as
              broken rather than dense - Indonesia's own two-line block already
              runs to 58px below the rule. */}
            <div
              className="absolute top-1/2 mt-[72px] -translate-x-2"
              style={{ left: `${globalPresence.partner.left}%` }}
            >
              <div className="font-mono text-[10.5px] tracking-[0.1em] whitespace-nowrap text-ink-ghost uppercase">
                {globalPresence.partner.label}
                <br />
                {globalPresence.partner.detail}
              </div>
            </div>
          </div>
        </div>

        <div
          data-reveal="160"
          className="mt-14 flex flex-wrap items-center gap-[clamp(24px,4vw,56px)]"
        >
          <div className="min-w-[160px] font-mono text-[11px] tracking-[0.2em] text-ink-faint uppercase">
            {credentials.certificationsLabel}
          </div>
          <div className="flex flex-1 flex-wrap gap-[14px]">
            {Array.from({ length: credentials.certificationCount }).map(
              (_, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-[2px] border border-rule px-[18px] py-3"
                >
                  <div className="placeholder-hatch size-8 rounded-full" />
                  <span className="font-mono text-[10.5px] tracking-[0.1em] text-ink-faint uppercase">
                    {credentials.certificationPlaceholder}
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </Container>
    </section>
  )
}
