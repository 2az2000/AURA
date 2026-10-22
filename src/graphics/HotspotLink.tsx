import { useEffect, useRef } from 'react'
import type { SceneBridge } from '../story/hotspots'
import type { HotspotId } from '../story/storyboard'

/** Which list row (`data-row`) explains each hotspot. Hotspots without a row get no connector. */
export const ROW_FOR: Partial<Record<HotspotId, string>> = {
  face: 'face',
  cover: 'cover',
  light: 'light',
  dial: 'dial',
  button: 'dial',
}

/**
 * An SVG connector that draws itself from the active hotspot on the 3D model to its row of text
 * (an elbow line ending in a dot). It follows both ends every frame while active, so it stays
 * attached while the product moves or the page scrolls. Desktop only — on phones the label itself
 * carries the explanation.
 */
export function HotspotLink({ bridge, active }: { bridge: SceneBridge; active: HotspotId | null }) {
  const path = useRef<SVGPathElement>(null)
  const dot = useRef<SVGCircleElement>(null)
  const svg = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const rowId = active ? ROW_FOR[active] ?? active : undefined
    const el = active ? bridge.hotspots[active] : null
    // an open hero card wins over rows further down the page that share an id
    const row = rowId
      ? document.querySelector<HTMLElement>(`[data-explore] [data-row="${rowId}"]`) ?? document.querySelector<HTMLElement>(`[data-row="${rowId}"]`)
      : null
    const wide = window.matchMedia('(min-width: 768px)').matches
    if (!svg.current || !path.current || !dot.current) return
    if (!active || !el || !row || !wide) {
      svg.current.style.opacity = '0'
      return
    }
    svg.current.style.opacity = '1'
    let raf = 0
    const tick = () => {
      if (el.dataset.on !== 'true') {
        svg.current!.style.opacity = '0'
        raf = requestAnimationFrame(tick)
        return
      }
      svg.current!.style.opacity = '1'
      const a = el.getBoundingClientRect()
      const r = row.getBoundingClientRect()
      const x1 = a.left
      const y1 = a.top
      if (x1 >= r.left && x1 <= r.right && y1 < r.top) {
        // the row is directly below the hotspot: drop straight onto its top edge
        const y2 = r.top - 6
        path.current!.setAttribute('d', `M${x1.toFixed(1)} ${y1.toFixed(1)}V${y2.toFixed(1)}`)
        dot.current!.setAttribute('cx', x1.toFixed(1))
        dot.current!.setAttribute('cy', y2.toFixed(1))
        raf = requestAnimationFrame(tick)
        return
      }
      const leftOfRow = x1 < r.left
      const x2 = leftOfRow ? r.left - 10 : r.right + 10
      const y2 = r.top + Math.min(r.height / 2, 22)
      const xm = leftOfRow ? Math.max(x1 + 40, (x1 + x2) / 2) : Math.min(x1 - 40, (x1 + x2) / 2)
      path.current!.setAttribute('d', `M${x1.toFixed(1)} ${y1.toFixed(1)}H${xm.toFixed(1)}V${y2.toFixed(1)}H${x2.toFixed(1)}`)
      dot.current!.setAttribute('cx', x2.toFixed(1))
      dot.current!.setAttribute('cy', y2.toFixed(1))
      raf = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [active, bridge])

  return (
    <svg
      ref={svg}
      key={active ?? 'none'}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 h-full w-full opacity-0 transition-opacity duration-300"
    >
      <path ref={path} className="hs-connector" fill="none" stroke="rgb(131 184 255 / 0.8)" strokeWidth="1" pathLength="1" />
      <circle ref={dot} r="3" fill="rgb(131 184 255)" />
    </svg>
  )
}
