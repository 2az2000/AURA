import { useMemo, useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'motion/react'
import { scrub } from './tokens'

/**
 * A paragraph that is "read" by scrolling: each word brightens in turn as the
 * paragraph travels up the viewport. It is the manifesto's pacing device — the
 * reader's scroll speed becomes reading speed.
 * Unread words are `mist` (AA contrast), read words brighten to `bone`.
 * Under reduced motion every word is fully lit from the start.
 */
export function ScrollWords({ text, className = '' }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: scrub.words as unknown as ['start 82%', 'end 52%'] })
  const words = useMemo(() => text.split(' '), [text])

  return (
    <p ref={ref} className={className}>
      {words.map((w, i) => (
        <Word key={i} progress={scrollYProgress} index={i} total={words.length} lit={!!reduce}>
          {w}
        </Word>
      ))}
    </p>
  )
}

function Word({
  progress,
  index,
  total,
  lit,
  children,
}: {
  progress: MotionValue<number>
  index: number
  total: number
  lit: boolean
  children: React.ReactNode
}) {
  const start = (index / total) * 0.85
  const opacity = useTransform(progress, [start, start + 0.15], [0, 1], { clamp: true })
  // Two stacked copies: a `mist` base (passes AA contrast on its own) and a `bone` copy whose
  // opacity is scrubbed. Opacity-only, and the unread state is never below AA contrast.
  return (
    <>
      <span className="relative inline-block text-mist">
        {children}
        <motion.span
          aria-hidden="true"
          className="absolute inset-0 text-bone"
          style={lit ? { opacity: 1 } : { opacity }}
        >
          {children}
        </motion.span>
      </span>{' '}
    </>
  )
}
