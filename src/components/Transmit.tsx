import { useRef, useState } from 'react'
import { profile } from '../content/profile'
import { ArrowUpRight, RegMark } from './icons'

/** A carrier wave drawn as one polyline; it comes alive (CSS) when the channel is hovered. */
function Wave() {
  const pts = Array.from({ length: 121 }, (_, i) => {
    const x = i * 5
    const env = Math.sin((i / 120) * Math.PI)
    const y = 30 + Math.sin(i * 0.55) * 18 * env * (0.6 + 0.4 * Math.sin(i * 0.13))
    return `${x},${y.toFixed(1)}`
  }).join(' ')
  return (
    <svg className="transmit__wave" viewBox="0 0 600 60" preserveAspectRatio="none" aria-hidden="true">
      <path className="transmit__axis" d="M0 30H600" />
      <polyline points={pts} />
    </svg>
  )
}

/** Closing frame: the open channel. */
export function Transmit() {
  const { links, name } = profile
  const [sent, setSent] = useState(false)
  const timer = useRef(0)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(links.email)
      setSent(true)
      clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setSent(false), 2600)
    } catch {
      window.location.href = `mailto:${links.email}`
    }
  }

  const home = (e: React.MouseEvent) => {
    e.preventDefault()
    // scrolling back up plays the scan in reverse: the dossier becomes the poster again
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }

  return (
    <footer id="transmit" className="transmit">
      <div className="transmit__inner">
        <p className="transmit__lead">
          <span className="transmit__num">VI</span> Open a channel
        </p>
        <div className="transmit__channel">
          <a className="transmit__mail" href={`mailto:${links.email}`}>
            {/* break before the @ on narrow screens, never mid-word */}
            <span className="transmit__addr">
              {links.email.split('@')[0]}
              <wbr />@{links.email.split('@')[1]}
            </span>
            <ArrowUpRight />
          </a>
          <Wave />
        </div>
        <div className="transmit__actions">
          <button className={`transmit__copy ${sent ? 'is-sent' : ''}`} type="button" onClick={copy}>
            <span className="transmit__copy-dot" aria-hidden="true" />
            {sent ? 'Transmission sent · address copied' : 'Copy address'}
          </button>
          <span className="visually-hidden" aria-live="polite">
            {sent ? 'Email address copied to clipboard' : ''}
          </span>
          <a className="transmit__home" href="#top" onClick={home}>
            <RegMark />
            Return to the poster
          </a>
        </div>
      </div>
      <div className="transmit__foot">
        <span>
          {name.first} {name.last} · {profile.role}
        </span>
        <nav aria-label="Profiles">
          <a href={links.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href={links.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <a href={links.resume} target="_blank" rel="noreferrer">
            Résumé
          </a>
        </nav>
      </div>
    </footer>
  )
}
