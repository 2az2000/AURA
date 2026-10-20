import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { hero } from '../../content/copy'
import { useIntroSegment } from '../../motion/intro'

/**
 * An invisible area over the product where pointer-dragging rotates it (handled by the
 * Rig, which looks for `[data-drag-zone]`). Vertical swipes still scroll the page on touch.
 * The hint disappears after the first drag attempt. Keyboard users lose nothing: this is
 * pure enhancement, and the product's story does not depend on it.
 */
export function DragZone({ className = '', hint = false }: { className?: string; hint?: boolean }) {
  const [used, setUsed] = useState(false)
  const arrive = useIntroSegment(2.2, 2.7)
  useEffect(() => {
    if (!hint) return
    const on = (e: PointerEvent) => (e.target as HTMLElement | null)?.closest?.('[data-drag-zone]') && setUsed(true)
    window.addEventListener('pointerdown', on, { once: true })
    return () => window.removeEventListener('pointerdown', on)
  }, [hint])

  return (
    <div data-drag-zone aria-hidden="true" className={`absolute z-[3] ${className}`}>
      {hint && (
        <motion.p
          style={{ opacity: arrive }}
          className="label absolute inset-x-0 bottom-0 flex items-center justify-center gap-3"
        >
          <span className={`flex items-center gap-3 transition-opacity duration-700 ${used ? 'opacity-0' : 'opacity-70'}`}>
            <span aria-hidden="true">←</span>
            {hero.drag}
            <span aria-hidden="true">→</span>
          </span>
        </motion.p>
      )}
    </div>
  )
}
