# Asset & Data Credits: Lunar Frontier: The Last 30 Days

Aligned to the NASA Space Apps Challenge 2026 "Build a Junior Astronaut Mission Trainer".

## 1. NASA Data Sources
- **NASA DONKI (Space Weather Database of Notifications, Knowledge, Information)**:
  - Space weather events, CME velocity data, solar flare classifications (GOES/SOHO/SDO).
  - Open data from CCMC at NASA Goddard Space Flight Center.
  - Endpoint: `https://ccmc.gsfc.nasa.gov/tools/DONKI/` / `https://api.nasa.gov/`
- **NASA OSDR (Open Science Data Repository)**:
  - RadLab ISS dosimetry telemetry dataset (`OSDR-RADLAB-ISS-01`).
  - Space biology studies: Bone deconditioning (OSDR-214), plant photobiology (OSDR-421), circadian rhythms (OSDR-118), lunar regolith radiation shielding (OSDR-502).
- **NASA Planetary Trek & Lunar Reconnaissance Orbiter (LRO)**:
  - Lunar south pole Shackleton Crater rim elevation profiles and terrain modeling.
- **NASA Mars Perseverance Rover / Jezero Crater**:
  - Mars site parameters, solar insolation, and atmospheric dust attenuation data.

## 2. 3D Graphics & Engine
- **Three.js & React Three Fiber**:
  - MIT License. Custom procedural primitive modeling for all 8 outpost buildings, astronauts, rovers, and displaced lunar terrain.
- **Procedural Sky & Stars**:
  - `@react-three/drei` procedural starfield.

## 3. Audio & UI
- **Audio**:
  - Web Audio API pure procedural synthesizer (sine/square/triangle waveforms) for zero-dependency offline playback.
- **Icons**:
  - Unicode space and technical emoji + Lucide React (ISC License).

## 4. Open Source Licenses
- React 18 (MIT), Tailwind CSS (MIT), Vite (MIT), Zustand (MIT), Vitest (MIT), Zod (MIT).

