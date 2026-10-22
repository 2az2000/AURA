import { useEffect } from 'react'
import { anatomy, hotspotCopy } from '../content/copy'
import { HOTSPOT_IDS, type SceneBridge } from '../story/hotspots'
import { HotspotLink } from '../graphics/HotspotLink'
import { play, usePlay } from '../play/store'
import { partOf } from '../story/explorePoses'
import { story, useActiveShot } from '../story/store'
import type { HotspotId } from '../story/storyboard'

const ANATOMY_IDS: HotspotId[] = ['plate', 'shell', 'driver', 'pad']

/**
 * Interactive markers pinned to points on the 3D model.
 *
 * The Rig projects each anchor to screen space every frame and writes `transform`,
 * `opacity`, `pointer-events`, `inert` and `data-on` straight onto these elements — React
 * only renders them once. A hotspot is only interactive (and only in the tab order) while
 * it is visible: hidden ones are `inert`.
 *
 * Behaviour
 *  - Anatomy labels: activating one scrolls to that part's step of the pinned sequence.
 *  - Other hotspots: toggle a short description next to the marker. Hovering or focusing the
 *    matching row in the page copy highlights the same hotspot (state lives in App).
 *  - Esc closes the open description.
 */
export function Hotspots({
  bridge,
  active,
  onActive,
  reduced,
}: {
  bridge: SceneBridge
  active: HotspotId | null
  onActive: (id: HotspotId | null) => void
  reduced: boolean
}) {
  const shot = useActiveShot()
  const exploring = usePlay((s) => !!s.explore)
  const compact = shot === 'hero' || exploring
  const current = shot.startsWith('anatomy-') ? shot.slice('anatomy-'.length) : null
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onActive(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onActive])

  const activate = (id: HotspotId) => {
    // on the title sheet (or while a part is open) a marker flies the camera to its part
    const part = shot === 'hero' || exploring ? partOf(id) : null
    if (part) {
      play.openPart(part)
      return
    }
    if (ANATOMY_IDS.includes(id)) {
      const y = story.scrollTargetFor(`anatomy-${id}`)
      if (y !== null) window.scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' })
      return
    }
    onActive(active === id ? null : id)
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[4]">
      <HotspotLink bridge={bridge} active={active} />
      {HOTSPOT_IDS.map((id) => {
        const c = hotspotCopy[id]
        const part = anatomy.parts.find((p) => p.key === id)
        const left = c.side === 'l'
        const lift = c.lift ?? 0
        const h = 36 + lift
        const open = active === id && !ANATOMY_IDS.includes(id)
        return (
          <div
            key={id}
            data-hotspot={id}
            data-on="false"
            data-current={current === id}
            data-compact={compact}
            ref={(el) => {
              bridge.hotspots[id] = el
            }}
            // `inert` keeps hidden hotspots out of the tab order and away from assistive tech.
            inert
            className="absolute left-0 top-0 opacity-0 will-change-transform"
          >
            <button
              type="button"
              aria-pressed={ANATOMY_IDS.includes(id) ? undefined : open}
              aria-label={ANATOMY_IDS.includes(id) ? `${c.name}: go to this layer` : c.name}
              onClick={() => activate(id)}
              onPointerEnter={(e) => e.pointerType === 'mouse' && !ANATOMY_IDS.includes(id) && onActive(id)}
              onPointerLeave={(e) => e.pointerType === 'mouse' && !ANATOMY_IDS.includes(id) && onActive(null)}
              className="absolute -left-4 -top-4 grid size-8 place-items-center"
            >
              <span className="hs-pulse absolute size-2.5 rounded-full border border-ice" aria-hidden="true" />
              <span className="hs-ring absolute size-5 rounded-full border border-silver/60" aria-hidden="true" />
              <span className="relative block size-1.5 rounded-full bg-bone" aria-hidden="true" />
            </button>

            {/* leader line (draws itself in) + label */}
            <svg
              aria-hidden="true"
              className="hs-line pointer-events-none absolute overflow-visible"
              style={{ left: left ? -44 : 8, top: -(h + 8), width: 36, height: h, transform: left ? 'scaleX(-1)' : undefined }}
              viewBox={`0 0 36 ${h}`}
              fill="none"
            >
              <path d={`M0 ${h} L28 8 H36`} pathLength="1" stroke="rgb(191 200 213 / 0.55)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            </svg>
            <div
              style={{ top: -(h + 18) }}
              className={`hs-label absolute ${left ? 'right-[40px]' : 'left-[48px]'} w-max max-w-[15rem] ${left ? 'text-right' : ''}`}
            >
              <p className="label whitespace-nowrap text-bone">
                {part && <span className="text-ice">{part.n}&nbsp;&nbsp;</span>}
                {c.name}
              </p>
              <div className="hs-text" data-open={open}>
                <p className="overflow-hidden pt-2 text-[0.8125rem] leading-snug text-silver">{c.text}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
