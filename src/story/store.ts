import { useSyncExternalStore } from 'react'
import { clamp, lerp, smooth } from '../lib/math'
import { shotsTall, shotsWide, type HotspotId, type Shot } from './storyboard'

/**
 * The story store: turns scroll position into
 *  - an interpolated camera/product `pose` (read by the 3D rig every frame),
 *  - the `activeId` (nearest shot) that DOM UI uses (nav indicator, panels),
 *  - per-hotspot visibility `weights`.
 *
 * It is plain module state (not React state) so scrolling never re-renders; React
 * components subscribe only to the small `activeId` value through useSyncExternalStore.
 * It also works without WebGL — the DOM UI does not depend on the canvas.
 *
 * Sections opt in with `data-shot="<id>"`; the centre of each element is its shot's anchor.
 *
 * The store is route-aware: each page calls `configure()` with its own storyboard, which bumps
 * `epoch` so the Rig snaps to the new page's first pose. A page can also `hold()` an interactive
 * pose while one of its shots is active (used by the /product inspector).
 */
type Listener = () => void
export type Arrival = 'spin' | 'macro'

const clone = (s: Shot): Shot => ({ ...s, field: { ...s.field }, hotspots: [] })

class StoryStore {
  private centers: number[] = []
  private portrait = false
  private frame = 0
  private started = false
  private listeners = new Set<Listener>()
  private wake = new Set<Listener>()
  private wide: Shot[] = shotsWide
  private tall: Shot[] = shotsTall
  private heldFor: string | null = null
  private held: Shot | null = null

  /** Interpolated pose for the current scroll position (mutated in place). */
  pose: Shot = clone(shotsWide[0])
  /** id of the shot whose anchor is nearest to the viewport centre. */
  activeId = shotsWide[0].id
  /** 0..1 visibility of each hotspot in the current pose. */
  weights: Partial<Record<HotspotId, number>> = {}
  /** Index of the shot we are leaving and progress toward the next (0..1, eased). */
  index = 0
  t = 0
  /** Bumped whenever a page configures its storyboard; the Rig re-snaps when it changes. */
  epoch = 0
  /** How the product arrives when the title sequence plays. */
  arrival: Arrival = 'spin'

  get shots() {
    return this.portrait ? this.tall : this.wide
  }

  /** Install a page's storyboard. Call before the page's `data-shot` elements are measured. */
  configure(wide: Shot[], tall: Shot[], arrival: Arrival = 'spin') {
    this.wide = wide
    this.tall = tall
    this.arrival = arrival
    this.heldFor = null
    this.held = null
    this.centers = []
    this.activeId = (this.portrait ? tall : wide)[0].id
    this.epoch++
    // measure once the new page's DOM exists
    requestAnimationFrame(() => requestAnimationFrame(() => this.measure()))
    this.listeners.forEach((l) => l())
  }

  /**
   * While the shot `forShot` is the active one, use `pose` instead of the scroll-interpolated one.
   * Pass `null` to release. Used for interactive camera control that is not tied to scroll.
   */
  hold(forShot: string, pose: Shot | null) {
    this.heldFor = pose ? forShot : null
    this.held = pose
    this.update()
  }

  /** Recompute shot centres from the DOM. */
  measure() {
    if (typeof window === 'undefined') return
    this.portrait = window.innerHeight > window.innerWidth * 1.05
    this.centers = this.shots.map((s) => {
      const el = document.querySelector<HTMLElement>(`[data-shot="${s.id}"]`)
      if (!el) return NaN
      const r = el.getBoundingClientRect()
      return r.top + window.scrollY + r.height / 2
    })
    this.update()
  }

  /** Call once on the client. Safe to call repeatedly. */
  init() {
    if (this.started || typeof window === 'undefined') return
    this.started = true
    const schedule = () => {
      if (this.frame) return
      this.frame = requestAnimationFrame(() => {
        this.frame = 0
        this.update()
      })
    }
    this.measure()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', () => this.measure())
    new ResizeObserver(() => this.measure()).observe(document.body)
    document.fonts?.ready.then(() => this.measure())
  }

  /** Recompute pose + active id from scroll. Cheap; allocation-free except hotspot weights. */
  update() {
    const shots = this.shots
    const c = this.centers
    if (!c.length) return
    const p = window.scrollY + window.innerHeight * 0.5

    let i = 0
    while (i < shots.length - 1 && p >= (c[i + 1] ?? Infinity)) i++
    const a = shots[i]
    const b = shots[Math.min(i + 1, shots.length - 1)]
    const span = (c[i + 1] ?? c[i] + 1) - c[i]
    const raw = Number.isFinite(span) && span > 0 ? clamp((p - c[i]) / span) : 0
    // Hold ~25% at each end, ease across the middle: the product "lands" on every shot.
    const t = smooth((raw - 0.25) / 0.5)

    const o = this.pose
    o.x = lerp(a.x, b.x, t)
    o.y = lerp(a.y, b.y, t)
    o.scale = lerp(a.scale, b.scale, t)
    o.rotX = lerp(a.rotX, b.rotX, t)
    o.rotY = lerp(a.rotY, b.rotY, t)
    o.rotZ = lerp(a.rotZ, b.rotZ, t)
    o.explode = lerp(a.explode, b.explode, t)
    o.glow = lerp(a.glow, b.glow, t)
    o.fx = lerp(a.fx, b.fx, t)
    o.fy = lerp(a.fy, b.fy, t)
    o.solo = lerp(a.solo, b.solo, t)
    o.orbit = lerp(a.orbit, b.orbit, t)
    o.field.lines = lerp(a.field.lines, b.field.lines, t)
    o.field.contour = lerp(a.field.contour, b.field.contour, t)
    o.field.beam = lerp(a.field.beam, b.field.beam, t)
    o.field.dust = lerp(a.field.dust, b.field.dust, t)
    o.field.rings = lerp(a.field.rings, b.field.rings, t)
    o.field.grid = lerp(a.field.grid, b.field.grid, t)
    o.tint = lerp(a.tint, b.tint, t)
    this.index = i
    this.t = t

    const w: Partial<Record<HotspotId, number>> = {}
    for (const h of a.hotspots) w[h] = (w[h] ?? 0) + (1 - t)
    for (const h of b.hotspots) w[h] = (w[h] ?? 0) + t
    this.weights = w

    const next = raw > 0.5 ? b.id : a.id

    // an interactive hold overrides the pose while its shot is the nearest one
    const h = this.held
    if (h && this.heldFor === next) {
      o.x = h.x
      o.y = h.y
      o.scale = h.scale
      o.rotX = h.rotX
      o.rotY = h.rotY
      o.rotZ = h.rotZ
      o.explode = h.explode
      o.glow = h.glow
      o.fx = h.fx
      o.fy = h.fy
      o.solo = h.solo
      o.tint = h.tint
      o.orbit = h.orbit
      Object.assign(o.field, h.field)
      const hw: Partial<Record<HotspotId, number>> = {}
      for (const k of h.hotspots) hw[k] = 1
      this.weights = hw
    }

    if (next !== this.activeId) {
      this.activeId = next
      this.listeners.forEach((l) => l())
    }
    this.wake.forEach((l) => l())
  }

  /** Subscribe to active-shot changes (for React). */
  subscribe = (l: Listener) => {
    this.listeners.add(l)
    return () => this.listeners.delete(l)
  }

  /** Subscribe to every scroll update (for the render loop to request frames). */
  onUpdate(l: Listener) {
    this.wake.add(l)
    return () => this.wake.delete(l)
  }

  /** Page y that centres the shot with this id in the viewport. */
  scrollTargetFor(id: string) {
    const i = this.shots.findIndex((s) => s.id === id)
    const c = this.centers[i]
    return Number.isFinite(c) ? c - window.innerHeight / 2 : null
  }
}

export const story = new StoryStore()

/** React: id of the shot currently nearest the viewport centre. */
export const useActiveShot = () =>
  useSyncExternalStore(story.subscribe, () => story.activeId, () => shotsWide[0].id)

/** React: the section id of the active shot (e.g. "anatomy-driver" → "anatomy"). */
export const useActiveSection = () => useActiveShot().split('-')[0]
