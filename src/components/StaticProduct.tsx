/**
 * Fallback for devices without WebGL: a fixed, illustrated silhouette of the
 * product so the page still has its focal point. Pure SVG, no dependencies.
 */
export function StaticProduct() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[1] flex items-center justify-center" aria-hidden="true">
      <svg viewBox="0 0 400 400" className="w-[min(70vw,34rem)] opacity-90">
        <defs>
          <linearGradient id="sp-metal" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#6b7380" />
            <stop offset="0.5" stopColor="#2a2e35" />
            <stop offset="1" stopColor="#14161a" />
          </linearGradient>
        </defs>
        <path d="M95 230 V170 a105 105 0 0 1 210 0 V230" fill="none" stroke="url(#sp-metal)" strokeWidth="12" strokeLinecap="round" />
        <rect x="62" y="206" width="66" height="112" rx="30" fill="url(#sp-metal)" />
        <rect x="272" y="206" width="66" height="112" rx="30" fill="url(#sp-metal)" />
        <rect x="70" y="214" width="3" height="96" rx="1.5" fill="#83b8ff" />
        <rect x="327" y="214" width="3" height="96" rx="1.5" fill="#83b8ff" />
      </svg>
    </div>
  )
}
