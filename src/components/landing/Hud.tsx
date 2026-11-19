import { forwardRef } from 'react'
import { profile } from '../../content/profile'
import { ArrowDownRight, ArrowUpRight, RegMark, Reticle } from '../icons'

export const TopBar = forwardRef<HTMLElement, { touch: boolean }>(function TopBar({ touch }, ref) {
  const { links } = profile
  return (
    <header ref={ref} className="topbar hud">
      <div className="topbar__id">
        <a className="monogram" href="#top" aria-label={`${profile.name.first} ${profile.name.last}, back to top`}>
          <RegMark />
        </a>
        <p className="topbar__hint">
          <Reticle className="topbar__hint-icon" />
          {touch ? 'Tap the sky to fire' : 'Click the sky to fire'}
        </p>
      </div>
      <nav className="topbar__nav" aria-label="Elsewhere">
        <a href={links.github} target="_blank" rel="noreferrer">
          GitHub
        </a>
        <a href={links.linkedin} target="_blank" rel="noreferrer">
          LinkedIn
        </a>
        <a href={links.resume} target="_blank" rel="noreferrer">
          Résumé
        </a>
        <a className="topbar__transmit" href={`mailto:${links.email}`}>
          Transmit <ArrowUpRight />
        </a>
      </nav>
    </header>
  )
})

export const Slip = forwardRef<HTMLElement, { onEnlist: () => void }>(function Slip({ onEnlist }, ref) {
  return (
    <aside ref={ref} className="slip hud" aria-label="Introduction">
      <p className="slip__text">{profile.summary}</p>
      <a
        className="slip__cta"
        href="#dossier"
        onClick={(e) => {
          e.preventDefault()
          onEnlist()
        }}
      >
        <span>Join the Rebellion</span>
        <ArrowDownRight className="slip__arrow" />
      </a>
    </aside>
  )
})

/** Corner registration targets and a press colour bar: this is a proof straight off the press. */
export const PrintMarks = forwardRef<HTMLDivElement>(function PrintMarks(_, ref) {
  return (
    <div ref={ref} className="marks" aria-hidden="true">
      <RegMark className="marks__reg marks__reg--tl" />
      <RegMark className="marks__reg marks__reg--tr" />
      <RegMark className="marks__reg marks__reg--bl" />
      <RegMark className="marks__reg marks__reg--br" />
      <div className="marks__bar">
        <i style={{ background: 'var(--ink-navy)' }} />
        <i style={{ background: 'var(--ink-red)' }} />
        <i style={{ background: 'var(--ink-orange)' }} />
        <i style={{ background: 'var(--ink-mustard)' }} />
        <i style={{ background: 'var(--paper)' }} />
      </div>
    </div>
  )
})
