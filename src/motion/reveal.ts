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

  if (reducedMotion()) {
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
