"use client"

import { useSyncExternalStore } from "react"
import { useRouter } from "next/navigation"
import { RefreshRouteOnSave } from "@payloadcms/live-preview-react"

/**
 * What a page carries while it is showing a draft (see lib/preview.ts).
 *
 * Two jobs. The first is invisible: listen for the admin's "saved" message
 * and re-render the page, which is what makes the Live Preview panel follow
 * the editor. The page is server-rendered, so the fresh draft is fetched by
 * a router refresh rather than patched in on the client; the whole page,
 * not just the field that changed, is what the editor is checking.
 *
 * The second is the strip along the bottom saying this is a draft and
 * offering the way out. It is left out inside the Live Preview iframe: the
 * panel already says what it is, and leaving draft mode from inside it
 * would turn the panel into a view of the published page. Framing is only
 * known on the client, so the strip is held back until then rather than
 * flashing up inside the admin on every refresh: the server snapshot says
 * "framed", and the browser corrects it on hydration.
 */
const never = () => () => {}

export function DraftPreview({ path }: { path: string }) {
  const router = useRouter()
  const framed = useSyncExternalStore(
    never,
    () => window.self !== window.top,
    () => true
  )
  const origin = useSyncExternalStore(
    never,
    () => window.location.origin,
    () => null
  )

  return (
    <>
      {origin && (
        <RefreshRouteOnSave
          refresh={() => router.refresh()}
          serverURL={origin}
        />
      )}
      {!framed && (
        <div
          role="status"
          className="fixed inset-x-0 bottom-0 z-[60] flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-night-fg/15 bg-night px-5 py-3 text-night-fg"
        >
          <span className="font-mono text-[11px] tracking-[0.16em] text-night-muted uppercase">
            <span className="text-oxblood-lift">Draft preview</span> · Not what
            visitors see
          </span>
          <a
            href={`/preview/exit/?path=${encodeURIComponent(path)}`}
            className="font-mono text-[11px] tracking-[0.16em] text-night-fg uppercase underline-offset-4 hover:text-oxblood-lift hover:underline"
          >
            Exit preview
          </a>
        </div>
      )}
    </>
  )
}
