import { craft } from '../../content/product'
import { SheetMarks } from '../../graphics/SheetMarks'
import { SpecimenLoupe, type LoupeMaterial } from '../../graphics/SpecimenLoupe'
import { MaskedText } from '../../motion/MaskedText'
import { ClipReveal, DrawRule } from '../../motion/Reveal'
import { Parallax } from '../../motion/Parallax'

/**
 * Scene 03 — Craft.
 * Three chapters, each a split composition: a round specimen loupe (real material data under a moving
 * light) on one side and a macro of the same finish on the actual product on the other. The sides
 * alternate (loupe left, right, left). The camera goes from the face plate, to a lone exploded ear pad,
 * to the underside of the headband.
 */
export function Craft() {
  return (
    <section id="scene-craft" aria-labelledby="craft-title" className="scrim relative">
      <SheetMarks sheet={2} title="Craft" block={{ left: 'AURA · Discover · Scene 03 / 05', right: 'Craft · Rev A' }} />

      <div className="layer-fg wrap grid min-h-[70svh] grid-cols-12 content-end gap-y-6 pb-12 pt-[18svh]">
        <div className="col-span-12 md:col-span-8">
          <p className="label flex items-center gap-4">
            <span className="text-ice">03</span>
            <DrawRule className="w-10 bg-silver/35!" />
            <span>{craft.label}</span>
          </p>
          <MaskedText id="craft-title" lines={craft.title} className="display mt-6 text-[length:var(--text-h1)]" />
        </div>
        <div className="col-span-12 md:col-span-3 md:col-start-10 md:self-end">
          <ClipReveal delay={0.2}>
            <p className="text-[0.8125rem] text-mist">{craft.note}</p>
          </ClipReveal>
        </div>
      </div>

      {craft.chapters.map((ch, i) => {
        const loupeRight = i === 1
        return (
          <div
            key={ch.key}
            data-shot={`p-${ch.key}`}
            className="layer-fg wrap grid min-h-[105svh] grid-cols-12 items-center gap-y-8 portrait:min-h-[100svh] portrait:content-end portrait:pb-[calc(6svh+3.5rem)] portrait:pt-[50svh]"
          >
            <div className={`col-span-12 md:col-span-5 ${loupeRight ? 'md:col-start-8' : 'md:col-start-1'}`}>
              <Parallax speed={0.08}>
                <SpecimenLoupe
                  material={ch.key === 'titanium' ? 'metal' : (ch.key === 'aramid' ? 'fabric' : 'leather') as LoupeMaterial}
                  label={`${ch.name}: close-up surface study`}
                  className="mx-auto w-[min(100%,34rem)] portrait:w-[min(70%,18rem)]"
                />
              </Parallax>
              <div className="mx-auto mt-6 w-[min(100%,34rem)] portrait:mt-4">
                <DrawRule />
                <p className="label mt-3 flex items-baseline justify-between">
                  <span>
                    <span className="text-ice">{ch.n}</span>&nbsp;&nbsp;
                    <span className="text-bone">{ch.name}</span>
                  </span>
                  <span className="text-[0.625rem]">On the product: {ch.detail}</span>
                </p>
                <p className="mt-3 max-w-[34ch] text-silver">{ch.text}</p>
              </div>
            </div>
          </div>
        )
      })}
    </section>
  )
}
