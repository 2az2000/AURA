import { useEffect, useRef } from 'react'
import { clamp, lerp, smooth } from '../lib/math'
import { shotsTall, shotsWide, type Shot } from './storyboard'

/**
 * Turns the page scroll position into an interpolated {@link Shot}.
 *
 * Sections opt in with a `data-shot="<id>"` attribute. The hook measures them
 * once (and on resize), then `sample()` can be called every frame at almost
 * no cost — it never touches React state, so scrolling never re-renders.
 *
 * Between two section centres the shot holds for a moment at each end and
 * eases across the middle, so the product "lands" on every section instead
 * of drifting constantly.
 */
export function useStory() {
  const centers = useRef<number[]>([])
  const portrait = useRef(false)
  const out = useRef<Shot>({ ...shotsWide[0] })

  useEffect(() => {
    const measure = () => {
      portrait.current = window.innerHeight > window.innerWidth * 1.05
      const shots = portrait.current ? shotsTall : shotsWide
      centers.current = shots.map((s) => {
        const el = document.querySelector<HTMLElement>(`[data-shot="${s.id}"]`)
        if (!el) return NaN
        const r = el.getBoundingClientRect()
        return r.top + window.scrollY + r.height / 2
      })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(document.body)
    window.addEventListener('resize', measure)
    // Fonts / images can change layout after first paint.
    document.fonts?.ready.then(measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])

  /** Returns the interpolated shot for the current scroll position (mutated in place). */
  const sample = (): Shot => {
    const shots = portrait.current ? shotsTall : shotsWide
    const c = centers.current
    const p = window.scrollY + window.innerHeight * 0.5
    const o = out.current

    let i = 0
    while (i < shots.length - 1 && p >= (c[i + 1] ?? Infinity)) i++
    const a = shots[i]
    const b = shots[Math.min(i + 1, shots.length - 1)]
    const span = (c[i + 1] ?? c[i] + 1) - c[i]
    const raw = Number.isFinite(span) && span > 0 ? clamp((p - c[i]) / span) : 0
    // Hold ~25% at each end, ease across the middle.
    const t = smooth((raw - 0.25) / 0.5)

    o.x = lerp(a.x, b.x, t)
    o.y = lerp(a.y, b.y, t)
    o.scale = lerp(a.scale, b.scale, t)
    o.rotX = lerp(a.rotX, b.rotX, t)
    o.rotY = lerp(a.rotY, b.rotY, t)
    o.rotZ = lerp(a.rotZ, b.rotZ, t)
    o.explode = lerp(a.explode, b.explode, t)
    o.glow = lerp(a.glow, b.glow, t)
    return o
  }

  return { sample, portrait }
}
