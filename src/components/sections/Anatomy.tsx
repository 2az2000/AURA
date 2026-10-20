import { useRef } from 'react'
import { motion, useReducedMotion, useScroll } from 'motion/react'
import { anatomy } from '../../content/copy'
import { SheetMarks } from '../../graphics/SheetMarks'
import { DrawRule } from '../../motion/Reveal'
import { MaskedText } from '../../motion/MaskedText'
import { story, useActiveShot } from '../../story/store'
import { SectionHead } from '../ui/SectionHead'

/**
 * 02 — Anatomy: the one pinned sequence.
 *
 * The section is tall; a sticky 100svh panel stays on screen while the page scrolls
 * through five invisible "steps" (overview + one per layer). Each step is a storyboard shot:
 * scrolling scrubs the cup apart, then the camera travels along the exploded stack, centring
 * each part in turn. The page never hijacks scroll — it is ordinary scrolling, just longer —
 * and every row is also a button that jumps to its step. Total pinned length: ~4 screens.
 */
const STEP_VH = 80

export function Anatomy() {
  const reduce = useReducedMotion()
  const activeShot = useActiveShot()
  const wrapper = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: wrapper, offset: ['start start', 'end end'] })
  const activeKey = activeShot.startsWith('anatomy-') ? activeShot.slice('anatomy-'.length) : null
  const steps = ['anatomy', ...anatomy.parts.map((p) => `anatomy-${p.key}`)]

  const goTo = (id: string) => {
    const y = story.scrollTargetFor(id)
    if (y !== null) window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' })
  }
  const current = anatomy.parts.find((p) => p.key === activeKey)

  return (
    <section id="anatomy" aria-labelledby="anatomy-title" className="relative">
      <div ref={wrapper} className="relative" style={{ height: `${steps.length * STEP_VH + 20}svh` }}>
        <div className="scrim sticky top-0 h-svh">
          <SheetMarks sheet={3} title="Anatomy" />
          <div className="layer-fg wrap grid h-full grid-cols-12 content-between py-[12svh] portrait:py-[10svh]">
            {/* heading */}
            <div className="col-span-12 md:col-span-5">
              <SectionHead index={anatomy.index} label={anatomy.label} />
              <MaskedText
                id="anatomy-title"
                lines={anatomy.title}
                className="display mt-6 text-[length:var(--text-h2)] portrait:text-4xl"
              />
            </div>

            {/* part list — desktop: ruled list with the active part expanded */}
            <div className="col-span-12 portrait:hidden md:col-span-4 md:col-start-1 md:row-start-2 md:self-end">
              <div className="relative pl-6">
                {/* scroll-progress rail */}
                <span aria-hidden="true" className="absolute bottom-0 left-0 top-0 w-px bg-silver/15" />
                <motion.span
                  aria-hidden="true"
                  className="absolute bottom-0 left-0 top-0 w-px origin-top bg-ice"
                  style={{ scaleY: scrollYProgress }}
                />
                <ol>
                  <li>
                    <button
                      type="button"
                      onClick={() => goTo('anatomy')}
                      aria-current={activeKey === null ? 'step' : undefined}
                      className={`label w-full py-3 text-left transition-colors duration-300 hover:text-bone ${activeKey === null ? 'text-bone!' : ''}`}
                    >
                      {anatomy.overview}
                    </button>
                  </li>
                  {anatomy.parts.map((p) => {
                    const on = p.key === activeKey
                    return (
                      <li key={p.key} className="relative">
                        <DrawRule />
                        <button
                          type="button"
                          onClick={() => goTo(`anatomy-${p.key}`)}
                          aria-current={on ? 'step' : undefined}
                          className="group w-full py-3.5 text-left"
                        >
                          <span className="label flex justify-between">
                            <span className={`transition-colors duration-300 ${on ? 'text-ice' : ''}`}>{p.n}</span>
                            <span className={`transition-colors duration-300 ${on ? 'text-bone' : 'group-hover:text-silver'}`}>
                              {p.name}
                            </span>
                          </span>
                          <span
                            className="grid transition-[grid-template-rows,opacity] duration-500 ease-[var(--ease-out-expo)]"
                            style={{ gridTemplateRows: on ? '1fr' : '0fr', opacity: on ? 1 : 0 }}
                          >
                            <span className="overflow-hidden">
                              <span className="block max-w-[30ch] pt-3 text-[0.9375rem] leading-relaxed text-silver">{p.text}</span>
                            </span>
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ol>
              </div>
            </div>

            {/* part list — mobile: numbered stepper + the active description */}
            <div className="col-span-12 md:hidden">
              <ol className="flex gap-2">
                {anatomy.parts.map((p) => {
                  const on = p.key === activeKey
                  return (
                    <li key={p.key} className="flex-1">
                      <button
                        type="button"
                        onClick={() => goTo(`anatomy-${p.key}`)}
                        aria-label={p.name}
                        aria-current={on ? 'step' : undefined}
                        className={`label w-full border-t py-3 text-left transition-colors duration-300 ${on ? 'border-ice text-ice' : 'border-silver/20'}`}
                      >
                        {p.n}
                      </button>
                    </li>
                  )
                })}
              </ol>
              <div className="min-h-[5.5rem] pt-3" aria-live="polite">
                {current ? (
                  <>
                    <p className="label text-bone">{current.name}</p>
                    <p className="mt-2 text-sm text-silver">{current.text}</p>
                  </>
                ) : (
                  <p className="text-sm text-mist">{anatomy.intro}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* The steps: invisible, evenly spaced, each one a storyboard shot. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex flex-col">
          {steps.map((id) => (
            <div key={id} data-shot={id} className="flex-1" />
          ))}
        </div>
      </div>
    </section>
  )
}
