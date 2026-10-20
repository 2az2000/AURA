import { silence } from '../../content/copy'
import { SheetMarks } from '../../graphics/SheetMarks'
import { WaveRibbon } from '../../graphics/WaveRibbon'
import { DrawRule } from '../../motion/Reveal'
import { MaskedText } from '../../motion/MaskedText'
import { ScrollWords } from '../../motion/ScrollWords'
import { SectionHead } from '../ui/SectionHead'
import { SectionNumeral } from '../ui/SectionNumeral'

/**
 * Sheet 01 — Silence. Lead world: the FIELD.
 * Manifesto on the left, product in profile on the right, and a full-bleed waveform ribbon along the
 * bottom that is loud until the paragraph has been read, then flat: the argument drawn as a picture.
 */
export function Silence() {
  return (
    <section
      id="silence"
      data-shot="silence"
      aria-labelledby="silence-title"
      className="scrim relative flex min-h-[135svh] flex-col justify-center gap-12 py-[14svh] portrait:justify-end portrait:pt-[52svh]"
    >
      <SheetMarks sheet={1} title="Silence" />
      <SectionNumeral n="01" className="-right-[4vw] top-[6svh]" />
      <div className="layer-fg wrap grid grid-cols-12 gap-y-10">
        <div className="col-span-12 md:col-span-7">
          <SectionHead index={silence.index} label={silence.label} />
          <MaskedText id="silence-title" lines={silence.title} className="display mt-8 text-[length:var(--text-h1)]" />
        </div>

        <div className="col-span-12 md:col-span-4 md:col-start-1 md:mt-10">
          <ScrollWords text={silence.body} className="lead" />
        </div>

        <div className="col-span-12 md:col-span-3 md:col-start-10 md:self-end">
          <DrawRule />
          <p className="label pt-4">{silence.aside}</p>
        </div>
      </div>

      {/* the subtraction, drawn */}
      <WaveRibbon className="layer-fg h-[18svh] w-full" />
    </section>
  )
}
