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
