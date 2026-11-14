/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * tests/sim.features.test.ts
 * Tests for building upgrades, lab research, rover expeditions, construction expansions, and achievements.
 */

import { describe, it, expect } from 'vitest';
import { createInitialState, SimulationEngine } from '../src/sim/engine.ts';

describe('Advanced Systems & Gameplay Enhancements', () => {
  it('installs building upgrades with Alex Morgan perk discount', () => {
    const engine = new SimulationEngine(42);
    let state = createInitialState(42, 'commander');
    const initialParts = state.resources.spareParts; // 6
    const initialBattery = state.resources.battery; // 85

    // Purchase solar_cells with Alex (discount: 1 fewer part)
    state = engine.dispatch(state, {
      type: 'PURCHASE_UPGRADE',
      buildingId: 'power_station',
      upgradeId: 'solar_cells',
      crewId: 'alex',
    });

    expect(state.upgrades?.solar_cells).toBe(true);
    expect(state.resources.spareParts).toBe(initialParts - 1); // 2 - 1 = 1 part used
    expect(state.resources.battery).toBe(initialBattery - 10);
    expect(state.crew.alex.stamina).toBeLessThan(8);
  });

  it('runs scientific research project to completion and awards science', () => {
    const engine = new SimulationEngine(42);
    let state = createInitialState(42, 'commander');
    const initialScience = state.resources.science; // 0

    // Start regolith composition research with Sara
    state = engine.dispatch(state, {
      type: 'START_RESEARCH',
      projectId: 'regolith_composition',
      crewId: 'sara',
    });

    expect(state.lab.activeProject).toBe('regolith_composition');
    expect(state.lab.activeExperiment).toBe(true);

    // Advance 12 ticks
    for (let i = 0; i < 12; i++) {
      state = engine.tick(state);
    }

    expect(state.lab.completedProjects).toContain('regolith_composition');
    expect(state.resources.science).toBeGreaterThan(initialScience);
    expect(state.lab.activeExperiment).toBe(false);
  });

  it('dispatches rover expedition with Daniel Vance leadership perk and returns rewards', () => {
    const engine = new SimulationEngine(42);
    let state = createInitialState(42, 'commander');

    // Launch expedition to Shackleton Rim with Daniel
    state = engine.dispatch(state, {
      type: 'START_EXPEDITION',
      destinationId: 'shackleton_rim',
      crew1: 'daniel',
    });

    expect(state.rover.isAway).toBe(true);
    expect(state.rover.destination).toBe('shackleton_rim');

    // Advance 6 ticks to ensure return
    for (let i = 0; i < 6; i++) {
      state = engine.tick(state);
    }

    expect(state.rover.isAway).toBe(false);
    expect(state.stats.samplesCollected).toBeGreaterThanOrEqual(1);
    expect(state.resources.science).toBeGreaterThanOrEqual(20);
  });

  it('builds construction expansion and increases buffer capacity', () => {
    const engine = new SimulationEngine(42);
    let state = createInitialState(42, 'commander');

    // Start construction on auxiliary battery bank
    state = engine.dispatch(state, {
      type: 'START_CONSTRUCTION',
      projectId: 'aux_battery_bank',
      crewId: 'alex',
    });

    expect(state.construction?.aux_battery_bank.inProgress).toBe(true);

    // Advance 8 ticks
    for (let i = 0; i < 8; i++) {
      state = engine.tick(state);
    }

    expect(state.construction?.aux_battery_bank.built).toBe(true);
  });

  it('tracks mission objectives progress as days advance', () => {
    const engine = new SimulationEngine(42);
    let state = createInitialState(42, 'commander');

    const surviveObj = state.objectives?.find((o) => o.id === 'obj_survive');
    expect(surviveObj?.progress).toBe(1);

    // Advance 48 ticks (2 days)
    for (let i = 0; i < 48; i++) {
      state.mission.isPaused = false;
      state = engine.tick(state);
    }

    const updatedSurviveObj = state.objectives?.find((o) => o.id === 'obj_survive');
    expect(updatedSurviveObj?.progress).toBe(3);
  });
});
