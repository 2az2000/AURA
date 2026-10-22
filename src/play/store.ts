import { useSyncExternalStore } from 'react'
import { DISCOVERIES } from '../content/play'

/**
 * The play store: everything interactive on the homepage that is not scroll.
 *
 * Same idea as the story store: plain module state the render loops read directly (no React re-render per
 * frame), plus a small immutable `state` snapshot that React components subscribe to for UI that really
 * changes (mode, discoveries, the open part, the "view changed" flag).
 *
 *  - timestamps (`sweepAt`, `igniteAt`, `completeAt`) start one-shot sequences the Rig/FieldCanvas play
 *  - `input` is a mailbox the Rig drains each frame (keyboard nudges, reset)
 *  - `ripples` are background clicks the field shader draws
 */
export type Mode = 'studio' | 'night' | 'signal'
export type ExplorePart = 'face' | 'cover' | 'light' | 'dial' | 'pivot' | 'mic'

export interface PlayState {
  mode: Mode
  found: readonly string[]
  /** discovery id currently announced by the toast */
  toast: string | null
  explore: ExplorePart | null
  /** the visitor has turned the product away from its storyboard pose */
  turned: boolean
  /** the visitor's turn in degrees, steps of 5 (for the slider's value) */
  yaw: number
  complete: boolean
  /** the finale is playing */
  finale: boolean
}

const KEY = 'aura.found.v1'
const read = (): string[] => {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    return Array.isArray(v) ? v.filter((x) => DISCOVERIES.some((d) => d.id === x)) : []
  } catch {
    return []
  }
}

type Listener = () => void
export interface Ripple {
  x: number
  y: number
  at: number
}

class Play {
  state: PlayState
  private listeners = new Set<Listener>()
  private wake = new Set<Listener>()
  private toastTimer = 0

  sweepAt = -1e9
  igniteAt = -1e9
  completeAt = -1e9
  ripples: Ripple[] = []
  input = { yaw: 0, reset: false }

  constructor() {
    const found = typeof window === 'undefined' ? [] : read()
    this.state = {
      mode: 'studio',
      found,
      toast: null,
      explore: null,
      turned: false,
      yaw: 0,
      complete: found.length >= DISCOVERIES.length,
      finale: false,
    }
  }

  private set(patch: Partial<PlayState>) {
    this.state = { ...this.state, ...patch }
    this.listeners.forEach((l) => l())
    this.wake.forEach((l) => l())
  }

  subscribe = (l: Listener) => {
    this.listeners.add(l)
    return () => this.listeners.delete(l)
  }

  /** Render loops subscribe here to request a frame when something starts. */
  onWake(l: Listener) {
    this.wake.add(l)
    return () => this.wake.delete(l)
  }
  private poke() {
    this.wake.forEach((l) => l())
  }

  /** Register a discovery. Returns true if it was new. */
  found(id: string) {
    if (this.state.found.includes(id)) return false
    const found = [...this.state.found, id]
    try {
      localStorage.setItem(KEY, JSON.stringify(found))
    } catch {
      /* private mode: progress simply lasts for the session */
    }
    window.clearTimeout(this.toastTimer)
    this.toastTimer = window.setTimeout(() => this.set({ toast: null }), 3600)
    const done = found.length >= DISCOVERIES.length
    this.set({ found, toast: id, complete: done })
    if (done) window.setTimeout(() => this.celebrate(), 3000)
    return true
  }

  /** The finale: the lights drop to one ring while the product turns once. */
  celebrate() {
    this.completeAt = performance.now()
    this.set({ finale: true })
    window.setTimeout(() => this.set({ finale: false }), 7000)
  }

  resetProgress() {
    try {
      localStorage.removeItem(KEY)
    } catch {
      /* ignore */
    }
    this.set({ found: [], toast: null, complete: false })
  }

  setMode(mode: Mode) {
    if (mode === this.state.mode) return
    this.set({ mode })
    if (mode !== 'studio') this.found('mode')
  }

  sweep() {
    this.sweepAt = performance.now()
    this.poke()
    this.found('sweep')
  }

  ignite() {
    this.igniteAt = performance.now()
    this.sweepAt = this.igniteAt
    this.poke()
    this.found('ring')
  }

  openPart(p: ExplorePart) {
    this.set({ explore: p })
    this.found('part')
    if (p === 'light') this.ignite()
  }
  closePart() {
    if (this.state.explore) this.set({ explore: null })
  }

  /** Keyboard / UI nudge of the visitor's turn, radians. */
  nudge(rad: number) {
    this.input.yaw += rad
    this.poke()
    this.found('turn')
  }
  resetView() {
    this.input.reset = true
    this.poke()
  }
  setTurned(turned: boolean, yaw = this.state.yaw) {
    if (turned === this.state.turned && yaw === this.state.yaw) return
    this.set({ turned, yaw })
  }

  addRipple(x: number, y: number) {
    this.ripples = [...this.ripples.slice(-2), { x, y, at: performance.now() }]
    this.poke()
    this.found('ripple')
  }
}

export const play = new Play()

export function usePlay<T>(select: (s: PlayState) => T): T {
  return useSyncExternalStore(play.subscribe, () => select(play.state), () => select(play.state))
}
