import { anatomy } from '../../content/copy'
import { FadeUp, LineReveal } from '../ui/Reveal'
import { SectionHead } from '../ui/SectionHead'

/**
 * 02 — Exploded view. The 3D model pulls the cup apart (storyboard `explode: 1`);
 * the labels on the parts are in-canvas (Headphone.tsx), and this list is the
 * readable / accessible version of the same information.
 */
export function Anatomy() {
  return (
    <section
      id="anatomy"
      data-shot="anatomy"
      aria-labelledby="anatomy-title"
      className="layer-fg scrim flex min-h-[130svh] flex-col justify-between gap-16 py-[24svh] max-md:min-h-svh max-md:gap-6 max-md:py-[12svh]"
    >
      <div className="wrap grid grid-cols-12 gap-y-6">
        <div className="col-span-12 md:col-span-6">
          <FadeUp>
            <SectionHead index={anatomy.index} label={anatomy.label} />
          </FadeUp>
          <LineReveal
            id="anatomy-title"
            lines={anatomy.title}
            className="display mt-8 text-[length:var(--text-h2)]"
          />
        </div>
        <FadeUp delay={0.2} className="col-span-12 max-md:hidden md:col-span-3 md:col-start-1">
          <p className="text-mist">{anatomy.body}</p>
        </FadeUp>
      </div>

      <ol className="wrap grid grid-cols-2 gap-x-5 gap-y-5 md:grid-cols-4 md:gap-x-8 md:gap-y-8">
        {anatomy.parts.map((p, i) => (
          <FadeUp as="li" key={p.key} delay={0.1 + i * 0.08} className="border-t border-silver/20 pt-5">
            <p className="label flex justify-between">
              <span className="text-ice">{p.n}</span>
              <span className="text-bone">{p.name}</span>
            </p>
            <p className="mt-3 max-w-[26ch] text-[0.8125rem] leading-relaxed text-mist md:mt-4 md:text-[0.9375rem]">{p.text}</p>
          </FadeUp>
        ))}
      </ol>
    </section>
  )
}
