import { chapters, missions, sorties, type Mission } from '../../content/chapters'
import { ArrowUpRight } from '../icons'
import { ChapterHead, InkTitle } from './ChapterHead'

/**
 * A flight path for each mission: one waypoint per logged entry, ending on the target.
 * It is drawn on as the brief scrolls into view.
 */
function FlightPath({ stops }: { stops: number }) {
  const W = 600
  // waypoints sit on the quadratic curve itself
  const P0 = [24, 54], P1 = [W / 2, -6], P2 = [W - 40, 46]
  const pts = Array.from({ length: stops }, (_, i) => {
    const t = (i + 1) / (stops + 1)
    const a = (1 - t) ** 2, b = 2 * (1 - t) * t, c = t * t
    return [a * P0[0] + b * P1[0] + c * P2[0], a * P0[1] + b * P1[1] + c * P2[1]] as const
  })
  return (
    <svg className="fpath reveal-draw" viewBox={`0 0 ${W} 64`} aria-hidden="true">
      <path className="fpath__base" d={`M0 58H${W}`} />
      <path className="draw fpath__line" pathLength={1} d={`M${P0} Q ${P1} ${P2}`} />
      <circle className="fpath__origin" cx="24" cy="54" r="4" />
      {pts.map(([x, y], i) => (
        <g key={i} className="fpath__wp">
          <rect x={x - 3.5} y={y - 3.5} width="7" height="7" transform={`rotate(45 ${x} ${y})`} />
        </g>
      ))}
      <g className="fpath__target" transform={`translate(${W - 40} 46)`}>
        <circle r="9" />
        <path d="M-15 0h8M7 0h8M0 -15v8M0 7v8" />
      </g>
    </svg>
  )
}

function Brief({ m, i }: { m: Mission; i: number }) {
  return (
    <article className={`brief ${i % 2 ? 'brief--alt' : ''}`} aria-labelledby={`brief-${m.code}`}>
      <div className="brief__id">
        <span className="brief__code" aria-hidden="true">
          {m.code}
        </span>
        <InkTitle as="h3" id={`brief-${m.code}`} text={m.name} className="brief__name" />
        <p className="brief__kind reg">{m.kind}</p>
      </div>

      <div className="brief__body">
        <p className="brief__objective reg">{m.objective}</p>
        <FlightPath stops={m.log.length} />
        <ol className="brief__log">
          {m.log.map((l, k) => (
            <li key={k} className="reg">
              <span className="brief__wp" aria-hidden="true">
                WP {String(k + 1).padStart(2, '0')}
              </span>
              <span>{l}</span>
            </li>
          ))}
        </ol>
        <dl className="brief__meta reg">
          <div>
            <dt>Loadout</dt>
            <dd>{m.loadout.join(' · ')}</dd>
          </div>
        </dl>
        <ul className="brief__links reg">
          {m.links.map((l) => (
            <li key={l.href}>
              <a href={l.href} target="_blank" rel="noreferrer">
                {l.label}
                <ArrowUpRight />
                <span className="visually-hidden"> for {m.name} (opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
}

export function Missions() {
  const ch = chapters.find((c) => c.id === 'missions')!
  return (
    <section id="missions" className="chapter chapter--missions" aria-labelledby="missions-title">
      <div className="chapter__inner">
        <ChapterHead chapter={ch} />
      </div>
      <div className="chapter__inner briefs">
        {missions.map((m, i) => (
          <Brief key={m.code} m={m} i={i} />
        ))}
      </div>

      <div className="chapter__inner sorties">
        <h3 className="sorties__title reg">Smaller sorties, from the GitHub log</h3>
        <ul className="sorties__list">
          {sorties.map((s) => (
            <li key={s.name} className="reg">
              <a href={s.href} target="_blank" rel="noreferrer">
                <span className="sorties__name">{s.name}</span>
                <span className="sorties__note">{s.note}</span>
                <span className="sorties__lang">{s.lang}</span>
                <ArrowUpRight />
              </a>
            </li>
          ))}
        </ul>
        <a className="sorties__all reg" href="https://github.com/Mitiox" target="_blank" rel="noreferrer">
          Full log on GitHub <ArrowUpRight />
        </a>
      </div>
    </section>
  )
}
