/** Motion environment shared by every animation system. */

const query = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null

export const reducedMotion = () => !!query?.matches

export function onReducedMotionChange(cb: (reduced: boolean) => void) {
  if (!query) return () => {}
  const h = () => cb(query.matches)
  query.addEventListener('change', h)
  return () => query.removeEventListener('change', h)
}

export const finePointer = () =>
  typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches

export const dpr = () => Math.min(window.devicePixelRatio || 1, 1.75)

/**
 * A rAF loop that only runs while `active()` is true and the tab is visible.
 * Returns a stop function.
 */
export function loop(tick: (dt: number, t: number) => void) {
  let raf = 0
  let last = performance.now()
  let running = true
  const frame = (now: number) => {
    if (!running) return
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    tick(dt, now / 1000)
    raf = requestAnimationFrame(frame)
  }
  const onVis = () => {
    if (document.hidden) cancelAnimationFrame(raf)
    else if (running) {
      last = performance.now()
      raf = requestAnimationFrame(frame)
    }
  }
  document.addEventListener('visibilitychange', onVis)
  raf = requestAnimationFrame(frame)
  return () => {
    running = false
    cancelAnimationFrame(raf)
    document.removeEventListener('visibilitychange', onVis)
  }
}
