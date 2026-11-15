/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/sim/rules/geology.ts
 * Lunar geological deposits, surface exploration scanning, in-situ resource extraction,
 * and materials refining and processing.
 */

import { ResourceDeposit, GameState, CrewMember } from '../types.ts';
import { getTerrainHeight } from '../../game3d/Physics/TerrainHeight.ts';
import { cloneGameState } from '../clone.ts';

export function createInitialDeposits(): Record<string, ResourceDeposit> {
  const depositList: Omit<ResourceDeposit, 'elevation'>[] = [
    {
      id: 'dep_water_ice',
      name: 'Permanently Shadowed Water Ice Core',
      resourceType: 'water_ice',
      zone: 'Water Ice Deposit Zone',
      position: { x: -10, z: 35 },
      totalQuantity: 450,
      remainingQuantity: 450,
      depleted: false,
      scanned: false,
      difficulty: 'moderate',
      requiredTool: 'Cryogenic Ice Core Drill',
      description: 'Volatile-rich cryogenic water ice trapped in permanently shadowed cold trap at 89°S.',
    },
    {
      id: 'dep_regolith_alpha',
      name: 'High-Grade Sintering Regolith',
      resourceType: 'regolith',
      zone: 'Base Construction Zone',
      position: { x: -18, z: 12 },
      totalQuantity: 1500,
      remainingQuantity: 1500,
      depleted: false,
      scanned: true,
      difficulty: 'easy',
      requiredTool: 'Regolith Bucket Drum Excavator',
      description: 'Fine-grained lunar soil rich in basalt and anorthosite, ideal for microwave sintering.',
    },
    {
      id: 'dep_iron_ridge',
      name: 'Ilmenite Iron-Titanium Ridge',
      resourceType: 'iron',
      zone: 'Mineral Deposit Zone',
      position: { x: 30, z: -15 },
      totalQuantity: 380,
      remainingQuantity: 380,
      depleted: false,
      scanned: false,
      difficulty: 'moderate',
      requiredTool: 'Percussive Drill Rig',
      description: 'Ilmenite mineral vein containing iron oxides and high-grade titanium ore.',
    },
    {
      id: 'dep_titanium_outcrop',
      name: 'Anorthosite Titanium Outcrop',
      resourceType: 'titanium',
      zone: 'Rocky Terrain Zone',
      position: { x: 28, z: 25 },
      totalQuantity: 220,
      remainingQuantity: 220,
      depleted: false,
      scanned: false,
      difficulty: 'challenging',
      requiredTool: 'Diamond Tip Drill & Spectrometer',
      description: 'High-strength structural titanium deposit for reinforced spacecraft and habitat fabrication.',
    },
    {
      id: 'dep_aluminum_field',
      name: 'Highland Feldspar Aluminum Field',
      resourceType: 'aluminum',
      zone: 'Rocky Terrain Zone',
      position: { x: 22, z: -18 },
      totalQuantity: 300,
      remainingQuantity: 300,
      depleted: false,
      scanned: false,
      difficulty: 'easy',
      requiredTool: 'Surface Shovel & Screening Hopper',
      description: 'Feldspathic mineral regolith easily reduced to structural aluminum alloys.',
    },
    {
      id: 'dep_silicon_sands',
      name: 'Silicate Sand Beds',
      resourceType: 'silicon',
      zone: 'Crater Exploration Zone',
      position: { x: -25, z: -20 },
      totalQuantity: 260,
      remainingQuantity: 260,
      depleted: false,
      scanned: false,
      difficulty: 'moderate',
      requiredTool: 'Optical Spectrometer & Classifier',
      description: 'High-purity silicate regolith suited for photovoltaic solar cell production.',
    },
    {
      id: 'dep_he3_deep',
      name: 'Helium-3 Solar Wind Volatiles',
      resourceType: 'he3',
      zone: 'Scientific Research Zone',
      position: { x: -35, z: 15 },
      totalQuantity: 30,
      remainingQuantity: 30,
      depleted: false,
      scanned: false,
      difficulty: 'extreme',
      requiredTool: 'Thermal Desorption Chamber',
      description: 'Rare primordial fusion fuel implanted by billions of years of solar wind irradiation.',
    },
  ];

  const map: Record<string, ResourceDeposit> = {};
  for (const d of depositList) {
    map[d.id] = {
      ...d,
      elevation: getTerrainHeight(d.position.x, d.position.z),
    };
  }

  return map;
}

/**
 * Scans a deposit using geological instruments.
 */
export function scanDeposit(
  deposit: ResourceDeposit,
  crew: CrewMember
): { scannedDeposit: ResourceDeposit; scienceGained: number } {
  const isGeologist = crew.id === 'daniel';
  const scienceGained = isGeologist ? 6 : 3;

  return {
    scannedDeposit: {
      ...deposit,
      scanned: true,
    },
    scienceGained,
  };
}

/**
 * Executes an in-situ extraction operation.
 */
export function mineDeposit(
  state: GameState,
  depositId: string,
  crewId: 'alex' | 'sara' | 'daniel' | 'maya',
  requestedAmount = 30
): { nextState: GameState; extracted: number; success: boolean } {
  const deposit = state.deposits?.[depositId];
  if (!deposit || deposit.depleted || deposit.remainingQuantity <= 0) {
    return { nextState: state, extracted: 0, success: false };
  }

  const crew = state.crew[crewId];
  if (crew.stamina < 2) {
    return { nextState: state, extracted: 0, success: false };
  }

  const nextState = cloneGameState(state);
  const isGeologist = crewId === 'daniel';
  const yieldBonus = isGeologist ? 1.3 : 1.0;

  const actualMine = Math.min(deposit.remainingQuantity, Math.round(requestedAmount * yieldBonus));
  const dep = nextState.deposits![depositId];
  dep.remainingQuantity -= actualMine;
  if (dep.remainingQuantity <= 0) {
    dep.depleted = true;
    dep.remainingQuantity = 0;
  }

  // Deduct astronaut stamina
  nextState.crew[crewId].stamina = Math.max(0, crew.stamina - 2);

  // Deposit extracted raw material into inventory
  const r = nextState.resources;
  switch (dep.resourceType) {
    case 'water_ice':
      r.rawIce = (r.rawIce || 0) + actualMine;
      break;
    case 'regolith':
      r.rawRegolith = (r.rawRegolith || 0) + actualMine;
      break;
    case 'iron':
      r.ironOre = (r.ironOre || 0) + actualMine;
      break;
    case 'titanium':
      r.titaniumOre = (r.titaniumOre || 0) + actualMine;
      break;
    case 'aluminum':
      r.aluminumOre = (r.aluminumOre || 0) + actualMine;
      break;
    case 'silicon':
      r.siliconOre = (r.siliconOre || 0) + actualMine;
      break;
    case 'he3':
      r.he3Volatiles = (r.he3Volatiles || 0) + actualMine;
      break;
  }

  // Award science and skill XP
  if (isGeologist) {
    r.science = Math.min(100, r.science + 2);
  }

  // Log to history
  nextState.log.push({
    id: `mine_${dep.id}_${nextState.mission.totalTicks}`,
    day: nextState.mission.day,
    tick: nextState.mission.tick,
    message: `${crew.name} excavated ${actualMine} units from ${dep.name}.`,
    type: 'success',
  });

  return { nextState, extracted: actualMine, success: true };
}

/**
 * Processes and refines raw geological materials into finished colony components.
 */
export function processMaterials(
  state: GameState,
  processType: 'ice_to_water' | 'regolith_to_blocks' | 'ore_to_metal' | 'silicon_to_cells',
  batches = 1
): { nextState: GameState; success: boolean; message: string } {
  const nextState = cloneGameState(state);
  const r = nextState.resources;

  switch (processType) {
    case 'ice_to_water': {
      const iceNeeded = 10 * batches;
      const powerNeeded = 3 * batches;
      if ((r.rawIce || 0) < iceNeeded || r.battery < powerNeeded) {
        return {
          nextState: state,
          success: false,
          message: `Insufficient raw ice (${r.rawIce || 0}/${iceNeeded}) or power (${r.battery.toFixed(0)}/${powerNeeded})`,
        };
      }
      r.rawIce = (r.rawIce || 0) - iceNeeded;
      r.battery -= powerNeeded;
      const waterProduced = 9 * batches;
      r.water = Math.min(100, r.water + waterProduced);
      return {
        nextState,
        success: true,
        message: `Processed ${iceNeeded}kg ice into ${waterProduced}L purified water.`,
      };
    }

    case 'regolith_to_blocks': {
      const regolithNeeded = 25 * batches;
      const powerNeeded = 4 * batches;
      if ((r.rawRegolith || 0) < regolithNeeded || r.battery < powerNeeded) {
        return {
          nextState: state,
          success: false,
          message: `Insufficient regolith (${r.rawRegolith || 0}/${regolithNeeded}) or power`,
        };
      }
      r.rawRegolith = (r.rawRegolith || 0) - regolithNeeded;
      r.battery -= powerNeeded;
      r.sinteredBlocks = (r.sinteredBlocks || 0) + 2 * batches;
      return {
        nextState,
        success: true,
        message: `Sintered ${regolithNeeded}kg regolith into ${2 * batches} structural blocks.`,
      };
    }

    case 'ore_to_metal': {
      const oreNeeded = 15 * batches;
      const powerNeeded = 5 * batches;
      if ((r.ironOre || 0) < oreNeeded || r.battery < powerNeeded) {
        return {
          nextState: state,
          success: false,
          message: `Insufficient iron ore (${r.ironOre || 0}/${oreNeeded}) or power`,
        };
      }
      r.ironOre = (r.ironOre || 0) - oreNeeded;
      r.battery -= powerNeeded;
      r.spareParts += 1 * batches;
      r.metalComponents = (r.metalComponents || 0) + 2 * batches;
      return {
        nextState,
        success: true,
        message: `Refined ${oreNeeded} ore into ${batches} spare parts and ${2 * batches} metal components.`,
      };
    }

    case 'silicon_to_cells': {
      const siliconNeeded = 10 * batches;
      const powerNeeded = 4 * batches;
      if ((r.siliconOre || 0) < siliconNeeded || r.battery < powerNeeded) {
        return {
          nextState: state,
          success: false,
          message: `Insufficient silicon (${r.siliconOre || 0}/${siliconNeeded}) or power`,
        };
      }
      r.siliconOre = (r.siliconOre || 0) - siliconNeeded;
      r.battery -= powerNeeded;
      r.solarCells = (r.solarCells || 0) + 1 * batches;
      return {
        nextState,
        success: true,
        message: `Fabricated ${batches} photovoltaic solar cells from silicon.`,
      };
    }
  }
}
