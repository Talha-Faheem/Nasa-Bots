/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * tests/sim.milestone1.test.ts
 * Milestone 1 Acceptance Test Suite:
 * - Runtime Zod balance config validation
 * - Deterministic sim loop and Mulberry32 seeded RNG
 * - Command pattern dispatch & append-only commandLog
 * - Event log infrastructure
 * - Versioned Save/Load serialization & migration hooks
 */

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { validateBalanceConfig } from '../src/sim/schema.ts';
import { Mulberry32Rng } from '../src/sim/rng.ts';
import { createInitialState, SimulationEngine } from '../src/sim/engine.ts';
import { serializeGameState, deserializeGameState, CURRENT_SCHEMA_VERSION } from '../src/sim/save.ts';

describe('Milestone 1 — Foundation Architecture', () => {
  it('validates /data/balance.json against strict Zod BalanceConfigSchema', () => {
    const balancePath = path.resolve(process.cwd(), 'data/balance.json');
    expect(fs.existsSync(balancePath)).toBe(true);

    const rawJson = JSON.parse(fs.readFileSync(balancePath, 'utf-8'));
    const validated = validateBalanceConfig(rawJson);

    expect(validated.version).toBe('1.0.0');
    expect(validated.food.consumptionPerAstronautPerDay).toBe(1.0);
    expect(validated.food.startingStock).toBe(60.0);
    expect(validated.water.consumptionPerAstronautPerDay).toBe(4.0);
    expect(validated.water.startingStock).toBe(300.0);
    expect(validated.oxygen.consumptionPerAstronautPerDay).toBe(0.85);
    expect(validated.oxygen.startingStock).toBe(100.0);
    expect(validated.power.solarGenerationPeakKW).toBe(12.0);
    expect(validated.power.batteryCapacityKWh).toBe(60.0);
    expect(validated.crew.vitals.healthMax).toBe(100);
    expect(validated.crew.vitals.staminaMax).toBe(100);
    expect(validated.crew.vitals.moraleMax).toBe(100);
    expect(validated.difficultyModifiers.survival.suppliesMultiplier).toBe(1.0);
    expect(validated.difficultyModifiers.explorer.suppliesMultiplier).toBe(1.5);
    expect(validated.difficultyModifiers.expert.suppliesMultiplier).toBe(0.75);
  });

  it('guarantees deterministic pseudo-random sequences with Mulberry32 RNG', () => {
    const rng1 = new Mulberry32Rng(424242);
    const rng2 = new Mulberry32Rng(424242);

    const seq1 = Array.from({ length: 50 }, () => rng1.next());
    const seq2 = Array.from({ length: 50 }, () => rng2.next());

    expect(seq1).toEqual(seq2);

    // Different seed must yield distinct sequence
    const rng3 = new Mulberry32Rng(999999);
    const seq3 = Array.from({ length: 50 }, () => rng3.next());
    expect(seq1).not.toEqual(seq3);
  });

  it('dispatches commands and logs them to immutable commandLog', () => {
    const engine = new SimulationEngine(1001);
    let state = createInitialState(1001, 'survival');

    expect(state.commandLog).toBeDefined();
    expect(state.commandLog!.length).toBe(0);

    // Dispatch Speed Command
    state = engine.dispatch(state, { type: 'SET_SPEED', speed: 2 });
    expect(state.mission.speed).toBe(2);
    expect(state.commandLog!.length).toBe(1);
    expect(state.commandLog![0].command.type).toBe('SET_SPEED');

    // Dispatch Pause Command
    state = engine.dispatch(state, { type: 'PAUSE' });
    expect(state.mission.isPaused).toBe(true);
    expect(state.commandLog!.length).toBe(2);
    expect(state.commandLog![1].command.type).toBe('PAUSE');

    // Dispatch Move Command
    state = engine.dispatch(state, {
      type: 'MOVE_CREW',
      crewId: 'alex',
      targetBuilding: 'power_station',
    });
    expect(state.commandLog!.length).toBe(3);
    expect(state.commandLog![2].command.type).toBe('MOVE_CREW');
  });

  it('maintains append-only event log across simulation ticks', () => {
    const engine = new SimulationEngine(2002);
    let state = createInitialState(2002, 'survival');

    const initialLogLength = state.log.length;
    expect(initialLogLength).toBeGreaterThan(0);

    // Advance 5 ticks
    for (let i = 0; i < 5; i++) {
      state = engine.tick(state);
    }

    expect(state.log.length).toBeGreaterThanOrEqual(initialLogLength);
    // Every log entry has valid structure
    for (const entry of state.log) {
      expect(entry.id).toBeDefined();
      expect(entry.day).toBeGreaterThanOrEqual(1);
      expect(entry.message).toBeTruthy();
    }
  });

  it('serializes and deserializes versioned save state preserving all fields and commandLog', () => {
    const engine = new SimulationEngine(3003);
    let state = createInitialState(3003, 'survival');

    // Add some commands and ticks
    state = engine.dispatch(state, { type: 'SET_SPEED', speed: 4 });
    state = engine.dispatch(state, {
      type: 'MOVE_CREW',
      crewId: 'sara',
      targetBuilding: 'greenhouse',
    });
    state = engine.tick(state);
    state = engine.tick(state);

    const savedJson = serializeGameState(state, 'slot_test_1');
    expect(typeof savedJson).toBe('string');

    const parsedEnvelope = JSON.parse(savedJson);
    expect(parsedEnvelope.header.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
    expect(parsedEnvelope.header.seed).toBe(3003);
    expect(parsedEnvelope.header.crewAlive).toBe(4);

    // Round-trip deserialize
    const loadedState = deserializeGameState(savedJson);
    expect(loadedState.mission.seed).toBe(3003);
    expect(loadedState.mission.day).toBe(state.mission.day);
    expect(loadedState.mission.tick).toBe(state.mission.tick);
    expect(loadedState.crew.sara.location).toBe(state.crew.sara.location);
    expect(loadedState.commandLog).toBeDefined();
    expect(loadedState.commandLog!.length).toBe(2);
  });
});
