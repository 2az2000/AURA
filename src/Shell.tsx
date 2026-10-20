import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { materials, type Finish } from './content/copy'
import { FieldCanvas } from './background/FieldCanvas'
import { Atmosphere } from './components/Atmosphere'
import { Hotspots } from './components/Hotspots'
import { PreLoader } from './components/PreLoader'
import { StaticProduct } from './components/StaticProduct'
import { Overlays } from './graphics/Overlays'
import { detectWebGL } from './hooks/useMediaQuery'
import { useIntro } from './motion/intro'
import { prefetchProduct, ProductPage } from './product/lazy'
import { productShotsTall, productShotsWide } from './product/productStory'
import { useRouter } from './router'
import type { SceneBridge } from './story/hotspots'
import { story } from './story/store'
import { shotsTall, shotsWide, type HotspotId } from './story/storyboard'
import HomePage from './pages/HomePage'

// The 3D stack is the heaviest part of the bundle; load it after the page shell has painted.
export const hasWebGL = detectWebGL()
const stageImport = hasWebGL ? import('./three/Stage') : Promise.resolve(null)
const Stage = lazy(() => stageImport as Promise<typeof import('./three/Stage')>)


const TITLES = { home: 'AURA — Silence, engineered.', product: 'Discover AURA — product film' } as const

/**
 * The persistent shell. Everything that must survive a route change lives here: the shader background,
 * the light pools, the WebGL canvas, the hotspot/overlay layers and shared interaction state. A route
 * only swaps the page content and installs that page's storyboard, so the product never "reloads":
 * on navigation it keeps its place and the next page's arrival plays.
 */
export function Shell({ onReady, sceneReady }: { onReady: () => void; sceneReady: boolean }) {
  const { route, swaps } = useRouter()
  const { progress, replay } = useIntro()
  const reduced = !!useReducedMotion()
  const [finish, setFinish] = useState<Finish>(materials.finishes[0])
  const [hotspot, setHotspot] = useState<HotspotId | null>(null)
  const [lost, setLost] = useState(false)
  // real loading states for the PreLoader
  const [fonts, setFonts] = useState(false)
  const [chunk, setChunk] = useState(!hasWebGL)
  const bridge = useRef<SceneBridge>({
    hotspots: {},
    poolNeutral: null,
    poolCool: null,
    orbit: null,
    axis: null,
    rings: null,
    light: { x: 0.5, y: 0.5 },
    stats: { rotY: 0, rotX: 0, scale: 1 },
  })
  const webgl = hasWebGL && !lost
  const onLost = useCallback(() => {
    document.documentElement.dataset.webgl = 'false'
    setLost(true)
  }, [])

  useEffect(() => {
    document.fonts?.ready.then(() => setFonts(true))
    stageImport.then(() => setChunk(true))
    // warm the product chunk when the browser is idle
    const idle = (window as Window & { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback
    const t = idle ? idle(prefetchProduct) : window.setTimeout(prefetchProduct, 2500)
    return () => {
      if (!idle) window.clearTimeout(t)
    }
  }, [])

  // install this route's storyboard before its sections are measured
  useLayoutEffect(() => {
    if (route === 'product') story.configure(productShotsWide, productShotsTall, 'macro')
    else story.configure(shotsWide, shotsTall, 'spin')
    setHotspot(null)
    document.title = TITLES[route]
    story.init()
  }, [route])

  // a completed route swap replays the title sequence on the new page
  useEffect(() => {
    if (swaps > 0) replay()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [swaps])

  return (
    <div className="grain">
      <a
        href={route === 'product' ? '#scene-arrival' : '#silence'}
        className="label fixed left-4 top-4 z-[60] -translate-y-20 bg-bone px-4 py-2 text-obsidian focus:translate-y-0"
      >
        Skip to content
      </a>

      <FieldCanvas bridge={bridge.current} />
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

      {webgl && <Overlays bridge={bridge.current} />}
      {webgl && <Hotspots bridge={bridge.current} active={hotspot} onActive={setHotspot} reduced={reduced} />}

      <PreLoader fonts={fonts} chunk={chunk} scene={sceneReady || !webgl} />

      {route === 'product' ? (
        <Suspense fallback={null}>
          <ProductPage bridge={bridge.current} onHotspot={setHotspot} />
        </Suspense>
      ) : (
        <HomePage finish={finish} onFinish={setFinish} hotspot={hotspot} onHotspot={setHotspot} />
      )}
    </div>
  )
}
