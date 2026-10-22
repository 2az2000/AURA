import { useEffect, useRef } from 'react'
import { useAnimationFrame, useReducedMotion, useScroll } from 'motion/react'
import { clamp, smooth } from '../lib/math'

const W = 1600
const H = 220
const STEPS = 200
const RIBBONS = 7

/**
 * Full-bleed waveform ribbons. Seven stacked sine families whose amplitude is driven by how far
 * the host section has scrolled: loud at first, perfectly flat once the manifesto has been read.
 * It is the "subtraction" idea drawn as a picture. The animation loop only runs while on screen;
 * under reduced motion it is the final, flat state.
 */
export function WaveRibbon({ className = '' }: { className?: string }) {
  const box = useRef<HTMLDivElement>(null)
  const paths = useRef<(SVGPathElement | null)[]>([])
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: box, offset: ['start 90%', 'start 25%'] })
  // The pointer quiets the noise where it passes: a local dip in amplitude that follows it along the ribbon.
  const ptr = useRef({ u: 0.5, hot: 0, on: false })
  useEffect(() => {
    if (reduce) return
    const el = box.current
    const move = (e: PointerEvent) => {
      const r = el?.getBoundingClientRect()
      if (!r) return
      const inside = e.clientY > r.top - 40 && e.clientY < r.bottom + 40 && e.pointerType !== 'touch'
      ptr.current.on = inside
      if (inside) ptr.current.u = (e.clientX - r.left) / r.width
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [reduce])

  useAnimationFrame((time) => {
    const r = box.current?.getBoundingClientRect()
    if (!r || r.bottom < 0 || r.top > window.innerHeight) return
    const t = reduce ? 0 : time / 1000
    const calm = reduce ? 1 : smooth(clamp(scrollYProgress.get()))
    const amp = (1 - calm) * 0.92 + 0.0
    const q = ptr.current
    q.hot += ((q.on ? 1 : 0) - q.hot) * 0.08
    for (let k = 0; k < RIBBONS; k++) {
      const el = paths.current[k]
      if (!el) continue
      const f = k / (RIBBONS - 1)
      let d = ''
      for (let i = 0; i <= STEPS; i++) {
        const x = (i / STEPS) * W
        const u = i / STEPS
        const env = Math.sin(u * Math.PI) * (1 - 0.92 * q.hot * Math.exp(-(((u - q.u) / 0.09) ** 2))) // pinch at both ends; quiet under the pointer
        const w =
          Math.sin(u * 11 + t * (0.7 + f * 0.4) + k * 0.9) * 0.55 +
          Math.sin(u * 23 - t * (1.1 + f * 0.3) + k) * 0.28 +
          Math.sin(u * 47 + t * 0.6 + k * 2.1) * 0.12
        const y = H / 2 + w * amp * env * (H * 0.42) * (0.55 + f * 0.7) + (k - (RIBBONS - 1) / 2) * 5 * (1 - calm * 0.6)
        d += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)} `
      }
      el.setAttribute('d', d)
    }
  })

  return (
    <div ref={box} aria-hidden="true" className={`pointer-events-none ${className}`}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-full w-full" fill="none">
        {Array.from({ length: RIBBONS }, (_, k) => (
          <path
            key={k}
            ref={(el) => {
              paths.current[k] = el
            }}
            stroke={k === 3 ? 'rgb(131 184 255 / 0.9)' : `rgb(191 200 213 / ${0.18 + (k % 3) * 0.08})`}
            strokeWidth={k === 3 ? 1.6 : 1}
            vectorEffect="non-scaling-stroke"
            strokeLinejoin="round"
          />
        ))}
      </svg>
    </div>
  )
}
