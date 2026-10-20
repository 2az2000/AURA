import { silence } from '../../content/copy'
import { FadeUp, LineReveal } from '../ui/Reveal'
import { SectionHead } from '../ui/SectionHead'

/** 01 — Manifesto. Product shown in profile on the right; copy hangs from the left edge. */
export function Silence() {
  return (
    <section
      id="silence"
      data-shot="silence"
      aria-labelledby="silence-title"
      className="layer-fg scrim flex min-h-svh items-center py-[14svh] max-md:items-end max-md:pt-[52svh]"
    >
      <div className="wrap grid grid-cols-12 gap-y-10">
        <div className="col-span-12 md:col-span-7">
          <FadeUp>
            <SectionHead index={silence.index} label={silence.label} />
          </FadeUp>
          <LineReveal
            id="silence-title"
            lines={silence.title}
            className="display mt-8 text-[length:var(--text-h1)]"
            as="h2"
          />
        </div>

        <div className="col-span-12 md:col-span-4 md:col-start-1 md:mt-10">
          <FadeUp delay={0.2}>
            <p className="lead">{silence.body}</p>
          </FadeUp>
        </div>

        <FadeUp delay={0.3} className="col-span-12 md:col-span-3 md:col-start-10 md:self-end">
          <p className="label border-t border-silver/20 pt-4">{silence.aside}</p>
        </FadeUp>
      </div>
    </section>
  )
}
