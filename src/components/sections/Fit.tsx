import { fit } from '../../content/copy'
import { SheetMarks } from '../../graphics/SheetMarks'
import { ClipReveal, DrawRule } from '../../motion/Reveal'
import { MaskedText } from '../../motion/MaskedText'
import type { HotspotId } from '../../story/storyboard'
import { SectionHead } from '../ui/SectionHead'
import { SectionNumeral } from '../ui/SectionNumeral'

/**
 * 05 — Fit + specification. The product moves to the LEFT here (the only section where
 * it does), so the copy and spec table sit in the right-hand columns. The "Controls" row is
 * wired to the dial hotspot on the product.
 */
export function Fit({
  hotspot,
  onHotspot,
}: {
  hotspot: HotspotId | null
  onHotspot: (id: HotspotId | null) => void
}) {
  return (
    <section
      id="fit"
      data-shot="fit"
      aria-labelledby="fit-title"
      className="scrim relative flex min-h-svh items-center py-[12svh] portrait:items-end portrait:pt-[52svh]"
    >
      <SheetMarks sheet={6} title="Fit" />
      <SectionNumeral n="06" className="-left-[3vw] top-[10svh]" />
      <div className="layer-fg wrap grid grid-cols-12">
        <div className="col-span-12 md:col-span-5 md:col-start-8">
          <SectionHead index={fit.index} label={fit.label} />
          <MaskedText id="fit-title" lines={fit.title} className="display mt-8 text-[length:var(--text-h2)]" />
          <ClipReveal delay={0.15}>
            <p className="mt-5 max-w-[40ch] text-mist">{fit.body}</p>
          </ClipReveal>

          <div className="mt-8">
            <h3 className="label mb-3 text-bone">{fit.specsTitle}</h3>
            <DrawRule />
            <ul>
              {fit.specs.map(([k, v, h]) => {
                const on = h !== null && (hotspot === h || (h === 'dial' && hotspot === 'button'))
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
                        className="grid w-full grid-cols-[6rem_1fr_auto] gap-4 py-2 text-left"
                      >
                        <span className={`label pt-0.5 transition-colors duration-300 ${on ? 'text-ice!' : ''}`}>{k}</span>
                        <span className={`text-[0.9375rem] transition-colors duration-300 ${on ? 'text-bone' : 'text-silver'}`}>{v}</span>
                        <span aria-hidden="true" className={`label transition-opacity duration-300 ${on ? 'opacity-100' : 'opacity-40'}`}>
                          ◎
                        </span>
                      </button>
                    ) : (
                      <div className="grid grid-cols-[6rem_1fr_auto] gap-4 py-2">
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
            <p className="mt-3 text-[0.8125rem] text-mist">{fit.specsNote}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
