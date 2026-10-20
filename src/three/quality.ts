/**
 * Quality tiers for the 3D scene.
 *
 * The starting tier is guessed from the device (touch-first, few cores, little memory),
 * then the Rig measures real frame times while the scene is animating and steps the tier
 * down (or back up, never above the starting guess + 1) as needed.
 *
 * Override for testing: add `?q=high|medium|low` to the URL (locks the tier, disables adaptation).
 */
export type Tier = 'high' | 'medium' | 'low'

export interface TierConfig {
  /** Maximum device pixel ratio. */
  dpr: number
  /** Resolution of the environment cube map rendered from the light cards. */
  envRes: number
  /** Lathe/torus segment count for the model. */
  segments: number
  /** The pointer-following highlight light. */
  pointLight: boolean
}

export const TIERS: Record<Tier, TierConfig> = {
  high: { dpr: 1.75, envRes: 512, segments: 96, pointLight: true },
  medium: { dpr: 1.4, envRes: 256, segments: 64, pointLight: true },
  low: { dpr: 1, envRes: 128, segments: 40, pointLight: false },
}

const ORDER: Tier[] = ['low', 'medium', 'high']

export const stepTier = (t: Tier, dir: 1 | -1): Tier =>
  ORDER[Math.min(ORDER.length - 1, Math.max(0, ORDER.indexOf(t) + dir))]

/** URL override, if any. */
export function forcedTier(): Tier | null {
  if (typeof window === 'undefined') return null
  const q = new URLSearchParams(window.location.search).get('q')
  return q === 'high' || q === 'medium' || q === 'low' ? q : null
}

/** First guess before any frames are measured. */
export function detectTier(): Tier {
  const forced = forcedTier()
  if (forced) return forced
  if (typeof window === 'undefined') return 'medium'
  const nav = navigator as Navigator & { deviceMemory?: number }
  let penalty = 0
  if (window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768) penalty++
  if ((nav.hardwareConcurrency ?? 8) <= 4) penalty++
  if ((nav.deviceMemory ?? 8) <= 4) penalty++
  return penalty === 0 ? 'high' : penalty === 1 ? 'medium' : 'low'
}

export const tierRank = (t: Tier) => ORDER.indexOf(t)
