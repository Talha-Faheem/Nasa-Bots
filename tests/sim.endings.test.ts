import { describe, it, expect } from 'vitest';
import { createInitialState, SimulationEngine } from '../src/sim/engine.ts';
import { determineEnding } from '../src/sim/scoring.ts';

describe('Mission Endings Reachability', () => {
  it('triggers mission_abort when any astronaut health reaches <= 10', () => {
    const engine = new SimulationEngine(1001);
    let state = createInitialState(1001, 'commander');

    state.crew.alex.health = 10;
    state = engine.tick(state);

    expect(state.mission.status).toBe('mission_abort');
    expect(state.mission.isPaused).toBe(true);
    expect(state.mission.endingReason).toContain('astronaut safety');
  });

  it('triggers mission_abort when oxygen remains at 0 for 48 consecutive ticks', () => {
    const engine = new SimulationEngine(1002);
    let state = createInitialState(1002, 'commander');

    state.resources.oxygen = 0;
    state.systems.lifeSupport.condition = 0;

    for (let i = 0; i < 48; i++) {
      state = engine.tick(state);
      if (state.mission.status === 'mission_abort') break;
    }

    expect(state.mission.status).toBe('mission_abort');
    expect(state.mission.endingReason).toContain('depleted for 48 consecutive hours');
  });

  it('reaches mission_accomplished when Day 30 ends with healthy crew, no red resources, no faults', () => {
    const state = createInitialState(1003, 'commander');
    state.mission.totalTicks = 720;
    state.mission.day = 30;
    state.resources.battery = 80;
    state.resources.oxygen = 75;
    state.resources.water = 60;
    state.resources.food = 55;
    state.resources.science = 65;

    for (const c of Object.values(state.crew)) {
      c.health = 95;
      c.exposure = 10;
    }

    const result = determineEnding(state);
    expect(result).not.toBeNull();
    expect(result?.ending).toBe('mission_accomplished');
    expect(result?.reason).toContain('Base fully operational');
  });

  it('reaches scientific_success_resource_failure when science >= 70 but a critical resource is red', () => {
    const state = createInitialState(1004, 'commander');
    state.mission.totalTicks = 720;
    state.mission.day = 30;
    state.resources.science = 85; // Science >= 70
    state.resources.water = 10; // Critical resource in RED (<15)

    const result = determineEnding(state);
    expect(result).not.toBeNull();
    expect(result?.ending).toBe('scientific_success_resource_failure');
    expect(result?.reason).toContain('critical resource reserves were depleted');
  });

  it('reaches emergency_mission when crew survives but systems have faults or resources low', () => {
    const state = createInitialState(1005, 'commander');
    state.mission.totalTicks = 720;
    state.mission.day = 30;
    state.resources.science = 40;
    state.systems.solarArray.isFaulted = true; // Equipment fault
    state.resources.oxygen = 35; // Yellow but not red

    const result = determineEnding(state);
    expect(result).not.toBeNull();
    expect(result?.ending).toBe('emergency_mission');
    expect(result?.reason).toContain('persistent equipment faults');
  });
});

