import { forwardRef } from 'react'
import { profile } from '../../content/profile'

type Props = { variant: 'ink' | 'outline' }

/** Each letter is its own piece of type, so it can come into register on its own. */
const Letters = ({ text }: { text: string }) => (
  <>
    {Array.from(text).map((c, i) => (
      <span key={i} className="ch" data-text={c} aria-hidden="true">
        {c}
      </span>
    ))}
  </>
)

/**
 * The name, set like the poster's own lettering. Two copies exist: the printed ink
 * version on the poster, and an outlined schematic version in the blueprint world.
 * Every letter carries data-text so its misregistered ink ghosts can be drawn in CSS.
 */
export const Headline = forwardRef<HTMLDivElement, Props>(function Headline({ variant }, ref) {
  const { first, last } = profile.name
  const words = (
    <>
      <span className="word word--first">
        <Letters text={first} />
      </span>{' '}
      <span className="word word--last">
        <Letters text={last} />
      </span>
    </>
  )
  if (variant === 'ink') {
    return (
      <div ref={ref} className="headline headline--ink">
        <h1 className="headline__h" aria-label={`${first} ${last}`}>
          {words}
        </h1>
      </div>
    )
  }
  return (
    <div ref={ref} className="headline headline--outline" aria-hidden="true">
      <div className="headline__h">{words}</div>
    </div>
  )
})
