/**
 * Tiny critically-damped-ish spring for per-frame (rAF / useFrame) motion.
 * Motion's own springs are used for DOM; this exists because the 3D rig needs
 * springs that are stepped manually in the render loop and can be inspected
 * for "is it still moving?" (needed for on-demand rendering).
 */
export interface Spring {
  x: number
  v: number
}

export const makeSpring = (x = 0): Spring => ({ x, v: 0 })

/** Step toward `target`. Sub-stepped so large frame gaps stay stable. */
export function stepSpring(s: Spring, target: number, k: number, c: number, dt: number) {
  const steps = Math.max(1, Math.ceil(dt / (1 / 120)))
  const h = dt / steps
  for (let i = 0; i < steps; i++) {
    const a = k * (target - s.x) - c * s.v
    s.v += a * h
    s.x += s.v * h
  }
  return s.x
}

/** True while the spring has visible motion left. */
export const springActive = (s: Spring, target: number, eps = 0.0004) =>
  Math.abs(s.x - target) > eps || Math.abs(s.v) > eps
