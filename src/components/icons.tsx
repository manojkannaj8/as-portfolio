/** Authored icon set: 1.5px strokes on a 20px grid, square caps, to match the drafting line. */
type P = { className?: string }

export const ArrowDownRight = ({ className }: P) => (
  <svg className={className} viewBox="0 0 20 20" width="20" height="20" fill="none" aria-hidden="true">
    <path d="M5 5l10 10M15 7.5V15H7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" />
  </svg>
)

export const ArrowUpRight = ({ className }: P) => (
  <svg className={className} viewBox="0 0 20 20" width="20" height="20" fill="none" aria-hidden="true">
    <path d="M6 14L14 6M7.5 6H14v6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
  </svg>
)

export const Reticle = ({ className }: P) => (
  <svg className={className} viewBox="0 0 20 20" width="20" height="20" fill="none" aria-hidden="true">
    <circle cx="10" cy="10" r="5.5" stroke="currentColor" strokeWidth="1.3" />
    <path d="M10 1.5v5M10 13.5v5M1.5 10h5M13.5 10h5" stroke="currentColor" strokeWidth="1.3" />
  </svg>
)

/** Printer's registration target, used as the monogram and the sheet's corner marks. */
export const RegMark = ({ className }: P) => (
  <svg className={className} viewBox="0 0 40 40" width="40" height="40" fill="none" aria-hidden="true">
    <circle className="draw" cx="20" cy="20" r="10" stroke="currentColor" strokeWidth="1.2" pathLength={1} />
    <path className="draw" d="M20 2v36M2 20h36" stroke="currentColor" strokeWidth="1.2" pathLength={1} />
    <circle cx="20" cy="20" r="4" fill="currentColor" />
  </svg>
)
