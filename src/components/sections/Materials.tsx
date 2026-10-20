import { materials, type Finish } from '../../content/copy'
import { FadeUp, LineReveal } from '../ui/Reveal'
import { SectionHead } from '../ui/SectionHead'

/** 03 — Materials. Macro shot on the face plate, with a live finish switcher. */
export function Materials({
  finish,
  onFinish,
}: {
  finish: Finish
  onFinish: (f: Finish) => void
}) {
  return (
    <section
      id="materials"
      data-shot="materials"
      aria-labelledby="materials-title"
      className="layer-fg scrim flex min-h-svh items-center py-[14svh] max-md:items-end max-md:pt-[56svh]"
    >
      <div className="wrap grid grid-cols-12 gap-y-12">
        <div className="col-span-12 md:col-span-6">
          <FadeUp>
            <SectionHead index={materials.index} label={materials.label} />
          </FadeUp>
          <LineReveal
            id="materials-title"
            lines={materials.title}
            className="display mt-8 text-[length:var(--text-h2)]"
          />
          <FadeUp delay={0.2}>
            <p className="mt-8 max-w-[34ch] text-mist">{materials.body}</p>
          </FadeUp>

          {/* Finish switcher: a real radio group, styled as a typographic list. */}
          <FadeUp delay={0.3}>
            <fieldset className="mt-10">
              <legend className="label mb-4">Finish</legend>
              <div className="flex flex-col border-t border-silver/15">
                {materials.finishes.map((f) => {
                  const active = f.id === finish.id
                  return (
                    <label
                      key={f.id}
                      className="group flex cursor-pointer items-center gap-5 border-b border-silver/15 py-4 has-[:focus-visible]:outline has-[:focus-visible]:outline-1 has-[:focus-visible]:outline-offset-4 has-[:focus-visible]:outline-ice"
                    >
                      <input
                        type="radio"
                        name="finish"
                        value={f.id}
                        checked={active}
                        onChange={() => onFinish(f)}
                        className="sr-only"
                      />
                      <span
                        aria-hidden="true"
                        className="relative block size-5 rounded-full border border-silver/30"
                        style={{ background: `radial-gradient(circle at 35% 30%, ${f.metal}, ${f.shell})` }}
                      >
                        {active && <span className="absolute -inset-1.5 rounded-full border border-ice" />}
                      </span>
                      <span
                        className={`display text-2xl transition-colors duration-300 ${active ? 'text-bone' : 'text-mist group-hover:text-silver'}`}
                      >
                        {f.name}
                      </span>
                      <span className="label ml-auto">{f.note}</span>
                    </label>
                  )
                })}
              </div>
            </fieldset>
          </FadeUp>
        </div>

        <FadeUp delay={0.3} className="col-span-12 md:col-span-4 md:col-start-9 md:self-end">
          <dl className="divide-y divide-silver/15 border-y border-silver/15">
            {materials.notes.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[5rem_1fr] gap-4 py-3.5">
                <dt className="label pt-0.5">{k}</dt>
                <dd className="text-[0.9375rem] text-silver">{v}</dd>
              </div>
            ))}
          </dl>
        </FadeUp>
      </div>
    </section>
  )
}
