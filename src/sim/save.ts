/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/sim/save.ts
 * Versioned Save/Load system with schema verification and migration hooks.
 * Preserves mid-task progression, pending decisions, and command history.
 */

import { GameState } from './types.ts';
import { SaveStateHeaderSchema, SaveStateHeader } from './schema.ts';

export const CURRENT_SCHEMA_VERSION = 1;

export interface SerializedSaveEnvelope {
  header: SaveStateHeader;
  gameState: GameState;
  commandHistory?: unknown[];
}

/**
 * Serializes a GameState into a versioned JSON save string.
 */
export function serializeGameState(
  state: GameState,
  slotId = 'default_slot'
): string {
  const crewAlive = Object.values(state.crew).filter((c) => c.health > 10).length;

  const header: SaveStateHeader = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    saveTimestamp: Date.now(),
    slotId,
    missionDay: state.mission.day,
    seed: state.mission.seed,
    difficulty: state.mission.difficulty,
    crewAlive,
  };

  const envelope: SerializedSaveEnvelope = {
    header,
    gameState: state,
    commandHistory: (state as any).commandLog || [],
  };

  return JSON.stringify(envelope, null, 2);
}

/**
 * Migration pipeline for backward compatibility across save file schema versions.
 */
export function migrateSaveState(raw: any): GameState {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Corrupted save data: Root is not an object');
  }

  // Handle bare GameState from legacy builds
  if (!raw.header && raw.mission && raw.resources) {
    return raw as GameState;
  }

  const header = SaveStateHeaderSchema.parse(raw.header);
  let state = raw.gameState as GameState;

  // Schema Version Migrations
  if (header.schemaVersion === 1) {
    // Current version: Ensure all fields exist
    if (!state.mission || !state.resources || !state.crew) {
      throw new Error('Corrupted GameState payload in save envelope');
    }
  }

  return state;
}

/**
 * Deserializes and validates a JSON save string.
 */
export function deserializeGameState(jsonString: string): GameState {
  const raw = JSON.parse(jsonString);
  return migrateSaveState(raw);
}
