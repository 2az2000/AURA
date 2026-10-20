/**
 * The storyboard: one "shot" per page section.
 *
 * As the reader scrolls, the 3D rig interpolates between consecutive shots
 * (see useStory.ts). To change how the product moves through the page, edit
 * the numbers here — no other file needs to change.
 *
 * Units:
 *  - x / y   : fraction of the visible viewport at the product plane
 *              (0 = centre, +0.5 = right/top edge).
 *  - rotY    : radians. 0 = front view, ≈ -1.3 shows the right-hand cup face-on.
 *  - rotX    : radians. Positive tilts the top of the headband toward the viewer.
 *  - scale   : uniform scale of the whole model.
 *  - explode : 0 assembled → 1 fully exploded.
 *  - glow    : brightness of the ice-blue indicator ring.
 */
export interface Shot {
  /** Matches `data-shot` on the section element. */
  id: string
  x: number
  y: number
  scale: number
  rotX: number
  rotY: number
  rotZ: number
  explode: number
  glow: number
}

/** Landscape / desktop. */
export const shotsWide: Shot[] = [
  { id: 'hero', x: 0, y: 0.0, scale: 1.08, rotX: 0.06, rotY: 0.55, rotZ: 0, explode: 0, glow: 0.8 },
  { id: 'silence', x: 0.24, y: 0, scale: 1.12, rotX: 0.04, rotY: -1.18, rotZ: 0, explode: 0, glow: 1.0 },
  { id: 'anatomy', x: 0.02, y: -0.04, scale: 1.05, rotX: 0.12, rotY: 0.34, rotZ: 0, explode: 1, glow: 0.3 },
  { id: 'materials', x: 0.24, y: 0.07, scale: 1.4, rotX: -0.06, rotY: -1.28, rotZ: 0, explode: 0, glow: 1.2 },
  { id: 'adaptive', x: 0.27, y: 0.0, scale: 0.9, rotX: 0.1, rotY: 0.9, rotZ: -0.05, explode: 0, glow: 1.6 },
  { id: 'fit', x: -0.24, y: 0.02, scale: 1.1, rotX: 0.55, rotY: 0.55, rotZ: 0, explode: 0, glow: 0.6 },
  { id: 'reserve', x: 0, y: 0.115, scale: 0.72, rotX: 0.08, rotY: -0.45, rotZ: 0, explode: 0, glow: 1.0 },
]

/**
 * Portrait / mobile: product centred in the upper half, copy below it.
 * `scale` is multiplied by (viewport width / 3) at runtime (see Stage.tsx), so
 * 1.0 here means "about as wide as a phone screen allows".
 */
export const shotsTall: Shot[] = [
  { id: 'hero', x: 0, y: 0.06, scale: 1.0, rotX: 0.06, rotY: 0.5, rotZ: 0, explode: 0, glow: 0.8 },
  { id: 'silence', x: 0, y: 0.2, scale: 1.3, rotX: 0.04, rotY: -1.18, rotZ: 0, explode: 0, glow: 1.0 },
  { id: 'anatomy', x: 0, y: 0.04, scale: 0.64, rotX: 0.3, rotY: 0.5, rotZ: 0, explode: 1, glow: 0.3 },
  { id: 'materials', x: 0, y: 0.2, scale: 1.6, rotX: -0.06, rotY: -1.28, rotZ: 0, explode: 0, glow: 1.2 },
  { id: 'adaptive', x: 0, y: 0.22, scale: 1.1, rotX: 0.1, rotY: 0.9, rotZ: 0, explode: 0, glow: 1.6 },
  { id: 'fit', x: 0, y: 0.2, scale: 1.0, rotX: 0.55, rotY: 0.55, rotZ: 0, explode: 0, glow: 0.6 },
  { id: 'reserve', x: 0, y: 0.22, scale: 0.9, rotX: 0.08, rotY: -0.45, rotZ: 0, explode: 0, glow: 1.0 },
]
