# AURA

A cinematic, scroll-driven 3D landing page for **AURA**, a *fictional* premium wireless
headphone. It is a design and engineering study: nothing is for sale and the form at the
end sends no data.

The headphone is built entirely in code (no model files), lit with procedural studio light
cards, and choreographed against both a title sequence and the page scroll.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build
```

Requires Node 20+ (developed on Node 22).

QA switches (query string): `?q=high|medium|low` lock the 3D quality tier · `?intro=1.2` freeze the title sequence
at 1.2 s · `?debug` show every hotspot.

## Where to change things

| I want to… | Edit |
|---|---|
| Change any text, specs, finish names/colours, hotspot descriptions | [src/content/copy.ts](src/content/copy.ts) |
| Change how anything *moves* (durations, easings, springs, stagger, parallax, intro timing) | [src/motion/tokens.ts](src/motion/tokens.ts) |
| Change where the product goes / how it rotates for each scroll position | [src/story/storyboard.ts](src/story/storyboard.ts) |
| Change colours, type scale, layers | [src/styles/index.css](src/styles/index.css) (`@theme`) |
| Change the background's character per section | `field` values in `storyboard.ts`; shader in [src/background/fieldShader.ts](src/background/fieldShader.ts) |
| Change the technical drawings / diagrams / material panels | [src/graphics/](src/graphics/) |
| Change the model's shape, materials or hotspot anchors | [src/three/Headphone.tsx](src/three/Headphone.tsx) |
| Change the lighting or quality tiers | [src/three/Stage.tsx](src/three/Stage.tsx), [src/three/quality.ts](src/three/quality.ts) |
| Change pointer / drag / intro choreography in 3D | [src/three/Rig.tsx](src/three/Rig.tsx) |
| Edit a section's layout | `src/components/sections/<Name>.tsx` |
| Add a section | Create the component, give its `<section>` a `data-shot="id"`, add matching entries to **both** arrays in `storyboard.ts` (same order as on the page), and render it in `App.tsx`. |
| Wire up the email form | `onSubmit` in [Reserve.tsx](src/components/sections/Reserve.tsx) — currently validates only. |

Read in this order: [CLAUDE.md](CLAUDE.md) (conventions and gotchas) → [docs/VISUAL_DIRECTION.md](docs/VISUAL_DIRECTION.md) (the art direction) →
[docs/MOTION_SPEC.md](docs/MOTION_SPEC.md) (the motion language) →
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) → [docs/PERFORMANCE.md](docs/PERFORMANCE.md).
Background: [docs/REDESIGN_AUDIT.md](docs/REDESIGN_AUDIT.md), [docs/ART_DIRECTION.md](docs/ART_DIRECTION.md),
[docs/RESEARCH.md](docs/RESEARCH.md).

## Browser support & fallbacks

Modern evergreen browsers with WebGL (verified in Chromium only). Without WebGL — or if the GL context is lost — the page
shows a static SVG silhouette and stays fully readable. `prefers-reduced-motion` is respected throughout.

## Licences

- Code: yours to license as you wish (no licence file is included).
- Fonts: Space Grotesk, Inter, JetBrains Mono, Instrument Serif — SIL Open Font License 1.1, self-hosted via Fontsource.
- Three material textures from ambientCG (Metal009, Fabric039, Leather026), CC0 — see [docs/ASSETS.md](docs/ASSETS.md).
- No other third-party images, models or HDRIs are used. The AURA name and mark are invented for this project;
  check for conflicts before using them commercially.
