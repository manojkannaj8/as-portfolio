# Design

## World
There are two inks in one universe:
- **The recruitment poster** (`img/Join the Rebel Fleet.png`): navy, red, orange and mustard inks on cream paper, worn print and a heavy italic display face. This is the side that invites and tells the story.
- **The engineering sheet** (`img/Death Star Engineering Blueprint.png`): chalk linework on near-black with a drafting grid, callouts with leader lines and boxed spec panels. This is the technical side: how things are built and what they're made of.

The landing page bridges the two. The poster is scanned into its own schematic.

## Motion idea
**Things arrive by coming into registration.** On load, the poster's ink separations (key, cream, warm) land out of register and pull into alignment, and the name inks in with misregistered ghosts. Later chapters should reuse this idea for entrances instead of generic fades. Scroll is scrubbed and story-driven, never decorative. Ambient life (laser volleys, distant traffic, helmet and visor glints, planet rim, dust) is sparse and pauses when off-screen or when the visitor prefers reduced motion.

## Tokens (`src/styles/tokens.css`)
- Poster: `--ink-deep #0a1322`, `--ink-navy #15223c`, `--ink-red #e3401c`, `--ink-orange #f27b29`, `--ink-mustard #e8b143`, `--paper #efe2c4`
- Sheet: `--bp-bg #0d0f10`, `--chalk #e8ece6` (dim 66%, faint 16%)
- Type: **Saira** variable (italic, 900, width 125%) for display and labels; **Archivo** for running text; **IBM Plex Mono** only for data and values.

## Systems
- Plate coordinates: overlays on the art use poster units (1672 × 941) through `src/scene/geometry.ts`.
- Art pipeline: `npm run art` (`tools/build_art.py`) rebuilds the plates, the blueprint line-art, the mattes and the textures from the reference poster.
- Content lives in `src/content/`, motion in `src/motion/`, UI in `src/components/`.

## Chapters (`src/components/chapters/`, styles in `src/styles/chapters.css`)
The journey alternates the two inks, so every chapter has its own surface:
- **I Missions** (navy poster ink): each project is a mission brief with a flight path (one waypoint per log entry), followed by smaller sorties from GitHub.
- **II Service record** (drafting sheet): a squadron of identical units drawn as a schematic (`CloneSquad`). They march in and halt together, and the co-lead's markings flood red.
- **III Honours** (cream paper): stencilled hull markings (1st, Ag, 2nd).
- **IV Academy** (drafting sheet): the CGPA is read off a 0–10 drafting scale.
- **V Arsenal** (deep space): each skill group is an original saber hilt whose blade ignites on view. Pressing the hilt toggles the blade, and the skill names stay visible.
- **Flight log** (`FlightLog.tsx`): a fixed bar that docks after the poster. It shows the current chapter, the chapter links (a menu on narrow screens) and a red ink progress rule.
- Entrances go through `motion/reveal.ts`: `.ink-title` ghosts settle, `.reg` blocks lose their chromatic fringe, and `.reveal-draw .draw` strokes draw on.

## Upgrade pass (motion and detail)
- **Landing:** a press warm-up shows while the plates decode, and a halftone dot screen opens into continuous tone. Each letter of the name comes into register on its own, and a fast mouse sweep briefly knocks the name out of register. Over the sky the cursor is a gunsight, and clicks fire aimed volleys that burst at the target. The scan beam has a red/blue fringe, a dot-screen dissolve and a live X readout. Dossier values decode as they arrive (`motion/decode.ts`).
- **Seams:** a perforated tear into Missions, a scan line into Service, a torn paper sheet laid down and lifted for Honours, and a hyperspace jump (`Hyperspace.tsx`) into Arsenal. Chapter numerals fill with ink as each chapter is read.
- **Chapters:**
  - Missions has a viewscreen of the live CORB site (`public/shots/`), a transit schematic for Nexus-Flow and a radar for GaBN, plus a craft that flies each flight path and lights its waypoints.
  - The squad marches with scroll, and units salute on click.
  - Honours are spray-stencilled on.
  - Academy shows a vernier caliper and a punched course card.
  - Sabers throw sparks under the cursor and light the sky. An optional Web Audio hum and ignition sound (`motion/saberSound.ts`) is off by default.
- **Ending:** a copy-to-clipboard transmission, a carrier wave on hover, and "Return to the poster", which plays the scan in reverse. Chapter notches sit on the saber scroll bar.
- **Sharing:** `public/og.jpg` (1200×630) is the share image. Share-card URLs use `VERCEL_PROJECT_PRODUCTION_URL` or `SITE_URL` (see `vite.config.ts`), and `public/404.html` is the not-found page.

## Avoid
Rounded card grids, glassmorphism, gradient text, eyebrow labels above headings, franchise logos or wordmarks. It's a portfolio set in a universe, not a fan page.
