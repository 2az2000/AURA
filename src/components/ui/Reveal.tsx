import { motion, useReducedMotion } from 'motion/react'
import type { ElementType, ReactNode } from 'react'

const EASE = [0.16, 1, 0.3, 1] as const

/**
 * Masked line-by-line headline reveal. Each line slides up from behind its
 * own clipping box — the standard "editorial" reveal, and cheap (transform only).
 */
export function LineReveal({
  lines,
  as: Tag = 'h2',
  className = '',
  delay = 0,
  id,
}: {
  lines: readonly string[]
  id?: string
  as?: ElementType
  className?: string
  delay?: number
}) {
  const reduce = useReducedMotion()
  return (
    <Tag id={id} className={className} aria-label={lines.join(' ')}>
      {lines.map((line, i) => (
        <span key={line} className="block overflow-hidden pb-[0.08em] -mb-[0.08em]" aria-hidden="true">
          <motion.span
            className="block"
            initial={reduce ? false : { y: '108%' }}
            whileInView={{ y: 0 }}
            viewport={{ once: true, margin: '0px 0px -12% 0px' }}
            transition={{ duration: 1.1, ease: EASE, delay: delay + i * 0.09 }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  )
}

/** Simple fade + rise for supporting copy. */
export function FadeUp({
  children,
  delay = 0,
  className = '',
  as = 'div',
}: {
  children: ReactNode
  delay?: number
  className?: string
  as?: 'div' | 'p' | 'li' | 'dl' | 'ul' | 'form'
}) {
  const reduce = useReducedMotion()
  const M = motion[as] as typeof motion.div
  return (
    <M
      className={className}
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </M>
  )
}
