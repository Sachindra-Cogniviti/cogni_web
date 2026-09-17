import Image from "next/image"

import logoFile from "@/public/cogniviti-labs-logo.webp"

import { Container, Roll } from "@/components/primitives"
import { Stagger } from "@/components/stagger"
import { footer, site } from "@/content/site"

/**
 * Site footer.
 *
 * The logo is brightened here. The mark is designed for a light ground and
 * goes muddy against #161310, so a filter lifts it rather than shipping a
 * second colourway of the asset.
 *
 * The copyright year is computed at build time. On a static export that means
 * it is fixed until the next deploy - acceptable for a site that is rebuilt on
 * every content change, and better than a client component that would exist
 * only to render four digits.
 *
 * The page ends on the wordmark: the company name in capitals, stretched
 * from the left edge of the page to the right in the brand streak, fading
 * into the ground at the very bottom (`.wordmark` in globals.css). It is
 * SVG rather than HTML text because only SVG can set a line to an exact
 * width: `textLength` spreads the letters to fill the drawing whatever the
 * font's own measure comes to, and the drawing scales with the page, so the
 * mark is edge to edge at every width with the letters themselves undistorted
 * (`lengthAdjust="spacing"` moves the letters apart, never stretches them).
 * The drawing's box is the height of the capitals, with the baseline on its
 * bottom edge, which is the footer's. It is decoration - the footer already
 * names the company in the logo and the copyright line - so it is aria-hidden.
 * It only fades in.
 */
export function SiteFooter() {
  return (
    // Stacked above whatever precedes it: the careers page ends with a pile
    // of photographs that hang below their section, and the footer covers
    // their bottoms so they read as tucked under it.
    <footer className="relative z-10 overflow-hidden border-t border-night-fg/12 bg-night pt-[72px] text-night-muted">
      <Container>
        {/* Two columns on a phone, with the logo across both; the four
            link columns then pair up rather than stacking into one long
            list. From md up the columns fit side by side as before. */}
        <Stagger
          from="left"
          step={0.12}
          className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-[repeat(auto-fit,minmax(180px,1fr))] md:gap-10"
        >
          <div data-stagger className="col-span-2 md:col-span-1">
            {/* The footer mark leads home like the one in the nav, and is a
                plain anchor for the reason given there. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- smooth-anchors owns "/#" links */}
            <a
              href="/#top"
              aria-label={site.logo.alt}
              className="inline-block"
            >
              <Image
                src={logoFile}
                alt={site.logo.alt}
                sizes="160px"
                className="block h-[26px] w-auto brightness-135 saturate-90"
              />
            </a>
            <p className="mt-4 max-w-[28ch] text-[13px] leading-[1.6]">
              {footer.tagline}
            </p>
            <a
              href={`mailto:${site.email}`}
              className="mt-5 inline-block font-mono text-[12px] text-oxblood-lift transition-colors duration-[var(--roll-duration)] ease-[var(--roll-ease)] hover:text-night-fg"
            >
              <Roll>{site.email}</Roll>
            </a>
          </div>

          {footer.columns.map((column) => (
            <div key={column.label} data-stagger>
              <div className="mb-[18px] font-mono text-[10.5px] tracking-[0.2em] text-ink-faint uppercase">
                {column.label}
              </div>
              <div className="flex flex-col gap-[11px] text-[13.5px]">
                {column.links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-night-muted transition-colors duration-[var(--roll-duration)] ease-[var(--roll-ease)] hover:text-night-fg"
                  >
                    <Roll>{link.label}</Roll>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </Stagger>

        {/* Where we are, and where else to find us. Its own row above the
            legal rule rather than a line in the logo column, so the markets
            read as a fact about the company and not as an address. */}
        <div className="mt-14 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3 font-mono text-[12px]">
          <span>{footer.offices}</span>
          <span className="flex gap-6">
            {footer.social
              .filter((network) => network.href)
              .map((network) => (
                <a
                  key={network.label}
                  href={network.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${network.label} (opens in a new tab)`}
                  className="text-night-muted transition-colors duration-[var(--roll-duration)] ease-[var(--roll-ease)] hover:text-night-fg"
                >
                  <Roll>{network.label}&nbsp;↗</Roll>
                </a>
              ))}
          </span>
        </div>

        <div className="mt-6 flex flex-wrap justify-between gap-4 border-t border-night-fg/12 pt-6 pb-10 font-mono text-[11.5px] text-ink-faint">
          <span>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </span>
          <span className="flex gap-5">
            {footer.legal.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-ink-faint transition-colors duration-[var(--roll-duration)] ease-[var(--roll-ease)] hover:text-night-fg"
              >
                <Roll>{link.label}</Roll>
              </a>
            ))}
          </span>
        </div>

      </Container>

      <svg
        aria-hidden="true"
        data-reveal="0"
        data-flow="fade"
        viewBox="0 0 1000 82"
        className="wordmark mt-8 block h-auto w-full select-none"
      >
        <defs>
          <linearGradient id="wordmark-fill" x1="0" y1="0" x2="1" y2="0.6">
            <stop offset="0" stopColor="#4a0b18" />
            <stop offset="0.3" stopColor="#8e2030" />
            <stop offset="0.55" stopColor="#c93b52" />
            <stop offset="0.7" stopColor="#e0526b" />
            <stop offset="0.9" stopColor="#7e1a2c" />
            <stop offset="1" stopColor="#3e0912" />
          </linearGradient>
        </defs>
        {/* Cap height of the face is about 0.73em, so at 112 units the
            capitals stand 82 tall on a baseline at the bottom of the box. */}
        <text
          x="0"
          y="82"
          textLength="1000"
          lengthAdjust="spacing"
          fill="url(#wordmark-fill)"
          fontSize="112"
          fontWeight="600"
        >
          {footer.wordmark}
        </text>
      </svg>
    </footer>
  )
}
