import { dpr } from './env'

/**
 * Foreground atmosphere in screen space: print-dust motes and a few slow stars at three depths.
 * Depth drives size, brightness, drift speed and how far each mote answers the pointer.
 */
type Mote = { x: number; y: number; z: number; r: number; tw: number; ph: number; vx: number; vy: number }

export class Dust {
  private ctx: CanvasRenderingContext2D
  private motes: Mote[] = []
  private w = 0
  private h = 0
  private d = 1
  /** pointer offset, -1..1 */
  px = 0
  py = 0

  constructor(private canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!
  }

  resize(w: number, h: number) {
    this.w = w
    this.h = h
    this.d = dpr()
    this.canvas.width = Math.round(w * this.d)
    this.canvas.height = Math.round(h * this.d)
    const count = Math.round(Math.min(90, (w * h) / 16000))
    this.motes = Array.from({ length: count }, () => {
      const z = Math.random() ** 1.6 // most motes far away
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        z,
        r: 0.5 + z * 1.9,
        tw: 0.4 + Math.random() * 1.6,
        ph: Math.random() * Math.PI * 2,
        vx: (Math.random() * 0.6 + 0.2) * (4 + z * 14),
        vy: -(Math.random() * 0.4 + 0.1) * (2 + z * 6),
      }
    })
  }

  step(dt: number, t: number) {
    const { ctx, w, h } = this
    ctx.setTransform(this.d, 0, 0, this.d, 0, 0)
    ctx.clearRect(0, 0, w, h)
    for (const m of this.motes) {
      m.x += m.vx * dt
      m.y += m.vy * dt
      if (m.x > w + 10) m.x = -10
      if (m.y < -10) m.y = h + 10
      const ox = -this.px * (4 + m.z * 26)
      const oy = -this.py * (3 + m.z * 18)
      const a = (0.18 + m.z * 0.55) * (0.65 + 0.35 * Math.sin(t * m.tw + m.ph))
      ctx.fillStyle = `rgba(239,226,196,${a})`
      ctx.beginPath()
      ctx.arc(m.x + ox, m.y + oy, m.r, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}
