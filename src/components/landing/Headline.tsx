import { forwardRef } from 'react'
import { profile } from '../../content/profile'

type Props = { variant: 'ink' | 'outline' }

/**
 * The name, set like the poster's own lettering. Two copies exist: the printed ink
 * version on the poster, and an outlined schematic version in the blueprint world.
 * Each word carries data-text so its misregistered ink ghosts can be drawn in CSS.
 */
export const Headline = forwardRef<HTMLDivElement, Props>(function Headline({ variant }, ref) {
  const { first, last } = profile.name
  const words = (
    <>
      <span className="word word--first" data-text={first}>
        {first}
      </span>{' '}
      <span className="word word--last" data-text={last}>
        {last}
      </span>
    </>
  )
  if (variant === 'ink') {
    return (
      <div ref={ref} className="headline headline--ink">
        <h1 className="headline__h">{words}</h1>
      </div>
    )
  }
  return (
    <div ref={ref} className="headline headline--outline" aria-hidden="true">
      <div className="headline__h">{words}</div>
    </div>
  )
})
