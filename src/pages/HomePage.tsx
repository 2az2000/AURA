import { brand, type Finish } from '../content/copy'
import { Header } from '../components/Header'
import { HeroExplore } from '../components/HeroExplore'
import { Acoustics } from '../components/sections/Acoustics'
import { Anatomy } from '../components/sections/Anatomy'
import { Fit } from '../components/sections/Fit'
import { Form } from '../components/sections/Form'
import { Hero } from '../components/sections/Hero'
import { Materials } from '../components/sections/Materials'
import { Reserve } from '../components/sections/Reserve'
import { Silence } from '../components/sections/Silence'
import type { HotspotId } from '../story/storyboard'

/** The overview page ("/"): the brand film in eight sheets. */
export default function HomePage({
  finish,
  onFinish,
  hotspot,
  onHotspot,
}: {
  finish: Finish
  onFinish: (f: Finish) => void
  hotspot: HotspotId | null
  onHotspot: (id: HotspotId | null) => void
}) {
  return (
    <>
      <Header />
      <HeroExplore onHotspot={onHotspot} />
      <main>
        {/* Text alternative for the 3D scene, which is hidden from assistive tech. */}
        <p className="sr-only">
          {brand.name} is shown as a three-dimensional wireless over-ear headphone with a thin metal headband, oval
          cups, a dial and button on the front edge of each cup, and an ice-blue indicator ring. It rotates and
          separates into four layers as you scroll.
        </p>
        <Hero />
        <Silence />
        <Form />
        <Anatomy />
        <Materials finish={finish} onFinish={onFinish} hotspot={hotspot} onHotspot={onHotspot} />
        <Acoustics />
        <Fit hotspot={hotspot} onHotspot={onHotspot} />
        <Reserve />
      </main>
    </>
  )
}
