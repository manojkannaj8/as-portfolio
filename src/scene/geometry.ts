/**
 * The poster plate is authored in its own coordinate space (the source art is 1672 × 941).
 * Every overlay that has to sit on the painting — lasers, glints, callout anchors —
 * is described in plate units and projected through one of the rects below.
 */

export const PLATE_W = 1672
export const PLATE_H = 941
export const ASPECT = PLATE_W / PLATE_H

export type Rect = { x: number; y: number; w: number; h: number }
export type Pt = readonly [number, number]

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

export const isPortrait = (vw: number, vh: number) => vw / vh < 0.9

/** Where the plate sits on the landing: full-bleed on landscape, top-weighted on portrait. */
export function heroRect(vw: number, vh: number): Rect {
  const portrait = isPortrait(vw, vh)
  const s = portrait
    ? Math.max(vw / PLATE_W, (vh * 0.66) / PLATE_H)
    : Math.max(vw / PLATE_W, vh / PLATE_H)
  const w = PLATE_W * s
  const h = PLATE_H * s
  // plate point that should land at the centre of the screen
  const fx = portrait ? 1000 : 820
  const fy = 600
  const x = clamp(vw / 2 - fx * s, vw - w, 0)
  const y = portrait ? 0 : clamp(vh / 2 - fy * s, vh - h, 0)
  return { x, y, w, h }
}

/** Where the plate sits once it has become a schematic on the drafting sheet. */
export function dossierRect(vw: number, vh: number): Rect {
  if (vw >= 1024 && !isPortrait(vw, vh)) {
    const col = clamp(vw * 0.27, 320, 420)
    const padR = 56
    const maxW = vw - col - padR - 32
    const maxH = vh - 220
    const w = Math.min(maxW, maxH * ASPECT)
    const h = w / ASPECT
    return { x: col + 32 + (maxW - w) / 2, y: (vh - h) / 2 + 20, w, h }
  }
  const w = Math.min(vw - 32, vh * 0.36 * ASPECT, 720)
  return { x: (vw - w) / 2, y: vw < 640 ? 100 : 116, w, h: w / ASPECT }
}

/** Plate units → screen pixels for a given rect. */
export const project = (r: Rect, [px, py]: Pt): [number, number] => [
  r.x + (px / PLATE_W) * r.w,
  r.y + (py / PLATE_H) * r.h,
]

/** The transform that moves a full-viewport camera so `from` lands on `to` (origin 0 0). */
export function cameraFor(from: Rect, to: Rect) {
  const k = to.w / from.w
  return { scale: k, x: to.x - from.x * k, y: to.y - from.y * k }
}
