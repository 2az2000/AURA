import { motion, useScroll, useTransform } from 'motion/react'
import { brand, hero } from '../../content/copy'
import { useIntroSegment } from '../../motion/intro'
import { MagneticLink } from '../../motion/MagneticLink'
import { MaskedText } from '../../motion/MaskedText'
import { stagger } from '../../motion/tokens'
import { SheetMarks } from '../../graphics/SheetMarks'
import { DragZone } from '../ui/DragZone'

/**
 * One letter of the wordmark. Two stacked copies: an outline that rises out of a mask,
 * then a solid fill that wipes across it. Both are slices of the title-sequence clock.
 */
function Letter({ ch, i }: { ch: string; i: number }) {
  const rise = useIntroSegment(0.45 + i * stagger.letter, 1.65 + i * stagger.letter)
  const y = useTransform(rise, [0, 1], ['105%', '0%'])
  const fill = useIntroSegment(1.15 + i * 0.14, 2.15 + i * 0.14)
  const clip = useTransform(fill, [0, 1], ['inset(0 100% 0 0)', 'inset(0 0% 0 0)'])
  return (
    <span className="block overflow-hidden pb-[0.08em]" aria-hidden="true">
      <motion.span className="relative block" style={{ y }}>
        <span className="block text-transparent [-webkit-text-stroke:1.5px_rgb(191_200_213/0.32)]">{ch}</span>
        <motion.span
          className="absolute inset-0 block"
          style={{
            clipPath: clip,
            background: 'linear-gradient(180deg, #5b6371 0%, #2c313a 58%, #15171b 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          {ch}
        </motion.span>
      </motion.span>
    </span>
  )
}

/**
 * Hero = title card.
 *  z0  AURA wordmark, bleeding off the bottom edge; outlines rise, then fill (title sequence)
 *  z1  the 3D headphone, arriving from darkness (the Rig, driven by the same clock)
 *  z3  tagline, sub-copy, primary action — flanking the product, not covering it
 * The wordmark drifts at a different rate from the page, so it separates from the product.
 */
export function Hero() {
  const { scrollY } = useScroll()
  const wordmarkY = useTransform(scrollY, [0, 900], [0, 260])
  const tagline = useIntroSegment(1.25, 2.25, 'linear')
  const kicker = useIntroSegment(1.5, 2.1)
  const lower = useIntroSegment(1.8, 2.5)
  const lowerY = useTransform(lower, [0, 1], [14, 0])

  return (
    <section
      id="top"
      data-shot="hero"
      aria-labelledby="hero-title"
      className="relative flex min-h-svh flex-col overflow-x-clip"
    >
      {/* Background wordmark */}
      <motion.div
        className="layer-bg pointer-events-none absolute inset-x-0 bottom-0 flex justify-center overflow-hidden"
        style={{ y: wordmarkY, height: 'calc(var(--text-mega) * 0.7)' }}
      >
        <h1
          id="hero-title"
          className="display flex select-none leading-[0.8] text-[length:var(--text-mega)] tracking-[-0.05em]"
        >
          <span className="sr-only">
            {brand.name} — {brand.tagline}
          </span>
          {brand.name.split('').map((l, i) => (
            <Letter key={i} ch={l} i={i} />
          ))}
        </h1>
      </motion.div>

      <SheetMarks sheet={0} title="Title" />
      {/* vertical edge metadata */}
      <motion.p
        aria-hidden="true"
        className="label pointer-events-none absolute right-[0.9rem] top-1/2 z-[3] -translate-y-1/2 whitespace-nowrap text-[0.625rem] portrait:hidden"
        style={{ opacity: kicker, writingMode: 'vertical-rl' }}
      >
        AURA — Over-ear — Concept 01 — Rev A
      </motion.p>

      {/* Foreground */}
      <div className="layer-fg wrap pointer-events-none flex flex-1 flex-col pb-[calc(var(--text-mega)*0.5)] pt-24 portrait:pb-[calc(var(--text-mega)*0.62)]">
        <motion.p className="label" style={{ opacity: kicker }}>
          {hero.kicker}
        </motion.p>

        <div className="grid flex-1 grid-cols-12 items-center gap-y-6 portrait:content-end portrait:items-end">
          <div className="col-span-12 md:col-span-4">
            <MaskedText
              as="p"
              lines={hero.tagline}
              trigger={tagline}
              className="display text-[length:var(--text-tag)] leading-[0.95]"
            />
          </div>

          <motion.div
            className="pointer-events-auto col-span-12 flex flex-col items-start gap-6 md:col-span-3 md:col-start-10"
            style={{ opacity: lower, y: lowerY }}
          >
            <p className="lead max-w-[22rem]">{hero.sub}</p>
            <MagneticLink href="#reserve" variant="solid">
              {hero.cta}
            </MagneticLink>
          </motion.div>
        </div>
      </div>

      <DragZone hint className="left-1/2 top-[9svh] h-[52svh] w-[min(56vw,46rem)] -translate-x-1/2 portrait:hidden" />
    </section>
  )
}
