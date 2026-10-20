import { createContext, useContext, useEffect, useMemo, useRef, type ReactNode } from 'react'
import { animate, useMotionValue, useReducedMotion, useTransform, type MotionValue } from 'motion/react'
import { intro as T, easeFn } from './tokens'

/**
 * The title sequence.
 *
 * One MotionValue (`progress`, 0 → 1 over `intro.total` seconds, linear) is the
 * master clock. The DOM (header, wordmark, headline) and the 3D rig (light,
 * camera, product arrival) each read slices of it, so every part of the opening
 * is choreographed against the same timeline rather than separate timers.
 *
 * It never blocks: content is in the DOM and the page scrolls from the first
 * frame. Any wheel / touch / key / pointer press — or scrolling — fast-forwards it.
 * Under `prefers-reduced-motion` it is simply complete.
 */
interface IntroContext {
  progress: MotionValue<number>
  skip: () => void
}

const Ctx = createContext<IntroContext | null>(null)

/** QA only: `?intro=1.2` freezes the title sequence at 1.2 s (for inspecting a single frame). */
const frozenAt = () => {
  if (typeof window === 'undefined') return null
  const v = new URLSearchParams(window.location.search).get('intro')
  const n = v === null ? NaN : parseFloat(v)
  return Number.isFinite(n) ? Math.min(1, Math.max(0, n / T.total)) : null
}

export function IntroProvider({ ready, children }: { ready: boolean; children: ReactNode }) {
  const reduce = useReducedMotion()
  const frozen = useRef(frozenAt())
  const progress = useMotionValue(frozen.current ?? (reduce ? 1 : 0))
  const started = useRef(false)
  const controls = useRef<ReturnType<typeof animate> | null>(null)

  const run = () => {
    if (started.current || frozen.current !== null) return
    started.current = true
    controls.current = animate(progress, 1, { duration: T.total, ease: 'linear' })
  }

  const skip = () => {
    if (frozen.current !== null || progress.get() >= 1) return
    started.current = true
    controls.current?.stop()
    controls.current = animate(progress, 1, { duration: T.skip, ease: easeFn.out })
  }

  // Start when the 3D scene is ready — or after a short grace period, whichever is first.
  useEffect(() => {
    if (reduce || frozen.current !== null) return
    if (ready) run()
    const t = window.setTimeout(run, T.maxWait * 1000)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, reduce])

  // Visitors who act should never wait.
  useEffect(() => {
    const events = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const
    const on = () => skip()
    events.forEach((e) => window.addEventListener(e, on, { passive: true, once: true }))
    const onScroll = () => window.scrollY > 40 && skip()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      events.forEach((e) => window.removeEventListener(e, on))
      window.removeEventListener('scroll', onScroll)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const value = useMemo(() => ({ progress, skip }), [progress])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useIntro() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useIntro must be used inside <IntroProvider>')
  return c
}

/**
 * A 0 → 1 slice of the title sequence, between times `from` and `to` (seconds).
 * Optionally eased.
 */
export function useIntroSegment(from: number, to: number, ease: 'out' | 'inOut' | 'linear' = 'out') {
  const { progress } = useIntro()
  return useTransform(progress, [from / T.total, to / T.total], [0, 1], {
    clamp: true,
    ease: ease === 'linear' ? undefined : easeFn[ease],
  })
}
