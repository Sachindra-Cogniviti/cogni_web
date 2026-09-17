"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Share controls for an article or a client story: copy the link, or hand
 * it to LinkedIn, X, WhatsApp or email, each of which takes the page URL in
 * its own share intent. On a device with a share sheet (`navigator.share`)
 * that is offered too - it is where a phone's real sharing lives - and it
 * only appears after mount, so the server and the browser render the same
 * row and hydration has nothing to disagree about.
 *
 * `url` is the page's canonical absolute URL, from the server, so what is
 * shared is the public address and not a preview hostname or a hash.
 */
export function ShareRow({
  url,
  title,
  text,
  label = "Share",
  className,
}: {
  url: string
  title: string
  text?: string
  label?: string
  className?: string
}) {
  const [copied, setCopied] = React.useState(false)
  // False on the server and for the first paint, true after hydration on a
  // device with a share sheet: the row grows by one control rather than
  // rendering differently on each side.
  const native = React.useSyncExternalStore(
    () => () => {},
    () => "share" in navigator,
    () => false
  )

  React.useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 1800)
    return () => window.clearTimeout(timer)
  }, [copied])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
    } catch {
      // The clipboard is unavailable in some embedded browsers; the address
      // bar is still there.
      window.prompt("Copy this link", url)
    }
  }

  const share = async () => {
    try {
      await navigator.share({ title, text, url })
    } catch {
      // Dismissed, or the sheet was refused: nothing to recover from.
    }
  }

  const encoded = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)
  const targets = [
    {
      name: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`,
      icon: (
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      ),
    },
    {
      name: "X",
      href: `https://x.com/intent/post?url=${encoded}&text=${encodedTitle}`,
      icon: (
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      ),
    },
    {
      name: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
      icon: (
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
      ),
    },
    {
      name: "Email",
      href: `mailto:?subject=${encodedTitle}&body=${encodeURIComponent(`${text ? `${text}\n\n` : ""}${url}`)}`,
      icon: (
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          d="M3.5 6.5h17v11h-17zM3.5 7l8.5 6 8.5-6"
        />
      ),
    },
  ]

  return (
    <div
      className={cn("flex flex-wrap items-center gap-x-4 gap-y-3", className)}
    >
      <span className="font-mono text-[10.5px] tracking-[0.2em] text-ink-faint uppercase">
        {label}
      </span>
      <div className="flex items-center gap-[6px]">
        <button
          type="button"
          onClick={copy}
          aria-live="polite"
          className={shareControl}
          title="Copy link"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-[15px]">
            {copied ? (
              <path
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                d="m5 12.5 4.5 4.5L19 7.5"
              />
            ) : (
              <path
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                d="M10 14a3.5 3.5 0 0 0 5 0l3.5-3.5a3.5 3.5 0 0 0-5-5L12 7m2 3a3.5 3.5 0 0 0-5 0L5.5 13.5a3.5 3.5 0 0 0 5 5L12 17"
              />
            )}
          </svg>
          <span className="sr-only">
            {copied ? "Link copied" : "Copy link"}
          </span>
        </button>
        {targets.map((target) => (
          <a
            key={target.name}
            href={target.href}
            target="_blank"
            rel="noopener noreferrer"
            title={`Share on ${target.name}`}
            className={shareControl}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-[15px]"
            >
              {target.icon}
            </svg>
            <span className="sr-only">Share on {target.name}</span>
          </a>
        ))}
        {native && (
          <button
            type="button"
            onClick={share}
            title="Share…"
            className={shareControl}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-[15px]">
              <path
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                d="M12 3v12M8 7l4-4 4 4M5 12v8h14v-8"
              />
            </svg>
            <span className="sr-only">Share…</span>
          </button>
        )}
      </div>
      <span
        aria-hidden="true"
        className={cn(
          "font-mono text-[10.5px] tracking-[0.16em] text-oxblood uppercase transition-opacity duration-200",
          copied ? "opacity-100" : "opacity-0"
        )}
      >
        Link copied
      </span>
    </div>
  )
}

/** 34px under a mouse; 42px under a finger, the smallest comfortable target. */
const shareControl =
  "control-motion flex size-[34px] items-center justify-center rounded-[2px] border border-rule text-ink-muted hover:border-oxblood hover:text-oxblood active:scale-[0.96] pointer-coarse:size-[42px]"
