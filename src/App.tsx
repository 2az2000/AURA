import { lazy, Suspense, useState } from 'react'
import { brand, materials, type Finish } from './content/copy'
import { Header } from './components/Header'
import { Hero } from './components/sections/Hero'
import { Silence } from './components/sections/Silence'
import { Anatomy } from './components/sections/Anatomy'
import { Materials } from './components/sections/Materials'
import { Adaptive } from './components/sections/Adaptive'
import { Fit } from './components/sections/Fit'
import { Reserve } from './components/sections/Reserve'
import { StaticProduct } from './components/StaticProduct'
import { detectWebGL, useMediaQuery, usePrefersReducedMotion } from './hooks/useMediaQuery'

// The 3D stack is the heaviest part of the bundle; load it after the page shell has painted.
const Stage = lazy(() => import('./three/Stage'))

const hasWebGL = detectWebGL()

export default function App() {
  const [finish, setFinish] = useState<Finish>(materials.finishes[0])
  const reduced = usePrefersReducedMotion()
  const compact = useMediaQuery('(max-width: 767px)')

  return (
    <div className="grain">
      <a
        href="#silence"
        className="label fixed left-4 top-4 z-[60] -translate-y-20 bg-bone px-4 py-2 text-obsidian focus:translate-y-0"
      >
        Skip to content
      </a>

      {/* Atmosphere behind everything: a single cold pool of light under the product. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            'radial-gradient(60% 50% at 50% 46%, #1b1f26 0%, rgba(11,12,14,0) 70%), radial-gradient(120% 80% at 50% 120%, #14171c 0%, rgba(11,12,14,0) 60%)',
        }}
      />

      {hasWebGL ? (
        <Suspense fallback={null}>
          <Stage finish={finish} reduced={reduced} compact={compact} />
        </Suspense>
      ) : (
        <StaticProduct />
      )}

      <Header />

      <main>
        {/* Text alternative for the 3D scene, which is hidden from assistive tech. */}
        <p className="sr-only">
          {brand.name} is shown as a three-dimensional wireless over-ear headphone with a thin metal headband, oval
          cups and an ice-blue indicator ring. It rotates and separates into four layers as you scroll.
        </p>
        <Hero />
        <Silence />
        <Anatomy />
        <Materials finish={finish} onFinish={setFinish} />
        <Adaptive />
        <Fit />
        <Reserve />
      </main>

    </div>
  )
}
