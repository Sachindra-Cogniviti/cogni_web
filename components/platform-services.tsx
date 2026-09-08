import Image, { type StaticImageData } from "next/image"

import {
  Container,
  Kicker,
  QuietLink,
  sectionPadding,
} from "@/components/primitives"
import { Stagger } from "@/components/stagger"
import { services } from "@/content/site"

import coupa from "@/public/logos/platforms/coupa.png"
import gep from "@/public/logos/platforms/gep.png"
import ivalua from "@/public/logos/platforms/ivalua.png"
import onestream from "@/public/logos/platforms/onestream.png"

/** Platform logo files, keyed by the `logo` id used in content. */
const logos: Record<string, StaticImageData> = { coupa, gep, ivalua, onestream }

/**
 * Platform services: the five delivery stages, then the platform and
 * integration experience lists.
 *
 * The stage grid uses uniform cells with hairlines on every edge. An earlier
 * version padded cells asymmetrically, which looked fine on one row and fell
 * apart the moment the grid wrapped - rows no longer lined up with each other.
 * Uniform padding plus borders on all four sides survives any wrap.
 *
 * The #platforms anchor lives on the experience block rather than the section,
 * because that is what the nav link is pointing at.
 *
 * The stage cells, the logo tiles and the chips each rise in a few tens of
 * milliseconds apart (components/stagger.tsx) instead of arriving as blocks.
 *
 * Platform experience is the one list that carries logos, and it gets a
 * different register from the integration chips: a row of logo tiles in a
 * hairline grid, the marks in their own colours at heights set per logo in
 * content. Items without a logo fall back to a text chip, so more logos can
 * be dropped in one at a time.
 */
export function PlatformServices() {
  return (
    <section id="services" className={`border-b border-rule ${sectionPadding}`}>
      <Container>
        <div data-reveal="0">
          <Kicker>{services.kicker}</Kicker>
          <div className="mt-5 flex flex-wrap items-end justify-between gap-8">
            <h2 className="max-w-[17ch] text-[clamp(32px,3.8vw,54px)] leading-[1.05] font-semibold tracking-[-0.03em] text-balance">
              {services.heading}
            </h2>
            <p className="max-w-[42ch] text-[15.5px] leading-[1.6] text-pretty text-ink-soft">
              {services.body}
            </p>
          </div>
        </div>

        <Stagger
          step={0.07}
          className="mt-16 grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] border-t border-l border-t-rule-strong border-l-rule"
        >
          {services.stages.map((stage) => (
            <div
              key={stage.num}
              data-stagger
              className="group relative border-r border-b border-rule px-6 pt-7 pb-8 transition-colors duration-[250ms] hover:bg-paper-soft"
            >
              {/* Short oxblood tick riding the top rule, marking each cell. On
                  hover a second line grows from it across the whole cell: a
                  transform, not a width, so it costs nothing to animate. */}
              <div className="absolute top-[-1px] left-0 h-[2px] w-9 bg-oxblood" />
              <div className="absolute top-[-1px] left-0 h-[2px] w-full origin-left scale-x-0 bg-oxblood transition-transform duration-300 ease-[cubic-bezier(.23,1,.32,1)] group-hover:scale-x-100 motion-reduce:transition-none" />
              <div className="font-mono text-[11px] text-oxblood">
                {stage.num}
              </div>
              <div className="mt-[14px] text-[17px] leading-[1.25] font-semibold tracking-[-0.01em]">
                {stage.title}
              </div>
              <p className="mt-[10px] text-[13.5px] leading-[1.6] text-pretty text-ink-muted">
                {stage.body}
              </p>
            </div>
          ))}
        </Stagger>

        <div id="platforms" className="mt-16">
          {services.experience.map((group, index) => {
            const hasLogos = group.items.some((item) => "logo" in item)
            return (
              <div
                key={group.label}
                data-reveal={160 + index * 40}
                className={`grid gap-x-[clamp(24px,4vw,64px)] gap-y-4 pt-6 lg:grid-cols-[minmax(180px,240px)_1fr] ${
                  index === 0 ? "border-t border-rule-strong" : "mt-8 border-t border-rule"
                }`}
              >
                <div className="font-mono text-[11px] tracking-[0.2em] text-ink-faint uppercase lg:pt-[2px]">
                  {group.label}
                </div>

                {hasLogos ? (
                  <Stagger
                    as="ul"
                    step={0.05}
                    className="m-0 grid list-none grid-cols-2 gap-px border border-rule bg-rule sm:grid-cols-4"
                  >
                    {group.items.map((item) => (
                      <li
                        key={item.name}
                        data-stagger
                        className="flex h-[88px] items-center justify-center bg-paper px-5"
                      >
                        {"logo" in item && logos[item.logo] ? (
                          <Image
                            src={logos[item.logo]}
                            alt={item.name}
                            className="w-auto max-w-full"
                            style={{ height: item.height }}
                          />
                        ) : (
                          <span className="text-[15px] font-semibold">{item.name}</span>
                        )}
                      </li>
                    ))}
                  </Stagger>
                ) : (
                  <Stagger step={0.04} className="flex flex-wrap gap-[10px]">
                    {group.items.map((item) => (
                      <span
                        key={item.name}
                        data-stagger
                        className="rounded-[2px] border border-rule-strong px-[18px] py-[9px] text-[14.5px] font-medium"
                      >
                        {item.name}
                      </span>
                    ))}
                  </Stagger>
                )}
              </div>
            )
          })}
        </div>

        <div data-reveal="200" className="mt-12">
          <QuietLink href={services.cta.href}>
            {services.cta.label}&nbsp;&nbsp;→
          </QuietLink>
        </div>
      </Container>
    </section>
  )
}
