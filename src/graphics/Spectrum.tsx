import { useRef } from 'react'
import { motion, useAnimationFrame, useReducedMotion } from 'motion/react'
import { acoustics } from '../content/copy'
import { DrawRule } from '../motion/Reveal'
import { duration, ease } from '../motion/tokens'

const BARS = 64
const W = 1000
const H = 200

/** Procedural "music-like" level for bar i at time t: bass-heavy envelope with moving peaks. NOT data. */
const level = (i: number, t: number) => {
  const u = i / (BARS - 1)
  const env = Math.exp(-u * 2.2) * 0.75 + 0.18
  const wob = 0.5 + 0.5 * Math.sin(u * 19 - t * 1.6) * Math.sin(u * 7 + t * 0.9 + 1.2)
  const beat = 0.5 + 0.5 * Math.sin(t * 2.4 + u * 4)
  return Math.min(1, env * (0.35 + 0.65 * wob) * (0.7 + 0.3 * beat))
}

/**
 * Audio-spectrum bars + a smooth frequency curve on a log-frequency axis, labelled as illustrative.
 * The axis labels (20 Hz – 20 kHz) are the generally accepted range of human hearing; the
 * bars and the curve are drawn for this page and are not a measurement of any product.
 */
export function Spectrum({ className = '' }: { className?: string }) {
  const box = useRef<HTMLDivElement>(null)
  const bars = useRef<(SVGRectElement | null)[]>([])
  const reduce = useReducedMotion()
  const s = acoustics.spectrum

  useAnimationFrame((time) => {
    const r = box.current?.getBoundingClientRect()
    if (!r || r.bottom < 0 || r.top > window.innerHeight) return
    const t = reduce ? 2.4 : time / 1000
    for (let i = 0; i < BARS; i++) {
      const el = bars.current[i]
      if (!el) continue
      const h = Math.max(2, level(i, t) * (H - 14))
      el.setAttribute('y', String(H - h))
      el.setAttribute('height', String(h))
    }
  })

  // smooth curve through sampled levels at t = const
  let curve = ''
  for (let i = 0; i <= 80; i++) {
    const u = i / 80
    const y = H - (0.12 + 0.55 * Math.exp(-Math.pow((u - 0.22) / 0.18, 2)) + 0.38 * Math.exp(-Math.pow((u - 0.68) / 0.12, 2))) * (H - 14)
    curve += `${i === 0 ? 'M' : 'L'}${(u * W).toFixed(1)} ${y.toFixed(1)} `
  }

  return (
    <div ref={box} className={className}>
      <div className="flex items-baseline justify-between">
        <h3 className="label text-bone">{s.title}</h3>
        <p className="label text-[0.625rem]">Illustrative</p>
      </div>
      <DrawRule className="mt-3" />
      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-24 w-full md:h-28" role="img" aria-label="Illustration of an audio spectrum across the audible range">
          {Array.from({ length: BARS }, (_, i) => (
            <rect
              key={i}
              ref={(el) => {
                bars.current[i] = el
              }}
              x={(i / BARS) * W + 2}
              width={W / BARS - 5}
              y={H - 8}
              height={8}
              fill={i % 8 === 0 ? 'rgb(131 184 255 / 0.75)' : 'rgb(191 200 213 / 0.35)'}
            />
          ))}
          <motion.path
            d={curve}
            fill="none"
            stroke="rgb(244 245 247 / 0.9)"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
            initial={reduce ? false : { pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: duration.cinematic * 1.6, ease: ease.out }}
          />
        </svg>
        <div className="label mt-2 flex justify-between text-[0.625rem]">
          {s.axis.map((a) => (
            <span key={a}>{a}</span>
          ))}
        </div>
        <div className="label mt-3 grid grid-cols-3 gap-4 text-[0.625rem]">
          {s.bands.map((b, i) => (
            <span key={b} className="border-t border-silver/20 pt-2">
              <span className="text-ice">{String(i + 1).padStart(2, '0')}</span> {b}
            </span>
          ))}
        </div>
      </div>
      <p className="mt-3 text-[0.8125rem] text-mist">{s.caption}</p>
    </div>
  )
}
