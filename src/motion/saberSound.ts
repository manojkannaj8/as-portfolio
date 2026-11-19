/**
 * Saber sound, synthesised with Web Audio: no files to load. Off by default; the visitor turns
 * it on from the Arsenal. The preference is remembered in this browser only.
 *
 * - ignite / retract: a pitch sweep through a resonant filter with a burst of noise
 * - hum: two detuned low oscillators while a blade is lit and the Arsenal is on screen;
 *   moving across a blade swells it slightly
 */
const KEY = 'saber-sound'

let ctx: AudioContext | null = null
let master: GainNode | null = null
let hum: { gain: GainNode; filter: BiquadFilterNode; oscs: OscillatorNode[] } | null = null
let enabled = false
const listeners = new Set<(on: boolean) => void>()

try {
  enabled = localStorage.getItem(KEY) === 'on'
} catch {
  /* private mode: stays off */
}

export const soundOn = () => enabled

export function onSound(cb: (on: boolean) => void) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

function ensure() {
  if (ctx) return ctx
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
  if (!AC) return null
  ctx = new AC()
  master = ctx.createGain()
  master.gain.value = 0.5
  master.connect(ctx.destination)
  return ctx
}

/** Must be called from a user gesture (the toggle click). */
export function setSound(on: boolean) {
  enabled = on
  try {
    localStorage.setItem(KEY, on ? 'on' : 'off')
  } catch {
    /* ignore */
  }
  if (on) ensure()?.resume()
  else humLevel(0)
  listeners.forEach((l) => l(on))
}

function noiseBuffer(c: AudioContext) {
  const b = c.createBuffer(1, c.sampleRate * 0.6, c.sampleRate)
  const d = b.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length)
  return b
}

/** One ignition (or retraction) sweep. `pitch` varies per blade so each sounds its own. */
export function sweep(kind: 'ignite' | 'retract', pitch = 1) {
  if (!enabled) return
  const c = ensure()
  if (!c || !master) return
  if (c.state === 'suspended') c.resume()
  const t = c.currentTime
  const up = kind === 'ignite'
  const osc = c.createOscillator()
  osc.type = 'sawtooth'
  const f0 = (up ? 60 : 180) * pitch
  const f1 = (up ? 180 : 50) * pitch
  osc.frequency.setValueAtTime(f0, t)
  osc.frequency.exponentialRampToValueAtTime(f1, t + (up ? 0.38 : 0.3))
  const filter = c.createBiquadFilter()
  filter.type = 'lowpass'
  filter.Q.value = 9
  filter.frequency.setValueAtTime(up ? 300 : 1400, t)
  filter.frequency.exponentialRampToValueAtTime(up ? 1600 : 200, t + 0.35)
  const g = c.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(0.22, t + 0.04)
  g.gain.exponentialRampToValueAtTime(0.0001, t + (up ? 0.6 : 0.4))
  osc.connect(filter).connect(g).connect(master)
  osc.start(t)
  osc.stop(t + 0.65)

  const n = c.createBufferSource()
  n.buffer = noiseBuffer(c)
  const nf = c.createBiquadFilter()
  nf.type = 'bandpass'
  nf.frequency.value = 1800
  const ng = c.createGain()
  ng.gain.setValueAtTime(up ? 0.12 : 0.06, t)
  ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.3)
  n.connect(nf).connect(ng).connect(master)
  n.start(t)
}

/** Set the hum level, 0..1. Creates the hum lazily. */
export function humLevel(level: number, swell = 0) {
  if (!ctx || !master) return
  if (!hum && level > 0 && enabled) {
    const gain = ctx.createGain()
    gain.gain.value = 0
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 320
    const oscs = [88, 90.6].map((f) => {
      const o = ctx!.createOscillator()
      o.type = 'sawtooth'
      o.frequency.value = f
      o.connect(filter)
      o.start()
      return o
    })
    filter.connect(gain).connect(master)
    hum = { gain, filter, oscs }
  }
  if (!hum) return
  const t = ctx.currentTime
  const v = enabled ? level * (0.05 + swell * 0.07) : 0
  hum.gain.gain.setTargetAtTime(v, t, 0.12)
  hum.filter.frequency.setTargetAtTime(320 + swell * 500, t, 0.08)
}
