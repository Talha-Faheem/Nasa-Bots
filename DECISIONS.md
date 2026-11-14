# Lunar Frontier: The Last 30 Days — Architecture & Simulation Decisions

This document records simulation, architectural, and balance decisions made during development, aligned with GDD v2.0 and the 3D Edition build specification.

## 1. Time and Ticks
- **Tick Rate**: 24 ticks = 1 mission day. 1 tick = 1 game hour.
- **Real-Time Duration**: At 1x speed, 1 day = 30 real seconds (1.25 seconds per tick).
- **Speeds**: 0 (Pause), 1x, 2x, 4x.
- **Determinism**: State transitions rely strictly on Mulberry32 seeded pseudo-random number generator. Date.now() and Math.random() are prohibited in `src/sim/`.

## 2. Resource Formulas and Clamps
- **Battery Power (0–100)**:
  - Generation per day = $120 \times \text{sunlight} \times (\text{condition} / 100)$.
  - Sunlight schedule: Days 1–10 = 100%, 11–15 = 80%, 16–22 = 50%, 23–30 = 70%.
  - Demand per day: Life support 30 + heat/comms 15 = 45 (essential); recycler 15; greenhouse lights 5/10/15 per active bed; lab 15 per experiment.
  - Priority shedding: essential > recycler > greenhouse > lab > rover/upgrades.
  - Battery = $\text{clamp}(\text{battery} + \text{generation} - \text{servedDemand}, 0, 100)$.
- **Oxygen (0–100)**:
  - Crew consumption = 6/day (0.25/tick).
  - Life support generation = $5.8 \times (\text{condition} / 100) / 24$ per tick while powered.
  - Consecutive 0 oxygen for 48 ticks (2 days) triggers mission abort.
- **Water (0–100)**:
  - Crew consumption = 4/day + 2/day per active bed.
  - Recycler return = $75\% \times (\text{condition} / 100)$ of total water use while powered.
  - Below 15 = rationing kicks in.
- **Food (0–100)**:
  - Crew consumption = 3.5/day.
  - Quick greens (8d, yield 12), Dwarf tomatoes (11d, yield 18), Potatoes (14d, yield 30).
  - Dr. Sara Williams perk provides +10% yield on harvest.
  - 3 missed days of care/water/power withers the crop.

## 3. Radiation Risk Model (Simulated Risk)
- **Hard Constraint**: Never convert a flare, CME, or SEP record into a measured astronaut dose. Radiation values are labeled simulated risk points.
- **Advisory Formula**:
  $$\text{Exposure Points} = 10 \times S \times \text{positionFactor} \times \left(1 - 0.6 \times \frac{\text{protection}}{100}\right)$$
  - Position factors: Shelter = 0.15, Habitat = 0.5, Surface/Transit = 1.0.
  - Baseline surface exposure: 0.5/day while on surface or transit.
  - Accumulation: Yellow at $\ge 30$, Red at $\ge 60$. Red incurs a -15 health penalty.
  - Shield layers: $+10$ protection per layer, up to 3 layers (max 90 protection).

## 4. Crew Stamina, Travel, and Health
- **Daily Stamina**: 8 hours per astronaut per day.
- **Travel Time**: 1 tick per 8 world units (Euclidean distance between buildings). Sim travel drives the visuals.
- **Health Delta**:
  - $-3$ for skipped rest or exercise (overtime work)
  - $-5$ per shortage (oxygen $<20$, water $<15$, food $<15$)
  - $-15$ for red exposure
  - $+2$ when nothing is wrong ($+1$ extra from Dr. Maya Chen perk)
  - Health $<30$: Emergency. Health $\le 10$: Mission Abort.

## 5. Scoring and Safety Gate
- Crew safety max 300, Life support max 200, Power max 150, Radiation preparedness max 150, Food & Water max 100, Science max 100 (Total 1000).
- **Safety Gate**: If Crew Safety $<150$ or anyone ends in red exposure, Science counts as 0 and maximum possible rank is Bronze.

