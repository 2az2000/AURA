/**
 * All user-facing copy lives here so it can be edited without touching layout code.
 *
 * AURA is a FICTIONAL product. Keep it honest: no invented ratings, awards,
 * customer counts or testimonials. Anything numeric below is labelled as a
 * "design target" in the UI.
 */

export const brand = {
  name: 'AURA',
  tagline: 'Silence, engineered.',
  descriptor: 'Wireless over-ear headphone — concept 01',
  disclaimer:
    'AURA is a fictional product. This page is a design and engineering study — nothing here is for sale.',
}

export const nav = [
  { id: 'silence', label: 'Silence' },
  { id: 'anatomy', label: 'Anatomy' },
  { id: 'materials', label: 'Materials' },
  { id: 'adaptive', label: 'Adaptive' },
  { id: 'fit', label: 'Fit' },
] as const

export const hero = {
  kicker: 'Concept 01 / Wireless over-ear',
  sub: 'A wireless headphone in titanium, aramid and quiet.',
  cta: 'Register interest',
  scroll: 'Scroll',
}

export const silence = {
  index: '01',
  label: 'Silence',
  title: ['Built around', 'what you', 'don’t hear.'],
  body: 'AURA begins as a problem of subtraction. Every surface, seam and opening is shaped to remove noise before it reaches the ear — so what remains is only the recording.',
  aside: 'Less signal path. Less colour. Less in the way.',
}

export const anatomy = {
  index: '02',
  label: 'Anatomy',
  title: ['Four layers.', 'One purpose.'],
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
  title: ['Metal you', 'can feel the', 'weight of.'],
  body: 'Three finishes, one rule: nothing is painted to look like something else. Choose one and watch the light settle.',
  finishes: [
    { id: 'obsidian', name: 'Obsidian', note: 'Anodised graphite', shell: '#1b1e23', metal: '#7d8592' },
    { id: 'titanium', name: 'Titanium', note: 'Bead-blasted, natural', shell: '#6a707b', metal: '#c3c8d0' },
    { id: 'glacier', name: 'Glacier', note: 'Pale cold silver', shell: '#aeb7c4', metal: '#dfe5ee' },
  ] satisfies Finish[],
  notes: [
    ['Frame', 'Titanium, circular-brushed'],
    ['Cover', 'Woven aramid'],
    ['Band', 'Protein leather, no visible stitching'],
    ['Light', 'One ice-blue ring. The only colour on the object.'],
  ] as const,
}

export const adaptive = {
  index: '04',
  label: 'Adaptive silence',
  title: ['Noise in.', 'Silence out.'],
  body: 'Microphones sample the room. AURA generates the mirror image of that sound and plays it back against the original. Where the two meet, they cancel.',
  legend: [
    { key: 'noise', text: 'Ambient noise' },
    { key: 'anti', text: 'Inverted signal' },
    { key: 'result', text: 'What you hear' },
  ],
}

export const fit = {
  index: '05',
  label: 'Fit',
  title: ['Made to', 'disappear', 'on the head.'],
  body: 'A weight-distributed band and gimballed cups let the headphone settle rather than clamp. The aim is to forget it is there.',
  specsTitle: 'Design targets',
  specsNote: 'Targets for a fictional product. None of this is a commitment.',
  specs: [
    ['Driver', '40 mm dynamic'],
    ['Wireless', 'Bluetooth LE Audio'],
    ['Wired', 'USB-C audio, passive 3.5 mm'],
    ['Battery', 'All-day listening'],
    ['Weight', 'Under 300 g'],
    ['Controls', 'One dial, one button'],
  ] as const,
}

export const reserve = {
  index: '06',
  label: 'Register interest',
  title: ['Listen differently.'],
  body: 'AURA is a concept, so there is nothing to buy. If you would like to see where the project goes, leave an address.',
  placeholder: 'you@domain.com',
  button: 'Register interest',
  success: 'Noted. This is a demo form, so nothing was sent or stored.',
  invalid: 'Please enter a valid email address.',
  consent: 'Demo only — no data is transmitted.',
}
