"""
Builds the landing-page art layers from the reference poster.

  python tools/build_art.py

Outputs (public/art/):
  poster-base.webp     the poster with its baked headline removed (live type replaces it)
  plate-key.webp       \
  plate-warm.webp       > additive ink separations; key + warm + cream == poster-base
  plate-cream.webp     /
  blueprint.webp       chalk line-art of the same scene (alpha), for the schematic transition
"""
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "img" / "Join the Rebel Fleet.png"
OUT = ROOT / "public" / "art"
OUT.mkdir(parents=True, exist_ok=True)

rng = np.random.default_rng(7)

img = cv2.cvtColor(cv2.imread(str(SRC)), cv2.COLOR_BGR2RGB).astype(np.float32)
H, W, _ = img.shape
R, G, B = img[..., 0], img[..., 1], img[..., 2]
lum = 0.299 * R + 0.587 * G + 0.114 * B

# ---------------------------------------------------------------- headline mask
mask = np.zeros((H, W), np.uint8)

# "JOIN THE" — cream letters on navy
x0, y0, x1, y1 = 58, 660, 528, 732
mask[y0:y1, x0:x1] |= (lum[y0:y1, x0:x1] > 105).astype(np.uint8)

# "REBELLION" — red letters
x0, y0, x1, y1 = 52, 728, 1112, 893
r, g, b = R[y0:y1, x0:x1], G[y0:y1, x0:x1], B[y0:y1, x0:x1]
red = (r > 95) & (r > g * 1.45) & (r > b * 1.6)
mask[y0:y1, x0:x1] |= red.astype(np.uint8)

# close the halftone holes inside letters, then grow past the ink fringe
mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8))
mask = cv2.dilate(mask, np.ones((9, 9), np.uint8))
# never touch the paper border or the ship's nose
mask[893:, :] = 0
mask[:, :54] = 0

# Fill whole headline bands (not just glyphs) so no glyph ghosts survive, but
# protect the ship's nose / cannon which dip into the band.
band = np.zeros((H, W), np.uint8)
band[658:734, 56:530] = 1
band[730:893, 50:1114] = 1
protect = np.zeros((H, W), np.uint8)
px0, py0, px1, py1 = 556, 600, 960, 770
pr, pg, pb = R[py0:py1, px0:px1], G[py0:py1, px0:px1], B[py0:py1, px0:px1]
plum = lum[py0:py1, px0:px1]
not_red = ~((pr > 95) & (pr > pg * 1.45) & (pr > pb * 1.6))
protect[py0:py1, px0:px1] = ((plum > 70) & not_red).astype(np.uint8)
# keep only the protect blobs connected to the ship above the band
n, lab, stats, _ = cv2.connectedComponentsWithStats(cv2.dilate(protect, np.ones((3, 3), np.uint8)))
keep = np.zeros_like(protect)
for i in range(1, n):
    x, y, w, hgt, area = stats[i]
    if y < 728 and area > 400:
        keep[lab == i] = 1
keep = cv2.dilate(keep, np.ones((5, 5), np.uint8))
mask = ((band > 0) & (keep == 0)).astype(np.uint8)
mask[893:, :] = 0

# low frequency: normalized convolution over navy-only pixels, so the fill
# carries the sheet's vignette but never the ship's colours
sat = (np.max(img, 2) - np.min(img, 2))
navy = ((lum < 75) & (sat < 70) & (mask == 0)).astype(np.float32)
navy[keep > 0] = 0
def norm_conv(sigma):
    k = int(sigma * 8) | 1
    w = cv2.GaussianBlur(navy, (k, k), sigma)
    v = cv2.GaussianBlur(img * navy[..., None], (k, k), sigma)
    return v / np.maximum(w, 1e-6)[..., None], w


low_fine, w_fine = norm_conv(22)
low_wide, _ = norm_conv(70)
t = np.clip(w_fine / 0.25, 0, 1)[..., None]
low = low_fine * t + low_wide * (1 - t)

# high frequency: synthetic print grain + sparse dust flecks like the rest of the sheet
grain = rng.normal(0, 6.0, (H, W)).astype(np.float32)
grain = cv2.GaussianBlur(grain, (0, 0), 0.8)[..., None] * np.array([1.0, 1.0, 1.15], np.float32)
mottle = cv2.GaussianBlur(rng.normal(0, 1, (H, W)).astype(np.float32), (0, 0), 9)
mottle = (mottle / (mottle.std() + 1e-6) * 4.0)[..., None]
dust = np.zeros((H, W), np.float32)
for _ in range(260):
    x, y = int(rng.integers(0, W)), int(rng.integers(0, H))
    rad = float(rng.choice([0.6, 0.8, 1.0, 1.4, 2.0], p=[0.35, 0.3, 0.2, 0.1, 0.05]))
    cv2.circle(dust, (x, y), max(1, int(round(rad))), float(rng.uniform(0.35, 1.0)), -1)
dust = cv2.GaussianBlur(dust, (0, 0), 0.7)[..., None] * np.array([190, 178, 150], np.float32)
filled = np.clip(low + grain + mottle + dust, 0, 255)
alpha = cv2.GaussianBlur(mask.astype(np.float32), (0, 0), 3.0)[..., None]
alpha = np.clip(alpha * 1.25, 0, 1)
base = img * (1 - alpha) + filled * alpha
base = np.clip(base, 0, 255)


def save(arr, name, quality=88):
    Image.fromarray(arr.astype(np.uint8)).save(OUT / name, "WEBP", quality=quality, method=6)


save(base, "poster-base.webp", 90)

# ---------------------------------------------------------------- ink plates
hsv = cv2.cvtColor(base.astype(np.uint8), cv2.COLOR_RGB2HSV).astype(np.float32)
h = hsv[..., 0] * 2.0  # degrees
s = hsv[..., 1] / 255.0
v = hsv[..., 2] / 255.0


def ramp(x, a, b):
    return np.clip((x - a) / (b - a), 0, 1)


hue_warm = np.where(h <= 55, 1.0, np.where(h >= 340, 1.0, ramp(70 - h, 0, 15)))
warm = ramp(s, 0.32, 0.6) * ramp(v, 0.22, 0.45) * hue_warm
cream = ramp(v, 0.5, 0.78) * (1 - warm)
key = np.clip(1 - warm - cream, 0, 1)
for w, name in ((key, "plate-key.webp"), (warm, "plate-warm.webp"), (cream, "plate-cream.webp")):
    save(base * w[..., None], name, 86)

# ---------------------------------------------------------------- blueprint
gray = cv2.cvtColor(base.astype(np.uint8), cv2.COLOR_RGB2GRAY)
smooth = cv2.medianBlur(gray, 5)
smooth = cv2.bilateralFilter(smooth, 11, 50, 11)
smooth = cv2.GaussianBlur(smooth, (0, 0), 1.2)

edges = cv2.Canny(smooth, 16, 52)
# drop dust: only keep strokes that belong to drawn shapes
n, lab, stats, _ = cv2.connectedComponentsWithStats(edges, connectivity=8)
keepc = np.zeros(n, bool)
for i in range(1, n):
    x, y, w, hgt, area = stats[i]
    keepc[i] = area >= 45 or max(w, hgt) >= 26
lines = keepc[lab].astype(np.float32)
lines = cv2.GaussianBlur(lines, (0, 0), 0.55)
lines = np.clip(lines * 1.6, 0, 1) * 0.92

# fade the torn paper margin out of the schematic
yy, xx = np.mgrid[0:H, 0:W]
margin = np.minimum.reduce([xx - 28, W - 28 - xx, yy - 26, H - 40 - yy]).astype(np.float32)
lines *= np.clip(margin / 30, 0, 1)

rgba = np.zeros((H, W, 4), np.float32)
rgba[..., 0] = 232
rgba[..., 1] = 236
rgba[..., 2] = 230
rgba[..., 3] = np.clip(lines * 255 * 1.15, 0, 255)
Image.fromarray(rgba.astype(np.uint8), "RGBA").save(OUT / "blueprint.webp", "WEBP", quality=90, method=6)

print("ok", {p.name: round(p.stat().st_size / 1024) for p in OUT.iterdir()})


# ---------------------------------------------------------------- mattes
def matte(region, cond, close=9, largest=1):
    x0, y0, x1, y1 = region
    m = np.zeros((H, W), np.uint8)
    m[y0:y1, x0:x1] = cond[y0:y1, x0:x1].astype(np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((close, close), np.uint8))
    n, lab, stats, _ = cv2.connectedComponentsWithStats(m)
    order = np.argsort(-stats[1:, cv2.CC_STAT_AREA])[:largest] + 1
    m = np.isin(lab, order).astype(np.float32)
    m = cv2.GaussianBlur(m, (0, 0), 1.2)
    out = np.zeros((H, W, 4), np.uint8)
    out[..., :3] = 255
    out[..., 3] = (m * 255).astype(np.uint8)
    return out


bl = 0.299 * base[..., 0] + 0.587 * base[..., 1] + 0.114 * base[..., 2]
Image.fromarray(matte((930, 0, 1400, 340), (bl > 115) | (warm > 0.5), 9, 1), "RGBA").save(OUT / "matte-helmet.webp", "WEBP", quality=80)
visor_cond = (warm > 0.35) & (h > 18) & (h < 60) & (v > 0.45)
Image.fromarray(matte((995, 300, 1280, 470), visor_cond, 11, 2), "RGBA").save(OUT / "matte-visor.webp", "WEBP", quality=80)
print("mattes ok")


# ---------------------------------------------------------------- textures
def tile_blur(a, sigma):
    """Gaussian blur that wraps, so tiles stay seamless."""
    p = 32
    big = np.pad(a, p, mode="wrap")
    return cv2.GaussianBlur(big, (0, 0), sigma)[p:-p, p:-p]


# worn ink: mostly solid, with pits and hairline scratches, tileable
T = 512
wear = np.ones((T, T), np.float32)
pits = np.zeros((T, T), np.float32)
for _ in range(1400):
    x, y = rng.integers(0, T, 2)
    r = float(rng.choice([0.6, 1.0, 1.5, 2.2, 3.2], p=[0.4, 0.3, 0.17, 0.1, 0.03]))
    cv2.circle(pits, (int(x), int(y)), max(1, int(round(r))), float(rng.uniform(0.5, 1)), -1)
for _ in range(26):
    x, y = rng.integers(0, T, 2)
    ang = rng.uniform(0, np.pi)
    ln = rng.uniform(12, 60)
    x2, y2 = int(x + np.cos(ang) * ln), int(y + np.sin(ang) * ln)
    cv2.line(pits, (int(x), int(y)), (x2, y2), float(rng.uniform(0.4, 0.9)), 1)
pits = tile_blur(pits, 0.6)
mott = tile_blur(rng.normal(0, 1, (T, T)).astype(np.float32), 6)
mott = (mott - mott.min()) / (np.ptp(mott) + 1e-6)
wear = np.clip(1 - pits * 1.1 - np.clip(mott - 0.72, 0, 1) * 1.6, 0, 1)
w_rgba = np.zeros((T, T, 4), np.uint8)
w_rgba[..., :3] = 255
w_rgba[..., 3] = (0.08 + wear * 0.92) * 255
Image.fromarray(w_rgba, "RGBA").save(OUT / "ink-wear.webp", "WEBP", quality=85)

# film grain tile
G = 256
gn = rng.normal(0.5, 0.18, (G, G)).astype(np.float32)
gn = np.clip(tile_blur(gn, 0.5), 0, 1)
Image.fromarray((gn * 255).astype(np.uint8), "L").save(OUT / "grain.webp", "WEBP", quality=80)
print("textures ok")
