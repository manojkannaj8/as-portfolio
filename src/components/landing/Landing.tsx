import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { buildArrival, platesReady, prepareArrival, settleArrival, type ArrivalEls } from '../../motion/arrival'
import { Dust } from '../../motion/dust'
import { finePointer, loop, onReducedMotionChange, reducedMotion } from '../../motion/env'
import { PlateFx } from '../../motion/fx'
import { buildStory, dossierScrollY } from '../../motion/story'
import { PLANET } from '../../scene/anchors'
import { dossierRect, heroRect, isPortrait, PLATE_H, PLATE_W } from '../../scene/geometry'
import { Dossier, DossierFlow } from './Dossier'
import { Headline } from './Headline'
import { PrintMarks, Slip, TopBar } from './Hud'

gsap.registerPlugin(ScrollTrigger)
ScrollTrigger.config({ ignoreMobileResize: true })

const pct = (v: number, of: number) => `${(v / of) * 100}%`

function useStageSize(ref: React.RefObject<HTMLElement>) {
  const [size, setSize] = useState(() => ({ w: document.documentElement.clientWidth, h: window.innerHeight }))
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => {
      const w = el.clientWidth
      const h = el.clientHeight
      setSize((prev) => {
        // mobile URL bars nudge the height while scrolling; ignore small vertical changes
        const touchy = !finePointer() && w === prev.w && Math.abs(h - prev.h) < 140
        if (touchy || (w === prev.w && h === prev.h)) return prev
        return { w, h }
      })
    }
    measure()
    let t = 0
    const ro = new ResizeObserver(() => {
      clearTimeout(t)
      t = window.setTimeout(measure, 120)
    })
    ro.observe(el)
    return () => {
      ro.disconnect()
      clearTimeout(t)
    }
  }, [ref])
  return size
}

export function Landing() {
  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const posterWorldRef = useRef<HTMLDivElement>(null)
  const bpWorldRef = useRef<HTMLDivElement>(null)
  const camPosterRef = useRef<HTMLDivElement>(null)
  const camBpRef = useRef<HTMLDivElement>(null)
  const platePosterRef = useRef<HTMLDivElement>(null)
  const plateBpRef = useRef<HTMLDivElement>(null)
  const baseRef = useRef<HTMLImageElement>(null)
  const inkRefs = useRef<HTMLImageElement[]>([])
  const fxCanvasRef = useRef<HTMLCanvasElement>(null)
  const dustCanvasRef = useRef<HTMLCanvasElement>(null)
  const inkHeadRef = useRef<HTMLDivElement>(null)
  const outlineRef = useRef<HTMLDivElement>(null)
  const beamRef = useRef<HTMLDivElement>(null)
  const topbarRef = useRef<HTMLElement>(null)
  const slipRef = useRef<HTMLElement>(null)
  const slipLayerRef = useRef<HTMLDivElement>(null)
  const marksRef = useRef<HTMLDivElement>(null)
  const dossierRef = useRef<HTMLDivElement>(null)
  const halftoneRef = useRef<HTMLDivElement>(null)

  const fx = useRef<PlateFx | null>(null)
  const dust = useRef<Dust | null>(null)
  const story = useRef<gsap.core.Timeline | null>(null)
  const state = useRef({ live: false, posterVisible: true, inView: true })

  const [reduced, setReduced] = useState(reducedMotion)
  const [touch] = useState(() => !finePointer())
  useEffect(() => onReducedMotionChange(setReduced), [])

  const vp = useStageSize(stageRef)
  const hero = useMemo(() => heroRect(vp.w, vp.h), [vp])
  const dossier = useMemo(() => dossierRect(vp.w, vp.h), [vp])
  const wide = vp.w >= 1024 && !isPortrait(vp.w, vp.h)
  // short narrow screens move the callout legend out of the pinned frame
  const legendInStage = wide || vp.h >= 760

  const syncAmbient = () => {
    const s = state.current
    if (fx.current) fx.current.ambient = s.live && s.posterVisible && s.inView && !reducedMotion()
  }

  // ---------------------------------------------------------------- canvases
  // layout effect so the instances exist before the first resize below
  useLayoutEffect(() => {
    fx.current = new PlateFx(fxCanvasRef.current!)
    dust.current = new Dust(dustCanvasRef.current!)
    if (import.meta.env.DEV) Object.assign(window, { __fx: fx.current, __dust: dust.current })
  }, [])

  useLayoutEffect(() => {
    fx.current?.resize(hero)
    dust.current?.resize(vp.w, vp.h)
  }, [hero, vp])

  // ---------------------------------------------------------------- arrival (once)
  useLayoutEffect(() => {
    const els: ArrivalEls = {
      marks: Array.from(marksRef.current!.querySelectorAll('.draw')),
      base: baseRef.current!,
      inks: inkRefs.current,
      words: Array.from(inkHeadRef.current!.querySelectorAll<HTMLElement>('.word')),
      hud: [topbarRef.current!, slipRef.current!],
      halftone: halftoneRef.current!,
      stage: stageRef.current!,
    }
    const goLive = () => {
      state.current.live = true
      stageRef.current?.classList.add('is-live')
      syncAmbient()
    }
    if (reducedMotion() || window.scrollY > 40) {
      settleArrival(els)
      goLive()
      return
    }
    let cancelled = false
    let skipped = false
    let tl: gsap.core.Timeline | null = null
    const skip = () => {
      skipped = true
      if (tl && tl.progress() < 1) tl.progress(1)
    }
    const opts = { passive: true, once: true } as const
    window.addEventListener('wheel', skip, opts)
    window.addEventListener('touchmove', skip, opts)
    window.addEventListener('keydown', skip, { once: true })

    const ctx = gsap.context(() => prepareArrival(els))
    platesReady([els.base as HTMLImageElement, ...(els.inks as HTMLImageElement[])]).then(() => {
      if (cancelled) return
      ctx.add(() => {
        tl = buildArrival(els, goLive)
        if (skipped) tl.progress(1)
      })
    })
    return () => {
      cancelled = true
      window.removeEventListener('wheel', skip)
      window.removeEventListener('touchmove', skip)
      window.removeEventListener('keydown', skip)
      ctx.revert()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // portrait layout stacks the name above the slip
  useLayoutEffect(() => {
    stageRef.current?.style.setProperty('--slip-h', `${slipRef.current?.offsetHeight ?? 180}px`)
  }, [vp])

  // ---------------------------------------------------------------- scroll story
  useLayoutEffect(() => {
    const root = dossierRef.current!
    const ctx = gsap.context(() => {
      const callouts = Array.from(root.querySelectorAll<SVGGElement>('.callout')).map((g) => ({
        dot: g.querySelector('.callout__dot')!,
        lines: Array.from(g.querySelectorAll('.draw')),
        label: root.querySelector(`.callout-label[data-id="${g.dataset.id}"]`) ?? undefined,
      }))
      story.current = buildStory(
        {
          section: sectionRef.current!,
          stage: stageRef.current!,
          posterWorld: posterWorldRef.current!,
          bpWorld: bpWorldRef.current!,
          beam: beamRef.current!,
          cams: [camPosterRef.current!, camBpRef.current!],
          bpPlate: plateBpRef.current!,
          outline: outlineRef.current!,
          slot: root.querySelector<HTMLElement>('[data-slot]')!,
          fadeOut: [slipLayerRef.current!, stageRef.current!.querySelector('.topbar__hint')!],
          frame: Array.from(root.querySelectorAll('.dossier__frame, .dossier__dims .draw')),
          colItems: [
            ...Array.from(root.querySelectorAll('.col-item')),
            ...Array.from(root.querySelectorAll('.dossier__dimlabel')),
            ...Array.from(root.querySelectorAll('.callout__mark')),
          ],
          callouts,
        },
        {
          vw: vp.w,
          vh: vp.h,
          hero,
          dossier,
          reduced,
          onPosterVisible: (v) => {
            state.current.posterVisible = v
            if (!v) fx.current?.clear()
            syncAmbient()
          },
        },
      )
    }, stageRef)
    ScrollTrigger.refresh()
    return () => {
      ctx.revert()
      story.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vp, hero, dossier, reduced, wide])

  // ---------------------------------------------------------------- ambient life
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      state.current.inView = e.isIntersecting
      syncAmbient()
    })
    io.observe(sectionRef.current!)

    const target = { x: 0, y: 0 }
    const cur = { x: 0, y: 0 }
    const kick = { x: 0, y: 0 }
    let last: { x: number; y: number; t: number } | null = null
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      target.x = (e.clientX / window.innerWidth) * 2 - 1
      target.y = (e.clientY / window.innerHeight) * 2 - 1
      const now = performance.now()
      if (last) {
        const dt = Math.max(8, now - last.t)
        kick.x += ((e.clientX - last.x) / dt) * 0.02
        kick.y += ((e.clientY - last.y) / dt) * 0.02
      }
      last = { x: e.clientX, y: e.clientY, t: now }
    }
    window.addEventListener('pointermove', onMove, { passive: true })

    const plates = [platePosterRef.current!, plateBpRef.current!]
    const head = inkHeadRef.current!
    const stop = loop((dt, t) => {
      const s = state.current
      if (!s.inView) return
      const still = reducedMotion()
      if (!finePointer() && !still) {
        target.x = Math.sin(t * 0.21) * 0.35
        target.y = Math.cos(t * 0.17) * 0.25
      }
      const k = 1 - Math.exp(-dt * 3.2)
      cur.x += (target.x - cur.x) * k
      cur.y += (target.y - cur.y) * k
      const amp = still || !s.posterVisible ? 0 : 1
      const px = cur.x * amp
      const py = cur.y * amp
      for (const p of plates) p.style.translate = `${(-px * 9).toFixed(2)}px ${(-py * 6).toFixed(2)}px`
      head.style.translate = `${(px * 5).toFixed(2)}px ${(py * 3).toFixed(2)}px`
      // a fast sweep knocks the name out of register; it springs back
      const decay = Math.exp(-dt * 6)
      kick.x = Math.max(-0.12, Math.min(0.12, kick.x * decay))
      kick.y = Math.max(-0.08, Math.min(0.08, kick.y * decay))
      const kx = still || !s.live ? 0 : kick.x
      const ky = still || !s.live ? 0 : kick.y
      head.style.setProperty('--vx', `${kx.toFixed(4)}em`)
      head.style.setProperty('--vy', `${ky.toFixed(4)}em`)
      head.style.setProperty('--vg', Math.min(1, Math.hypot(kx, ky) * 14).toFixed(3))
      if (dust.current) {
        dust.current.px = px
        dust.current.py = py
        if (!still) dust.current.step(dt, t)
      }
      if (fx.current && s.posterVisible) fx.current.step(dt)
    })
    // a single still frame of dust for reduced motion
    if (reducedMotion()) dust.current?.step(0, 0)

    return () => {
      stop()
      io.disconnect()
      window.removeEventListener('pointermove', onMove)
    }
  }, [])

  const fire = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('a, button')) return
    if (!state.current.posterVisible || !state.current.live) return
    const r = platePosterRef.current!.getBoundingClientRect()
    fx.current?.volleyAt(((e.clientX - r.left) / r.width) * PLATE_W, ((e.clientY - r.top) / r.height) * PLATE_H)
  }

  const enlist = () => {
    if (!story.current) return
    window.scrollTo({ top: dossierScrollY(story.current), behavior: reduced ? 'auto' : 'smooth' })
  }

  const plateStyle = { left: hero.x, top: hero.y, width: hero.w, height: hero.h }
  const stageVars = {
    '--plate-floor': `${Math.max(0, vp.h - (hero.y + (893 / PLATE_H) * hero.h))}px`,
    '--col-w': `${Math.max(0, dossier.x - 32)}px`,
  } as React.CSSProperties
  const inks = ['key', 'cream', 'warm'] as const

  return (
    <>
      <section ref={sectionRef} className="landing" id="top">
        <div
          ref={stageRef}
          className={`stage ${isPortrait(vp.w, vp.h) ? 'stage--portrait' : ''} ${wide ? 'stage--wide' : ''}`}
          onPointerDown={fire}
          style={stageVars}
        >
          {/* ---------------- the printed poster */}
          <div ref={posterWorldRef} className="world world--poster">
            <div ref={camPosterRef} className="camera">
              <div ref={platePosterRef} className="plate" style={plateStyle}>
                <img
                  ref={baseRef}
                  className="plate__img"
                  src="/art/poster-base.webp"
                  width={PLATE_W}
                  height={PLATE_H}
                  alt="Vintage recruitment poster: a starfighter pilot in a crested helmet, a squadron of fighters streaking past, and a burnt-orange planet."
                />
                {inks.map((n, i) => (
                  <img
                    key={n}
                    ref={(el) => {
                      if (el) inkRefs.current[i] = el
                    }}
                    className={`plate__img plate__ink plate__ink--${n}`}
                    src={`/art/plate-${n}.webp`}
                    width={PLATE_W}
                    height={PLATE_H}
                    alt=""
                    aria-hidden="true"
                  />
                ))}
                <div className="glint glint--helmet" aria-hidden="true">
                  <i />
                </div>
                <div className="glint glint--visor" aria-hidden="true">
                  <i />
                </div>
                <div
                  className="planet-rim"
                  aria-hidden="true"
                  style={{
                    left: pct(PLANET.cx - PLANET.r, PLATE_W),
                    top: pct(PLANET.cy - PLANET.r, PLATE_H),
                    width: pct(PLANET.r * 2, PLATE_W),
                    height: pct(PLANET.r * 2, PLATE_H),
                  }}
                />
                <div ref={halftoneRef} className="plate__halftone" aria-hidden="true" />
                <canvas ref={fxCanvasRef} className="plate__fx" aria-hidden="true" />
                <div className="plate__fade" aria-hidden="true" />
              </div>
            </div>
            <div className="scrim" aria-hidden="true" />
            <canvas ref={dustCanvasRef} className="dust" aria-hidden="true" />
            <Headline ref={inkHeadRef} variant="ink" />
          </div>

          {/* ---------------- the same scene as an engineering drawing */}
          <div ref={bpWorldRef} className="world world--blueprint">
            <div className="sheet-grid" aria-hidden="true" />
            <div ref={camBpRef} className="camera">
              <div ref={plateBpRef} className="plate plate--bp" style={plateStyle}>
                <img className="plate__img" src="/art/blueprint.webp" width={PLATE_W} height={PLATE_H} alt="" aria-hidden="true" decoding="async" />
              </div>
            </div>
            <Headline ref={outlineRef} variant="outline" />
            <Dossier ref={dossierRef} rect={dossier} vw={vp.w} wide={wide} legend={legendInStage} />
          </div>

          <div ref={beamRef} className="beam" aria-hidden="true">
            <span className="beam__dither" />
            <span className="beam__readout">
              <span>Scanning plate</span>
              <span className="beam__coord">X 0000 · Y 0941</span>
            </span>
          </div>

          <div className="warmup" aria-hidden="true">
            <svg viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="15" stroke="currentColor" strokeWidth="1" />
              <circle cx="20" cy="20" r="8" stroke="currentColor" strokeWidth="1.2" />
              <path d="M20 2v36M2 20h36" stroke="currentColor" strokeWidth="1" />
              <circle cx="20" cy="20" r="3" fill="var(--ink-red)" />
            </svg>
            <p>Warming the press</p>
          </div>

          <PrintMarks ref={marksRef} />
          <TopBar ref={topbarRef} touch={touch} />
          {/* the scroll story fades this layer; the arrival animates the slip inside it */}
          <div ref={slipLayerRef} className="slip-layer">
            <Slip ref={slipRef} onEnlist={enlist} />
          </div>
          <div className="grain" aria-hidden="true" />
        </div>
      </section>
      {!wide && <DossierFlow legend={!legendInStage} />}
    </>
  )
}
