import { motion, useReducedMotion } from 'motion/react'
import { brand, hero } from '../../content/copy'

const EASE = [0.16, 1, 0.3, 1] as const

/**
 * Hero. Three layers:
 *  - z0  oversized AURA wordmark (background typography)
 *  - z1  the WebGL headphone (global fixed canvas, see three/Stage.tsx)
 *  - z2  small technical labels and the tagline
 * Putting the product *between* two layers of type is what gives the hero depth.
 */
export function Hero() {
  const reduce = useReducedMotion()
  const letters = brand.name.split('')

  return (
    <section
      id="top"
      data-shot="hero"
      aria-labelledby="hero-title"
      className="relative flex min-h-svh flex-col justify-between overflow-x-clip"
    >
      {/* Background wordmark */}
      <div className="layer-bg pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <h1
          id="hero-title"
          className="display flex select-none leading-none -translate-y-[20svh] text-[length:var(--text-mega)] tracking-[-0.05em]"
          style={{
            background: 'linear-gradient(180deg, #4a515d 0%, #272b32 60%, #14161a 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          <span className="sr-only">{brand.name} — {brand.tagline}</span>
          {letters.map((l, i) => (
            <span key={i} className="block overflow-hidden pb-[0.1em]" aria-hidden="true">
              <motion.span
                className="block"
                initial={reduce ? false : { y: '105%' }}
                animate={{ y: 0 }}
                transition={{ duration: 1.5, ease: EASE, delay: 0.15 + i * 0.1 }}
              >
                {l}
              </motion.span>
            </span>
          ))}
        </h1>
      </div>

      {/* Foreground */}
      <div className="layer-fg wrap flex flex-1 flex-col justify-between pb-10 pt-28 md:pb-14">
        <motion.p
          className="label"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 1.2 }}
        >
          {hero.kicker}
        </motion.p>

        <div className="grid grid-cols-12 items-end gap-y-8">
          <motion.div
            className="col-span-12 md:col-span-6"
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: EASE, delay: 1.1 }}
          >
            <p className="display text-[length:var(--text-h2)] leading-[0.95]">
              Silence,
              <br />
              engineered.
            </p>
          </motion.div>

          <motion.div
            className="col-span-12 flex items-end justify-between gap-8 md:col-span-4 md:col-start-9"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 1.5 }}
          >
            <p className="lead max-w-[22rem]">{hero.sub}</p>
            <a href="#silence" className="label group flex shrink-0 flex-col items-center gap-3" aria-label="Scroll to the story">
              <span>{hero.scroll}</span>
              <span className="relative block h-12 w-px overflow-hidden bg-silver/20">
                <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollcue_2.4s_var(--ease-cine)_infinite] bg-ice" />
              </span>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
