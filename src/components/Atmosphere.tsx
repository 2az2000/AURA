import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import { useEffect } from 'react'
import { spring } from '../motion/tokens'
import type { SceneBridge } from '../story/hotspots'

/**
 * The background atmosphere (z0). Deliberately only three things:
 *  1. a faint floor vignette,
 *  2. two soft pools of light that the 3D rig keeps under the product and crossfades
 *     between neutral (studio) and cool (technical sections) — moving the light with
 *     the product is what stops the background feeling like a flat backdrop,
 *  3. a very low-intensity radial highlight that follows the pointer (fine pointers only).
 * All are transform/opacity-only layers; no blur, no filters.
 */
export function Atmosphere({ bridge, staticFallback }: { bridge: SceneBridge; staticFallback: boolean }) {
  const reduce = useReducedMotion()
  const x = useMotionValue(-999)
  const y = useMotionValue(-999)
  const sx = useSpring(x, spring.soft)
  const sy = useSpring(y, spring.soft)

  useEffect(() => {
    if (reduce || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const on = (e: PointerEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
    }
    window.addEventListener('pointermove', on, { passive: true })
    return () => window.removeEventListener('pointermove', on)
  }, [reduce, x, y])

  const pool = 'absolute left-1/2 top-1/2 size-[96vmax] -ml-[48vmax] -mt-[48vmax] will-change-transform'
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(120% 70% at 50% 118%, #14171c 0%, rgb(11 12 14 / 0) 60%)' }}
      />
      <div
        ref={(el) => {
          bridge.poolNeutral = el
        }}
        className={pool}
        style={{
          opacity: staticFallback ? 1 : 0,
          background: 'radial-gradient(closest-side, #1d222a 0%, rgb(27 31 38 / 0.55) 38%, rgb(11 12 14 / 0) 100%)',
        }}
      />
      <div
        ref={(el) => {
          bridge.poolCool = el
        }}
        className={pool}
        style={{
          opacity: 0,
          background: 'radial-gradient(closest-side, #15283f 0%, rgb(18 34 56 / 0.5) 38%, rgb(11 12 14 / 0) 100%)',
        }}
      />
      <motion.div
        className="absolute left-0 top-0 size-[34rem] -ml-[17rem] -mt-[17rem] will-change-transform"
        style={{
          x: sx,
          y: sy,
          background: 'radial-gradient(closest-side, rgb(131 184 255 / 0.07), rgb(131 184 255 / 0) 100%)',
        }}
      />
    </div>
  )
}
