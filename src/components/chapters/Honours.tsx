import { certificates, chapters, honours } from '../../content/chapters'
import { ChapterHead } from './ChapterHead'

/** Victory markings, stencilled onto the paper like marks on a fighter's hull. */
export function Honours() {
  const ch = chapters.find((c) => c.id === 'honours')!
  return (
    <section id="honours" className="chapter chapter--honours" aria-labelledby="honours-title">
      <div className="chapter__inner">
        <ChapterHead chapter={ch} tone="paper" />
      </div>
      <ol className="chapter__inner marks-list">
        {honours.map((h) => (
          <li key={h.event} className="hmark">
            <span className="hmark__stencil reg" aria-hidden="true">
              {h.mark}
              {h.markSmall && <small>{h.markSmall}</small>}
            </span>
            <div className="hmark__text reg">
              <h3 className="hmark__event">{h.event}</h3>
              <p className="hmark__result">{h.result}</p>
            </div>
            <time className="hmark__date reg" dateTime={h.iso}>
              {h.date}
            </time>
          </li>
        ))}
      </ol>
      <div className="chapter__inner">
        <p className="certs reg">
          Also logged:{' '}
          {certificates.map((c) => (
            <span key={c.name}>
              {c.name}, {c.issuer}, {c.date}
            </span>
          ))}
        </p>
      </div>
    </section>
  )
}
