import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { DISCOVERIES, playCopy } from '../content/play'
import { useIntroSegment } from '../motion/intro'
import { duration, ease } from '../motion/tokens'
import { play, usePlay } from '../play/store'

const N = DISCOVERIES.length
const R = 11
const C = 2 * Math.PI * R

/**
 * Quiet progress for the optional discoveries: a small ring of N segments and a count, bottom centre.
 * A segment lights when its discovery is found; a short line names it; the list opens on demand and shows
 * what is left to find (as hints) and what each found one does. Completing all of them plays a restrained
 * finale (the lights drop to one ring while the product turns once). Nothing here is required to use the page.
 */
export function DiscoveryHud() {
  const found = usePlay((s) => s.found)
  const toast = usePlay((s) => s.toast)
  const complete = usePlay((s) => s.complete)
  const finale = usePlay((s) => s.finale)
  const reduce = useReducedMotion()
  const [open, setOpen] = useState(false)
  const arrive = useIntroSegment(2.5, 3.0)
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    const onDown = (e: PointerEvent) => !box.current?.contains(e.target as Node) && setOpen(false)
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onDown)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onDown)
    }
  }, [open])

  const latest = toast ? DISCOVERIES.find((d) => d.id === toast) : null
  const seg = C / N

  return (
    <motion.div ref={box} style={{ opacity: arrive }} className="fixed inset-x-0 bottom-3 z-[45] flex flex-col items-center gap-2 px-4 portrait:bottom-3">
      <AnimatePresence>
        {finale && (
          <motion.p
            key="finale"
            role="status"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: duration.slow } }}
            transition={{ duration: duration.cinematic, ease: ease.out }}
            className="pointer-events-none fixed inset-x-0 top-[18svh] text-center"
          >
            <span className="display block text-[length:var(--text-h2)]">Everything found.</span>
            <span className="serif mt-2 block text-[length:var(--text-tag)] text-ice">The rest is quiet.</span>
          </motion.p>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            id="details-panel"
            role="region"
            aria-label={playCopy.panelTitle}
            initial={reduce ? false : { opacity: 0, y: 12, clipPath: 'inset(100% 0 0 0)' }}
            animate={{ opacity: 1, y: 0, clipPath: 'inset(0% 0 0 0)' }}
            exit={reduce ? undefined : { opacity: 0, y: 8, transition: { duration: duration.quick } }}
            transition={{ duration: duration.base, ease: ease.out }}
            className="w-[min(26rem,100%)] max-h-[60svh] overflow-y-auto border border-silver/20 bg-obsidian/95 p-5"
          >
            <p className="label flex items-baseline justify-between">
              <span>{playCopy.panelTitle}</span>
              <span className="text-ice">
                {found.length} / {N}
              </span>
            </p>
            <ul className="mt-3">
              {DISCOVERIES.map((d) => {
                const on = found.includes(d.id)
                return (
                  <li key={d.id} className="border-t border-silver/10 py-2.5">
                    <p className="flex items-baseline gap-3">
                      <span aria-hidden="true" className={`size-1.5 shrink-0 rounded-full ${on ? 'bg-ice' : 'border border-silver/40'}`} />
                      <span className={`text-[0.9375rem] ${on ? 'text-bone' : 'text-silver'}`}>{d.name}</span>
                      {on && <span className="sr-only">{playCopy.found}</span>}
                    </p>
                    <p className="mt-1 pl-[1.125rem] text-[0.8125rem] leading-snug text-mist">{on ? d.done : d.hint}</p>
                  </li>
                )
              })}
            </ul>
            <div className="mt-3 flex flex-wrap gap-2">
              {complete && (
                <button type="button" className="tool" onClick={() => (play.celebrate(), setOpen(false))}>
                  {playCopy.replay}
                </button>
              )}
              {found.length > 0 && (
                <button type="button" className="tool" onClick={() => play.resetProgress()}>
                  {playCopy.reset}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative flex items-center">
        <AnimatePresence>
          {latest && !open && (
            <motion.p
              key={latest.id}
              role="status"
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: duration.quick } }}
              transition={{ duration: duration.base, ease: ease.out }}
              className="label absolute bottom-full mb-3 whitespace-nowrap border border-ice/40 bg-obsidian/90 px-3 py-2 text-bone"
            >
              <span className="text-ice">{playCopy.foundToast}</span>&nbsp;&nbsp;{latest.name}
            </motion.p>
          )}
        </AnimatePresence>

        <button
          type="button"
          aria-expanded={open}
          aria-controls="details-panel"
          onClick={() => setOpen((o) => !o)}
          className="group flex min-h-11 items-center gap-3 border border-silver/20 bg-obsidian/70 px-4 text-silver transition-colors duration-300 hover:border-ice/60 hover:text-bone"
        >
          <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true" className="-rotate-90">
            {DISCOVERIES.map((d, i) => (
              <motion.circle
                key={d.id}
                cx="14"
                cy="14"
                r={R}
                fill="none"
                strokeWidth="2"
                strokeLinecap="butt"
                strokeDasharray={`${seg - 2.2} ${C - seg + 2.2}`}
                strokeDashoffset={-i * seg}
                initial={false}
                animate={{ stroke: found.includes(d.id) ? 'rgb(131 184 255)' : 'rgb(191 200 213 / 0.25)' }}
                transition={{ duration: reduce ? 0 : duration.base }}
              />
            ))}
          </svg>
          <span className="label text-inherit">
            {playCopy.hudLabel}{' '}
            <span className="text-ice">
              {found.length}/{N}
            </span>
          </span>
        </button>
      </div>
    </motion.div>
  )
}
