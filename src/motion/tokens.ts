import { cubicBezier } from 'motion'

/**
 * AURA motion tokens — the single source of truth for timing and feel.
 * Nothing else in the codebase should hard-code a duration, easing or spring.
 * Full rationale: docs/MOTION_SPEC.md.
 *
 * Character: slow starts into long, soft landings. Weighty, never bouncy
 * (this is a precision instrument, not a toy), so springs are well damped.
 */

/** Seconds. */
export const duration = {
  /** Press / toggle feedback. */
  instant: 0.12,
  /** Hover, focus, small state changes. */
  quick: 0.28,
  /** Standard element transitions, menu items. */
  base: 0.6,
  /** Headline masks, rules drawing, panel swaps. */
  slow: 1.0,
  /** Large staged moves (section hand-offs). */
  cinematic: 1.5,
} as const

/** Cubic-bezier control points (usable by Motion and CSS). */
export const ease = {
  /** Fast departure, long soft landing — the default for arrivals. */
  out: [0.16, 1, 0.3, 1],
  /** Symmetric — for things that go there and back. */
  inOut: [0.65, 0, 0.35, 1],
  /** Gentle start for reveals that should feel "lit", not "popped". */
  in: [0.5, 0, 0.75, 0],
} as const

/** Same curves as functions, for `useTransform(..., { ease })` and rAF code. */
export const easeFn = {
  out: cubicBezier(...ease.out),
  inOut: cubicBezier(...ease.inOut),
  in: cubicBezier(...ease.in),
}

/** Spring presets (Motion `transition` objects). */
export const spring = {
  /** Interface elements: menu, indicator, buttons returning to rest. */
  ui: { type: 'spring', stiffness: 320, damping: 32, mass: 0.8 },
  /** Magnetic pull: quick to follow, settles without wobble. */
  magnet: { type: 'spring', stiffness: 240, damping: 20, mass: 0.35 },
  /** Soft, slow — big layers. */
  soft: { type: 'spring', stiffness: 90, damping: 22, mass: 1 },
} as const

/** Raw spring constants for the per-frame 3D springs (see lib/spring.ts). */
export const sceneSpring = {
  /** Camera parallax from the pointer. */
  camera: { stiffness: 38, damping: 11 },
  /** Product tilt from the pointer. */
  tilt: { stiffness: 48, damping: 12 },
  /** Pointer light: livelier than the camera so it feels like a hand-held lamp. */
  light: { stiffness: 90, damping: 15 },
  /** Drag-to-inspect returning to the storyboard pose. */
  drag: { stiffness: 26, damping: 7.5 },
} as const

/** Seconds between successive items. */
export const stagger = {
  letter: 0.1,
  word: 0.06,
  line: 0.1,
  item: 0.08,
} as const

/** Distances. */
export const distance = {
  /** Small settle for supporting copy (px). */
  settle: 18,
  /** Mask reveals slide fully out of a clip box. */
  mask: '110%',
} as const

/**
 * Parallax: fraction of the element's own height it drifts across the viewport.
 * Typography moves at different rates from the product (which is pinned to the
 * viewport by the canvas) so layers separate in depth.
 */
export const parallax = {
  numeral: 0.28,
  wordmark: 0.22,
  deep: 0.12,
} as const

/** Magnetic controls (fine pointers only). */
export const magnet = {
  /** Fraction of pointer offset the element follows. */
  strength: 0.32,
  /** Extra px around the element in which the pull starts. */
  radius: 56,
} as const

/** Title-sequence timing (seconds). */
export const intro = {
  total: 2.7,
  /** Time to fast-forward when the visitor skips. */
  skip: 0.45,
  /** Start anyway if the 3D scene has not reported ready by then. */
  maxWait: 2.2,
} as const

/** Scroll-linked ranges (viewport fractions) used by scrubbed text. */
export const scrub = {
  words: ['start 82%', 'end 52%'],
} as const
