import { useEffect, useRef, useState } from 'react'
import { animate, motion, useMotionValue, useMotionValueEvent, useReducedMotion } from 'motion/react'
import { useIntro } from '../motion/intro'
import { duration, ease } from '../motion/tokens'

/**
 * The loader. A giant numeric counter, bottom-left, driven by REAL loading states — not a timer:
 *   30  web fonts ready
 *   60  3D bundle downloaded
 *   90  scene rendered its first frames
 *  100  the title sequence has begun → the panel wipes upward
 * It never blocks: pointer-events are off, any input skips it, and it leaves by itself after at most
 * ~3.4 s even if something stalls. Under reduced motion it is not rendered.
 */
export function PreLoader({ fonts, chunk, scene }: { fonts: boolean; chunk: boolean; scene: boolean }) {
  const reduce = useReducedMotion()
  const { progress } = useIntro()
  const [gone, setGone] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const num = useRef<HTMLSpanElement>(null)
  const count = useMotionValue(0)
  const started = progress.get() > 0.03

  const target = leaving ? 100 : (fonts ? 30 : 0) + (chunk ? 30 : 0) + (scene ? 30 : 0)

  useEffect(() => {
    const c = animate(count, target, { duration: 0.6, ease: ease.out })
    return () => c.stop()
  }, [target, count])

  useMotionValueEvent(count, 'change', (v) => {
    if (num.current) num.current.textContent = String(Math.round(v)).padStart(3, '0')
  })

  // leave once the sequence starts, or after a hard cap
  useEffect(() => {
    if (reduce) return
    const leave = () => setLeaving(true)
    const off = progress.on('change', (v) => v > 0.03 && leave())
    const cap = window.setTimeout(leave, 3400)
    const skip = () => leave()
    window.addEventListener('pointerdown', skip, { once: true })
    window.addEventListener('keydown', skip, { once: true })
    if (started) leave()
    return () => {
      off()
      window.clearTimeout(cap)
      window.removeEventListener('pointerdown', skip)
      window.removeEventListener('keydown', skip)
    }
  }, [progress, reduce, started])

  if (reduce || gone) return null

  const row = (label: string, done: boolean) => (
    <li className="flex items-center gap-3">
      <span className={`inline-block size-1.5 rounded-full transition-colors duration-500 ${done ? 'bg-ice' : 'bg-silver/25'}`} />
      <span className={done ? 'text-bone' : ''}>{label}</span>
    </li>
  )

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[80] bg-obsidian"
      initial={{ clipPath: 'inset(0 0 0% 0)' }}
      animate={{ clipPath: leaving ? 'inset(0 0 100% 0)' : 'inset(0 0 0% 0)' }}
      transition={{ duration: duration.slow, ease: ease.inOut, delay: leaving ? 0.35 : 0 }}
      onAnimationComplete={() => leaving && setGone(true)}
    >
      <div className="wrap flex h-full flex-col justify-between py-6">
        <div className="flex items-start justify-between">
          <span className="display text-xl tracking-[0.32em]">AURA</span>
          <ul className="label flex flex-col gap-2 text-right [&>li]:justify-end">
            {row('Type', fonts)}
            {row('Scene', chunk)}
            {row('First light', scene)}
          </ul>
        </div>
        <div>
          <p className="label mb-2">Loading — Concept 01</p>
          <p className="font-mono leading-none tracking-tight text-bone/90" style={{ fontSize: 'clamp(6rem, 22vw, 20rem)' }}>
            <span ref={num}>000</span>
          </p>
          <div className="mt-4 h-px w-full bg-silver/15">
            <motion.div className="h-px origin-left bg-ice" style={{ scaleX: 0 }} animate={{ scaleX: target / 100 }} transition={{ duration: 0.6, ease: ease.out }} />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
