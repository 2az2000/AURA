import { useCallback, useState } from 'react'
import { IntroProvider } from './motion/intro'
import { RouterProvider } from './router'
import { hasWebGL, Shell } from './Shell'

/**
 * App = router + title-sequence clock + the persistent shell (canvas, background, overlays).
 * Routes: "/" (overview) and "/product" (the product film) — see src/router.tsx and src/Shell.tsx.
 */
export default function App() {
  // The 3D scene reports ready once; that starts the title sequence (see motion/intro.tsx).
  const [ready, setReady] = useState(!hasWebGL)
  const onReady = useCallback(() => setReady(true), [])
  return (
    <RouterProvider>
      <IntroProvider ready={ready}>
        <Shell onReady={onReady} sceneReady={ready} />
      </IntroProvider>
    </RouterProvider>
  )
}
