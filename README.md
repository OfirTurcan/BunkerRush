# BUNKER RUSH — ריצה לבונקר

A 3-D endless-runner browser game built with React, Three.js and React Three Fiber.
Play as Netanyahu or Trump, dodge Iranian missiles and Shahed drones through a war-torn Tehran, and reach Khamenei's bunker at the end of 5 escalating levels.

---

## Tech Stack

| Layer | Library / Tool | Version |
|---|---|---|
| UI Framework | React | 18 |
| 3-D Renderer | Three.js | 0.167 |
| React ↔ Three.js | @react-three/fiber | 8 |
| 3-D Helpers | @react-three/drei | 9 |
| State Management | Zustand | 4 |
| Build Tool | Vite | 5 |
| Testing | Vitest | 2 |
| Audio | Web Audio API (procedural) | — |
| Physics | Manual integration (no Rapier) | — |

---

## Project Structure

```
c:\Code\Challenge\
│
├── public/
│   └── images/
│       ├── bibi.jpg          # Netanyahu photo (character card)
│       ├── trump.jpg         # Trump photo (character card)
│       └── hamenai.png       # Khamenei image (end-of-level popup)
│
├── src/
│   ├── main.jsx              # React DOM entry point
│   ├── App.jsx               # Phase router (menu / playing / gameover / victory)
│   │
│   ├── store/
│   │   └── gameStore.js      # Zustand global state: phase, lives, score, level,
│   │                         #   distance, Iron Dome charges & active flag
│   │
│   ├── hooks/
│   │   └── useControls.js    # Keyboard input hook → ref with {left,right,jump,crouch}
│   │
│   ├── utils/
│   │   └── sounds.js         # Reusable Web-Audio sound effects (pickup, activate)
│   │
│   ├── components/
│   │   ├── Game.jsx           # Canvas scene: lights, fog, world, character, obstacles
│   │   ├── Character.jsx      # Player mesh (Bibi / Trump) + manual physics loop
│   │   ├── Obstacles.jsx      # Spawns missiles & drones, AABB collision, Iron Dome aware
│   │   ├── Mines.jsx          # Pre-placed ground mines with collision
│   │   ├── IronDomePowerup.jsx# Collectible Iron Dome charge packages
│   │   ├── World.jsx          # 2-D-style building facades, road, bunker
│   │   ├── CameraController.jsx # Lerp third-person camera
│   │   └── SoundManager.jsx   # Procedural ambiance: rumble, siren, wind, booms, gunshots
│   │
│   │   └── UI/
│   │       ├── StartScreen.jsx    # Character selection + controls hint
│   │       ├── HUD.jsx            # Lives, level bar, score, Iron Dome counter, ESC/ENTER
│   │       ├── GameOverScreen.jsx # Game over with score
│   │       ├── VictoryScreen.jsx  # Victory with final score
│   │       └── MobileControls.jsx # On-screen touch buttons
│   │
│   └── __tests__/
│       ├── gameStore.test.js  # Store state machine tests
│       ├── sounds.test.js     # Sound utility smoke tests
│       └── collision.test.js  # AABB collision math tests
│
├── process.html               # Hebrew RTL slide deck (development retrospective)
├── vite.config.js
└── package.json
```

---

## Game Mechanics

### Controls
| Key | Action |
|---|---|
| ← / A | Move left |
| → / D | Move right |
| Space / W / ↑ | Jump |
| ↓ / S | Crouch (dodge low missiles) |
| ENTER | Activate Iron Dome (if charged) |
| ESC / X button | Back to main menu |

### Levels
| Level | Name | Speed (m/s) | Obstacle Rate |
|---|---|---|---|
| 1 | טהרן שקטה | 6 | 0.8/s |
| 2 | גשם טילים | 8 | 1.4/s |
| 3 | סערת כטבמים | 11 | 2.0/s |
| 4 | אפוקליפסה | 14 | 2.8/s |
| 5 | שחר הנקמה | 18 | 3.8/s |

Each level is 160 m long; total run = 800 m.

### Obstacles
- **Missiles** (60 % of spawns) — fly at 3 heights: low (duck), mid, high (jump)
- **Drones / Shahed** (40 %) — wide wingspan, varies in height
- **Land mines** — 52 pre-placed on road, trigger only while on ground
- **Iron Dome packages** — 18 collectibles; press ENTER to clear the screen for 3 s

### Physics
All physics run manually inside `useFrame`:
- Gravity: −20 m/s²
- Jump force: 8.5 m/s (single-press locking to prevent hold-repeat)
- Delta capped at 50 ms to prevent physics explosion on tab-switch

---

## Running Locally

```bash
npm install
npm run dev       # http://localhost:5173
npm test          # run Vitest unit tests
npm run build     # production build
```

---

## Architecture Notes

- **No Rapier** — planned initially but replaced with manual physics for simplicity
- **Lambert + Basic materials only** — no PBR to keep FPS high
- **No shadows** — eliminated the shadow-map render pass
- **Static world** — 10 × 40 m segments, memo'd, built once
- **2-D building facades** — thin boxes in the YZ plane give a side-scroller feel
- **CanvasTexture posters** — Khamenei propaganda posters generated once via `<canvas>`, reused across building panels
- **Procedural audio** — entirely Web Audio API oscillators + `AudioBuffer` noise, no audio files required (except images)
- **Zustand** — single flat store, actions are co-located with state; no context providers needed

---

## Development Process

See [process.html](process.html) for a full Hebrew retrospective slide deck covering the prompting strategy, character design decisions, what worked well, and lessons learned.
