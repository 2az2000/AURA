import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, PerformanceMonitor } from '@react-three/drei'
import * as THREE from 'three'
import type { Finish } from '../content/copy'
import { damp } from '../lib/math'
import { anatomy } from '../content/copy'
import { Headphone, type HeadphoneDrive, type PartAnchors, type PartKey } from './Headphone'
import { useStory } from './useStory'

/** Leader-line lengths (px), alternated so neighbouring labels never overlap. */
const LABEL_LINE: Record<PartKey, number> = { pad: 120, driver: 48, shell: 120, plate: 48 }

const PART_KEYS: PartKey[] = ['plate', 'shell', 'driver', 'pad']

/**
 * Studio lighting, built from emissive "light cards" rendered once into an
 * environment map. This is how product photographers light chrome: the
 * reflections you see on the titanium are the shapes of these cards.
 * No HDRI file is downloaded.
 */
function StudioLights() {
  return (
    <Environment resolution={512} frames={1} environmentIntensity={1}>
      <color attach="background" args={['#030405']} />
      {/* key strip — top left, long and soft: draws the long highlight down the band */}
      <Lightformer form="rect" intensity={9} color="#ffffff" position={[-5, 4, 3]} rotation={[0, Math.PI / 4, 0]} scale={[8, 1.4, 1]} />
      {/* big overhead softbox: fills the cup tops */}
      <Lightformer form="rect" intensity={2.4} color="#e9eef7" position={[0, 6, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[9, 6, 1]} />
      {/* ice rim light from behind-right: the only coloured light */}
      <Lightformer form="rect" intensity={10} color="#83b8ff" position={[6, 1, -4]} rotation={[0, -Math.PI / 3, 0]} scale={[1.2, 8, 1]} />
      {/* faint warm-neutral kicker from low left for shape in the shadows */}
      <Lightformer form="rect" intensity={2.4} color="#bfc8d5" position={[-6, -2, 1]} rotation={[0, Math.PI / 2.4, 0]} scale={[2, 5, 1]} />
      {/* ring light: gives cup faces a clean circular reflection */}
      <Lightformer form="ring" intensity={4} color="#ffffff" position={[0, 0.5, 6]} scale={3.2} />
    </Environment>
  )
}

/** Applies the scroll-driven shot + idle motion + pointer parallax to the model. */
function Rig({
  finish,
  reduced,
  labels,
}: {
  finish: Finish
  reduced: boolean
  /** DOM elements for the exploded-view labels (null on small screens). */
  labels: React.RefObject<Partial<Record<PartKey, HTMLElement | null>>> | null
}) {
  const group = useRef<THREE.Group>(null)
  const drive = useRef<HeadphoneDrive>({ explode: 0, glow: 1 })
  const pointer = useRef({ x: 0, y: 0 })
  const { sample } = useStory()
  const anchors = useRef<PartAnchors>({})
  const { viewport, size, camera } = useThree()
  const tmp = useRef(new THREE.Vector3())

  // Pointer is tracked on window because the canvas itself is pointer-events: none.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  // Current (damped) state
  const cur = useRef({ x: 0, y: 0, scale: 1, rotX: 0, rotY: 0, rotZ: 0, explode: 0, glow: 1, init: false })

  useFrame(({ clock }, dt) => {
    const g = group.current
    if (!g) return
    dt = Math.min(dt, 0.05)
    const shot = sample()
    const c = cur.current
    if (!c.init) {
      Object.assign(c, { ...shot, init: true })
    }
    // Slower for position/scale (weighty), faster for rotation response.
    const lam = reduced ? 30 : 3.4
    c.x = damp(c.x, shot.x, lam, dt)
    c.y = damp(c.y, shot.y, lam, dt)
    c.scale = damp(c.scale, shot.scale, lam, dt)
    c.rotX = damp(c.rotX, shot.rotX, lam, dt)
    c.rotY = damp(c.rotY, shot.rotY, lam, dt)
    c.rotZ = damp(c.rotZ, shot.rotZ, lam, dt)
    c.explode = damp(c.explode, shot.explode, reduced ? 30 : 2.6, dt)
    c.glow = damp(c.glow, shot.glow, 4, dt)

    const t = reduced ? 0 : clock.elapsedTime
    const px = reduced ? 0 : pointer.current.x
    const py = reduced ? 0 : pointer.current.y

    g.position.set(
      c.x * viewport.width,
      c.y * viewport.height + Math.sin(t * 0.7) * 0.035,
      0,
    )
    // In portrait the viewport is narrow: scale the model with its width so it never overflows.
    const fit = viewport.width < viewport.height ? viewport.width / 3 : 1
    g.scale.setScalar(c.scale * fit)
    g.rotation.set(
      c.rotX + py * 0.07 + Math.sin(t * 0.45) * 0.015,
      c.rotY + px * 0.16 + Math.sin(t * 0.3) * 0.035,
      c.rotZ,
    )
    drive.current.explode = c.explode
    drive.current.glow = c.glow

    // Project each part of the right cup to screen space and move its DOM label there.
    if (labels?.current) {
      const fade = Math.max(0, (c.explode - 0.6) / 0.4)
      for (const key of PART_KEYS) {
        const el = labels.current[key]
        const part = anchors.current[key]
        if (!el || !part) continue
        el.style.opacity = String(fade)
        if (fade <= 0) continue
        // Point on the top edge of the part (local -X maps to world +Y inside the cup group).
        part.updateWorldMatrix(true, false)
        tmp.current.set(-0.72, 0, 0).applyMatrix4(part.matrixWorld).project(camera)
        const x = (tmp.current.x * 0.5 + 0.5) * size.width
        const y = (-tmp.current.y * 0.5 + 0.5) * size.height
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -100%)`
      }
    }
  })

  return (
    <group ref={group}>
      <Headphone rig={drive} finish={finish} anchors={anchors} />
    </group>
  )
}

export interface StageProps {
  finish: Finish
  reduced: boolean
  /** True on narrow screens, where in-canvas labels would collide with text. */
  compact: boolean
}

/**
 * The fixed WebGL layer. It sits behind the foreground text (z-index 1) and
 * never captures pointer events, so the page scrolls and clicks normally.
 */
export default function Stage({ finish, reduced, compact }: StageProps) {
  const [dpr, setDpr] = useState(1.5)
  const labelEls = useRef<Partial<Record<PartKey, HTMLElement | null>>>({})

  return (
    <div className="pointer-events-none fixed inset-0 z-[1]" aria-hidden="true">
      <Canvas
        dpr={[1, dpr]}
        camera={{ fov: 26, position: [0, 0, 9.5], near: 0.1, far: 50 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping }}
        frameloop="always"
        style={{ pointerEvents: 'none' }}
      >
        {/* Adaptive resolution: drop pixel ratio if the device struggles, restore when it recovers. */}
        <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(1.75)} flipflops={3} />
        <Suspense fallback={null}>
          <StudioLights />
          <Rig finish={finish} reduced={reduced} labels={compact ? null : labelEls} />
        </Suspense>
      </Canvas>

      {/* Exploded-view labels. Plain DOM, positioned each frame by <Rig>. */}
      {!compact &&
        anatomy.parts.map((p) => (
          <div
            key={p.key}
            ref={(el) => {
              labelEls.current[p.key as PartKey] = el
            }}
            className="absolute left-0 top-0 flex flex-col items-center gap-2 opacity-0 will-change-transform"
          >
            <span className="label whitespace-nowrap text-bone">
              <span className="text-ice">{p.n}</span>&nbsp;&nbsp;{p.name}
            </span>
            <span
              className="block w-px bg-gradient-to-b from-silver/70 to-silver/0"
              style={{ height: LABEL_LINE[p.key as PartKey] }}
            />
          </div>
        ))}
    </div>
  )
}
