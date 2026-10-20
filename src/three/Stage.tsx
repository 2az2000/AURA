import { Suspense, useCallback, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import type { MotionValue } from 'motion/react'
import type { Finish } from '../content/copy'
import { detectTier, forcedTier, stepTier, tierRank, TIERS, type Tier } from './quality'
import type { SceneBridge } from '../story/hotspots'
import { Rig } from './Rig'

/**
 * Studio lighting, built from emissive "light cards" rendered once into an
 * environment map. This is how product photographers light chrome: the
 * reflections on the titanium are the shapes of these cards. No HDRI download.
 * The Rig then rotates the environment with scroll so highlights sweep across the metal.
 */
function StudioLights({ resolution }: { resolution: number }) {
  return (
    <Environment key={resolution} resolution={resolution} frames={1}>
      <color attach="background" args={['#030405']} />
      {/* key strip — top left, long and soft: draws the long highlight down the band */}
      <Lightformer form="rect" intensity={9} color="#ffffff" position={[-5, 4, 3]} rotation={[0, Math.PI / 4, 0]} scale={[8, 1.4, 1]} />
      {/* big overhead softbox: fills the cup tops */}
      <Lightformer form="rect" intensity={2.4} color="#e9eef7" position={[0, 6, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[9, 6, 1]} />
      {/* ice rim light from behind-right: the only coloured light */}
      <Lightformer form="rect" intensity={10} color="#83b8ff" position={[6, 1, -4]} rotation={[0, -Math.PI / 3, 0]} scale={[1.2, 8, 1]} />
      {/* low kicker for shape in the shadows */}
      <Lightformer form="rect" intensity={2.4} color="#bfc8d5" position={[-6, -2, 1]} rotation={[0, Math.PI / 2.4, 0]} scale={[2, 5, 1]} />
      {/* ring light: clean circular reflections on the cup faces */}
      <Lightformer form="ring" intensity={4} color="#ffffff" position={[0, 0.5, 6]} scale={3.2} />
    </Environment>
  )
}

export interface StageProps {
  finish: Finish
  reduced: boolean
  introProgress: MotionValue<number>
  bridge: SceneBridge
  /** Called once the first frames have rendered. */
  onReady: () => void
  /** Called if the GL context is lost (the page swaps to the static fallback). */
  onLost: () => void
}

/**
 * The fixed WebGL layer. It sits behind the foreground text (z-index 1) and
 * never captures pointer events, so the page scrolls and clicks normally.
 *
 * Rendering is on demand: frames are produced only while something is moving
 * (scroll, pointer, intro, damping, idle sway on poster shots). At rest the GPU is idle.
 */
export default function Stage({ finish, reduced, introProgress, bridge, onReady, onLost }: StageProps) {
  const [tier, setTier] = useState<Tier>(detectTier)
  // The tier never climbs more than one step above the device-based first guess.
  const maxRank = useRef(tierRank(stepTier(tier, 1)))
  const locked = forcedTier() !== null
  const cfg = TIERS[tier]

  const onTier = useCallback(
    (dir: 1 | -1) => {
      if (locked) return
      setTier((t) => {
        const next = stepTier(t, dir)
        return tierRank(next) > maxRank.current ? t : next
      })
    },
    [locked],
  )

  return (
    <div className="pointer-events-none fixed inset-0 z-[1]" aria-hidden="true">
      <Canvas
        dpr={[1, cfg.dpr]}
        camera={{ fov: 26, position: [0, 0, 9.5], near: 0.1, far: 50 }}
        gl={{
          antialias: tier !== 'low',
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
        }}
        frameloop="demand"
        style={{ pointerEvents: 'none' }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener('webglcontextlost', (e) => {
            e.preventDefault()
            onLost()
          })
        }}
      >
        <Suspense fallback={null}>
          <StudioLights resolution={cfg.envRes} />
          <Rig
            finish={finish}
            reduced={reduced}
            cfg={cfg}
            introProgress={introProgress}
            bridge={bridge}
            onReady={onReady}
            onTier={onTier}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
