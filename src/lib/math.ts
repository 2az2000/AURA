export const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v))
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/** Hermite smoothstep, 0→1 over [0,1]. */
export const smooth = (t: number) => {
  const x = clamp(t)
  return x * x * (3 - 2 * x)
}

/**
 * Frame-rate independent exponential damping. Move `current` toward `target`;
 * `lambda` is the responsiveness (higher = snappier), `dt` is the frame delta in seconds.
 */
export const damp = (current: number, target: number, lambda: number, dt: number) =>
  lerp(current, target, 1 - Math.exp(-lambda * dt))
