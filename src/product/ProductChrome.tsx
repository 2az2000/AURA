import { motion, useReducedMotion, useScroll, useSpring } from 'motion/react'
import { productHeader, scenes } from '../content/product'
import { useIntroSegment } from '../motion/intro'
import { MagneticLink } from '../motion/MagneticLink'
import { spring } from '../motion/tokens'
import { Link } from '../router'
import { useActiveShot } from '../story/store'

/** Map a storyboard shot id ("p-form-b", "p-aramid", …) to its scene id. */
export const sceneOf = (shot: string) => {
  if (shot.startsWith('p-form')) return 'form'
  if (shot === 'p-titanium' || shot === 'p-aramid' || shot === 'p-leather') return 'craft'
  return shot.replace('p-', '')
}

/** Header for the product film: wordmark → overview, a way back, the real CTA, and a scroll hairline. */
export function ProductHeader() {
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 })
  const arrive = useIntroSegment(2.2, 2.8)
  return (
    <motion.header className="fixed inset-x-0 top-0 z-40" style={{ opacity: arrive }}>
      <div className="wrap flex h-[4.5rem] items-center justify-between">
        <Link to="/" className="display text-xl tracking-[0.32em]" aria-label="AURA — back to the overview">
          AURA
        </Link>
        <p className="label hidden lg:block">Discover — product film</p>
        <div className="flex items-center gap-5">
          <Link to="/" className="label transition-colors duration-300 hover:text-bone">
            ← {productHeader.home}
          </Link>
          <MagneticLink href="/#reserve" className="max-lg:hidden py-2.5!">
            Register interest
          </MagneticLink>
        </div>
      </div>
      <motion.div aria-hidden="true" className="h-px origin-left bg-ice/70" style={{ scaleX: progress }} />
    </motion.header>
  )
}

/**
 * Scene rail: the five scenes as a vertical rail on the right (desktop) or a segmented bar at the
 * bottom (portrait). The active scene is highlighted by a shared-layout indicator that springs
 * between entries; every entry is a real button that scrolls to its scene.
 */
export function SceneRail() {
  const active = sceneOf(useActiveShot())
  const reduce = useReducedMotion()
  const go = (id: string) => document.getElementById(`scene-${id}`)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })

  return (
    <nav aria-label={productHeader.aria}>
      {/* desktop / landscape */}
      <ol className="fixed right-5 top-1/2 z-30 flex -translate-y-1/2 flex-col items-end gap-5 portrait:hidden">
        {scenes.map((s) => {
          const on = s.id === active
          return (
            <li key={s.id}>
              <button type="button" onClick={() => go(s.id)} aria-current={on ? 'step' : undefined} className="group flex items-center gap-3">
                <span className={`label whitespace-nowrap transition-all duration-500 ${on ? 'translate-x-0 text-bone opacity-100' : 'translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100'}`}>
                  {s.name}
                </span>
                <span className="relative flex items-center gap-2">
                  <span className={`label transition-colors duration-300 ${on ? 'text-ice!' : ''}`}>{s.n}</span>
                  <span className="relative block h-px w-5 bg-silver/30">
                    {on && <motion.span layoutId="rail-indicator" transition={reduce ? { duration: 0 } : spring.ui} className="absolute -inset-y-px inset-x-0 h-[3px] bg-ice" />}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ol>
      {/* portrait */}
      <ol className="fixed inset-x-4 bottom-3 z-30 hidden grid-cols-5 gap-1.5 portrait:grid">
        {scenes.map((s) => {
          const on = s.id === active
          return (
            <li key={s.id}>
              <button type="button" onClick={() => go(s.id)} aria-current={on ? 'step' : undefined} aria-label={`${s.n} ${s.name}`} className="block w-full py-2 text-left">
                <span className={`block h-px w-full ${on ? 'bg-ice' : 'bg-silver/30'}`} />
                <span className={`label mt-1.5 block text-[0.5625rem] ${on ? 'text-bone' : ''}`}>{on ? `${s.n} ${s.name}` : s.n}</span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
