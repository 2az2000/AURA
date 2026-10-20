import { useRef } from 'react'
import { useAnimationFrame, useReducedMotion, useScroll } from 'motion/react'
import { adaptive } from '../../content/copy'
import { clamp, smooth } from '../../lib/math'
import { FadeUp, LineReveal } from '../ui/Reveal'
import { SectionHead } from '../ui/SectionHead'

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
 * `cancel` goes 0→1 as the diagram scrolls into view, so the third line
 * *becomes* flat while you watch — the section's whole argument in one gesture.
 */
function WaveDiagram() {
  const box = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const p1 = useRef<SVGPathElement>(null)
  const p2 = useRef<SVGPathElement>(null)
  const p3 = useRef<SVGPathElement>(null)
  const { scrollYProgress } = useScroll({ target: box, offset: ['start 95%', 'start 45%'] })

  useAnimationFrame((time) => {
    const t = reduce ? 0 : time / 1000
    const cancel = reduce ? 1 : smooth(clamp(scrollYProgress.get()))
    p1.current?.setAttribute('d', pathFor((x) => noise(x, t)))
    p2.current?.setAttribute('d', pathFor((x) => -noise(x, t) * cancel))
    p3.current?.setAttribute('d', pathFor((x) => noise(x, t) * (1 - cancel)))
  })

  const rows = [
    { ref: p1, ...adaptive.legend[0], stroke: 'var(--color-mist)', width: 1.25 },
    { ref: p2, ...adaptive.legend[1], stroke: 'var(--color-silver)', width: 1.25 },
    { ref: p3, ...adaptive.legend[2], stroke: 'var(--color-ice)', width: 2 },
  ]

  return (
    <div ref={box} role="img" aria-label="Diagram: ambient noise plus its inverted copy sums to a flat line.">
      {rows.map((r, i) => (
        <div key={r.key} className="grid grid-cols-[7.5rem_1fr] items-center gap-4 border-t border-silver/15 md:grid-cols-[11rem_1fr]">
          <p className="label flex gap-3">
            <span className="text-ice">{String(i + 1).padStart(2, '0')}</span>
            <span className={i === 2 ? 'text-bone' : ''}>{r.text}</span>
          </p>
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-12 w-full md:h-20" aria-hidden="true">
            <line x1="0" y1={H / 2} x2={W} y2={H / 2} stroke="var(--color-silver)" strokeOpacity="0.12" strokeDasharray="2 6" vectorEffect="non-scaling-stroke" />
            <path ref={r.ref} fill="none" stroke={r.stroke} strokeWidth={r.width} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>
      ))}
      <div className="border-t border-silver/15" />
    </div>
  )
}

/** 04 — Adaptive silence: the argument is the diagram, so it gets the width. */
export function Adaptive() {
  return (
    <section
      id="adaptive"
      data-shot="adaptive"
      aria-labelledby="adaptive-title"
      className="layer-fg scrim flex min-h-svh flex-col justify-between gap-16 py-[14svh] max-md:gap-8 max-md:pb-[8svh] max-md:pt-[44svh]"
    >
      <div className="wrap grid grid-cols-12 gap-y-8">
        <div className="col-span-12 md:col-span-8">
          <FadeUp>
            <SectionHead index={adaptive.index} label={adaptive.label} />
          </FadeUp>
          <LineReveal
            id="adaptive-title"
            lines={adaptive.title}
            className="display mt-8 text-[length:var(--text-h2)]"
          />
        </div>
        <FadeUp delay={0.2} className="col-span-12 md:col-span-4 md:col-start-1">
          <p className="lead max-md:text-base">{adaptive.body}</p>
        </FadeUp>
      </div>

      <div className="wrap">
        <WaveDiagram />
      </div>
    </section>
  )
}
