import { useRef, type ReactNode } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'

/**
 * Moves its children at a different rate from the page while they cross the
 * viewport. `speed` is the fraction of the element's own height it drifts
 * (positive = lags behind the scroll, negative = runs ahead). Transform only.
 */
export function Parallax({
  speed,
  children,
  className = '',
  ...rest
}: {
  speed: number
  children: ReactNode
  className?: string
} & React.AriaAttributes) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [`${-speed * 100}%`, `${speed * 100}%`])
  return (
    <motion.div ref={ref} className={className} style={reduce ? undefined : { y }} {...rest}>
      {children}
    </motion.div>
  )
}
