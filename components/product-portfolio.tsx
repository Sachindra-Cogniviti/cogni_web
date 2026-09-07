"use client"

import * as React from "react"

import { Container, Kicker, sectionPadding } from "@/components/primitives"
import { productPortfolio, products } from "@/content/site"

/**
 * Dark product portfolio: a selectable list on the left, a spec panel on the
 * right.
 *
 * Rows respond to both hover and click. Hover alone would leave the section
 * unusable on touch; click alone would feel inert on a pointer.
 *
 * The panel does not snap between products. On selection it drops to zero
 * opacity with a 5px settle and eases back over 260ms, which acknowledges the
 * state change instead of the content simply being different. The dim is
 * released on the next frame rather than after a fixed delay, so dragging the
 * pointer down the list does not queue up a backlog of transitions.
 */
export function ProductPortfolio() {
  const [selected, setSelected] = React.useState(0)
  const [dimmed, setDimmed] = React.useState(false)
  const frame = React.useRef<number | null>(null)

  React.useEffect(() => {
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current)
    }
  }, [])

  const select = (index: number) => {
    if (index === selected) return

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    if (prefersReduced) {
      setSelected(index)
      return
    }

    if (frame.current !== null) cancelAnimationFrame(frame.current)
    setSelected(index)
    setDimmed(true)
    frame.current = requestAnimationFrame(() => setDimmed(false))
  }

  const active = products[selected]

  return (
    <section
      id="products"
      className={`bg-night text-night-fg ${sectionPadding}`}
    >
      <Container>
        <div
          data-reveal="0"
          className="flex flex-wrap items-end justify-between gap-8"
        >
          <div>
            <Kicker tone="dark">{productPortfolio.kicker}</Kicker>
            <h2 className="mt-5 max-w-[18ch] text-[clamp(32px,3.8vw,54px)] leading-[1.05] font-semibold tracking-[-0.03em] text-balance">
              {productPortfolio.heading}
            </h2>
          </div>
          <p className="max-w-[40ch] text-[15.5px] leading-[1.6] text-pretty text-night-muted">
            {productPortfolio.body}
          </p>
        </div>

        <div
          data-reveal="120"
          className="mt-14 grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] border border-night-fg/15"
        >
          <div className="flex flex-col border-r border-night-fg/15">
            {products.map((product, index) => (
              <button
                key={product.name}
                type="button"
                onClick={() => select(index)}
                onMouseEnter={() => select(index)}
                aria-pressed={index === selected}
                className={`flex cursor-pointer items-center gap-4 border-b border-night-fg/10 px-6 py-5 text-left transition-colors duration-200 hover:bg-night-fg/5 ${
                  index === selected ? "bg-night-fg/[0.07]" : "bg-transparent"
                }`}
              >
                <span className="w-[22px] font-mono text-[11px] text-oxblood-lift">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="flex-1 text-[16.5px] font-medium tracking-[-0.01em] text-night-fg">
                  {product.name}
                </span>
                <span
                  className={`font-mono text-[12px] ${
                    index === selected
                      ? "text-oxblood-lift"
                      : "text-night-fg/25"
                  }`}
                >
                  →
                </span>
              </button>
            ))}

            <div className="min-h-[24px] flex-1" />

            <div className="flex flex-wrap gap-5 px-6 py-5 text-[14px] font-medium">
              {productPortfolio.links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className={`border-b pb-[2px] transition-colors hover:text-oxblood-lift ${
                    link.emphasis === "primary"
                      ? "border-night-fg/35 text-night-fg"
                      : "border-night-fg/20 text-night-muted"
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div
            className="flex min-h-[420px] flex-col gap-6 bg-night-fg/[0.03] p-[clamp(28px,3.5vw,48px)] transition-[opacity,transform] duration-[260ms] ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:transition-none"
            style={{
              opacity: dimmed ? 0 : 1,
              transform: dimmed ? "translateY(5px)" : "none",
            }}
          >
            <div className="font-mono text-[11px] tracking-[0.2em] text-ink-faint uppercase">
              {active.kicker}
            </div>
            <h3 className="max-w-[20ch] text-[clamp(24px,2.6vw,36px)] leading-[1.12] font-semibold tracking-[-0.025em] text-balance text-night-fg">
              {active.tag}
            </h3>
            <p className="max-w-[52ch] text-[15.5px] leading-[1.65] text-pretty text-night-muted">
              {active.desc}
            </p>

            {/* A miniature readout, not a screenshot. It gives the product a
                concrete shape without pretending to be real UI. */}
            <div className="max-w-[520px] overflow-hidden rounded-[3px] border border-night-fg/15 bg-night-panel">
              <div className="flex items-center gap-2 border-b border-night-fg/10 px-[14px] py-[10px]">
                <span className="size-[7px] rounded-full bg-night-fg/25" />
                <span className="size-[7px] rounded-full bg-night-fg/25" />
                <span className="ml-2 font-mono text-[10.5px] tracking-[0.1em] text-ink-faint uppercase">
                  {active.name}
                </span>
              </div>
              {active.rows.map(([key, value]) => (
                <div
                  key={key}
                  className="flex justify-between gap-4 border-b border-night-fg/[0.06] px-[14px] py-[11px] font-mono text-[11.5px]"
                >
                  <span className="text-night-muted">{key}</span>
                  <span className="text-night-value">{value}</span>
                </div>
              ))}
            </div>

            <div className="mt-auto">
              <a
                href="#contact"
                className="border-b border-oxblood-lift/40 pb-[3px] text-[14.5px] font-medium text-oxblood-lift transition-colors hover:text-night-fg"
              >
                {active.cta}&nbsp;&nbsp;→
              </a>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
