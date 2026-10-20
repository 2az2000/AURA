import { useMemo } from 'react'
import { motion, useReducedMotion, useTransform, type MotionValue } from 'motion/react'
import { distance, duration, ease, stagger } from './tokens'

/**
 * Word-by-word masked headline.
 *
 * Each word rises out of its own clipping box. Two drivers:
 *  - `trigger="view"` (default): plays once, when the headline enters the viewport.
 *  - `trigger={MotionValue}`: scrubbed by a 0→1 value (e.g. a slice of the title
 *    sequence). The value is spread across the words with a stagger.
 *
 * Reads as the full sentence to assistive tech (a visually-hidden copy); the animated
 * words are hidden from it. Under reduced motion the words are simply visible.
 */
export function MaskedText({
  lines,
  as: Tag = 'h2',
  className = '',
  id,
  trigger = 'view',
  delay = 0,
}: {
  /** One entry per visual line. */
  lines: readonly string[]
  as?: 'h1' | 'h2' | 'h3' | 'p'
  className?: string
  id?: string
  trigger?: 'view' | MotionValue<number>
  delay?: number
}) {
  const reduce = useReducedMotion()
  const words = useMemo(() => {
    let n = 0
    return lines.map((l) => l.split(' ').map((w) => ({ w, i: n++ })))
  }, [lines])
  const total = words.flat().length

  return (
    <Tag id={id} className={className}>
      {/* The animated words below are aria-hidden; this is the real text for assistive tech. */}
      <span className="sr-only">{lines.join(' ')}</span>
      {words.map((line, li) => (
        <span key={li} className="block" aria-hidden="true">
          {line.map(({ w, i }, wi) => (
            <span key={i} className="inline-block overflow-hidden pb-[0.14em] align-bottom -mb-[0.14em]">
              {typeof trigger === 'string' ? (
                <motion.span
                  className="inline-block"
                  initial={reduce ? false : { y: distance.mask }}
                  whileInView={{ y: 0 }}
                  viewport={{ once: true, margin: '0px 0px -12% 0px' }}
                  transition={{ duration: duration.slow, ease: ease.out, delay: delay + i * stagger.word }}
                >
                  {w}
                  {wi < line.length - 1 ? ' ' : ''}
                </motion.span>
              ) : (
                <ScrubbedWord progress={trigger} index={i} total={total}>
                  {w}
                  {wi < line.length - 1 ? ' ' : ''}
                </ScrubbedWord>
              )}
            </span>
          ))}
        </span>
      ))}
    </Tag>
  )
}

function ScrubbedWord({
  progress,
  index,
  total,
  children,
}: {
  progress: MotionValue<number>
  index: number
  total: number
  children: React.ReactNode
}) {
  // Each word owns a window of the 0→1 range, overlapping its neighbours.
  const span = 0.55
  const start = total > 1 ? (index / (total - 1)) * (1 - span) : 0
  const y = useTransform(progress, [start, start + span], [distance.mask, '0%'], { clamp: true })
  return (
    <motion.span className="inline-block" style={{ y }}>
      {children}
    </motion.span>
  )
}
