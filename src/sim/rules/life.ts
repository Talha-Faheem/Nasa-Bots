/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/sim/rules/life.ts
 * Section 8: Life support (oxygen) generation and consumption.
 */

import { GameState } from '../types.ts';

export function calculateLifeSupportTick(
  state: GameState,
  isPowered: boolean
): {
  newOxygen: number;
  consumptionPerTick: number;
  productionPerTick: number;
  isRed: boolean;
  isYellow: boolean;
} {
  // Crew uses 6 oxygen per day = 6 / 24 per tick = 0.25
  const consumptionPerTick = 6 / 24;

  // Life support makes 5.8 * (condition / 100) per day while powered
  const condition = Math.max(0, state.systems.lifeSupport.condition);
  const productionPerDay = isPowered ? 5.8 * (condition / 100) : 0;
  const productionPerTick = productionPerDay / 24;

  const currentOxygen = state.resources.oxygen;
  const newOxygen = Math.max(0, Math.min(100, currentOxygen + productionPerTick - consumptionPerTick));

  const isRed = newOxygen < 20;
  const isYellow = newOxygen < 40 && !isRed;

  return {
    newOxygen,
    consumptionPerTick,
    productionPerTick,
    isRed,
    isYellow,
  };
}

