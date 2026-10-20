import { useRef, type ReactNode } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import { useRouter } from '../router'
import { magnet, spring } from './tokens'

type Variant = 'solid' | 'outline'

/**
 * The AURA button / link. One component so every action behaves the same:
 *  - magnetic pull toward the pointer (mouse only — touch and keyboard are unaffected)
 *  - press feedback (scale down, springs back)
 *  - label "roll" on hover and keyboard focus (CSS, compositor-only)
 *  - a fill that sweeps up from the bottom edge (outline variant)
 * Renders an <a> when given `href`, otherwise a <button>.
 */
export function MagneticLink({
  children,
  href,
  onClick,
  type,
  variant = 'outline',
  className = '',
  ...aria
}: {
  children: ReactNode
  href?: string
  onClick?: () => void
  type?: 'button' | 'submit'
  variant?: Variant
  className?: string
} & React.AriaAttributes) {
  const ref = useRef<HTMLElement | null>(null)
  const { go } = useRouter()
  const reduce = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, spring.magnet)
  const sy = useSpring(y, spring.magnet)

  const move = (e: React.PointerEvent) => {
    if (reduce || e.pointerType !== 'mouse' || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width / 2)) * magnet.strength)
    y.set((e.clientY - (r.top + r.height / 2)) * magnet.strength)
  }
  const leave = () => {
    x.set(0)
    y.set(0)
  }

  const base =
    'group relative inline-flex items-center gap-3 overflow-hidden px-6 py-3.5 label text-bone select-none ' +
    (variant === 'solid'
      ? 'bg-bone text-obsidian!'
      : 'border border-silver/30 transition-colors duration-300 hover:border-ice')

  const inner = (
    <>
      {variant === 'outline' && (
        <span
          aria-hidden="true"
          className="absolute inset-0 origin-bottom scale-y-0 bg-ice transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-y-100 group-focus-visible:scale-y-100"
        />
      )}
      <span className="relative inline-block overflow-hidden">
        <span
          className={`block transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:-translate-y-full group-focus-visible:-translate-y-full ${variant === 'outline' ? 'group-hover:text-obsidian' : ''}`}
        >
          {children}
        </span>
        <span
          aria-hidden="true"
          className={`absolute inset-0 block translate-y-full transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-y-0 group-focus-visible:translate-y-0 ${variant === 'outline' ? 'text-obsidian' : ''}`}
        >
          {children}
        </span>
      </span>
      <span
        aria-hidden="true"
        className={`relative transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-1 ${variant === 'outline' ? 'group-hover:text-obsidian' : ''}`}
      >
        →
      </span>
    </>
  )

  const common = {
    ref: (el: HTMLElement | null) => {
      ref.current = el
    },
    className: `${base} ${className}`,
    style: { x: sx, y: sy },
    onPointerMove: move,
    onPointerLeave: leave,
    whileTap: reduce ? undefined : { scale: 0.96 },
    // internal paths ("/product", "/#reserve") go through the router so the canvas persists
    ...(href && href.startsWith('/')
      ? {
          onClick: (e: React.MouseEvent) => {
            if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
            e.preventDefault()
            go(href)
          },
        }
      : {}),
    ...aria,
  }

  return href ? (
    <motion.a href={href} {...common}>
      {inner}
    </motion.a>
  ) : (
    <motion.button type={type ?? 'button'} onClick={onClick} {...common}>
      {inner}
    </motion.button>
  )
}
