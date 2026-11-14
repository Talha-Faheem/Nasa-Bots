/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/sim/rules/comms.ts
 * Section 8: Communications delay, Mission Control inquiries, condition thresholds.
 */

import { GameState, SiteConfig } from '../types.ts';

export function canContactMissionControl(state: GameState): boolean {
  // If comms condition < 25 (fault), hints stop
  return state.systems.comms.condition >= 25;
}

export function getCommsDelayTicks(siteConfig?: SiteConfig): number {
  if (siteConfig?.id === 'mars') {
    return 6; // 6 game hours (6 ticks) on Mars
  }
  return 0; // Moon is virtually real-time (1.3s one-way, instant in simulation ticks)
}

