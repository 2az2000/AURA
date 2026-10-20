/**
 * All user-facing copy lives here so it can be edited without touching layout code.
 *
 * AURA is a FICTIONAL product. Keep it honest: no invented ratings, awards,
 * customer counts or testimonials. Anything numeric below is labelled as a
 * "design target" in the UI.
 */

import type { HotspotId } from '../story/storyboard'

export const brand = {
  name: 'AURA',
  tagline: 'Silence, engineered.',
  descriptor: 'Wireless over-ear headphone — concept 01',
  disclaimer:
    'AURA is a fictional product. This page is a design and engineering study — nothing here is for sale.',
}

/** Total number of "sheets" (sections) in the drawing set; used by the sheet marks. */
export const SHEETS = 8

export const nav = [
  { id: 'silence', label: 'Silence' },
  { id: 'form', label: 'Form' },
  { id: 'anatomy', label: 'Anatomy' },
  { id: 'materials', label: 'Materials' },
  { id: 'acoustics', label: 'Acoustics' },
  { id: 'fit', label: 'Fit' },
] as const

export const hero = {
  kicker: 'Concept 01 / Wireless over-ear',
  tagline: ['Silence,', '*engineered.*'],
  sub: 'A wireless headphone in titanium, aramid and quiet.',
  cta: 'Register interest',
  scroll: 'Scroll',
  drag: 'Drag to inspect',
}

/**
 * Hotspots: labelled points on the 3D model. `side` is which way the label extends.
 * Anatomy labels (plate, shell, driver, pad) reuse the part names above.
 */
export const hotspotCopy: Record<HotspotId, { name: string; text: string; side: 'r' | 'l'; lift?: number }> = {
  plate: { name: 'Face plate', text: 'Machined titanium, circular-brushed.', side: 'l', lift: 20 },
  shell: { name: 'Chassis', text: 'A single graphite shell.', side: 'r', lift: 120 },
  driver: { name: 'Driver', text: 'A 40 mm dynamic driver. Design target.', side: 'l', lift: 80 },
  pad: { name: 'Ear pad', text: 'Memory foam under woven aramid.', side: 'l', lift: 140 },
  face: { name: 'Face plate', text: 'Machined titanium, circular-brushed. The grain runs in rings, so light sweeps across it as it moves.', side: 'l', lift: 10 },
  cover: { name: 'Aramid cover', text: 'Woven aramid over memory foam: matte, so the metal does the shining.', side: 'l', lift: 20 },
  light: { name: 'Indicator ring', text: 'One ice-blue ring. The only colour on the object.', side: 'l', lift: 70 },
  mic: { name: 'Microphone port', text: 'Samples the room so the cancelling signal can be generated.', side: 'r', lift: 30 },
  dial: { name: 'Dial', text: 'One of the two physical controls.', side: 'l', lift: 0 },
  button: { name: 'Button', text: 'The other physical control.', side: 'l', lift: 100 },
  pivot: { name: 'Gimbal pivot', text: 'Lets each cup settle onto the head instead of clamping.', side: 'l', lift: 50 },
}

export const menu = { open: 'Menu', close: 'Close', label: 'Main navigation' }

export const silence = {
  index: '01',
  label: 'Silence',
  title: ['Built around', 'what you', '*don’t* *hear.*'],
  body: 'AURA begins as a problem of subtraction. Every surface, seam and opening is shaped to remove noise before it reaches the ear — so what remains is only the recording.',
  aside: 'Less signal path. Less colour. Less in the way.',
}

export const anatomy = {
  index: '02',
  label: 'Anatomy',
  title: ['Four layers.', '*One* *purpose.*'],
  intro: 'Scroll to pull the cup apart, one layer at a time.',
  overview: 'Overview',
  body: 'Each cup is four parts, machined to stack without compromise. Pull it apart and the logic is plain.',
  parts: [
    {
      key: 'plate',
      n: '01',
      name: 'Face plate',
      text: 'Machined titanium, circular-brushed. It is the acoustic cap, not a decoration.',
    },
    {
      key: 'shell',
      n: '02',
      name: 'Chassis',
      text: 'A single graphite shell that holds the electronics and keeps the cavity rigid.',
    },
    {
      key: 'driver',
      n: '03',
      name: 'Driver',
      text: 'A 40 mm dynamic driver with a titanium-coated diaphragm. Design target.',
    },
    {
      key: 'pad',
      n: '04',
      name: 'Ear pad',
      text: 'Memory foam under a woven aramid cover, shaped to seal without pressing.',
    },
  ],
}

export interface Finish {
  id: 'obsidian' | 'titanium' | 'glacier'
  name: string
  note: string
  /** Colour of the cup shell and headband. */
  shell: string
  /** Colour of the machined metal parts (face plate, yoke, slider). */
  metal: string
}

export const materials = {
  index: '03',
  label: 'Materials',
  title: ['Metal you', 'can feel the', '*weight* of.'],
  body: 'Three finishes, one rule: nothing is painted to look like something else. Choose one and watch the light settle.',
  finishes: [
    { id: 'obsidian', name: 'Obsidian', note: 'Anodised graphite', shell: '#1b1e23', metal: '#7d8592' },
    { id: 'titanium', name: 'Titanium', note: 'Bead-blasted, natural', shell: '#6a707b', metal: '#c3c8d0' },
    { id: 'glacier', name: 'Glacier', note: 'Pale cold silver', shell: '#aeb7c4', metal: '#dfe5ee' },
  ] satisfies Finish[],
  notes: [
    ['Frame', 'Titanium, circular-brushed', 'face'],
    ['Cover', 'Woven aramid', 'cover'],
    ['Band', 'Protein leather, no visible stitching', null],
    ['Light', 'One ice-blue ring. The only colour on the object.', 'light'],
  ] as const satisfies readonly (readonly [string, string, HotspotId | null])[],
}

export const acoustics = {
  index: '05',
  label: 'Acoustics',
  title: ['Noise in.', '*Silence* out.'],
  body: 'Microphones sample the room. AURA generates the mirror image of that sound and plays it back against the original. Where the two meet, they cancel.',
  legend: [
    { key: 'noise', text: 'Ambient noise' },
    { key: 'anti', text: 'Inverted signal' },
    { key: 'result', text: 'What you hear' },
  ],
  field: {
    title: 'Sound leaves the cup in rings',
    caption: 'Illustration of sound propagating from a driver. Not measured data.',
  },
  spectrum: {
    title: 'Audible range',
    caption: 'Illustrative spectrum and curve — drawn for this page, not a measurement of any product.',
    axis: ['20 Hz', '200 Hz', '2 kHz', '20 kHz'],
    bands: ['Low', 'Mid', 'High'],
  },
}

export const form = {
  index: '02',
  label: 'Form',
  title: ['One *silhouette,*', 'drawn three ways.'],
  body: 'Before it was a render it was a drawing. Front, profile and plan share one centreline, so every curve has to agree with the other two.',
  views: [
    { key: 'front', letter: 'A', name: 'Front', note: 'The band is one arc; the cups hang from its ends.' },
    { key: 'profile', letter: 'B', name: 'Profile', note: 'Oval cups, set slightly forward of the band.' },
    { key: 'plan', letter: 'C', name: 'Plan', note: 'Seen from above the band is a single, even strip.' },
  ],
  caption: 'Design study. Dimension lines carry letters, not values.',
}

export const studies = {
  title: 'Material studies',
  note: 'Real surface data (CC0, ambientCG) lit by a moving light — the same light a camera would move across the object.',
  items: [
    { key: 'metal', n: '01', name: 'Titanium', text: 'Circular-brushed, bead-blasted' },
    { key: 'fabric', n: '02', name: 'Aramid', text: 'Woven cover, matte by design' },
    { key: 'leather', n: '03', name: 'Protein leather', text: 'Band underside, no visible stitching' },
  ],
}

export const fit = {
  index: '06',
  label: 'Fit',
  title: ['Made to', '*disappear*', 'on the head.'],
  body: 'A weight-distributed band and gimballed cups let the headphone settle rather than clamp. The aim is to forget it is there.',
  specsTitle: 'Design targets',
  specsNote: 'Targets for a fictional product. None of this is a commitment.',
  specs: [
    ['Driver', '40 mm dynamic', null],
    ['Wireless', 'Bluetooth LE Audio', null],
    ['Wired', 'USB-C audio, passive 3.5 mm', null],
    ['Battery', 'All-day listening', null],
    ['Weight', 'Under 300 g', null],
    ['Controls', 'One dial, one button', 'dial'],
  ] as const satisfies readonly (readonly [string, string, HotspotId | null])[],
}

export const reserve = {
  index: '07',
  label: 'Register interest',
  title: ['Listen *differently.*'],
  body: 'AURA is a concept, so there is nothing to buy. If you would like to see where the project goes, leave an address.',
  placeholder: 'you@domain.com',
  button: 'Register interest',
  success: 'Noted. This is a demo form, so nothing was sent or stored.',
  invalid: 'Please enter a valid email address.',
  consent: 'Demo only — no data is transmitted.',
}
