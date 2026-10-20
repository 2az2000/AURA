import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { inspect } from '../../content/product'
import { DriverDiagram } from '../../graphics/DriverDiagram'
import { SheetMarks } from '../../graphics/SheetMarks'
import { MaskedText } from '../../motion/MaskedText'
import { DrawRule } from '../../motion/Reveal'
import { duration, ease, spring } from '../../motion/tokens'
import { story, useActiveShot } from '../../story/store'
import type { HotspotId } from '../../story/storyboard'
import { inspectPose } from '../productStory'

/**
 * Scene 04 — Inside the experience: the INSPECTOR.
 * A list of components (a real ARIA tablist: arrow keys, Home/End, roving tabindex). Choosing one
 * flies the 3D camera to that component (the story store's `hold()`), shows its hotspots on the model,
 * and draws a connector line from the hotspot to the description. This is click-driven, so unlike the
 * rest of the page it is independent of scroll position. The driver gets a cross-section illustration.
 */
export function Inspect({ onHotspot }: { onHotspot: (id: HotspotId | null) => void }) {
  const reduce = useReducedMotion()
  const [sel, setSel] = useState(0)
  const items = inspect.items
  const item = items[sel]
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  // Fly the camera to the selected component — but only while this scene is the active one, so the
  // hotspots and connector never appear over other scenes. Everything is released on leaving.
  const here = useActiveShot() === 'p-inspect'
  useEffect(() => {
    if (!here) {
      story.hold('p-inspect', null)
      onHotspot(null)
      return
    }
    const tall = window.innerHeight > window.innerWidth * 1.05
    story.hold('p-inspect', inspectPose(item.key, item.hotspots, tall))
    onHotspot(item.primary)
    return () => story.hold('p-inspect', null)
  }, [item, here, onHotspot])
  useEffect(() => () => onHotspot(null), [onHotspot])

  const onKey = (e: KeyboardEvent) => {
    const k = e.key
    let next = sel
    if (k === 'ArrowDown' || k === 'ArrowRight') next = (sel + 1) % items.length
    else if (k === 'ArrowUp' || k === 'ArrowLeft') next = (sel - 1 + items.length) % items.length
    else if (k === 'Home') next = 0
    else if (k === 'End') next = items.length - 1
    else return
    e.preventDefault()
    setSel(next)
    refs.current[next]?.focus()
  }

  return (
    <section id="scene-inspect" data-shot="p-inspect" aria-labelledby="inspect-title" className="scrim relative flex min-h-[115svh] items-center py-[10svh] portrait:min-h-[120svh] portrait:items-end portrait:pb-[4.5rem] portrait:pt-[52svh]">
      <SheetMarks sheet={3} title="Inside" block={{ left: 'AURA · Discover · Scene 04 / 05', right: 'Inside · Rev A' }} />
      <div className="layer-fg wrap grid grid-cols-12 gap-x-8 gap-y-8">
        <div className="col-span-12 md:col-span-5">
          <p className="label flex items-center gap-4">
            <span className="text-ice">04</span>
            <DrawRule className="w-10 bg-silver/35!" />
            <span>{inspect.label}</span>
          </p>
          <MaskedText id="inspect-title" lines={inspect.title} className="display mt-6 text-[length:var(--text-h2)]" />
          <p className="mt-5 max-w-[36ch] text-mist">{inspect.body}</p>
        </div>

        {/* component list */}
        <div className="col-span-12 md:col-span-3 md:row-span-2 md:row-start-2 md:self-start portrait:col-span-12 portrait:row-span-1 portrait:row-start-auto">
          <p className="label mb-3" id="inspect-list-label">
            {inspect.listLabel}
          </p>
          <div role="tablist" aria-labelledby="inspect-list-label" aria-orientation="vertical" onKeyDown={onKey} className="relative portrait:grid portrait:grid-cols-2 portrait:gap-x-6">
            {items.map((it, i) => {
              const on = i === sel
              return (
                <div key={it.key} className="relative">
                  <DrawRule />
                  <button
                    ref={(el) => {
                      refs.current[i] = el
                    }}
                    role="tab"
                    id={`inspect-tab-${it.key}`}
                    aria-selected={on}
                    aria-controls="inspect-panel"
                    tabIndex={on ? 0 : -1}
                    type="button"
                    onClick={() => setSel(i)}
                    className="group relative flex w-full items-baseline gap-4 py-3 text-left"
                  >
                    {on && (
                      <motion.span
                        layoutId="inspect-indicator"
                        transition={reduce ? { duration: 0 } : spring.ui}
                        className="absolute inset-y-0 -left-4 w-px bg-ice"
                        aria-hidden="true"
                      />
                    )}
                    <span className={`label transition-colors duration-300 ${on ? 'text-ice!' : ''}`}>{it.n}</span>
                    <span className={`text-[0.9375rem] transition-colors duration-300 ${on ? 'text-bone' : 'text-silver group-hover:text-bone'}`}>{it.name}</span>
                  </button>
                </div>
              )
            })}
            <DrawRule />
          </div>
        </div>

        {/* description panel (the connector line ends here: data-row = the hotspot id) */}
        <div className="col-span-12 md:col-span-6 md:col-start-6 md:row-start-3 md:mt-[34svh] portrait:col-span-12 portrait:col-start-1 portrait:row-start-auto portrait:mt-0">
          <div id="inspect-panel" role="tabpanel" aria-labelledby={`inspect-tab-${item.key}`} data-row={item.primary} tabIndex={0} className="border-l border-ice/50 pl-6 focus-visible:outline-offset-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={item.key}
                initial={reduce ? false : { clipPath: 'inset(0 0 100% 0)', y: 14 }}
                animate={{ clipPath: 'inset(0 0 -8% 0)', y: 0 }}
                exit={reduce ? undefined : { opacity: 0, transition: { duration: duration.quick } }}
                transition={{ duration: duration.slow * 0.7, ease: ease.out }}
              >
                <p className="label">
                  <span className="text-ice">{item.n}</span>&nbsp;&nbsp;Component
                </p>
                <h3 className="display mt-3 text-4xl leading-none">{item.name}</h3>
                <p className="mt-4 max-w-[44ch] text-silver">{item.text}</p>
                {item.key === 'driver' && <DriverDiagram className="mt-6 max-w-[28rem]" />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
