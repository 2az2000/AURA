import { motion, useReducedMotion } from 'motion/react'
import { SHEETS } from '../content/copy'
import { duration, ease } from '../motion/tokens'

/**
 * The "sheet" frame: four corner registration marks and a title block, like the border of a
 * drawing sheet. Gives every section the same graphic anchor while the compositions inside differ.
 * The marks draw in when the sheet scrolls into view.
 */
export function SheetMarks({
  sheet,
  title,
  className = '',
}: {
  /** 0-based sheet number */
  sheet: number
  title: string
  className?: string
}) {
  const reduce = useReducedMotion()
  const corner = (pos: string, rot: string) => (
    <motion.span
      aria-hidden="true"
      className={`absolute size-4 border-silver/35 ${pos} ${rot}`}
      initial={reduce ? false : { opacity: 0, scale: 0.4 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: duration.slow, ease: ease.out }}
    />
  )
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-[var(--gutter)] inset-y-5 z-[3] portrait:inset-x-4 ${className}`}
    >
      {corner('left-0 top-0', 'border-l border-t')}
      {corner('right-0 top-0', 'border-r border-t')}
      {corner('left-0 bottom-0', 'border-l border-b')}
      {corner('right-0 bottom-0', 'border-r border-b')}
      <p className="label absolute bottom-0 left-6 text-[0.625rem] portrait:left-5">
        AURA · Concept 01 · Sheet {String(sheet).padStart(2, '0')} / {String(SHEETS - 1).padStart(2, '0')}
      </p>
      <p className="label absolute bottom-0 right-6 text-[0.625rem] portrait:hidden">{title} · Rev A</p>
    </div>
  )
}
