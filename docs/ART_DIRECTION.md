# AURA — Art direction

## The three directions that were weighed

| | A. Dark cinematic luxury | B. Minimal editorial | C. Experimental futuristic |
|---|---|---|---|
| Idea | Black stage, one lit object, large type. | White/grey paper, small object, grid-led layout. | HUD overlays, wireframes, data readouts, glitch. |
| Strength | Metal and glass read best against black; the single ice-blue light becomes the brand mark; fits "premium, quiet". | Calm, very readable, lowest performance risk. | Memorable, suits "technically advanced". |
| Weakness | Easy to make muddy; needs good lighting or the product disappears. | Product photography does the heavy lifting — a procedural model looks weakest on white; less "cinematic". | Drifts into sci-fi cliché and clutter; works against "quietly futuristic"; hardest to keep accessible. |
| Verdict | **Chosen as the base.** | Borrowed: its *typography and layout discipline* (hairline rules, asymmetric columns, ruled spec tables instead of cards). | Borrowed in small doses only: mono micro-labels, the exploded-view callouts, the noise-cancellation diagram. |

The result is one system: **A's world, B's discipline, C's technical details used sparingly.**

## Visual system

### Palette (tokens in `src/styles/index.css`)

| Token | Hex | Role |
|---|---|---|
| obsidian | `#0b0c0e` | Page background (slightly darker than the suggested `#101114` so the lit product has more contrast to push against). |
| ink | `#101114` | Raised surfaces (reserved; not used heavily). |
| graphite | `#272b32` | Large background type, hairlines. |
| steel | `#3a404a` | Placeholder text, disabled. |
| mist | `#8892a1` | Secondary text and labels. Contrast vs obsidian ≈ 6:1. |
| silver | `#bfc8d5` | Body text. |
| ice | `#83b8ff` | **The only accent.** Indicator ring, section numbers, focus ring, one progress hairline. |
| bone | `#f4f5f7` | Headlines. |

Rule: ice blue appears wherever "the product is alive" — never as a decorative gradient.
There are no purple/blue gradient backgrounds; the only background gradient is a faint
pool of cool light under the product.

### Typography

- **Space Grotesk** (display) — tight tracking (-0.045em), line-height 0.92. Used big.
- **Inter** (body) — neutral, legible at small sizes.
- **JetBrains Mono** (labels) — uppercase, +0.14em tracking, the "technical micro-label" voice.
- All three are SIL OFL, self-hosted through Fontsource.
- Fluid scale (tokens `--text-*`): label 11–12px, body 16–18px, lead 20–28px,
  h2 40–92px, h1 48–136px, hero wordmark 88–480px.

### Layout principles

- **Hairlines, not cards.** Structure comes from 1px rules at ~15% silver.
- **Asymmetry with intent.** Product sits right (Silence, Materials, Adaptive), centre
  (Hero, Anatomy, Reserve) or left (Fit, the only section where it flips). No two
  consecutive sections share a composition more than twice.
- **The product is the layout.** Copy is placed *around* where the 3D model will be at
  that moment (see `storyboard.ts`); change one, check the other.
- **Depth through layering.** Hero stacks background wordmark → product → foreground
  tagline, so the headphone sits *inside* the typography.

### Lighting & materials (3D)

- Light cards (`Lightformer`s) rendered once to an environment map: a long soft key strip
  (draws a highlight down the band), a big overhead softbox, a small **ice-blue rim** from
  behind-right (the only coloured light), a low kicker, and a ring light for clean circular
  reflections on the cup faces.
- Obsidian shell: clear-coated, low-metalness (reads as deep gloss, picks up the cards).
- Face plate: circular-brushed titanium with anisotropy and a procedural grain map.
- Ear pads: woven aramid (bump-mapped micro weave, high roughness) so they stay matte and
  contrast with the metal.
- One emissive ring is the only light the object emits.

### Motion principles

- **Camera/model motion is scroll-linked and damped** (frame-rate-independent exponential
  damping), so it has weight and never snaps.
- **Hold, then move.** At each section the product holds still, then eases to the next
  pose. It lands, rather than drifting.
- **Headlines are masked word reveals** (transform only); other copy uses different grammars (rules that draw, clip wipes, a scroll-read paragraph). See `MOTION_SPEC.md`.
- **Purposeful motion only:** the exploded view explains construction; the noise diagram
  explains cancellation (its third line *becomes* flat as you scroll); the finish switcher
  shows material. Nothing animates just to animate.
- Idle sway and pointer parallax are tiny (< 0.2 rad) and switch off for
  `prefers-reduced-motion`.

## Anti-generic checklist (from the brief) — status

- No purple/blue gradient hero ✔ · No card grids ✔ · No glassmorphism ✔
- No floating spheres/particles/animated borders ✔ · Sections vary in layout ✔
- No fake testimonials, ratings, counts or invented specs ✔ — numbers that exist are
  labelled *Design targets for a fictional product*.
- Fictional brand, original mark and product; no third-party branding or imagery ✔
