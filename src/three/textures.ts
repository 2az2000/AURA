import * as THREE from 'three'

/**
 * Procedural textures. Generating them on a canvas keeps the project free of
 * external image assets (nothing to license, nothing to download) and lets us
 * tune the look from code.
 */

/** Small seeded PRNG so the textures are identical on every load. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Brushed-metal grain: every pixel row gets its own brightness, so the grain
 * runs along the U direction of the UVs. On a lathe surface that gives
 * concentric (circular) brushing; on a tube it gives lengthwise brushing.
 */
export function makeBrushedTexture(size = 1024, seed = 7) {
  const rand = mulberry32(seed)
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')!
  for (let y = 0; y < size; y++) {
    // Mostly constant along the row (the brushing direction); a little slow variation
    // along it so the grain never looks perfectly synthetic.
    const base = 150 + rand() * 90
    for (let x = 0; x < size; x += 64) {
      const v = base + (rand() - 0.5) * 8
      g.fillStyle = `rgb(${v},${v},${v})`
      g.fillRect(x, y, 64, 1)
    }
  }
  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.anisotropy = 8
  return tex
}

/** Woven fabric micro-pattern used as a bump map on the ear pads / mesh. */
export function makeWeaveTexture(size = 128) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')!
  const cell = size / 16
  for (let j = 0; j < 16; j++) {
    for (let i = 0; i < 16; i++) {
      const over = (i + j) % 2 === 0
      const grad = over
        ? g.createLinearGradient(i * cell, 0, (i + 1) * cell, 0)
        : g.createLinearGradient(0, j * cell, 0, (j + 1) * cell)
      grad.addColorStop(0, '#303030')
      grad.addColorStop(0.5, '#e8e8e8')
      grad.addColorStop(1, '#303030')
      g.fillStyle = grad
      g.fillRect(i * cell, j * cell, cell, cell)
    }
  }
  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(10, 4)
  tex.anisotropy = 8
  return tex
}
