"use client"

import * as React from "react"
import { animate, type AnimationPlaybackControls } from "motion"

/**
 * Smooth in-page anchor scrolling.
 *
 * The browser's own `scroll-behavior: smooth` is a fixed, short ease that
 * looks like a lurch over a page this long. This takes over clicks on any
 * `href="#…"` link and drives the scroll with Motion: an ease-out curve on a
 * duration that grows with the distance (350ms for a short hop, 650ms for the
 * full page), stopping the moment the user wheels, touches or presses a key,
 * so it never fights them.
 *
 * Mounted once in the layout, as a document-level listener, so the sections
 * stay server components. The hash is still pushed to the address bar and
 * focus still lands on the target, so back/forward and keyboard users get
 * what a native anchor would give them. Under reduced motion it jumps.
 *
 * `NAV_OFFSET` matches `scroll-padding-top` in globals.css, which stays as the
 * no-JS fallback.
 */
const NAV_OFFSET = 88
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

export function SmoothAnchors() {
  React.useEffect(() => {
    let controls: AnimationPlaybackControls | null = null

    const stop = () => {
      controls?.stop()
      controls = null
      window.removeEventListener("wheel", stop)
      window.removeEventListener("touchstart", stop)
      window.removeEventListener("keydown", stop)
    }

    const settle = (target: HTMLElement) => {
      if (target === document.body) return
      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1")
      target.focus({ preventScroll: true })
    }

    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return

      const anchor = (event.target as Element | null)?.closest?.(
        "a[href^='#']"
      ) as HTMLAnchorElement | null
      if (!anchor) return

      const hash = anchor.getAttribute("href") ?? ""
      if (hash.length < 2) return
      const id = decodeURIComponent(hash.slice(1))
      const target = id === "top" ? document.body : document.getElementById(id)
      if (!target) return

      event.preventDefault()
      stop()

      const start = window.scrollY
      const max = document.documentElement.scrollHeight - window.innerHeight
      const raw = target.getBoundingClientRect().top + start - (id === "top" ? 0 : NAV_OFFSET)
      const end = Math.min(max, Math.max(0, raw))
      const distance = end - start

      if (hash !== window.location.hash) history.pushState(null, "", hash)

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      if (reduced || Math.abs(distance) < 2) {
        window.scrollTo(0, end)
        settle(target)
        return
      }

      const duration = Math.min(650, Math.max(350, Math.abs(distance) * 0.35)) / 1000

      window.addEventListener("wheel", stop, { passive: true })
      window.addEventListener("touchstart", stop, { passive: true })
      window.addEventListener("keydown", stop)
      controls = animate(start, end, {
        duration,
        ease: EASE,
        onUpdate: (value) => window.scrollTo(0, value),
        onComplete: () => {
          stop()
          settle(target)
        },
      })
    }

    document.addEventListener("click", onClick)
    return () => {
      document.removeEventListener("click", onClick)
      stop()
    }
  }, [])

  return null
}
