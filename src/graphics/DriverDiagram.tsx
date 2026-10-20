import { inspect } from '../content/product'
import { DrawRule } from '../motion/Reveal'

/**
 * Cross-section illustration of a dynamic driver: a magnet block, a voice coil, a domed diaphragm that
 * travels in and out, and rings of pressure leaving it. It illustrates how this TYPE of driver works in
 * general (the model's driver is a dynamic driver); it is not a measurement of anything.
 * The motion is two CSS animations (transform only) and stops under reduced motion.
 */
export function DriverDiagram({ className = '' }: { className?: string }) {
  const d = inspect.driverDiagram
  return (
    <figure className={`m-0 ${className}`}>
      <figcaption className="label mb-3 flex items-baseline justify-between">
        <span className="text-bone">{d.title}</span>
        <span className="text-[0.625rem]">Illustrative</span>
      </figcaption>
      <DrawRule />
      <svg viewBox="0 0 400 230" className="mt-2 w-full" role="img" aria-label={`${d.title}: ${d.caption}`} fill="none">
        {/* pressure rings leaving the diaphragm */}
        {[0, 1, 2].map((i) => (
          <path
            key={i}
            className="drv-wave"
            d="M120 74Q200 36 280 74"
            stroke="rgb(131 184 255 / 0.8)"
            strokeWidth="1.2"
            strokeLinecap="round"
            style={{ animationDelay: `${i * 0.55}s` }}
          />
        ))}
        {/* moving part: diaphragm + coil */}
        <g className="drv-move">
          <path d="M96 128Q200 70 304 128" stroke="rgb(244 245 247 / 0.9)" strokeWidth="2" strokeLinecap="round" />
          <path d="M96 128H304" stroke="rgb(191 200 213 / 0.35)" strokeWidth="1" strokeDasharray="3 5" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect key={i} x={166 + i * 12} y="132" width="7" height="26" rx="1.5" stroke="rgb(191 200 213 / 0.8)" strokeWidth="1" />
          ))}
        </g>
        {/* fixed part: magnet and frame */}
        <path d="M92 130V176H308V130" stroke="rgb(191 200 213 / 0.5)" strokeWidth="1.2" />
        <rect x="158" y="160" width="84" height="46" stroke="rgb(191 200 213 / 0.8)" strokeWidth="1.2" />
        <path d="M200 160V206" stroke="rgb(131 184 255 / 0.6)" strokeWidth="1" strokeDasharray="2 4" />
        {/* labels with leader lines */}
        {[
          { x: 318, y: 100, tx: 330, t: 'Diaphragm' },
          { x: 244, y: 145, tx: 330, t: 'Voice coil' },
          { x: 244, y: 190, tx: 330, t: 'Magnet' },
        ].map((l) => (
          <g key={l.t}>
            <path d={`M${l.x} ${l.y}H${l.tx - 6}`} stroke="rgb(191 200 213 / 0.4)" strokeWidth="1" />
            <text x={l.tx} y={l.y + 3} fill="rgb(191 200 213)" style={{ font: '500 9px var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {l.t}
            </text>
          </g>
        ))}
      </svg>
      <p className="mt-2 text-[0.8125rem] text-mist">{d.caption}</p>
    </figure>
  )
}
