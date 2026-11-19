import { CANNONS, FLEET_LANE, HEADING } from '../scene/anchors'
import { PLATE_W, type Rect } from '../scene/geometry'
import { dpr } from './env'

/**
 * Plate-space effects drawn over the painting: laser volleys leaving the hero fighter's
 * cannons along the painted streaks, and far-off fleet traffic crossing the upper sky.
 * The canvas is sized to the plate rect; all maths happens in plate units.
 */

type Bolt = { x: number; y: number; age: number; len: number; speed: number; hue: 'red' | 'amber' }
type Flash = { x: number; y: number; age: number }
type Ship = { x: number; y: number; speed: number; age: number; life: number; size: number }

export class PlateFx {
  private ctx: CanvasRenderingContext2D
  private scale = 1
  private bolts: Bolt[] = []
  private flashes: Flash[] = []
  private ships: Ship[] = []
  private nextVolley = 2.6
  private nextShip = 0.8
  private queue: { at: number; tip: number }[] = []
  private clock = 0
  ambient = true

  constructor(private canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!
  }

  resize(r: Rect) {
    const d = dpr()
    this.canvas.width = Math.round(r.w * d)
    this.canvas.height = Math.round(r.h * d)
    this.scale = (r.w / PLATE_W) * d
  }

  /** Fire a paired volley: upper cannon, then lower a beat later. */
  volley() {
    this.queue.push({ at: this.clock, tip: 0 }, { at: this.clock + 0.08, tip: 1 })
    this.queue.push({ at: this.clock + 0.22, tip: 0 }, { at: this.clock + 0.3, tip: 1 })
  }

  private spawnBolt(tip: number) {
    const [x, y] = CANNONS[tip]
    this.bolts.push({ x, y, age: 0, len: 150 + Math.random() * 40, speed: 2300 + Math.random() * 300, hue: tip ? 'amber' : 'red' })
    this.flashes.push({ x, y, age: 0 })
  }

  private spawnShip() {
    const { x0, x1, y0, y1 } = FLEET_LANE
    this.ships.push({
      x: x0 + Math.random() * (x1 - x0) * 0.4,
      y: y0 + (y1 - y0) * (0.35 + Math.random() * 0.65),
      speed: 50 + Math.random() * 70,
      age: 0,
      life: 5 + Math.random() * 4,
      size: 0.8 + Math.random() * 0.9,
    })
  }

  step(dt: number) {
    this.clock += dt
    if (this.ambient) {
      this.nextVolley -= dt
      if (this.nextVolley <= 0) {
        this.volley()
        this.nextVolley = 6 + Math.random() * 5
      }
      this.nextShip -= dt
      if (this.nextShip <= 0 && this.ships.length < 4) {
        this.spawnShip()
        this.nextShip = 2.2 + Math.random() * 3
      }
    }
    this.queue = this.queue.filter((q) => {
      if (q.at <= this.clock) {
        this.spawnBolt(q.tip)
        return false
      }
      return true
    })
    for (const b of this.bolts) {
      b.age += dt
      b.x += HEADING[0] * b.speed * dt
      b.y += HEADING[1] * b.speed * dt
    }
    this.bolts = this.bolts.filter((b) => b.x - b.len * HEADING[0] < PLATE_W + 40)
    for (const f of this.flashes) f.age += dt
    this.flashes = this.flashes.filter((f) => f.age < 0.14)
    const [dx, dy] = FLEET_LANE.dir
    for (const s of this.ships) {
      s.age += dt
      s.x += dx * s.speed * dt
      s.y += dy * s.speed * dt
    }
    this.ships = this.ships.filter((s) => s.age < s.life)
    this.draw()
  }

  private draw() {
    const { ctx, scale } = this
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    ctx.setTransform(scale, 0, 0, scale, 0, 0)
    ctx.globalCompositeOperation = 'lighter'
    ctx.lineCap = 'round'

    // distant traffic: a pin of light with a short ion trail
    const [dx, dy] = FLEET_LANE.dir
    for (const s of this.ships) {
      const t = s.age / s.life
      const a = Math.sin(Math.PI * t) * 0.85
      const tail = 26 * s.size
      const g = ctx.createLinearGradient(s.x - dx * tail, s.y - dy * tail, s.x, s.y)
      g.addColorStop(0, 'rgba(242,123,41,0)')
      g.addColorStop(1, `rgba(242,123,41,${0.55 * a})`)
      ctx.strokeStyle = g
      ctx.lineWidth = 1.6 * s.size
      ctx.beginPath()
      ctx.moveTo(s.x - dx * tail, s.y - dy * tail)
      ctx.lineTo(s.x, s.y)
      ctx.stroke()
      ctx.fillStyle = `rgba(255,236,200,${a})`
      ctx.beginPath()
      ctx.arc(s.x, s.y, 1.5 * s.size, 0, Math.PI * 2)
      ctx.fill()
    }

    for (const f of this.flashes) {
      const k = 1 - f.age / 0.14
      const r = 26 + 30 * (1 - k)
      const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, r)
      g.addColorStop(0, `rgba(255,240,215,${0.9 * k})`)
      g.addColorStop(0.35, `rgba(255,120,50,${0.55 * k})`)
      g.addColorStop(1, 'rgba(227,64,28,0)')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(f.x, f.y, r, 0, Math.PI * 2)
      ctx.fill()
    }

    for (const b of this.bolts) {
      const tx = b.x - HEADING[0] * b.len
      const ty = b.y - HEADING[1] * b.len
      const col = b.hue === 'red' ? '227,64,28' : '242,123,41'
      // glow
      let g = ctx.createLinearGradient(tx, ty, b.x, b.y)
      g.addColorStop(0, `rgba(${col},0)`)
      g.addColorStop(1, `rgba(${col},0.5)`)
      ctx.strokeStyle = g
      ctx.lineWidth = 11
      ctx.beginPath()
      ctx.moveTo(tx, ty)
      ctx.lineTo(b.x, b.y)
      ctx.stroke()
      // core
      g = ctx.createLinearGradient(tx, ty, b.x, b.y)
      g.addColorStop(0, `rgba(${col},0)`)
      g.addColorStop(0.6, `rgba(${col},0.95)`)
      g.addColorStop(1, 'rgba(255,238,210,1)')
      ctx.strokeStyle = g
      ctx.lineWidth = 3.2
      ctx.beginPath()
      ctx.moveTo(tx, ty)
      ctx.lineTo(b.x, b.y)
      ctx.stroke()
    }
    ctx.globalCompositeOperation = 'source-over'
  }

  clear() {
    this.bolts = []
    this.flashes = []
    this.ships = []
    this.queue = []
    this.ctx.setTransform(1, 0, 0, 1, 0, 0)
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }
}
