import Image from "next/image"

import { Container } from "@/components/primitives"
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
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-night-fg/12 bg-night pt-[72px] pb-10 text-night-muted">
      <Container>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-10">
          <div>
            <Image
              src={site.logo.src}
              alt={site.logo.alt}
              width={site.logo.width}
              height={site.logo.height}
              className="block h-[26px] w-auto brightness-135 saturate-90"
            />
            <p className="mt-4 max-w-[28ch] text-[13px] leading-[1.6]">
              {footer.tagline}
            </p>
            <div className="mt-5 font-mono text-[12px]">{footer.offices}</div>
            <a
              href={`mailto:${site.email}`}
              className="mt-2 inline-block font-mono text-[12px] text-oxblood-lift transition-colors hover:text-night-fg"
            >
              {site.email}
            </a>
          </div>

          {footer.columns.map((column) => (
            <div key={column.label}>
              <div className="mb-[18px] font-mono text-[10.5px] tracking-[0.2em] text-ink-faint uppercase">
                {column.label}
              </div>
              <div className="flex flex-col gap-[11px] text-[13.5px]">
                {column.links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-night-muted transition-colors hover:text-night-fg"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-wrap justify-between gap-4 border-t border-night-fg/12 pt-6 font-mono text-[11.5px] text-ink-faint">
          <span>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </span>
          <span className="flex gap-5">
            {footer.legal.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-ink-faint transition-colors hover:text-night-fg"
              >
                {link.label}
              </a>
            ))}
          </span>
        </div>
      </Container>
    </footer>
  )
}
