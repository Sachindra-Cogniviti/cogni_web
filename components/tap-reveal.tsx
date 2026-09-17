"use client"

import * as React from "react"

/**
 * Tap where there is no hover.
 *
 * Several things on the page answer the pointer coming over them - a
 * portrait colours in, a print lifts off the pile - and every one of those
 * rules sits behind `(hover: hover)`, because on a touch screen :hover
 * latches after a tap and never clears. That leaves a phone with nothing:
 * the interaction simply does not exist there.
 *
 * This gives it a tap instead. On a touch or coarse pointer, tapping an
 * element marked `data-tap` toggles `data-active` on it, and the stylesheet
 * (and Tailwind's `group-data-active:`) answers that the way it answers
 * hover. One element is active at a time, so the pile and the row keep
 * their shape; a tap anywhere else clears it, which is how a tap-to-reveal
 * is expected to behave. A tap on a link or button inside the element is
 * left to that control - the Connect link under a portrait still connects -
 * and nothing is prevented, so scrolling and navigation are untouched.
 *
 * Mounted once in the layout as a document-level listener, so the sections
 * stay server components. On a mouse the listener does nothing at all.
 */
export function TapReveal() {
  React.useEffect(() => {
    const coarse = window.matchMedia("(hover: none), (pointer: coarse)")

    const onClick = (event: MouseEvent) => {
      if (!coarse.matches) return
      const origin = event.target as Element | null
      const target = origin?.closest?.("[data-tap]") ?? null
      const active = document.querySelectorAll("[data-tap][data-active]")

      if (!target) {
        active.forEach((el) => el.removeAttribute("data-active"))
        return
      }

      // A control inside the element keeps its own tap.
      const control = origin?.closest("a, button")
      if (control && control !== target && target.contains(control)) return

      const wasActive = target.hasAttribute("data-active")
      active.forEach((el) => {
        if (el !== target) el.removeAttribute("data-active")
      })
      if (wasActive) target.removeAttribute("data-active")
      else target.setAttribute("data-active", "")
    }

    document.addEventListener("click", onClick)
    return () => document.removeEventListener("click", onClick)
  }, [])

  return null
}
