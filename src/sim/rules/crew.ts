/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/sim/rules/crew.ts
 * Section 8 & 9: Crew members, daily stamina, travel ticks, health changes, and perks.
 */

import { BuildingId, CrewId, CrewMember, ResourcesState } from '../types.ts';

export const INITIAL_CREW: Record<CrewId, CrewMember> = {
  alex: {
    id: 'alex',
    name: 'Alex Morgan',
    role: 'Systems Engineer',
    perk: 'Repairs 1 hour faster',
    stamina: 8,
    staminaMax: 8,
    health: 100,
    exposure: 0,
    location: 'habitat',
    travelTicksRemaining: 0,
    skippedRestOrExercise: false,
  },
  sara: {
    id: 'sara',
    name: 'Dr. Sara Williams',
    role: 'Biologist',
    perk: 'Greenhouse crop yield +10%',
    stamina: 8,
    staminaMax: 8,
    health: 100,
    exposure: 0,
    location: 'habitat',
    travelTicksRemaining: 0,
    skippedRestOrExercise: false,
  },
  daniel: {
    id: 'daniel',
    name: 'Daniel Brooks',
    role: 'Geologist',
    perk: 'Field samples yield +3 science',
    stamina: 8,
    staminaMax: 8,
    health: 100,
    exposure: 0,
    location: 'habitat',
    travelTicksRemaining: 0,
    skippedRestOrExercise: false,
  },
  maya: {
    id: 'maya',
    name: 'Dr. Maya Chen',
    role: 'Flight Surgeon',
    perk: '+1 extra daily health recovery for crew',
    stamina: 8,
    staminaMax: 8,
    health: 100,
    exposure: 0,
    location: 'habitat',
    travelTicksRemaining: 0,
    skippedRestOrExercise: false,
  },
};

// Coordinates of buildings in 3D world (x, z)
export const BUILDING_COORDINATES: Record<BuildingId, { x: number; z: number }> = {
  habitat: { x: 0, z: 0 },
  power_station: { x: -14, z: -6 },
  greenhouse: { x: 12, z: -4 },
  recycler: { x: 6, z: 10 },
  shelter: { x: -8, z: 12 },
  laboratory: { x: 14, z: 8 },
  comms: { x: -16, z: 10 },
  rover_bay: { x: 0, z: -16 },
};

/**
 * Calculates travel ticks between two buildings.
 * Rule: 1 tick per 8 world units (rounded up). If same building, 0 ticks.
 */
export function calculateTravelTicks(from: BuildingId, to: BuildingId): number {
  if (from === to) return 0;
  const p1 = BUILDING_COORDINATES[from] ?? { x: 0, z: 0 };
  const p2 = BUILDING_COORDINATES[to] ?? { x: 0, z: 0 };
  const dist = Math.hypot(p2.x - p1.x, p2.z - p1.z);
  return Math.max(1, Math.ceil(dist / 8));
}

export function getCrewDisplayName(crew: { name: string; role: string }): {
  shortName: string;
  firstName: string;
  fullName: string;
  role: string;
  roleShort: string;
} {
  const cleanName = crew.name.replace(/^Dr\.\s+/, '');
  const firstName = cleanName.split(' ')[0]; // 'Alex', 'Sara', 'Daniel', 'Maya'

  let roleShort = 'Crew';
  const roleLower = crew.role.toLowerCase();
  if (roleLower.includes('engineer')) roleShort = 'Engineer';
  else if (roleLower.includes('biologist')) roleShort = 'Biologist';
  else if (roleLower.includes('geologist')) roleShort = 'Geologist';
  else if (roleLower.includes('surgeon') || roleLower.includes('medic')) roleShort = 'Surgeon';

  return {
    shortName: firstName,
    firstName,
    fullName: crew.name,
    role: crew.role,
    roleShort,
  };
}

/**
 * Calculates daily health change for an astronaut at end of mission day.
 * Rules (Section 8):
 * -3 for skipped rest or exercise
 * -5 for each shortage (oxygen < 20, water < 15, food < 15)
 * -15 for red exposure (exposure >= 60)
 * +2 when nothing is wrong (+1 extra if Dr. Maya Chen is on the crew)
 */
export function calculateDailyHealthDelta(
  crew: CrewMember,
  resources: ResourcesState,
  hasMayaPerk: boolean
): number {
  let delta = 0;
  let hasTrouble = false;

  // Shortages
  if (resources.oxygen < 20) {
    delta -= 5;
    hasTrouble = true;
  }
  if (resources.water < 15) {
    delta -= 5;
    hasTrouble = true;
  }
  if (resources.food < 15) {
    delta -= 5;
    hasTrouble = true;
  }

  // Red exposure
  if (crew.exposure >= 60) {
    delta -= 15;
    hasTrouble = true;
  }

  // Skipped rest or exercise
  if (crew.skippedRestOrExercise) {
    delta -= 3;
    hasTrouble = true;
  }

  // If nothing is wrong, recover health
  if (!hasTrouble) {
    delta += 2;
    if (hasMayaPerk) {
      delta += 1; // Dr. Maya Chen perk: +1 extra recovery
    }
  }

  return delta;
}
