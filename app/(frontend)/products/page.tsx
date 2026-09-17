import type { Metadata } from "next"

import { pageMetadata } from "@/lib/metadata"

import { PageClose, PageHeader, PageShell } from "@/components/page-shell"
import { ProductDesktop } from "@/components/product-desktop"
import { productsPage } from "@/content/pages"

export const metadata: Metadata = pageMetadata({
  title: "Products",
  description: productsPage.header.body,
  path: "/products/",
})

/**
 * /products
 *
 * The same product desktop the homepage shows, under this page's own
 * masthead. It used to be a register instead - six hairline cells, each
 * naming a product and the problem it belongs to - on the argument that the
 * desktop was the homepage's trick and repeating it here would say nothing
 * new. The counter-argument won: a reader who lands here from a search
 * result never saw the homepage, and the desktop is the one presentation
 * that lets them open each product and see what it is, rather than read a
 * paragraph about it. The individual product pages are reached from the
 * windows' own links.
 *
 * The desktop is a dark block, so it carries `data-nav-dark` for the fixed
 * bar's sake (see the sub-page note in CLAUDE.md); on the homepage the same
 * block is recognised by its id in the rail.
 */
export default function ProductsIndex() {
  return (
    <PageShell>
      <PageHeader content={productsPage.header}>
        <p
          data-reveal="240"
          data-flow="left"
          className="mt-8 font-mono text-[11px] tracking-[0.18em] text-ink-faint uppercase"
        >
          {productsPage.count} products · one foundation
        </p>
      </PageHeader>

      <ProductDesktop />

      <PageClose content={productsPage.close} />
    </PageShell>
  )
}
