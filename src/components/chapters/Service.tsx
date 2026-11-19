import { useEffect, useState } from 'react'
import { chapters, service } from '../../content/chapters'
import { ChapterHead } from './ChapterHead'
import { CloneSquad } from './CloneSquad'

function useCompact(q = '(max-width: 720px)') {
  const [m, setM] = useState(() => window.matchMedia(q).matches)
  useEffect(() => {
    const mq = window.matchMedia(q)
    const h = () => setM(mq.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [q])
  return m
}

export function Service() {
  const ch = chapters.find((c) => c.id === 'service')!
  const compact = useCompact()
  const lead = service.find((p) => p.lead)!
  return (
    <section id="service" className="chapter chapter--service" aria-labelledby="service-title">
      <div className="seam-scan" aria-hidden="true">
        <div className="seam-scan__cover" />
      </div>
      <div className="chapter__inner">
        <ChapterHead chapter={ch} />
      </div>
      <div className="chapter__inner">
        <CloneSquad compact={compact} caption={compact ? lead.title : `${lead.title}, ${lead.org}`} />
      </div>
      <ol className="chapter__inner posts">
        {service.map((p, i) => (
          <li key={p.title} className={`post ${p.lead ? 'post--lead' : ''}`}>
            <div className="post__side reg">
              <span className="post__idx">{String(i + 1).padStart(2, '0')}</span>
              <span className="post__tag">
                {i === 0 && <i className="post__live" aria-hidden="true" />}
                {p.tag}
              </span>
            </div>
            <div className="post__main">
              <h3 className="post__title reg">
                {p.title}
                <span className="post__org">
                  {p.org} <span className="post__where">· {p.where}</span>
                </span>
              </h3>
              <ul className="post__log">
                {p.log.map((l) => (
                  <li key={l} className="reg">
                    {l}
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
