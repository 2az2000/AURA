import { motion, useReducedMotion, useTransform, type MotionValue } from 'motion/react'
import { frontStrokes, SHEET_BOX } from './OrthoSheet'

/**
 * A large front-view silhouette trace of the headphone (the same strokes as the homepage's
 * drawing, scaled up to fill the frame) that DRAWS ITSELF as the host scene scrolls.
 * `progress` is a 0→1 MotionValue (e.g. useScroll's scrollYProgress over the scene); each stroke owns
 * a staggered window of it. Sits behind the 3D product (z0), so the product appears to grow out of
 * its own outline. Under reduced motion the trace is complete.
 */
function Stroke({ d, progress, i, n, centre }: { d: string; progress: MotionValue<number>; i: number; n: number; centre: boolean }) {
  const start = (i / n) * 0.55
  const len = useTransform(progress, [start, start + 0.35], [0, 1], { clamp: true })
  return (
    <motion.path
      d={d}
      fill="none"
      stroke={centre ? 'rgb(131 184 255 / 0.4)' : 'rgb(191 200 213 / 0.32)'}
      strokeWidth={centre ? 1 : 1.5}
      strokeDasharray={centre ? '16 4 3 4' : undefined}
      strokeLinecap="round"
      strokeLinejoin="round"
      vectorEffect="non-scaling-stroke"
      style={{ pathLength: centre ? 1 : len, opacity: centre ? useTransform(progress, [0.4, 0.7], [0, 1]) : 1 }}
    />
  )
}

export function Silhouette({ progress, className = '' }: { progress: MotionValue<number>; className?: string }) {
  const reduce = useReducedMotion()
  const strokes = frontStrokes().filter((s) => s.kind !== 'dim' && s.kind !== 'hidden')
  const fixed = useTransform(progress, () => 1)
  return (
    <svg
      viewBox={`0 0 ${SHEET_BOX.w} ${SHEET_BOX.h}`}
      aria-hidden="true"
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      {strokes.map((s, i) => (
        <Stroke key={i} d={s.d} progress={reduce ? fixed : progress} i={i} n={strokes.length} centre={s.kind === 'center'} />
      ))}
    </svg>
  )
}
