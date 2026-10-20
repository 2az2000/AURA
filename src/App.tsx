import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { brand, materials, type Finish } from './content/copy'
import { Atmosphere } from './components/Atmosphere'
import { Header } from './components/Header'
import { Hotspots } from './components/Hotspots'
import { StaticProduct } from './components/StaticProduct'
import { Adaptive } from './components/sections/Adaptive'
import { Anatomy } from './components/sections/Anatomy'
import { Fit } from './components/sections/Fit'
import { Hero } from './components/sections/Hero'
import { Materials } from './components/sections/Materials'
import { Reserve } from './components/sections/Reserve'
import { Silence } from './components/sections/Silence'
import { detectWebGL } from './hooks/useMediaQuery'
import { IntroProvider, useIntro } from './motion/intro'
import { story } from './story/store'
import type { HotspotId } from './story/storyboard'
import type { SceneBridge } from './story/hotspots'

// The 3D stack is the heaviest part of the bundle; load it after the page shell has painted.
const Stage = lazy(() => import('./three/Stage'))

const hasWebGL = detectWebGL()

function Page({ onReady }: { onReady: () => void }) {
  const [finish, setFinish] = useState<Finish>(materials.finishes[0])
  const [hotspot, setHotspot] = useState<HotspotId | null>(null)
  const [lost, setLost] = useState(false)
  const reduced = !!useReducedMotion()
  const { progress } = useIntro()
  // DOM elements the 3D rig writes into every frame (hotspots, light pools).
  const bridge = useRef<SceneBridge>({ hotspots: {}, poolNeutral: null, poolCool: null })
  const webgl = hasWebGL && !lost
  const onLost = useCallback(() => {
    document.documentElement.dataset.webgl = 'false'
    setLost(true)
  }, [])

  useEffect(() => {
    story.init()
  }, [])

  return (
    <div className="grain">
      <a
        href="#silence"
        className="label fixed left-4 top-4 z-[60] -translate-y-20 bg-bone px-4 py-2 text-obsidian focus:translate-y-0"
      >
        Skip to content
      </a>

      <Atmosphere bridge={bridge.current} staticFallback={!webgl} />

      {webgl ? (
        <Suspense fallback={null}>
          <Stage
            finish={finish}
            reduced={reduced}
            introProgress={progress}
            bridge={bridge.current}
            onReady={onReady}
            onLost={onLost}
          />
        </Suspense>
      ) : (
        <StaticProduct />
      )}

      {webgl && <Hotspots bridge={bridge.current} active={hotspot} onActive={setHotspot} reduced={reduced} />}

      <Header />

      <main>
        {/* Text alternative for the 3D scene, which is hidden from assistive tech. */}
        <p className="sr-only">
          {brand.name} is shown as a three-dimensional wireless over-ear headphone with a thin metal headband, oval
          cups, a dial and button on the front edge of each cup, and an ice-blue indicator ring. It rotates and
          separates into four layers as you scroll.
        </p>
        <Hero />
        <Silence />
        <Anatomy />
        <Materials finish={finish} onFinish={setFinish} hotspot={hotspot} onHotspot={setHotspot} />
        <Adaptive />
        <Fit hotspot={hotspot} onHotspot={setHotspot} />
        <Reserve />
      </main>
    </div>
  )
}

export default function App() {
  // The 3D scene reports ready once; that starts the title sequence (see motion/intro.tsx).
  const [ready, setReady] = useState(!hasWebGL)
  const onReady = useCallback(() => setReady(true), [])
  return (
    <IntroProvider ready={ready}>
      <Page onReady={onReady} />
    </IntroProvider>
  )
}
