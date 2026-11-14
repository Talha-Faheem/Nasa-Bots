import { describe, it, expect } from 'vitest';
import { createInitialState, SimulationEngine } from '../src/sim/engine.ts';

describe('Simulation Bounds and Clamping', () => {
  it('keeps battery between 0 and 100 under full generation and extreme load', () => {
    const engine = new SimulationEngine(12345);
    let state = createInitialState(12345, 'commander');

    // Charge with zero demand
    state.systems.solarArray.condition = 100;
    state.resources.battery = 99;
    for (let i = 0; i < 50; i++) {
      state = engine.tick(state);
      expect(state.resources.battery).toBeLessThanOrEqual(100);
      expect(state.resources.battery).toBeGreaterThanOrEqual(0);
    }

    // Drain under zero generation
    state.systems.solarArray.condition = 0;
    for (let i = 0; i < 200; i++) {
      state.mission.isPaused = false; // ensure not blocked by critical event auto-pause
      state = engine.tick(state);
      expect(state.resources.battery).toBeGreaterThanOrEqual(0);
      expect(state.resources.battery).toBeLessThanOrEqual(100);
    }
    expect(state.resources.battery).toBe(0);
  });

  it('keeps oxygen, water, and food clamped between 0 and 100', () => {
    const engine = new SimulationEngine(54321);
    let state = createInitialState(54321, 'commander');

    // Force life support offline
    state.systems.lifeSupport.condition = 0;
    state.systems.recycler.condition = 0;

    for (let i = 0; i < 300; i++) {
      state.mission.isPaused = false;
      state = engine.tick(state);
      expect(state.resources.oxygen).toBeGreaterThanOrEqual(0);
      expect(state.resources.oxygen).toBeLessThanOrEqual(100);
      expect(state.resources.water).toBeGreaterThanOrEqual(0);
      expect(state.resources.water).toBeLessThanOrEqual(100);
      expect(state.resources.food).toBeGreaterThanOrEqual(0);
      expect(state.resources.food).toBeLessThanOrEqual(100);
    }
  });

  it('caps shield protection to a maximum of 90 (3 layers of +10)', () => {
    const engine = new SimulationEngine(11111);
    let state = createInitialState(11111, 'commander');

    expect(state.resources.shieldProtection).toBe(60);

    // Build 1st layer
    state.resources.spareParts = 10;
    state.resources.battery = 50;
    state = engine.dispatch(state, { type: 'BUILD_SHIELD_LAYER' });
    expect(state.resources.shieldProtection).toBe(70);
    expect(state.resources.shieldLayersBuilt).toBe(1);

    // Build 2nd layer
    state = engine.dispatch(state, { type: 'BUILD_SHIELD_LAYER' });
    expect(state.resources.shieldProtection).toBe(80);
    expect(state.resources.shieldLayersBuilt).toBe(2);

    // Build 3rd layer
    state = engine.dispatch(state, { type: 'BUILD_SHIELD_LAYER' });
    expect(state.resources.shieldProtection).toBe(90);
    expect(state.resources.shieldLayersBuilt).toBe(3);

    // Attempt 4th layer - should be blocked
    state = engine.dispatch(state, { type: 'BUILD_SHIELD_LAYER' });
    expect(state.resources.shieldProtection).toBe(90);
    expect(state.resources.shieldLayersBuilt).toBe(3);
  });

  it('keeps crew health bounded between 0 and 100', () => {
    const engine = new SimulationEngine(22222);
    let state = createInitialState(22222, 'commander');

    // Health cannot exceed 100
    for (const c of Object.values(state.crew)) {
      expect(c.health).toBe(100);
    }

    // Force extreme damage
    state.resources.oxygen = 0;
    state.resources.water = 0;
    state.resources.food = 0;
    for (const c of Object.values(state.crew)) {
      c.exposure = 70; // red exposure
      c.skippedRestOrExercise = true;
    }

    // Advance 1 day
    for (let i = 0; i < 24; i++) {
      state = engine.tick(state);
    }

    for (const c of Object.values(state.crew)) {
      expect(c.health).toBeGreaterThanOrEqual(0);
      expect(c.health).toBeLessThanOrEqual(100);
    }
  });
});
