/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/sim/rules/research.ts
 * Scientific research projects conducted at the Science Laboratory.
 * Pure TypeScript. No React, Three, or DOM imports.
 */

import { ResearchDefinition, ResearchProjectId } from '../types.ts';

export const RESEARCH_PROJECTS: Record<ResearchProjectId, ResearchDefinition> = {
  regolith_composition: {
    id: 'regolith_composition',
    name: 'Lunar Regolith Elemental Analysis',
    category: 'Geology',
    description: 'X-ray fluorescence scan of local south polar soil samples to detect ilmenite, iron, and titanium.',
    hoursNeeded: 8,
    powerPerTick: 1.0,
    scienceReward: 25,
    perkUnlocked: 'Unlocks advanced regolith sintering efficiency for shelter reinforcements.',
    stemConcept: 'Lunar soil (regolith) is rich in oxygen bound in metal oxides like ilmenite (FeTiO3), which can be extracted by future astronauts.',
  },
  water_ice_investigation: {
    id: 'water_ice_investigation',
    name: 'Permanently Shadowed Volatiles Investigation',
    category: 'Hydrology',
    description: 'Spectroscopic analysis of cold-trap core samples for trapped water-ice crystals.',
    hoursNeeded: 12,
    powerPerTick: 1.2,
    scienceReward: 35,
    perkUnlocked: 'Yields +15 water reserve directly to outpost reservoirs.',
    stemConcept: 'Because the Moon has only a 1.5° axial tilt, deep crater floors at the poles never receive sunlight, keeping temperatures at -246°C for billions of years.',
  },
  solar_radiation_monitoring: {
    id: 'solar_radiation_monitoring',
    name: 'Solar Particle Event Flux Mapping',
    category: 'Heliophysics',
    description: 'Correlating satellite coronagraph telemetry with surface particle detectors to predict CME arrival windows.',
    hoursNeeded: 10,
    powerPerTick: 0.8,
    scienceReward: 25,
    perkUnlocked: 'Extends space-weather warning countdown by +4 hours.',
    stemConcept: 'Solar flares release energetic protons (SEPs) that travel near light speed, while Coronal Mass Ejections (CMEs) take 1 to 3 days to reach the Moon.',
  },
  lunar_environmental_analysis: {
    id: 'lunar_environmental_analysis',
    name: 'Electrostatic Dust Levitation & Abrasion',
    category: 'Environmental Analysis',
    description: 'Studying how solar UV charging causes jagged lunar dust grains to levitate and adhere to solar panels.',
    hoursNeeded: 8,
    powerPerTick: 0.8,
    scienceReward: 20,
    perkUnlocked: 'Improves solar array cleaning efficiency by +25%.',
    stemConcept: 'Unlike Earth sand weathered by wind and water, lunar dust grains are jagged shards of volcanic glass and fractured minerals with sharp cutting edges.',
  },
  sustainable_agriculture: {
    id: 'sustainable_agriculture',
    name: 'Closed-Loop Nutrient Hydroponics',
    category: 'Life Sciences',
    description: 'Optimizing nitrogen, phosphorus, and potassium ratios in recirculating nutrient solutions for micro-greens.',
    hoursNeeded: 10,
    powerPerTick: 1.0,
    scienceReward: 30,
    perkUnlocked: 'Permanently boosts all hydroponic crop yields by +15%.',
    stemConcept: 'Controlled Environment Agriculture (CEA) allows astronauts to produce fresh vitamins (C and K) while plants absorb carbon dioxide and release breathable oxygen.',
  },
  habitat_efficiency: {
    id: 'habitat_efficiency',
    name: 'Closed-Loop Life Support Optimization',
    category: 'Engineering',
    description: 'Fine-tuning Sabatier CO2 reduction and electrolysis flow rates to minimize parasitic power draw.',
    hoursNeeded: 10,
    powerPerTick: 1.0,
    scienceReward: 25,
    perkUnlocked: 'Permanently reduces life support baseline electrical demand by -10%.',
    stemConcept: 'NASA’s Environmental Control and Life Support System (ECLSS) recycles over 98% of astronaut sweat, urine, and breath moisture into drinkable water on the ISS.',
  },
};

