import { form } from '../../content/copy'
import { OrthoView, type ViewKey } from '../../graphics/OrthoSheet'
import { SheetMarks } from '../../graphics/SheetMarks'
import { MaskedText } from '../../motion/MaskedText'
import { ClipReveal, DrawRule } from '../../motion/Reveal'
import { useActiveShot } from '../../story/store'
import { SectionHead } from '../ui/SectionHead'
import { SectionNumeral } from '../ui/SectionNumeral'

/**
 * Sheet 02 — Form. Lead world: the DRAWING.
 * Three orthographic views (front, profile, plan) drawn line by line on a fine grid. Each is a storyboard
 * shot: as you scroll to a view, the 3D product turns to the same angle beside it. The drawing and the
 * object are generated from the same dimensions, so they agree.
 */
export function Form() {
  const active = useActiveShot()
  return (
    <section id="form" aria-labelledby="form-title" className="scrim relative">
      <SheetMarks sheet={2} title="Form" />
      <SectionNumeral n="02" className="-left-[3vw] top-[4svh]" />

      <div className="layer-fg wrap flex min-h-[70svh] flex-col justify-end gap-6 pb-10 pt-[20svh] portrait:pt-[16svh]">
        <SectionHead index={form.index} label={form.label} />
        <MaskedText id="form-title" lines={form.title} className="display text-[length:var(--text-h2)]" />
        <ClipReveal delay={0.15}>
          <p className="max-w-[44ch] text-mist">{form.body}</p>
        </ClipReveal>
      </div>

      {form.views.map((v) => {
        const on = active === `form-${v.key}`
        return (
          <div
            key={v.key}
            data-shot={`form-${v.key}`}
            className="layer-fg wrap grid min-h-[92svh] grid-cols-12 items-center gap-y-6 py-[6svh] portrait:min-h-[100svh] portrait:content-end portrait:pt-[50svh]"
          >
            <div className="col-span-12 md:col-span-6">
              <div className="mb-4 flex items-baseline justify-between">
                <p className="label">
                  <span className="text-ice">{v.letter}</span>
                  <span className="mx-3 inline-block h-px w-8 bg-silver/30 align-middle" />
                  <span className={on ? 'text-bone' : ''}>{v.name}</span>
                </p>
                <p className="label text-[0.625rem]">Sheet 02 · View {v.letter} / 3</p>
              </div>
              <DrawRule />
              <OrthoView view={v.key as ViewKey} className="mt-2 w-full" />
              <DrawRule />
              <p className="mt-4 max-w-[40ch] text-[0.9375rem] text-silver">{v.note}</p>
              <p className="label mt-3 text-[0.625rem]">{form.caption}</p>
            </div>
          </div>
        )
      })}
    </section>
  )
}
