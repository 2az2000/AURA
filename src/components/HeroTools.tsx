import { motion } from 'motion/react'
import { tools } from '../content/play'
import { useIntroSegment } from '../motion/intro'
import { play, usePlay } from '../play/store'

/**
 * The hero's controls for the light and the view, under the product. Three plain controls, no panel:
 *  - Light sweep: a single cinematic pass of light across the object (one-shot, returns by itself)
 *  - Lighting: Studio / Night / Signal, three atmospheres for the object and the background together
 *  - Reset view: only present while the visitor has turned the product
 * Everything is a button with a text label; none of it depends on hover or on dragging.
 */
export function HeroTools() {
  const mode = usePlay((s) => s.mode)
  const turned = usePlay((s) => s.turned)
  const exploring = usePlay((s) => !!s.explore)
  const arrive = useIntroSegment(2.3, 2.9)

  return (
    <motion.div
      role="group"
      aria-label={tools.label}
      data-needs-gl
      inert={exploring}
      style={{ opacity: arrive }}
      className={`layer-fg wrap pointer-events-none absolute inset-x-0 top-[calc(9svh+52svh+1.5rem)] flex flex-wrap items-center justify-center gap-2 transition-opacity duration-500 portrait:top-[52svh] ${exploring ? 'opacity-0!' : ''}`}
    >
      <button type="button" className="tool pointer-events-auto" title={tools.sweepTitle} onClick={() => play.sweep()}>
        <span aria-hidden="true">◐</span>
        {tools.sweep}
      </button>

      <div role="group" aria-label={tools.modeLabel} className="pointer-events-auto flex">
        {tools.modes.map((m) => (
          <button
            key={m.id}
            type="button"
            aria-pressed={mode === m.id}
            onClick={() => play.setMode(m.id)}
            className="tool -ml-px first:ml-0"
          >
            {m.name}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => play.resetView()}
        tabIndex={turned ? 0 : -1}
        aria-hidden={!turned}
        className={`tool pointer-events-auto transition-opacity ${turned ? 'opacity-100' : 'pointer-events-none! opacity-0'}`}
      >
        <span aria-hidden="true">↺</span>
        {tools.reset}
      </button>
    </motion.div>
  )
}
