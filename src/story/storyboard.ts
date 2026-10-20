/**
 * The storyboard: one "shot" per scroll position of interest.
 *
 * As the reader scrolls, the 3D rig interpolates between consecutive shots
 * (see store.ts). To change how the product moves through the page, edit the
 * numbers here — nothing else needs to change. Order MUST match the order of
 * the `data-shot` elements on the page.
 *
 * Units
 *  - x / y     : fraction of the visible viewport at the product plane
 *                (0 = centre, +0.5 = right/top edge).
 *  - scale     : uniform scale (in portrait multiplied by viewport width / 3, see Rig).
 *  - rotX/Y/Z  : radians. rotY 0 = front view, ≈ -1.3 shows the right cup face-on.
 *  - explode   : 0 assembled → 1 fully exploded.
 *  - fx        : focus point along the model's X axis. The model rotates and scales
 *                about this point, so a part can be centred in frame.
 *  - glow      : brightness of the ice-blue indicator ring.
 *  - solo      : 0 both cups → 1 only the right cup (focus shots collapse the far cup)
 *  - tint      : 0 neutral studio → 1 cool "technical" atmosphere.
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
  solo: number
  tint: number
  hotspots: HotspotId[]
}

const ANATOMY: HotspotId[] = ['plate', 'shell', 'driver', 'pad']

/** Where each cup part sits along the model X axis when fully exploded (see Headphone.tsx). */
export const PART_X = { plate: 2.23, shell: 1.45, driver: 0.63, pad: 0.22 } as const

const s = (o: Partial<Shot> & { id: string }): Shot => ({
  x: 0,
  y: 0,
  scale: 1,
  rotX: 0,
  rotY: 0,
  rotZ: 0,
  explode: 0,
  glow: 1,
  fx: 0,
  solo: 0,
  tint: 0,
  hotspots: [],
  ...o,
})

/** Landscape / desktop. */
export const shotsWide: Shot[] = [
  s({ id: 'hero', x: 0, y: 0.06, scale: 0.9, rotX: 0.08, rotY: 0.55, glow: 0.9 }),
  s({ id: 'silence', x: 0.24, y: 0, scale: 1.12, rotX: 0.04, rotY: -1.18, glow: 1.0 }),
  s({ id: 'anatomy', x: 0.2, y: -0.03, scale: 0.82, rotX: 0.1, rotY: 0.3, explode: 1, glow: 0.3, tint: 1, hotspots: ANATOMY }),
  s({ id: 'anatomy-plate', x: 0.22, y: -0.02, scale: 1.5, solo: 1, rotX: 0.08, rotY: 0.4, explode: 1, glow: 0.3, tint: 1, fx: PART_X.plate, hotspots: ANATOMY }),
  s({ id: 'anatomy-shell', x: 0.2, y: -0.02, scale: 1.35, solo: 1, rotX: 0.08, rotY: 0.3, explode: 1, glow: 0.5, tint: 1, fx: PART_X.shell, hotspots: ANATOMY }),
  s({ id: 'anatomy-driver', x: 0.2, y: -0.02, scale: 1.6, solo: 1, rotX: 0.06, rotY: 0.35, explode: 1, glow: 0.3, tint: 1, fx: PART_X.driver, hotspots: ANATOMY }),
  s({ id: 'anatomy-pad', x: 0.2, y: -0.02, scale: 1.45, solo: 1, rotX: 0.06, rotY: 0.3, explode: 1, glow: 0.3, tint: 1, fx: PART_X.pad, hotspots: ANATOMY }),
  s({ id: 'materials', x: 0.24, y: 0.07, scale: 1.4, rotX: -0.06, rotY: -1.28, glow: 1.2, hotspots: ['face', 'cover', 'light'] }),
  s({ id: 'adaptive', x: 0.27, y: 0, scale: 0.9, rotX: 0.1, rotY: 0.9, rotZ: -0.05, glow: 1.6, tint: 1, hotspots: ['mic'] }),
  s({ id: 'fit', x: -0.29, y: 0.02, scale: 1.05, rotX: 0.5, rotY: 0.7, glow: 0.6, hotspots: ['dial', 'button', 'pivot'] }),
  s({ id: 'reserve', x: 0, y: 0.14, scale: 0.64, rotX: 0.08, rotY: -0.45, glow: 1.0 }),
]

/**
 * Portrait / mobile: product in the upper half, copy below it.
 * `scale` is multiplied by (viewport width / 3) at runtime, so 1.0 ≈ "as wide as a phone allows".
 */
export const shotsTall: Shot[] = [
  s({ id: 'hero', y: 0.1, scale: 1.0, rotX: 0.06, rotY: 0.5, glow: 0.9 }),
  s({ id: 'silence', y: 0.2, scale: 1.05, rotX: 0.04, rotY: -1.18 }),
  s({ id: 'anatomy', y: -0.02, scale: 0.64, rotX: 0.3, rotY: 0.5, explode: 1, glow: 0.3, tint: 1, hotspots: ANATOMY }),
  s({ id: 'anatomy-plate', y: -0.02, solo: 1, scale: 1.25, rotX: 0.1, rotY: 0.4, explode: 1, glow: 0.3, tint: 1, fx: PART_X.plate, hotspots: ANATOMY }),
  s({ id: 'anatomy-shell', y: -0.02, solo: 1, scale: 1.1, rotX: 0.1, rotY: 0.3, explode: 1, glow: 0.5, tint: 1, fx: PART_X.shell, hotspots: ANATOMY }),
  s({ id: 'anatomy-driver', y: -0.02, solo: 1, scale: 1.3, rotX: 0.08, rotY: 0.35, explode: 1, glow: 0.3, tint: 1, fx: PART_X.driver, hotspots: ANATOMY }),
  s({ id: 'anatomy-pad', y: -0.02, solo: 1, scale: 1.2, rotX: 0.08, rotY: 0.3, explode: 1, glow: 0.3, tint: 1, fx: PART_X.pad, hotspots: ANATOMY }),
  s({ id: 'materials', y: 0.2, scale: 1.25, rotX: -0.06, rotY: -1.28, glow: 1.2, hotspots: ['face', 'cover', 'light'] }),
  s({ id: 'adaptive', y: 0.22, scale: 1.1, rotX: 0.1, rotY: 0.9, glow: 1.6, tint: 1, hotspots: ['mic'] }),
  s({ id: 'fit', y: 0.22, scale: 0.85, rotX: 0.55, rotY: 0.55, glow: 0.6, hotspots: ['dial', 'button', 'pivot'] }),
  s({ id: 'reserve', y: 0.22, scale: 0.9, rotX: 0.08, rotY: -0.45 }),
]
