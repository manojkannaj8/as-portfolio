import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { reducedMotion } from './env'

gsap.registerPlugin(ScrollTrigger)

/**
 * Chapter entrances reuse the landing's idea: things arrive by coming into registration.
 *
 * - `.ink-title` words wipe in while their coloured ghosts (`--mx/--my/--ghost`) settle.
 * - `.reg` blocks arrive slightly offset with a chromatic fringe (`--reg`) that pulls to zero.
 * - `.draw` strokes (pathLength=1) draw on.
 *
 * Everything is set to its final state immediately when the visitor prefers reduced motion.
 */
export function registerReveals(root: HTMLElement) {
  const titles = gsap.utils.toArray<HTMLElement>('.ink-title .word', root)
  const blocks = gsap.utils.toArray<HTMLElement>('.reg', root)
  const strokes = gsap.utils.toArray<SVGElement>('.reveal-draw .draw', root)

  const nums = gsap.utils.toArray<HTMLElement>('.chapter .chead__num', root)
  const stencils = gsap.utils.toArray<HTMLElement>('.hmark__stencil', root)

  if (reducedMotion()) {
    gsap.set(nums, { '--fill': 1 })
    gsap.set(stencils, { '--r': '160%', '--os': 0.2 })
    gsap.set(titles, { clipPath: 'none', '--ghost': 0, '--mx': '0em', '--my': '0em' })
    gsap.set(blocks, { opacity: 1, x: 0, y: 0, '--reg': 0 })
    gsap.set(strokes, { strokeDashoffset: 0 })
    return
  }

  for (const w of titles) {
    gsap.fromTo(
      w,
      { clipPath: 'inset(-20% 100% -20% 0)', '--mx': '0.09em', '--my': '-0.05em', '--ghost': 1 },
      {
        clipPath: 'inset(-20% 0% -20% 0)',
        '--mx': '0em',
        '--my': '0em',
        '--ghost': 0,
        duration: 1.1,
        ease: 'power3.out',
        clearProps: 'clipPath',
        scrollTrigger: { trigger: w, start: 'top 88%', once: true },
      },
    )
  }

  // honours are sprayed on through a stencil: the paint spreads from where the can is aimed,
  // overspray haze settles back to a faint halo
  for (const st of stencils) {
    gsap
      .timeline({ scrollTrigger: { trigger: st, start: 'top 82%', once: true } })
      .fromTo(st, { '--r': '0%' }, { '--r': '160%', duration: 1.15, ease: 'power2.inOut' })
      .fromTo(st, { '--os': 1 }, { '--os': 0.2, duration: 1.4, ease: 'power2.out' }, 0.2)
  }

  // chapter numerals fill with ink as the chapter is read
  for (const n of nums) {
    const sec = n.closest('.chapter')!
    gsap.fromTo(n, { '--fill': 0 }, { '--fill': 1, ease: 'none', scrollTrigger: { trigger: sec, start: 'top 55%', end: 'bottom 75%', scrub: 0.6 } })
  }

  // seam: a scan line redraws the navy page as blueprint on the way into Service
  const cover = root.querySelector('.seam-scan__cover')
  if (cover)
    gsap.fromTo(cover, { yPercent: 0 }, { yPercent: 104, ease: 'none', scrollTrigger: { trigger: cover.parentElement!, start: 'top 92%', end: 'top 8%', scrub: 0.4 } })

  // seam: the honours sheet is laid down over the blueprint, then lifted away
  const sheet = root.querySelector<HTMLElement>('.chapter--honours')
  if (sheet) {
    gsap.fromTo(sheet, { y: 90, rotate: -1.1 }, { y: 0, rotate: 0, ease: 'power2.out', scrollTrigger: { trigger: sheet, start: 'top bottom', end: 'top 25%', scrub: 0.6 } })
    gsap.fromTo(sheet, { '--lift': 0 }, { '--lift': 1, ease: 'power1.in', immediateRender: false, scrollTrigger: { trigger: sheet, start: 'bottom 70%', end: 'bottom top', scrub: 0.6 } })
  }

  gsap.set(blocks, { opacity: 0, x: -10, y: 6, '--reg': 1 })
  ScrollTrigger.batch(blocks, {
    start: 'top 90%',
    once: true,
    onEnter: (els) =>
      gsap.to(els, { opacity: 1, x: 0, y: 0, '--reg': 0, duration: 0.9, ease: 'power3.out', stagger: 0.08, overwrite: true }),
  })

  gsap.set(strokes, { strokeDasharray: 1, strokeDashoffset: 1 })
  for (const s of strokes) {
    gsap.to(s, {
      strokeDashoffset: 0,
      duration: 1.4,
      ease: 'power2.inOut',
      scrollTrigger: { trigger: s.closest('svg') ?? s, start: 'top 85%', once: true },
    })
  }
}
