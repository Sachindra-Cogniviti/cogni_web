import { Container } from "@/components/primitives"
import { trustedBy } from "@/content/site"

/**
 * Client logo wall.
 *
 * The six cells are hatched placeholders awaiting real logos. They are drawn
 * as obvious empty slots on purpose - a plausible-looking grey box reads as a
 * finished design and hides the fact that an asset is still outstanding.
 */
export function TrustedBy() {
  return (
    <section aria-label="Trusted by" className="border-b border-rule py-[72px]">
      <Container>
        <div
          data-reveal="0"
          className="flex flex-wrap items-center gap-x-[clamp(24px,5vw,72px)] gap-y-8"
        >
          <div className="min-w-[220px]">
            <div className="font-mono text-[11px] tracking-[0.2em] text-ink-faint uppercase">
              {trustedBy.kicker}
            </div>
            <p className="mt-[10px] max-w-[34ch] text-[14.5px] leading-[1.55] text-ink-soft">
              {trustedBy.body}
            </p>
          </div>

          <div className="grid min-w-[280px] flex-1 grid-cols-[repeat(auto-fit,minmax(130px,1fr))] gap-3">
            {Array.from({ length: trustedBy.logoCount }).map((_, index) => (
              <div
                key={index}
                className="placeholder-hatch flex h-[56px] items-center justify-center border border-rule font-mono text-[10px] tracking-[0.14em] text-ink-ghost uppercase"
              >
                {trustedBy.logoPlaceholder}
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}
