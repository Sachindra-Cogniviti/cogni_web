"use client"

import * as React from "react"
import { animate, inView } from "motion"

/**
 * Scroll reveals for the whole page, driven by Motion.
 *
 * Mounted once in the layout. It watches every `[data-reveal]` element in the
 * document with Motion's `inView` rather than wrapping each one in a
 * component, which keeps all the page sections as server components and,
 * more importantly, adds no wrapper elements that would perturb the grid and
 * flex layouts they sit in. When an element enters, Motion animates it from
 * the CSS hidden state (opacity 0, 14px down; see globals.css, scoped to
 * `.js` so nothing is hidden with scripting off) to rest, and the element
 * is stamped `data-revealed="true"`, which is what the section-level
 * choreography (arcs, threads, tiles) keys off.
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
 *
 * In development, Fast Refresh can replace a section's elements after this
 * has already collected them; the replacements would then sit at their hidden
 * starting state until a reload. A mutation observer, development only, picks
 * them up. Production markup never changes after load, so it is left out.
 */
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

export function RevealObserver() {
  React.useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"))
    const stops: (() => void)[] = []

    if (prefersReduced) {
      // CSS already neutralises the hidden state under reduced motion; mark
      // them anyway so the DOM is consistent either way.
      elements.forEach((el) => el.setAttribute("data-revealed", "true"))
      return
    }

    let fired = false

    const reveal = (el: HTMLElement, delay: number, duration: number) => {
      if (el.getAttribute("data-revealed") === "true") return
      el.setAttribute("data-revealed", "true")
      animate(
        el,
        { opacity: [0, 1], y: [14, 0] },
        { duration, ease: EASE, delay: delay / 1000 }
      )
    }

    const watch = (el: HTMLElement) => {
      const stop = inView(
        el,
        () => {
          fired = true
          const isHero = Boolean(el.closest("[data-reveal-scope='hero']"))
          const declared = Number(el.dataset.reveal ?? 0)
          const delay = isHero ? declared : Math.min(declared, 90)
          reveal(el, delay, isHero ? 0.6 : 0.45)
          // Fire once: returning nothing keeps the element out of further
          // callbacks, and we stop the watcher too.
          stop()
        },
        { amount: 0.12, margin: "0px 0px -6% 0px" }
      )
      stops.push(stop)
    }

    elements.forEach(watch)

    const forceAll = () => {
      elements.forEach((el) => reveal(el, 0, 0.4))
    }

    const hiddenTimer = window.setTimeout(() => {
      if (document.hidden) forceAll()
    }, 800)

    const stalledTimer = window.setTimeout(() => {
      if (!fired) forceAll()
    }, 2000)

    let mutations: MutationObserver | undefined
    if (process.env.NODE_ENV !== "production") {
      mutations = new MutationObserver(() => {
        document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
          if (elements.includes(el)) return
          elements.push(el)
          watch(el)
        })
      })
      mutations.observe(document.body, { childList: true, subtree: true })
    }

    return () => {
      stops.forEach((stop) => stop())
      mutations?.disconnect()
      window.clearTimeout(hiddenTimer)
      window.clearTimeout(stalledTimer)
    }
  }, [])

  return null
}
