# Lunar Frontier: The Last 30 Days — Architecture & Design Decisions

This document records architectural, simulation, and balance decisions made during the development of Lunar Frontier: The Last 30 Days.

---

### Decision 001: Strict Headless Simulation Core
- **Context**: The game requires rigorous determinism, automated bot testing, and zero chance of UI cheating or desynchronization.
- **Decision**: The simulation engine (`src/sim/`) is 100% pure TypeScript. It has zero dependencies on browser DOM, Three.js, React, or system clock (`Date.now()`).
- **Consequence**: The simulation core can run in Node.js scripts, Vitest test suites, and browser background workers without any visual overhead.

---

### Decision 002: Deterministic Seeded PRNG & Fixed Timestep Loop
- **Context**: Simulations must be 100% reproducible for save games, bug replays, and balance tuning.
- **Decision**: All stochastic choices use a seeded Mulberry32 pseudo-random number generator. Ticks advance by a fixed delta (e.g. 10 ticks per real second at 1× speed, or 24 discrete hourly ticks per game day). Speed controls (Pause, 1×, 2×, 4×) adjust the number of discrete steps calculated per frame rather than altering delta time.
- **Consequence**: The same seed combined with the same ordered command log will produce the identical simulation result down to the last decimal on any machine.

---

### Decision 003: Command Pattern & Append-Only Event Log
- **Context**: Actions taken by the player must be logged, verifiable, and undoable/cancelable with predictable penalties.
- **Decision**: All player inputs are dispatched as serializable `Command` objects. Every significant state change (task assignment, completion, alert, shortage, daily report) is written to an append-only `EventLog`.
- **Consequence**: Event history is the single source of truth for crew dossiers, notifications, activity graphs, and end-of-mission evaluation scores.

---

### Decision 004: Resource Reservation Mechanics
- **Context**: In multi-task management, assigning two astronauts to repair tasks simultaneously could attempt to use the same spare parts, causing race conditions or sudden negative inventory.
- **Decision**: When a task is accepted, required resources (spare parts, water, power) are immediately placed into a `reserved` state. Reservations are only consumed on task completion, or released back to available inventory on cancellation/interruption.
- **Consequence**: Prevents resource race conditions and allows the player to see exact reserved allocations in the HUD.

---

### Decision 005: Unified 0–100 Human Vital Scales
- **Context**: Having different ranges for astronaut vitals (e.g. 0–8 for stamina, 0–100 for health, -10 to +10 for morale) creates confusion in UI presentation and simulation formulas.
- **Decision**: All astronaut vitals are strictly normalized to a `0–100` scale:
  - **Health**: 0–100 (100 = optimal, <30 = emergency, $\le 10$ = critical casualty).
  - **Stamina**: 0–100 (100 = fully rested, daily work drains stamina, restored by sleep).
  - **Morale**: 0–100 (100 = inspired/focused, <40 = stressed, affects error rates and work efficiency).
- **Consequence**: Consistent HUD meters, clear telemetry, and uniform penalty calculations across all astronauts.

---

### Decision 006: Data-Driven Configuration in `/data/balance.json` with Zod
- **Context**: Hardcoding consumption rates, starting supplies, and upgrade costs in code makes tuning difficult and violates strict data separation.
- **Decision**: All gameplay balance parameters are stored in `/data/balance.json` and validated at runtime using Zod schemas (`src/sim/schema.ts`).
- **Consequence**: Balancing can be modified and tested by bots without modifying TypeScript code, and invalid config files fail fast at compile/load time.

---

### Decision 007: Physical Base Navigation & Visual Locomotion
- **Context**: Traditional management games often teleport workers instantly to buildings, breaking immersion.
- **Decision**: Astronauts physically transition through a defined state machine (`IDLE` $\rightarrow$ `ASSIGNED` $\rightarrow$ `TRAVELLING_TO_LOCATION` $\rightarrow$ `PREPARING` $\rightarrow$ `WORKING` $\rightarrow$ `TASK_COMPLETED` $\rightarrow$ `RETURNING_TO_IDLE_LOCATION` $\rightarrow$ `IDLE`).
- **Consequence**: The player visibly sees the travel and work cycle in the 3D base, making positioning, transit distance, and spatial planning strategically relevant.

---

### Decision 008: Single Source of Truth for Terrain Elevation & Grounding Physics
- **Context**: Characters and rovers previously experienced terrain sinking or floating because the visual height and movement coordinates were decoupled.
- **Decision**: Created `src/game3d/Physics/TerrainHeight.ts` as the shared analytical elevation function `getTerrainHeight(x, z)` matching the 80x80 terrain mesh geometry. Astronauts, rovers, and building foundations query this exact function every frame. Added continuous circle/box obstacle collision resolution with tangent sliding response against base modules, and slope impedance blocking travel on slopes $> 35^\circ$.
- **Consequence**: Astronauts walk stably on the lunar surface without sinking into craters or floating over ridges; slope normals tilt characters realistically; obstacles prevent walking through walls.

---

### Decision 009: Lunar Geological Land Deposits & In-Situ Materials Refining
- **Context**: The game required a functional land exploration and mining system rather than static scenery.
- **Decision**: Added 7 distinct geological deposits across 6 terrain zones (Water Ice Core, Sintering Regolith, Ilmenite Iron Ridge, Titanium Outcrop, Aluminum Field, Silicate Sands, Helium-3 Volatiles). Daniel Vance specializes in scanning (+6 Science) and mining (1.3x yield). In-situ refinery skids in `LeftNavPanel.tsx` allow converting raw ice into purified drinking water, sintering regolith into structural blocks, smelting iron ore into spare parts, and fabricating silicon into solar cells.
- **Consequence**: Full closed-loop survival and colony expansion gameplay backed by authentic lunar science (NASA Artemis ISRU concepts).

---

### Decision 010: Dedicated Start Menu Scene & Zero-Leak Asset Disposal
- **Context**: The game requires a cinematic start menu with a 3D rotating Moon, distant Earth, and parallax starfield, without keeping redundant GPU buffers loaded during gameplay.
- **Decision**: Implemented `src/ui/StartMenu/StartMenu.tsx` with its own isolated Three.js canvas. When the player clicks "START MISSION", the camera performs a cinematic push toward the lunar terminator, fades smoothly into the mission briefing, and completely unmounts and disposes of the menu WebGL context before the main base scene mounts.
- **Consequence**: Zero memory leaks and crisp 60 FPS transitions between menu and gameplay.

---

### Decision 011: Unified Pause System with Deterministic Command Logging & Pointer-Lock Decoupling
- **Context**: Pausing in games often merely freezes animation while internal timers or network calls keep running, causing desyncs or broken replays.
- **Decision**: Pressing `Escape` or `P` pauses the simulation itself by dispatching `{ type: 'PAUSE' }`. The accumulator loop stops advancing fixed ticks. Game audio ducks. If the player is in First-Person View, pointer lock is immediately released so mouse clicks on the pause menu function seamlessly, and pointer lock is restored upon resume.
- **Consequence**: Fully deterministic pause/resume cycles recorded in `commandLog` for exact replay fidelity.

---

### Decision 012: Hybrid Astronaut Camera System (Commander, Follow, and Helmet FPV)
- **Context**: Players need strategic overview as well as immersive personal presence during EVA operations.
- **Decision**: Implemented three camera modes: `commander` (orbit/strategy), `follow` (chase view with collision dampening), and `first_person` (camera mounted inside the helmet at 1.6m eye level). In FPV, the astronaut's own head mesh is culled from the camera so the player never sees the inside of the neck, while arms, hands, and chest telemetry remain visible. Supports both Watch Mode (view follows AI actions) and Manual Walk Mode (WASD locomotion with low-gravity stride physics).
- **Consequence**: High immersion with zero head clipping or disorienting mesh artifacts.

---

### Decision 013: Simulation-Authoritative Inflated A* Navmesh & Wall Sliding
- **Context**: Characters previously had no collision volumes with base facilities and could walk through solid walls.
- **Decision**: Defined explicit building footprint polygons, inflated obstacle boundaries by agent radius ($0.4$m) + safety buffer ($0.2$m), and created an authoritative pathfinding grid. Added continuous circle/box sliding collision and a 3-second stuck detector. Exterior interaction stations are explicitly positioned outside building volumes.
- **Consequence**: Astronauts physically navigate around buildings through open corridors without clipping through walls or each other.
