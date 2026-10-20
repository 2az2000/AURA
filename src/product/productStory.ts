import { F, mk, type Shot } from '../story/storyboard'
import type { HotspotId } from '../story/storyboard'

/**
 * The /product storyboard. Same units and rules as src/story/storyboard.ts, different film:
 * big, close, low-angle, and alternating sides — the homepage keeps the product mid-frame and far away.
 * Order must match the `data-shot` order on the page.
 */
const HALF_PI = Math.PI / 2
const ALL_ANATOMY: HotspotId[] = ['plate', 'shell', 'driver', 'pad']

export const productShotsWide: Shot[] = [
  mk({ id: 'p-arrival', x: 0.26, y: -0.05, scale: 1.3, rotX: -0.14, rotY: 0.95, rotZ: 0.05, glow: 1.1, field: F(0.25, 0.1, 0.5, 0.6, 1, 0.6) }),
  mk({ id: 'p-form-a', x: 0.25, y: 0.0, scale: 1.5, rotX: 0.05, rotY: 0.6, glow: 0.8, orbit: 0.7, field: F(0.1, 0.05, 0.3, 0.3, 0.25, 1) }),
  mk({ id: 'p-form-b', x: -0.25, y: 0.0, scale: 1.55, rotX: 0.0, rotY: 0.0, glow: 0.8, orbit: 0.7, field: F(0.1, 0.05, 0.3, 0.3, 0.25, 1) }),
  mk({ id: 'p-form-c', x: 0.25, y: 0.0, scale: 1.5, rotX: 0.0, rotY: -HALF_PI, glow: 0.8, orbit: 0.7, field: F(0.1, 0.05, 0.3, 0.3, 0.25, 1) }),
  mk({ id: 'p-form-d', x: -0.24, y: 0.02, scale: 1.4, rotX: 0.32, rotY: -3.1, glow: 0.8, orbit: 0.7, field: F(0.1, 0.05, 0.3, 0.3, 0.25, 1) }),
  mk({ id: 'p-titanium', x: 0.08, y: 0.02, scale: 2.6, rotX: -0.05, rotY: -1.3, glow: 1.3, field: F(0.05, 0.1, 0.95, 0.25) }),
  mk({ id: 'p-aramid', x: -0.3, y: 0.0, scale: 2.0, rotX: 0.06, rotY: 1.05, explode: 1, solo: 1, fx: 0.22, glow: 0.3, field: F(0.05, 0.1, 0.6, 0.2) }),
  mk({ id: 'p-leather', x: 0.22, y: -0.02, scale: 1.55, rotX: -1.1, rotY: 0.0, fy: 1.3, glow: 0.8, field: F(0.05, 0.2, 0.7, 0.2) }),
  mk({ id: 'p-inspect', x: 0.2, y: -0.02, scale: 0.95, rotX: 0.1, rotY: 0.3, explode: 1, glow: 0.3, tint: 1, field: F(0.2, 0.4, 0.4, 0.5, 0.35, 1), hotspots: ALL_ANATOMY }),
  mk({ id: 'p-finale', x: -0.26, y: -0.1, scale: 1.5, rotX: 0.12, rotY: -0.4, rotZ: -0.14, glow: 1.3, orbit: 0.5, field: F(0.9, 0.2, 0.7, 0.9, 0.8, 0.2) }),
]

export const productShotsTall: Shot[] = [
  mk({ id: 'p-arrival', y: 0.13, scale: 1.05, rotX: -0.12, rotY: 0.9, rotZ: 0.04, glow: 1.1, field: F(0.25, 0.1, 0.5, 0.6, 1, 0.6) }),
  mk({ id: 'p-form-a', y: 0.19, scale: 0.95, rotX: 0.05, rotY: 0.6, glow: 0.8, orbit: 0.5, field: F(0.1, 0.05, 0.3, 0.3, 0.25, 1) }),
  mk({ id: 'p-form-b', y: 0.19, scale: 0.95, rotX: 0.0, rotY: 0.0, glow: 0.8, orbit: 0.5, field: F(0.1, 0.05, 0.3, 0.3, 0.25, 1) }),
  mk({ id: 'p-form-c', y: 0.19, scale: 0.95, rotX: 0.0, rotY: -HALF_PI, glow: 0.8, orbit: 0.5, field: F(0.1, 0.05, 0.3, 0.3, 0.25, 1) }),
  mk({ id: 'p-form-d', y: 0.19, scale: 0.9, rotX: 0.32, rotY: -3.1, glow: 0.8, orbit: 0.5, field: F(0.1, 0.05, 0.3, 0.3, 0.25, 1) }),
  mk({ id: 'p-titanium', y: 0.2, scale: 1.3, rotX: -0.05, rotY: -1.3, glow: 1.3, field: F(0.05, 0.1, 0.95, 0.25) }),
  mk({ id: 'p-aramid', y: 0.2, scale: 1.25, rotX: 0.06, rotY: 1.05, explode: 1, solo: 1, fx: 0.22, glow: 0.3, field: F(0.05, 0.1, 0.6, 0.2) }),
  mk({ id: 'p-leather', y: 0.2, scale: 0.9, rotX: -1.1, rotY: 0.0, fy: 1.3, glow: 0.8, field: F(0.05, 0.2, 0.7, 0.2) }),
  mk({ id: 'p-inspect', y: 0.16, scale: 0.62, rotX: 0.3, rotY: 0.5, explode: 1, glow: 0.3, tint: 1, field: F(0.2, 0.4, 0.4, 0.5, 0.35, 1), hotspots: ALL_ANATOMY }),
  mk({ id: 'p-finale', y: 0.2, scale: 0.95, rotX: 0.1, rotY: -0.4, rotZ: -0.1, glow: 1.3, orbit: 0.5, field: F(0.9, 0.2, 0.7, 0.9, 0.8, 0.2) }),
]

/**
 * Interactive poses for the inspector (one per component). Applied with `story.hold()` while the
 * inspector shot is active, so choosing a part flies the camera to it independent of scroll.
 */
const PART_X = { plate: 2.23, shell: 1.45, driver: 0.63, pad: 0.22 }

interface PosePart {
  wide: Partial<Shot>
  tall: Partial<Shot>
}

const base = { tint: 1, glow: 0.5 }
const POSES: Record<string, PosePart> = {
  plate: { wide: { x: 0.22, y: -0.02, scale: 1.5, solo: 1, explode: 1, fx: PART_X.plate, rotX: 0.08, rotY: 0.4 }, tall: { y: 0.16, scale: 1.1, solo: 1, explode: 1, fx: PART_X.plate, rotX: 0.08, rotY: 0.4 } },
  shell: { wide: { x: 0.2, y: -0.02, scale: 1.35, solo: 1, explode: 1, fx: PART_X.shell, rotX: 0.08, rotY: 0.3 }, tall: { y: 0.16, scale: 1.0, solo: 1, explode: 1, fx: PART_X.shell, rotX: 0.08, rotY: 0.3 } },
  driver: { wide: { x: 0.2, y: -0.02, scale: 1.6, solo: 1, explode: 1, fx: PART_X.driver, rotX: 0.06, rotY: 0.35 }, tall: { y: 0.16, scale: 1.15, solo: 1, explode: 1, fx: PART_X.driver, rotX: 0.06, rotY: 0.35 } },
  pad: { wide: { x: 0.2, y: -0.02, scale: 1.45, solo: 1, explode: 1, fx: PART_X.pad, rotX: 0.06, rotY: 0.3 }, tall: { y: 0.16, scale: 1.1, solo: 1, explode: 1, fx: PART_X.pad, rotX: 0.06, rotY: 0.3 } },
  controls: { wide: { x: 0.2, y: 0.0, scale: 2.5, fx: 0.95, rotX: 0.12, rotY: 0.8 }, tall: { y: 0.18, scale: 1.5, fx: 0.95, rotX: 0.12, rotY: 0.8 } },
  pivot: { wide: { x: 0.2, y: 0.0, scale: 2.3, fx: 0.95, rotX: 0.1, rotY: 0.55 }, tall: { y: 0.18, scale: 1.4, fx: 0.95, rotX: 0.1, rotY: 0.55 } },
  ring: { wide: { x: 0.2, y: 0.0, scale: 2.5, fx: 0.95, rotX: -0.02, rotY: -1.2, glow: 2 }, tall: { y: 0.18, scale: 1.5, fx: 0.95, rotX: -0.02, rotY: -1.2, glow: 2 } },
  mic: { wide: { x: 0.2, y: 0.0, scale: 2.2, fx: -0.95, rotX: 0.1, rotY: 0.9 }, tall: { y: 0.18, scale: 1.35, fx: -0.95, rotX: 0.1, rotY: 0.9 } },
}

export function inspectPose(key: string, hotspots: HotspotId[], tall: boolean): Shot {
  const p = POSES[key] ?? POSES.plate
  return mk({ id: 'p-inspect', ...base, ...(tall ? p.tall : p.wide), hotspots, field: F(0.2, 0.4, 0.4, 0.5, 0.35, 1) })
}
