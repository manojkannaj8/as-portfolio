import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { chapters, missions, sorties, type Mission } from '../../content/chapters'
import { reducedMotion } from '../../motion/env'
import { ArrowUpRight } from '../icons'
import { ChapterHead, InkTitle } from './ChapterHead'
import { MissionVisual } from './MissionVisual'

const W = 600
const P0 = [24, 54] as const
const P1 = [W / 2, -6] as const
const P2 = [W - 40, 46] as const
const bez = (t: number) => {
  const a = (1 - t) ** 2
  const b = 2 * (1 - t) * t
  const c = t * t
  return [a * P0[0] + b * P1[0] + c * P2[0], a * P0[1] + b * P1[1] + c * P2[1]] as const
}
const tangent = (t: number) => {
  const x = 2 * (1 - t) * (P1[0] - P0[0]) + 2 * t * (P2[0] - P1[0])
  const y = 2 * (1 - t) * (P1[1] - P0[1]) + 2 * t * (P2[1] - P1[1])
  return (Math.atan2(y, x) * 180) / Math.PI
}
const wpT = (i: number, n: number) => (i + 1) / (n + 1)

/**
 * A flight path for each mission: one waypoint per logged entry, ending on the target.
 * It draws on as the brief arrives; a small craft then flies it as the brief is read,
 * lighting each waypoint (and its log line) as it passes.
 */
function FlightPath({ stops }: { stops: number }) {
  const pts = Array.from({ length: stops }, (_, i) => bez(wpT(i, stops)))
  const [sx, sy] = P0
  return (
    <svg className="fpath reveal-draw" viewBox={`0 0 ${W} 64`} aria-hidden="true">
      <path className="fpath__base" d={`M0 58H${W}`} />
      <path className="draw fpath__line" pathLength={1} d={`M${P0} Q ${P1} ${P2}`} />
      <circle className="fpath__origin" cx={sx} cy={sy} r="4" />
      {pts.map(([x, y], i) => (
        <g key={i} className="fpath__wp" data-i={i}>
          <rect x={x - 3.5} y={y - 3.5} width="7" height="7" transform={`rotate(45 ${x} ${y})`} />
        </g>
      ))}
      <g className="fpath__target" transform={`translate(${P2[0]} ${P2[1]})`}>
        <circle r="9" />
        <path d="M-15 0h8M7 0h8M0 -15v8M0 7v8" />
      </g>
      <g className="fpath__craft" transform={`translate(${sx} ${sy})`}>
        <path d="M9 0L-6 -5.5L-3 0L-6 5.5Z" />
        <path className="fpath__trail" d="M-6 0H-26" />
      </g>
    </svg>
  )
}

function Brief({ m, i }: { m: Mission; i: number }) {
  const ref = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const el = ref.current!
    const craft = el.querySelector<SVGGElement>('.fpath__craft')!
    const wps = Array.from(el.querySelectorAll('.fpath__wp'))
    const logs = Array.from(el.querySelectorAll('.brief__log li'))
    const n = m.log.length
    const set = (t: number) => {
      const [x, y] = bez(t)
      craft.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${tangent(Math.min(0.999, Math.max(0.001, t))).toFixed(1)})`)
      craft.classList.toggle('is-moving', t > 0.002 && t < 0.998)
      wps.forEach((w, k) => w.classList.toggle('is-lit', t >= wpT(k, n)))
      logs.forEach((l, k) => l.classList.toggle('is-lit', t >= wpT(k, n)))
      el.classList.toggle('is-arrived', t >= 0.998)
    }
    if (reducedMotion()) {
      set(1)
      return
    }
    set(0)
    const st = ScrollTrigger.create({
      trigger: el.querySelector('.brief__body')!,
      start: 'top 62%',
      end: 'bottom 62%',
      onUpdate: (self) => set(gsap.parseEase('power1.inOut')(self.progress)),
    })
    return () => st.kill()
  }, [m.log.length])

  return (
    <article ref={ref} className={`brief ${i % 2 ? 'brief--alt' : ''}`} aria-labelledby={`brief-${m.code}`}>
      <div className="brief__id">
        <span className="brief__code" aria-hidden="true">
          {m.code}
        </span>
        <InkTitle as="h3" id={`brief-${m.code}`} text={m.name} className="brief__name" />
        <p className="brief__kind reg">{m.kind}</p>
        <MissionVisual m={m} />
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
