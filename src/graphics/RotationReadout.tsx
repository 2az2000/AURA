import { useRef } from 'react'
import { useAnimationFrame } from 'motion/react'
import type { SceneBridge } from '../story/hotspots'

const deg = (rad: number) => (((rad * 180) / Math.PI) % 360 + 360) % 360
const pad3 = (n: number) => String(Math.round(n) % 360).padStart(3, '0')

/**
 * A live instrument readout of the product's ACTUAL orientation (yaw and pitch, in degrees), read from
 * the 3D rig each frame, with a compass needle. It is the one place where the numbers are real: they are
 * the rotation of the model on screen right now, including pointer tilt and drag. DOM text is only
 * rewritten when the rounded value changes.
 */
export function RotationReadout({ bridge, yaw, pitch, className = '' }: { bridge: SceneBridge; yaw: string; pitch: string; className?: string }) {
  const yawEl = useRef<HTMLSpanElement>(null)
  const pitchEl = useRef<HTMLSpanElement>(null)
  const needle = useRef<SVGGElement>(null)
  const last = useRef({ y: -1, p: -1 })

  useAnimationFrame(() => {
    const y = Math.round(deg(bridge.stats.rotY))
    const p = Math.round(deg(bridge.stats.rotX))
    if (y !== last.current.y) {
      last.current.y = y
      if (yawEl.current) yawEl.current.textContent = pad3(y)
      needle.current?.setAttribute('transform', `rotate(${y})`)
    }
    if (p !== last.current.p) {
      last.current.p = p
      if (pitchEl.current) pitchEl.current.textContent = pad3(p)
    }
  })

  return (
    <div className={`pointer-events-none select-none ${className}`} aria-hidden="true">
      <div className="flex items-end gap-4">
        <svg viewBox="-50 -50 100 100" className="size-16 shrink-0" fill="none">
          <circle r="46" stroke="rgb(191 200 213 / 0.3)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <circle r="34" stroke="rgb(191 200 213 / 0.12)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          {Array.from({ length: 24 }, (_, i) => {
            const a = (i / 24) * Math.PI * 2
            const r2 = i % 6 === 0 ? 38 : 42
            return <line key={i} x1={Math.sin(a) * 46} y1={-Math.cos(a) * 46} x2={Math.sin(a) * r2} y2={-Math.cos(a) * r2} stroke="rgb(191 200 213 / 0.4)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          })}
          <g ref={needle}>
            <path d="M0 -40L5 -4H-5Z" fill="rgb(131 184 255)" />
            <path d="M0 40L3 6H-3Z" fill="rgb(191 200 213 / 0.35)" />
          </g>
        </svg>
        <div>
          <p className="label text-[0.625rem]">{yaw}</p>
          <p className="font-mono leading-none tracking-tight text-bone tabular-nums" style={{ fontSize: 'clamp(2.75rem, 6.5vw, 6rem)' }}>
            <span ref={yawEl}>000</span>
            <span className="text-ice">°</span>
          </p>
          <p className="label mt-2 text-[0.625rem]">
            {pitch} <span ref={pitchEl} className="text-bone">000</span>°
          </p>
        </div>
      </div>
    </div>
  )
}
