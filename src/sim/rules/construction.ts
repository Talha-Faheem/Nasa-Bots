/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/sim/rules/construction.ts
 * Base expansion and auxiliary infrastructure projects.
 * Pure TypeScript. No React, Three, or DOM imports.
 */

import { ConstructionDefinition, ConstructionProjectId } from '../types.ts';

export const CONSTRUCTION_PROJECTS: Record<ConstructionProjectId, ConstructionDefinition> = {
  aux_battery_bank: {
    id: 'aux_battery_bank',
    name: 'Auxiliary Solid-State Battery Bank',
    description: 'Supplemental lithium-sulfur energy storage rack mounted beside the power array.',
    costParts: 2,
    costPower: 10,
    hoursNeeded: 6,
    benefit: 'Increases outpost electrical storage capacity buffer from 100 to 125.',
  },
  secondary_water_tank: {
    id: 'secondary_water_tank',
    name: 'Secondary Pressurized Water Reservoir',
    description: 'High-pressure bladder tank providing emergency graywater reserve buffer.',
    costParts: 2,
    costPower: 5,
    hoursNeeded: 6,
    benefit: 'Increases clean potable water storage capacity buffer from 100 to 125.',
  },
  emergency_o2_cell: {
    id: 'emergency_o2_cell',
    name: 'Redundant Cryogenic Oxygen Storage Manifold',
    description: 'High-pressure vacuum-jacketed Dewar tank linked directly to habitat atmosphere distribution.',
    costParts: 2,
    costPower: 8,
    hoursNeeded: 6,
    benefit: 'Increases emergency breathable oxygen storage buffer from 100 to 125.',
  },
  surface_sensor_array: {
    id: 'surface_sensor_array',
    name: 'Perimeter Micrometeorite & Dust Radar',
    description: 'Coherent microwave radar mast that tracks high-velocity ejecta and electrostatic dust clouds.',
    costParts: 1,
    costPower: 5,
    hoursNeeded: 8,
    benefit: 'Provides advance warning and alerts before solar dust disturbances hit the base.',
  },
};

