import type { Pt } from './geometry'

/** Landmarks on the painted poster, in plate units (measured from the source art). */

/** Cannon tips of the hero fighter; bolts leave from here. */
export const CANNONS: Pt[] = [
  [810, 491],
  [946, 724],
]

/** Firing heading, parallel to the painted laser streaks. */
export const HEADING: Pt = (() => {
  const dx = 1
  const dy = 0.462
  const len = Math.hypot(dx, dy)
  return [dx / len, dy / len] as const
})()

/** The planet is a true circle in the art. */
export const PLANET = { cx: 1428, cy: 656, r: 200 }

/** Region the distant fleet traffic crosses (top-left sky), and its heading. */
export const FLEET_LANE = { x0: 60, x1: 760, y0: 40, y1: 360, dir: [0.92, -0.39] as Pt }
