import { motion, useTransform } from 'motion/react'
import { useIntroSegment } from '../motion/intro'

/**
 * Viewfinder reticle for the arrival's macro shot: concentric ring with ticks, corner brackets, a short
 * caption. It is "pressed" onto the face plate at the start of the title sequence and dissolves as the
 * camera pulls back (intro 1.1 → 2.3 s). Centered on the screen, pointer-events none.
 */
export function MacroReticle({ caption }: { caption: string }) {
  const out = useIntroSegment(1.1, 2.3, 'inOut')
  const opacity = useTransform(out, [0, 1], [1, 0])
  const scale = useTransform(out, [0, 1], [1, 1.25])
  const arrive = useIntroSegment(0.2, 0.9)
  const draw = useIntroSegment(0.3, 1.3)
  return (
    <motion.div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[3] grid place-items-center" style={{ opacity }}>
      <motion.div className="relative" style={{ scale, opacity: arrive, width: 'min(62vh, 80vw)', height: 'min(62vh, 80vw)' }}>
        <svg viewBox="-100 -100 200 200" className="h-full w-full overflow-visible" fill="none">
          <motion.circle r="92" stroke="rgb(244 245 247 / 0.7)" strokeWidth="1" vectorEffect="non-scaling-stroke" style={{ pathLength: draw }} />
          <circle r="70" stroke="rgb(191 200 213 / 0.25)" strokeWidth="1" strokeDasharray="1 6" vectorEffect="non-scaling-stroke" />
          {Array.from({ length: 60 }, (_, i) => {
            const a = (i / 60) * Math.PI * 2
            const r2 = i % 5 === 0 ? 100 : 96
            return <line key={i} x1={Math.sin(a) * 92} y1={-Math.cos(a) * 92} x2={Math.sin(a) * r2} y2={-Math.cos(a) * r2} stroke="rgb(191 200 213 / 0.5)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          })}
          <path d="M-14 0H14M0 -14V14" stroke="rgb(131 184 255)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          {/* corner brackets */}
          {[
            'M-96 -80V-96H-80',
            'M96 -80V-96H80',
            'M-96 80V96H-80',
            'M96 80V96H80',
          ].map((d) => (
            <path key={d} d={d} stroke="rgb(244 245 247 / 0.8)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          ))}
        </svg>
        <p className="label absolute -bottom-9 left-0 right-0 text-center text-[0.625rem]">{caption}</p>
      </motion.div>
    </motion.div>
  )
}
