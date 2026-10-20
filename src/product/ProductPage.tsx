import { brand } from '../content/copy'
import type { SceneBridge } from '../story/hotspots'
import type { HotspotId } from '../story/storyboard'
import { ProductHeader, SceneRail } from './ProductChrome'
import { Arrival } from './scenes/Arrival'
import { Craft } from './scenes/Craft'
import { Finale } from './scenes/Finale'
import { Inspect } from './scenes/Inspect'
import { ProductForm } from './scenes/ProductForm'

/**
 * /product — "Discover AURA": an interactive product film in five scenes
 * (Arrival → Form → Craft → Inside → Close). Loaded lazily so the homepage never pays for it.
 */
export default function ProductPage({ bridge, onHotspot }: { bridge: SceneBridge; onHotspot: (id: HotspotId | null) => void }) {
  return (
    <>
      <ProductHeader />
      <SceneRail />
      <main id="product-main">
        <p className="sr-only">
          {brand.name} is shown as a three-dimensional wireless over-ear headphone. The camera starts on a close-up of
          the titanium face plate, pulls back, walks around the product, moves in on its materials, and lets you
          fly to individual components with a list of parts.
        </p>
        <Arrival />
        <ProductForm bridge={bridge} />
        <Craft />
        <Inspect onHotspot={onHotspot} />
        <Finale />
      </main>
    </>
  )
}
