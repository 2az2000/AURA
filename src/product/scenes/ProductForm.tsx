import { useRef } from 'react'
import { useScroll } from 'motion/react'
import { form } from '../../content/product'
import { RotationReadout } from '../../graphics/RotationReadout'
import { SheetMarks } from '../../graphics/SheetMarks'
import { Silhouette } from '../../graphics/Silhouette'
import { MaskedText } from '../../motion/MaskedText'
import { ClipReveal, DrawRule } from '../../motion/Reveal'
import { useActiveShot } from '../../story/store'
import type { SceneBridge } from '../../story/hotspots'
import { productShotsWide } from '../productStory'

const yawOf = (id: string) => {
  const s = productShotsWide.find((x) => x.id === id)
  return s ? Math.round((((s.rotY * 180) / Math.PI) % 360 + 360) % 360) : 0
}

/**
 * Scene 02 — Form.
 * The camera walks around the product in four stops while the product swaps sides of the frame
 * (right, left, right, left) and the copy takes the opposite side. Behind everything a large silhouette
 * trace DRAWS ITSELF as the scene scrolls, and an instrument shows the model's live yaw/pitch.
 * Ordinary scrolling: nothing is pinned except two decorative sticky layers.
 */
export function ProductForm({ bridge }: { bridge: SceneBridge }) {
  const host = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: host, offset: ['start 70%', 'end 55%'] })
  const active = useActiveShot()

  return (
    <section id="scene-form" aria-labelledby="pform-title" className="scrim relative">
      <SheetMarks sheet={1} title="Form" block={{ left: 'AURA · Discover · Scene 02 / 05', right: 'Form · Rev A' }} />
      <div ref={host} className="relative">
        {/* decorative sticky layers: the trace (behind the canvas) and the readout (in front) */}
        <div aria-hidden="true" className="pointer-events-none sticky top-0 z-0 h-svh w-full portrait:hidden" style={{ marginBottom: '-100svh' }}>
          <Silhouette progress={scrollYProgress} className="absolute inset-0 m-auto h-[92svh] w-full" />
        </div>
        <div aria-hidden="true" className="layer-fg pointer-events-none sticky top-0 h-svh w-full" style={{ marginBottom: '-100svh' }}>
          <div className="wrap relative h-full">
            <RotationReadout bridge={bridge} yaw={form.readout.y} pitch={form.readout.x} className="absolute bottom-[13svh] left-[var(--gutter)] portrait:hidden" />
          </div>
        </div>

        <div className="layer-fg wrap flex min-h-[75svh] flex-col justify-end gap-6 pb-12 pt-[18svh]">
          <p className="label flex items-center gap-4">
            <span className="text-ice">02</span>
            <DrawRule className="w-10 bg-silver/35!" />
            <span>{form.label}</span>
          </p>
          <MaskedText id="pform-title" lines={form.title} className="display text-[length:var(--text-h1)]" />
          <ClipReveal delay={0.15}>
            <p className="max-w-[44ch] text-mist">{form.body}</p>
          </ClipReveal>
        </div>

        {form.steps.map((st, i) => {
          const id = `p-form-${st.key}`
          const textRight = i % 2 === 1 // product is on the left in steps 2 and 4
          const on = active === id
          return (
            <div
              key={st.key}
              data-shot={id}
              className="layer-fg wrap grid min-h-[90svh] grid-cols-12 items-center portrait:min-h-[100svh] portrait:content-end portrait:pb-[calc(6svh+3.5rem)] portrait:pt-[56svh]"
            >
              <div className={`col-span-12 md:col-span-4 ${textRight ? 'md:col-start-9 md:max-w-[21rem]' : 'md:col-start-1'}`}>
                <div>
                  <p className="label flex items-baseline justify-between">
                    <span className="text-ice">{st.n}</span>
                    <span>
                      Yaw <span className="text-bone tabular-nums">{String(yawOf(id)).padStart(3, '0')}°</span>
                    </span>
                  </p>
                  <DrawRule className="mt-3" />
                  <h3 className={`display mt-6 text-[length:clamp(2.25rem,3.8vw,4rem)] leading-[0.95] transition-colors duration-500 ${on ? 'text-bone' : 'text-silver'}`}>{st.title}</h3>
                  <p className="mt-5 max-w-[30ch] text-silver">{st.text}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
