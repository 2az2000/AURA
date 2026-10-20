/**
 * Copy for the /product experience.
 *
 * Honesty rule (same as the homepage): AURA is a FICTIONAL concept. Every factual statement here
 * restates something already established in src/content/copy.ts or visible on the model itself.
 * Anything numeric is a "design target". No new specifications, certifications or claims.
 */
import type { HotspotId } from '../story/storyboard'

export const scenes = [
  { id: 'arrival', n: '01', name: 'Arrival' },
  { id: 'form', n: '02', name: 'Form' },
  { id: 'craft', n: '03', name: 'Craft' },
  { id: 'inspect', n: '04', name: 'Inside' },
  { id: 'finale', n: '05', name: 'Close' },
] as const

export const arrival = {
  kicker: 'Discover AURA — Scene 01 / 05',
  lead: 'Meet the',
  title: '*quiet.*',
  sub: 'A wireless headphone concept, seen from very close and then from every side.',
  cue: 'Scroll to turn it',
  reticle: 'Macro — face plate',
}

export const form = {
  label: 'Form',
  title: ['Turn it *over.*'],
  body: 'The silhouette is simple on purpose: one arc, two ovals. The camera walks around it so each angle can say one thing.',
  readout: { y: 'Yaw', x: 'Pitch' },
  steps: [
    { key: 'a', n: '2.1', title: 'Three-quarter', text: 'A ring and two ovals. The ice-blue line is the only colour.' },
    { key: 'b', n: '2.2', title: 'Front', text: 'One arc carries both cups; they hang from its ends.' },
    { key: 'c', n: '2.3', title: 'Profile', text: 'Oval cups, set slightly forward of the band.' },
    { key: 'd', n: '2.4', title: 'From behind', text: 'Seen from behind the band is a single, even strip.' },
  ],
}

export const craft = {
  label: 'Craft',
  title: ['Close enough', 'to feel the *grain.*'],
  note: 'Real surface data (CC0, ambientCG) lit by a moving light. The model on the other side of the screen wears the same finishes.',
  chapters: [
    {
      key: 'titanium',
      n: '3.1',
      name: 'Titanium',
      text: 'Machined, circular-brushed. The grain runs in rings, so light sweeps across it as it moves.',
      detail: 'Face plate',
    },
    {
      key: 'aramid',
      n: '3.2',
      name: 'Aramid',
      text: 'A woven cover over memory foam. Matte on purpose: the metal does the shining.',
      detail: 'Ear pad',
    },
    {
      key: 'leather',
      n: '3.3',
      name: 'Protein leather',
      text: 'The underside of the band, with no visible stitching.',
      detail: 'Headband',
    },
  ],
}

export interface InspectItem {
  key: string
  n: string
  name: string
  text: string
  /** hotspot ids shown on the model while this item is selected */
  hotspots: HotspotId[]
  /** the hotspot the connector line starts from */
  primary: HotspotId
}

export const inspect = {
  label: 'Inside',
  title: ['Pick a part.', '*Go there.*'],
  body: 'Choose a component and the camera flies to it. Keyboard: arrow keys move through the list.',
  listLabel: 'Components',
  items: [
    { key: 'plate', n: '01', name: 'Face plate', text: 'Machined titanium, circular-brushed. It is the acoustic cap, not a decoration.', hotspots: ['plate'], primary: 'plate' },
    { key: 'shell', n: '02', name: 'Chassis', text: 'A single graphite shell that holds the electronics and keeps the cavity rigid.', hotspots: ['shell'], primary: 'shell' },
    { key: 'driver', n: '03', name: 'Driver', text: 'A 40 mm dynamic driver with a titanium-coated diaphragm. Design target.', hotspots: ['driver'], primary: 'driver' },
    { key: 'pad', n: '04', name: 'Ear pad', text: 'Memory foam under a woven aramid cover, shaped to seal without pressing.', hotspots: ['pad'], primary: 'pad' },
    { key: 'controls', n: '05', name: 'Controls', text: 'One dial and one button, both on the front edge of the chassis.', hotspots: ['dial', 'button'], primary: 'dial' },
    { key: 'pivot', n: '06', name: 'Gimbal pivot', text: 'Lets each cup settle onto the head instead of clamping.', hotspots: ['pivot'], primary: 'pivot' },
    { key: 'ring', n: '07', name: 'Indicator ring', text: 'One ice-blue ring. The only colour on the object.', hotspots: ['light'], primary: 'light' },
    { key: 'mic', n: '08', name: 'Microphone port', text: 'Samples the room so the cancelling signal can be generated.', hotspots: ['mic'], primary: 'mic' },
  ] as InspectItem[],
  driverDiagram: {
    title: 'How a dynamic driver moves',
    caption: 'Illustration: the diaphragm travels in and out. Not a measurement.',
  },
}

export const finale = {
  label: 'Close',
  lead: 'The rest is',
  title: '*quiet.*',
  body: 'AURA is a concept, so there is nothing to buy. If you want to follow where it goes, leave an address on the overview page.',
  cta: 'Register interest',
  back: 'Back to the overview',
  replay: 'Replay the film',
}

export const productHeader = { home: 'Overview', aria: 'Product scenes' }
