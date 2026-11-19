import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { arsenal, chapters, type Blade } from '../../content/chapters'
import { reducedMotion } from '../../motion/env'
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

function Saber({ blade, index }: { blade: Blade; index: number }) {
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
            // the engraved names stay put once revealed; only the blade toggles
            gsap.to(items, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', stagger: 0.05, delay: 0.12 })
          }),
      })
    }, el)
    return () => ctx.revert()
  }, [index])

  const toggle = () => {
    const t = tl.current
    const next = !lit
    setLit(next)
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
    <div ref={ref} className={`saber saber--${blade.colour} ${lit ? '' : 'is-off'}`}>
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

export function Arsenal() {
  const ch = chapters.find((c) => c.id === 'arsenal')!
  return (
    <section id="arsenal" className="chapter chapter--arsenal" aria-labelledby="arsenal-title">
      <div className="chapter__inner">
        <ChapterHead chapter={ch} />
      </div>
      <div className="chapter__inner rack">
        {arsenal.map((b, i) => (
          <Saber key={b.id} blade={b} index={i} />
        ))}
      </div>
    </section>
  )
}
