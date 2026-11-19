import { CANNONS, FLEET_LANE, HEADING } from '../scene/anchors'
import { PLATE_W, type Rect } from '../scene/geometry'
import { dpr } from './env'

/**
 * Plate-space effects drawn over the painting: laser volleys leaving the hero fighter's
 * cannons along the painted streaks, and far-off fleet traffic crossing the upper sky.
 * The canvas is sized to the plate rect; all maths happens in plate units.
 */

type Bolt = { x: number; y: number; age: number; len: number; speed: number; hue: 'red' | 'amber'; dx: number; dy: number; left: number }
type Burst = { x: number; y: number; age: number; sparks: { a: number; v: number }[] }
type Flash = { x: number; y: number; age: number }
type Ship = { x: number; y: number; speed: number; age: number; life: number; size: number }

export class PlateFx {
  private ctx: CanvasRenderingContext2D
  private scale = 1
  private bolts: Bolt[] = []
  private flashes: Flash[] = []
  private bursts: Burst[] = []
  private ships: Ship[] = []
  private nextVolley = 2.6
  private nextShip = 0.8
  private queue: { at: number; tip: number; target?: readonly [number, number] }[] = []
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

  /**
   * Fire at a point on the plate (plate units). Bolts converge on the target and burst there.
   * Targets behind the fighter's nose fall back to a straight volley along the heading.
   */
  volleyAt(x: number, y: number) {
    if (x < CANNONS[0][0] + 80) return this.volley()
    const t = [x, y] as const
    this.queue.push({ at: this.clock, tip: 0, target: t }, { at: this.clock + 0.08, tip: 1, target: t })
    this.queue.push({ at: this.clock + 0.2, tip: 0, target: t }, { at: this.clock + 0.28, tip: 1, target: t })
  }

  private spawnBolt(tip: number, target?: readonly [number, number]) {
    const [x, y] = CANNONS[tip]
    let [dx, dy] = HEADING
    let left = Infinity
    if (target) {
      const vx = target[0] - x
      const vy = target[1] - y
      left = Math.hypot(vx, vy)
      dx = vx / left
      dy = vy / left
    }
    this.bolts.push({ x, y, age: 0, len: 150 + Math.random() * 40, speed: 2300 + Math.random() * 300, hue: tip ? 'amber' : 'red', dx, dy, left })
    this.flashes.push({ x, y, age: 0 })
  }

  private spawnBurst(x: number, y: number) {
    const sparks = Array.from({ length: 9 }, () => ({ a: Math.random() * Math.PI * 2, v: 120 + Math.random() * 220 }))
    this.bursts.push({ x, y, age: 0, sparks })
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
        this.spawnBolt(q.tip, q.target)
        return false
      }
      return true
    })
    for (const b of this.bolts) {
      b.age += dt
      const d = b.speed * dt
      b.x += b.dx * d
      b.y += b.dy * d
      b.left -= d
      if (b.left <= 0 && b.left > -d) {
        // reached the target: burst, then let the tail run out
        this.spawnBurst(b.x + b.dx * b.left, b.y + b.dy * b.left)
        b.len = Math.min(b.len, 60)
      }
    }
    this.bolts = this.bolts.filter((b) => b.x - b.len * b.dx < PLATE_W + 40 && b.left > -b.len)
    for (const u of this.bursts) u.age += dt
    this.bursts = this.bursts.filter((u) => u.age < 0.5)
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

    for (const u of this.bursts) {
      const k = u.age / 0.5
      const e = 1 - (1 - k) ** 3
      ctx.strokeStyle = `rgba(255,214,170,${0.8 * (1 - k)})`
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(u.x, u.y, 6 + 34 * e, 0, Math.PI * 2)
      ctx.stroke()
      const g = ctx.createRadialGradient(u.x, u.y, 0, u.x, u.y, 30)
      g.addColorStop(0, `rgba(255,240,215,${0.9 * (1 - k) ** 2})`)
      g.addColorStop(1, 'rgba(242,123,41,0)')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(u.x, u.y, 30, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = `rgba(255,170,90,${0.9 * (1 - k)})`
      ctx.lineWidth = 1.6
      for (const sp of u.sparks) {
        const r0 = sp.v * e * 0.25
        const r1 = r0 + 10 * (1 - k)
        ctx.beginPath()
        ctx.moveTo(u.x + Math.cos(sp.a) * r0, u.y + Math.sin(sp.a) * r0)
        ctx.lineTo(u.x + Math.cos(sp.a) * r1, u.y + Math.sin(sp.a) * r1)
        ctx.stroke()
      }
    }

    for (const b of this.bolts) {
      // a bolt that has hit its target is clipped at the impact point
      const head = b.left < 0 ? b.left : 0
      const hx = b.x + b.dx * head
      const hy = b.y + b.dy * head
      const tx = b.x - b.dx * b.len
      const ty = b.y - b.dy * b.len
      if ((hx - tx) * b.dx + (hy - ty) * b.dy <= 0) continue
      const col = b.hue === 'red' ? '227,64,28' : '242,123,41'
      // glow
      let g = ctx.createLinearGradient(tx, ty, hx, hy)
      g.addColorStop(0, `rgba(${col},0)`)
      g.addColorStop(1, `rgba(${col},0.5)`)
      ctx.strokeStyle = g
      ctx.lineWidth = 11
      ctx.beginPath()
      ctx.moveTo(tx, ty)
      ctx.lineTo(hx, hy)
      ctx.stroke()
      // core
      g = ctx.createLinearGradient(tx, ty, hx, hy)
      g.addColorStop(0, `rgba(${col},0)`)
      g.addColorStop(0.6, `rgba(${col},0.95)`)
      g.addColorStop(1, 'rgba(255,238,210,1)')
      ctx.strokeStyle = g
      ctx.lineWidth = 3.2
      ctx.beginPath()
      ctx.moveTo(tx, ty)
      ctx.lineTo(hx, hy)
      ctx.stroke()
    }
    ctx.globalCompositeOperation = 'source-over'
  }

  clear() {
    this.bolts = []
    this.flashes = []
    this.bursts = []
    this.ships = []
    this.queue = []
    this.ctx.setTransform(1, 0, 0, 1, 0, 0)
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }
}
