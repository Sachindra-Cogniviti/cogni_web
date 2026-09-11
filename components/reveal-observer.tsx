"use client"

import * as React from "react"

import { flowIn, settle, watch } from "@/lib/scroll-flow"

/**
 * Scroll flow for the whole page.
 *
 * Mounted once in the layout. It finds every `[data-reveal]` element in the
 * document and plays it in when it arrives (see lib/scroll-flow.ts) rather
 * than wrapping each one in a component, which keeps all the page sections
 * as server components and, more importantly, adds no wrapper elements that
 * would perturb the grid and flex layouts they sit in.
 *
 * The `data-reveal` value is the element's place in its block's sequence,
 * carried as a delay in milliseconds because that is what the markup already
 * said, and read here as an index at 60ms a step: a kicker at 0, its heading
 * at 60, the paragraph at 120, the action at 180. Those four then arrive a
 * clear beat apart rather than as one block.
 *
 * Which way an element comes from is `data-flow` on the element itself, and
 * the offset it starts at is the stylesheet's (globals.css). A split section
 * marks its two halves `left` and `right` so they arrive from their own
 * sides; everything else rises.
 *
 * One safety net forces everything visible if the normal path cannot run: a
 * background tab, which may never fire an intersection and would otherwise
 * break print and screenshot pipelines. It is conditioned on
 * `document.hidden`, which is a fact rather than a guess.
 *
 * There is deliberately no "nothing has played yet" net. An earlier version
 * had one, and it fired in ordinary use: the hero fills the first screen and
 * carries no `data-reveal`, so on a normal load nothing has played after a
 * couple of seconds, and the net would settle the entire page flat before
 * the reader ever scrolled. Every block below the fold then simply appeared,
 * fully formed, with no animation at all. A watcher that cannot be
 * constructed is caught below instead, which is the only failure that net
 * was ever really guarding against.
 *
 * In development, Fast Refresh can replace a section's elements after this
 * has already collected them; the replacements would then sit at their
 * hidden starting state until a reload. A mutation observer, development
 * only, picks them up. Production markup never changes after load, so it is
 * left out.
 */
export function RevealObserver() {
  React.useEffect(() => {
    const all = () => Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"))

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      all().forEach(settle)
      return
    }

    const stops: (() => void)[] = []
    const seen = new WeakSet<HTMLElement>()

    const bind = (element: HTMLElement) => {
      if (seen.has(element)) return
      seen.add(element)
      // The markup carries the old per-element delay; 60ms is one step.
      const index = Math.round(Number(element.dataset.reveal ?? 0) / 60)
      try {
        stops.push(watch(element, () => flowIn(element, { index })))
      } catch {
        settle(element)
      }
    }

    all().forEach(bind)

    const hiddenTimer = window.setTimeout(() => {
      if (document.hidden) all().forEach(settle)
    }, 800)

    let mutations: MutationObserver | undefined
    if (process.env.NODE_ENV !== "production") {
      mutations = new MutationObserver(() => all().forEach(bind))
      mutations.observe(document.body, { childList: true, subtree: true })
    }

    return () => {
      stops.forEach((stop) => stop())
      mutations?.disconnect()
      window.clearTimeout(hiddenTimer)
    }
  }, [])

  return null
}
