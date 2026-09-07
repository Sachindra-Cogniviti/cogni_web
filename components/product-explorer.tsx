"use client"

import * as React from "react"

import { Container, Kicker, sectionPadding } from "@/components/primitives"
import { productExplorer, products } from "@/content/site"

/**
 * Product explorer - a launcher window over a red radial glow, with a floating
 * dock beneath it.
 *
 * This sits directly below the portfolio and deliberately shows the same six
 * products a second time in a different register: the portfolio is a
 * catalogue, this is the suite as software. Both read from the same list in
 * content/site.ts, so they cannot drift apart.
 *
 * The search bar and the ↵ hint are chrome, not controls. They set the
 * launcher context; wiring them to a real search would mean inventing a
 * feature the design does not specify.
 */
export function ProductExplorer() {
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
      id="explorer"
      className={`relative overflow-hidden bg-night-deep ${sectionPadding}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(60%_55%_at_50%_42%,rgb(142_32_48/0.45),rgb(142_32_48/0)_70%),radial-gradient(40%_35%_at_22%_75%,rgb(74_11_24/0.5),rgb(74_11_24/0)_65%)]" />

      <Container className="relative max-w-[1080px]">
        <div data-reveal="0" className="text-center">
          <Kicker tone="dark">{productExplorer.kicker}</Kicker>
          <h2 className="mt-5 text-[clamp(28px,3.2vw,44px)] leading-[1.08] font-semibold tracking-[-0.03em] text-balance text-night-fg">
            {productExplorer.heading}
          </h2>
        </div>

        <div
          data-reveal="120"
          className="mt-[52px] overflow-hidden rounded-[14px] border border-night-fg/15 bg-night-deep/70 shadow-[0_0_0_1px_rgb(0_0_0/0.4),0_30px_80px_rgb(0_0_0/0.55)] backdrop-blur-[18px]"
        >
          <div className="flex items-center gap-[14px] border-b border-night-fg/10 px-5 py-4">
            <span className="flex size-[30px] items-center justify-center rounded-full bg-night-fg/8 text-[14px] text-night-muted">
              ←
            </span>
            <span className="flex-1 text-[16px] text-night-fg/45">
              {productExplorer.searchPlaceholder}
            </span>
            <span className="rounded-[6px] border border-night-fg/15 px-[10px] py-[5px] font-mono text-[10.5px] tracking-[0.12em] text-ink-faint uppercase">
              {productExplorer.scopeLabel}
            </span>
          </div>

          <div className="grid grid-cols-[minmax(220px,5fr)_minmax(260px,7fr)]">
            <div className="border-r border-night-fg/10 px-2 py-[10px]">
              <div className="px-3 py-2 font-mono text-[10px] tracking-[0.16em] text-ink-faint uppercase">
                {productExplorer.listLabel}
              </div>
              {products.map((product, index) => (
                <button
                  key={product.name}
                  type="button"
                  onClick={() => select(index)}
                  onMouseEnter={() => select(index)}
                  aria-pressed={index === selected}
                  className={`flex w-full cursor-pointer items-center gap-3 rounded-[8px] px-3 py-[10px] text-left transition-colors duration-150 hover:bg-night-fg/[0.07] ${
                    index === selected ? "bg-oxblood-lift/15" : "bg-transparent"
                  }`}
                >
                  <span className="flex size-[26px] items-center justify-center rounded-[7px] bg-[linear-gradient(135deg,#8E2030,#C93B52)] font-mono text-[11px] font-semibold text-paper">
                    {product.glyph}
                  </span>
                  <span className="flex-1 truncate text-[14.5px] text-night-fg">
                    {product.name}
                  </span>
                </button>
              ))}
            </div>

            <div
              className="flex min-h-[340px] flex-col px-[26px] pt-[26px] pb-[22px] transition-opacity duration-[220ms] motion-reduce:transition-none"
              style={{ opacity: dimmed ? 0 : 1 }}
            >
              <div className="flex items-center gap-4">
                <span className="flex size-[52px] items-center justify-center rounded-[13px] bg-[linear-gradient(135deg,#8E2030,#C93B52)] font-mono text-[19px] font-semibold text-paper shadow-[0_8px_26px_rgb(142_32_48/0.5)]">
                  {active.glyph}
                </span>
                <div>
                  <div className="text-[19px] font-semibold tracking-[-0.01em] text-night-fg">
                    {active.name}
                  </div>
                  <div className="mt-1 font-mono text-[11px] tracking-[0.14em] text-oxblood-lift uppercase">
                    {active.kicker}
                  </div>
                </div>
              </div>

              <p className="mt-[18px] max-w-[52ch] text-[14.5px] leading-[1.65] text-pretty text-night-muted">
                {active.desc}
              </p>

              <div className="mt-[22px] border-t border-night-fg/10">
                <div className="pt-[14px] pb-1 font-mono text-[10px] tracking-[0.16em] text-ink-faint uppercase">
                  {productExplorer.detailLabel}
                </div>
                {active.rows.map(([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between gap-4 border-b border-night-fg/[0.06] py-[9px] font-mono text-[11.5px]"
                  >
                    <span className="text-ink-faint">{key}</span>
                    <span className="text-right text-night-value">{value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-auto pt-[18px]">
                <a
                  href="#contact"
                  className="text-[13.5px] font-medium text-oxblood-lift transition-colors hover:text-night-fg"
                >
                  {active.cta}&nbsp;&nbsp;→
                </a>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 border-t border-night-fg/10 px-5 py-3 text-[13px] text-night-muted">
            <span className="size-5 rounded-[6px] bg-[linear-gradient(135deg,#8E2030,#C93B52)]" />
            <span className="flex-1">{productExplorer.footerLabel}</span>
            <span className="flex items-center gap-2">
              {productExplorer.footerAction}
              <span className="rounded-[5px] border border-night-fg/20 px-[7px] py-[3px] font-mono text-[10px] text-ink-faint">
                ↵
              </span>
            </span>
          </div>
        </div>

        <div data-reveal="200" className="mt-[34px] flex justify-center">
          <div className="relative flex gap-[10px] rounded-[18px] border border-night-fg/12 bg-night-deep/75 p-3 shadow-[0_18px_50px_rgb(0_0_0/0.5)] backdrop-blur-[16px]">
            {/* Tooltip for the active dock icon. Sits above the dock and never
                intercepts the pointer, so moving between icons is continuous. */}
            <div className="pointer-events-none absolute inset-x-0 top-[-38px] flex justify-center">
              <span className="rounded-[8px] bg-night-fg px-[13px] py-[6px] text-[12.5px] font-semibold whitespace-nowrap text-ink shadow-[0_6px_20px_rgb(0_0_0/0.4)]">
                {active.name}
              </span>
            </div>

            {products.map((product, index) => (
              <button
                key={product.name}
                type="button"
                onClick={() => select(index)}
                onMouseEnter={() => select(index)}
                aria-label={product.name}
                aria-pressed={index === selected}
                className={`flex size-[54px] cursor-pointer items-center justify-center rounded-[14px] border font-mono text-[15px] font-semibold text-paper transition-[transform,background,border-color] duration-[180ms] ease-[cubic-bezier(.34,1.56,.64,1)] hover:-translate-y-1 hover:scale-[1.08] motion-reduce:transform-none motion-reduce:transition-none ${
                  index === selected
                    ? "-translate-y-1 scale-[1.08] border-[#e0526b]/60 bg-[linear-gradient(135deg,#8E2030,#C93B52)]"
                    : "border-night-fg/12 bg-night-fg/[0.06]"
                }`}
              >
                {product.glyph}
              </button>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}
