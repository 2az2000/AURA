import { motion, useTransform } from 'motion/react'
import { arrival } from '../../content/product'
import { MacroReticle } from '../../graphics/MacroReticle'
import { SheetMarks } from '../../graphics/SheetMarks'
import { useIntroSegment } from '../../motion/intro'
import { MaskedText } from '../../motion/MaskedText'

/**
 * Scene 01 — Arrival.
 * The camera starts INSIDE the macro (the face plate fills the frame under a viewfinder reticle),
 * pulls back and turns to a low three-quarter angle on the right. A giant serif word sits across the
 * lower left of the frame, overlapping the product's silhouette — the opposite of the homepage's
 * centred title card.
 */
export function Arrival() {
  const lead = useIntroSegment(1.5, 2.2, 'linear')
  const word = useIntroSegment(1.7, 2.7, 'linear')
  const meta = useIntroSegment(2.0, 2.6)
  const metaY = useTransform(meta, [0, 1], [12, 0])

  return (
    <section
      id="scene-arrival"
      data-shot="p-arrival"
      aria-labelledby="arrival-title"
      className="scrim relative flex min-h-[135svh] flex-col"
    >
      <SheetMarks sheet={0} title="Arrival" block={{ left: 'AURA · Discover · Scene 01 / 05', right: 'Product film · Rev A' }} />
      <MacroReticle caption={arrival.reticle} />

      <div className="layer-fg wrap flex min-h-svh flex-1 flex-col justify-between pb-[9svh] pt-28">
        <motion.p className="label" style={{ opacity: meta, y: metaY }}>
          {arrival.kicker}
        </motion.p>

        {/* the giant word */}
        <div className="-ml-[0.04em] max-w-full">
          <MaskedText as="p" lines={[arrival.lead]} trigger={lead} className="display text-[length:var(--text-h2)] leading-[0.95]" />
          <h1 id="arrival-title" className="sr-only">
            {arrival.lead} {arrival.title.replace(/\*/g, '')}
          </h1>
          <MaskedText
            as="p"
            lines={[arrival.title]}
            trigger={word}
            className="display text-[length:clamp(7rem,25vw,28rem)] leading-[0.74] tracking-[-0.05em]"
          />
        </div>

        <motion.div className="grid grid-cols-12 items-end gap-y-6" style={{ opacity: meta, y: metaY }}>
          <p className="lead col-span-12 max-w-[26ch] md:col-span-4">{arrival.sub}</p>
          <p className="label col-span-12 flex items-center gap-4 md:col-span-3 md:col-start-10 md:justify-end">
            {arrival.cue}
            <span aria-hidden="true" className="relative block h-12 w-px overflow-hidden bg-silver/20">
              <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollcue_2.4s_var(--ease-cine)_infinite] bg-ice" />
            </span>
          </p>
        </motion.div>
      </div>
    </section>
  )
}
