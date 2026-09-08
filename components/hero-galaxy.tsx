"use client"

import * as React from "react"

import { hero } from "@/content/site"
import { cn } from "@/lib/utils"

/**
 * The hero galaxy: a particle disc around a glowing core, with five capability
 * nodes orbiting it on tethers. Hovering a node (its orb or its pill) blooms
 * that node's items around it; clicking the pill pins the bloom open, which is
 * how touch users get at it. No cards, no camera moves.
 *
 * Adapted from the standalone "cogniviti-galaxy" prototype, with three changes
 * that matter:
 *
 *   - It sits on the paper ground, not a dark stage. Additive blending would
 *     wash to white on light paper, so everything blends normally and the
 *     palette is the site's own: oxblood, its lift, and the ink/rule neutrals.
 *   - three.js is bundled and loaded on demand from the client, never from a
 *     CDN at runtime. The import is deferred so it stays out of the initial
 *     bundle and never runs on the server.
 *   - The box itself ignores the pointer so it can never get between the
 *     reader and the headline. Orb hover is picked by raycasting from a
 *     window-level pointer position, which needs no pointer events on the
 *     canvas; only the pills accept the pointer directly.
 *
 * Under prefers-reduced-motion one settled frame is drawn and the loop never
 * starts; hover still works by redrawing on change, without the ease. The
 * loop also parks while the hero is scrolled out of view.
 */

type ThreeModule = typeof import("three")
type GalaxyNode = (typeof hero.galaxy.nodes)[number]

const OXBLOOD = 0x8e2030
const OXBLOOD_LIFT = 0xc86a72
const OXBLOOD_DEEP = 0x4a0b18
const INK = 0x17140f
const INK_FAINT = 0x8a8172
const RULE = 0xe8e3d9

export function HeroGalaxy({ className }: { className?: string }) {
  const hostRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const host = hostRef.current
    // Hidden below the large breakpoint: nothing to draw into.
    if (!host || host.clientWidth === 0) return

    let disposed = false
    let dispose: (() => void) | undefined

    void import("three").then((THREE) => {
      if (disposed) return
      dispose = mount(THREE, host, hero.galaxy.nodes)
    })

    return () => {
      disposed = true
      dispose?.()
    }
  }, [])

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      // Positioning is the caller's: the canvas and labels fill whatever box
      // this is given, absolute or relative.
      className={cn("pointer-events-none select-none", className)}
    />
  )
}

function glowTexture(THREE: ThreeModule, inner: string, mid: string) {
  const cv = document.createElement("canvas")
  cv.width = cv.height = 256
  const ctx = cv.getContext("2d")!
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
  g.addColorStop(0, inner)
  g.addColorStop(0.35, mid)
  g.addColorStop(1, "rgba(142,32,48,0)")
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 256, 256)
  return new THREE.CanvasTexture(cv)
}

const PILL =
  "inline-flex items-center gap-2 rounded-full border border-rule bg-paper/85 font-mono tracking-[0.14em] text-ink-soft backdrop-blur-[6px] transition-[background-color,border-color,color] duration-300"

function makeLabel(
  host: HTMLElement,
  text: string,
  product: boolean,
  kind: "node" | "item"
) {
  const el = document.createElement("div")
  el.className = cn(
    "absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap opacity-0 transition-opacity duration-500",
    kind === "node" && "pointer-events-auto cursor-pointer"
  )
  // Items are set in small sans, normal case: half the width of the mono
  // caps, which is what lets five of them fan out without touching.
  const size =
    kind === "node"
      ? "px-3 py-[6px] text-[10.5px] uppercase"
      : "px-2.5 py-[4px] font-sans text-[11px] font-medium tracking-[0.01em]"
  const dot = product
    ? "bg-oxblood shadow-[0_0_8px_rgb(200_106_114/0.8)]"
    : "bg-edge"
  el.innerHTML =
    `<span class="${PILL} ${size}">` +
    `<span class="size-[6px] rounded-full ${dot}"></span>${text}</span>`
  host.appendChild(el)
  return el
}

function mount(
  THREE: ThreeModule,
  host: HTMLDivElement,
  defs: readonly GalaxyNode[]
) {
  // Hex values below are the design tokens verbatim; keep them that way.
  THREE.ColorManagement.enabled = false

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "low-power",
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor(0x000000, 0)
  const canvas = renderer.domElement
  canvas.style.cssText =
    "position:absolute;inset:0;width:100%;height:100%;display:block"
  host.appendChild(canvas)

  const labels = document.createElement("div")
  labels.style.cssText = "position:absolute;inset:0"
  host.appendChild(labels)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100)
  const camHome = new THREE.Vector3(0, 2.8, 11.2)
  camera.position.copy(camHome)
  camera.lookAt(0, 0, 0)

  scene.add(new THREE.AmbientLight(0xfff4ea, 1.1))
  const key = new THREE.PointLight(OXBLOOD_LIFT, 2.4, 30, 0)
  scene.add(key)
  const rim = new THREE.DirectionalLight(0xffffff, 0.6)
  rim.position.set(-4, 6, -3)
  scene.add(rim)

  const world = new THREE.Group()
  scene.add(world)
  const disc = new THREE.Group()
  disc.rotation.x = 0.85
  world.add(disc)

  const GLOW = glowTexture(THREE, "rgba(200,106,114,0.9)", "rgba(142,32,48,0.45)")
  const SOFT = glowTexture(THREE, "rgba(200,106,114,0.7)", "rgba(142,32,48,0.2)")

  /* ---- core ---- */
  const core = new THREE.Group()
  world.add(core)
  core.add(
    new THREE.Mesh(
      new THREE.SphereGeometry(0.62, 64, 64),
      new THREE.MeshStandardMaterial({
        color: OXBLOOD,
        emissive: OXBLOOD,
        emissiveIntensity: 0.45,
        roughness: 0.45,
      })
    )
  )
  const coreGlow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: GLOW,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
    })
  )
  coreGlow.scale.setScalar(3.4)
  core.add(coreGlow)
  const shell = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.95, 1),
    new THREE.MeshBasicMaterial({
      color: OXBLOOD,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    })
  )
  core.add(shell)
  const shell2 = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.25, 0),
    new THREE.MeshBasicMaterial({
      color: OXBLOOD,
      wireframe: true,
      transparent: true,
      opacity: 0.1,
    })
  )
  core.add(shell2)
  core.scale.setScalar(0.001)

  /* ---- particle disc ---- */
  const N = 6000
  const pos = new Float32Array(N * 3)
  const col = new Float32Array(N * 3)
  const sz = new Float32Array(N)
  const cA = new THREE.Color(OXBLOOD_LIFT)
  const cB = new THREE.Color(OXBLOOD)
  const cC = new THREE.Color(OXBLOOD_DEEP)
  for (let i = 0; i < N; i++) {
    const r = Math.pow(Math.random(), 0.55) * 5.6 + 0.7
    const arm = Math.floor(Math.random() * 3) * ((Math.PI * 2) / 3)
    const a = r * 0.9 + arm + (Math.random() - 0.5) * 0.9
    const spread = (Math.random() - 0.5) * (0.12 + r * 0.05)
    pos[i * 3] = Math.cos(a) * r + (Math.random() - 0.5) * 0.5
    pos[i * 3 + 1] = spread
    pos[i * 3 + 2] = Math.sin(a) * r + (Math.random() - 0.5) * 0.5
    const k = r / 6.3
    const c = cA
      .clone()
      .lerp(cB, Math.min(k * 1.6, 1))
      .lerp(cC, Math.max(0, (k - 0.5) * 2) * 0.8)
    col[i * 3] = c.r
    col[i * 3 + 1] = c.g
    col[i * 3 + 2] = c.b
    sz[i] = Math.random()
  }
  const pg = new THREE.BufferGeometry()
  pg.setAttribute("position", new THREE.BufferAttribute(pos, 3))
  pg.setAttribute("color", new THREE.BufferAttribute(col, 3))
  pg.setAttribute("aSize", new THREE.BufferAttribute(sz, 1))
  const pm = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    vertexColors: true,
    uniforms: {
      uTime: { value: 0 },
      uOpacity: { value: 0 },
      uPR: { value: renderer.getPixelRatio() },
    },
    vertexShader: `
      attribute float aSize; varying vec3 vC; varying float vA;
      uniform float uTime; uniform float uPR;
      void main(){
        vC = color; vec3 p = position; float d = length(p.xz);
        // Rigid rotation: every particle turns at the same rate, so the
        // spiral arms keep their shape. Radius-dependent speed (the
        // prototype's 0.35/d term) winds the arms up until they dissolve.
        float ang = uTime * 0.05; float c = cos(ang), s = sin(ang);
        p.xz = mat2(c,-s,s,c) * p.xz;
        p.y += sin(uTime*.8 + d*2.0 + aSize*6.28) * .04;
        vec4 mv = modelViewMatrix * vec4(p,1.0); gl_Position = projectionMatrix * mv;
        vA = .35 + aSize*.65;
        gl_PointSize = (1.2 + aSize*2.6) * uPR * (9.0 / -mv.z);
      }`,
    fragmentShader: `
      varying vec3 vC; varying float vA; uniform float uOpacity;
      void main(){
        vec2 u = gl_PointCoord - .5; float d = length(u); if (d > .5) discard;
        float a = smoothstep(.5, .05, d);
        gl_FragColor = vec4(vC, a * vA * uOpacity);
      }`,
  })
  disc.add(new THREE.Points(pg, pm))

  /* ---- orbit guides ---- */
  for (const [inner, outer, segs, opacity] of [
    [2.2, 2.215, 128, 0.1],
    [3.35, 3.365, 160, 0.07],
  ] as const) {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(inner, outer, segs),
      new THREE.MeshBasicMaterial({
        color: INK,
        transparent: true,
        opacity,
        side: THREE.DoubleSide,
      })
    )
    ring.rotation.x = -Math.PI / 2
    disc.add(ring)
  }

  /* ---- capability nodes and their items ---- */
  const tether = (opacity: number) =>
    new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(),
        new THREE.Vector3(),
      ]),
      new THREE.LineBasicMaterial({ color: OXBLOOD, transparent: true, opacity })
    )
  const setLine = (
    line: InstanceType<ThreeModule["Line"]>,
    i: 0 | 1,
    p: InstanceType<ThreeModule["Vector3"]>
  ) => {
    const attr = line.geometry.attributes.position as InstanceType<
      ThreeModule["BufferAttribute"]
    >
    attr.setXYZ(i, p.x, p.y, p.z)
    attr.needsUpdate = true
  }

  const pickables: InstanceType<ThreeModule["Mesh"]>[] = []

  const nodes = defs.map((def, i) => {
    const g = new THREE.Group()
    disc.add(g)
    const orb = new THREE.Mesh(
      new THREE.SphereGeometry(def.product ? 0.17 : 0.13, 32, 32),
      new THREE.MeshStandardMaterial({
        color: def.product ? OXBLOOD : RULE,
        emissive: def.product ? OXBLOOD : INK_FAINT,
        emissiveIntensity: def.product ? 0.5 : 0.25,
        roughness: 0.4,
      })
    )
    g.add(orb)
    const glow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: SOFT,
        transparent: true,
        opacity: def.product ? 0.7 : 0.35,
        depthWrite: false,
      })
    )
    glow.scale.setScalar(def.product ? 1.4 : 1.0)
    g.add(glow)

    // Invisible hit sphere for the raycast. It grows while the bloom is open
    // so the pointer can travel out to the items without closing it.
    const hit = new THREE.Mesh(
      new THREE.SphereGeometry(1, 12, 12),
      new THREE.MeshBasicMaterial({ visible: false })
    )
    hit.scale.setScalar(0.45)
    hit.userData.node = i
    g.add(hit)
    pickables.push(hit)

    const line = tether(0.18)
    disc.add(line)

    const pulse = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: SOFT,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
      })
    )
    pulse.scale.setScalar(0.35)
    disc.add(pulse)

    const label = makeLabel(labels, def.label, def.product, "node")
    label.addEventListener("pointerenter", () => setLabelHover(i))
    label.addEventListener("pointerleave", () => setLabelHover(-1))
    label.addEventListener("click", () => setPinned(pinned === i ? -1 : i))

    const items = def.items.map((text) => {
      const ig = new THREE.Group()
      disc.add(ig)
      ig.visible = false
      ig.add(
        new THREE.Mesh(
          new THREE.SphereGeometry(0.07, 16, 16),
          new THREE.MeshBasicMaterial({
            color: def.product ? OXBLOOD_LIFT : RULE,
          })
        )
      )
      const ln = tether(0.3)
      ln.visible = false
      disc.add(ln)
      return {
        g: ig,
        line: ln,
        label: makeLabel(labels, text, def.product, "item"),
      }
    })

    g.scale.setScalar(0.001)
    return {
      def,
      g,
      glow,
      hit,
      line,
      pulse,
      label,
      items,
      phase: i * 1.3,
      open: 0,
    }
  })

  /* ---- hover and pin state ---- */
  let rayHover = -1
  let labelHover = -1
  let pinned = -1
  const active = () =>
    pinned >= 0 ? pinned : labelHover >= 0 ? labelHover : rayHover

  function setLabelHover(i: number) {
    labelHover = i
    if (reduceMotion) drawFrame(10)
  }
  function setPinned(i: number) {
    pinned = i
    if (reduceMotion) drawFrame(10)
  }

  const ray = new THREE.Raycaster()
  const ndc = new THREE.Vector2(2, 2)
  const par = new THREE.Vector2()
  const parT = new THREE.Vector2()

  const onPointer = (e: PointerEvent) => {
    parT.set(
      (e.clientX / window.innerWidth) * 2 - 1,
      -((e.clientY / window.innerHeight) * 2 - 1)
    )
    const r = canvas.getBoundingClientRect()
    const inside =
      e.clientX >= r.left &&
      e.clientX <= r.right &&
      e.clientY >= r.top &&
      e.clientY <= r.bottom
    if (!inside) {
      ndc.set(2, 2)
      if (rayHover !== -1) {
        rayHover = -1
        if (reduceMotion) drawFrame(10)
      }
      return
    }
    ndc.set(
      ((e.clientX - r.left) / r.width) * 2 - 1,
      -(((e.clientY - r.top) / r.height) * 2 - 1)
    )
    if (reduceMotion) {
      pickHover()
      drawFrame(10)
    }
  }
  window.addEventListener("pointermove", onPointer, { passive: true })

  function pickHover() {
    if (ndc.x > 1) {
      rayHover = -1
      return
    }
    ray.setFromCamera(ndc, camera)
    const h = ray.intersectObjects(pickables, false)[0]
    rayHover = h ? (h.object.userData.node as number) : -1
  }

  /* ---- sizing ---- */
  const resize = () => {
    const w = host.clientWidth
    const h = host.clientHeight
    if (!w || !h) return
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.fov = camera.aspect < 1 ? 48 : 40
    camera.updateProjectionMatrix()
    if (reduceMotion) drawFrame(10)
  }
  const ro = new ResizeObserver(resize)
  ro.observe(host)

  /* ---- frame ---- */
  const v = new THREE.Vector3()
  const p = new THREE.Vector3()
  const ease = (t: number) => 1 - Math.pow(1 - t, 3)
  const back = (t: number) => {
    const c1 = 1.5
    const c3 = c1 + 1
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
  }
  const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1)

  const toScreen = (
    vec: InstanceType<ThreeModule["Vector3"]>,
    el: HTMLElement
  ) => {
    v.copy(vec).project(camera)
    el.style.left = `${((v.x + 1) / 2) * host.clientWidth}px`
    el.style.top = `${((1 - v.y) / 2) * host.clientHeight}px`
    el.style.zIndex = String(Math.round((1 - v.z) * 1000))
  }

  let last = 0
  function drawFrame(t: number) {
    // Frame-rate independent easing: the same feel at 30fps or 144fps.
    const dt = Math.min(Math.max(t - last, 0), 0.1)
    last = t
    pm.uniforms.uTime.value = reduceMotion ? 10 : t
    pm.uniforms.uOpacity.value = ease(clamp01(t / 1.2)) * 0.85

    core.scale.setScalar(Math.max(0.001, back(clamp01((t - 0.3) / 0.9))))
    if (!reduceMotion) {
      shell.rotation.y = t * 0.25
      shell.rotation.x = t * 0.1
      shell2.rotation.y = -t * 0.12
      shell2.rotation.z = t * 0.08
      coreGlow.material.opacity = 0.7 + Math.sin(t * 1.6) * 0.1
      key.intensity = 2.1 + Math.sin(t * 1.6) * 0.3
    }

    par.lerp(parT, 1 - Math.exp(-dt * 3.5))
    world.rotation.y = par.x * 0.18
    world.rotation.x = -par.y * 0.08
    // The disc keeps turning until something is open, then holds still so the
    // bloom does not drift out from under the pointer.
    if (!reduceMotion && active() < 0) disc.rotation.y = t * 0.03

    // Pick against last frame's positions; a frame of lag is invisible.
    if (!reduceMotion) pickHover()
    const sel = active()
    const any = sel >= 0

    nodes.forEach((n, i) => {
      const start = 0.9 + i * 0.22
      const k = reduceMotion ? 1 : clamp01((t - start) / 0.9)
      const r = n.def.r * back(k)
      const a =
        n.def.a + (reduceMotion ? 0 : Math.sin(t * 0.3 + n.phase) * 0.04)
      n.g.position.set(
        Math.cos(a) * r,
        Math.sin(t * 0.9 + n.phase) * 0.06,
        Math.sin(a) * r
      )
      n.g.scale.setScalar(Math.max(0.001, k))

      const isSel = sel === i
      if (reduceMotion) n.open = isSel ? 1 : 0
      else
        n.open +=
          ((isSel ? 1 : 0) - n.open) *
          (1 - Math.exp(-dt * (isSel ? 5.5 : 9)))
      if (n.open < 0.001) n.open = 0
      // Wider hit area while the bloom is out, so the pointer can reach items.
      n.hit.scale.setScalar(isSel ? 1.35 : 0.45)

      setLine(n.line, 1, n.g.position)
      n.line.material.opacity = (isSel ? 0.45 : any ? 0.08 : 0.18) * k

      const pk = (t * 0.35 + n.phase * 0.2) % 1
      n.pulse.position.copy(n.g.position).multiplyScalar(pk)
      n.pulse.material.opacity = Math.sin(pk * Math.PI) * 0.8 * k

      n.glow.scale.setScalar(
        (n.def.product ? 1.4 : 1.0) *
          (isSel ? 1.6 : 1) *
          (1 + Math.sin(t * 2 + n.phase) * 0.08)
      )

      // The active node drops its own pill while its bloom is out: the items
      // say what it is, and the pill would only sit on top of them. The
      // element keeps its pointer events so the hover does not flicker off.
      n.label.classList.toggle("opacity-100", k > 0.85 && !any)
      n.label.classList.toggle("opacity-15", k > 0.85 && any && !isSel)
      n.g.getWorldPosition(v)
      const lift = v.clone()
      // The pill rises a little further while the bloom is out, clearing the
      // ring of items beneath it.
      lift.y += (n.def.product ? 0.42 : 0.36) + 0.2 * n.open
      toScreen(lift, n.label)

      // The bloom: items grow out of the orb and spread evenly around it on a
      // full ring, turning slowly. Neighbours alternate above and below their
      // orb, so adjacent pills never share a row.
      const m = n.items.length
      const o = back(clamp01(n.open))
      n.items.forEach((it, j) => {
        const ang = (j / m) * Math.PI * 2 - Math.PI / 2 + t * 0.06
        const rad = 1.75 * o
        p.set(
          n.g.position.x + Math.cos(ang) * rad,
          n.g.position.y + 0.05,
          n.g.position.z + Math.sin(ang) * rad
        )
        it.g.position.copy(p)
        it.g.scale.setScalar(Math.max(0.001, o))
        it.g.visible = n.open > 0.02
        it.line.visible = it.g.visible
        setLine(it.line, 0, n.g.position)
        setLine(it.line, 1, p)
        it.line.material.opacity = 0.35 * n.open

        it.g.getWorldPosition(v)
        const ip = v.clone()
        ip.y += j % 2 ? -0.34 : 0.3
        toScreen(ip, it.label)
        // Items always stack above node pills, whatever their depth.
        it.label.style.zIndex = String(2000 + Number(it.label.style.zIndex))
        // Labels come up with the growth rather than snapping in halfway.
        it.label.style.opacity = String(clamp01(o))
      })
    })

    camera.position.copy(camHome)
    camera.lookAt(0, 0, 0)
    renderer.render(scene, camera)
  }

  /* ---- loop, parked while off screen ---- */
  const t0 = performance.now()
  let raf: number | null = null
  let visible = true

  const loop = () => {
    raf = null
    if (!visible) return
    drawFrame((performance.now() - t0) / 1000)
    raf = requestAnimationFrame(loop)
  }

  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    if (visible && raf === null && !reduceMotion) {
      raf = requestAnimationFrame(loop)
    }
  })
  io.observe(host)

  resize()
  if (reduceMotion) {
    drawFrame(10)
  } else {
    raf = requestAnimationFrame(loop)
  }

  return () => {
    visible = false
    if (raf !== null) cancelAnimationFrame(raf)
    io.disconnect()
    ro.disconnect()
    window.removeEventListener("pointermove", onPointer)
    scene.traverse((obj) => {
      const mesh = obj as { geometry?: { dispose(): void }; material?: unknown }
      mesh.geometry?.dispose()
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      for (const m of mats) (m as { dispose?(): void } | undefined)?.dispose?.()
    })
    GLOW.dispose()
    SOFT.dispose()
    renderer.dispose()
    canvas.remove()
    labels.remove()
  }
}
