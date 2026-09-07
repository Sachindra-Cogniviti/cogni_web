"use client"

import * as React from "react"
import Image from "next/image"

import { nav, site } from "@/content/site"

/**
 * Fixed page navigation.
 *
 * Below 1120px the seven links no longer fit beside the logo and the CTA, and
 * left to wrap they broke into a ragged second row. Instead they collapse into
 * a Menu toggle backed by a stacked panel.
 *
 * The breakpoint is measured rather than expressed as a CSS media query
 * because the same value drives the toggle's own presence, and matchMedia
 * keeps the two in step. It starts closed on the server, so first paint is the
 * full bar; the effect corrects it before the user can interact.
 */
export function SiteNav() {
  const [compact, setCompact] = React.useState(false)
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const query = window.matchMedia("(max-width: 1119px)")

    const sync = () => {
      setCompact(query.matches)
      if (!query.matches) setOpen(false)
    }

    sync()
    query.addEventListener("change", sync)
    return () => query.removeEventListener("change", sync)
  }, [])

  return (
    <nav className="fixed inset-x-0 top-0 z-100 border-b border-rule bg-paper/85 backdrop-blur-[14px]">
      <div className="mx-auto flex h-[68px] max-w-[1280px] items-center justify-between gap-6 px-[clamp(20px,4vw,48px)]">
        <a href="#top" className="flex items-center text-ink">
          <Image
            src={site.logo.src}
            alt={site.logo.alt}
            width={site.logo.width}
            height={site.logo.height}
            priority
            className="block h-[30px] w-auto"
          />
        </a>

        {!compact && (
          <div className="flex items-center gap-[clamp(16px,1.8vw,28px)] text-[13.5px] font-medium whitespace-nowrap">
            {nav.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-ink-soft transition-colors hover:text-oxblood"
              >
                {link.label}
              </a>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3">
          {compact && (
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              className="cursor-pointer rounded-[2px] border border-edge px-[18px] py-[9px] font-sans text-[13.5px] font-medium text-ink transition-colors duration-200 hover:border-oxblood hover:text-oxblood"
            >
              {open ? "Close" : "Menu"}
            </button>
          )}
          <a
            href={nav.cta.href}
            className="rounded-[2px] bg-ink px-5 py-[10px] text-[13.5px] font-medium whitespace-nowrap text-paper transition-colors duration-200 hover:bg-oxblood"
          >
            {nav.cta.label}
          </a>
        </div>
      </div>

      {compact && open && (
        <div className="flex flex-col border-t border-rule bg-paper px-[clamp(20px,4vw,48px)] pt-2 pb-[18px]">
          {nav.links.map((link, index) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`py-[13px] text-base font-medium text-ink transition-colors hover:text-oxblood ${
                index < nav.links.length - 1 ? "border-b border-rule-faint" : ""
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  )
}
