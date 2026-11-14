/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/sim/scoring.ts
 * Implements Section 10 scoring, safety gate, bands and endings.
 */

import { GameState, ScoreBreakdown, EndingType } from './types.ts';

export function calculateScore(state: GameState): ScoreBreakdown {
  const crewMembers = Object.values(state.crew);
  const totalHealth = crewMembers.reduce((sum, c) => sum + Math.max(0, c.health), 0);
  const avgHealth = totalHealth / crewMembers.length;

  const redExposureAstronauts = crewMembers.filter((c) => c.exposure >= 60).length;

  // 1. Crew Safety: 300 * (avg final health / 100) - 50 per red-exposure astronaut
  const rawCrewSafety = Math.round((300 * avgHealth) / 100) - redExposureAstronauts * 50;
  const crewSafety = Math.max(0, Math.min(300, rawCrewSafety));

  // 2. Life Support: 200 * (days oxygen not red / 30) - 40 per emergency
  const daysOxygenNotRed = Math.min(30, Math.max(0, state.stats.daysOxygenNotRed));
  const emergencies = state.stats.emergenciesCount;
  const rawLifeSupport = Math.round((200 * daysOxygenNotRed) / 30) - emergencies * 40;
  const lifeSupport = Math.max(0, Math.min(200, rawLifeSupport));

  // 3. Power: 150 * (days battery above 20 / 30)
  const daysBatteryAbove20 = Math.min(30, Math.max(0, state.stats.daysBatteryAbove20));
  const power = Math.max(0, Math.min(150, Math.round((150 * daysBatteryAbove20) / 30)));

  // 4. Radiation Preparedness: 100 if nobody reached red, + 50 if protection >= 70 before advisory
  let radiationPreparedness = 0;
  if (redExposureAstronauts === 0) {
    radiationPreparedness += 100;
  }
  if (state.stats.protectionBeforeAdvisory >= 70) {
    radiationPreparedness += 50;
  }
  radiationPreparedness = Math.min(150, radiationPreparedness);

  // 5. Food & Water: 50 each, scaled by final reserve (full marks >= 40)
  const waterScore = Math.min(50, Math.max(0, Math.round((50 * Math.max(0, state.resources.water)) / 40)));
  const foodScore = Math.min(50, Math.max(0, Math.round((50 * Math.max(0, state.resources.food)) / 40)));
  const foodAndWater = waterScore + foodScore;

  // 6. Science: experiments and samples, capped at 100
  let science = Math.min(100, Math.max(0, Math.round(state.resources.science)));

  // Safety Gate: if Crew Safety < 150 or anyone ends in red exposure, science = 0 and best band is Bronze
  const safetyGateTriggered = crewSafety < 150 || redExposureAstronauts > 0;
  if (safetyGateTriggered) {
    science = 0;
  }

  const total = crewSafety + lifeSupport + power + radiationPreparedness + foodAndWater + science;

  let band: ScoreBreakdown['band'];
  if (safetyGateTriggered) {
    band = total >= 550 ? 'Bronze' : 'Trainee';
  } else {
    if (total >= 900) {
      band = 'Gold Commander';
    } else if (total >= 750) {
      band = 'Silver';
    } else if (total >= 550) {
      band = 'Bronze';
    } else {
      band = 'Trainee';
    }
  }

  return {
    crewSafety,
    lifeSupport,
    power,
    radiationPreparedness,
    foodAndWater,
    science,
    total,
    safetyGateTriggered,
    band,
  };
}

export function determineEnding(state: GameState): { ending: EndingType; reason: string } | null {
  const crewMembers = Object.values(state.crew);

  // Check Mission Abort: any health <= 10 or oxygen at 0 for 2 days (48 ticks)
  const anyCriticalHealth = crewMembers.some((c) => c.health <= 10);
  if (anyCriticalHealth) {
    return {
      ending: 'mission_abort',
      reason: 'Critical crew health hazard. Mission aborted for astronaut safety; crew safely evacuated.',
    };
  }

  if (state.stats.consecutiveOxygenZeroTicks >= 48) {
    return {
      ending: 'mission_abort',
      reason: 'Life support depleted for 48 consecutive hours. Mission aborted for safety; emergency evacuation successful.',
    };
  }

  // If not Day 30 complete (totalTicks < 720), mission is still in progress
  if (state.mission.totalTicks < 720) {
    return null;
  }

  // End of Day 30 reached!
  const anyRedResource =
    state.resources.oxygen < 20 ||
    state.resources.water < 15 ||
    state.resources.food < 15 ||
    state.resources.battery < 15;

  const allHealthy = crewMembers.every((c) => c.health >= 30 && c.exposure < 60);
  const anyFaulted =
    state.systems.solarArray.isFaulted ||
    state.systems.lifeSupport.isFaulted ||
    state.systems.recycler.isFaulted ||
    state.systems.greenhouse.isFaulted ||
    state.systems.comms.isFaulted;

  if (state.resources.science >= 70 && anyRedResource) {
    return {
      ending: 'scientific_success_resource_failure',
      reason: 'Major scientific discoveries achieved, but base critical resource reserves were depleted.',
    };
  }

  if (allHealthy && !anyRedResource && !anyFaulted) {
    return {
      ending: 'mission_accomplished',
      reason: 'Outstanding 30-day expedition! Base fully operational and crew in prime health.',
    };
  }

  return {
    ending: 'emergency_mission',
    reason: 'Crew survived all 30 days safely, despite persistent equipment faults and supply challenges.',
  };
}

