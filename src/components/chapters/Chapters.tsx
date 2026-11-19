import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { registerReveals } from '../../motion/reveal'
import { Missions } from './Missions'
import { Service } from './Service'
import { Honours } from './Honours'
import { Academy } from './Academy'
import { Arsenal } from './Arsenal'
import { Hyperspace } from './Hyperspace'

/** The journey after the landing: five chapters, each arriving by coming into registration. */
export function Chapters() {
  const ref = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const ctx = gsap.context(() => registerReveals(ref.current!), ref)
    // the landing pin above changes layout height; recalc once fonts settle
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
    return () => ctx.revert()
  }, [])
  return (
    <div ref={ref} className="chapters">
      <Missions />
      <Service />
      <Honours />
      <Academy />
      <Hyperspace />
      <Arsenal />
    </div>
  )
}
