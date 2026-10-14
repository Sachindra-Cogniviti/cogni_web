"use client"

import { useState } from "react"
import { useDocumentInfo } from "@payloadcms/ui"

export function SharePreview() {
  const { id, collectionSlug } = useDocumentInfo()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)
  const [link, setLink] = useState<{ target: string; url: string; expiresAt: string } | null>(null)
  const target = `${collectionSlug}:${id}`
  const current = link?.target === target ? link : null

  async function generate() {
    setBusy(true)
    setError("")
    setCopied(false)
    try {
      const response = await fetch("/preview/share/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collection: collectionSlug, id: Number(id) }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Could not create a preview link.")
      setLink({ target, url: result.url, expiresAt: result.expiresAt })
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Could not create a preview link.")
    } finally { setBusy(false) }
  }

  async function copy() {
    if (!current) return
    try { await navigator.clipboard.writeText(current.url); setCopied(true) }
    catch { setError("Select the link below and copy it manually.") }
  }

  return (
    <div className="cl-preview-share">
      <button type="button" className="cl-preview-share__button" disabled={!id || busy} onClick={generate}>
        {busy ? "Creating link…" : "Create 24h preview link"}
      </button>
      {!id && <span>Save the draft first.</span>}
      {current && (
        <div className="cl-preview-share__result">
          <label>
            Shareable preview link
            <input readOnly value={current.url} onFocus={(event) => event.target.select()} />
          </label>
          <button type="button" className="cl-preview-share__button" onClick={copy}>{copied ? "Copied" : "Copy link"}</button>
          <p>Anyone with this link can view the saved article until {new Date(current.expiresAt).toLocaleString()}. It stays unpublished.</p>
        </div>
      )}
      {error && <p role="alert">{error}</p>}
    </div>
  )
}
