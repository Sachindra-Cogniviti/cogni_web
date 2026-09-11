import {
  Container,
  outlineButton,
  sectionPadding,
  solidButton,
} from "@/components/primitives"
import { FlowRule, Parallax, Spin } from "@/components/scroll-motion"
import { Stagger } from "@/components/stagger"
import { training } from "@/content/site"

/**
 * Coupa training. Sits on the alternate paper band so it separates from the
 * services section above without needing another rule.
 *
 * The partner badge is an outlined oxblood pill with a rotated square rather
 * than an icon - it reads as a credential mark, and it borrows the same
 * diamond used for the location pins in the global presence section. The
 * diamond turns once every fourteen seconds, slowly enough to be noticed
 * only on a second look.
 *
 * Copy and panel drift in opposite directions as the section crosses the
 * viewport, which is what gives the flat band some depth.
 */
export function CoupaTraining() {
  return (
    <section
      id="training"
      className={`relative bg-paper-alt ${sectionPadding}`}
    >
      <Container className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] items-center gap-[clamp(40px,5vw,80px)]">
        <Parallax y={22}>
          <div>
            <div
              data-reveal="0"
              data-flow="left"
              className="inline-flex items-center gap-[10px] rounded-[2px] border border-oxblood px-4 py-2 font-mono text-[10.5px] font-medium tracking-[0.18em] text-oxblood uppercase"
            >
              <Spin className="block size-[7px] bg-oxblood" />
              {training.badge}
            </div>

            <h2
              data-reveal="60"
              data-flow="left"
              className="mt-[26px] max-w-[18ch] text-[clamp(30px,3.4vw,48px)] leading-[1.08] font-semibold tracking-[-0.03em] text-balance"
            >
              {training.heading}
            </h2>

            {training.body.map((paragraph, index) => (
              <p
                key={paragraph}
                data-reveal={120 + index * 60}
                data-flow="left"
                className={`max-w-[52ch] text-[16px] leading-[1.65] text-pretty text-ink-soft ${
                  index === 0 ? "mt-[22px]" : "mt-[14px]"
                }`}
              >
                {paragraph}
              </p>
            ))}

            <div
              data-reveal="240"
              data-flow="left"
              className="mt-[30px] flex flex-wrap gap-[14px]"
            >
              {training.actions.map((action) => (
                <a
                  key={action.label}
                  href={action.href}
                  className={`${
                    action.variant === "solid" ? solidButton : outlineButton
                  } px-[26px] text-[14.5px] ${
                    action.variant === "solid" ? "py-[14px]" : "py-[13px]"
                  }`}
                >
                  {action.label}
                </a>
              ))}
            </div>
          </div>
        </Parallax>

        <Parallax y={-18}>
          <div
            data-reveal="120"
            data-flow="right"
            className="overflow-clip rounded-[3px] border border-rule-strong bg-paper"
          >
            <div className="border-b border-rule px-[22px] py-4 font-mono text-[10.5px] tracking-[0.18em] text-ink-faint uppercase">
              {training.panelLabel}
            </div>
            <Stagger from="fade" step={0.1} className="py-2">
              {training.offerings.map((offering, index) => (
                <div
                  key={offering.tag}
                  data-stagger
                  className={`flex justify-between gap-4 px-[22px] py-4 text-[14.5px] ${
                    index < training.offerings.length - 1
                      ? "border-b border-rule-faint"
                      : ""
                  }`}
                >
                  <span className="font-medium">{offering.title}</span>
                  <span className="font-mono text-[11px] text-ink-faint">
                    {offering.tag}
                  </span>
                </div>
              ))}
            </Stagger>
          </div>
        </Parallax>
      </Container>
      <FlowRule />
    </section>
  )
}
