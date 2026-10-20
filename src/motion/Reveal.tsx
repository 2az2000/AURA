import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'
import { distance, duration, ease } from './tokens'

/**
 * Two small reveal grammars, deliberately different from each other and from
 * the masked headline, so the page doesn't repeat one fade everywhere:
 *  - <DrawRule/>  a hairline that draws itself left → right (structure appearing)
 *  - <ClipReveal/> a block wiped open from the top with a short settle (copy arriving)
 * Both play once when scrolled into view, and are static under reduced motion.
 */

export function DrawRule({
  className = '',
  delay = 0,
  origin = 'left',
}: {
  className?: string
  delay?: number
  origin?: 'left' | 'right'
}) {
  const reduce = useReducedMotion()
  return (
    <motion.span
      aria-hidden="true"
      className={`block h-px bg-silver/20 ${origin === 'left' ? 'origin-left' : 'origin-right'} ${className}`}
      initial={reduce ? false : { scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, margin: '0px 0px -8% 0px' }}
      transition={{ duration: duration.slow, ease: ease.out, delay }}
    />
  )
}

export function ClipReveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { clipPath: 'inset(0 0 100% 0)', y: distance.settle }}
      whileInView={{ clipPath: 'inset(0 0 -8% 0)', y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: duration.slow, ease: ease.out, delay }}
    >
      {children}
    </motion.div>
  )
}
