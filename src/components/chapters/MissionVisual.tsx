import { useRef } from 'react'
import type { Mission } from '../../content/chapters'
import { finePointer, reducedMotion } from '../../motion/env'

/** A capture of the live product, framed as a ship's viewscreen. Tilts slightly toward the cursor. */
function Viewscreen({ v, name }: { v: Extract<Mission['visual'], { kind: 'screen' }>; name: string }) {
  const ref = useRef<HTMLAnchorElement>(null)
  const onMove = (e: React.PointerEvent) => {
    if (!finePointer() || reducedMotion()) return
    const r = ref.current!.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    ref.current!.style.setProperty('--rx', `${(-y * 5).toFixed(2)}deg`)
    ref.current!.style.setProperty('--ry', `${(x * 7).toFixed(2)}deg`)
    ref.current!.style.setProperty('--gx', `${((x + 0.5) * 100).toFixed(1)}%`)
  }
  const onLeave = () => {
    ref.current!.style.setProperty('--rx', '0deg')
    ref.current!.style.setProperty('--ry', '0deg')
  }
  return (
    <a ref={ref} className="vscreen reg" href={v.href} target="_blank" rel="noreferrer" onPointerMove={onMove} onPointerLeave={onLeave}>
      <span className="vscreen__bar" aria-hidden="true">
        <i />
        Live feed · {v.host}
      </span>
      <span className="vscreen__glass">
        <img
          src={v.small}
          srcSet={`${v.small} 720w, ${v.src} 1440w`}
          sizes="(max-width: 900px) 92vw, 34vw"
          width={1440}
          height={900}
          loading="lazy"
          decoding="async"
          alt={`${name} running live: the editor with an image loaded, crop, background and colour tools on the left.`}
        />
        <span className="vscreen__scan" aria-hidden="true" />
      </span>
      <span className="vscreen__corners" aria-hidden="true" />
      <span className="visually-hidden"> (opens the live site in a new tab)</span>
    </a>
  )
}

/** the pooled ride: down the amber line, change to red at the interchange, then to blue */
const POOL = 'M40 40V80L80 120V150H90L130 110H210V150H300'

/** Nexus-Flow has no public deployment: a transit schematic with a pooled ride threading the lines. */
function Route() {
  return (
    <figure className="schem schem--route reg">
      <svg viewBox="0 0 320 200" aria-hidden="true">
        <g className="schem__grid">
          {Array.from({ length: 9 }, (_, i) => (
            <path key={i} d={`M${i * 40} 0V200`} />
          ))}
          {Array.from({ length: 6 }, (_, i) => (
            <path key={`h${i}`} d={`M0 ${i * 40}H320`} />
          ))}
        </g>
        <path className="line line--a" d="M10 150H90L130 110H230L270 70H312" />
        <path className="line line--b" d="M40 20V80L80 120V190" />
        <path className="line line--c" d="M170 10V60L210 100V150H310" />
        <path className="pool" d={POOL} />
        {[
          [40, 80],
          [80, 120],
          [80, 150],
          [130, 110],
          [210, 110],
          [210, 150],
          [300, 150],
        ].map(([x, y], i) => (
          <circle key={i} className="stop" cx={x} cy={y} r="4.5" />
        ))}
        <circle className="rider" r="4" style={{ offsetPath: `path('${POOL}')` }} />
      </svg>
      <figcaption>Route schematic · pooled ride across three lines</figcaption>
    </figure>
  )
}

/** GaBN: an assistive sweep, picking out obstacles around the walker and calling them out. */
function Radar() {
  // each blip pings when the sweep (clockwise from twelve o'clock) passes over it
  const blips = [
    [62, 34],
    [148, 70],
    [44, 128],
    [126, 156],
  ].map(([x, y]) => [x, y, ((Math.atan2(x - 100, -(y - 100)) / (Math.PI * 2)) + 1) % 1])
  return (
    <figure className="schem schem--radar reg">
      <div className="radar" aria-hidden="true">
        <svg viewBox="0 0 200 200">
          {[30, 55, 80, 96].map((r) => (
            <circle key={r} className="ring" cx="100" cy="100" r={r} />
          ))}
          <path className="ring" d="M100 4V196M4 100H196" />
          {blips.map(([x, y, d], i) => (
            <g key={i} className="blip" style={{ '--d': d } as React.CSSProperties}>
              <circle cx={x} cy={y} r="4" />
              <circle className="blip__ping" cx={x} cy={y} r="4" />
            </g>
          ))}
          <path className="walker" d="M100 92l7 14h-14z" />
        </svg>
        <span className="radar__sweep" />
      </div>
      <figcaption>Assist schematic · obstacles called out as the sweep finds them</figcaption>
    </figure>
  )
}

export function MissionVisual({ m }: { m: Mission }) {
  const v = m.visual
  if (v.kind === 'screen') return <Viewscreen v={v} name={m.name} />
  if (v.kind === 'route') return <Route />
  return <Radar />
}
