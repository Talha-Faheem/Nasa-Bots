import { describe, it, expect } from 'vitest';
import { calculateTravelTicks } from '../src/sim/rules/crew.ts';
import { createInitialState, SimulationEngine } from '../src/sim/engine.ts';

describe('Simulation Travel Ticks and Movement', () => {
  it('calculates 0 travel ticks when moving to the same building', () => {
    expect(calculateTravelTicks('habitat', 'habitat')).toBe(0);
    expect(calculateTravelTicks('shelter', 'shelter')).toBe(0);
  });

  it('calculates travel ticks based on 1 tick per 8 world units (rounded up)', () => {
    // Habitat is at (0, 0), Power station is at (-14, -6)
    // Distance = sqrt((-14)^2 + (-6)^2) = sqrt(196 + 36) = sqrt(232) ~= 15.23
    // At 8 units per tick: ceil(15.23 / 8) = 2 ticks
    const ticks = calculateTravelTicks('habitat', 'power_station');
    expect(ticks).toBe(2);

    // Rover bay is at (0, -16). Distance = 16. ceil(16 / 8) = 2 ticks.
    expect(calculateTravelTicks('habitat', 'rover_bay')).toBe(2);

    // Comms is at (-16, 10). Distance = sqrt(256 + 100) = sqrt(356) ~= 18.86. ceil(18.86 / 8) = 3 ticks.
    expect(calculateTravelTicks('habitat', 'comms')).toBe(3);
  });

  it('handles crew transit state and arrival deterministically across ticks', () => {
    const engine = new SimulationEngine(500);
    let state = createInitialState(500, 'commander');

    expect(state.crew.alex.location).toBe('habitat');

    // Command Alex to move to comms (3 ticks away)
    state = engine.dispatch(state, {
      type: 'MOVE_CREW',
      crewId: 'alex',
      targetBuilding: 'comms',
    });

    expect(state.crew.alex.location).toBe('transit');
    expect(state.crew.alex.targetBuilding).toBe('comms');
    expect(state.crew.alex.travelTicksRemaining).toBe(3);

    // Tick 1
    state = engine.tick(state);
    expect(state.crew.alex.location).toBe('transit');
    expect(state.crew.alex.travelTicksRemaining).toBe(2);

    // Tick 2
    state = engine.tick(state);
    expect(state.crew.alex.location).toBe('transit');
    expect(state.crew.alex.travelTicksRemaining).toBe(1);

    // Tick 3: Alex arrives at Comms!
    state = engine.tick(state);
    expect(state.crew.alex.location).toBe('comms');
    expect(state.crew.alex.targetBuilding).toBeUndefined();
    expect(state.crew.alex.travelTicksRemaining).toBe(0);
  });
});
