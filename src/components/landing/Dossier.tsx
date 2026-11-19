import { forwardRef } from 'react'
import { callouts, specs } from '../../content/dossier'
import { profile } from '../../content/profile'
import { project, type Rect } from '../../scene/geometry'
import { ArrowUpRight } from '../icons'

const LABEL_W = 214

type Props = { rect: Rect; vw: number; wide: boolean; legend: boolean }

/** Resolve where each label's rule sits, flipping sides so labels never leave the sheet. */
function layout(rect: Rect, vw: number, minX: number) {
  return callouts.map((c) => {
    const [ax, ay] = project(rect, c.anchor)
    const [lx, ly] = project(rect, c.label)
    let side = c.side
    if (side === 'right' && lx + LABEL_W > vw - 16) side = 'left'
    if (side === 'left' && lx - LABEL_W < minX) side = 'right'
    const x0 = side === 'right' ? lx : lx - LABEL_W
    return { ...c, ax, ay, lx, ly, side, x0 }
  })
}

/**
 * The drafting sheet the poster turns into: callouts with leader lines, a title block that
 * the outlined name flies into, and (on wide screens) the specifications column.
 */
export const Dossier = forwardRef<HTMLDivElement, Props>(function Dossier({ rect, vw, wide, legend }, ref) {
  const minX = wide ? rect.x - 24 : 8
  const items = layout(rect, vw, minX)
  const pad = 14
  const frame = { x: rect.x - pad, y: rect.y - pad, w: rect.w + pad * 2, h: rect.h + pad * 2 }

  return (
    <div ref={ref} className={`dossier ${wide ? 'dossier--wide' : 'dossier--narrow'}`} id="dossier">
      <svg className="dossier__svg" width="100%" height="100%" aria-hidden="true">
        <rect
          className="dossier__frame draw"
          x={frame.x}
          y={frame.y}
          width={frame.w}
          height={frame.h}
          pathLength={1}
        />
        <g className="dossier__dims">
          <path
            className="draw"
            pathLength={1}
            d={`M${rect.x} ${frame.y + frame.h + 18}H${rect.x + rect.w}M${rect.x} ${frame.y + frame.h + 12}v12M${rect.x + rect.w} ${frame.y + frame.h + 12}v12`}
          />
        </g>
        {items.map((c) => (
          <g key={c.id} className="callout" data-id={c.id}>
            <circle className="callout__dot" cx={c.ax} cy={c.ay} r={wide ? 4 : 9} />
            {wide ? (
              <>
                <path className="callout__leader draw" pathLength={1} d={`M${c.ax} ${c.ay}L${c.lx} ${c.ly}`} />
                <path className="callout__rule draw" pathLength={1} d={`M${c.lx} ${c.ly}H${c.side === 'right' ? c.lx + LABEL_W : c.lx - LABEL_W}`} />
              </>
            ) : (
              <text className="callout__mark" x={c.ax} y={c.ay} dy="0.35em">
                {c.mark}
              </text>
            )}
          </g>
        ))}
      </svg>

      {wide &&
        items.map((c) => (
          <div
            key={c.id}
            className={`callout-label callout-label--${c.side}`}
            data-id={c.id}
            style={{ left: c.x0, top: c.ly, width: LABEL_W }}
          >
            <span className="callout-label__title">{c.title}</span>
            <span className="callout-label__body">{c.body}</span>
          </div>
        ))}

      <p className="dossier__dimlabel" style={{ left: rect.x + rect.w / 2, top: frame.y + frame.h + 26 }}>
        Recruitment plate, drawn from the poster
      </p>

      <div
        className="dossier__col"
        style={wide ? undefined : { top: rect.y + rect.h + 30 }}
      >
        <div className="dossier__slot" data-slot />
        <p className="dossier__sub col-item">
          {profile.role} <span aria-hidden="true">·</span> {profile.education.short}, {profile.education.campus}
        </p>

        {wide ? (
          <>
            <Specs className="col-item" />
            <div className="record col-item">
              <h2 className="panel-title">Service record</h2>
              <ul>
                {profile.honours.map((h) => (
                  <li key={h.event}>
                    <span className="record__event">{h.event}</span>
                    <span className="record__result">{h.result}</span>
                    <span className="record__date">{h.date}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          legend && <Legend className="col-item" />
        )}
      </div>
    </div>
  )
})

export function DossierLinks({ className = '' }: { className?: string }) {
  const { links } = profile
  return (
    <ul className={`dlinks ${className}`}>
      <li>
        <a href={links.github} target="_blank" rel="noreferrer">
          GitHub <ArrowUpRight />
        </a>
      </li>
      <li>
        <a href={links.linkedin} target="_blank" rel="noreferrer">
          LinkedIn <ArrowUpRight />
        </a>
      </li>
      <li>
        <a href={links.resume} target="_blank" rel="noreferrer">
          Résumé <ArrowUpRight />
        </a>
      </li>
      <li>
        <a href={`mailto:${links.email}`}>
          {links.email} <ArrowUpRight />
        </a>
      </li>
    </ul>
  )
}

/** Below the pinned stage on narrow screens: the same records the wide column carries. */
export function DossierFlow({ legend }: { legend: boolean }) {
  return (
    <section className="dossier-flow" aria-label="Specifications and service record">
      {legend && <Legend />}
      <Specs />
      <div className="record">
        <h2 className="panel-title">Service record</h2>
        <ul>
          {profile.honours.map((h) => (
            <li key={h.event}>
              <span className="record__event">{h.event}</span>
              <span className="record__result">{h.result}</span>
              <span className="record__date">{h.date}</span>
            </li>
          ))}
        </ul>
      </div>
      <DossierLinks />
    </section>
  )
}

function Specs({ className = '' }: { className?: string }) {
  return (
    <div className={`specs ${className}`}>
      <h2 className="panel-title">Specifications</h2>
      <dl>
        {specs.map((s) => (
          <div className="specs__row" key={s.k}>
            <dt>{s.k}</dt>
            <dd>{s.v}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function Legend({ className = '' }: { className?: string }) {
  return (
    <ol className={`legend ${className}`} aria-label="Callouts on the drawing">
      {callouts.map((c) => (
        <li key={c.id}>
          <span className="legend__mark">{c.mark}</span>
          <span className="legend__title">{c.title}</span>
          <span className="legend__body">{c.body}</span>
        </li>
      ))}
    </ol>
  )
}
