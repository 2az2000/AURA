import { materials, type Finish } from '../../content/copy'
import { MaterialStudies } from '../../graphics/MaterialStudies'
import { SheetMarks } from '../../graphics/SheetMarks'
import { DrawRule, ClipReveal } from '../../motion/Reveal'
import { MaskedText } from '../../motion/MaskedText'
import type { HotspotId } from '../../story/storyboard'
import { DragZone } from '../ui/DragZone'
import { SectionHead } from '../ui/SectionHead'
import { SectionNumeral } from '../ui/SectionNumeral'

/**
 * Sheet 04 — Materials. Lead world: the SPECIMEN.
 *  A. The macro shot on the face plate, a live finish switcher, and notes wired to hotspots.
 *  B. A triptych of real material panels (MaterialStudies) lit by a moving light; the product
 *     steps aside to a small reference in the corner.
 */
export function Materials({
  finish,
  onFinish,
  hotspot,
  onHotspot,
}: {
  finish: Finish
  onFinish: (f: Finish) => void
  hotspot: HotspotId | null
  onHotspot: (id: HotspotId | null) => void
}) {
  return (
    <section id="materials" aria-labelledby="materials-title" className="relative">
      <SheetMarks sheet={4} title="Materials" />

      <div
        data-shot="materials"
        className="scrim relative flex min-h-svh items-center py-[14svh] portrait:items-end portrait:pt-[56svh]"
      >
        <SectionNumeral n="04" className="-left-[3vw] bottom-[4svh]" />
        <DragZone className="right-0 top-[6svh] h-[48svh] w-[46vw] portrait:hidden" />
        <div className="layer-fg wrap grid grid-cols-12 gap-y-12">
          <div className="col-span-12 md:col-span-6">
            <SectionHead index={materials.index} label={materials.label} />
            <MaskedText
              id="materials-title"
              lines={materials.title}
              className="display mt-8 text-[length:var(--text-h2)]"
            />
            <ClipReveal delay={0.15}>
              <p className="mt-8 max-w-[34ch] text-mist">{materials.body}</p>
            </ClipReveal>

            {/* Finish switcher: a real radio group, styled as a typographic list. */}
            <fieldset className="mt-10">
              <legend className="label mb-4">Finish</legend>
              <div className="flex flex-col">
                <DrawRule />
                {materials.finishes.map((f) => {
                  const active = f.id === finish.id
                  return (
                    <div key={f.id}>
                      <label className="group flex cursor-pointer items-center gap-5 py-4 has-[:focus-visible]:outline has-[:focus-visible]:outline-1 has-[:focus-visible]:outline-offset-4 has-[:focus-visible]:outline-ice">
                        <input
                          type="radio"
                          name="finish"
                          value={f.id}
                          checked={active}
                          onChange={() => onFinish(f)}
                          className="sr-only"
                        />
                        <span
                          aria-hidden="true"
                          className="relative block size-5 rounded-full border border-silver/30"
                          style={{ background: `radial-gradient(circle at 35% 30%, ${f.metal}, ${f.shell})` }}
                        >
                          <span
                            className={`absolute -inset-1.5 rounded-full border border-ice transition-[opacity,transform] duration-500 ease-[var(--ease-out-expo)] ${active ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}
                          />
                        </span>
                        <span
                          className={`display text-2xl transition-colors duration-300 ${active ? 'text-bone' : 'text-mist group-hover:text-silver'}`}
                        >
                          {f.name}
                        </span>
                        <span className="label ml-auto">{f.note}</span>
                      </label>
                      <DrawRule />
                    </div>
                  )
                })}
              </div>
            </fieldset>
          </div>

          <div className="col-span-12 md:col-span-4 md:col-start-9 md:self-end">
            <DrawRule />
            <ul>
              {materials.notes.map(([k, v, h]) => {
                const on = h !== null && hotspot === h
                return (
                  <li key={k}>
                    {h ? (
                      <button
                        type="button"
                        data-row={h}
                        aria-pressed={on}
                        onClick={() => onHotspot(on ? null : h)}
                        onPointerEnter={(e) => e.pointerType === 'mouse' && onHotspot(h)}
                        onPointerLeave={(e) => e.pointerType === 'mouse' && onHotspot(null)}
                        onFocus={() => onHotspot(h)}
                        onBlur={() => onHotspot(null)}
                        className="grid w-full grid-cols-[5rem_1fr_auto] items-start gap-4 py-3.5 text-left"
                      >
                        <span className={`label pt-0.5 transition-colors duration-300 ${on ? 'text-ice!' : ''}`}>{k}</span>
                        <span className={`text-[0.9375rem] transition-colors duration-300 ${on ? 'text-bone' : 'text-silver'}`}>{v}</span>
                        <span aria-hidden="true" className={`label transition-opacity duration-300 ${on ? 'opacity-100' : 'opacity-40'}`}>
                          ◎
                        </span>
                      </button>
                    ) : (
                      <div className="grid grid-cols-[5rem_1fr_auto] items-start gap-4 py-3.5">
                        <span className="label pt-0.5">{k}</span>
                        <span className="text-[0.9375rem] text-silver">{v}</span>
                        <span />
                      </div>
                    )}
                    <DrawRule />
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </div>

      <div data-shot="studies" className="layer-fg wrap py-[10svh] portrait:pt-[46svh]">
        <MaterialStudies />
      </div>
    </section>
  )
}
