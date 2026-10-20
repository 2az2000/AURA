import { fit } from '../../content/copy'
import { FadeUp, LineReveal } from '../ui/Reveal'
import { SectionHead } from '../ui/SectionHead'

/**
 * 05 — Fit + specification. The product moves to the LEFT here (the only section
 * where it does), so the copy and spec table sit in the right-hand columns.
 */
export function Fit() {
  return (
    <section
      id="fit"
      data-shot="fit"
      aria-labelledby="fit-title"
      className="layer-fg scrim flex min-h-svh items-center py-[16svh] max-md:items-end max-md:pt-[52svh]"
    >
      <div className="wrap grid grid-cols-12">
        <div className="col-span-12 md:col-span-5 md:col-start-8">
          <FadeUp>
            <SectionHead index={fit.index} label={fit.label} />
          </FadeUp>
          <LineReveal
            id="fit-title"
            lines={fit.title}
            className="display mt-8 text-[length:var(--text-h2)]"
          />
          <FadeUp delay={0.2}>
            <p className="mt-6 max-w-[40ch] text-mist">{fit.body}</p>
          </FadeUp>

          <FadeUp delay={0.3} className="mt-10">
            <h3 className="label mb-3 text-bone">{fit.specsTitle}</h3>
            <dl className="divide-y divide-silver/15 border-y border-silver/15">
              {fit.specs.map(([k, v]) => (
                <div key={k} className="grid grid-cols-[6rem_1fr] gap-4 py-2.5">
                  <dt className="label pt-0.5">{k}</dt>
                  <dd className="text-[0.9375rem] text-silver">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-[0.8125rem] text-mist">{fit.specsNote}</p>
          </FadeUp>
        </div>
      </div>
    </section>
  )
}
