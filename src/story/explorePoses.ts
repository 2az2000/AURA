import { F, mk, type HotspotId, type Shot } from './storyboard'
import type { ExplorePart } from '../play/store'

/**
 * Hero "inspect a part" poses. Applied with `story.hold('hero', pose)` while a part is open, so the camera
 * flies to it independently of scroll. The product sits on the right; the description card takes the left.
 */
interface P {
  wide: Partial<Shot>
  tall: Partial<Shot>
  show: HotspotId[]
}

const POSES: Record<ExplorePart, P> = {
  face: { wide: { solo: 1, x: 0.2, y: 0.02, scale: 2.1, fx: 0.95, rotX: -0.04, rotY: -1.25 }, tall: { solo: 1, y: 0.16, scale: 1.35, fx: 0.95, rotX: -0.04, rotY: -1.25 }, show: ['face'] },
  cover: { wide: { solo: 1, x: 0.2, y: 0.02, scale: 2.0, fx: 0.95, rotX: -0.04, rotY: -1.25 }, tall: { solo: 1, y: 0.16, scale: 1.3, fx: 0.95, rotX: -0.04, rotY: -1.25 }, show: ['cover'] },
  light: { wide: { solo: 1, x: 0.2, y: 0.0, scale: 2.5, fx: 0.95, rotX: -0.02, rotY: -1.2 }, tall: { solo: 1, y: 0.16, scale: 1.5, fx: 0.95, rotX: -0.02, rotY: -1.2 }, show: ['light'] },
  dial: { wide: { solo: 1, x: 0.24, y: 0.0, scale: 2.5, fx: 0.95, rotX: 0.08, rotY: -0.85 }, tall: { solo: 1, y: 0.16, scale: 1.5, fx: 0.95, rotX: 0.08, rotY: -0.85 }, show: ['dial', 'button'] },
  pivot: { wide: { solo: 1, x: 0.2, y: 0.0, scale: 2.3, fx: 0.95, rotX: 0.1, rotY: 0.55 }, tall: { solo: 1, y: 0.16, scale: 1.4, fx: 0.95, rotX: 0.1, rotY: 0.55 }, show: ['pivot'] },
  mic: { wide: { x: 0.2, y: 0.0, scale: 2.2, fx: -0.95, rotX: 0.1, rotY: 0.9 }, tall: { y: 0.16, scale: 1.35, fx: -0.95, rotX: 0.1, rotY: 0.9 }, show: ['mic'] },
}

export function explorePose(part: ExplorePart, tall: boolean): Shot {
  const p = POSES[part]
  return mk({
    id: 'hero',
    glow: part === 'light' ? 2 : 0.9,
    tint: 0.5,
    orbit: 0,
    ...(tall ? p.tall : p.wide),
    hotspots: p.show,
    field: F(0.2, 0.35, 0.4, 0.5, 0.3, 0.9),
  })
}

/** Which explore part a hotspot id opens (the button belongs with the dial). */
export const partOf = (id: HotspotId): ExplorePart | null =>
  id === 'button' ? 'dial' : (['face', 'cover', 'light', 'dial', 'pivot', 'mic'] as const).find((p) => p === id) ?? null
