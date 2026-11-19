import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { arsenal, chapters, type Blade } from '../../content/chapters'
import { dpr, finePointer, loop, reducedMotion } from '../../motion/env'
import { humLevel, onSound, setSound, soundOn, sweep } from '../../motion/saberSound'
import { ChapterHead } from './ChapterHead'

/** An original hilt, drawn flat like a parts sheet: pommel, ridged grip, switch body, emitter. */
export function Hilt({ variant }: { variant: number }) {
  const ridges = [7, 5, 9][variant % 3]
  return (
    <svg className="hilt" viewBox="0 0 190 40" aria-hidden="true">
      <defs>
        <linearGradient id={`metal-${variant}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9dcd8" />
          <stop offset="0.45" stopColor="#8d9396" />
          <stop offset="1" stopColor="#3a3f42" />
        </linearGradient>
      </defs>
      <rect x="2" y="11" width="14" height="18" rx="3" fill={`url(#metal-${variant})`} />
      <rect x="16" y="13" width="92" height="14" fill="#2a2e31" />
      {Array.from({ length: ridges }, (_, i) => (
        <rect key={i} x={20 + i * (84 / ridges)} y="12" width={84 / ridges - 4} height="16" rx="1.5" fill={`url(#metal-${variant})`} />
      ))}
      <rect x="108" y="10" width="44" height="20" fill={`url(#metal-${variant})`} />
      <rect x="116" y="7" width="12" height="5" rx="1" className="hilt__switch" />
      <path d="M134 14h14M134 20h14M134 26h14" stroke="#2a2e31" strokeWidth="1.2" />
      <path d="M152 9l22 -3v28l-22 -3z" fill={`url(#metal-${variant})`} />
      <rect x="174" y="12" width="12" height="16" fill="#1d2023" />
    </svg>
  )
}

const PITCH = [1, 1.18, 0.86]
const COLOURS = { red: '255,59,31', amber: '255,176,46', cyan: '63,207,255' } as const

type SaberProps = { blade: Blade; index: number; onLit: (i: number, on: boolean) => void }

function Saber({ blade, index, onLit }: SaberProps) {
  const ref = useRef<HTMLDivElement>(null)
  const tl = useRef<gsap.core.Timeline | null>(null)
  const [lit, setLit] = useState(true)

  useLayoutEffect(() => {
    const el = ref.current!
    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>('.saber__items li', el)
      if (reducedMotion()) {
        gsap.set(el, { '--ign': 1 })
        gsap.set(items, { opacity: 1 })
        onLit(index, true)
        return
      }
      gsap.set(el, { '--ign': 0 })
      gsap.set(items, { opacity: 0, y: 6 })
      tl.current = gsap
        .timeline({ paused: true })
        .to(el, { '--ign': 1, duration: 0.42, ease: 'power2.out' })
        .fromTo(el, { '--flare': 1 }, { '--flare': 0, duration: 0.5, ease: 'power2.out' }, 0.1)
      ScrollTrigger.create({
        trigger: el,
        start: 'top 82%',
        once: true,
        onEnter: () =>
          gsap.delayedCall(index * 0.18, () => {
            tl.current?.play()
            sweep('ignite', PITCH[index])
            onLit(index, true)
            // the engraved names stay put once revealed; only the blade toggles
            gsap.to(items, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', stagger: 0.05, delay: 0.12 })
          }),
      })
    }, el)
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index])

  const toggle = () => {
    const t = tl.current
    const next = !lit
    setLit(next)
    onLit(index, next)
    sweep(next ? 'ignite' : 'retract', PITCH[index])
    if (!t) {
      gsap.set(ref.current, { '--ign': next ? 1 : 0 })
      return
    }
    t.timeScale(next ? 1 : 1.6)
    if (next) t.play()
    else t.reverse()
  }

  const titleId = `blade-${blade.id}`
  return (
    <div
      ref={ref}
      className={`saber saber--${blade.colour} ${lit ? '' : 'is-off'}`}
      data-colour={blade.colour}
      style={{ '--bob-delay': `${index * -1.3}s` } as React.CSSProperties}
    >
      <h3 id={titleId} className="saber__name">
        {blade.name}
      </h3>
      <div className="saber__row">
        <button className="saber__hilt" type="button" aria-pressed={lit} onClick={toggle} aria-describedby={titleId}>
          <Hilt variant={index} />
          <span className="visually-hidden">{lit ? 'Retract' : 'Ignite'} blade</span>
        </button>
        <div className="saber__blade" aria-hidden="true">
          <i className="saber__glow" />
          <i className="saber__core" />
        </div>
      </div>
      <ul className="saber__items" aria-labelledby={titleId}>
        {blade.items.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
    </div>
  )
}

/** Sound toggle: off by default, remembered per browser. */
function SoundToggle() {
  const [on, setOn] = useState(soundOn)
  useEffect(() => {
    const off = onSound(setOn)
    return () => {
      off()
    }
  }, [])
  return (
    <button className={`sound ${on ? 'is-on' : ''}`} type="button" aria-pressed={on} onClick={() => setSound(!on)}>
      <span className="sound__bars" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
      Saber sound {on ? 'on' : 'off'}
    </button>
  )
}

type Spark = { x: number; y: number; vx: number; vy: number; life: number; age: number; col: string }

export function Arsenal() {
  const ch = chapters.find((c) => c.id === 'arsenal')!
  const sec = useRef<HTMLElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const lit = useRef([false, false, false])
  const view = useRef(false)
  const swell = useRef(0)

  const syncHum = () => humLevel(view.current && lit.current.some(Boolean) ? 1 : 0, swell.current)
  const onLit = (i: number, on: boolean) => {
    lit.current[i] = on
    syncHum()
  }

  // sparks where the cursor drags across a lit blade; the hum swells with it
  useEffect(() => {
    const s = sec.current!
    const cv = canvas.current!
    const c = cv.getContext('2d')!
    let sparks: Spark[] = []
    let last: { x: number; y: number } | null = null
    const io = new IntersectionObserver(([e]) => {
      view.current = e.isIntersecting
      syncHum()
    })
    io.observe(s)
    const size = () => {
      const d = dpr()
      cv.width = Math.round(cv.clientWidth * d)
      cv.height = Math.round(cv.clientHeight * d)
      c.setTransform(d, 0, 0, d, 0, 0)
    }
    const ro = new ResizeObserver(size)
    ro.observe(cv)
    const unsub = onSound(() => syncHum())

    const onMove = (e: PointerEvent) => {
      if (reducedMotion() || !finePointer()) return
      const r = s.getBoundingClientRect()
      const x = e.clientX - r.left
      const y = e.clientY - r.top
      const speed = last ? Math.hypot(x - last.x, y - last.y) : 0
      last = { x, y }
      const saber = (e.target as Element).closest('.saber__blade')?.closest<HTMLElement>('.saber')
      if (!saber || saber.classList.contains('is-off')) return
      const col = COLOURS[saber.dataset.colour as keyof typeof COLOURS]
      const n = Math.min(6, 1 + Math.floor(speed / 6))
      for (let k = 0; k < n; k++) {
        const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.4
        const v = 80 + Math.random() * 220
        sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0.35 + Math.random() * 0.4, age: 0, col })
      }
      swell.current = Math.min(1, swell.current + speed / 60)
      syncHum()
    }
    s.addEventListener('pointermove', onMove)

    const stop = loop((dt) => {
      if (!view.current) return
      if (swell.current > 0) {
        swell.current = Math.max(0, swell.current - dt * 1.5)
        syncHum()
      }
      if (!sparks.length) return
      c.clearRect(0, 0, cv.clientWidth, cv.clientHeight)
      c.globalCompositeOperation = 'lighter'
      c.lineCap = 'round'
      for (const p of sparks) {
        p.age += dt
        p.vy += 520 * dt
        p.x += p.vx * dt
        p.y += p.vy * dt
        const k = Math.max(0, 1 - p.age / p.life)
        c.strokeStyle = `rgba(${p.col},${k})`
        c.lineWidth = 1.6
        c.beginPath()
        c.moveTo(p.x, p.y)
        c.lineTo(p.x - p.vx * 0.025, p.y - p.vy * 0.025)
        c.stroke()
        c.fillStyle = `rgba(255,255,255,${k})`
        c.fillRect(p.x - 0.7, p.y - 0.7, 1.4, 1.4)
      }
      sparks = sparks.filter((p) => p.age < p.life)
      if (!sparks.length) c.clearRect(0, 0, cv.clientWidth, cv.clientHeight)
    })

    return () => {
      stop()
      unsub()
      io.disconnect()
      ro.disconnect()
      s.removeEventListener('pointermove', onMove)
      humLevel(0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <section ref={sec} id="arsenal" className="chapter chapter--arsenal" aria-labelledby="arsenal-title">
      <div className="chapter__inner">
        <ChapterHead chapter={ch} />
        <SoundToggle />
      </div>
      <div className="chapter__inner rack">
        {arsenal.map((b, i) => (
          <Saber key={b.id} blade={b} index={i} onLit={onLit} />
        ))}
      </div>
      <canvas ref={canvas} className="arsenal__sparks" aria-hidden="true" />
    </section>
  )
}
