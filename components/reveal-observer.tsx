"use client"

import * as React from "react"

/**
 * Scroll reveals for the whole page.
 *
 * Mounted once in the layout. It observes every `[data-reveal]` element in the
 * document rather than wrapping each one in a provider, which keeps all the
 * page sections as server components and, more importantly, adds no wrapper
 * elements that would perturb the grid and flex layouts they sit in.
 *
 * Timing follows the motion pass from the design:
 *
 *   - The hero uses the full per-element delay over 600ms. A long stagger there
 *     establishes reading order on arrival, and is the one place it earns its
 *     keep.
 *   - Everything below the hero is capped at 90ms and shortened to 450ms.
 *     Mid-page content inheriting a hero-length stagger felt gated behind the
 *     animation - you scroll to a section and wait for it.
 *
 * Two safety nets force everything visible if the normal path cannot run: a
 * background tab (no intersections while hidden, which breaks print and
 * screenshot pipelines) and an observer that never fires at all. Both only
 * act when no reveal has happened, so they never interrupt normal scrolling.
 */
export function RevealObserver() {
  React.useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    const elements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]")
    )

    if (prefersReduced) {
      // CSS already neutralises the hidden state under reduced motion; mark
      // them anyway so the DOM is consistent either way.
      elements.forEach((el) => el.setAttribute("data-revealed", "true"))
      return
    }

    let fired = false

    const reveal = (el: HTMLElement, delay: number, duration: string) => {
      el.style.transition =
        `opacity ${duration} cubic-bezier(.22,1,.36,1) ${delay}ms,` +
        `transform ${duration} cubic-bezier(.22,1,.36,1) ${delay}ms`
      el.setAttribute("data-revealed", "true")
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue

          const el = entry.target as HTMLElement
          fired = true

          const isHero = Boolean(el.closest("[data-reveal-scope='hero']"))
          const declared = Number(el.dataset.reveal ?? 0)
          const delay = isHero ? declared : Math.min(declared, 90)

          reveal(el, delay, isHero ? ".6s" : ".45s")
          observer.unobserve(el)
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    )

    elements.forEach((el) => observer.observe(el))

    const forceAll = () => {
      elements.forEach((el) => {
        if (el.getAttribute("data-revealed") === "true") return
        el.style.transition = "opacity .4s ease, transform .4s ease"
        el.setAttribute("data-revealed", "true")
      })
    }

    const hiddenTimer = window.setTimeout(() => {
      if (document.hidden) forceAll()
    }, 800)

    const stalledTimer = window.setTimeout(() => {
      if (!fired) forceAll()
    }, 2000)

    return () => {
      observer.disconnect()
      window.clearTimeout(hiddenTimer)
      window.clearTimeout(stalledTimer)
    }
  }, [])

  return null
}
