import { silence } from '../../content/copy'
import { DrawRule } from '../../motion/Reveal'
import { MaskedText } from '../../motion/MaskedText'
import { ScrollWords } from '../../motion/ScrollWords'
import { SectionHead } from '../ui/SectionHead'
import { SectionNumeral } from '../ui/SectionNumeral'

/**
 * 01 — Manifesto. Profile view of the product on the right.
 * The paragraph is "read" by scrolling (ScrollWords) so the section has time to breathe
 * and reading speed follows scroll speed. A giant outlined numeral sits behind the product.
 */
export function Silence() {
  return (
    <section
      id="silence"
      data-shot="silence"
      aria-labelledby="silence-title"
      className="scrim relative flex min-h-[135svh] items-center py-[14svh] max-md:items-end max-md:pt-[52svh]"
    >
      <SectionNumeral n="01" className="-right-[4vw] top-[6svh]" />
      <div className="layer-fg wrap grid grid-cols-12 gap-y-10">
        <div className="col-span-12 md:col-span-7">
          <SectionHead index={silence.index} label={silence.label} />
          <MaskedText
            id="silence-title"
            lines={silence.title}
            className="display mt-8 text-[length:var(--text-h1)]"
          />
        </div>

        <div className="col-span-12 md:col-span-4 md:col-start-1 md:mt-10">
          <ScrollWords text={silence.body} className="lead" />
        </div>

        <div className="col-span-12 md:col-span-3 md:col-start-10 md:self-end">
          <DrawRule />
          <p className="label pt-4">{silence.aside}</p>
        </div>
      </div>
    </section>
  )
}
