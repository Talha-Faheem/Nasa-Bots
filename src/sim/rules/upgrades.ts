/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/sim/rules/upgrades.ts
 * Building upgrades catalog and operational modifiers.
 * Pure TypeScript. No React, Three, or DOM imports.
 */

import { BuildingId, BuildingUpgradeId, UpgradeDefinition } from '../types.ts';

export const BUILDING_UPGRADES: Record<BuildingUpgradeId, UpgradeDefinition> = {
  solar_cells: {
    id: 'solar_cells',
    buildingId: 'power_station',
    name: 'Advanced Multi-Junction Photovoltaics',
    description: 'Next-generation gallium-arsenide solar cells with enhanced light absorption.',
    benefit: '+20% solar power generation during sunlight hours.',
    costPower: 10,
    costParts: 2,
    hoursNeeded: 6,
  },
  dust_coating: {
    id: 'dust_coating',
    buildingId: 'power_station',
    name: 'Electrodynamic Regolith Dust Shield',
    description: 'Active electrodynamic wave generator that automatically clears abrasive lunar dust.',
    benefit: '+15% solar panel durability and reduced degradation.',
    costPower: 5,
    costParts: 1,
    hoursNeeded: 4,
  },
  thermal_insulation: {
    id: 'thermal_insulation',
    buildingId: 'habitat',
    name: 'Aerogel Multi-Layer Vacuum Insulation',
    description: 'Ultra-lightweight silica aerogel blanketing to withstand the 14-day lunar night.',
    benefit: 'Reduces essential habitat thermal power demand by 15%.',
    costPower: 5,
    costParts: 1,
    hoursNeeded: 5,
  },
  emergency_o2: {
    id: 'emergency_o2',
    buildingId: 'habitat',
    name: 'Secondary Cryogenic Oxygen Cell',
    description: 'Compact reserve tank that provides life support redundancy during leaks.',
    benefit: 'Increases outpost oxygen storage buffer from 100 to 115.',
    costPower: 8,
    costParts: 2,
    hoursNeeded: 5,
  },
  nanofilter: {
    id: 'nanofilter',
    buildingId: 'recycler',
    name: 'Graphene Nanofiltration Membrane',
    description: 'Sub-nanometer filtration pores that trap contaminants with minimal pump resistance.',
    benefit: 'Boosts water recycling reclamation rate by +10%.',
    costPower: 8,
    costParts: 2,
    hoursNeeded: 5,
  },
  crop_led: {
    id: 'crop_led',
    buildingId: 'greenhouse',
    name: 'Hyper-Spectrum Photosynthetic LEDs',
    description: 'Tailored 450nm royal blue and 660nm deep red lighting optimized for vegetable photosynthesis.',
    benefit: 'Increases hydroponic crop growth rate by +20%.',
    costPower: 10,
    costParts: 1,
    hoursNeeded: 4,
  },
  spectrometer: {
    id: 'spectrometer',
    buildingId: 'laboratory',
    name: 'Automated Raman & XRF Spectrometer',
    description: 'Robotic elemental analysis platform for automated sample scanning.',
    benefit: 'Increases scientific research project progression speed by +30%.',
    costPower: 12,
    costParts: 2,
    hoursNeeded: 6,
  },
  high_gain_antenna: {
    id: 'high_gain_antenna',
    buildingId: 'comms',
    name: 'Ka-Band Steerable Phased Array Antenna',
    description: 'High-gain deep space transmitter for uninterrupted telemetry to Earth Mission Control.',
    benefit: 'Doubles comms reliability and prevents signal dropouts during storms.',
    costPower: 8,
    costParts: 1,
    hoursNeeded: 4,
  },
  regolith_shield: {
    id: 'regolith_shield',
    buildingId: 'shelter',
    name: 'Sintered Regolith Radiation Shell',
    description: 'Thick compacted lunar regolith microwave-sintered into radiation shielding.',
    benefit: '+10 radiation protection per layer (up to 3 layers, max 90).',
    costPower: 15,
    costParts: 2,
    hoursNeeded: 8,
  },
};

export function getUpgradesForBuilding(buildingId: BuildingId): UpgradeDefinition[] {
  return Object.values(BUILDING_UPGRADES).filter((u) => u.buildingId === buildingId);
}

