import { useEffect, useRef, useState } from 'react'
import { useAnimationFrame, useReducedMotion, useScroll } from 'motion/react'
import { acoustics } from '../content/copy'
import { cancelCopy } from '../content/play'
import { clamp, smooth } from '../lib/math'
import { DrawRule } from '../motion/Reveal'
import { play } from '../play/store'

const W = 1000
const H = 90
const STEPS = 160
/** Offset (−1…1) → shift of the inverted copy along the drawing. */
const SHIFT = 60
const START = 0.42

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

/** Test tone: the same three-component shape as the drawing (ratios 1 : 2.5 : 6.2), at audible frequencies. */
const TONES: [number, number][] = [
  [180, 0.55],
  [450, 0.3],
  [1120, 0.15],
]

/**
 * A tiny, honest demonstration of destructive interference: the tone and an inverted copy, summed, with a
 * timing offset you control. Zero offset gives exact silence. Created on first press only (never autoplays),
 * quiet, faded in and out, stopped when it leaves the screen or the tab is hidden.
 */
function useTone() {
  const ctx = useRef<AudioContext | null>(null)
  const nodes = useRef<{ master: GainNode; delayA: DelayNode; delayB: DelayNode; oscs: OscillatorNode[] } | null>(null)
  const [on, setOn] = useState(false)

  const setOffset = (o: number) => {
    const n = nodes.current
    if (!n || !ctx.current) return
    const t = ctx.current.currentTime
    n.delayA.delayTime.setTargetAtTime(Math.max(0, -o) * 0.0016, t, 0.02)
    n.delayB.delayTime.setTargetAtTime(Math.max(0, o) * 0.0016, t, 0.02)
  }

  const start = (o: number) => {
    try {
      if (!ctx.current) {
        const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        ctx.current = new AC()
      }
      const c = ctx.current
      void c.resume()
      const master = c.createGain()
      master.gain.value = 0
      master.connect(c.destination)
      const delayA = c.createDelay(0.01)
      const delayB = c.createDelay(0.01)
      const inv = c.createGain()
      inv.gain.value = -1
      delayA.connect(master)
      delayB.connect(inv).connect(master)
      const oscs: OscillatorNode[] = []
      for (const [f, a] of TONES) {
        const osc = c.createOscillator()
        osc.frequency.value = f
        const g = c.createGain()
        g.gain.value = a * 0.09
        osc.connect(g)
        g.connect(delayA)
        g.connect(delayB)
        osc.start()
        oscs.push(osc)
      }
      nodes.current = { master, delayA, delayB, oscs }
      setOffset(o)
      master.gain.setTargetAtTime(1, c.currentTime, 0.08)
      setOn(true)
    } catch {
      setOn(false)
    }
  }

  const stop = () => {
    const n = nodes.current
    const c = ctx.current
    if (!n || !c) return
    nodes.current = null
    n.master.gain.setTargetAtTime(0, c.currentTime, 0.05)
    window.setTimeout(() => {
      n.oscs.forEach((o) => o.stop())
      n.master.disconnect()
    }, 400)
    setOn(false)
  }

  useEffect(
    () => () => {
      void ctx.current?.close().catch(() => {})
    },
    [],
  )
  return { on, start, stop, setOffset }
}

/**
 * Live diagram of active noise cancellation, and a control you can play with.
 * Row 1: ambient noise. Row 2: its inverse, shifted by the timing offset. Row 3: their actual sum.
 * With the offset at zero the sum is exactly flat; the further from zero, the more noise is left. The sum is
 * computed from the two curves above it, not faked. Optional tone: press Listen (never autoplays).
 * `cancel` goes 0→1 as the diagram scrolls into view. Reduced motion freezes time but the control still works.
 */
export function CancelDiagram({ className = '' }: { className?: string }) {
  const box = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const p1 = useRef<SVGPathElement>(null)
  const p2 = useRef<SVGPathElement>(null)
  const p3 = useRef<SVGPathElement>(null)
  const offset = useRef(START)
  const [value, setValue] = useState(START)
  const touched = useRef(false)
  const nullHeld = useRef(0)
  const tone = useTone()
  const { scrollYProgress } = useScroll({ target: box, offset: ['start 100%', 'start 62%'] })

  useAnimationFrame((time, delta) => {
    const r = box.current?.getBoundingClientRect()
    if (!r || r.bottom < 0 || r.top > window.innerHeight) return
    const t = reduce ? 0 : time / 1000
    const cancel = reduce ? 1 : smooth(clamp(scrollYProgress.get()))
    const dx = offset.current * SHIFT
    p1.current?.setAttribute('d', pathFor((x) => noise(x, t)))
    p2.current?.setAttribute('d', pathFor((x) => -noise(x - dx, t) * cancel))
    p3.current?.setAttribute('d', pathFor((x) => noise(x, t) - noise(x - dx, t) * cancel))
    // found when the visitor has moved the control and rests it on zero for a moment
    if (touched.current && Math.abs(offset.current) < 0.03 && cancel > 0.9) {
      nullHeld.current += delta
      if (nullHeld.current > 350) play.found('null')
    } else nullHeld.current = 0
  })

  // stop the tone when the diagram leaves the screen or the tab is hidden
  useEffect(() => {
    const el = box.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => !e.isIntersecting && tone.stop(), { threshold: 0 })
    io.observe(el)
    const vis = () => document.hidden && tone.stop()
    document.addEventListener('visibilitychange', vis)
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', vis)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const aligned = Math.abs(value) < 0.03
  const rows = [
    { ref: p1, ...acoustics.legend[0], stroke: 'var(--color-mist)', width: 1.25 },
    { ref: p2, ...acoustics.legend[1], stroke: 'var(--color-silver)', width: 1.25 },
    { ref: p3, ...acoustics.legend[2], stroke: 'var(--color-ice)', width: 2 },
  ]

  return (
    <div ref={box} className={className}>
      <div role="img" aria-label="Diagram: ambient noise plus its inverted copy sums to a flat line when the two are aligned.">
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

      {/* the control */}
      <div className="mt-5 grid grid-cols-[7.5rem_1fr] items-center gap-4 md:grid-cols-[9rem_1fr]">
        <label htmlFor="cancel-offset" className="label">
          {cancelCopy.offset}
        </label>
        <div className="flex items-center gap-4">
          <input
            id="cancel-offset"
            type="range"
            min={-1}
            max={1}
            step={0.01}
            value={value}
            aria-valuetext={aligned ? cancelCopy.aligned : cancelCopy.off}
            onChange={(e) => {
              const v = parseFloat(e.target.value)
              touched.current = true
              offset.current = v
              setValue(v)
              tone.setOffset(v)
            }}
            className="offset-range min-w-0 flex-1"
          />
          <span aria-live="polite" className={`label w-[10.5rem] shrink-0 text-right transition-colors duration-300 ${aligned ? 'text-ice!' : ''}`}>
            {aligned ? cancelCopy.aligned : cancelCopy.hint}
          </span>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-[7.5rem_1fr] items-start gap-4 md:grid-cols-[9rem_1fr]">
        <span />
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <button type="button" className="tool" aria-pressed={tone.on} onClick={() => (tone.on ? tone.stop() : tone.start(offset.current))}>
            <span aria-hidden="true">{tone.on ? '■' : '▸'}</span>
            {tone.on ? cancelCopy.mute : cancelCopy.listen}
          </button>
          <p className="max-w-[40ch] text-[0.75rem] leading-snug text-mist">{cancelCopy.audioNote}</p>
        </div>
      </div>
    </div>
  )
}
