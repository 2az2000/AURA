import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from 'motion/react'
import { brand, menu, nav } from '../content/copy'
import { useIntroSegment } from '../motion/intro'
import { MagneticLink } from '../motion/MagneticLink'
import { duration, ease, spring, stagger } from '../motion/tokens'
import { useActiveSection } from '../story/store'

/**
 * Fixed header.
 *  - Wordmark, section links with a sliding "you are here" indicator (shared-layout
 *    animation, spring), and the primary action.
 *  - Hairline scroll-progress bar.
 *  - Below `md` the links live in a full-screen menu: focus moves into it, Esc closes it,
 *    Tab is kept inside while it is open, background scroll is locked, and focus returns to the button.
 * Arrives as the last step of the title sequence.
 */
export function Header() {
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 })
  const active = useActiveSection()
  const reduce = useReducedMotion()
  const arrive = useIntroSegment(1.9, 2.5)
  const [open, setOpen] = useState(false)
  const btn = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLDivElement>(null)

  // lock scroll + focus handling while the menu is open
  useEffect(() => {
    if (!open) return
    const prevOverflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    const first = panel.current?.querySelector<HTMLElement>('a,button')
    first?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
      if (e.key !== 'Tab' || !panel.current) return
      const f = [...panel.current.querySelectorAll<HTMLElement>('a,button')]
      const idx = f.indexOf(document.activeElement as HTMLElement)
      if (e.shiftKey && idx <= 0) {
        e.preventDefault()
        f[f.length - 1].focus()
      } else if (!e.shiftKey && idx === f.length - 1) {
        e.preventDefault()
        f[0].focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.documentElement.style.overflow = prevOverflow
      btn.current?.focus()
    }
  }, [open])

  return (
    <motion.header className="fixed inset-x-0 top-0 z-40" style={{ opacity: arrive }}>
      <div className="wrap flex h-[4.5rem] items-center justify-between">
        <a href="#top" className="display text-xl tracking-[0.32em]" aria-label={`${brand.name} — back to top`}>
          {brand.name}
        </a>

        <nav aria-label={menu.label} className="hidden lg:block">
          <ul className="flex items-center gap-10">
            {nav.map((n) => {
              const on = active === n.id
              return (
                <li key={n.id} className="relative">
                  <a
                    href={`#${n.id}`}
                    aria-current={on ? 'true' : undefined}
                    className={`label block py-2 transition-colors duration-300 hover:text-bone ${on ? 'text-bone!' : ''}`}
                  >
                    {n.label}
                  </a>
                  {on && (
                    <motion.span
                      layoutId="nav-indicator"
                      transition={spring.ui}
                      aria-hidden="true"
                      className="absolute inset-x-0 -bottom-0.5 h-px bg-ice"
                    />
                  )}
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <MagneticLink href="#reserve" className="max-lg:hidden py-2.5!">
            Register interest
          </MagneticLink>
          <button
            ref={btn}
            type="button"
            className="label relative z-[70] flex h-10 items-center gap-3 lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((o) => !o)}
          >
            <span>{open ? menu.close : menu.open}</span>
            <span aria-hidden="true" className="relative block h-3 w-6">
              <motion.span
                className="absolute left-0 top-0 h-px w-full bg-bone"
                animate={{ y: open ? 6 : 0, rotate: open ? 45 : 0 }}
                transition={spring.ui}
              />
              <motion.span
                className="absolute bottom-0 left-0 h-px w-full bg-bone"
                animate={{ y: open ? -5 : 0, rotate: open ? -45 : 0 }}
                transition={spring.ui}
              />
            </span>
          </button>
        </div>
      </div>
      <motion.div aria-hidden="true" className="h-px origin-left bg-ice/70" style={{ scaleX: progress }} />

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-label={menu.label}
            className="fixed inset-0 z-[60] flex flex-col justify-center bg-obsidian px-[var(--gutter)] lg:hidden"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: reduce ? 0 : duration.base, ease: ease.inOut }}
          >
            <ul className="flex flex-col gap-2">
              {[...nav, { id: 'reserve', label: 'Register interest' }].map((n, i) => (
                <li key={n.id} className="overflow-hidden">
                  <motion.a
                    href={`#${n.id}`}
                    onClick={() => setOpen(false)}
                    className="display flex items-baseline gap-5 py-2 text-5xl"
                    initial={{ y: '110%' }}
                    animate={{ y: 0 }}
                    transition={{ duration: reduce ? 0 : duration.slow, ease: ease.out, delay: reduce ? 0 : 0.15 + i * stagger.item }}
                  >
                    <span className="label text-ice!">{String(i + 1).padStart(2, '0')}</span>
                    {n.label}
                  </motion.a>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
