"use client"

import * as React from "react"

import { Corners, Roll } from "@/components/primitives"
import { experiencePage } from "@/content/pages"
import { products, type Product } from "@/content/site"

type Demo = (typeof experiencePage.demos)[number]

/**
 * The demonstration surface: pick a product, run it in a framed viewport.
 *
 * Three things about this are deliberate.
 *
 * **The frame is a fixed pixel width, scaled down to fit.** Setting the
 * iframe to the container width and calling it "desktop" would be a lie - the
 * demo would lay itself out for whatever space is left beside the switcher,
 * which is not a desktop. Instead the iframe is always rendered at its true
 * viewport width and a transform scales the whole thing to fit the column, so
 * what you see is the layout that width actually produces. `zoom` would be
 * simpler and is wrong: it changes the CSS pixel size inside the frame, so
 * the demo's own media queries would see the scaled width.
 *
 * **Nothing loads until it is chosen.** Six iframes mounted at once is six
 * applications booting, and five of them are behind a tab nobody opened. Only
 * the selected demo is in the DOM, and `key` on the iframe is what makes the
 * restart button work - changing the key is a remount, which is the only way
 * to reset a cross-origin frame we cannot reach into.
 *
 * **A product with no demoUrl is a first-class state, not an error.** Every
 * demo is null today (see content/pages.ts). The panel that replaces the
 * frame is the page working as intended, and each demo goes live by setting
 * one string.
 */
export function ExperienceCentre() {
  const [slug, setSlug] = React.useState(products[0].slug)
  const [viewport, setViewport] = React.useState<string>(
    experiencePage.viewports[0].id
  )
  const [reloadKey, setReloadKey] = React.useState(0)

  const product = products.find((p) => p.slug === slug) as Product
  const demo = experiencePage.demos.find((d) => d.slug === slug) as Demo
  const view =
    experiencePage.viewports.find((v) => v.id === viewport) ??
    experiencePage.viewports[0]

  // Changing product resets the frame rather than carrying the previous
  // demo's session into the next one.
  const choose = (next: string) => {
    setSlug(next)
    setReloadKey((k) => k + 1)
  }

  return (
    <div className="grid gap-[clamp(28px,3vw,48px)] lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)]">
      {/* The switcher. A list of radio inputs rather than buttons: choosing a
          product is choosing one of a set, which is what a radio group is,
          and it gives arrow-key navigation for free. The input itself is
          visually hidden but focusable - `sr-only` with a peer selector, so
          the focus ring lands on the label the reader can actually see. */}
      <fieldset className="lg:sticky lg:top-[92px] lg:self-start">
        <legend className="font-mono text-[10.5px] tracking-[0.18em] text-ink-faint uppercase">
          {experiencePage.chooseLabel}
        </legend>
        <div className="mt-5 flex flex-col border-t border-rule">
          {products.map((p) => {
            const selected = p.slug === slug
            const pending = !experiencePage.demos.find((d) => d.slug === p.slug)
              ?.demoUrl
            return (
              <label
                key={p.slug}
                className={`group relative flex cursor-pointer items-center gap-3 border-b border-rule py-[13px] pr-2 pl-4 transition-colors duration-[var(--roll-duration)] ease-[var(--roll-ease)] has-[:focus-visible]:bg-paper-soft ${
                  selected ? "bg-paper-tint" : "hover:bg-paper-soft"
                }`}
              >
                <input
                  type="radio"
                  name="experience-product"
                  value={p.slug}
                  checked={selected}
                  onChange={() => choose(p.slug)}
                  className="sr-only"
                />
                {/* The current marker: an oxblood rule down the left edge,
                    the same device the page uses elsewhere for "this one". */}
                <span
                  aria-hidden="true"
                  className={`absolute top-0 left-0 h-full w-[2px] transition-colors duration-[var(--roll-duration)] ease-[var(--roll-ease)] ${
                    selected ? "bg-oxblood" : "bg-transparent"
                  }`}
                />
                <span
                  aria-hidden="true"
                  className={`font-mono text-[11px] ${selected ? "text-oxblood" : "text-ink-ghost"}`}
                >
                  {p.glyph}
                </span>
                <span
                  className={`text-[14px] leading-[1.3] font-medium ${selected ? "text-ink" : "text-ink-soft"}`}
                >
                  {p.name}
                </span>
                {pending && (
                  <span
                    className="ml-auto shrink-0 font-mono text-[9.5px] tracking-[0.12em] text-ink-ghost uppercase"
                    // Not aria-hidden: "this one has no public demo" is
                    // information, not decoration.
                  >
                    Soon
                  </span>
                )}
              </label>
            )
          })}
        </div>
      </fieldset>

      <div>
        {/* The frame's own chrome: what is open, at what width, and the two
            controls that act on it. */}
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4 border-b border-rule pb-4">
          <div>
            <div className="font-mono text-[10.5px] tracking-[0.16em] text-oxblood uppercase">
              {product.kicker}
            </div>
            <h2 className="mt-1.5 text-[20px] leading-[1.2] font-semibold tracking-[-0.02em]">
              {product.name}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <fieldset className="flex items-center gap-1">
              <legend className="sr-only">
                {experiencePage.viewportLabel}
              </legend>
              {experiencePage.viewports.map((v) => {
                const selected = v.id === viewport
                return (
                  <label
                    key={v.id}
                    className={`cursor-pointer px-3 py-[7px] font-mono text-[10.5px] tracking-[0.12em] uppercase transition-colors duration-[var(--roll-duration)] ease-[var(--roll-ease)] has-[:focus-visible]:outline has-[:focus-visible]:outline-oxblood ${
                      selected
                        ? "bg-ink text-paper"
                        : "text-ink-faint hover:text-ink"
                    }`}
                  >
                    <input
                      type="radio"
                      name="experience-viewport"
                      value={v.id}
                      checked={selected}
                      onChange={() => setViewport(v.id)}
                      className="sr-only"
                    />
                    {v.label}
                  </label>
                )
              })}
            </fieldset>

            {demo.demoUrl && (
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setReloadKey((k) => k + 1)}
                  className="control-motion cursor-pointer font-mono text-[10.5px] tracking-[0.12em] text-ink-faint uppercase hover:text-oxblood"
                >
                  <Roll>{experiencePage.reloadLabel}</Roll>
                </button>
                <a
                  href={demo.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="control-motion font-mono text-[10.5px] tracking-[0.12em] text-ink-faint uppercase hover:text-oxblood"
                >
                  <Roll>{experiencePage.openLabel}</Roll>
                </a>
              </div>
            )}
          </div>
        </div>

        {demo.demoUrl ? (
          <DemoFrame
            key={`${slug}-${reloadKey}`}
            url={demo.demoUrl}
            title={`${product.name} demonstration`}
            width={view.width}
          />
        ) : (
          <PendingPanel product={product} />
        )}

        <div className="mt-6 border-l-2 border-oxblood py-1 pl-5">
          <div className="font-mono text-[10.5px] tracking-[0.18em] text-ink-faint uppercase">
            {experiencePage.scenarioLabel}
          </div>
          <p className="mt-2 max-w-[62ch] text-[15px] leading-[1.6] text-pretty text-ink-soft">
            {demo.scenario}
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * The framed demo.
 *
 * At a fixed width the iframe is rendered at that width and scaled to fit the
 * available column, so the demo lays itself out for a real viewport. The
 * wrapper's height is the scaled height, or the column would keep the
 * unscaled box's footprint and leave a hole under the frame.
 *
 * `sandbox` grants only what a demo genuinely needs. `allow-same-origin` is
 * among them - without it the demo cannot use its own storage or cookies and
 * most applications simply fail to boot - and it is safe here precisely
 * because these are third-party origins: same-origin applies to the demo's
 * own origin, not ours. `allow-top-navigation` is NOT granted, so a framed
 * page cannot navigate the tab away from this site.
 */
function DemoFrame({
  url,
  title,
  width,
}: {
  url: string
  title: string
  width: number | null
}) {
  const hostRef = React.useRef<HTMLDivElement>(null)
  const [scale, setScale] = React.useState(1)

  // The frame is 16:10 at desktop and taller on the narrow viewports, which
  // is roughly the shape of the devices they stand for.
  const height = width === null ? 720 : width < 600 ? 860 : 1000

  React.useEffect(() => {
    if (width === null) return
    const host = hostRef.current
    if (!host) return
    const observer = new ResizeObserver(([entry]) => {
      const available = entry.contentRect.width
      setScale(Math.min(1, available / width))
    })
    observer.observe(host)
    return () => observer.disconnect()
  }, [width])

  return (
    <div
      ref={hostRef}
      className="relative mt-6 border border-rule bg-paper-alt"
    >
      <Corners />
      {width === null ? (
        <iframe
          src={url}
          title={title}
          loading="lazy"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
          referrerPolicy="strict-origin-when-cross-origin"
          className="block h-[clamp(480px,62vh,760px)] w-full border-0 bg-paper"
        />
      ) : (
        <div
          className="mx-auto overflow-hidden"
          style={{ height: height * scale, width: width * scale }}
        >
          <iframe
            src={url}
            title={title}
            loading="lazy"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
            referrerPolicy="strict-origin-when-cross-origin"
            style={{
              width,
              height,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
            className="block border-0 bg-paper"
          />
        </div>
      )}
    </div>
  )
}

/**
 * Shown for a product with no public sandbox. It stands in the frame's place
 * at the frame's size, so choosing a product with no demo does not collapse
 * the layout and make the page look broken.
 */
function PendingPanel({ product }: { product: Product }) {
  return (
    <div className="relative mt-6 flex min-h-[clamp(420px,52vh,620px)] flex-col items-center justify-center border border-rule bg-paper-alt px-8 py-16 text-center">
      <Corners />
      {/* The same hatching the site uses elsewhere for "something belongs
          here and is not here yet". */}
      <div
        aria-hidden="true"
        className="placeholder-hatch-lg absolute inset-0 opacity-40"
      />
      <div className="relative">
        <div className="font-mono text-[10.5px] tracking-[0.18em] text-ink-faint uppercase">
          {experiencePage.pending.label}
        </div>
        <h3 className="mt-5 max-w-[20ch] text-[clamp(21px,2.2vw,28px)] leading-[1.15] font-semibold tracking-[-0.02em] text-balance">
          {product.name}
        </h3>
        <p className="mx-auto mt-4 max-w-[46ch] text-[15px] leading-[1.65] text-pretty text-ink-soft">
          {experiencePage.pending.body}
        </p>
        <a
          href={experiencePage.pending.cta.href}
          className="control-motion mt-8 inline-block border-b border-oxblood/35 pb-[3px] text-[15px] font-medium text-oxblood hover:border-ink/35 hover:text-ink"
        >
          <Roll>{experiencePage.pending.cta.label}</Roll>
        </a>
      </div>
    </div>
  )
}
