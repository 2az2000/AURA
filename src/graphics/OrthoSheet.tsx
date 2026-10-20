import { motion, useReducedMotion } from 'motion/react'
import { duration, ease } from '../motion/tokens'

/**
 * Orthographic line drawings of the AURA headphone: front, profile, plan.
 *
 * Every dimension below is taken from the procedural model in three/Headphone.tsx (same units),
 * so the drawings and the 3D object agree — which is the point of the Form section.
 * Dimension lines carry LETTERS, never numbers: no product dimensions are being claimed.
 * Hidden edges are dashed, the centreline is dash-dot, as on a real drawing sheet.
 */
export type ViewKey = 'front' | 'profile' | 'plan'

const K = 120 // px per model unit
const VBW = 560
const VBH = 470

const INK = 'rgb(191 200 213 / 0.72)'
const HIDDEN = 'rgb(191 200 213 / 0.34)'
const DIM = 'rgb(131 184 255 / 0.85)'


/** Rounded rectangle path. */
const rr = (x: number, y: number, w: number, h: number, r: number) =>
  `M${x + r} ${y}H${x + w - r}Q${x + w} ${y} ${x + w} ${y + r}V${y + h - r}Q${x + w} ${y + h} ${x + w - r} ${y + h}H${x + r}Q${x} ${y + h} ${x} ${y + h - r}V${y + r}Q${x} ${y} ${x + r} ${y}Z`

const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx} ${cy}A${rx} ${ry} 0 1 0 ${cx + rx} ${cy}A${rx} ${ry} 0 1 0 ${cx - rx} ${cy}Z`

export interface Stroke {
  d: string
  kind?: 'ink' | 'hidden' | 'dim' | 'center'
}

/** Front view: looking along -Z. */
function front(): { strokes: Stroke[]; labels: { x: number; y: number; t: string }[] } {
  const cx = VBW / 2 - 20
  const cy = 112 + 1.75 * K
  const X = (v: number) => cx + v * K
  const Y = (v: number) => cy - v * K
  const s: Stroke[] = []
  // band: outer and inner half-ellipses + slider rectangles
  for (const [rx, ry] of [[1.0, 0.8], [0.9, 0.7]]) s.push({ d: `M${X(-rx)} ${Y(0.95)}A${rx * K} ${ry * K} 0 0 1 ${X(rx)} ${Y(0.95)}` })
  for (const sg of [-1, 1]) {
    s.push({ d: `M${X(sg * 1.0)} ${Y(0.95)}V${Y(0.74)}M${X(sg * 0.9)} ${Y(0.95)}V${Y(0.74)}` })
    s.push({ d: rr(X(sg * 0.95 - 0.056), Y(1.06), 0.112 * K, 0.32 * K, 5) })
    // cup: pad, shell, plate (mirror)
    const a = (x0: number, x1: number) => (sg > 0 ? [x0, x1] : [-x1, -x0])
    const [p0, p1] = a(0.45, 0.7)
    s.push({ d: rr(X(p0), Y(0.65), (p1 - p0) * K, 1.3 * K, 18) })
    const [s0, s1] = a(0.69, 1.19)
    s.push({ d: rr(X(s0), Y(0.67), (s1 - s0) * K, 1.34 * K, 16) })
    const [l0, l1] = a(1.19, 1.27)
    s.push({ d: rr(X(l0), Y(0.58), (l1 - l0) * K, 1.16 * K, 6) })
    // yoke seen edge-on (hidden behind the cup)
    s.push({ d: `M${X(sg * 0.95)} ${Y(0.79)}V${Y(-0.79)}`, kind: 'hidden' })
  }
  // centreline
  s.push({ d: `M${X(0)} ${Y(1.95)}V${Y(-0.85)}`, kind: 'center' })
  // dimension A (overall width) and B (overall height)
  const yA = Y(-1.0)
  s.push({ d: `M${X(-1.27)} ${Y(-0.7)}V${yA + 8}M${X(1.27)} ${Y(-0.7)}V${yA + 8}M${X(-1.27)} ${yA}H${X(1.27)}M${X(-1.27)} ${yA - 5}V${yA + 5}M${X(1.27)} ${yA - 5}V${yA + 5}`, kind: 'dim' })
  const xB = X(1.62)
  s.push({ d: `M${X(1.3)} ${Y(1.76)}H${xB + 8}M${X(1.3)} ${Y(-0.67)}H${xB + 8}M${xB} ${Y(1.76)}V${Y(-0.67)}M${xB - 5} ${Y(1.76)}H${xB + 5}M${xB - 5} ${Y(-0.67)}H${xB + 5}`, kind: 'dim' })
  return {
    strokes: s,
    labels: [
      { x: X(0), y: yA - 10, t: 'A' },
      { x: xB + 16, y: (Y(1.76) + Y(-0.67)) / 2, t: 'B' },
    ],
  }
}

/** Profile: looking along -X from the right; screen x = -z (front of the head to the right). */
function profile() {
  const cx = VBW / 2 - 40
  const cy = 112 + 1.75 * K
  const X = (z: number) => cx - z * K
  const Y = (v: number) => cy - v * K
  const s: Stroke[] = []
  s.push({ d: ellipse(X(0), Y(0), 0.551 * K, 0.672 * K) }) // shell
  s.push({ d: ellipse(X(0), Y(0), 0.476 * K, 0.58 * K) }) // plate
  s.push({ d: ellipse(X(0), Y(0), 0.545 * K, 0.665 * K), kind: 'hidden' }) // pad behind
  // yoke arc over the top + pivots
  s.push({ d: `M${X(0.62)} ${Y(0)}A${0.62 * K} ${0.79 * K} 0 0 0 ${X(-0.62)} ${Y(0)}` })
  for (const z of [-0.47, 0.47]) s.push({ d: ellipse(X(z), Y(0), 0.05 * K, 0.05 * K) })
  // slider + band (edge-on band is a strip 0.34 deep)
  s.push({ d: rr(X(0.17), Y(1.06), 0.34 * K, 0.32 * K, 8) })
  s.push({ d: `M${X(0.17)} ${Y(1.06)}V${Y(1.72)}Q${X(0)} ${Y(1.78)} ${X(-0.17)} ${Y(1.72)}V${Y(1.06)}` })
  // dial and button protrude from the front edge
  s.push({ d: rr(X(0.575), Y(-0.3 + 0.087), 0.085 * K, 0.174 * K, 4) })
  s.push({ d: rr(X(0.57), Y(0.3 + 0.087), 0.075 * K, 0.174 * K, 4) })
  s.push({ d: `M${X(0)} ${Y(1.95)}V${Y(-0.85)}M${X(-0.9)} ${Y(0)}H${X(0.9)}`, kind: 'center' })
  // dimension C (depth) and B
  const yC = Y(-0.95)
  s.push({ d: `M${X(0.551)} ${Y(-0.7)}V${yC + 8}M${X(-0.551)} ${Y(-0.7)}V${yC + 8}M${X(0.551)} ${yC}H${X(-0.551)}M${X(0.551)} ${yC - 5}V${yC + 5}M${X(-0.551)} ${yC - 5}V${yC + 5}`, kind: 'dim' })
  const xB = X(-0.95)
  s.push({ d: `M${X(-0.6)} ${Y(1.76)}H${xB - 8}M${X(-0.6)} ${Y(-0.67)}H${xB - 8}M${xB} ${Y(1.76)}V${Y(-0.67)}M${xB - 5} ${Y(1.76)}H${xB + 5}M${xB - 5} ${Y(-0.67)}H${xB + 5}`, kind: 'dim' })
  return {
    strokes: s,
    labels: [
      { x: X(0), y: yC - 10, t: 'C' },
      { x: xB - 16, y: (Y(1.76) + Y(-0.67)) / 2, t: 'B' },
    ],
  }
}

/** Plan: looking down -Y; screen y = -z. */
function plan() {
  const cx = VBW / 2 - 20
  const cy = VBH / 2 - 10
  const X = (v: number) => cx + v * K
  const Z = (z: number) => cy - z * K
  const s: Stroke[] = []
  // band strip, 2.0 wide, 0.34 deep (outer + inner edge)
  s.push({ d: rr(X(-1.0), Z(0.17), 2.0 * K, 0.34 * K, 14) })
  s.push({ d: rr(X(-0.9), Z(0.1), 1.8 * K, 0.2 * K, 8), kind: 'hidden' })
  for (const sg of [-1, 1]) {
    const a = (x0: number, x1: number) => (sg > 0 ? [x0, x1] : [-x1, -x0])
    const [p0, p1] = a(0.45, 0.7)
    s.push({ d: rr(X(p0), Z(0.545), (p1 - p0) * K, 1.09 * K, 16) })
    const [s0, s1] = a(0.69, 1.19)
    s.push({ d: rr(X(s0), Z(0.551), (s1 - s0) * K, 1.102 * K, 16) })
    const [l0, l1] = a(1.19, 1.27)
    s.push({ d: rr(X(l0), Z(0.476), (l1 - l0) * K, 0.952 * K, 6) })
    s.push({ d: `M${X(sg * 0.95)} ${Z(0.62)}V${Z(-0.62)}`, kind: 'hidden' }) // yoke over the top
    s.push({ d: ellipse(X(sg * 0.95), Z(0.575), 0.045 * K, 0.045 * K) })
    s.push({ d: ellipse(X(sg * 0.95), Z(-0.575), 0.045 * K, 0.045 * K) })
  }
  s.push({ d: `M${X(0)} ${Z(0.95)}V${Z(-0.95)}M${X(-1.5)} ${Z(0)}H${X(1.5)}`, kind: 'center' })
  const yA = Z(-0.85)
  s.push({ d: `M${X(-1.27)} ${Z(-0.55)}V${yA + 8}M${X(1.27)} ${Z(-0.55)}V${yA + 8}M${X(-1.27)} ${yA}H${X(1.27)}M${X(-1.27)} ${yA - 5}V${yA + 5}M${X(1.27)} ${yA - 5}V${yA + 5}`, kind: 'dim' })
  const xC = X(1.55)
  s.push({ d: `M${X(1.3)} ${Z(0.551)}H${xC + 8}M${X(1.3)} ${Z(-0.551)}H${xC + 8}M${xC} ${Z(0.551)}V${Z(-0.551)}M${xC - 5} ${Z(0.551)}H${xC + 5}M${xC - 5} ${Z(-0.551)}H${xC + 5}`, kind: 'dim' })
  return {
    strokes: s,
    labels: [
      { x: X(0), y: yA - 10, t: 'A' },
      { x: xC + 16, y: Z(0), t: 'C' },
    ],
  }
}

/** Front-view strokes and the drawing's coordinate box, for reuse as a large silhouette trace. */
export const frontStrokes = () => front().strokes
export const SHEET_BOX = { w: VBW, h: VBH }

const BUILD = { front, profile, plan }

const styleOf = (k: Stroke['kind']) =>
  k === 'dim'
    ? { stroke: DIM, dash: undefined as string | undefined, w: 1 }
    : k === 'hidden'
      ? { stroke: HIDDEN, dash: '5 5', w: 1 }
      : k === 'center'
        ? { stroke: 'rgb(131 184 255 / 0.45)', dash: '16 4 3 4', w: 1 }
        : { stroke: INK, dash: undefined, w: 1.25 }

/**
 * One view as an SVG drawing on a fine grid. Strokes draw themselves in (staggered) when the
 * view scrolls into view; under reduced motion it is simply drawn.
 */
export function OrthoView({ view, className = '' }: { view: ViewKey; className?: string }) {
  const reduce = useReducedMotion()
  const { strokes, labels } = BUILD[view]()
  const id = `grid-${view}`
  return (
    <svg
      viewBox={`0 0 ${VBW} ${VBH}`}
      className={className}
      role="img"
      aria-label={`Orthographic ${view} drawing of the headphone with dimension lines A, B, C`}
    >
      <defs>
        <pattern id={id} width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M24 0H0V24" fill="none" stroke="rgb(191 200 213 / 0.07)" strokeWidth="1" />
        </pattern>
        <pattern id={`${id}-major`} width="120" height="120" patternUnits="userSpaceOnUse">
          <path d="M120 0H0V120" fill="none" stroke="rgb(191 200 213 / 0.13)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width={VBW} height={VBH} fill={`url(#${id})`} />
      <rect width={VBW} height={VBH} fill={`url(#${id}-major)`} />
      {strokes.map((st, i) => {
        const sty = styleOf(st.kind)
        return (
          <motion.path
            key={i}
            d={st.d}
            fill="none"
            stroke={sty.stroke}
            strokeWidth={sty.w}
            strokeDasharray={sty.dash}
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            initial={reduce ? false : { pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true, margin: '0px 0px -15% 0px' }}
            transition={{ duration: duration.cinematic, ease: ease.out, delay: 0.08 * i }}
          />
        )
      })}
      {labels.map((l) => (
        <motion.text
          key={l.t}
          x={l.x}
          y={l.y}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="rgb(131 184 255)"
          style={{ font: '500 15px var(--font-mono)' }}
          initial={reduce ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1.4, duration: duration.slow }}
        >
          {l.t}
        </motion.text>
      ))}
    </svg>
  )
}
