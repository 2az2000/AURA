import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useIntroSegment } from '../motion/intro'

const TICKS = Array.from({ length: 72 }, (_, i) => i)
const LABELS = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330]

/**
 * Orbit ring: concentric rings with degree ticks that sit behind the product (z0) and turn with scroll.
 * Draws itself in during the title sequence. The Rig positions and scales the container (via the
 * bridge) so the ring is always centred on the product. Pure SVG, transform-only animation.
 */
export function OrbitRing({ refCb }: { refCb: (el: HTMLDivElement | null) => void }) {
  const reduce = useReducedMotion()
  const { scrollY } = useScroll()
  const turn = useTransform(scrollY, [0, 3000], [0, 70])
  const draw = useIntroSegment(0.5, 2.3)

  return (
    <div
      ref={refCb}
      className="absolute left-1/2 top-1/2 will-change-transform"
      style={{ width: 'min(74vh, 68vw)', height: 'min(74vh, 68vw)', marginLeft: 'calc(min(74vh, 68vw) / -2)', marginTop: 'calc(min(74vh, 68vw) / -2)', opacity: 0 }}
    >
      <motion.svg viewBox="-500 -500 1000 1000" className="h-full w-full overflow-visible" style={{ rotate: reduce ? 0 : turn }} fill="none">
        <motion.circle r="470" stroke="rgb(191 200 213 / 0.20)" strokeWidth="1" vectorEffect="non-scaling-stroke" style={{ pathLength: draw }} />
        <circle r="446" stroke="rgb(191 200 213 / 0.10)" strokeWidth="1" strokeDasharray="2 10" vectorEffect="non-scaling-stroke" />
        <circle r="330" stroke="rgb(191 200 213 / 0.07)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        {/* the bright arc: a quarter-turn sweep */}
        <motion.path
          d="M 0 -470 A 470 470 0 0 1 470 0"
          stroke="rgb(131 184 255 / 0.75)"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
          style={{ pathLength: draw }}
        />
        {TICKS.map((i) => {
          const major = i % 6 === 0
          const a = (i / 72) * Math.PI * 2
          const r1 = 470
          const r2 = major ? 494 : 480
          return (
            <line
              key={i}
              x1={Math.sin(a) * r1}
              y1={-Math.cos(a) * r1}
              x2={Math.sin(a) * r2}
              y2={-Math.cos(a) * r2}
              stroke={major ? 'rgb(191 200 213 / 0.45)' : 'rgb(191 200 213 / 0.22)'}
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          )
        })}
        {LABELS.map((d) => {
          const a = (d / 360) * Math.PI * 2
          return (
            <text
              key={d}
              x={Math.sin(a) * 522}
              y={-Math.cos(a) * 522}
              textAnchor="middle"
              dominantBaseline="middle"
              transform={`rotate(${d} ${Math.sin(a) * 522} ${-Math.cos(a) * 522})`}
              fill="rgb(136 146 161 / 0.8)"
              style={{ font: '500 13px var(--font-mono)', letterSpacing: '0.1em' }}
            >
              {String(d).padStart(3, '0')}
            </text>
          )
        })}
        {/* index marker at 12 o'clock */}
        <path d="M -9 -452 L 9 -452 L 0 -432 Z" fill="rgb(131 184 255 / 0.9)" />
      </motion.svg>
    </div>
  )
}
