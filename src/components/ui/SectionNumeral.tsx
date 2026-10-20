import { Parallax } from '../../motion/Parallax'
import { parallax } from '../../motion/tokens'

/**
 * Oversized outlined section number on its own depth layer (z0, behind the 3D canvas).
 * It drifts at a different rate from both the page and the product, which is what
 * separates the layers in space as you scroll.
 */
export function SectionNumeral({ n, className = '' }: { n: string; className?: string }) {
  return (
    // The clip box keeps the numeral inside its own section while it drifts.
    <div aria-hidden="true" className="layer-bg pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <Parallax speed={parallax.numeral} className={`absolute ${className}`}>
        <span className="numeral block">{n}</span>
      </Parallax>
    </div>
  )
}
