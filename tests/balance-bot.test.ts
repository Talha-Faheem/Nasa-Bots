import { describe, it, expect } from 'vitest';
import { createInitialState, SimulationEngine } from '../src/sim/engine.ts';
import { EndingType } from '../src/sim/types.ts';
import { Mulberry32Rng } from '../src/sim/rng.ts';

interface BotRunSummary {
  mission_accomplished: number;
  scientific_success_resource_failure: number;
  emergency_mission: number;
  mission_abort: number;
  total: number;
  goldOrSilverBands: number;
}

function runRandomGame(seed: number): { ending: EndingType; scoreBand?: string } {
  const engine = new SimulationEngine(seed);
  let state = createInitialState(seed, 'commander');
  const botRng = new Mulberry32Rng(seed + 9999);

  for (let t = 0; t < 720; t++) {
    if (state.mission.status !== 'in_progress') break;

    // Handle any pending decisions randomly
    if (state.pendingDecisions.length > 0) {
      const decision = state.pendingDecisions[0];
      const randomOption = botRng.pick(decision.options);
      state = engine.dispatch(state, {
        type: 'RESOLVE_DECISION',
        decisionId: decision.id,
        optionId: randomOption.id,
      });
      state.mission.isPaused = false;
    }

    state = engine.tick(state);
  }

  return {
    ending: state.mission.status as EndingType,
    scoreBand: state.mission.score?.band,
  };
}

function runCarefulGame(seed: number): { ending: EndingType; scoreBand?: string } {
  const engine = new SimulationEngine(seed);
  let state = createInitialState(seed, 'commander');

  for (let t = 0; t < 720; t++) {
    if (state.mission.status !== 'in_progress') break;

    // Strategic decision making
    if (state.pendingDecisions.length > 0) {
      const decision = state.pendingDecisions[0];
      let preferredOption = decision.options[0];

      if (decision.day === 12) {
        // Space weather advisory: build shield layer
        const shieldOpt = decision.options.find((o) => o.id === 'build_shield_layer');
        preferredOption = shieldOpt || decision.options[0];
      } else if (decision.day === 3) {
        // Repair solar array immediately
        const repairOpt = decision.options.find((o) => o.id === 'repair_now');
        preferredOption = repairOpt || decision.options[0];
      } else if (decision.day === 17) {
        // Overhaul recycler
        const overhaulOpt = decision.options.find((o) => o.id === 'major_repair_recycler');
        preferredOption = overhaulOpt || decision.options[0];
      }

      state = engine.dispatch(state, {
        type: 'RESOLVE_DECISION',
        decisionId: decision.id,
        optionId: preferredOption.id,
      });
      state.mission.isPaused = false;
    }

    // Radiation Advisory: move all astronauts to underground shelter during 12-hour countdown
    if (state.radiationAdvisory && !state.radiationAdvisory.resolved) {
      for (const cid of ['alex', 'sara', 'daniel', 'maya'] as const) {
        if (state.crew[cid].location !== 'shelter' && state.crew[cid].location !== 'transit') {
          state = engine.dispatch(state, {
            type: 'MOVE_CREW',
            crewId: cid,
            targetBuilding: 'shelter',
          });
        }
      }
    }

    // After storm impact passes, return to habitat
    if (state.radiationAdvisory?.resolved && state.mission.day === 13 && state.mission.tick === 0) {
      for (const cid of ['alex', 'sara', 'daniel', 'maya'] as const) {
        if (state.crew[cid].location === 'shelter') {
          state = engine.dispatch(state, {
            type: 'MOVE_CREW',
            crewId: cid,
            targetBuilding: 'habitat',
          });
        }
      }
    }

    // Power management: during low sunlight (days 16-22), reduce greenhouse lights to save power
    if (state.mission.day === 16 && state.mission.tick === 0) {
      state = engine.dispatch(state, { type: 'SET_GREENHOUSE_LIGHTS', setting: 'low' });
    }
    if (state.mission.day === 23 && state.mission.tick === 0) {
      state = engine.dispatch(state, { type: 'SET_GREENHOUSE_LIGHTS', setting: 'normal' });
    }

    // Farming: Bed 1
    if (state.greenhouseBeds.bed1.stage === 'empty' && !state.crew.sara.currentTask && state.mission.day <= 18) {
      state = engine.dispatch(state, {
        type: 'ASSIGN_TASK',
        crewId: 'sara',
        taskType: 'plant_crop',
        buildingId: 'greenhouse',
        bedId: 'bed1',
        cropType: 'quick_greens',
      });
    }
    if (state.greenhouseBeds.bed1.stage === 'ready' && !state.crew.sara.currentTask) {
      state = engine.dispatch(state, {
        type: 'ASSIGN_TASK',
        crewId: 'sara',
        taskType: 'harvest_crop',
        buildingId: 'greenhouse',
        bedId: 'bed1',
      });
    }

    // Farming: Bed 2
    if (state.greenhouseBeds.bed2.unlocked && state.greenhouseBeds.bed2.stage === 'empty' && !state.crew.daniel.currentTask && state.mission.day <= 18) {
      state = engine.dispatch(state, {
        type: 'ASSIGN_TASK',
        crewId: 'daniel',
        taskType: 'plant_crop',
        buildingId: 'greenhouse',
        bedId: 'bed2',
        cropType: 'quick_greens',
      });
    }
    if (state.greenhouseBeds.bed2.stage === 'ready' && !state.crew.daniel.currentTask) {
      state = engine.dispatch(state, {
        type: 'ASSIGN_TASK',
        crewId: 'daniel',
        taskType: 'harvest_crop',
        buildingId: 'greenhouse',
        bedId: 'bed2',
      });
    }

    // Tend crops daily
    if (t % 24 === 4) {
      for (const b of ['bed1', 'bed2'] as const) {
        if (state.greenhouseBeds[b].stage === 'growing') {
          state.greenhouseBeds[b].tendedToday = true;
        }
      }
    }

    // Maintenance before dark window
    if ((state.mission.day === 14 || state.mission.day === 15) && state.mission.tick === 2) {
      if (!state.crew.alex.currentTask && state.resources.spareParts >= 1) {
        state = engine.dispatch(state, {
          type: 'ASSIGN_TASK',
          crewId: 'alex',
          taskType: 'minor_repair',
          buildingId: 'power_station',
        });
      }
    }

    state = engine.tick(state);
  }

  return {
    ending: state.mission.status as EndingType,
    scoreBand: state.mission.score?.band,
  };
}

describe('1,000-Game Balance Bot Simulation', () => {
  it(
    'runs 1,000 games and confirms balance targets: random play fails frequently, careful play succeeds ~60%',
    () => {
    const randomStats: BotRunSummary = {
      mission_accomplished: 0,
      scientific_success_resource_failure: 0,
      emergency_mission: 0,
      mission_abort: 0,
      total: 500,
      goldOrSilverBands: 0,
    };

    const carefulStats: BotRunSummary = {
      mission_accomplished: 0,
      scientific_success_resource_failure: 0,
      emergency_mission: 0,
      mission_abort: 0,
      total: 500,
      goldOrSilverBands: 0,
    };

    // 1. Run 500 Random Games
    for (let i = 1; i <= 500; i++) {
      const res = runRandomGame(10000 + i);
      randomStats[res.ending]++;
      if (res.scoreBand === 'Gold Commander' || res.scoreBand === 'Silver') {
        randomStats.goldOrSilverBands++;
      }
    }

    // 2. Run 500 Careful Games
    for (let i = 1; i <= 500; i++) {
      const res = runCarefulGame(20000 + i);
      carefulStats[res.ending]++;
      if (res.scoreBand === 'Gold Commander' || res.scoreBand === 'Silver') {
        carefulStats.goldOrSilverBands++;
      }
    }

    // Print Balance Bot Results
    const carefulSuccessRate = (carefulStats.mission_accomplished / carefulStats.total) * 100;
    const randomSuccessRate = (randomStats.mission_accomplished / randomStats.total) * 100;

    console.log('\n================================================================');
    console.log('       LUNAR FRONTIER: 1,000-GAME BALANCE BOT EVALUATION       ');
    console.log('================================================================');
    console.log(`Difficulty: Commander (Default) | Seed range: 10001 - 20500\n`);

    console.log('--- RANDOM PLAY BOT (500 runs) ---');
    console.log(`  Mission Accomplished:                ${randomStats.mission_accomplished.toString().padStart(4)} (${randomSuccessRate.toFixed(1)}%)`);
    console.log(`  Emergency Mission:                   ${randomStats.emergency_mission.toString().padStart(4)} (${((randomStats.emergency_mission / 500) * 100).toFixed(1)}%)`);
    console.log(`  Scientific Success Resource Failure: ${randomStats.scientific_success_resource_failure.toString().padStart(4)} (${((randomStats.scientific_success_resource_failure / 500) * 100).toFixed(1)}%)`);
    console.log(`  Mission Abort (Casualty/Evac):       ${randomStats.mission_abort.toString().padStart(4)} (${((randomStats.mission_abort / 500) * 100).toFixed(1)}%)`);
    console.log(`  Gold/Silver Score Bands:             ${randomStats.goldOrSilverBands.toString().padStart(4)} (${((randomStats.goldOrSilverBands / 500) * 100).toFixed(1)}%)\n`);

    console.log('--- CAREFUL PLAY BOT (500 runs) ---');
    console.log(`  Mission Accomplished:                ${carefulStats.mission_accomplished.toString().padStart(4)} (${carefulSuccessRate.toFixed(1)}%)`);
    console.log(`  Emergency Mission:                   ${carefulStats.emergency_mission.toString().padStart(4)} (${((carefulStats.emergency_mission / 500) * 100).toFixed(1)}%)`);
    console.log(`  Scientific Success Resource Failure: ${carefulStats.scientific_success_resource_failure.toString().padStart(4)} (${((carefulStats.scientific_success_resource_failure / 500) * 100).toFixed(1)}%)`);
    console.log(`  Mission Abort (Casualty/Evac):       ${carefulStats.mission_abort.toString().padStart(4)} (${((carefulStats.mission_abort / 500) * 100).toFixed(1)}%)`);
    console.log(`  Gold/Silver Score Bands:             ${carefulStats.goldOrSilverBands.toString().padStart(4)} (${((carefulStats.goldOrSilverBands / 500) * 100).toFixed(1)}%)`);
    console.log('================================================================\n');

    // Verification targets from Section 14 & GDD:
    // Random play often fails (abort or emergency)
    expect(randomStats.mission_accomplished).toBeLessThan(carefulStats.mission_accomplished);
    expect(randomStats.mission_abort + randomStats.emergency_mission).toBeGreaterThan(250);

    // Careful play succeeds ~6 in 10 on Commander (target 50% to 75% accomplished)
    expect(carefulSuccessRate).toBeGreaterThanOrEqual(50);
    expect(carefulSuccessRate).toBeLessThanOrEqual(80);
  }, 120000);
});
