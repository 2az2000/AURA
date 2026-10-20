import { useRef } from 'react'
import { useAnimationFrame, useReducedMotion, useScroll } from 'motion/react'
import { acoustics } from '../content/copy'
import { clamp, smooth } from '../lib/math'
import { DrawRule } from '../motion/Reveal'

const W = 1000
const H = 90
const STEPS = 160

/** A made-up but physically honest noise signal: three summed sine waves. */
const noise = (x: number, t: number) =>
  0.55 * Math.sin(x * 0.021 - t * 1.6) + 0.3 * Math.sin(x * 0.053 - t * 2.4 + 1.2) + 0.15 * Math.sin(x * 0.131 - t * 1.1)

function pathFor(fn: (x: number) => number) {
  let d = ''
  for (let i = 0; i <= STEPS; i++) {
    const x = (i / STEPS) * W
    const y = H / 2 - fn(x) * (H / 2 - 6)
    d += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)} `
  }
  return d
}

/**
 * Live diagram of active noise cancellation.
 * Row 1: ambient noise. Row 2: its inverse. Row 3: their sum.
 * `cancel` goes 0→1 as the diagram scrolls into view, so the third line *becomes* flat while you
 * watch. It only runs its animation loop while on screen; reduced motion shows the cancelled state.
 */
export function CancelDiagram({ className = '' }: { className?: string }) {
  const box = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const p1 = useRef<SVGPathElement>(null)
  const p2 = useRef<SVGPathElement>(null)
  const p3 = useRef<SVGPathElement>(null)
  const { scrollYProgress } = useScroll({ target: box, offset: ['start 100%', 'start 62%'] })

  useAnimationFrame((time) => {
    const r = box.current?.getBoundingClientRect()
    if (!r || r.bottom < 0 || r.top > window.innerHeight) return
    const t = reduce ? 0 : time / 1000
    const cancel = reduce ? 1 : smooth(clamp(scrollYProgress.get()))
    p1.current?.setAttribute('d', pathFor((x) => noise(x, t)))
    p2.current?.setAttribute('d', pathFor((x) => -noise(x, t) * cancel))
    p3.current?.setAttribute('d', pathFor((x) => noise(x, t) * (1 - cancel)))
  })

  const rows = [
    { ref: p1, ...acoustics.legend[0], stroke: 'var(--color-mist)', width: 1.25 },
    { ref: p2, ...acoustics.legend[1], stroke: 'var(--color-silver)', width: 1.25 },
    { ref: p3, ...acoustics.legend[2], stroke: 'var(--color-ice)', width: 2 },
  ]

  return (
    <div ref={box} className={className} role="img" aria-label="Diagram: ambient noise plus its inverted copy sums to a flat line.">
      {rows.map((r, i) => (
        <div key={r.key}>
          <DrawRule delay={i * 0.12} />
          <div className="grid grid-cols-[7.5rem_1fr] items-center gap-4 md:grid-cols-[9rem_1fr]">
            <p className="label flex gap-3">
              <span className="text-ice">{String(i + 1).padStart(2, '0')}</span>
              <span className={i === 2 ? 'text-bone' : ''}>{r.text}</span>
            </p>
            <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-12 w-full md:h-[clamp(3rem,8svh,4.5rem)]" aria-hidden="true">
              <line x1="0" y1={H / 2} x2={W} y2={H / 2} stroke="var(--color-silver)" strokeOpacity="0.12" strokeDasharray="2 6" vectorEffect="non-scaling-stroke" />
              <path ref={r.ref} fill="none" stroke={r.stroke} strokeWidth={r.width} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            </svg>
          </div>
        </div>
      ))}
      <DrawRule delay={0.4} />
    </div>
  )
}
