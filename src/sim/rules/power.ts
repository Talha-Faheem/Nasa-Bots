/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/sim/rules/power.ts
 * Section 8: Power generation, sunlight schedule, demand, priority shedding, battery clamp.
 */

import { GameState, PowerBreakdown, PowerPriorityItem, SiteConfig } from '../types.ts';

export function getSunlightFactor(day: number, siteConfig?: SiteConfig): number {
  if (siteConfig) {
    if (day <= 10) return siteConfig.sunlightSchedule.days1to10;
    if (day <= 15) return siteConfig.sunlightSchedule.days11to15;
    if (day <= 22) return siteConfig.sunlightSchedule.days16to22;
    return siteConfig.sunlightSchedule.days23to30;
  }
  // Default Moon
  if (day <= 10) return 1.0;
  if (day <= 15) return 0.8;
  if (day <= 22) return 0.5;
  return 0.7;
}

export function calculatePowerTick(
  state: GameState,
  siteConfig?: SiteConfig
): {
  breakdown: PowerBreakdown;
  newBattery: number;
  poweredSystems: {
    lifeSupport: boolean;
    recycler: boolean;
    greenhouse: boolean;
    lab: boolean;
  };
} {
  const sunlight = getSunlightFactor(state.mission.day, siteConfig);
  const baseOutput = siteConfig?.baseArrayOutput ?? 120;
  const arrayCondition = Math.max(0, state.systems.solarArray.condition);

  // Generation per day = 120 * sunlight * (array condition / 100)
  const generationPerDay = baseOutput * sunlight * (arrayCondition / 100);
  const generationPerTick = generationPerDay / 24;

  // Essential demand: life support 30 + heat/comms 15 = 45 per day
  const essentialDemandPerDay = 45;

  // Recycler demand: 15 per day (only if condition > 0)
  const recyclerDemandPerDay = state.systems.recycler.condition > 0 ? 15 : 0;

  // Greenhouse lights demand: 5/10/15 per active bed
  let perBedWatts = 10;
  if (state.greenhouseLightSetting === 'low') perBedWatts = 5;
  if (state.greenhouseLightSetting === 'high') perBedWatts = 15;

  let activeBeds = 0;
  if (state.greenhouseBeds.bed1.unlocked && state.greenhouseBeds.bed1.cropType !== null) activeBeds++;
  if (state.greenhouseBeds.bed2.unlocked && state.greenhouseBeds.bed2.cropType !== null) activeBeds++;
  // If no crops, 1 baseline power for keeping the biome warm
  const greenhouseDemandPerDay = activeBeds > 0 ? activeBeds * perBedWatts : (state.mission.stage >= 2 ? 5 : 0);

  // Lab demand: 15 per day if active experiment
  const labDemandPerDay = state.lab.activeExperiment ? 15 : 0;

  const totalDemandPerDay =
    essentialDemandPerDay + recyclerDemandPerDay + greenhouseDemandPerDay + labDemandPerDay;

  // Check battery + generation
  const currentBattery = state.resources.battery;
  const maxAvailableThisTick = currentBattery + generationPerTick;

  // Priority shedding order: default ['essential', 'recycler', 'greenhouse', 'laboratory', 'rover_upgrades']
  // We satisfy priorities in order:
  const priorityList = state.powerPriority || [
    'essential',
    'recycler',
    'greenhouse',
    'laboratory',
    'rover_upgrades',
  ];

  const demands: Record<PowerPriorityItem, number> = {
    essential: essentialDemandPerDay / 24,
    recycler: recyclerDemandPerDay / 24,
    greenhouse: greenhouseDemandPerDay / 24,
    laboratory: labDemandPerDay / 24,
    rover_upgrades: 0,
  };

  let remainingPowerBudget = maxAvailableThisTick;
  let servedDemandPerTick = 0;
  const shedSystems: PowerPriorityItem[] = [];

  const poweredSystems = {
    lifeSupport: false,
    recycler: false,
    greenhouse: false,
    lab: false,
  };

  for (const item of priorityList) {
    const itemDemand = demands[item];
    if (itemDemand <= 0) continue;

    if (remainingPowerBudget >= itemDemand) {
      remainingPowerBudget -= itemDemand;
      servedDemandPerTick += itemDemand;
      if (item === 'essential') poweredSystems.lifeSupport = true;
      if (item === 'recycler') poweredSystems.recycler = true;
      if (item === 'greenhouse') poweredSystems.greenhouse = true;
      if (item === 'laboratory') poweredSystems.lab = true;
    } else {
      // Cannot satisfy this system completely -> shed it
      shedSystems.push(item);
    }
  }

  // Battery update: clamp(battery + generation - servedDemand, 0, 100)
  const newBattery = Math.max(
    0,
    Math.min(100, currentBattery + generationPerTick - servedDemandPerTick)
  );

  const breakdown: PowerBreakdown = {
    sunlightFactor: sunlight,
    generationPerDay,
    generationPerTick,
    essentialDemandPerDay,
    recyclerDemandPerDay,
    greenhouseDemandPerDay,
    labDemandPerDay,
    totalDemandPerDay,
    servedDemandPerTick,
    batteryDeltaPerTick: generationPerTick - servedDemandPerTick,
    shedSystems,
  };

  return {
    breakdown,
    newBattery,
    poweredSystems,
  };
}
