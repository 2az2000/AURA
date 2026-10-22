import { useEffect, useRef, type KeyboardEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { hotspotCopy } from '../content/copy'
import { exploreCopy } from '../content/play'
import { ROW_FOR } from '../graphics/HotspotLink'
import { duration, ease } from '../motion/tokens'
import { play, usePlay, type ExplorePart } from '../play/store'
import { explorePose } from '../story/explorePoses'
import { story, useActiveShot } from '../story/store'
import type { HotspotId } from '../story/storyboard'

const NAME: Partial<Record<ExplorePart, string>> = { dial: 'Dial and button' }
const TEXT: Partial<Record<ExplorePart, string>> = {
  dial: `${hotspotCopy.dial.text} ${hotspotCopy.button.text}`,
}

/**
 * Hero "inspect a part". Choosing a marker on the headphone (or a name here) flies the camera to that part
 * (story.hold), lights it, draws a connector from the marker to this card and explains it with the project's
 * own hotspot copy. Escape, the close button, or scrolling away returns to the full view.
 * The camera, the card, the marker and the lighting all follow one piece of state, so they cannot disagree.
 */
export function HeroExplore({ onHotspot }: { onHotspot: (id: HotspotId | null) => void }) {
  const part = usePlay((s) => s.explore)
  const here = useActiveShot() === 'hero'
  const reduce = useReducedMotion()
  const card = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!part) return
    if (!here) {
      play.closePart()
      return
    }
    const tall = window.innerHeight > window.innerWidth * 1.05
    story.hold('hero', explorePose(part, tall))
    onHotspot(part)
    return () => {
      story.hold('hero', null)
      onHotspot(null)
    }
  }, [part, here, onHotspot])

  // bring keyboard focus into the card when it opens
  const wasOpen = useRef(false)
  useEffect(() => {
    if (part && !wasOpen.current) card.current?.focus({ preventScroll: true })
    wasOpen.current = !!part
  }, [part])

  const parts = exploreCopy.parts
  const i = part ? parts.indexOf(part) : -1
  const go = (n: number) => play.openPart(parts[(n + parts.length) % parts.length])

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') play.closePart()
    else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') go(i + 1)
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') go(i - 1)
    else return
    e.preventDefault()
    e.stopPropagation()
  }

  if (!part) return null
  const c = hotspotCopy[part as HotspotId]
  return (
    <div
      ref={card}
      role="region"
      aria-label={exploreCopy.label}
      tabIndex={-1}
      style={{ outline: 'none' }}
      data-explore
      onKeyDown={onKey}
      className="fixed inset-x-0 bottom-0 z-[5] bg-gradient-to-t from-obsidian via-obsidian/90 to-transparent px-[var(--gutter)] pb-[4.75rem] pt-14 outline-none focus-visible:outline-none md:inset-x-auto md:bottom-auto md:left-[var(--gutter)] md:top-1/2 md:w-[min(25rem,34vw)] md:-translate-y-1/2 md:bg-none md:p-0"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="label flex items-center gap-3">
          <span className="text-ice">{String(i + 1).padStart(2, '0')}</span>
          <span aria-hidden="true" className="h-px w-6 bg-silver/35" />
          <span>{exploreCopy.label}</span>
        </p>
        <button type="button" className="tool" aria-label={exploreCopy.close} onClick={() => play.closePart()}>
          <span aria-hidden="true">×</span>
          {exploreCopy.closeShort}
        </button>
      </div>

      <div data-row={ROW_FOR[part as HotspotId] ?? part} className="mt-5 border-l border-ice/50 pl-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={part}
            aria-live="polite"
            initial={reduce ? false : { clipPath: 'inset(0 0 100% 0)', y: 12 }}
            animate={{ clipPath: 'inset(0 0 -8% 0)', y: 0 }}
            exit={reduce ? undefined : { opacity: 0, transition: { duration: duration.quick } }}
            transition={{ duration: duration.slow * 0.7, ease: ease.out }}
          >
            <h2 className="display text-4xl leading-none md:text-5xl">{NAME[part] ?? c.name}</h2>
            <p className="mt-4 max-w-[36ch] text-silver">{TEXT[part] ?? c.text}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <button type="button" className="tool" aria-label={exploreCopy.prev} onClick={() => go(i - 1)}>
          ←
        </button>
        <button type="button" className="tool" aria-label={exploreCopy.next} onClick={() => go(i + 1)}>
          →
        </button>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 pl-2">
          {parts.map((p, n) => (
            <li key={p}>
              <button
                type="button"
                aria-current={p === part}
                onClick={() => play.openPart(p)}
                className={`label py-2 transition-colors duration-300 ${p === part ? 'text-ice!' : 'hover:text-bone'}`}
              >
                {String(n + 1).padStart(2, '0')}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
