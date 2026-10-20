import { acoustics } from '../../content/copy'
import { CancelDiagram } from '../../graphics/CancelDiagram'
import { SheetMarks } from '../../graphics/SheetMarks'
import { Spectrum } from '../../graphics/Spectrum'
import { MaskedText } from '../../motion/MaskedText'
import { ClipReveal } from '../../motion/Reveal'
import { SectionHead } from '../ui/SectionHead'
import { SectionNumeral } from '../ui/SectionNumeral'

/**
 * Sheet 05 — Acoustics. Lead world: the FIELD.
 * The product turns its face to the camera and rings of sound propagate from the cup (Overlays);
 * below, the cancellation diagram and an illustrative spectrum share one ledger.
 * Everything drawn here is labelled illustrative: none of it is a measurement of a product.
 */
export function Acoustics() {
  return (
    <section
      id="acoustics"
      data-shot="acoustics"
      aria-labelledby="acoustics-title"
      className="scrim relative flex min-h-[112svh] flex-col justify-between gap-8 py-[9svh] portrait:gap-10 portrait:pb-[8svh] portrait:pt-[44svh]"
    >
      <SheetMarks sheet={5} title="Acoustics" />
      <SectionNumeral n="05" className="-left-[3vw] top-[8svh]" />

      <div className="layer-fg wrap grid grid-cols-12 gap-y-8">
        <div className="col-span-12 md:col-span-6">
          <SectionHead index={acoustics.index} label={acoustics.label} />
          <MaskedText id="acoustics-title" lines={acoustics.title} className="display mt-8 text-[length:var(--text-h2)]" />
          <div className="mt-6 max-w-[40ch]">
            <ClipReveal delay={0.15}>
              <p className="lead portrait:text-base">{acoustics.body}</p>
            </ClipReveal>
          </div>
          <div className="mt-6 max-w-[40ch] border-l border-ice/40 pl-4">
            <p className="label text-bone">{acoustics.field.title}</p>
            <p className="mt-1 text-[0.8125rem] text-mist">{acoustics.field.caption}</p>
          </div>
        </div>
      </div>

      <div className="layer-fg wrap grid grid-cols-12 gap-x-12 gap-y-10">
        <div className="col-span-12 md:col-span-7">
          <CancelDiagram />
        </div>
        <div className="col-span-12 md:col-span-5">
          <Spectrum />
        </div>
      </div>
    </section>
  )
}
