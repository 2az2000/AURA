import { useEffect, useState, type KeyboardEvent } from 'react'
import { motion } from 'motion/react'
import { hero } from '../../content/copy'
import { tools } from '../../content/play'
import { useIntroSegment } from '../../motion/intro'
import { play, usePlay } from '../../play/store'

/**
 * An area over the product where pointer-dragging rotates it (handled by the Rig, which looks for
 * `[data-drag-zone]`). Vertical swipes still scroll the page on touch; a mouse can also tilt it.
 * The view stays where the visitor leaves it until Reset or until the story moves on.
 *
 * `slider` makes the zone keyboard-operable (a real slider: ← → turn it by 15°, Home resets) so the
 * interaction is not pointer-only. The hint disappears after the first drag attempt.
 */
export function DragZone({ className = '', hint = false, slider = false }: { className?: string; hint?: boolean; slider?: boolean }) {
  const [used, setUsed] = useState(false)
  const arrive = useIntroSegment(2.2, 2.7)
  const yaw = usePlay((s) => s.yaw)
  useEffect(() => {
    if (!hint) return
    const on = (e: PointerEvent) => (e.target as HTMLElement | null)?.closest?.('[data-drag-zone]') && setUsed(true)
    window.addEventListener('pointerdown', on, { once: true })
    return () => window.removeEventListener('pointerdown', on)
  }, [hint])

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') play.nudge(-Math.PI / 12)
    else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') play.nudge(Math.PI / 12)
    else if (e.key === 'Home' || e.key === 'Escape') play.resetView()
    else return
    e.preventDefault()
    setUsed(true)
  }

  const a11y = slider
    ? {
        role: 'slider' as const,
        tabIndex: 0,
        'aria-label': tools.rotate,
        'aria-valuemin': 0,
        'aria-valuemax': 355,
        'aria-valuenow': yaw,
        'aria-valuetext': `${yaw} degrees`,
        onKeyDown: onKey,
      }
    : { 'aria-hidden': true as const }

  return (
    <div data-drag-zone {...a11y} className={`absolute z-[3] ${className}`}>
      {hint && (
        <motion.p
          aria-hidden="true"
          style={{ opacity: arrive }}
          className="label pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-center gap-3"
        >
          <span className={`flex items-center gap-3 transition-opacity duration-700 ${used ? 'opacity-0' : 'opacity-85'}`}>
            <span aria-hidden="true">←</span>
            {hero.drag}
            <span aria-hidden="true">→</span>
          </span>
        </motion.p>
      )}
    </div>
  )
}
