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
    status: 'IDLE',
    currentActivity: 'Calibrating solar array inverters',
    officeId: 'power_station',
    officeName: 'Power & Engineering Bay',
    officeDuty: 'Electrical & Life Support Maintenance',
    skills: {
      engineering: { level: 4, xp: 350, xpNeeded: 500 },
      mechanical: { level: 3, xp: 220, xpNeeded: 350 },
      operations: { level: 2, xp: 140, xpNeeded: 200 },
      science: { level: 1, xp: 50, xpNeeded: 100 },
      medical: { level: 1, xp: 40, xpNeeded: 100 },
      biology: { level: 1, xp: 30, xpNeeded: 100 },
    },
    workHistory: [
      {
        id: 'hist_alex_0',
        missionDay: 1,
        tick: 0,
        taskName: 'Solar Array Diagnostic',
        category: 'Engineering',
        location: 'Solar Power Array',
        status: 'Completed',
        durationHours: 2,
        xpGained: { skill: 'engineering', amount: 40 },
      },
    ],
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
    status: 'IDLE',
    currentActivity: 'Monitoring hydroponic nutrient pH',
    officeId: 'greenhouse',
    officeName: 'Hydroponic Biosphere',
    officeDuty: 'Crop Cultivation & Food Production',
    skills: {
      biology: { level: 4, xp: 380, xpNeeded: 500 },
      science: { level: 3, xp: 240, xpNeeded: 350 },
      operations: { level: 2, xp: 150, xpNeeded: 200 },
      medical: { level: 2, xp: 120, xpNeeded: 200 },
      engineering: { level: 1, xp: 40, xpNeeded: 100 },
      mechanical: { level: 1, xp: 30, xpNeeded: 100 },
    },
    workHistory: [
      {
        id: 'hist_sara_0',
        missionDay: 1,
        tick: 0,
        taskName: 'Greenhouse Seed Bed Prep',
        category: 'Life Support',
        location: 'Hydroponic Greenhouse',
        status: 'Completed',
        durationHours: 2,
        xpGained: { skill: 'biology', amount: 50 },
      },
    ],
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
    status: 'IDLE',
    currentActivity: 'Inspecting rover spectrometer telemetry',
    officeId: 'laboratory',
    officeName: 'Science & Geology Lab',
    officeDuty: 'Surface Surveys & Mineral Analysis',
    skills: {
      science: { level: 4, xp: 390, xpNeeded: 500 },
      operations: { level: 3, xp: 260, xpNeeded: 350 },
      mechanical: { level: 2, xp: 160, xpNeeded: 200 },
      engineering: { level: 2, xp: 130, xpNeeded: 200 },
      biology: { level: 1, xp: 50, xpNeeded: 100 },
      medical: { level: 1, xp: 40, xpNeeded: 100 },
    },
    workHistory: [
      {
        id: 'hist_daniel_0',
        missionDay: 1,
        tick: 0,
        taskName: 'Regolith Spectral Baseline',
        category: 'Science',
        location: 'Research Laboratory',
        status: 'Completed',
        durationHours: 3,
        xpGained: { skill: 'science', amount: 60 },
      },
    ],
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
    status: 'IDLE',
    currentActivity: 'Checking crew bio-telemetry & dosimetry',
    officeId: 'habitat',
    officeName: 'Habitat Medical Bay',
    officeDuty: 'Crew Health & Radiation Dosimetry',
    skills: {
      medical: { level: 4, xp: 420, xpNeeded: 500 },
      biology: { level: 3, xp: 230, xpNeeded: 350 },
      operations: { level: 2, xp: 150, xpNeeded: 200 },
      science: { level: 2, xp: 140, xpNeeded: 200 },
      engineering: { level: 1, xp: 40, xpNeeded: 100 },
      mechanical: { level: 1, xp: 30, xpNeeded: 100 },
    },
    workHistory: [
      {
        id: 'hist_maya_0',
        missionDay: 1,
        tick: 0,
        taskName: 'Crew Health Baseline Checkup',
        category: 'Medical',
        location: 'Habitat Base',
        status: 'Completed',
        durationHours: 2,
        xpGained: { skill: 'medical', amount: 50 },
      },
    ],
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
