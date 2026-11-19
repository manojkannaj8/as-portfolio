# Ashmit Saxena — Portfolio

A personal portfolio told as a journey through a vintage sci-fi universe: a recruitment poster that scans into an engineering dossier, then five chapters (missions, service record, honours, academy, arsenal).

Vite · React 18 · TypeScript · GSAP (ScrollTrigger)

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build into dist/
npm run preview
```

`npm run art` rebuilds the image layers in `public/art/` from the reference poster in `img/` (needs Python with Pillow, NumPy and OpenCV; the built art is already committed).

## Deploy (Vercel)

Import the repo in Vercel. The framework (Vite), install, build (`npm run build`) and output (`dist`) settings are read from `vercel.json`; no environment variables are needed.

## Structure

- `src/content/` — all facts (profile, dossier, chapters); the only place copy lives
- `src/components/` — landing, chapters, navigation, saber scroll bar
- `src/motion/` — GSAP timelines and canvas effects
- `DESIGN.md`, `PRODUCT.md` — design and product notes
