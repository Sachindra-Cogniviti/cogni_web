"use client"

import * as React from "react"

/* The UTM link builder.
 *
 * The problem this solves is not assembling a query string - anyone can do
 * that - it is spelling. `linkedin` and `LinkedIn` are two different rows
 * in every analytics tool forever, so the source and medium come from a
 * fixed list of the ways this company actually shares links, and only the
 * campaign (and the partner's name, where the channel is a partner site)
 * is typed - lowercased and hyphenated as it is typed, so what goes out is
 * always in the house spelling. The vocabulary here matches the UTM
 * guidance in the pre-launch checklist; extend the list, don't improvise
 * in the campaign box.
 *
 * Links are built on the production origin regardless of where the admin
 * is running: a UTM link exists to be pasted somewhere public, and a
 * preview URL in a LinkedIn post would be worse than no tag. The trailing
 * slash before the query is the same rule as every internal link.
 */

export type UtmPage = { label: string; path: string; group: string }

type Preset = {
  key: string
  label: string
  source: string
  medium: string
  /** The source is the thing to name: which partner, which placement. */
  askSource?: { label: string; hint: string }
}

const PRESETS: readonly Preset[] = [
  { key: "linkedin", label: "LinkedIn post", source: "linkedin", medium: "social" },
  { key: "signature", label: "Email signature", source: "signature", medium: "email" },
  { key: "outreach", label: "Outreach email", source: "outreach", medium: "email" },
  { key: "newsletter", label: "Newsletter", source: "newsletter", medium: "email" },
  { key: "whatsapp", label: "WhatsApp share", source: "whatsapp", medium: "social" },
  {
    key: "partner",
    label: "Partner site",
    source: "",
    medium: "referral",
    askSource: { label: "Partner", hint: "the partner's name, e.g. gep" },
  },
  {
    key: "custom",
    label: "Custom",
    source: "",
    medium: "",
    askSource: { label: "Source", hint: "where the link will sit" },
  },
]

const CUSTOM_PATH = "__custom__"

export function UtmBuilder({
  origin,
  pages,
}: {
  origin: string
  pages: UtmPage[]
}) {
  const [pagePath, setPagePath] = React.useState("/")
  const [customPath, setCustomPath] = React.useState("")
  const [presetKey, setPresetKey] = React.useState(PRESETS[0].key)
  const [source, setSource] = React.useState("")
  const [medium, setMedium] = React.useState("")
  const [campaign, setCampaign] = React.useState("")
  const [copied, setCopied] = React.useState(false)

  const preset = PRESETS.find((p) => p.key === presetKey) ?? PRESETS[0]

  const groups = [...new Set(pages.map((p) => p.group))]

  const path = normalisePath(
    pagePath === CUSTOM_PATH ? customPath : pagePath
  )
  const finalSource = preset.askSource ? slugify(source) : preset.source
  const finalMedium =
    preset.key === "custom" ? slugify(medium) : preset.medium

  const params = new URLSearchParams()
  if (finalSource) params.set("utm_source", finalSource)
  if (finalMedium) params.set("utm_medium", finalMedium)
  if (slugify(campaign)) params.set("utm_campaign", slugify(campaign))

  const ready = Boolean(finalSource && finalMedium && slugify(campaign))
  const url = `${origin}${path}${params.size ? `?${params.toString()}` : ""}`

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      // Clipboard access denied: the URL is visible and selectable, so the
      // reader can still take it by hand.
    }
  }

  return (
    <div className="cl-dash">
      <header className="cl-dash__mast">
        <p className="cl-dash__kicker cl-dash__kicker--accent">
          Cogniviti Labs · UTM links
        </p>
        <h1>Tag a link before you share it.</h1>
        <p className="cl-dash__lede">
          A UTM tells the analytics where a visitor came from when the
          referrer cannot - WhatsApp, email apps and PDFs strip it. Pick
          where the link will live, name the campaign, and paste the result.
          Only for links placed outside the site; never on links between our
          own pages.
        </p>
      </header>

      <div className="cl-utm__form">
        <div className="cl-utm__field">
          <label className="cl-utm__label" htmlFor="utm-page">
            Destination
          </label>
          <select
            id="utm-page"
            className="cl-utm__select"
            value={pagePath}
            onChange={(e) => setPagePath(e.target.value)}
          >
            {groups.map((group) => (
              <optgroup key={group} label={group}>
                {pages
                  .filter((p) => p.group === group)
                  .map((p) => (
                    <option key={p.path} value={p.path}>
                      {p.label}
                    </option>
                  ))}
              </optgroup>
            ))}
            <option value={CUSTOM_PATH}>Another path…</option>
          </select>
        </div>

        <div className="cl-utm__field">
          <label className="cl-utm__label" htmlFor="utm-preset">
            Where the link will sit
          </label>
          <select
            id="utm-preset"
            className="cl-utm__select"
            value={presetKey}
            onChange={(e) => setPresetKey(e.target.value)}
          >
            {PRESETS.map((p) => (
              <option key={p.key} value={p.key}>
                {p.label}
              </option>
            ))}
          </select>
          <span className="cl-utm__hint">
            {preset.key === "custom"
              ? "Free-form - check the spelling twice."
              : `utm_source=${preset.askSource ? "…" : preset.source} · utm_medium=${preset.medium}`}
          </span>
        </div>

        {pagePath === CUSTOM_PATH && (
          <div className="cl-utm__field cl-utm__field--wide">
            <label className="cl-utm__label" htmlFor="utm-path">
              Path
            </label>
            <input
              id="utm-path"
              className="cl-utm__input"
              type="text"
              value={customPath}
              onChange={(e) => setCustomPath(e.target.value)}
              placeholder="/blog/some-post/"
            />
          </div>
        )}

        {preset.askSource && (
          <div className="cl-utm__field">
            <label className="cl-utm__label" htmlFor="utm-source">
              {preset.askSource.label}
            </label>
            <input
              id="utm-source"
              className="cl-utm__input"
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder={preset.askSource.hint}
            />
          </div>
        )}

        {preset.key === "custom" && (
          <div className="cl-utm__field">
            <label className="cl-utm__label" htmlFor="utm-medium">
              Medium
            </label>
            <input
              id="utm-medium"
              className="cl-utm__input"
              type="text"
              value={medium}
              onChange={(e) => setMedium(e.target.value)}
              placeholder="social, email, referral, paid"
            />
          </div>
        )}

        <div className="cl-utm__field">
          <label className="cl-utm__label" htmlFor="utm-campaign">
            Campaign
          </label>
          <input
            id="utm-campaign"
            className="cl-utm__input"
            type="text"
            value={campaign}
            onChange={(e) => setCampaign(e.target.value)}
            placeholder="launch, coupa-webinar-oct…"
          />
          <span className="cl-utm__hint">
            The specific push. Lowercase and hyphens are applied for you.
          </span>
        </div>

        <div className="cl-utm__result">
          <span className="cl-utm__url">{url}</span>
          <button
            type="button"
            className="cl-utm__copy"
            onClick={copy}
            disabled={!ready}
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        {!ready && (
          <p className="cl-utm__hint cl-utm__field--wide">
            The copy button unlocks once source, medium and campaign are all
            filled in - a partly tagged link is worse than an untagged one.
          </p>
        )}
      </div>

      <div className="cl-utm__rules">
        <p>
          Where the results land: PostHog → Web analytics shows sources,
          mediums and campaigns alongside referrers, and any insight can
          break down by them - most usefully, enquiries by source.
        </p>
        <p>
          Ads and email tools tag by themselves once configured - Google Ads
          and LinkedIn Campaign Manager append their own tags, and newsletter
          tools have an auto-UTM setting. This page is for the links made by
          hand.
        </p>
      </div>
    </div>
  )
}

/* Lowercase, hyphens for spaces, nothing a query string would flinch at.
 * Applied as the reader types, so the discipline is free. */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9._-]/g, "")
}

/* A path with the leading and trailing slash the site's URLs carry -
 * `trailingSlash: true` means the unslashed form answers a redirect. */
function normalisePath(value: string): string {
  let path = value.trim()
  if (!path.startsWith("/")) path = `/${path}`
  if (!path.endsWith("/")) path = `${path}/`
  return path
}
