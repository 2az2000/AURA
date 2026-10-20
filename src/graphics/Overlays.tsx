import type { SceneBridge } from '../story/hotspots'

const RINGS = [0, 1, 2, 3, 4, 5]

/**
 * Two overlays the 3D rig positions every frame (z4, pointer-events none):
 *  - the dimensioned AXIS drawn through the exploded cup (anatomy)
 *  - SOUND RINGS expanding from the cup face (acoustics) — concentric rings that grow and fade,
 *    each a compositor-only CSS animation, staggered. They are an illustration of propagation,
 *    not data.
 */
export function Overlays({ bridge }: { bridge: SceneBridge }) {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[4] overflow-hidden">
      {/* axis: a 1000 px line the Rig scales/rotates to span the cup */}
      <div
        ref={(el) => {
          bridge.axis = el
        }}
        className="absolute left-0 top-0 origin-left opacity-0 will-change-transform"
        style={{ width: 1000, height: 1 }}
      >
        <span
          className="absolute inset-0"
          style={{ background: 'repeating-linear-gradient(90deg, rgb(131 184 255 / 0.55) 0 14px, transparent 14px 22px)' }}
        />
        <span className="absolute -top-2 left-0 h-5 w-px bg-ice/70" />
        <span className="absolute -top-2 right-0 h-5 w-px bg-ice/70" />
      </div>

      {/* rings */}
      <div
        ref={(el) => {
          bridge.rings = el
        }}
        className="absolute left-1/2 top-1/2 opacity-0 will-change-transform"
      >
        <div className="relative" style={{ width: 0, height: 0 }}>
          {RINGS.map((i) => (
            <span
              key={i}
              className="sound-ring absolute rounded-full border border-ice/60"
              style={
                {
                  width: 520,
                  height: 520,
                  left: -260,
                  top: -260,
                  animationDelay: `${i * 0.9}s`,
                  '--i': i,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      </div>
    </div>
  )
}
