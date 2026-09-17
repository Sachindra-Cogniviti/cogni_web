import Image from "next/image"
import type {
  DefaultNodeTypes,
  SerializedBlockNode,
  SerializedLinkNode,
  SerializedRelationshipNode,
  SerializedUploadNode,
} from "@payloadcms/richtext-lexical"
import {
  RichText,
  type JSXConverters,
  type JSXConvertersFunction,
} from "@payloadcms/richtext-lexical/react"

import { Corners } from "@/components/primitives"
import { imageSource } from "@/lib/cms"
import { headingIds, textOf } from "@/lib/headings"
import { cn } from "@/lib/utils"
import type { ClientStory, CodeBlock, Media, Post } from "@/payload-types"

type RichTextData = Parameters<typeof RichText>[0]["data"]
type NodeTypes = DefaultNodeTypes | SerializedBlockNode<CodeBlock>

/**
 * A Lexical rich-text field, rendered with the site's article typography
 * (`.article` in globals.css).
 *
 * Payload's converter walks the tree; the converters below replace its
 * output wherever the default markup is not what this page wants:
 *
 *   heading       gets an id, so the table of contents can link to it. The
 *                 ids come from lib/headings.ts, which is also what the
 *                 table of contents reads, so the two cannot disagree.
 *   upload        a figure with next/image and the caption written on the
 *                 node, rather than a bare <picture> with every rendition.
 *   table         the page's hairline table, without the inline borders
 *                 the default writes.
 *   listitem      a checklist item as a drawn box rather than a disabled
 *                 <input>, which reads as a broken form control.
 *   link          internal links resolve to the page for the document.
 *   relationship  a card for the related post or story.
 *   blocks.code   the code block, on the night ground with its language.
 *
 * Server component: the JSON arrives with the document and nothing here
 * needs the browser.
 */
export function Article({
  body,
  className,
  dropCap = false,
}: {
  body: unknown
  className?: string
  /** Open on a drop cap: the first paragraph's first letter set large. */
  dropCap?: boolean
}) {
  // A fresh id sequence per article, so a repeated heading is numbered
  // within this body and two articles on one page cannot collide.
  const nextId = headingIds()

  const converters: JSXConvertersFunction<NodeTypes> = ({
    defaultConverters,
  }) => ({
    ...defaultConverters,

    heading: ({ node, nodesToJSX }) => {
      const Tag = node.tag as "h2" | "h3" | "h4"
      const id = nextId(textOf(node as never).trim())
      return <Tag id={id}>{nodesToJSX({ nodes: node.children })}</Tag>
    },

    upload: ({ node }) => <Figure node={node as SerializedUploadNode} />,

    table: ({ node, nodesToJSX }) => (
      <div className="article-table">
        <table>
          <tbody>{nodesToJSX({ nodes: node.children })}</tbody>
        </table>
      </div>
    ),
    tablerow: ({ node, nodesToJSX }) => (
      <tr>{nodesToJSX({ nodes: node.children })}</tr>
    ),
    tablecell: ({ node, nodesToJSX }) => {
      const Cell = node.headerState > 0 ? "th" : "td"
      return (
        <Cell
          colSpan={node.colSpan > 1 ? node.colSpan : undefined}
          rowSpan={node.rowSpan > 1 ? node.rowSpan : undefined}
          scope={node.headerState > 0 ? "col" : undefined}
        >
          {nodesToJSX({ nodes: node.children })}
        </Cell>
      )
    },

    listitem: ({ node, nodesToJSX, parent, ...rest }) => {
      const checklist = "listType" in parent && parent.listType === "check"
      if (!checklist) {
        const fallback = defaultConverters.listitem
        return typeof fallback === "function"
          ? fallback({ node, nodesToJSX, parent, ...rest })
          : null
      }
      const nested = node.children.some((child) => child.type === "list")
      return (
        <li
          className={cn("check", nested && "nested")}
          data-checked={node.checked ? "true" : "false"}
          value={node.value}
        >
          <span aria-hidden="true" className="check-box" />
          <span className="sr-only">
            {node.checked ? "Done: " : "To do: "}
          </span>
          <span className="check-text">
            {nodesToJSX({ nodes: node.children })}
          </span>
        </li>
      )
    },

    link: ({ node, nodesToJSX }) => {
      const fields = (node as SerializedLinkNode).fields
      const href =
        fields.linkType === "internal"
          ? hrefOf(fields.doc?.relationTo, fields.doc?.value)
          : (fields.url ?? "#")
      const external = /^https?:\/\//.test(href)
      return (
        <a
          href={href}
          target={fields.newTab ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
        >
          {nodesToJSX({ nodes: node.children })}
        </a>
      )
    },

    relationship: ({ node }) => (
      <Related node={node as SerializedRelationshipNode} />
    ),

    blocks: {
      code: ({ node }) => <Code block={node.fields} />,
    },
  })

  return (
    <div className={cn("article", dropCap && "article-drop", className)}>
      <RichText
        data={body as RichTextData}
        converters={converters as unknown as JSXConverters}
      />
    </div>
  )
}

/** Where an internal link or a relationship points. */
function hrefOf(
  relationTo: string | undefined,
  value: unknown
): string {
  const doc = value && typeof value === "object" ? (value as { slug?: string }) : null
  if (!doc?.slug) return "#"
  if (relationTo === "posts") return `/blog/${doc.slug}/`
  if (relationTo === "client-stories") return `/work/${doc.slug}/`
  return "#"
}

/**
 * An inline image: the upload at its inline rendition, in a hairline frame,
 * with the caption from the node (or the upload's credit) under it.
 */
function Figure({ node }: { node: SerializedUploadNode }) {
  const media = node.value as Media | number | null | undefined
  if (!media || typeof media !== "object") return null
  const image = imageSource(media, "inline")
  if (!image) return null

  const fields = (node.fields ?? {}) as { caption?: string | null }
  const caption = fields.caption?.trim() || null

  return (
    <figure className="article-figure">
      <div className="article-figure-frame">
        <Image
          src={image.src}
          alt={media.alt ?? ""}
          width={image.width}
          height={image.height}
          sizes="(min-width: 1024px) 720px, 100vw"
        />
      </div>
      {(caption || media.credit) && (
        <figcaption>
          {caption && <span>{caption}</span>}
          {media.credit && <span className="credit">{media.credit}</span>}
        </figcaption>
      )}
    </figure>
  )
}

/** A related post or story, as a card the reader can leave for. */
function Related({ node }: { node: SerializedRelationshipNode }) {
  const value = node.value
  if (!value || typeof value !== "object") return null
  const href = hrefOf(node.relationTo, value)
  if (href === "#") return null

  if (node.relationTo === "posts") {
    const post = value as Post
    return (
      <a href={href} className="article-related">
        <Corners />
        <span className="article-related-kicker">Related reading</span>
        <span className="article-related-title">{post.title}</span>
        <span className="article-related-body">{post.excerpt}</span>
      </a>
    )
  }

  const story = value as ClientStory
  return (
    <a href={href} className="article-related">
      <Corners />
      <span className="article-related-kicker">
        Client story · {story.client}
      </span>
      <span className="article-related-title">{story.title}</span>
      <span className="article-related-body">{story.excerpt}</span>
    </a>
  )
}

const LANGUAGE_LABEL: Record<NonNullable<CodeBlock["language"]>, string> = {
  plain: "Text",
  json: "JSON",
  sql: "SQL",
  xml: "XML",
  yaml: "YAML",
  shell: "Shell",
  typescript: "TypeScript",
  javascript: "JavaScript",
  python: "Python",
  java: "Java",
  abap: "ABAP",
}

function Code({ block }: { block: CodeBlock }) {
  const label = LANGUAGE_LABEL[block.language ?? "plain"]
  return (
    <div className="article-code">
      <div className="article-code-bar">
        <span>{label}</span>
      </div>
      <pre>
        <code>{block.code}</code>
      </pre>
    </div>
  )
}
