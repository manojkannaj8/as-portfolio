import { useEffect, useRef } from 'react'
import { Hilt } from './chapters/Arsenal'

/**
 * The page's scroll bar is a lightsaber: the hilt hangs at the top of the right edge and the
 * blade extends with scroll progress. Click or drag along the rail to travel, like a scroll bar.
 * The native scroll bar is hidden in chapters.css; keyboard, wheel and touch scrolling are untouched.
 */
export function SaberScroll() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current!
    const rail = el.querySelector<HTMLElement>('.sscroll__rail')!
    let raf = 0
    const max = () => document.documentElement.scrollHeight - window.innerHeight
    const update = () => {
      raf = 0
      const p = Math.min(1, Math.max(0, window.scrollY / Math.max(1, max())))
      el.style.setProperty('--p', p.toFixed(4))
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
    window.addEventListener('scroll', queue, { passive: true })
    window.addEventListener('resize', queue)
    const ro = new ResizeObserver(queue)
    ro.observe(document.body)
    rail.addEventListener('pointerdown', down)
    rail.addEventListener('pointermove', move)
    rail.addEventListener('pointerup', up)
    rail.addEventListener('pointercancel', up)
    return () => {
      cancelAnimationFrame(raf)
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
      </div>
    </div>
  )
}
