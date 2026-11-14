# Lunar Frontier: The Last 30 Days (3D Edition)

> **NASA Space Apps Challenge 2026** — *Build a Junior Astronaut Mission Trainer*  
> Real-time-with-pause 3D base management browser game for ages 7–12.

---

## 🎮 Play the Mission
Open your browser to: **[http://localhost:3000](http://localhost:3000)**

---

## 🚀 Concept & Mission Briefing
You are the **Mission Commander** of Artemis Outpost Alpha near the **Lunar South Pole**. You oversee four astronaut specialists over an intense **30-day expedition** ($720$ simulation ticks). Every choice is a trade-off: power, life support ($O_2$), water, food, and radiation shielding continuously pull against each other.

### Design Pillars:
1. **No Free Choices**: Every action costs crew work hours, power, or spare parts.
2. **Real NASA Data**: Scripted and dynamic space-weather advisories use real NASA DONKI and OSDR telemetry, always attributed with badges (`Live NASA`, `Archived NASA`, `Simulated`).
3. **Simulated Risk Model**: Radiation exposure is strictly modeled as simulated risk points (never claiming to compute biological astronaut doses).
4. **Safe to Learn**: Missions conclude with supportive debriefs and precautionary evacuations—never graphic failures.
5. **Mechanics Before Polish**: The pure simulation engine was built, balanced, and verified across a 1,000-game bot simulation before rendering visuals.

---

## 🛠️ Tech Stack
- **Language**: TypeScript (strict mode, zero errors)
- **Rules Engine**: Pure TypeScript in `src/sim/` (zero Three/React/DOM dependencies)
- **3D World**: Three.js + React Three Fiber (`@react-three/fiber`, `@react-three/drei`)
- **HUD & UI**: React 18 + Tailwind CSS (accessible HTML overlay above the canvas)
- **State Management**: Zustand + Typed Event Bus (`src/store/`)
- **Validation**: Zod schema validation
- **Testing**: Vitest (19/19 passing tests including 1,000-game balance bot)
- **Data Service**: Vercel Edge Serverless Function (`api/donki.ts`)
- **Build Tool & Package Manager**: Vite + pnpm

---

## 🔬 NASA Datasets Used & Judge Documentation
1. **NASA DONKI (Space Weather Database of Notifications, Knowledge, Information)**:
   - Real Coronal Mass Ejection (CME) and solar flare classifications (C, M, X) drive the Days 12–13 advisory.
2. **NASA OSDR RadLab Dosimetry (`OSDR-RADLAB-ISS-01`)**:
   - Real ISS radiation detector readings ($340\ \mu\text{Gy/day}$) are displayed in context, explaining how low-Earth orbit differs from the lunar surface.
3. **NASA OSDR Space Biology Studies**:
   - `OSDR-214`: Bone and muscle deconditioning (daily exercise requirement).
   - `OSDR-421`: Plant photobiology from the VEGGIE experiment (light power vs. yield).
   - `OSDR-118`: Circadian rhythms and astronaut stamina (8-hour work shifts).
   - `OSDR-502`: In-situ lunar regolith mass attenuation for radiation shielding.
4. **Lunar Reconnaissance Orbiter (LRO) & Artemis Data**:
   - Shackleton Crater south-pole elevation models and dynamic solar insolation angles.

---

## ⌨️ Controls & Accessibility
- **Spacebar**: Pause / Resume mission at any time
- **1 / 2 / 4**: Switch simulation speed ($1\times$, $2\times$, $4\times$)
- **Mouse / Orbit**: Right-click drag or left-click drag to orbit camera; scroll wheel to zoom
- **Home Button**: Quickly reset camera to the base overview
- **HTML Quick-Select**: Select buildings and astronauts from accessible HTML buttons (screen-reader and keyboard friendly)
- **Settings**: Toggle Reduced Motion, Mute Audio, and switch Graphic Quality presets (Low, Medium, High)

---

## 🧪 Testing & Verification
```bash
# Run full Vitest suite & 1,000-game balance bot
pnpm test

# Type-check TypeScript in strict mode
npx tsc --noEmit

# Production build
pnpm run build
```

