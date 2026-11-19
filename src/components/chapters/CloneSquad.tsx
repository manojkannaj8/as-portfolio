import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { reducedMotion } from '../../motion/env'

/**
 * A squadron drawn as an engineering schematic: identical units, line for line, in formation.
 * One unit stands forward in red ink, the co-lead. The units march in on first view and
 * halt together, pulling into register like everything else in this world.
 */

const UNIT = (
  <>
    {/* legs and boots */}
    <path d="M20 77l-1 27h9l1-27zM31 77l1 27h9l-1-27z" />
    <path d="M19 104h9v4h-9zM32 104h9v4h-9z" />
    <path d="M19.5 108l-.5 24h9l-.5-24zM32.5 108l-.5 24h9l-.5-24z" />
    <path d="M18 132h10l1 8H16zM32 132h10l2 8H31z" />
    {/* torso, belt, chest plate */}
    <path d="M17 47c4-3 22-3 26 0l-2 23c-4 3-18 3-22 0z" />
    <path d="M19 71h22v5H19z" />
    <path d="M27 71.5h6v4h-6zM27 76h6l-2 6h-2z" />
    <path d="M21 49c4-2 14-2 18 0l-2 11-7 3-7-3z" />
    <path d="M22 64h16M23 67.5h14" />
    {/* helmet */}
    <path d="M25 40h10v5H25z" />
    <path d="M18 27c-1-16 25-16 24 0l1 8c0 3-2 5-5 6H22c-3-1-5-3-5-6z" />
    <path d="M18.5 22h23" />
    <path style={{ fill: 'var(--visor)' }} d="M20 24h20l-1 5h-6l-2 4h-2l-2-4h-6z" />
    <path style={{ fill: 'var(--crest)' }} d="M28.5 12.5h3V22h-3z" />
    <path d="M22.5 35.5h4M33.5 35.5h4" />
    {/* pauldrons and arms */}
    <path style={{ fill: 'var(--pauldron)' }} d="M8 49c1-6 9-7 11-2l-1 9-9 1z" />
    <path d="M41 47c2-5 10-4 11 2l-1 8-9-1z" />
    <path d="M10 57l-1 12 6 1 2-13zM43 57l1 11h6V57z" />
    {/* carbine across the chest, then the hands that hold it */}
    <path d="M5 86l42-26 3 4L8 90zM47 60l9-5M5 86l-3 6 4 1 2-3M27 76l3 5 3-2-3-5" />
    <path d="M9 70l4 12 6-3-4-10zM44 67l-8-4 2-4 11 6z" />
  </>
)

type Placed = { x: number; y: number; s: number; rank: number; lead?: boolean }

function formation(compact: boolean): { w: number; h: number; units: Placed[]; lead: Placed } {
  const w = compact ? 420 : 1200
  const h = compact ? 230 : 330
  const step = compact ? 30 : 46
  const files = compact ? [6, 5, 5] : [12, 11, 10]
  const scales = compact ? [0.5, 0.62, 0.76] : [0.58, 0.76, 0.98]
  const start = compact ? 104 : 210
  const units: Placed[] = []
  for (let r = 0; r < 3; r++) {
    const s = scales[r]
    const n = files[r]
    const xs = start + (2 - r) * (compact ? 10 : 24)
    const xe = w - 30 * s - (compact ? 10 : 20)
    const gap = (xe - xs) / (n - 1)
    const base = h - (2 - r) * step
    for (let f = 0; f < n; f++) units.push({ x: xs + f * gap - 30 * s, y: base - 140 * s, s, rank: r })
  }
  const ls = compact ? 0.9 : 1.14
  const lead = { x: compact ? 28 : 74, y: h + 4 - 140 * ls, s: ls, rank: 3, lead: true }
  return { w, h, units, lead }
}

export function CloneSquad({ compact, caption }: { compact: boolean; caption: string }) {
  const ref = useRef<SVGSVGElement>(null)
  const { w, h, units, lead } = formation(compact)

  useLayoutEffect(() => {
    const svg = ref.current!
    const ctx = gsap.context(() => {
      const all = gsap.utils.toArray<SVGGElement>('.unit', svg)
      const leadEl = svg.querySelector('.unit--lead')
      const tag = svg.querySelectorAll('.squad__tag')
      if (reducedMotion()) {
        gsap.set(tag, { opacity: 1 })
        return
      }
      const tl = gsap.timeline({ scrollTrigger: { trigger: svg, start: 'top 80%', once: true } })
      // march in by rank, back rank first; each step is a small bob
      all.forEach((u) => {
        const rank = Number(u.dataset.rank)
        const d = 0.18 * (2 - Math.min(rank, 2)) + Math.random() * 0.12
        tl.fromTo(u, { x: -160 - rank * 40, opacity: 0 }, { x: 0, opacity: 1, duration: 1.6, ease: 'power2.out' }, d)
        tl.fromTo(u, { y: 0 }, { y: -3, duration: 0.2, ease: 'sine.inOut', yoyo: true, repeat: 7 }, d)
      })
      // halt: one unison stamp, then the co-lead's markings flood in red ink
      tl.to(all, { y: 2, duration: 0.07, ease: 'power1.in', yoyo: true, repeat: 1 }, '>-0.1')
      if (leadEl) tl.fromTo(leadEl, { '--flood': 0 }, { '--flood': 1, duration: 0.6, ease: 'power2.out' }, '<')
      tl.fromTo(tag, { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out' }, '<0.15')
    }, svg)
    return () => ctx.revert()
  }, [compact])

  const lx = lead.x + 30 * lead.s
  const ly = lead.y + 4
  // crop the sheet to the drawing: from the caption (or back rank) down to the ground
  const top = Math.floor(Math.min(ly - 44, Math.min(...units.map((u) => u.y))) - 4)
  return (
    <figure className="squad">
      <svg ref={ref} className="squad__svg" viewBox={`0 ${top} ${w} ${h + 10 - top}`} role="img" aria-label={`Schematic of a squadron in formation, one unit forward in red: ${caption}`}>
        <defs>
          <g id="unit">{UNIT}</g>
        </defs>
        <path className="squad__ground" d={`M0 ${h + 2}H${w}`} />
        {units.map((u, i) => (
          <g key={i} className={`unit unit--r${u.rank}`} data-rank={u.rank}>
            <use href="#unit" transform={`translate(${u.x.toFixed(1)} ${u.y.toFixed(1)}) scale(${u.s.toFixed(3)})`} />
          </g>
        ))}
        <g className="unit unit--lead" data-rank={3}>
          <use href="#unit" transform={`translate(${lead.x} ${lead.y}) scale(${lead.s})`} />
        </g>
        <g className="squad__tag">
          <path d={`M${lx} ${ly}V${ly - 26}H${lx + (compact ? 70 : 120)}`} />
          <circle cx={lx} cy={ly} r="3" />
          <text x={lx + (compact ? 76 : 128)} y={ly - 22}>
            {caption}
          </text>
        </g>
      </svg>
    </figure>
  )
}
