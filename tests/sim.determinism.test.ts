import { describe, it, expect } from 'vitest';
import { createInitialState, SimulationEngine } from '../src/sim/engine.ts';

describe('Simulation Engine Determinism', () => {
  it('produces identical state given the same seed and no commands across multiple runs', () => {
    const seed = 421337;
    const engine1 = new SimulationEngine(seed);
    const engine2 = new SimulationEngine(seed);

    let state1 = createInitialState(seed, 'commander');
    let state2 = createInitialState(seed, 'commander');

    // Run for 5 mission days (120 ticks)
    for (let i = 0; i < 120; i++) {
      state1 = engine1.tick(state1);
      state2 = engine2.tick(state2);
    }

    expect(state1.resources).toEqual(state2.resources);
    expect(state1.systems).toEqual(state2.systems);
    expect(state1.mission.totalTicks).toBe(state2.mission.totalTicks);
    expect(state1.crew.alex.health).toBe(state2.crew.alex.health);
    expect(state1.crew.alex.exposure).toBe(state2.crew.alex.exposure);
  });

  it('produces identical state when identical commands are dispatched at identical ticks', () => {
    const seed = 998877;
    const engine1 = new SimulationEngine(seed);
    const engine2 = new SimulationEngine(seed);

    let state1 = createInitialState(seed, 'commander');
    let state2 = createInitialState(seed, 'commander');

    for (let t = 0; t < 200; t++) {
      if (t === 24) {
        state1 = engine1.dispatch(state1, {
          type: 'ASSIGN_TASK',
          crewId: 'alex',
          taskType: 'inspect',
          buildingId: 'power_station',
        });
        state2 = engine2.dispatch(state2, {
          type: 'ASSIGN_TASK',
          crewId: 'alex',
          taskType: 'inspect',
          buildingId: 'power_station',
        });
      }

      if (t === 72) {
        state1 = engine1.dispatch(state1, { type: 'BUILD_SHIELD_LAYER' });
        state2 = engine2.dispatch(state2, { type: 'BUILD_SHIELD_LAYER' });
      }

      state1 = engine1.tick(state1);
      state2 = engine2.tick(state2);
    }

    expect(state1.resources).toEqual(state2.resources);
    expect(state1.crew).toEqual(state2.crew);
    expect(state1.powerBreakdown).toEqual(state2.powerBreakdown);
  });
});

