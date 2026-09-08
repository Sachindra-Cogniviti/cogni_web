"use client"

import * as React from "react"
import { flushSync } from "react-dom"
import {
  AnimatePresence,
  animate,
  motion,
  useDragControls,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
  type Variants,
} from "motion/react"

import { LocalTime } from "@/components/local-time"
import { Container, Kicker, sectionPadding } from "@/components/primitives"
import { productDesktop, products } from "@/content/site"

/**
 * Product desktop - the suite presented as a small operating system: a menu
 * bar with working menus, one app window you can drag, zoom and close, a
 * Spotlight-style search, and a Dock that magnifies around the pointer.
 * Choosing an app anywhere (Dock, Window menu, search) opens it in the
 * window. It is a toy, but every control does what its shape promises, which
 * is what makes it feel operated rather than pictured.
 *
 * All motion here is Motion's, on transform, opacity and filter: the app
 * switch is an AnimatePresence crossfade, 160ms out and 220ms in with a
 * touch of blur to bridge the two states; menus and the search panel enter
 * 150ms from their trigger and leave in 100ms, and are instant when opened
 * from the keyboard; the Dock magnifies on springs driven from the pointer
 * position, so a fast sweep along it overshoots a little and settles; the
 * window opens on a short spring and closes 220ms toward the Dock. Reduced
 * motion is honoured through the page's MotionConfig. Hover effects and
 * magnification are gated to fine pointers.
 *
 * The window drag is Motion's: started from the title bar through drag
 * controls, bounded to the desktop with the Dock kept clear, and elastic at
 * the edges, so pushing past a bound moves the window a quarter of the way
 * and it settles back on release instead of hitting a wall. Zoom and close
 * ease the offset home over 220ms.
 *
 * Both this and the (currently hidden) portfolio table read the same product
 * list from content/site.ts, so they cannot drift apart.
 */

type MenuId = "app" | "window" | "help"

const FINE_POINTER = "(hover: hover) and (pointer: fine)"
const REDUCED = "(prefers-reduced-motion: reduce)"
const EASE: [number, number, number, number] = [0.23, 1, 0.32, 1]

/** The window: springs open from just above the Dock, eases closed toward it. */
const windowVariants: Variants = {
  open: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      default: { type: "spring", duration: 0.45, bounce: 0.18 },
      opacity: { duration: 0.18, ease: EASE },
    },
  },
  closed: {
    opacity: 0,
    y: 28,
    scale: 0.92,
    transition: { duration: 0.22, ease: EASE },
  },
}

export function ProductDesktop() {
  const [selected, setSelected] = React.useState(0)
  const [windowOpen, setWindowOpen] = React.useState(true)
  const [zoomed, setZoomed] = React.useState(false)
  const [menu, setMenu] = React.useState<MenuId | null>(null)
  const [menuInstant, setMenuInstant] = React.useState(false)
  const [search, setSearch] = React.useState(false)
  const [searchInstant, setSearchInstant] = React.useState(false)

  const sectionRef = React.useRef<HTMLElement>(null)
  const desktopRef = React.useRef<HTMLDivElement>(null)
  const dragRef = React.useRef<HTMLDivElement>(null)
  const dockRef = React.useRef<HTMLDivElement>(null)
  const menuBarRef = React.useRef<HTMLDivElement>(null)
  const searchButtonRef = React.useRef<HTMLButtonElement>(null)
  const inView = React.useRef(false)

  /* ---- opening an app ---------------------------------------------------- */

  // The switch itself is an AnimatePresence crossfade keyed on `selected`
  // (see the window body), so this only has to set state; a quick run along
  // the Dock is handled by presence, which waits for the exit and mounts
  // whichever app is current by then.
  const open = React.useCallback((index: number) => {
    setWindowOpen(true)
    setSelected(index)
  }, [])

  /* ---- dragging the window ---------------------------------------------- */

  const reduced = useReducedMotion()
  const dragControls = useDragControls()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  // Pixel bounds for the offset, measured from the wrapper's resting place
  // each time a drag starts, so they track zoom and viewport changes.
  const [bounds, setBounds] = React.useState({ top: 0, left: 0, right: 0, bottom: 0 })

  const onTitlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    // Touch drags would fight page scrolling, and a zoomed window fills the
    // desktop anyway.
    if (event.button !== 0 || event.pointerType === "touch" || zoomed) return
    if ((event.target as Element).closest("button")) return
    const wrap = dragRef.current
    const desk = desktopRef.current
    if (!wrap || !desk) return

    const w = wrap.getBoundingClientRect()
    const d = desk.getBoundingClientRect()
    const pad = 8
    const dockClearance = 100
    // Constraints are relative to the untransformed box, so subtract the
    // current offset from the measured edges.
    const restLeft = w.left - x.get()
    const restRight = w.right - x.get()
    const restTop = w.top - y.get()
    const restBottom = w.bottom - y.get()
    flushSync(() =>
      setBounds({
        left: d.left + pad - restLeft,
        right: d.right - pad - restRight,
        top: d.top + pad - restTop,
        bottom: d.bottom - dockClearance - restBottom,
      })
    )
    dragControls.start(event)
  }

  const home = () => {
    const options = reduced
      ? { duration: 0 }
      : { duration: 0.22, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] }
    animate(x, 0, options)
    animate(y, 0, options)
  }

  const zoom = (value: boolean) => {
    setZoomed(value)
    if (value) home()
  }

  const closeWindow = () => {
    setWindowOpen(false)
    home()
  }

  /* ---- Dock magnification ------------------------------------------------ */

  // One motion value carries the pointer's x across the Dock; each icon
  // derives its own scale and lift from its distance to it and smooths them
  // on a spring (see DockIcon). Infinity means "no pointer", which relaxes
  // every icon.
  const pointerX = useMotionValue(Number.POSITIVE_INFINITY)

  const magnify = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!window.matchMedia(FINE_POINTER).matches) return
    if (window.matchMedia(REDUCED).matches) return
    pointerX.set(event.clientX)
  }

  const relax = () => pointerX.set(Number.POSITIVE_INFINITY)

  const onDockKey = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return
    event.preventDefault()
    const next =
      event.key === "ArrowRight"
        ? (selected + 1) % products.length
        : (selected - 1 + products.length) % products.length
    open(next)
    dockRef.current?.querySelectorAll<HTMLButtonElement>("[data-dock-app]")[next]?.focus()
  }

  /* ---- menu bar ------------------------------------------------------------ */

  const toggleMenu = (id: MenuId, event: React.MouseEvent<HTMLButtonElement>) => {
    // detail === 0 is a keyboard "click": open instantly, no animation.
    setMenuInstant(event.detail === 0)
    setMenu((current) => (current === id ? null : id))
  }

  React.useEffect(() => {
    if (!menu) return
    const onPointerDown = (event: PointerEvent) => {
      if (!menuBarRef.current?.contains(event.target as Node)) setMenu(null)
    }
    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [menu])

  const onMenuBarKey = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!menu) return
    const order: MenuId[] = ["app", "window", "help"]
    if (event.key === "Escape") {
      event.preventDefault()
      const trigger = menuBarRef.current?.querySelector<HTMLButtonElement>(`[data-menu="${menu}"]`)
      setMenu(null)
      trigger?.focus()
      return
    }
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault()
      const i = order.indexOf(menu)
      const next = order[(i + (event.key === "ArrowRight" ? 1 : -1) + order.length) % order.length]
      setMenuInstant(true)
      setMenu(next)
      return
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault()
      const items = Array.from(
        menuBarRef.current?.querySelectorAll<HTMLElement>('[role="menu"] [role^="menuitem"]') ?? []
      )
      if (items.length === 0) return
      const i = items.indexOf(document.activeElement as HTMLElement)
      const next =
        event.key === "ArrowDown"
          ? items[(i + 1) % items.length]
          : items[(i - 1 + items.length) % items.length]
      next.focus()
    }
  }

  React.useEffect(() => {
    if (!menu || !menuInstant) return
    // Opened from the keyboard: land on the first item.
    menuBarRef.current?.querySelector<HTMLElement>('[role="menu"] [role^="menuitem"]')?.focus()
  }, [menu, menuInstant])

  /* ---- Spotlight ----------------------------------------------------------- */

  React.useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const io = new IntersectionObserver(([entry]) => {
      inView.current = entry.isIntersecting
    })
    io.observe(section)
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k" && inView.current) {
        event.preventDefault()
        setSearchInstant(true)
        setSearch(true)
        setMenu(null)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => {
      io.disconnect()
      window.removeEventListener("keydown", onKey)
    }
  }, [])

  const closeSearch = () => {
    setSearch(false)
    searchButtonRef.current?.focus({ preventScroll: true })
  }

  const active = products[selected]
  const iconSize = "size-[clamp(40px,4.4vw,54px)]"

  return (
    <section
      ref={sectionRef}
      // `products` is the anchor every products link targets. It belongs to
      // the portfolio table, which is hidden for now (see app/page.tsx).
      id="products"
      className={`relative overflow-hidden bg-night-deep ${sectionPadding}`}
    >
      <Container className="relative max-w-[1120px]">
        <div data-reveal="0" className="mx-auto max-w-[62ch] text-center">
          <Kicker tone="dark">{productDesktop.kicker}</Kicker>
          <h2 className="mt-5 text-[clamp(28px,3.2vw,44px)] leading-[1.08] font-semibold tracking-[-0.03em] text-balance text-night-fg">
            {productDesktop.heading}
          </h2>
          <p className="mx-auto mt-5 max-w-[52ch] text-[15.5px] leading-[1.6] text-pretty text-night-muted">
            {productDesktop.body}
          </p>
        </div>

        {/* The screen. */}
        <div
          data-reveal="120"
          className="desktop mt-[48px] flex flex-col overflow-hidden rounded-[16px] border border-night-fg/12 shadow-[0_0_0_1px_rgb(0_0_0/0.5),0_40px_100px_rgb(0_0_0/0.6)]"
        >
          {/* Menu bar */}
          <div
            ref={menuBarRef}
            onKeyDown={onMenuBarKey}
            className="relative z-30 flex h-[34px] shrink-0 items-center gap-[6px] bg-night-deep/60 px-3 text-[13px] text-night-fg/85 backdrop-blur-[12px]"
          >
            <span className="mx-[6px] size-[14px] shrink-0 rounded-[4px] bg-[linear-gradient(135deg,#8E2030,#C93B52)]" />

            <MenuButton
              id="app"
              open={menu === "app"}
              onToggle={toggleMenu}
              onHover={() => menu && setMenu("app")}
              className="min-w-0 truncate font-semibold text-night-fg"
            >
              {windowOpen ? active.name : productDesktop.brand}
            </MenuButton>
            <AnimatePresence>
              {menu === "app" && (
                <Menu key="app" instant={menuInstant} className="left-[30px]">
                <MenuItem onSelect={() => { setMenu(null); setWindowOpen(true) }}>
                  {productDesktop.menuBar.app.open.replace("{name}", active.name)}
                </MenuItem>
                <MenuItem onSelect={() => { setMenu(null); zoom(!zoomed) }}>
                  {zoomed ? productDesktop.menuBar.app.unzoom : productDesktop.menuBar.app.zoom}
                </MenuItem>
                <MenuItem onSelect={() => { setMenu(null); closeWindow() }}>
                  {productDesktop.menuBar.app.minimise}
                </MenuItem>
                <MenuRule />
                <MenuItem onSelect={() => { setMenu(null); closeWindow() }} shortcut="⌘Q">
                  {productDesktop.menuBar.app.quit.replace("{name}", active.name)}
                </MenuItem>
                </Menu>
              )}
            </AnimatePresence>

            <div className="relative hidden sm:block">
              <MenuButton
                id="window"
                open={menu === "window"}
                onToggle={toggleMenu}
                onHover={() => menu && setMenu("window")}
              >
                {productDesktop.menuBar.window}
              </MenuButton>
              <AnimatePresence>
                {menu === "window" && (
                  <Menu key="window" instant={menuInstant}>
                  {products.map((product, index) => (
                    <MenuItem
                      key={product.name}
                      role="menuitemradio"
                      checked={index === selected && windowOpen}
                      onSelect={() => { setMenu(null); open(index) }}
                    >
                      {product.name}
                    </MenuItem>
                  ))}
                  </Menu>
                )}
              </AnimatePresence>
            </div>

            <div className="relative hidden sm:block">
              <MenuButton
                id="help"
                open={menu === "help"}
                onToggle={toggleMenu}
                onHover={() => menu && setMenu("help")}
              >
                {productDesktop.menuBar.help}
              </MenuButton>
              <AnimatePresence>
                {menu === "help" && (
                  <Menu key="help" instant={menuInstant}>
                    {productDesktop.menuBar.helpItems.map((item) => (
                      <MenuItem key={item.label} href={item.href} onSelect={() => setMenu(null)}>
                        {item.label}
                      </MenuItem>
                    ))}
                  </Menu>
                )}
              </AnimatePresence>
            </div>

            <span className="ml-auto flex shrink-0 items-center gap-[10px] font-mono text-[12px] whitespace-nowrap text-night-fg/70">
              <button
                ref={searchButtonRef}
                type="button"
                onClick={(event) => {
                  setSearchInstant(event.detail === 0)
                  setSearch(true)
                  setMenu(null)
                }}
                aria-label={productDesktop.spotlight.label}
                aria-keyshortcuts="Meta+K Control+K"
                className="flex size-[26px] cursor-pointer items-center justify-center rounded-[6px] text-night-fg/80 transition-[background-color,transform] duration-150 ease-out hover:bg-night-fg/10 focus-visible:bg-night-fg/10 focus-visible:outline-none active:scale-[0.94]"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
              </button>
              <span className="hidden sm:inline">
                <LocalTime withDay />
              </span>
              <span className="sm:hidden">
                <LocalTime />
              </span>
            </span>
          </div>

          {/* Desktop */}
          <div
            ref={desktopRef}
            className="relative flex min-h-[560px] flex-1 flex-col items-center justify-center px-[clamp(12px,3vw,32px)] pt-[clamp(20px,3vw,36px)] pb-[112px]"
          >
            <motion.p
              aria-hidden={windowOpen}
              initial={false}
              animate={{ opacity: windowOpen ? 0 : 1 }}
              transition={{ duration: 0.3, ease: EASE, delay: windowOpen ? 0 : 0.15 }}
              className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-6 text-center font-mono text-[12px] tracking-[0.14em] text-night-fg/45 uppercase"
            >
              {productDesktop.closedHint}
            </motion.p>

            {/* Window. The outer div carries the drag offset; the inner one
                the open/close and zoom transitions, so a drag never animates. */}
            <motion.div
              ref={dragRef}
              drag
              dragListener={false}
              dragControls={dragControls}
              dragConstraints={bounds}
              dragElastic={reduced ? 0 : 0.25}
              dragMomentum={false}
              dragTransition={{ bounceStiffness: 520, bounceDamping: 44 }}
              style={{ x, y }}
              className={`window-drag relative z-10 w-full ${zoomed ? "max-w-full" : "max-w-[780px]"}`}
            >
              <motion.div
                aria-hidden={!windowOpen}
                inert={!windowOpen}
                variants={windowVariants}
                initial={false}
                animate={windowOpen ? "open" : "closed"}
                className="app-window overflow-hidden rounded-[12px] border border-night-fg/14 bg-night-panel/85 text-night-fg shadow-[0_0_0_1px_rgb(0_0_0/0.45),0_30px_70px_rgb(0_0_0/0.55)]"
              >
                {/* Title bar. Drag handle. */}
                <div
                  onPointerDown={onTitlePointerDown}
                  onDoubleClick={(event) => {
                    if ((event.target as Element).closest("button")) return
                    zoom(!zoomed)
                  }}
                  className={`flex h-[40px] touch-pan-y items-center gap-3 border-b border-night-fg/10 bg-night-fg/[0.03] px-4 select-none ${
                    zoomed ? "" : "cursor-grab active:cursor-grabbing"
                  }`}
                >
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={closeWindow}
                      aria-label={productDesktop.controls.close}
                      className="traffic-light bg-[#ff5f57]"
                    />
                    <button
                      type="button"
                      onClick={closeWindow}
                      aria-label={productDesktop.controls.minimise}
                      className="traffic-light bg-[#febc2e]"
                    />
                    <button
                      type="button"
                      onClick={() => zoom(!zoomed)}
                      aria-pressed={zoomed}
                      aria-label={productDesktop.controls.zoom}
                      className="traffic-light bg-[#28c840]"
                    />
                  </div>
                  <span className="flex-1 truncate text-center text-[12.5px] font-medium text-night-fg/70">
                    {active.name} — {productDesktop.windowTitleSuffix}
                  </span>
                  <span className="w-[54px]" />
                </div>

                {/* App content. Keyed on the app, so a switch is an exit and
                    an entrance: the old body blurs and drops out in 160ms,
                    the new one sharpens in over 220ms. */}
                <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={selected}
                  initial={{ opacity: 0, y: 4, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -4, filter: "blur(4px)", transition: { duration: 0.16, ease: EASE } }}
                  transition={{ duration: 0.22, ease: EASE }}
                  className="grid gap-x-8 gap-y-6 p-[clamp(20px,3vw,32px)] md:grid-cols-[minmax(0,7fr)_minmax(240px,5fr)]"
                >
                  <div className="flex min-h-[260px] flex-col">
                    <div className="flex items-center gap-4">
                      <span className="flex size-[56px] shrink-0 items-center justify-center rounded-[14px] bg-[linear-gradient(135deg,#8E2030,#C93B52)] font-mono text-[20px] font-semibold text-paper shadow-[0_8px_26px_rgb(142_32_48/0.5)]">
                        {active.glyph}
                      </span>
                      <div className="min-w-0">
                        <div className="text-[20px] font-semibold tracking-[-0.01em]">{active.name}</div>
                        <div className="mt-1 font-mono text-[11px] tracking-[0.14em] text-oxblood-lift uppercase">
                          {active.kicker}
                        </div>
                      </div>
                    </div>

                    <p className="mt-5 text-[17px] leading-[1.35] font-medium tracking-[-0.01em] text-balance text-night-fg">
                      {active.tag}
                    </p>
                    <p className="mt-3 max-w-[52ch] text-[14.5px] leading-[1.65] text-pretty text-night-muted">
                      {active.desc}
                    </p>

                    <div className="mt-auto pt-6">
                      <a
                        href="#contact"
                        className="inline-block rounded-[6px] bg-night-fg px-4 py-[9px] text-[13.5px] font-semibold text-ink transition-[background-color,transform] duration-150 ease-out hover:bg-paper active:scale-[0.97]"
                      >
                        {active.cta}&nbsp;&nbsp;→
                      </a>
                    </div>
                  </div>

                  <div className="rounded-[10px] border border-night-fg/10 bg-night-deep/50 p-[18px]">
                    <div className="font-mono text-[10px] tracking-[0.16em] text-ink-faint uppercase">
                      {productDesktop.detailLabel}
                    </div>
                    <dl className="mt-2">
                      {active.rows.map(([key, value]) => (
                        <div
                          key={key}
                          className="flex justify-between gap-4 border-b border-night-fg/[0.07] py-[10px] font-mono text-[11.5px] last:border-b-0"
                        >
                          <dt className="text-ink-faint">{key}</dt>
                          <dd className="m-0 text-right text-night-value">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </motion.div>
                </AnimatePresence>
              </motion.div>
            </motion.div>

            {/* Spotlight */}
            <AnimatePresence>
              {search && (
                <Spotlight
                  key="spotlight"
                  instant={searchInstant}
                  onClose={closeSearch}
                  onOpen={(index) => {
                    closeSearch()
                    open(index)
                  }}
                />
              )}
            </AnimatePresence>

            {/* Dock */}
            <div className="absolute inset-x-0 bottom-[18px] z-20 flex justify-center px-3">
              <div
                ref={dockRef}
                role="toolbar"
                aria-label={productDesktop.dock.label}
                onKeyDown={onDockKey}
                onPointerMove={magnify}
                onPointerLeave={relax}
                className="flex items-end gap-[8px] rounded-[20px] border border-night-fg/12 bg-night-deep/70 px-[10px] pt-[10px] pb-[8px] shadow-[0_18px_50px_rgb(0_0_0/0.5)] backdrop-blur-[12px]"
              >
                {products.map((product, index) => {
                  const isActive = index === selected
                  return (
                    <button
                      key={product.name}
                      type="button"
                      data-dock-app
                      onClick={() => open(index)}
                      aria-label={product.name}
                      aria-pressed={isActive && windowOpen}
                      tabIndex={isActive ? 0 : -1}
                      className="dock-item relative flex flex-col items-center"
                    >
                      <span className="dock-tip">{product.name}</span>
                      <DockIcon
                        pointerX={pointerX}
                        className={`flex ${iconSize} items-center justify-center rounded-[22%] border font-mono text-[15px] font-semibold text-paper ${
                          isActive
                            ? "border-[#e0526b]/60 bg-[linear-gradient(135deg,#8E2030,#C93B52)] shadow-[0_8px_22px_rgb(142_32_48/0.45)]"
                            : "border-night-fg/12 bg-night-fg/[0.07]"
                        }`}
                      >
                        {product.glyph}
                      </DockIcon>
                      <span
                        className={`mt-[5px] size-[4px] rounded-full transition-opacity duration-200 ${
                          isActive && windowOpen ? "bg-night-fg/80 opacity-100" : "opacity-0"
                        }`}
                      />
                    </button>
                  )
                })}

                <span className="mx-[4px] mb-[9px] w-px self-stretch bg-night-fg/15" aria-hidden="true" />

                <a
                  href={productDesktop.dock.contact.href}
                  aria-label={productDesktop.dock.contact.label}
                  className="dock-item relative flex flex-col items-center"
                >
                  <span className="dock-tip">{productDesktop.dock.contact.label}</span>
                  <DockIcon
                    pointerX={pointerX}
                    className={`flex ${iconSize} items-center justify-center rounded-[22%] border border-night-fg/12 bg-night-fg/[0.07] text-night-fg`}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M4 6h16v12H4z" />
                      <path d="m4 7 8 6 8-6" />
                    </svg>
                  </DockIcon>
                  <span className="mt-[5px] size-[4px] rounded-full opacity-0" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}

/* ---- Dock icon --------------------------------------------------------------- */

/**
 * One Dock icon. Its scale and lift are derived from the pointer's distance
 * to its centre (a quadratic falloff over 120px, as macOS does) and smoothed
 * on a spring, so the magnification trails the pointer with a little weight
 * instead of snapping to it. With no pointer (Infinity) it relaxes to rest.
 */
function DockIcon({
  pointerX,
  className,
  children,
}: {
  pointerX: MotionValue<number>
  className: string
  children: React.ReactNode
}) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const closeness = useTransform(pointerX, (x) => {
    const r = ref.current?.getBoundingClientRect()
    if (!r || !Number.isFinite(x)) return 0
    const k = Math.max(0, 1 - Math.abs(x - (r.left + r.width / 2)) / 120)
    return k * k
  })
  const spring = { stiffness: 420, damping: 30, mass: 0.5 }
  const scale = useSpring(useTransform(closeness, (k) => 1 + 0.32 * k), spring)
  const y = useSpring(useTransform(closeness, (k) => -12 * k), spring)

  return (
    <motion.span ref={ref} style={{ scale, y }} className={`dock-icon ${className}`}>
      {children}
    </motion.span>
  )
}

/* ---- menu bar pieces ------------------------------------------------------- */

function MenuButton({
  id,
  open,
  onToggle,
  onHover,
  className = "",
  children,
}: {
  id: MenuId
  open: boolean
  onToggle: (id: MenuId, event: React.MouseEvent<HTMLButtonElement>) => void
  onHover: () => void
  className?: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      data-menu={id}
      aria-haspopup="menu"
      aria-expanded={open}
      onClick={(event) => onToggle(id, event)}
      onPointerEnter={onHover}
      className={`cursor-default rounded-[5px] px-[8px] py-[3px] text-night-fg/75 transition-colors duration-100 focus-visible:outline-none ${
        open ? "bg-night-fg/12 text-night-fg" : "hover:bg-night-fg/8 focus-visible:bg-night-fg/8"
      } ${className}`}
    >
      {children}
    </button>
  )
}

function Menu({
  instant,
  className = "",
  children,
}: {
  instant: boolean
  className?: string
  children: React.ReactNode
}) {
  // Scales in from its title over 150ms; instant when opened from the
  // keyboard. Leaves in 100ms either way, faster than it arrived.
  return (
    <motion.div
      role="menu"
      initial={instant ? false : { opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.1, ease: EASE } }}
      transition={{ duration: 0.15, ease: EASE }}
      style={{ transformOrigin: "12px 0" }}
      className={`absolute top-full left-0 mt-[6px] min-w-[230px] rounded-[10px] border border-night-fg/12 bg-night-panel/95 p-[5px] shadow-[0_0_0_1px_rgb(0_0_0/0.4),0_18px_50px_rgb(0_0_0/0.55)] backdrop-blur-[12px] ${className}`}
    >
      {children}
    </motion.div>
  )
}

function MenuRule() {
  return <div role="separator" className="mx-2 my-[5px] h-px bg-night-fg/10" />
}

function MenuItem({
  children,
  onSelect,
  href,
  role = "menuitem",
  checked,
  shortcut,
}: {
  children: React.ReactNode
  onSelect: () => void
  href?: string
  role?: "menuitem" | "menuitemradio"
  checked?: boolean
  shortcut?: string
}) {
  const className =
    "menu-item flex w-full cursor-default items-center gap-3 rounded-[6px] px-[10px] py-[6px] text-left text-[13px] text-night-fg transition-colors duration-75 hover:bg-oxblood hover:text-paper focus-visible:bg-oxblood focus-visible:text-paper focus-visible:outline-none"
  const tick = (
    <span className="w-[10px] font-mono text-[11px]" aria-hidden="true">
      {checked ? "✓" : ""}
    </span>
  )
  if (href) {
    return (
      <a role={role} href={href} onClick={onSelect} tabIndex={-1} className={className}>
        {tick}
        <span className="flex-1">{children}</span>
      </a>
    )
  }
  return (
    <button
      type="button"
      role={role}
      aria-checked={role === "menuitemradio" ? Boolean(checked) : undefined}
      onClick={onSelect}
      tabIndex={-1}
      className={className}
    >
      {tick}
      <span className="flex-1">{children}</span>
      {shortcut && (
        <span className="font-mono text-[11px] opacity-60" aria-hidden="true">
          {shortcut}
        </span>
      )}
    </button>
  )
}

/* ---- Spotlight ------------------------------------------------------------- */

function Spotlight({
  instant,
  onClose,
  onOpen,
}: {
  instant: boolean
  onClose: () => void
  onOpen: (index: number) => void
}) {
  const [query, setQuery] = React.useState("")
  const [cursor, setCursor] = React.useState(0)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    inputRef.current?.focus({ preventScroll: true })
  }, [])

  const needle = query.trim().toLowerCase()
  const matches = products
    .map((product, index) => ({ product, index }))
    .filter(
      ({ product }) =>
        needle === "" ||
        `${product.name} ${product.kicker} ${product.tag}`.toLowerCase().includes(needle)
    )
  const safeCursor = Math.min(cursor, Math.max(0, matches.length - 1))

  const onKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      event.preventDefault()
      onClose()
    } else if (event.key === "ArrowDown") {
      event.preventDefault()
      setCursor((c) => (matches.length ? (Math.min(c, matches.length - 1) + 1) % matches.length : 0))
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      setCursor((c) =>
        matches.length ? (Math.min(c, matches.length - 1) - 1 + matches.length) % matches.length : 0
      )
    } else if (event.key === "Enter") {
      event.preventDefault()
      const hit = matches[safeCursor]
      if (hit) onOpen(hit.index)
    }
  }

  // The scrim fades; the panel drops in from just above its resting place
  // over 160ms and leaves in 120ms. Both are instant when opened from ⌘K.
  return (
    <motion.div
      initial={instant ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.12, ease: EASE } }}
      transition={{ duration: 0.16, ease: EASE }}
      className="absolute inset-0 z-40"
    >
      <button
        type="button"
        aria-label={productDesktop.spotlight.close}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-night-deep/40"
      />
      <motion.div
        role="dialog"
        aria-label={productDesktop.spotlight.label}
        initial={instant ? false : { opacity: 0, y: -6, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.12, ease: EASE } }}
        transition={{ duration: 0.16, ease: EASE }}
        className="absolute top-[10%] left-1/2 w-[min(540px,calc(100%-24px))] -translate-x-1/2 overflow-hidden rounded-[12px] border border-night-fg/14 bg-night-panel/95 shadow-[0_0_0_1px_rgb(0_0_0/0.4),0_30px_80px_rgb(0_0_0/0.6)] backdrop-blur-[20px]"
      >
        <div className="flex items-center gap-3 px-4">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="shrink-0 text-night-fg/60" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setCursor(0)
            }}
            onKeyDown={onKey}
            placeholder={productDesktop.spotlight.placeholder}
            aria-label={productDesktop.spotlight.label}
            aria-activedescendant={matches[safeCursor] ? `spotlight-${matches[safeCursor].index}` : undefined}
            autoComplete="off"
            spellCheck={false}
            className="h-[52px] min-w-0 flex-1 bg-transparent text-[17px] text-night-fg outline-none placeholder:text-night-fg/40"
          />
          <kbd className="hidden rounded-[5px] border border-night-fg/15 px-[6px] py-[2px] font-mono text-[10px] text-night-fg/50 sm:inline">
            esc
          </kbd>
        </div>

        <div role="listbox" aria-label={productDesktop.spotlight.results} className="border-t border-night-fg/10 p-[5px]">
          {matches.length === 0 ? (
            <div className="px-3 py-[10px] text-[13px] text-night-fg/50">{productDesktop.spotlight.empty}</div>
          ) : (
            matches.map(({ product, index }, i) => (
              <button
                key={product.name}
                type="button"
                id={`spotlight-${index}`}
                role="option"
                aria-selected={i === safeCursor}
                onMouseEnter={() => setCursor(i)}
                onClick={() => onOpen(index)}
                className={`flex w-full cursor-pointer items-center gap-3 rounded-[7px] px-[10px] py-[7px] text-left transition-colors duration-75 ${
                  i === safeCursor ? "bg-oxblood text-paper" : "text-night-fg"
                }`}
              >
                <span className="flex size-[26px] shrink-0 items-center justify-center rounded-[7px] bg-[linear-gradient(135deg,#8E2030,#C93B52)] font-mono text-[11px] font-semibold text-paper">
                  {product.glyph}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-medium">{product.name}</span>
                  <span className={`block truncate text-[11.5px] ${i === safeCursor ? "text-paper/75" : "text-night-fg/50"}`}>
                    {product.kicker}
                  </span>
                </span>
                {i === safeCursor && (
                  <span className="font-mono text-[10px] opacity-70" aria-hidden="true">
                    {productDesktop.spotlight.open} ↵
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
