/** Small technical header used at the top of every section: "01 — SILENCE". */
export function SectionHead({ index, label }: { index: string; label: string }) {
  return (
    <p className="label flex items-center gap-4">
      <span className="text-ice">{index}</span>
      <span aria-hidden="true" className="h-px w-10 bg-silver/30" />
      <span>{label}</span>
    </p>
  )
}
