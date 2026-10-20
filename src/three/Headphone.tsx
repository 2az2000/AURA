import { useMemo, useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Finish } from '../content/copy'
import { damp } from '../lib/math'
import { makeBrushedTexture, makeWeaveTexture } from './textures'

/**
 * AURA headphone — fully procedural (no model file).
 *
 * Coordinate conventions
 *  - The headphone is centred on the origin, front view looks down -Z.
 *  - The right cup sits at +X. The left cup is the same group mirrored.
 *  - Inside a cup group, the *local +Y axis points away from the head*
 *    (outward). Ear pads are therefore at negative local Y.
 *  - Cups are slightly oval: wider vertically than front-to-back (CUP_DEPTH).
 *
 * Exploded view: each cup part slides along its local Y axis by
 * `explode * PART_TRAVEL[part]`.
 */

export interface HeadphoneDrive {
  /** 0 assembled → 1 exploded. */
  explode: number
  /** Indicator ring brightness. */
  glow: number
}

/** Part groups of the right cup, exposed so the DOM label overlay can project them to screen space. */
export type PartKey = 'plate' | 'shell' | 'driver' | 'pad'
export type PartAnchors = Partial<Record<PartKey, THREE.Object3D | null>>

const CUP_X = 0.95 // distance from centre to the middle of each cup
const CUP_DEPTH = 0.82 // oval squash (front-to-back)
const BAND_TOP = 1.7
const BAND_CENTER_Y = 0.95

/** How far each part travels along the cup axis when fully exploded. */
const PART_TRAVEL = { plate: 1.0, shell: 0.5, driver: -0.28, pad: -0.4 }

const ICE = new THREE.Color('#83b8ff')

/* ------------------------------------------------------------------ */
/* Geometry                                                            */
/* ------------------------------------------------------------------ */

/** Lathe from a flat list of [radius, height] pairs. */
function lathe(points: [number, number][], segments = 96) {
  return new THREE.LatheGeometry(
    points.map(([r, y]) => new THREE.Vector2(r, y)),
    segments,
  )
}

function useGeometry() {
  return useMemo(() => {
    // Cup shell: hollow, open towards the head. Points run centre → outer wall → inner wall.
    const shell = lathe([
      [0.0, 0.235],
      [0.5, 0.235],
      [0.585, 0.215],
      [0.645, 0.12],
      [0.672, -0.04],
      [0.652, -0.19],
      [0.612, -0.262],
      [0.572, -0.262],
      [0.604, -0.19],
      [0.622, -0.04],
      [0.598, 0.1],
      [0.52, 0.185],
      [0.0, 0.195],
    ])

    // Face plate: slightly domed disc with a stepped centre medallion and a bevelled rim.
    const plate = lathe([
      [0.0, 0.318],
      [0.15, 0.318],
      [0.156, 0.306],
      [0.2, 0.3],
      [0.46, 0.3],
      [0.47, 0.29],
      [0.55, 0.285],
      [0.578, 0.268],
      [0.58, 0.245],
      [0.0, 0.245],
    ])

    // Driver diaphragm (shallow cone/dome).
    const diaphragm = lathe([
      [0.0, 0.085],
      [0.1, 0.082],
      [0.22, 0.06],
      [0.34, 0.015],
      [0.385, -0.01],
      [0.37, -0.02],
      [0.0, 0.0],
    ])

    // Band: half-ellipse that drops vertically into the cup yokes.
    const bandPts: THREE.Vector3[] = []
    const padPts: THREE.Vector3[] = []
    const b = BAND_TOP - BAND_CENTER_Y
    for (let i = 0; i <= 120; i++) {
      const a = (i / 120) * Math.PI
      bandPts.push(new THREE.Vector3(CUP_X * Math.cos(a), BAND_CENTER_Y + b * Math.sin(a), 0))
    }
    for (let i = 0; i <= 80; i++) {
      const a = Math.PI * (0.27 + (i / 80) * 0.46)
      padPts.push(new THREE.Vector3((CUP_X - 0.1) * Math.cos(a), BAND_CENTER_Y + (b - 0.11) * Math.sin(a), 0))
    }
    const band = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(bandPts), 220, 0.05, 24, false)
    const bandPad = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(padPts), 120, 0.085, 24, false)

    // Yoke: semicircular arc over the top of the cup, in the YZ plane.
    const yokePts: THREE.Vector3[] = []
    for (let i = 0; i <= 48; i++) {
      const a = (i / 48) * Math.PI
      yokePts.push(new THREE.Vector3(0, 0.79 * Math.sin(a), 0.62 * Math.cos(a)))
    }
    const yoke = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(yokePts), 64, 0.036, 16, false)

    return { shell, plate, diaphragm, band, bandPad, yoke }
  }, [])
}

/* ------------------------------------------------------------------ */
/* Materials                                                           */
/* ------------------------------------------------------------------ */

function useMaterials() {
  return useMemo(() => {
    const brushed = makeBrushedTexture()
    const brushedBand = brushed.clone()
    brushedBand.needsUpdate = true
    brushedBand.repeat.set(1, 3)
    const weave = makeWeaveTexture()

    const metal = new THREE.MeshPhysicalMaterial({
      color: '#4a505b',
      metalness: 1,
      roughness: 0.42,
      roughnessMap: brushed,
      bumpMap: brushed,
      bumpScale: 0.35,
      anisotropy: 0.6,
    })
    const shell = new THREE.MeshPhysicalMaterial({
      color: '#16181c',
      metalness: 0.55,
      roughness: 0.32,
      clearcoat: 1,
      clearcoatRoughness: 0.16,
      side: THREE.DoubleSide,
    })
    const band = new THREE.MeshPhysicalMaterial({
      color: '#16181c',
      metalness: 0.6,
      roughness: 0.4,
      roughnessMap: brushedBand,
      clearcoat: 0.8,
      clearcoatRoughness: 0.25,
    })
    const leather = new THREE.MeshPhysicalMaterial({
      color: '#0d0e10',
      metalness: 0,
      roughness: 0.55,
      sheen: 0.6,
      sheenRoughness: 0.5,
      sheenColor: new THREE.Color('#5a6270'),
    })
    const fabric = new THREE.MeshStandardMaterial({
      color: '#17191d',
      roughness: 0.9,
      bumpMap: weave,
      bumpScale: 1.4,
    })
    const foil = new THREE.MeshPhysicalMaterial({
      color: '#aeb6c2',
      metalness: 1,
      roughness: 0.28,
    })
    const rubber = new THREE.MeshStandardMaterial({ color: '#0f1012', roughness: 0.7, metalness: 0.1 })
    const magnet = new THREE.MeshStandardMaterial({ color: '#1d2024', roughness: 0.45, metalness: 0.9 })
    const light = new THREE.MeshStandardMaterial({
      color: '#05070a',
      emissive: ICE,
      emissiveIntensity: 2,
      roughness: 0.4,
      toneMapped: false,
    })

    return { metal, shell, band, leather, fabric, foil, rubber, magnet, light }
  }, [])
}

/* ------------------------------------------------------------------ */
/* One cup (right-hand; mirrored for the left)                         */
/* ------------------------------------------------------------------ */

type Mats = ReturnType<typeof useMaterials>
type Geos = ReturnType<typeof useGeometry>

function Cup({ rig, mats, geo, anchors }: { rig: RefObject<HeadphoneDrive>; mats: Mats; geo: Geos; anchors?: RefObject<PartAnchors> }) {
  const plate = useRef<THREE.Group>(null)
  const shell = useRef<THREE.Group>(null)
  const driver = useRef<THREE.Group>(null)
  const pad = useRef<THREE.Group>(null)

  useFrame(() => {
    const e = rig.current?.explode ?? 0
    if (plate.current) plate.current.position.y = e * PART_TRAVEL.plate
    if (shell.current) shell.current.position.y = e * PART_TRAVEL.shell
    if (driver.current) driver.current.position.y = e * PART_TRAVEL.driver
    if (pad.current) pad.current.position.y = e * PART_TRAVEL.pad
  })

  const register = (key: PartKey) => (o: THREE.Object3D | null) => {
    if (anchors?.current) anchors.current[key] = o
  }

  return (
    // Axis: local +Y = outward. Rotating -90° about Z maps local +Y onto world +X.
    <group position={[CUP_X, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
      <group scale={[1, 1, CUP_DEPTH]}>
        {/* 01 — Face plate */}
        <group ref={(o) => { plate.current = o; register('plate')(o) }}>
          <mesh geometry={geo.plate} material={mats.metal} />
          {/* machined groove */}
          <mesh position={[0, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.33, 0.004, 8, 128]} />
            <meshStandardMaterial color="#050607" roughness={0.9} />
          </mesh>
        </group>

        {/* 02 — Chassis */}
        <group ref={(o) => { shell.current = o; register('shell')(o) }}>
          <mesh geometry={geo.shell} material={mats.shell} />
          {/* indicator ring in the seam between plate and chassis */}
          <mesh position={[0, 0.247, 0]} rotation={[Math.PI / 2, 0, 0]} material={mats.light}>
            <torusGeometry args={[0.592, 0.01, 12, 160]} />
          </mesh>
        </group>

        {/* 03 — Driver */}
        <group ref={(o) => { driver.current = o; register('driver')(o) }}>
          <group position={[0, -0.04, 0]}>
            <mesh geometry={geo.diaphragm} material={mats.foil} />
            <mesh position={[0, -0.01, 0]} rotation={[Math.PI / 2, 0, 0]} material={mats.rubber}>
              <torusGeometry args={[0.4, 0.04, 16, 96]} />
            </mesh>
            <mesh position={[0, -0.03, 0]} material={mats.magnet}>
              <cylinderGeometry args={[0.43, 0.43, 0.03, 64]} />
            </mesh>
            <mesh position={[0, -0.12, 0]} material={mats.magnet}>
              <cylinderGeometry args={[0.24, 0.24, 0.16, 48]} />
            </mesh>
            <mesh position={[0, -0.2, 0]} rotation={[Math.PI / 2, 0, 0]} material={mats.light}>
              <torusGeometry args={[0.2, 0.006, 8, 64]} />
            </mesh>
          </group>
        </group>

        {/* 04 — Ear pad */}
        <group ref={(o) => { pad.current = o; register('pad')(o) }}>
          <mesh position={[0, -0.33, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 0.9]} material={mats.fabric}>
            <torusGeometry args={[0.5, 0.165, 40, 96]} />
          </mesh>
          {/* acoustic mesh visible through the pad opening */}
          <mesh position={[0, -0.24, 0]} material={mats.fabric}>
            <cylinderGeometry args={[0.36, 0.36, 0.02, 64]} />
          </mesh>
        </group>
      </group>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Headphone                                                           */
/* ------------------------------------------------------------------ */

export function Headphone({
  rig,
  finish,
  anchors,
}: {
  rig: RefObject<HeadphoneDrive>
  finish: Finish
  anchors: RefObject<PartAnchors>
}) {
  const geo = useGeometry()
  const mats = useMaterials()
  const target = useMemo(
    () => ({ shell: new THREE.Color(), metal: new THREE.Color() }),
    [],
  )

  useFrame((_, dt) => {
    // Ease finish colours so switching feels like the light changing, not a swap.
    target.shell.set(finish.shell)
    target.metal.set(finish.metal)
    const k = 1 - Math.exp(-6 * dt)
    mats.shell.color.lerp(target.shell, k)
    mats.band.color.lerp(target.shell, k)
    mats.metal.color.lerp(target.metal, k)
    mats.light.emissiveIntensity = damp(mats.light.emissiveIntensity, 0.35 + (rig.current?.glow ?? 1) * 1.1, 6, dt)
  })

  // The yoke + slider belong to the chassis, so they travel with it in the exploded view.
  const yokes = useRef<(THREE.Group | null)[]>([])
  useFrame(() => {
    const x = CUP_X + (rig.current?.explode ?? 0) * PART_TRAVEL.shell
    yokes.current.forEach((g) => g && (g.position.x = x))
  })

  const side = (mirror: boolean) => (
    <group scale={[mirror ? -1 : 1, 1, 1]}>
      <Cup rig={rig} mats={mats} geo={geo} anchors={mirror ? undefined : anchors} />
      {/* yoke arc + pivots */}
      <group ref={(g) => { yokes.current[mirror ? 1 : 0] = g }} position={[CUP_X, 0, 0]}>
        <mesh geometry={geo.yoke} material={mats.metal} />
        {[-1, 1].map((s) => (
          <mesh key={s} position={[0, 0, s * 0.575]} rotation={[Math.PI / 2, 0, 0]} material={mats.metal}>
            <cylinderGeometry args={[0.075, 0.075, 0.1, 32]} />
          </mesh>
        ))}
        {/* slider joining yoke and band */}
        <mesh position={[0, 0.9, 0]} scale={[1, 1, 3.4]} material={mats.metal}>
          <capsuleGeometry args={[0.056, 0.2, 8, 24]} />
        </mesh>
      </group>
    </group>
  )

  return (
    <group>
      <mesh geometry={geo.band} material={mats.band} scale={[1, 1, 3.4]} />
      <mesh geometry={geo.bandPad} material={mats.leather} scale={[1, 1, 2.3]} />
      {side(false)}
      {side(true)}
    </group>
  )
}
