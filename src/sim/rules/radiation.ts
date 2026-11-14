/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/sim/rules/radiation.ts
 * Section 8: Simulated radiation risk model.
 * HARD CONSTRAINT: NEVER convert a flare, CME, or SEP record into a measured astronaut dose.
 * Radiation numbers are labeled simulated risk.
 */

import { CrewLocation, CrewMember } from '../types.ts';

export function getPositionFactor(location: CrewLocation): number {
  if (location === 'shelter') {
    return 0.15;
  }
  if (location === 'habitat') {
    return 0.5;
  }
  // Any outside building or transit or surface:
  // Note: Shelter is 0.15, Habitat is 0.5, all others are surface / exposed
  return 1.0;
}

/**
 * Calculates simulated exposure points for an astronaut during a solar event impact.
 * Formula: 10 * S * positionFactor * (1 - 0.6 * protection / 100)
 */
export function calculateEventExposure(
  severity: 1 | 2 | 3 | 4 | 5,
  positionFactor: number,
  protection: number
): number {
  const protectionClamped = Math.max(0, Math.min(100, protection));
  const protectionFactor = 1 - (0.6 * protectionClamped) / 100;
  const exposure = 10 * severity * positionFactor * protectionFactor;
  return Math.round(exposure * 100) / 100; // 2 decimal precision
}

/**
 * Calculates baseline exposure for surface work per tick.
 * Surface work adds 0.5 per day = 0.5 / 24 per tick.
 */
export function calculateBaselineSurfaceExposurePerTick(location: CrewLocation): number {
  if (location === 'surface' || location === 'transit') {
    return 0.5 / 24;
  }
  return 0;
}

/**
 * Updates crew exposure and checks health penalty for red threshold (>= 60).
 */
export function checkExposureThresholds(crew: CrewMember): {
  isYellow: boolean;
  isRed: boolean;
  healthPenalty: number;
} {
  const isRed = crew.exposure >= 60;
  const isYellow = crew.exposure >= 30 && !isRed;
  // Red costs 15 health (applied once when entering red or applied per day in red)
  const healthPenalty = isRed ? 15 : 0;

  return {
    isYellow,
    isRed,
    healthPenalty,
  };
}

