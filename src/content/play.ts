/**
 * Copy for the interactive layer of the homepage. Nothing here states a product fact: parts reuse
 * `hotspotCopy` in copy.ts; the rest describes the page's own controls.
 */
import type { ExplorePart, Mode } from '../play/store'

export const DISCOVERIES = [
  { id: 'turn', name: 'Turn it', hint: 'Drag the headphone to look around it.', done: 'You can look at it from any side. Reset returns it.' },
  { id: 'sweep', name: 'Light sweep', hint: 'Send a light across the object.', done: 'One pass of light shows where the surface is brushed and where it is polished.' },
  { id: 'part', name: 'Pick a part', hint: 'Choose a marker on the headphone.', done: 'Each marker flies to its part and explains it.' },
  { id: 'ring', name: 'Wake the ring', hint: 'One part lights up when you look at it.', done: 'The ice-blue ring is the only colour on the object.' },
  { id: 'mode', name: 'Change the light', hint: 'The room has more than one light.', done: 'Studio, Night and Signal are three ways of lighting the same object.' },
  { id: 'ripple', name: 'Make waves', hint: 'Press on the empty space around the page.', done: 'Sound leaves a source in rings. This is the picture of it.' },
  { id: 'finish', name: 'Try a finish', hint: 'Materials lets you change the metal.', done: 'Three finishes, one rule: nothing is painted to look like something else.' },
  { id: 'null', name: 'Find the silence', hint: 'In Acoustics, line the two signals up.', done: 'Align a signal with its inverse and what is left is nothing.' },
] as const

export const playCopy = {
  hudLabel: 'Details',
  panelTitle: 'Details to find',
  found: 'Found',
  foundToast: 'Detail found',
  complete: 'Everything found. The rest is quiet.',
  replay: 'Replay the finale',
  reset: 'Start again',
  close: 'Close',
}

export const tools = {
  label: 'Play with the light',
  sweep: 'Light sweep',
  sweepTitle: 'Send a light across the headphone',
  modes: [
    { id: 'studio', name: 'Studio' },
    { id: 'night', name: 'Night' },
    { id: 'signal', name: 'Signal' },
  ] satisfies { id: Mode; name: string }[],
  modeLabel: 'Lighting',
  reset: 'Reset view',
  rotate: 'Rotate the headphone',
}

export const exploreCopy = {
  label: 'Inspect a part',
  parts: ['face', 'cover', 'light', 'dial', 'pivot', 'mic'] satisfies ExplorePart[],
  prev: 'Previous part',
  next: 'Next part',
  close: 'Back to the full view',
  closeShort: 'Full view',
}

export const cancelCopy = {
  offset: 'Timing offset',
  aligned: 'Aligned: nothing left',
  off: 'Not aligned',
  hint: 'Drag the offset to zero.',
  listen: 'Listen',
  mute: 'Mute',
  audioNote: 'The sound is a three-tone test signal plus an inverted copy of it. It is not a recording and not a measurement of any product.',
}
