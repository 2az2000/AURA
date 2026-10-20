# AURA — Architecture

## Stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · Three.js via `@react-three/fiber` + `@react-three/drei` ·
Motion (`motion/react`). No other runtime dependencies: no state library, no scroll-hijacking library, no GSAP
(Motion + a small hand-written spring cover every need; see `REDESIGN_AUDIT.md` §6).

## Routing and the persistent shell

`App` = `RouterProvider` → `IntroProvider` → `Shell`. `src/router.tsx` holds the route (`home` | `product`), navigates with the History API,
and plays a curtain between routes. `Shell` owns everything that must survive a route change — shader background, light pools, the lazy
`Stage` (WebGL), `Overlays`, `Hotspots`, `PreLoader` and shared state — and renders `HomePage` or the lazy `ProductPage` inside it.
On a route change `Shell` calls `story.configure(...)` with that page's storyboard (bumping `story.epoch`, which makes the Rig snap to
the new first pose) and replays the title sequence. The product page's arrival uses the Rig's `macro` style (the homepage uses `spin`).

## File map

```
src/
  main.tsx                    entry; sets html[data-webgl]
  App.tsx                     router + intro clock + shell
  router.tsx                  tiny History API router, curtain transition, <Link>
  Shell.tsx                   persistent canvas/background/overlays; swaps pages per route
  pages/HomePage.tsx          the overview
  product/                    the /product film (lazy): ProductPage, scenes/, ProductChrome, productStory, lazy
  styles/index.css            design tokens (@theme), type roles, layers, hotspot + grain CSS
  content/copy.ts             ALL copy, finishes, hotspot text
  lib/math.ts · lib/spring.ts clamp/lerp/damp · per-frame spring + "still moving?" test
  hooks/useMediaQuery.ts      media queries, WebGL detection
  motion/                     THE MOTION SYSTEM (see MOTION_SPEC.md)
    tokens.ts                 durations, easings, springs, stagger, parallax, magnet, intro timing
    intro.tsx                 title-sequence clock (IntroProvider, useIntroSegment)
    MaskedText.tsx            word-by-word masked headline (view- or value-driven)
    ScrollWords.tsx           scroll-read paragraph
    Reveal.tsx                DrawRule, ClipReveal
    Parallax.tsx              layer drifting at its own rate
    MagneticLink.tsx          the button/link: magnet, press, label roll, fill sweep
  background/
    FieldCanvas.tsx           shader background (light pool, beam, frequency lines, contours, dust)
    fieldShader.ts            the GLSL
  graphics/                   custom graphic kit (see MOTION_SPEC §11)
    OrbitRing · SheetMarks · Overlays (axis + sound rings) · WaveRibbon · Spectrum · CancelDiagram
    OrthoSheet (front/profile/plan drawings) · MaterialStudies (WebGL panels) · HotspotLink
  story/
    storyboard.ts             per-shot product pose + background character (THE file to re-direct the camera)
    store.ts                  scroll → pose + active shot + hotspot weights (plain module state)
    hotspots.ts               hotspot ids + SceneBridge type (no three imports — keeps the 3D bundle lazy)
  components/
    Header.tsx                nav with sliding indicator, scroll hairline, mobile menu
    Atmosphere.tsx            floor vignette, two light pools, pointer glow
    Hotspots.tsx              DOM markers the Rig positions
    StaticProduct.tsx         SVG fallback when WebGL is unavailable
    PreLoader.tsx             real-state loading counter
    sections/                 Hero, Silence, Form, Anatomy (pinned), Materials, Acoustics, Fit, Reserve
    ui/                       SectionHead, SectionNumeral, DragZone
  three/                      lazy-loaded 3D bundle
    Stage.tsx                 <Canvas>, lighting cards, quality tier wiring
    Rig.tsx                   per-frame driver (pose, springs, intro, projection, render-on-demand)
    Headphone.tsx             procedural model + exploded view + hotspot anchors
    quality.ts                tiers and detection
    textures.ts               procedural brushed-metal / weave textures
```

## Layers

```
 z   layer
  0  Atmosphere (vignette, light pools, pointer glow) + background type (hero wordmark, section numerals)
  1  <Stage/>  fixed WebGL canvas, pointer-events: none
  2  mobile scrim (gradient behind copy on phones)
  3  content (.layer-fg): the real, selectable, accessible HTML
  4  Hotspots overlay (markers are the only pointer-active part)
 40  Header          50 grain          60 mobile menu / skip link
```

Sections are deliberately **not** stacking contexts (no `z-index` on `<section>`), so a section's numeral (z0) sits
behind the canvas while its text (z3) sits in front.

## How the page and the 3D scene stay in sync

1. Elements with `data-shot="<id>"` are the storyboard's anchors. `story/store.ts` measures their centres (re-measured on
   resize / font load) and, on each rAF-throttled scroll, computes: the interpolated **pose**, the **active shot id**,
   and per-**hotspot weights**.
2. The `Rig` (inside the Canvas) reads `story.pose` every rendered frame, damps toward it, adds springs (pointer parallax,
   drag, lamp), the intro arrival and idle sway, and writes the result to the Three.js group. The model rotates and
   scales about a **focus point** (`fx`) so individual parts can be centred in frame.
3. The Rig also projects hotspot anchors and the light pool to screen space and writes them to DOM elements supplied via
   the `SceneBridge` (refs created by `<Hotspots/>` and `<Atmosphere/>`). **React never re-renders per frame.**
4. DOM UI that depends on the current section (nav indicator, anatomy panel, current label) subscribes to the store's
   `activeId` with `useSyncExternalStore` — it works even without WebGL.
5. `storyboard.ts` has two arrays (`shotsWide`, `shotsTall`); the tall one is used in portrait. Order must match the DOM.

### On-demand rendering

The canvas uses `frameloop="demand"`. `Rig` calls `invalidate()` only while something is moving (see `PERFORMANCE.md` §2);
scroll, pointer, resize and finish changes wake it. Any new animated value in 3D must keep requesting frames until it settles.

### The title sequence

`motion/intro.tsx` owns one MotionValue (0→1 over 2.7 s). DOM elements read slices with `useIntroSegment`; the Rig reads
the same value for light, dolly, spin-in and ring ignition. It starts when the scene reports its first frames (or after
2.2 s), is skipped by any input, and is simply complete under reduced motion.

### The model

`Headphone.tsx` builds everything from primitives (lathe, tube, torus, capsule). Conventions are in the file header.
The right cup is built once and mirrored. Exploded view: each part travels along the cup axis by
`explode × PART_TRAVEL[part]`; the yoke travels with the chassis. `solo` collapses the far cup and the headband for
per-part focus shots. Hotspot anchors are registered with `reg(id, offset, normal)`; the normal lets the overlay fade a
hotspot when its surface faces away from the camera.

### The pinned Anatomy section

A 4.2-screen-tall wrapper with a `position: sticky` 100 svh panel and five invisible steps, each a storyboard shot.
Normal scrolling scrubs through them; rows, labels and the mobile stepper jump to steps. See `MOTION_SPEC.md` §5.

## Accessibility

- Canvas layer `aria-hidden`; a visually-hidden paragraph describes the scene.
- Real heading hierarchy; animated headline words are `aria-hidden` copies beside a visually-hidden original.
- Finish switcher is a native radio group; notes/spec rows tied to hotspots are buttons with `aria-pressed`; hidden hotspots are `inert`.
- Skip link, visible focus ring, focus-trapped mobile menu with Esc and focus return, scroll lock while open.
- `prefers-reduced-motion`: see `MOTION_SPEC.md` §8.
- axe-core: 0 violations on the production build (desktop viewport).

## Performance

See `PERFORMANCE.md`.
