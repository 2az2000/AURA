/**
 * The storyboard: one "shot" per scroll position of interest.
 *
 * As the reader scrolls, the 3D rig and the background field interpolate between
 * consecutive shots (see store.ts). To change how the product moves through the page,
 * or what character the background has in each sheet, edit the numbers here.
 * Order MUST match the order of the `data-shot` elements on the page.
 *
 * Units
 *  - x / y     : fraction of the visible viewport at the product plane
 *                (0 = centre, +0.5 = right/top edge).
 *  - scale     : uniform scale (in portrait multiplied by viewport width / 3, see Rig).
 *  - rotX/Y/Z  : radians. rotY 0 = front view, -π/2 = the right cup face-on (profile),
 *                rotX +π/2 = looking down on the band (plan).
 *  - explode   : 0 assembled → 1 fully exploded.
 *  - fx / fy   : focus point on the model's X / Y axis (the model rotates and scales about it).
 *  - solo      : 0 both cups → 1 only the right cup (focus shots collapse the far cup).
 *  - glow      : brightness of the ice-blue indicator ring.
 *  - tint      : 0 neutral studio → 1 cool "technical" atmosphere.
 *  - orbit     : opacity of the orbit-ring graphic behind the product.
 *  - field     : background character (see Field).
 *  - hotspots  : markers visible in this shot.
 */
export type HotspotId =
  | 'plate'
  | 'shell'
  | 'driver'
  | 'pad'
  | 'face'
  | 'cover'
  | 'light'
  | 'mic'
  | 'dial'
  | 'button'
  | 'pivot'

/** Character of the animated background (all 0..1). */
export interface Field {
  /** flowing frequency lines: amplitude and brightness */
  lines: number
  /** iso-contour lines */
  contour: number
  /** angled light beam through moving fog */
  beam: number
  /** floating dust, three depth layers */
  dust: number
  /** concentric sound ripples centred on the product */
  rings: number
  /** fine technical grid that fades out from the product */
  grid: number
}

export interface Shot {
  id: string
  x: number
  y: number
  scale: number
  rotX: number
  rotY: number
  rotZ: number
  explode: number
  glow: number
  fx: number
  /** focus point along the model's Y axis (so the band can be centred for under-side shots) */
  fy: number
  solo: number
  tint: number
  orbit: number
  field: Field
  hotspots: HotspotId[]
}

const ANATOMY: HotspotId[] = ['plate', 'shell', 'driver', 'pad']

/** Where each cup part sits along the model X axis when fully exploded (see Headphone.tsx). */
export const PART_X = { plate: 2.23, shell: 1.45, driver: 0.63, pad: 0.22 } as const

export const F = (lines: number, contour: number, beam: number, dust: number, rings = 0, grid = 0): Field => ({ lines, contour, beam, dust, rings, grid })

export const mk = (o: Partial<Omit<Shot, 'field'>> & { id: string; field?: Field }): Shot => ({
  x: 0,
  y: 0,
  scale: 1,
  rotX: 0,
  rotY: 0,
  rotZ: 0,
  explode: 0,
  glow: 1,
  fx: 0,
  fy: 0,
  solo: 0,
  tint: 0,
  orbit: 0,
  field: F(0.2, 0.15, 0.3, 0.4),
  hotspots: [],
  ...o,
})

const HALF_PI = Math.PI / 2
/** Markers on the title sheet: quiet until hovered; each opens the part inspector. */
const HERO_MARKS: HotspotId[] = ['face', 'light', 'dial', 'pivot', 'mic']

/** Landscape / desktop. */
export const shotsWide: Shot[] = [
  mk({ id: 'hero', x: 0, y: 0.06, scale: 0.9, rotX: 0.08, rotY: 0.55, glow: 0.9, orbit: 1, field: F(0.35, 0.15, 0.55, 0.65), hotspots: HERO_MARKS }),
  mk({ id: 'silence', x: 0.24, y: 0, scale: 1.12, rotX: 0.04, rotY: -1.18, glow: 1.0, orbit: 0.25, field: F(0.9, 0.1, 0.3, 0.4) }),
  mk({ id: 'form-front', x: 0.24, y: 0.0, scale: 1.0, rotX: 0.0, rotY: 0.0, glow: 0.6, orbit: 0.0, field: F(0.05, 0.0, 0.15, 0.2) }),
  mk({ id: 'form-profile', x: 0.24, y: 0.0, scale: 1.0, rotX: 0.0, rotY: -HALF_PI, glow: 0.6, orbit: 0.0, field: F(0.05, 0.0, 0.15, 0.2) }),
  mk({ id: 'form-plan', x: 0.24, y: 0.0, scale: 1.0, rotX: 1.42, rotY: 0.0, glow: 0.6, orbit: 0.0, field: F(0.05, 0.0, 0.15, 0.2) }),
  mk({ id: 'anatomy', x: 0.2, y: -0.03, scale: 0.82, rotX: 0.1, rotY: 0.3, explode: 1, glow: 0.3, tint: 1, field: F(0.2, 0.4, 0.4, 0.5), hotspots: ANATOMY }),
  mk({ id: 'anatomy-plate', x: 0.22, y: -0.02, scale: 1.5, solo: 1, rotX: 0.08, rotY: 0.4, explode: 1, glow: 0.3, tint: 1, fx: PART_X.plate, field: F(0.15, 0.5, 0.4, 0.4), hotspots: ANATOMY }),
  mk({ id: 'anatomy-shell', x: 0.2, y: -0.02, scale: 1.35, solo: 1, rotX: 0.08, rotY: 0.3, explode: 1, glow: 0.5, tint: 1, fx: PART_X.shell, field: F(0.15, 0.5, 0.4, 0.4), hotspots: ANATOMY }),
  mk({ id: 'anatomy-driver', x: 0.2, y: -0.02, scale: 1.6, solo: 1, rotX: 0.06, rotY: 0.35, explode: 1, glow: 0.3, tint: 1, fx: PART_X.driver, field: F(0.15, 0.5, 0.4, 0.4), hotspots: ANATOMY }),
  mk({ id: 'anatomy-pad', x: 0.2, y: -0.02, scale: 1.45, solo: 1, rotX: 0.06, rotY: 0.3, explode: 1, glow: 0.3, tint: 1, fx: PART_X.pad, field: F(0.15, 0.5, 0.4, 0.4), hotspots: ANATOMY }),
  mk({ id: 'materials', x: 0.21, y: 0.07, scale: 1.4, rotX: -0.06, rotY: -1.28, glow: 1.2, field: F(0.08, 0.1, 0.8, 0.3), hotspots: ['face', 'cover', 'light'] }),
  mk({ id: 'studies', x: 0.2, y: 0.95, scale: 1.0, rotX: -0.06, rotY: -1.28, glow: 1.2, field: F(0.08, 0.1, 0.8, 0.3) }),
  mk({ id: 'acoustics', x: 0.27, y: 0, scale: 0.9, rotX: 0.1, rotY: 0.9, rotZ: -0.05, glow: 1.6, tint: 1, field: F(1.0, 0.3, 0.2, 0.3), hotspots: ['mic'] }),
  mk({ id: 'fit', x: -0.29, y: 0.02, scale: 1.05, rotX: 0.5, rotY: 0.7, glow: 0.6, field: F(0.15, 0.3, 0.3, 0.4), hotspots: ['dial', 'button', 'pivot'] }),
  mk({ id: 'reserve', x: 0, y: 0.14, scale: 0.64, rotX: 0.08, rotY: -0.45, glow: 1.0, orbit: 0.6, field: F(0.8, 0.25, 0.65, 0.85) }),
]

/**
 * Portrait / mobile: product in the upper half, copy below it.
 * `scale` is multiplied by (viewport width / 3) at runtime, so 1.0 ≈ "as wide as a phone allows".
 */
export const shotsTall: Shot[] = [
  mk({ id: 'hero', y: 0.1, scale: 1.0, rotX: 0.06, rotY: 0.5, glow: 0.9, orbit: 1, field: F(0.3, 0.12, 0.5, 0.6), hotspots: HERO_MARKS }),
  mk({ id: 'silence', y: 0.2, scale: 1.05, rotX: 0.04, rotY: -1.18, orbit: 0.2, field: F(0.8, 0.1, 0.3, 0.4) }),
  mk({ id: 'form-front', y: 0.2, scale: 0.95, rotX: 0.0, rotY: 0.0, glow: 0.6, field: F(0.05, 0.0, 0.15, 0.2) }),
  mk({ id: 'form-profile', y: 0.2, scale: 0.95, rotX: 0.0, rotY: -HALF_PI, glow: 0.6, field: F(0.05, 0.0, 0.15, 0.2) }),
  mk({ id: 'form-plan', y: 0.2, scale: 0.95, rotX: 1.42, rotY: 0.0, glow: 0.6, field: F(0.05, 0.0, 0.15, 0.2) }),
  mk({ id: 'anatomy', y: -0.02, scale: 0.64, rotX: 0.3, rotY: 0.5, explode: 1, glow: 0.3, tint: 1, field: F(0.2, 0.4, 0.4, 0.5), hotspots: ANATOMY }),
  mk({ id: 'anatomy-plate', y: -0.02, solo: 1, scale: 1.25, rotX: 0.1, rotY: 0.4, explode: 1, glow: 0.3, tint: 1, fx: PART_X.plate, field: F(0.15, 0.5, 0.4, 0.4), hotspots: ANATOMY }),
  mk({ id: 'anatomy-shell', y: -0.02, solo: 1, scale: 1.1, rotX: 0.1, rotY: 0.3, explode: 1, glow: 0.5, tint: 1, fx: PART_X.shell, field: F(0.15, 0.5, 0.4, 0.4), hotspots: ANATOMY }),
  mk({ id: 'anatomy-driver', y: -0.02, solo: 1, scale: 1.3, rotX: 0.08, rotY: 0.35, explode: 1, glow: 0.3, tint: 1, fx: PART_X.driver, field: F(0.15, 0.5, 0.4, 0.4), hotspots: ANATOMY }),
  mk({ id: 'anatomy-pad', y: -0.02, solo: 1, scale: 1.2, rotX: 0.08, rotY: 0.3, explode: 1, glow: 0.3, tint: 1, fx: PART_X.pad, field: F(0.15, 0.5, 0.4, 0.4), hotspots: ANATOMY }),
  mk({ id: 'materials', y: 0.23, scale: 1.05, rotX: -0.06, rotY: -1.28, glow: 1.2, field: F(0.08, 0.1, 0.8, 0.3), hotspots: ['face', 'cover', 'light'] }),
  mk({ id: 'studies', y: 0.95, scale: 1.0, rotX: -0.06, rotY: -1.28, glow: 1.2, field: F(0.08, 0.1, 0.8, 0.3) }),
  mk({ id: 'acoustics', y: 0.25, scale: 0.9, rotX: 0.1, rotY: 0.9, glow: 1.6, tint: 1, field: F(1.0, 0.3, 0.2, 0.3), hotspots: ['mic'] }),
  mk({ id: 'fit', y: 0.22, scale: 0.85, rotX: 0.55, rotY: 0.55, glow: 0.6, field: F(0.15, 0.3, 0.3, 0.4), hotspots: ['dial', 'button', 'pivot'] }),
  mk({ id: 'reserve', y: 0.22, scale: 0.9, rotX: 0.08, rotY: -0.45, orbit: 0.6, field: F(0.8, 0.25, 0.65, 0.85) }),
]
