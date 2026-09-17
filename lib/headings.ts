/**
 * The headings of a rich-text body, with the ids the page gives them.
 *
 * Two things read a body's headings and have to agree on every id: the
 * article renderer (components/rich-text.tsx), which writes `id` on each
 * heading element, and the table of contents (components/article-nav.tsx),
 * which links to them. Both go through here, so an id is decided once from
 * the heading's text and the order it appears in, and a repeated heading
 * gets a numbered suffix rather than a duplicate anchor.
 *
 * No Payload import: the table of contents is a client component and takes
 * these as plain props.
 */

export type Heading = {
  id: string
  text: string
  /** 2 or 3. Fourth-level headings are too fine to navigate by. */
  level: 2 | 3
}

type Node = {
  type?: string
  tag?: string
  text?: string
  children?: Node[]
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

/** The words of a node and everything under it. */
export function textOf(node: Node): string {
  if (typeof node.text === "string") return node.text
  return (node.children ?? []).map(textOf).join("")
}

/**
 * Hands out ids in document order, numbering a repeat. One instance per
 * render: the renderer and the table of contents each make their own and
 * walk the same tree, so they arrive at the same ids.
 */
export function headingIds() {
  const seen = new Map<string, number>()
  return (text: string): string => {
    const base = slugify(text) || "section"
    const n = seen.get(base) ?? 0
    seen.set(base, n + 1)
    return n === 0 ? base : `${base}-${n + 1}`
  }
}

/** Every h2 and h3 in the body, in order, with the ids the page renders. */
export function headingsOf(
  body: { root?: Node } | null | undefined
): Heading[] {
  const out: Heading[] = []
  const id = headingIds()
  const walk = (node: Node) => {
    if (node.type === "heading") {
      const text = textOf(node).trim()
      // Every heading takes an id, including h4, so the numbering matches
      // the renderer's; only h2 and h3 are listed.
      const next = id(text)
      if (node.tag === "h2" || node.tag === "h3") {
        out.push({ id: next, text, level: node.tag === "h2" ? 2 : 3 })
      }
      return
    }
    node.children?.forEach(walk)
  }
  if (body?.root) walk(body.root)
  return out
}
