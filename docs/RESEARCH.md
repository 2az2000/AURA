# AURA — Research notes

What was researched, what was learned, and which decision each finding changed.
Written for whoever maintains the project next, so it stays honest about limits.

## Method and limits

- Sources were read through a text-extracting fetch tool and web search. That is good
  for documentation, licences and written case studies. It is **not** good for judging
  motion, easing, or how an interactive site *feels*. No claim below about a site's
  motion comes from watching it run; those come from the studio's own written
  description. Before a public launch, someone should review the references below
  in a real browser (desktop and phone) and compare.
- Visual-direction work (see [ART_DIRECTION.md](./ART_DIRECTION.md)) was validated by
  rendering the real page in headless Chromium with a software GL driver and reviewing
  screenshots, not by theory.

## Design references

| Reference | URL | Why it is useful | What AURA took from it |
|---|---|---|---|
| Awwwards — Site of the Month write-up for a premium earbud product page | https://awwwards.com/airpods-pro-wins-site-of-the-month-january.html | The studio describes one continuous scroll movement inside a **fixed frame**, using light/shadow and strong black/white contrast to express a product idea. They dropped scrubbable video because it was unreliable across browsers and devices, and loaded assets progressively. | The product lives in one fixed WebGL layer while the page scrolls past it (`three/Stage.tsx`). The story is a single continuous camera/model movement (`three/storyboard.ts`). Contrast is carried by one cold accent on a black scene. We avoided video/frame sequences entirely: the model is real-time, so there is nothing heavy to download. |
| Awwwards — scrolling and 3D inspiration | https://www.awwwards.com/ | Index of award-level scroll stories (e.g. 3D hero-on-scroll and storytelling-scroll entries surfaced by search). | Confirms the pattern: **a persistent 3D subject + discrete "landing" moments per section**, rather than constant drift. This became the hold-and-ease behaviour in `useStory.ts` (the product holds ~25% at each end of a section, eases across the middle). |
| Godly | https://godly.website/ | Curated gallery of editorial, type-led sites. | Reference for oversized typography and asymmetric layout used instead of card grids. |
| Behance / Dribbble / FWA | https://www.behance.net/ · https://dribbble.com/ · https://thefwa.com/ | Breadth of product-presentation approaches. | Used as a check against the anti-generic list: no glass cards, no gradient-blob heroes. |

Review of these galleries is a skim of listings, not a teardown of individual
interactive pages (see limits above).

## Technical references (official documentation actually read)

| Topic | URL | Finding | Decision |
|---|---|---|---|
| R3F performance | https://r3f.docs.pmnd.rs/advanced/scaling-performance | Share geometry/materials; keep draw calls low; use `PerformanceMonitor` to adapt DPR; avoid re-rendering React for per-frame work. | Geometry and materials are created once (`useMemo`). All per-frame motion mutates Three objects in `useFrame`, never React state. `PerformanceMonitor` lowers DPR from 1.75 to 1 when frames drop. |
| drei `Environment` | https://drei.docs.pmnd.rs/staging/environment | Children are rendered once into an off-screen cube camera; keep `resolution` low if live; don't use `preset` in production (CDN dependency). | Studio lighting is built from `Lightformer` cards rendered one time (`frames={1}`). No HDRI file or CDN request. |
| Poly Haven licence | https://polyhaven.com/license | Assets are CC0 (public domain), commercial use allowed, attribution optional. Site text/logos are *not* CC0. | Not needed in the end — procedural lighting avoids the dependency — but it is the recommended source if you later swap in a real HDRI. |
| Motion `useScroll` | https://motion.dev/docs/react-use-scroll | Returns motion values (not state); can use hardware-accelerated ScrollTimeline; use state only when UI must change. | The header progress bar and the noise-cancelling diagram read scroll as motion values. The 3D rig reads `window.scrollY` directly in the render loop — no React updates on scroll. |
| Space Grotesk licence | https://github.com/floriankarsten/space-grotesk · https://www.fontsquirrel.com/license/spacegrotesk | SIL Open Font License 1.1: commercial use, modification and redistribution allowed; keep the licence with redistributed files. | Self-hosted via `@fontsource-variable/*` (OFL packages include the licence). Credited in the footer. |
| Three.js, React, Vite, TypeScript, Tailwind | https://threejs.org/docs/ · https://react.dev/ · https://vite.dev/ · https://www.typescriptlang.org/ · https://tailwindcss.com/docs | Standard stack. Installed versions are in `package.json` (React 19, Vite 8, Three 0.186, R3F 9, drei 10, Motion 14, Tailwind 4, TypeScript 7). | Tailwind v4 `@theme` tokens in CSS rather than a JS config. |

## Findings that changed the build

1. **Unlayered CSS beats Tailwind utilities.** Tailwind v4 puts utilities in a cascade
   layer; plain CSS outside a layer wins regardless of specificity. A first version of
   the hero broke because `.layer-bg { position: relative }` silently overrode
   `absolute`. All custom classes now live in `@layer components`.
2. **Near-black base colours make metal look dead.** Metal reflects its environment
   *tinted by its base colour*, so a `#16181c` metal reflects almost nothing. The
   "obsidian" look is a lower-metalness shell with a clear-coat (it picks up the light
   cards) plus a lighter dark-titanium for machined parts.
3. **Drei `<Html>` was dropped.** Anchoring DOM to 3D through `Html` produced a React
   "unmount a root while rendering" error under StrictMode, so labels are plain DOM
   elements positioned by projecting anchor points each frame (`Stage.tsx`, `Rig`).
4. **No external 3D asset.** Searching Sketchfab / Poly Haven for a headphone model was
   considered and rejected: a downloaded model brings licence/attribution baggage,
   unknown topology and a look the brand doesn't own. A procedural model is fully
   original, tiny (zero bytes of model data), and every part can be animated for the
   exploded view.

## Not done / open questions

- No real-device profiling (only software-rendered headless Chromium). Test on a
  mid-range Android phone before launch; if frame rate is low, first lower
  `Environment resolution`, then the geometry segment counts in `Headphone.tsx`.
- Persian (Vazirmatn) was evaluated as optional in the brief; no Persian content was
  requested, so it is not bundled. Adding it needs RTL layout work, not just a font.
