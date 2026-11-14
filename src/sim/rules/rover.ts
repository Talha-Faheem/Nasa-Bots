/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/sim/rules/rover.ts
 * Surface exploration destinations and expedition calculations.
 * Pure TypeScript. No React, Three, or DOM imports.
 */

import { RoverDestination, RoverDestinationId } from '../types.ts';

export const ROVER_DESTINATIONS: Record<RoverDestinationId, RoverDestination> = {
  shackleton_rim: {
    id: 'shackleton_rim',
    name: 'Shackleton Crater Rim Crest',
    distanceKm: 3.5,
    travelTicks: 4,
    batteryCost: 10,
    description: 'High-elevation ridge with near-permanent solar illumination. Collects pristine surface regolith breccias.',
    scienceYield: 20,
    rewardType: 'science',
    rewardAmount: 20,
  },
  shadowed_crater: {
    id: 'shadowed_crater',
    name: 'Permanently Shadowed Cold Trap',
    distanceKm: 7.2,
    travelTicks: 8,
    batteryCost: 20,
    description: 'Pitch-black ultra-cold depression (-240°C). Deep core drill searches for trapped water ice volatiles.',
    scienceYield: 35,
    rewardType: 'water',
    rewardAmount: 15,
  },
  malapert_peak: {
    id: 'malapert_peak',
    name: 'Malapert Mountain Summit',
    distanceKm: 5.8,
    travelTicks: 6,
    batteryCost: 15,
    description: 'Panoramic line-of-sight elevation for direct-to-Earth microwave communications relay and solar telemetry.',
    scienceYield: 25,
    rewardType: 'power',
    rewardAmount: 15,
  },
  apollo_descent: {
    id: 'apollo_descent',
    name: 'Historic Lunar Surveyor Landing Site',
    distanceKm: 12.0,
    travelTicks: 12,
    batteryCost: 25,
    description: 'Archaeological inspection of legacy hardware to measure 50+ years of micrometeorite pitting and thermal fatigue.',
    scienceYield: 40,
    rewardType: 'parts',
    rewardAmount: 2,
  },
};

