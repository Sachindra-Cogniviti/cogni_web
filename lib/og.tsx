import { readFile } from "node:fs/promises"
import path from "node:path"

import type { ImageResponse } from "next/og"

import { publicSiteUrl } from "@/lib/deployment"

/**
 * The share card, drawn for the Open Graph image routes
 * (`opengraph-image.tsx` beside the pages that have one).
 *
 * One card for the whole site so a link to any page is recognisably ours
 * in a feed: the page's paper and the two frame rules, a mono kicker in
 * oxblood, the title in the display face, and the wordmark on a rule at
 * the foot with the page's own line - author and date, client and
 * platform. A post's cover, when it has one, takes the right third; a
 * story's headline figure sits there instead, in the serif italic the
 * metrics are set in on the page.
 *
 * Satori, not a browser, renders this: every element with more than one
 * child is a flex container, and there is no CSS beyond what is inline.
 *
 * The faces are the page's own three, read from assets/fonts on first use
 * and kept for the life of the process. They are checked in rather than
 * fetched: the renderer has no fallback face of its own and fails outright
 * with none loaded, and Google Fonts answers a server-side fetch with
 * whichever format it likes, so a card that depended on that fetch would
 * be a card that sometimes did not exist. The files are the latin subsets
 * next/font downloads for the page, in WOFF, which the renderer reads.
 */

export const OG_SIZE = { width: 1200, height: 630 }

const PAPER = "#faf8f5"
const PAPER_ALT = "#f3efe7"
const INK = "#17140f"
const INK_MUTED = "#7a7266"
const INK_FAINT = "#8a8172"
const RULE = "#e8e3d9"
const RULE_STRONG = "#d8d2c4"
const OXBLOOD = "#8e2030"

type Font = NonNullable<
  ConstructorParameters<typeof ImageResponse>[1]
>["fonts"] extends (infer F)[] | undefined
  ? F
  : never

const FACES: {
  family: string
  file: string
  weight: 500 | 600
  style: "normal" | "italic"
}[] = [
  { family: "Archivo", file: "archivo-600.woff", weight: 600, style: "normal" },
  {
    family: "IBM Plex Mono",
    file: "ibm-plex-mono-500.woff",
    weight: 500,
    style: "normal",
  },
  {
    family: "Newsreader",
    file: "newsreader-italic-500.woff",
    weight: 500,
    style: "italic",
  },
]

let fontsPromise: Promise<Font[]> | null = null

/** The card's three faces. Read once; the path is literal so it is traced into the deployment. */
export async function ogFonts(): Promise<Font[]> {
  if (!fontsPromise) {
    fontsPromise = Promise.all(
      FACES.map(async (face) => {
        const buffer = await readFile(
          path.join(process.cwd(), "assets/fonts", face.file)
        )
        return {
          name: face.family,
          data: buffer.buffer.slice(
            buffer.byteOffset,
            buffer.byteOffset + buffer.byteLength
          ) as ArrayBuffer,
          weight: face.weight,
          style: face.style,
        }
      })
    )
  }
  return fontsPromise
}

/**
 * An upload as a data URL the renderer can draw, or undefined if it cannot
 * be fetched. Media is served by this app (or the bucket's domain), so a
 * relative URL is resolved against this deployment.
 */
export async function ogImageData(src: string | null | undefined) {
  if (!src) return undefined
  try {
    const absolute = /^https?:\/\//.test(src) ? src : `${publicSiteUrl()}${src}`
    const response = await fetch(absolute)
    if (!response.ok) return undefined
    const type = response.headers.get("content-type") ?? "image/jpeg"
    const buffer = Buffer.from(await response.arrayBuffer())
    return `data:${type};base64,${buffer.toString("base64")}`
  } catch {
    return undefined
  }
}

export function ogCard({
  kicker,
  title,
  meta,
  image,
  figure,
}: {
  kicker: string
  title: string
  /** The line beside the wordmark: author and date, client and platform. */
  meta?: string
  /** A photograph for the right third, as a data URL. */
  image?: string
  /** A headline figure for the right third, when there is no photograph. */
  figure?: { value: string; label: string }
}) {
  const panel = Boolean(image || figure)
  const long = title.length > 64
  const titleSize = panel ? (long ? 44 : 52) : long ? 54 : 66

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: PAPER,
        color: INK,
        fontFamily: "Archivo",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 48,
          width: 1,
          background: RULE,
        }}
      />
      {!panel && (
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            right: 48,
            width: 1,
            background: RULE,
          }}
        />
      )}

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: panel ? "60px 56px 52px 84px" : "60px 84px 52px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontFamily: "IBM Plex Mono",
            fontSize: 19,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: OXBLOOD,
          }}
        >
          <div style={{ width: 9, height: 9, background: OXBLOOD }} />
          <div style={{ display: "flex" }}>{kicker}</div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: titleSize,
            fontWeight: 600,
            lineHeight: 1.06,
            letterSpacing: -2,
            paddingRight: panel ? 0 : 40,
            textWrap: "balance",
          }}
        >
          {title}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: 32,
            borderTop: `1px solid ${RULE_STRONG}`,
            paddingTop: 22,
          }}
        >
          <div
            style={{
              display: "flex",
              fontFamily: "IBM Plex Mono",
              fontSize: 17,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: INK,
            }}
          >
            Cogniviti Labs
          </div>
          {meta && (
            <div
              style={{
                display: "flex",
                fontSize: 19,
                color: INK_MUTED,
                textAlign: "right",
              }}
            >
              {meta}
            </div>
          )}
        </div>
      </div>

      {image && (
        <div
          style={{
            display: "flex",
            width: 400,
            height: "100%",
            borderLeft: `1px solid ${RULE}`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- the renderer draws a plain image */}
          <img
            src={image}
            alt=""
            style={{ width: 400, height: 630, objectFit: "cover" }}
          />
        </div>
      )}

      {!image && figure && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            width: 400,
            height: "100%",
            padding: "0 64px",
            background: PAPER_ALT,
            borderLeft: `1px solid ${RULE}`,
          }}
        >
          <div
            style={{
              display: "flex",
              fontFamily: "Newsreader",
              fontStyle: "italic",
              fontSize: figure.value.length > 4 ? 88 : 120,
              lineHeight: 0.95,
              letterSpacing: -5,
              color: OXBLOOD,
            }}
          >
            {figure.value}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 22,
              fontSize: 20,
              lineHeight: 1.4,
              color: INK_FAINT,
            }}
          >
            {figure.label}
          </div>
        </div>
      )}
    </div>
  )
}
