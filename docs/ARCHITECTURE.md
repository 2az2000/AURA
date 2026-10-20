# AURA — Architecture

## Stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · Three.js via `@react-three/fiber` +
`@react-three/drei` · Motion (`motion/react`). No other runtime dependencies; no state
library, no scroll-hijacking library (native scroll only).

## File map

```
src/
  main.tsx                 entry
  App.tsx                  page assembly + finish state + WebGL fallback
  styles/index.css         design tokens (@theme), type roles, grain, scrim
  content/copy.ts          ALL copy and the finish definitions
  lib/math.ts              clamp / lerp / smooth / damp
  hooks/useMediaQuery.ts   media-query, reduced-motion, WebGL detection
  components/
    Header.tsx             fixed nav + scroll progress hairline
    StaticProduct.tsx      SVG fallback when WebGL is unavailable
    sections/              one file per section (Hero … Reserve)
    ui/Reveal.tsx          LineReveal (masked headline), FadeUp
    ui/SectionHead.tsx     "01 — SILENCE" label
  three/
    Stage.tsx              fixed <Canvas>, studio lighting, Rig (scroll → model), label overlay
    Headphone.tsx          the procedural model (geometry + materials + exploded view)
    storyboard.ts          per-section poses (THE file to edit to re-direct the camera)
    useStory.ts            scroll position → interpolated pose
    textures.ts            procedural brushed-metal and weave textures
```

## How the page and the 3D scene stay in sync

```
 z-index  layer
   0      background typography (hero wordmark) + page gradient
   1      <Stage/>  — fixed full-screen WebGL canvas, pointer-events: none
   2      sections / header / footer (the real, selectable, accessible HTML)
```

1. Every section has `data-shot="<id>"`. `useStory` measures the centre of each such
   element (re-measured on resize / font load).
2. Every frame, `Rig` (in `Stage.tsx`) asks `useStory().sample()` for the pose at the
   current scroll position. The pose is interpolated between the two sections either side
   of the viewport centre, holding ~25% at each end.
3. `Rig` damps the live values toward that pose and writes them straight onto the
   Three.js group (position, scale, rotation) and to a small `drive` ref
   (`explode`, `glow`) that `Headphone` reads. **React never re-renders on scroll.**
4. `storyboard.ts` has two arrays (`shotsWide`, `shotsTall`); the tall one is used when
   the viewport is portrait. Positions are fractions of the viewport, so they survive any
   screen size. In portrait the scale is additionally multiplied by `viewport.width / 3`.

### The model

`Headphone.tsx` builds everything from primitives: a tube for the band, `LatheGeometry`
for the cup shell / face plate / driver cone, tori for pads and rings. Conventions are in
the file header. The right cup is built once and mirrored with `scale.x = -1`.

Exploded view: each cup part has a travel distance (`PART_TRAVEL`); `explode` (0→1) from
the storyboard slides them along the cup axis. The yoke travels with the chassis.

### Exploded-view labels

The four labels live in `Stage.tsx` as normal DOM. Each frame `Rig` projects an anchor on
the corresponding part to screen space and sets a `transform`. (drei's `<Html>` was tried
and dropped — see `RESEARCH.md`.)

## Accessibility

- Canvas layer is `aria-hidden`; a visually-hidden paragraph describes the 3D scene.
- Real heading hierarchy (`h1` in hero, `h2` per section, `h3` for spec table).
- Finish switcher is a native radio group (arrow keys work, focus ring visible).
- Skip link, visible focus ring (`:focus-visible`), semantic lists/definition lists.
- `prefers-reduced-motion`: no idle motion, no pointer parallax, no intro/reveal
  animation, fast (near-instant) pose changes, noise diagram becomes static & cancelled.
- Colour contrast: body `silver` and labels `mist` on `obsidian` are above WCAG AA.

## Performance notes

- 3D code is lazy-loaded (`React.lazy`) in its own chunk (~270 kB gzip incl. Three, R3F and drei);
  the shell (React + Motion + CSS, ~130 kB gzip) paints first. There are zero image/model/HDRI downloads.
- Geometry and materials are created once; per-frame work is a few matrix writes.
- `Environment` is rendered a single time (`frames={1}`).
- `PerformanceMonitor` lowers the device pixel ratio when the frame rate drops.
- Cup segments are 96 (lathe) — drop these in `lathe()` / torus args if you need to cut
  geometry for low-end devices.
- Fonts are self-hosted, variable, latin subset loaded on demand by the browser.
