import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { academy, chapters } from '../../content/chapters'
import { profile } from '../../content/profile'
import { reducedMotion } from '../../motion/env'
import { ChapterHead } from './ChapterHead'

/** The CGPA read off a drafting scale, 0 to 10, with a dimension line to the mark. */
function Gauge({ value, max }: { value: number; max: number }) {
  const ref = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const el = ref.current!
    const out = el.querySelector<HTMLElement>('.gauge__value')!
    const ctx = gsap.context(() => {
      if (reducedMotion()) return
      const o = { v: 0 }
      out.textContent = '0.00'
      gsap
        .timeline({ scrollTrigger: { trigger: el, start: 'top 85%', once: true } })
        .fromTo(el, { '--p': 0 }, { '--p': value / max, duration: 1.6, ease: 'power3.inOut' })
        .to(o, { v: value, duration: 1.6, ease: 'power3.inOut', onUpdate: () => { out.textContent = o.v.toFixed(2) } }, 0)
        .eventCallback('onComplete', () => { out.textContent = value.toFixed(2) })
    }, el)
    return () => ctx.revert()
  }, [value, max])
  return (
    <div ref={ref} className="gauge" style={{ '--p': value / max } as React.CSSProperties}>
      <p className="visually-hidden">
        CGPA {value.toFixed(2)} out of {max.toFixed(2)}
      </p>
      <p className="gauge__read" aria-hidden="true">
        <span className="gauge__label">CGPA</span>
        <span className="gauge__value">{value.toFixed(2)}</span>
        <span className="gauge__max">/ {max.toFixed(2)}</span>
      </p>
      <div className="gauge__scale" aria-hidden="true">
        {Array.from({ length: max * 4 + 1 }, (_, i) => (
          <i key={i} className={i % 4 === 0 ? 'major' : ''} style={{ left: `${(i / (max * 4)) * 100}%` }}>
            {i % 8 === 0 && <b>{i / 4}</b>}
          </i>
        ))}
        <span className="gauge__dim" />
        <span className="gauge__mark" />
      </div>
    </div>
  )
}

export function Academy() {
  const ch = chapters.find((c) => c.id === 'academy')!
  const e = profile.education
  const [v, m] = e.cgpa.split('/').map((s) => parseFloat(s))
  return (
    <section id="academy" className="chapter chapter--academy" aria-labelledby="academy-title">
      <div className="chapter__inner">
        <ChapterHead chapter={ch} />
      </div>
      <div className="chapter__inner academy">
        <div className="academy__school reg">
          <h3>{e.school}</h3>
          <p>
            {e.degree} · {e.campus}
          </p>
        </div>
        <Gauge value={v} max={m} />
        <div className="academy__syllabus reg">
          <h4 className="panel-title">Relevant coursework</h4>
          <ul>
            {academy.coursework.map((c, i) => (
              <li key={c}>
                <span aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                {c}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
