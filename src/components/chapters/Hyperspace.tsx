import { useEffect, useRef } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { dpr, reducedMotion } from '../../motion/env'

/**
 * The jump from the academy sheet into deep space. A tall scroll track holds a sticky canvas;
 * scroll drives the jump: stars stretch into streaks, the frame flashes white at light speed,
 * then the streaks collapse back into a still starfield, the arsenal's sky.
 */
type Star = { x: number; y: number; z: number; hue: number }

const N = 420

export function Hyperspace() {
  const track = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const flash = useRef<HTMLDivElement>(null)
  const readout = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const cv = canvas.current!
    const ctx = cv.getContext('2d')!
    const stars: Star[] = Array.from({ length: N }, () => ({
      x: (Math.random() * 2 - 1) * 1.2,
      y: (Math.random() * 2 - 1) * 1.2,
      z: Math.random() * 0.95 + 0.05,
      hue: Math.random(),
    }))
    let w = 0
    let h = 0
    let p = 0
    let raf = 0

    const size = () => {
      const d = dpr()
      w = cv.clientWidth
      h = cv.clientHeight
      cv.width = Math.round(w * d)
      cv.height = Math.round(h * d)
      ctx.setTransform(d, 0, 0, d, 0, 0)
      draw()
    }

    // speed: still → ramp → light speed → decelerate to still
    const speedAt = (t: number) => {
      if (t < 0.12) return 0
      if (t < 0.55) return ((t - 0.12) / 0.43) ** 2.2
      if (t < 0.72) return 1
      return Math.max(0, 1 - (t - 0.72) / 0.22) ** 1.6
    }
    // the jump moves the camera forward; integrate a smooth z offset from progress
    const travel = (t: number) => {
      let acc = 0
      const steps = 40
      for (let i = 0; i < steps; i++) acc += speedAt((t * i) / steps) * (t / steps)
      return acc * 3.2
    }

    function draw() {
      ctx.clearRect(0, 0, w, h)
      const sp = reducedMotion() ? 0 : speedAt(p)
      const zoff = reducedMotion() ? 0 : travel(p)
      const cx = w / 2
      const cy = h / 2
      const f = Math.min(w, h) * 0.55
      ctx.lineCap = 'round'
      for (const s of stars) {
        let z = (s.z - (zoff % 1) + 1) % 1
        z = z * 0.95 + 0.05
        const sx = cx + (s.x / z) * f
        const sy = cy + (s.y / z) * f
        if (sx < -50 || sx > w + 50 || sy < -50 || sy > h + 50) continue
        const near = 1 - z
        const len = sp * (40 + near * 260)
        const z2 = z + len / 1000
        const tx = cx + (s.x / z2) * f
        const ty = cy + (s.y / z2) * f
        const a = Math.min(1, 0.25 + near * 0.9)
        // blue-white for most, a few warm ink-coloured streaks
        const col = s.hue > 0.92 ? `rgba(242,160,90,${a})` : s.hue > 0.6 ? `rgba(200,225,255,${a})` : `rgba(239,232,214,${a})`
        if (len < 1) {
          ctx.fillStyle = col
          ctx.beginPath()
          ctx.arc(sx, sy, 0.5 + near * 1.1, 0, Math.PI * 2)
          ctx.fill()
        } else {
          ctx.strokeStyle = col
          ctx.lineWidth = 0.6 + near * 1.8
          ctx.beginPath()
          ctx.moveTo(tx, ty)
          ctx.lineTo(sx, sy)
          ctx.stroke()
        }
      }
      if (flash.current) {
        const fl = reducedMotion() ? 0 : Math.max(0, 1 - Math.abs(p - 0.64) / 0.07)
        flash.current.style.opacity = (fl * 0.85).toFixed(3)
      }
      if (readout.current) {
        readout.current.style.opacity = (sp > 0.05 ? Math.min(1, sp * 2) : 0).toFixed(2)
      }
    }

    const st = ScrollTrigger.create({
      trigger: track.current!,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        p = self.progress
        if (!raf)
          raf = requestAnimationFrame(() => {
            raf = 0
            draw()
          })
      },
    })
    const ro = new ResizeObserver(size)
    ro.observe(cv)
    size()
    return () => {
      st.kill()
      ro.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div ref={track} className="jump" aria-hidden="true">
      <div className="jump__view">
        <canvas ref={canvas} className="jump__canvas" />
        <div ref={flash} className="jump__flash" />
        <p ref={readout} className="jump__readout">
          Jumping to the arsenal
        </p>
      </div>
    </div>
  )
}
