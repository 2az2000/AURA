# AURA

A cinematic, scroll-driven 3D landing page for **AURA**, a *fictional* premium wireless
headphone. It is a design and engineering study: nothing is for sale and the form at the
end sends no data.

The headphone is built entirely in code (no model files), lit with procedural studio light
cards, and choreographed against the page scroll.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build
```

Requires Node 20+ (developed on Node 22).

## Where to change things

| I want to… | Edit |
|---|---|
| Change any text, specs, finish names/colours | [src/content/copy.ts](src/content/copy.ts) |
| Change where the product goes / how it rotates for each section | [src/three/storyboard.ts](src/three/storyboard.ts) |
| Change colours, type scale, spacing tokens | [src/styles/index.css](src/styles/index.css) (`@theme`) |
| Change the model's shape or materials | [src/three/Headphone.tsx](src/three/Headphone.tsx) |
| Change the lighting | `StudioLights` in [src/three/Stage.tsx](src/three/Stage.tsx) |
| Edit a section's layout | `src/components/sections/<Name>.tsx` |
| Add a section | Create the component, give its `<section>` a `data-shot="id"`, add a matching entry to **both** arrays in `storyboard.ts` (same order as on the page), and render it in `App.tsx`. |
| Wire up the email form | `onSubmit` in [Reserve.tsx](src/components/sections/Reserve.tsx) — currently validates only. |

More detail: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) (how it fits together),
[docs/ART_DIRECTION.md](docs/ART_DIRECTION.md) (why it looks this way),
[docs/RESEARCH.md](docs/RESEARCH.md) (sources and decisions).

## Tuning for performance

1. Lower `resolution` on `<Environment>` in `Stage.tsx` (512 → 256).
2. Lower the max `dpr` (`useState(1.5)` and the `onIncline` value).
3. Reduce segment counts in `lathe()` / torus geometry in `Headphone.tsx`.

The 3D code is a separate lazy chunk, so the page shell paints before it loads.

## Browser support & fallbacks

Modern evergreen browsers with WebGL. Without WebGL the page shows a static SVG
silhouette instead and remains fully readable. `prefers-reduced-motion` is respected.

## Licences

- Code: yours to license as you wish (no licence file is included).
- Fonts: Space Grotesk, Inter, JetBrains Mono — SIL Open Font License 1.1, self-hosted via
  Fontsource.
- No third-party images, models or HDRIs are used. The AURA name and mark are invented for
  this project; check for conflicts before using them commercially.
