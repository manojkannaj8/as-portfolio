import { useEffect, useRef, useState } from 'react'
import { chapters } from '../content/chapters'
import { profile } from '../content/profile'
import { RegMark } from './icons'

const stops = [...chapters, { id: 'transmit', numeral: 'VI', title: 'Transmit', lead: '' }]

/**
 * The flight log: navigation that docks once the visitor leaves the poster.
 * It names the chapter in view and lists every stop on the journey; a red ink rule
 * underneath tracks how far through the journey the visitor is.
 */
export function FlightLog() {
  const [shown, setShown] = useState(false)
  const [active, setActive] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const barRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLOListElement>(null)

  useEffect(() => {
    const landing = document.getElementById('top')
    const els = stops.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[]

    let raf = 0
    const update = () => {
      raf = 0
      const vh = window.innerHeight
      const lb = landing ? landing.getBoundingClientRect().bottom : 0
      setShown(lb < vh * 0.35)
      let cur: string | null = null
      for (const el of els) if (el.getBoundingClientRect().top < vh * 0.42) cur = el.id
      setActive(cur)
      const first = els[0]
      if (first && barRef.current) {
        const start = first.getBoundingClientRect().top + window.scrollY - vh * 0.42
        const end = document.documentElement.scrollHeight - vh
        const p = Math.min(1, Math.max(0, (window.scrollY - start) / Math.max(1, end - start)))
        barRef.current.style.setProperty('--progress', p.toFixed(4))
      }
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  // close the log on Escape or when it hides
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    // scrolling away from an open log closes it
    const y0 = window.scrollY
    const onScroll = () => Math.abs(window.scrollY - y0) > 120 && setOpen(false)
    window.addEventListener('keydown', onKey)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', onScroll)
    }
  }, [open])
  useEffect(() => {
    if (!shown) setOpen(false)
    barRef.current?.toggleAttribute('inert', !shown)
  }, [shown])

  const cur = stops.find((s) => s.id === active)

  return (
    <div ref={barRef} className={`flog ${shown ? 'is-shown' : ''} ${open ? 'is-open' : ''}`}>
      <nav className="flog__bar" aria-label="Chapters">
        <a className="flog__home" href="#top" aria-label={`${profile.name.first} ${profile.name.last}, back to the poster`}>
          <RegMark />
        </a>
        <p className="flog__now" aria-live="polite">
          {cur ? (
            <>
              <span className="flog__num">{cur.numeral}</span>
              <span className="flog__title">{cur.title}</span>
            </>
          ) : (
            <span className="flog__title">Dossier</span>
          )}
        </p>
        <button
          className="flog__toggle"
          type="button"
          aria-expanded={open}
          aria-controls="flog-list"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? 'Close' : 'Flight log'}
        </button>
        <ol id="flog-list" ref={listRef} className="flog__list">
          {stops.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} aria-current={active === s.id ? 'location' : undefined} onClick={() => setOpen(false)}>
                <span className="flog__num">{s.numeral}</span>
                <span className="flog__label">{s.title}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  )
}
