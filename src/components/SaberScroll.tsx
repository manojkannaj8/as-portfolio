import { useEffect, useRef, useState } from 'react'
import { chapters } from '../content/chapters'
import { Hilt } from './chapters/Arsenal'

const STOPS = [...chapters.map((c) => ({ id: c.id, numeral: c.numeral, title: c.title })), { id: 'transmit', numeral: 'VI', title: 'Transmit' }]

/**
 * The page's scroll bar is a lightsaber: the hilt hangs at the top of the right edge and the
 * blade extends with scroll progress. Click or drag along the rail to travel, like a scroll bar.
 * The native scroll bar is hidden in chapters.css; keyboard, wheel and touch scrolling are untouched.
 */
export function SaberScroll() {
  const ref = useRef<HTMLDivElement>(null)
  const [marks, setMarks] = useState<{ id: string; numeral: string; title: string; p: number }[]>([])

  useEffect(() => {
    const el = ref.current!
    const rail = el.querySelector<HTMLElement>('.sscroll__rail')!
    let raf = 0
    const max = () => document.documentElement.scrollHeight - window.innerHeight
    let lit = false
    const update = () => {
      raf = 0
      const p = Math.min(1, Math.max(0, window.scrollY / Math.max(1, max())))
      el.style.setProperty('--p', p.toFixed(4))
      // the blade ignites with a flare on the first scroll
      if (!lit && p > 0.002) {
        lit = true
        el.classList.add('is-lit')
      }
    }
    // a notch on the blade for each chapter, where its opening sits in the scroll
    const measure = () => {
      const m = max()
      setMarks(
        STOPS.map((s) => {
          const t = document.getElementById(s.id)
          const y = t ? t.getBoundingClientRect().top + window.scrollY - 56 : 0
          return { ...s, p: Math.min(1, Math.max(0, y / Math.max(1, m))) }
        }),
      )
    }
    let mt = 0
    const remeasure = () => {
      clearTimeout(mt)
      mt = window.setTimeout(measure, 200)
    }
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }

    // drag along the rail to scroll, the way a scroll bar thumb works
    let dragging = false
    const seek = (clientY: number) => {
      const r = rail.getBoundingClientRect()
      const p = Math.min(1, Math.max(0, (clientY - r.top) / r.height))
      window.scrollTo({ top: p * max(), behavior: 'instant' as ScrollBehavior })
    }
    const down = (e: PointerEvent) => {
      if ((e.target as Element).closest('.sscroll__mark')) return
      dragging = true
      el.classList.add('is-drag')
      rail.setPointerCapture(e.pointerId)
      seek(e.clientY)
      e.preventDefault()
    }
    const move = (e: PointerEvent) => dragging && seek(e.clientY)
    const up = () => {
      dragging = false
      el.classList.remove('is-drag')
    }

    update()
    remeasure()
    window.addEventListener('scroll', queue, { passive: true })
    window.addEventListener('resize', queue)
    const ro = new ResizeObserver(() => {
      queue()
      remeasure()
    })
    ro.observe(document.body)
    rail.addEventListener('pointerdown', down)
    rail.addEventListener('pointermove', move)
    rail.addEventListener('pointerup', up)
    rail.addEventListener('pointercancel', up)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(mt)
      window.removeEventListener('scroll', queue)
      window.removeEventListener('resize', queue)
      ro.disconnect()
      rail.removeEventListener('pointerdown', down)
      rail.removeEventListener('pointermove', move)
      rail.removeEventListener('pointerup', up)
      rail.removeEventListener('pointercancel', up)
    }
  }, [])

  return (
    <div ref={ref} className="sscroll" aria-hidden="true">
      <div className="sscroll__hilt">
        <Hilt variant={3} />
      </div>
      <div className="sscroll__rail">
        <div className="sscroll__blade">
          <i className="sscroll__glow" />
          <i className="sscroll__core" />
        </div>
        {marks.map((m) => (
          <button
            key={m.id}
            type="button"
            tabIndex={-1}
            className="sscroll__mark"
            style={{ top: `${(m.p * 100).toFixed(2)}%` }}
            onClick={() => document.getElementById(m.id)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })}
          >
            <span className="sscroll__label">
              <b>{m.numeral}</b> {m.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
