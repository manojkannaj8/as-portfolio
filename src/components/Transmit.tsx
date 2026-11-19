import { profile } from '../content/profile'
import { ArrowUpRight } from './icons'

/** Closing frame: the open channel. */
export function Transmit() {
  const { links, name } = profile
  return (
    <footer id="transmit" className="transmit">
      <p className="transmit__lead">Open a channel</p>
      <a className="transmit__mail" href={`mailto:${links.email}`}>
        {links.email}
        <ArrowUpRight />
      </a>
      <div className="transmit__foot">
        <span>
          {name.first} {name.last}
        </span>
        <nav aria-label="Profiles">
          <a href={links.github} target="_blank" rel="noreferrer">GitHub</a>
          <a href={links.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
          <a href={links.resume} target="_blank" rel="noreferrer">Résumé</a>
        </nav>
      </div>
    </footer>
  )
}
