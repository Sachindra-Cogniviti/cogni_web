"use client"

import * as React from "react"

import { Corners, Kicker } from "@/components/primitives"
import { cookieNotice } from "@/content/site"
import {
  isConsentBannerOpen,
  setConsent,
  subscribeConsent,
  type ConsentChoice,
} from "@/lib/consent"

/**
 * The cookie notice.
 *
 * Rendered as nothing on the server and until the first effect, because
 * whether it shows depends on localStorage, which the server cannot read -
 * rendering a guess would just be a hydration mismatch with extra steps.
 * The moment of appearance is fine: this is a consent prompt, not content,
 * and it arriving after paint is exactly where it belongs in the page's
 * priority order.
 *
 * A region, not a dialog: it must not trap focus or block reading. It sits
 * under the nav (z-90 against the bar's z-100) and above everything else,
 * bottom-right where the page's reveal choreography is not happening.
 *
 * Both buttons carry the same visual weight class of action - accept is
 * solid, decline outlined, but equally sized and adjacent - because a
 * decline that has to be hunted for is not a choice.
 */
export function ConsentBanner() {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const sync = () => setOpen(isConsentBannerOpen())
    sync()
    return subscribeConsent(sync)
  }, [])

  if (!open) return null

  const choose = (choice: ConsentChoice) => () => setConsent(choice)

  return (
    <aside
      role="region"
      aria-label={cookieNotice.label}
      className="fixed inset-x-4 bottom-4 z-90 max-w-[400px] animate-[consent-in_0.6s_cubic-bezier(0.16,1,0.3,1)_both] border border-rule bg-paper p-5 shadow-[0_12px_40px_rgba(22,19,16,0.14)] motion-reduce:animate-none sm:left-auto"
    >
      <Corners />
      <Kicker>{cookieNotice.kicker}</Kicker>
      <p className="mt-3 text-[13px] leading-[1.6] text-pretty text-ink-soft">
        {cookieNotice.body}{" "}
        <a
          href={cookieNotice.policyHref}
          className="border-b border-oxblood/35 pb-[1px] text-ink transition-colors duration-[var(--roll-duration)] ease-[var(--roll-ease)] hover:border-ink/35 hover:text-oxblood"
        >
          {cookieNotice.policyLabel}
        </a>
      </p>
      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={choose("granted")}
          className="control-motion flex-1 cursor-pointer rounded-[2px] bg-ink px-4 py-[10px] text-[13.5px] font-medium text-paper hover:bg-oxblood active:scale-[0.97]"
        >
          {cookieNotice.accept}
        </button>
        <button
          type="button"
          onClick={choose("denied")}
          className="control-motion flex-1 cursor-pointer rounded-[2px] border border-edge px-4 py-[9px] text-[13.5px] font-medium text-ink hover:border-oxblood hover:text-oxblood active:scale-[0.97]"
        >
          {cookieNotice.decline}
        </button>
      </div>
    </aside>
  )
}
