import type { HotspotId } from './storyboard'

/**
 * Everything the DOM side and the 3D side share about hotspots. Kept free of any
 * three / R3F imports on purpose: the DOM overlay (Hotspots.tsx) must not pull the 3D
 * bundle into the initial page load.
 */
export const HOTSPOT_IDS: HotspotId[] = [
  'plate',
  'shell',
  'driver',
  'pad',
  'face',
  'cover',
  'light',
  'mic',
  'dial',
  'button',
  'pivot',
]

/**
 * DOM elements the 3D rig writes into every frame. Plain element refs, set by
 * <Hotspots/> and <Atmosphere/>; the Rig writes transforms/opacity straight onto them
 * (no React state involved).
 */
export interface SceneBridge {
  hotspots: Partial<Record<HotspotId, HTMLElement | null>>
  poolNeutral: HTMLElement | null
  poolCool: HTMLElement | null
  /** orbit-ring graphic, centred on the product */
  orbit: HTMLElement | null
  /** dimensioned axis drawn through the exploded cup */
  axis: HTMLElement | null
  /** sound rings emanating from the cup face */
  rings: HTMLElement | null
  /** product screen position, 0..1 (y up), written by the Rig, read by the background field */
  light: { x: number; y: number; /** 0..1 pulse of a one-shot sequence */ boost: number; /** product turn in radians; moves the field */ spin: number; /** 0..1 finale calm */ calm: number }
  /** live product orientation (radians) / scale, written by the Rig; read by readouts */
  stats: { rotY: number; rotX: number; scale: number }
}
