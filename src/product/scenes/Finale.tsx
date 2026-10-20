import { finale } from '../../content/product'
import { SheetMarks } from '../../graphics/SheetMarks'
import { useIntro } from '../../motion/intro'
import { MagneticLink } from '../../motion/MagneticLink'
import { MaskedText } from '../../motion/MaskedText'
import { ClipReveal, DrawRule } from '../../motion/Reveal'

/**
 * Scene 05 — The final composition.
 * The mirror image of the arrival: the product low and left, tilted, the giant serif word on the right.
 * The call to action goes to a REAL destination — the registration form on the overview page
 * (`/#reserve`) — and a second action replays the film.
 */
export function Finale() {
  const { replay } = useIntro()
  const again = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    window.setTimeout(replay, 700)
  }
  return (
    <section id="scene-finale" data-shot="p-finale" aria-labelledby="finale-title" className="scrim relative flex min-h-[125svh] items-center py-[12svh] portrait:items-end portrait:pb-[5rem] portrait:pt-[54svh]">
      <SheetMarks sheet={4} title="Close" block={{ left: 'AURA · Discover · Scene 05 / 05', right: 'End of film · Rev A' }} />
      <div className="layer-fg wrap grid grid-cols-12">
        <div className="col-span-12 md:col-span-7 md:col-start-6 md:text-right">
          <p className="label flex items-center gap-4 md:justify-end">
            <DrawRule className="w-10 bg-silver/35!" />
            <span>{finale.label}</span>
            <span className="text-ice">05</span>
          </p>
          <MaskedText as="p" lines={[finale.lead]} className="display mt-8 text-[length:var(--text-h2)] leading-[0.95]" />
          <h2 id="finale-title" className="sr-only">
            {finale.lead} {finale.title.replace(/\*/g, '')}
          </h2>
          <MaskedText as="p" lines={[finale.title]} delay={0.1} className="display text-[length:clamp(6rem,21vw,24rem)] leading-[0.76] tracking-[-0.05em]" />
          <ClipReveal delay={0.3} className="md:ml-auto md:max-w-[40ch]">
            <p className="lead mt-8">{finale.body}</p>
          </ClipReveal>
          <ClipReveal delay={0.4} className="mt-10">
            <div className="flex flex-wrap items-center gap-6 md:justify-end">
              <MagneticLink href="/#reserve" variant="solid">
                {finale.cta}
              </MagneticLink>
              <MagneticLink href="/" variant="outline">
                {finale.back}
              </MagneticLink>
              <button type="button" onClick={again} className="label transition-colors duration-300 hover:text-bone">
                ↑ {finale.replay}
              </button>
            </div>
          </ClipReveal>
        </div>
      </div>
    </section>
  )
}
