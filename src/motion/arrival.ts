import gsap from 'gsap'

/**
 * The arrival: the poster comes off the press. Three ink separations land out of register
 * and pull into alignment, the name is inked in with its own misregistered ghosts,
 * and only then does the interface appear. Everything shares one motion idea:
 * things arrive by coming into registration.
 */
export type ArrivalEls = {
  marks: Element[]
  base: HTMLElement
  inks: HTMLElement[] // key, cream, warm
  words: HTMLElement[] // first, last
  hud: Element[]
}

/** Hide everything that will be printed, before the first paint. */
export function prepareArrival(els: ArrivalEls) {
  gsap.set(els.base, { opacity: 0 })
  gsap.set(els.inks, { opacity: 0 })
  gsap.set(els.words, { clipPath: 'inset(-20% 105% -20% -6%)' })
  gsap.set(els.hud, { autoAlpha: 0, y: 10 })
  gsap.set(els.marks, { strokeDashoffset: 1 })
}

/** Resolve once every plate image is decoded (or after `timeout` ms, whichever first). */
export function platesReady(imgs: HTMLImageElement[], timeout = 3000) {
  const decoded = Promise.all(imgs.map((i) => i.decode().catch(() => undefined)))
  return Promise.race([decoded, new Promise((r) => setTimeout(r, timeout))])
}

export function buildArrival(els: ArrivalEls, onLive: () => void) {
  const [key, cream, warm] = els.inks
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

  tl.fromTo(els.marks, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1, stagger: 0.04, ease: 'power2.out' }, 0)

  // press passes: key (navy) first, then cream, then the warm inks
  tl.fromTo(key, { opacity: 0, xPercent: -1.6, yPercent: 1.3, scale: 1.035 }, { opacity: 1, xPercent: 0, yPercent: 0, scale: 1, duration: 1.6 }, 0.2)
  tl.fromTo(cream, { opacity: 0, xPercent: 1.9, yPercent: -1.2, scale: 1.03 }, { opacity: 1, xPercent: 0, yPercent: 0, scale: 1, duration: 1.5 }, 0.5)
  tl.fromTo(warm, { opacity: 0, xPercent: -0.9, yPercent: -1.9, scale: 1.025 }, { opacity: 1, xPercent: 0, yPercent: 0, scale: 1, duration: 1.4 }, 0.78)
  tl.set(els.base, { opacity: 1 }, 2.15)
  tl.set(els.inks, { display: 'none' }, 2.2)

  // the name is inked in, ghosts pulling into register behind the roller
  els.words.forEach((w, i) => {
    const at = 1.45 + i * 0.16
    tl.to(w, { clipPath: 'inset(-20% -6% -20% -6%)', duration: 0.9, ease: 'power4.out' }, at)
    tl.fromTo(
      w,
      { '--mx': i ? '-0.07em' : '0.09em', '--my': i ? '0.04em' : '-0.05em', '--ghost': 1 },
      { '--mx': '0em', '--my': '0em', duration: 1.3, ease: 'expo.out' },
      at,
    )
    tl.to(w, { '--ghost': 0, duration: 0.6, ease: 'power1.out' }, at + 0.9)
  })

  tl.to(els.hud, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.07, ease: 'power3.out' }, 1.9)
  tl.call(onLive, [], 2.05)
  return tl
}

/** Final state with no motion, for reduced-motion visitors and skipped arrivals. */
export function settleArrival(els: ArrivalEls) {
  gsap.set(els.base, { opacity: 1 })
  gsap.set(els.inks, { display: 'none' })
  gsap.set(els.words, { clipPath: 'none', '--ghost': 0 })
  gsap.set(els.hud, { autoAlpha: 1, y: 0 })
  gsap.set(els.marks, { strokeDashoffset: 0 })
}
