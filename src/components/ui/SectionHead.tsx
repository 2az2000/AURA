import { DrawRule } from '../../motion/Reveal'

/** Small technical header used at the top of every section: "01 — SILENCE". The rule draws itself in. */
export function SectionHead({ index, label }: { index: string; label: string }) {
  return (
    <p className="label flex items-center gap-4">
      <span className="text-ice">{index}</span>
      <DrawRule className="w-10 bg-silver/35!" />
      <span>{label}</span>
    </p>
  )
}
