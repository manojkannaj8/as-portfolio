import { reducedMotion } from './env'

const GLYPHS = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789/·+-'
const running = new WeakMap<Element, number>()

/**
 * Teletype decode: characters resolve left to right out of a scramble of glyphs.
 * The final text is kept in data-final so repeated calls never compound.
 */
export function decode(el: HTMLElement, duration = 0.7) {
  const final = (el.dataset.final ??= el.textContent ?? '')
  if (reducedMotion()) {
    el.textContent = final
    return
  }
  cancelAnimationFrame(running.get(el) ?? 0)
  const start = performance.now()
  const frame = (now: number) => {
    const p = Math.min(1, (now - start) / (duration * 1000))
    const solved = Math.floor(p * final.length)
    let out = final.slice(0, solved)
    for (let i = solved; i < final.length; i++) {
      const c = final[i]
      out += c === ' ' ? ' ' : GLYPHS[(Math.random() * GLYPHS.length) | 0]
    }
    el.textContent = out
    if (p < 1) running.set(el, requestAnimationFrame(frame))
    else el.textContent = final
  }
  running.set(el, requestAnimationFrame(frame))
}
