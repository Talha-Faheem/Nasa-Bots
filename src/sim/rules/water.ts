/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/sim/rules/water.ts
 * Section 8: Water consumption and recycling.
 */

import { GameState } from '../types.ts';

export function calculateWaterTick(
  state: GameState,
  isRecyclerPowered: boolean
): {
  newWater: number;
  waterUsePerTick: number;
  returnedWaterPerTick: number;
  isRationing: boolean;
  isRed: boolean;
  isYellow: boolean;
} {
  // Water use per day: crew 4 + 2 per active bed
  let activeBeds = 0;
  if (state.greenhouseBeds.bed1.unlocked && state.greenhouseBeds.bed1.cropType !== null) activeBeds++;
  if (state.greenhouseBeds.bed2.unlocked && state.greenhouseBeds.bed2.cropType !== null) activeBeds++;

  const waterUsePerDay = 4 + 2 * activeBeds;
  const waterUsePerTick = waterUsePerDay / 24;

  const recyclerCondition = Math.max(0, state.systems.recycler.condition);
  const returnedWaterPerTick =
    isRecyclerPowered && recyclerCondition > 0
      ? waterUsePerTick * 0.75 * (recyclerCondition / 100)
      : 0;

  const currentWater = state.resources.water;
  const newWater = Math.max(0, Math.min(100, currentWater + returnedWaterPerTick - waterUsePerTick));

  const isRationing = newWater < 15;
  const isRed = newWater < 15;
  const isYellow = newWater < 35 && !isRed;

  return {
    newWater,
    waterUsePerTick,
    returnedWaterPerTick,
    isRationing,
    isRed,
    isYellow,
  };
}

