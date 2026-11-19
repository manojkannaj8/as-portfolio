import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { cameraFor, type Rect } from '../scene/geometry'
import { decode } from './decode'

gsap.registerPlugin(ScrollTrigger)

/**
 * The scroll story for the landing: the poster is scanned into its own blueprint,
 * the camera pulls back onto a drafting sheet, the name becomes the title block,
 * and the engineering callouts are drawn in. One pinned, scrubbed timeline.
 */
export type StoryEls = {
  section: HTMLElement
  stage: HTMLElement
  posterWorld: HTMLElement
  bpWorld: HTMLElement
  beam: HTMLElement
  cams: HTMLElement[] // poster camera, blueprint camera
  bpPlate: HTMLElement
  outline: HTMLElement
  slot: HTMLElement
  fadeOut: Element[] // HUD that leaves as the scan starts
  frame: Element[]
  colItems: Element[]
  callouts: { dot: Element; lines: Element[]; label?: Element }[]
}

export type StoryOpts = {
  vw: number
  vh: number
  hero: Rect
  dossier: Rect
  reduced: boolean
  onPosterVisible: (visible: boolean) => void
}

const T_SCAN = 0.6
const T_PULL = 4.2
const T_END = 10

export function buildStory(els: StoryEls, o: StoryOpts) {
  const { vw, vh, reduced } = o

  // where the outlined name must travel to become the title block
  // measure at rest: a previous build may have left the name mid-flight
  els.outline.style.removeProperty('--hs')
  els.outline.style.removeProperty('transform')
  const h = els.outline.getBoundingClientRect()
  // --hs is authored as a CSS expression; the resolved size lives on the big word
  const hs = parseFloat(getComputedStyle(els.outline.querySelector('.word--last')!).fontSize) || 160
  const slotW = els.slot.getBoundingClientRect().width
  const k = Math.min(1, slotW / h.width)
  els.slot.style.height = `${h.height * k}px`
  const s = els.slot.getBoundingClientRect()
  // the headline is anchored bottom-left, so it shrinks toward its baseline corner
  const flip = {
    x: s.left - h.left,
    y: s.top + h.height * k - h.bottom,
    hs: hs * k,
  }

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: els.section,
      start: 'top top',
      end: () => `+=${Math.round(vh * 2.8)}`,
      pin: els.stage,
      scrub: reduced ? true : 0.7,
      anticipatePin: 1,
    },
  })

  let posterVisible = true
  const coord = els.beam.querySelector<HTMLElement>('.beam__coord')
  let lastX = -1
  tl.eventCallback('onUpdate', () => {
    // the readout tracks the scan head in plate units
    if (coord) {
      const p = Math.min(1, Math.max(0, (tl.time() - T_SCAN) / (T_PULL - T_SCAN)))
      const x = Math.round(gsap.parseEase('power1.inOut')(p) * 1672)
      if (x !== lastX) {
        lastX = x
        coord.textContent = `X ${String(x).padStart(4, '0')} · Y 0941`
      }
    }
    const v = tl.time() < T_PULL
    if (v !== posterVisible) {
      posterVisible = v
      o.onPosterVisible(v)
    }
  })

  // the interface steps aside
  tl.fromTo(els.fadeOut, { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: 18, duration: 0.65, ease: 'power2.in', immediateRender: false }, 0.05)

  // scan: blueprint world is revealed behind a travelling beam
  tl.fromTo(els.bpWorld, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: T_PULL - T_SCAN, ease: 'power1.inOut' }, T_SCAN)
  tl.fromTo(els.beam, { x: 0 }, { x: vw, duration: T_PULL - T_SCAN, ease: 'power1.inOut' }, T_SCAN)
  tl.fromTo(els.beam, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 }, T_SCAN)
  tl.to(els.beam, { autoAlpha: 0, duration: 0.2 }, T_PULL - 0.2)
  tl.set(els.posterWorld, { autoAlpha: 0 }, T_PULL)

  const target = cameraFor(o.hero, o.dossier)

  if (!reduced) {
    // a slow push while scanning, then the pull back onto the sheet
    tl.fromTo(els.cams, { x: 0, y: 0, scale: 1 }, { x: -vw * 0.03, y: -vh * 0.03, scale: 1.06, duration: T_PULL - T_SCAN, ease: 'power1.inOut', immediateRender: false }, T_SCAN)
    tl.to(els.cams[1], { ...target, duration: 1.9, ease: 'power3.inOut' }, T_PULL)
    tl.to(els.outline, { x: flip.x, y: flip.y, '--hs': `${flip.hs}px`, duration: 1.9, ease: 'power3.inOut' }, T_PULL)
  } else {
    tl.to([els.bpPlate, els.outline], { autoAlpha: 0, duration: 0.4 }, T_PULL)
    tl.set(els.cams[1], target, T_PULL + 0.4)
    tl.set(els.outline, { x: flip.x, y: flip.y, '--hs': `${flip.hs}px` }, T_PULL + 0.4)
    tl.to([els.bpPlate, els.outline], { autoAlpha: 1, duration: 0.4 }, T_PULL + 0.45)
  }

  tl.fromTo(els.frame, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut' }, T_PULL + 0.9)
  tl.fromTo(els.colItems, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.3, ease: 'power2.out' }, T_PULL + 1.6)

  els.callouts.forEach((c, i) => {
    const at = T_PULL + 1.8 + i * 0.45
    tl.fromTo(c.dot, { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.3, ease: 'back.out(3)' }, at)
    if (c.lines.length) tl.fromTo(c.lines, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.5, stagger: 0.35, ease: 'power2.inOut' }, at + 0.1)
    if (c.label) {
      tl.fromTo(c.label, { autoAlpha: 0, x: -6 }, { autoAlpha: 1, x: 0, duration: 0.5, ease: 'power2.out' }, at + 0.7)
      const body = c.label.querySelector<HTMLElement>('.callout-label__body')
      // values type themselves in as the label arrives (scrolling forward only)
      if (body)
        tl.call(() => {
          if (tl.scrollTrigger?.direction !== -1) decode(body, 0.65)
        }, [], at + 0.72)
    }
  })

  tl.to({}, { duration: 0.01 }, T_END)
  return tl
}

/** Scroll position at which the dossier is fully drawn. */
export const dossierScrollY = (tl: gsap.core.Timeline) => {
  const st = tl.scrollTrigger
  if (!st) return 0
  return st.start + (st.end - st.start) * 0.94
}
