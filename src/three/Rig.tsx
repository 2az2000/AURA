import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { MotionValue } from 'motion/react'
import type { Finish } from '../content/copy'
import { clamp, damp, lerp } from '../lib/math'
import { makeSpring, springActive, stepSpring } from '../lib/spring'
import { easeFn, intro as INTRO, sceneSpring } from '../motion/tokens'
import { HOTSPOT_IDS, type SceneBridge } from '../story/hotspots'
import { story } from '../story/store'
import type { HotspotId } from '../story/storyboard'
import { Headphone, type AnchorMap, type HeadphoneDrive } from './Headphone'
import { forcedTier, type TierConfig } from './quality'

const BASE_Z = 9.5 // camera distance the storyboard's x/y fractions are defined at
const FOV = 26

/** Pose fields that are damped toward the storyboard. */
const POSE_KEYS = ['x', 'y', 'scale', 'rotX', 'rotY', 'rotZ', 'explode', 'glow', 'fx', 'solo', 'tint', 'orbit'] as const

/** Shots during which the product idles (gentle sway) — the two "poster" moments. */
const isPosterShot = () => (story.index === 0 && story.t < 0.5) || story.activeId === 'reserve'

/**
 * The scene driver. Once per rendered frame it:
 *  1. samples the storyboard pose for the current scroll and damps toward it,
 *  2. adds pointer parallax (camera + tilt), drag-to-inspect and idle sway — all springs,
 *  3. plays the title-sequence arrival (light, camera dolly, spin-in, ring ignition),
 *  4. projects hotspots and the light pool into screen space for the DOM,
 *  5. decides whether another frame is needed (on-demand rendering).
 */
export function Rig({
  finish,
  reduced,
  cfg,
  introProgress,
  bridge,
  onReady,
  onTier,
}: {
  finish: Finish
  reduced: boolean
  cfg: TierConfig
  introProgress: MotionValue<number>
  bridge: SceneBridge
  onReady: () => void
  onTier: (dir: 1 | -1) => void
}) {
  const outer = useRef<THREE.Group>(null)
  const inner = useRef<THREE.Group>(null)
  const lamp = useRef<THREE.PointLight>(null)
  const drive = useRef<HeadphoneDrive>({ explode: 0, glow: 0, solo: 0 })
  const anchors = useRef<AnchorMap>({})
  const { scene, camera, size, invalidate } = useThree()

  // --- state that lives across frames (refs: never triggers React renders) -------------
  const cur = useRef({ x: 0, y: 0, scale: 1, rotX: 0, rotY: 0, rotZ: 0, explode: 0, glow: 0, fx: 0, solo: 0, tint: 0, orbit: 0, init: false })
  const pointer = useRef({ x: 0, y: 0 })
  const sp = useRef({
    camX: makeSpring(), camY: makeSpring(),
    tiltX: makeSpring(), tiltY: makeSpring(),
    lampX: makeSpring(), lampY: makeSpring(),
    drag: makeSpring(),
  })
  const dragging = useRef<{ startX: number; base: number } | null>(null)
  const dragTarget = useRef(0)
  const idleAmt = useRef(0)
  const idleTimer = useRef(0)
  const perf = useRef({ acc: 0, n: 0, slow: 0, fast: 0 })
  const frames = useRef(0)
  const hotspotFlags = useRef<Partial<Record<HotspotId, boolean>>>({})
  const tmp = useRef({ v: new THREE.Vector3(), n: new THREE.Vector3(), c: new THREE.Vector3() })
  const adaptive = useRef(forcedTier() === null)
  const debug = useRef(typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('debug'))

  // --- wake-ups: anything that changes what should be on screen requests a frame ----------
  useEffect(() => {
    const wake = () => invalidate()
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1
      const d = dragging.current
      if (d) dragTarget.current = clamp(d.base + (e.clientX - d.startX) * 0.0075, -1.8, 1.8)
      invalidate()
    }
    const onDown = (e: PointerEvent) => {
      // Drag-to-inspect starts only inside an explicit drag zone (see DragZone.tsx).
      if (e.pointerType === 'mouse' && e.button !== 0) return
      if (!(e.target as HTMLElement | null)?.closest?.('[data-drag-zone]')) return
      dragging.current = { startX: e.clientX, base: sp.current.drag.x }
      invalidate()
    }
    const onUp = () => {
      if (!dragging.current) return
      dragging.current = null
      dragTarget.current = 0 // spring back to the storyboard pose
      invalidate()
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    window.addEventListener('pointercancel', onUp, { passive: true })
    window.addEventListener('resize', wake)
    const off = story.onUpdate(wake)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      window.removeEventListener('resize', wake)
      off()
      window.clearTimeout(idleTimer.current)
    }
  }, [invalidate])

  useEffect(() => invalidate(), [finish, invalidate])

  useFrame((state, dtRaw) => {
    const g = outer.current
    if (!g || !inner.current) return
    const dt = Math.min(dtRaw, 0.05)
    const c = cur.current
    const pose = story.pose
    const k = sp.current

    if (!c.init) {
      Object.assign(c, { ...pose, init: true })
      c.glow = 0
    }

    // 1 — title sequence -----------------------------------------------------------------
    const p = reduced ? 1 : introProgress.get()
    const tSec = p * INTRO.total
    const seg = (a: number, b: number) => clamp((tSec - a) / (b - a))
    const introActive = p < 1
    const arrive = easeFn.out(seg(0.15, 2.0)) // product arrives
    const light = easeFn.inOut(seg(0.0, 1.4)) // studio light comes up from black
    const ignite = easeFn.out(seg(1.1, 2.0)) // the ring lights last

    // 2 — storyboard pose, damped ------------------------------------------------------------
    const lam = reduced ? 30 : 3.4
    let poseDelta = 0
    for (const key of POSE_KEYS) {
      const target = pose[key]
      c[key] = damp(c[key], target, key === 'explode' ? (reduced ? 30 : 2.6) : key === 'glow' || key === 'tint' ? 4 : lam, dt)
      poseDelta += Math.abs(c[key] - target)
    }

    // 3 — springs: pointer parallax, drag, lamp ---------------------------------------------
    const calm = reduced ? 0 : 1
    const px = pointer.current.x * calm
    const py = pointer.current.y * calm
    const camX = stepSpring(k.camX, px * 0.3, sceneSpring.camera.stiffness, sceneSpring.camera.damping, dt)
    const camY = stepSpring(k.camY, -py * 0.17, sceneSpring.camera.stiffness, sceneSpring.camera.damping, dt)
    const tiltY = stepSpring(k.tiltX, px * 0.1, sceneSpring.tilt.stiffness, sceneSpring.tilt.damping, dt)
    const tiltX = stepSpring(k.tiltY, py * 0.05, sceneSpring.tilt.stiffness, sceneSpring.tilt.damping, dt)
    const lampX = stepSpring(k.lampX, px * 3.4, sceneSpring.light.stiffness, sceneSpring.light.damping, dt)
    const lampY = stepSpring(k.lampY, -py * 2.2, sceneSpring.light.stiffness, sceneSpring.light.damping, dt)
    const dragYaw = stepSpring(k.drag, reduced ? 0 : dragTarget.current, sceneSpring.drag.stiffness, sceneSpring.drag.damping, dt)
    const springsMoving =
      springActive(k.camX, px * 0.3) || springActive(k.camY, -py * 0.17) || springActive(k.tiltX, px * 0.1) ||
      springActive(k.tiltY, py * 0.05) || springActive(k.lampX, px * 3.4) || springActive(k.lampY, -py * 2.2) ||
      springActive(k.drag, dragTarget.current, 0.002)

    // idle sway on poster shots (fades in/out so it never pops)
    const idle = !reduced && !introActive && isPosterShot()
    idleAmt.current = damp(idleAmt.current, idle ? 1 : 0, 2.2, dt)
    const t = state.clock.elapsedTime
    const sway = idleAmt.current

    // 4 — apply to the scene ---------------------------------------------------------------
    const refH = 2 * BASE_Z * Math.tan((FOV * Math.PI) / 360)
    const refW = refH * (size.width / size.height)
    const portrait = size.width < size.height
    const fit = portrait ? (refW / 3) * (size.width > 700 ? 0.72 : 1) : 1
    const zoom = lerp(0.8, 1, arrive)

    g.position.set(
      c.x * refW,
      c.y * refH - (1 - arrive) * 0.06 * refH + Math.sin(t * 0.7) * 0.035 * sway,
      0,
    )
    g.scale.setScalar(c.scale * fit * zoom)
    g.rotation.set(
      c.rotX + tiltX + Math.sin(t * 0.45) * 0.015 * sway,
      c.rotY + tiltY + dragYaw + Math.sin(t * 0.3) * 0.035 * sway - (1 - arrive) * 1.5,
      c.rotZ,
    )
    inner.current.position.set(-c.fx, 0, 0)

    camera.position.set(camX, camY, BASE_Z * lerp(1.14, 1, arrive))
    camera.lookAt(0, 0, 0)
    camera.updateMatrixWorld()

    // light: environment intensity + rotation (highlights sweep as the story advances)
    scene.environmentIntensity = light
    scene.environmentRotation.y = -c.rotY * 0.45 + (story.index + story.t) * 0.28 + px * 0.2
    if (lamp.current) {
      lamp.current.position.set(lampX, lampY + 0.6, 2.8)
      lamp.current.intensity = cfg.pointLight ? 9 * light : 0
    }
    drive.current.explode = c.explode
    drive.current.solo = c.solo
    drive.current.glow = c.glow * ignite

    // 5 — DOM: hotspots + light pool ----------------------------------------------------
    g.updateMatrixWorld(true)
    const { v, n, c: cc } = tmp.current
    const halfW = size.width / 2
    const halfH = size.height / 2
    for (const id of HOTSPOT_IDS) {
      const el = bridge.hotspots[id]
      if (!el) continue
      const anchor = anchors.current[id]
      let vis = debug.current ? 1 : story.weights[id] ?? 0
      const was = hotspotFlags.current[id]
      if (vis <= 0.001 && was === false) continue // hidden and already marked hidden
      if (anchor && vis > 0.001) {
        anchor.obj.updateWorldMatrix(true, false)
        v.copy(anchor.offset)
        anchor.obj.localToWorld(v)
        if (anchor.normal && !debug.current) {
          n.copy(anchor.normal).transformDirection(anchor.obj.matrixWorld)
          cc.copy(camera.position).sub(v).normalize()
          const facing = n.dot(cc)
          vis *= clamp((facing - 0.05) / 0.3)
        }
        v.project(camera)
        el.style.transform = `translate3d(${(v.x * halfW + halfW).toFixed(1)}px, ${(-v.y * halfH + halfH).toFixed(1)}px, 0)`
      } else if (!anchor) vis = 0
      vis *= light
      el.style.opacity = vis.toFixed(3)
      const on = vis > 0.55
      if (hotspotFlags.current[id] !== on) {
        hotspotFlags.current[id] = on
        el.dataset.on = on ? 'true' : 'false'
        el.style.pointerEvents = on ? 'auto' : 'none'
        el.toggleAttribute('inert', !on)
      }
    }
    // light pool follows the product's screen position, crossfading neutral ↔ cool by `tint`
    v.set(0, 0, 0)
    g.localToWorld(v)
    v.project(camera)
    const pool = `translate3d(${(v.x * halfW).toFixed(1)}px, ${(-v.y * halfH).toFixed(1)}px, 0)`
    if (bridge.poolNeutral) {
      bridge.poolNeutral.style.transform = pool
      bridge.poolNeutral.style.opacity = ((1 - c.tint) * light).toFixed(3)
    }
    if (bridge.poolCool) {
      bridge.poolCool.style.transform = pool
      bridge.poolCool.style.opacity = (c.tint * light).toFixed(3)
    }

    // light position for the background field (0..1, y up)
    bridge.light.x = v.x * 0.5 + 0.5
    bridge.light.y = v.y * 0.5 + 0.5

    // orbit ring: centred on the product, scales with it
    if (bridge.orbit) {
      // centre the ring on the product's visual middle (the band rises above the cup axis)
      const oc = tmp.current.v.set(0, 0.5, 0)
      inner.current.updateWorldMatrix(true, false)
      inner.current.localToWorld(oc)
      oc.project(camera)
      const os = 0.8 + Math.min(c.scale * fit, 1.6) * 0.3
      bridge.orbit.style.transform = `translate3d(${(oc.x * halfW).toFixed(1)}px, ${(-oc.y * halfH).toFixed(1)}px, 0) scale(${os.toFixed(3)})`
      bridge.orbit.style.opacity = (c.orbit * light).toFixed(3)
    }

    // dimensioned axis through the exploded right cup (anatomy only)
    if (bridge.axis) {
      const w = (story.weights.plate ?? 0) * light
      if (w > 0.001 || bridge.axis.style.opacity !== '0') {
        bridge.axis.style.opacity = w.toFixed(3)
        if (w > 0.001) {
          inner.current.updateWorldMatrix(true, false)
          const a = tmp.current.v.set(-0.55, 0, 0)
          inner.current.localToWorld(a)
          a.project(camera)
          const b2 = tmp.current.n.set(3.0, 0, 0)
          inner.current.localToWorld(b2)
          b2.project(camera)
          const x1 = a.x * halfW + halfW
          const y1 = -a.y * halfH + halfH
          const x2 = b2.x * halfW + halfW
          const y2 = -b2.y * halfH + halfH
          const len = Math.hypot(x2 - x1, y2 - y1)
          const ang = Math.atan2(y2 - y1, x2 - x1)
          bridge.axis.style.transform = `translate3d(${x1.toFixed(1)}px, ${y1.toFixed(1)}px, 0) rotate(${ang.toFixed(4)}rad) scaleX(${(len / 1000).toFixed(4)})`
        }
      }
    }

    // sound rings: centred on the (mirrored) plate that carries the mic hotspot
    if (bridge.rings) {
      const w = (story.weights.mic ?? 0) * light
      bridge.rings.style.opacity = w.toFixed(3)
      const m = anchors.current.mic
      if (m && w > 0.001) {
        m.obj.updateWorldMatrix(true, false)
        const q = tmp.current.v.set(0.5, 0.05, 0)
        m.obj.localToWorld(q)
        q.project(camera)
        const rs = Math.min(c.scale * fit, 1.6) * 0.95
        bridge.rings.style.transform = `translate3d(${(q.x * halfW).toFixed(1)}px, ${(-q.y * halfH).toFixed(1)}px, 0) scale(${rs.toFixed(3)})`
      }
    }

    // 6 — first frames: tell the page the scene is alive (starts the title sequence) ---------
    frames.current++
    if (frames.current === 3) onReady()

    // 7 — adaptive quality from measured frame times (only while genuinely animating) --------
    if (adaptive.current && dtRaw < 0.1 && frames.current > 8) {
      const m = perf.current
      m.acc += dtRaw
      if (++m.n >= 45) {
        const fps = m.n / m.acc
        m.acc = 0
        m.n = 0
        if (fps < 34) {
          m.fast = 0
          if (++m.slow >= 2) {
            m.slow = 0
            onTier(-1)
          }
        } else if (fps > 57) {
          m.slow = 0
          if (++m.fast >= 5) {
            m.fast = 0
            onTier(1)
          }
        } else {
          m.slow = m.fast = 0
        }
      }
    }

    // 8 — on-demand rendering: ask for another frame only while something is still moving ----
    const moving =
      introActive || poseDelta > 0.0008 || springsMoving || !!dragging.current || sway > 0.01 || (idle && !reduced)
    if (moving) {
      if (idle && !introActive && poseDelta <= 0.0008 && !springsMoving) {
        // poster idle: ~30 fps is plenty for a slow sway
        if (!idleTimer.current) {
          idleTimer.current = window.setTimeout(() => {
            idleTimer.current = 0
            invalidate()
          }, 33)
        }
      } else {
        invalidate()
      }
    }
  })

  return (
    <>
      <pointLight ref={lamp} color="#cfe2ff" distance={0} decay={2} intensity={0} />
      <group ref={outer}>
        <group ref={inner}>
          <Headphone rig={drive} finish={finish} anchors={anchors} segments={cfg.segments} />
        </group>
      </group>
    </>
  )
}
