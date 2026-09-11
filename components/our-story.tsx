import { Container, Kicker, QuietLink } from "@/components/primitives"
import { Parallax } from "@/components/scroll-motion"
import { Stagger } from "@/components/stagger"
import { story } from "@/content/site"

/**
 * Our story: how a platform-implementation practice ended up building an
 * Agentic Operating System. Opens the #company block.
 *
 * Drawn as a spine - one hairline running down the column with each stage
 * hanging off a node - rather than as the hairline cell grid the delivery
 * stages use in components/platform-services.tsx. The two look superficially
 * alike (both numbered, both four or five steps) and mean opposite things. The
 * delivery stages are peers: five services, any of which a client might buy on
 * its own, so equal cells are the honest drawing. These are a causal chain
 * where each step exists because of the one before it, ending in a problem
 * statement that the closing block answers. A row of matching boxes would
 * flatten that into a menu.
 *
 * So the connector is the point, and the numbers are load-bearing rather than
 * decorative: 04 does not stand alone.
 *
 * The rule is drawn on the list, not per item, so it cannot fall out of step
 * when an item's height changes; it stops short at the bottom (the last node
 * is `relative` with its own background) so the line does not run past the
 * final stage into the closing block.
 */
export function OurStory() {
  return (
    <section id="company" className="pt-[clamp(88px,10vw,140px)]">
      <Container>
        <Parallax y={16}>
          <div>
            <Kicker data-reveal="0" data-flow="left">
              {story.kicker}
            </Kicker>
            <div className="mt-5 flex flex-wrap items-end justify-between gap-8">
              <h2
                data-reveal="60"
                data-flow="left"
                className="max-w-[18ch] text-[clamp(32px,3.8vw,54px)] leading-[1.05] font-semibold tracking-[-0.03em] text-balance"
              >
                {story.heading}
              </h2>
              <p
                data-reveal="120"
                data-flow="left"
                className="max-w-[44ch] text-[15.5px] leading-[1.6] text-pretty text-ink-soft"
              >
                {story.body}
              </p>
            </div>
          </div>
        </Parallax>

        {/* The spine. `border-l` on the list gives one continuous rule for the
            whole chain; each node sits on it with a paper background so the
            rule appears to pass behind rather than through. */}
        <Stagger
          as="ol"
          from="left"
          step={0.14}
          className="m-0 mt-16 list-none border-l border-rule-strong pl-0"
        >
          {story.stages.map((stage, index) => (
            <li
              key={stage.num}
              data-stagger
              className={`relative pl-[clamp(24px,4vw,56px)] ${
                index === story.stages.length - 1
                  ? "pb-0"
                  : "pb-[clamp(36px,4vw,64px)]"
              }`}
            >
              {/* The node. Sits astride the rule, painted with the page
                  ground so the line reads as passing behind it. */}
              <span
                aria-hidden="true"
                className="absolute top-[6px] left-0 flex size-[11px] -translate-x-1/2 items-center justify-center rounded-full bg-paper"
              >
                <span className="size-[7px] rounded-full bg-oxblood" />
              </span>

              {/* Two tracks from lg up: the step's name and claim on the left,
                  the explanation on the right. One column would leave half the
                  page empty beside a 62ch measure, and widening the measure to
                  fill it would make the prose harder to read, not easier. It
                  is also the rhythm the rest of the page already uses -
                  heading left, body right. */}
              <div className="grid gap-x-[clamp(24px,4vw,64px)] gap-y-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
                <div>
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="font-mono text-[11px] text-oxblood">
                      {stage.num}
                    </span>
                    <span className="font-mono text-[11px] tracking-[0.2em] text-ink-faint uppercase">
                      {stage.label}
                    </span>
                  </div>
                  <h3 className="mt-[10px] max-w-[26ch] text-[clamp(19px,1.9vw,25px)] leading-[1.22] font-semibold tracking-[-0.02em] text-balance">
                    {stage.title}
                  </h3>
                </div>
                <p className="max-w-[56ch] text-[14.5px] leading-[1.7] text-pretty text-ink-muted lg:pt-[2px]">
                  {stage.body}
                </p>
              </div>
            </li>
          ))}
        </Stagger>

        {/* Where the chain arrives. Set on the alternate band with a heavier
            left rule so it reads as the conclusion of the spine rather than a
            fifth stage - it is the answer to 04, not the step after it. */}
        <div
          data-reveal="200"
          data-flow="left"
          className="mt-[clamp(40px,5vw,64px)] border-l-2 border-oxblood bg-paper-alt px-[clamp(24px,4vw,56px)] py-[clamp(28px,3.5vw,44px)]"
        >
          <div className="font-mono text-[11px] tracking-[0.2em] text-ink-faint uppercase">
            {story.close.label}
          </div>
          <p className="mt-4 max-w-[68ch] text-[clamp(16px,1.5vw,19px)] leading-[1.6] text-pretty text-ink">
            {story.close.body}
          </p>
          <div className="mt-7">
            <QuietLink href={story.close.cta.href}>
              {story.close.cta.label}&nbsp;&nbsp;→
            </QuietLink>
          </div>
        </div>
      </Container>
    </section>
  )
}
