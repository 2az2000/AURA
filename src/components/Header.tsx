import { motion, useScroll, useSpring } from 'motion/react'
import { brand, nav } from '../content/copy'

/** Fixed header: wordmark, section links, primary action, and a hairline scroll-progress bar. */
export function Header() {
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 })

  return (
    <header className="fixed inset-x-0 top-0 z-40">
      <div className="wrap flex h-[4.5rem] items-center justify-between">
        <a href="#top" className="display text-xl tracking-[0.32em]" aria-label={`${brand.name} — back to top`}>
          {brand.name}
        </a>

        <nav aria-label="Sections" className="hidden md:block">
          <ul className="flex items-center gap-10">
            {nav.map((n) => (
              <li key={n.id}>
                <a href={`#${n.id}`} className="label transition-colors duration-300 hover:text-bone">
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <a
          href="#reserve"
          className="label border border-silver/25 px-4 py-2.5 text-bone transition-colors duration-300 hover:border-ice hover:text-ice"
        >
          Register interest
        </a>
      </div>
      <motion.div
        aria-hidden="true"
        className="h-px origin-left bg-ice/70"
        style={{ scaleX: progress }}
      />
    </header>
  )
}
