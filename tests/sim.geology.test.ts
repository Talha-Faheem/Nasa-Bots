import { describe, it, expect } from 'vitest';
import { createInitialState, SimulationEngine } from '../src/sim/engine.ts';
import { createInitialDeposits, scanDeposit, mineDeposit, processMaterials } from '../src/sim/rules/geology.ts';

describe('Lunar Geology & In-Situ Resource Extraction Simulation', () => {
  it('creates 7 geological deposits across distinct lunar terrain zones', () => {
    const deposits = createInitialDeposits();
    const keys = Object.keys(deposits);
    expect(keys.length).toBe(7);

    // Verify key deposits exist
    expect(deposits.dep_water_ice).toBeDefined();
    expect(deposits.dep_water_ice.resourceType).toBe('water_ice');
    expect(deposits.dep_water_ice.zone).toBe('Water Ice Deposit Zone');
    expect(deposits.dep_water_ice.remainingQuantity).toBe(450);
    expect(deposits.dep_water_ice.elevation).toBeDefined();

    expect(deposits.dep_regolith_alpha).toBeDefined();
    expect(deposits.dep_regolith_alpha.scanned).toBe(true);

    expect(deposits.dep_iron_ridge).toBeDefined();
    expect(deposits.dep_iron_ridge.resourceType).toBe('iron');

    expect(deposits.dep_he3_deep).toBeDefined();
    expect(deposits.dep_he3_deep.resourceType).toBe('he3');
    expect(deposits.dep_he3_deep.difficulty).toBe('extreme');
  });

  it('scans deposits with geologist Daniel Vance earning higher science yields', () => {
    const deposits = createInitialDeposits();
    const iceDep = deposits.dep_water_ice;

    const danielCrew = {
      id: 'daniel' as const,
      name: 'Daniel Vance',
      role: 'Geologist / EVA Specialist',
      health: 100,
      stamina: 8,
      radiation: 0,
      location: 'surface' as const,
      isInjured: false,
      skillLevel: 5,
    };

    const alexCrew = {
      id: 'alex' as const,
      name: 'Alex Morgan',
      role: 'Chief Engineer',
      health: 100,
      stamina: 8,
      radiation: 0,
      location: 'surface' as const,
      isInjured: false,
      skillLevel: 3,
    };

    const danielScan = scanDeposit(iceDep, danielCrew as any);
    expect(danielScan.scannedDeposit.scanned).toBe(true);
    expect(danielScan.scienceGained).toBe(6); // Geologist bonus

    const alexScan = scanDeposit(iceDep, alexCrew as any);
    expect(alexScan.scienceGained).toBe(3); // Non-specialist standard yield
  });

  it('mines raw resources with finite depletion and crew stamina deduction', () => {
    const state = createInitialState(42, 'commander');
    expect(state.deposits?.dep_water_ice).toBeDefined();

    const initialIceDeposit = state.deposits!.dep_water_ice.remainingQuantity;
    const initialDanielStamina = state.crew.daniel.stamina;

    // Daniel mines water ice
    const res = mineDeposit(state, 'dep_water_ice', 'daniel', 20);
    expect(res.success).toBe(true);
    expect(res.extracted).toBeGreaterThan(0);
    expect(res.nextState.resources.rawIce).toBe(res.extracted);
    expect(res.nextState.deposits!.dep_water_ice.remainingQuantity).toBe(initialIceDeposit - res.extracted);
    expect(res.nextState.crew.daniel.stamina).toBe(initialDanielStamina - 2);

    // Daniel Vance gets geologist extraction yield bonus (1.3x)
    expect(res.extracted).toBe(Math.round(20 * 1.3));
  });

  it('handles deposit depletion correctly', () => {
    const state = createInitialState(42, 'commander');
    state.deposits!.dep_he3_deep.remainingQuantity = 10;

    const res = mineDeposit(state, 'dep_he3_deep', 'daniel', 50);
    expect(res.success).toBe(true);
    expect(res.extracted).toBe(10); // Limited to remaining amount
    expect(res.nextState.deposits!.dep_he3_deep.remainingQuantity).toBe(0);
    expect(res.nextState.deposits!.dep_he3_deep.depleted).toBe(true);

    // Mining again should fail gracefully
    const failRes = mineDeposit(res.nextState, 'dep_he3_deep', 'daniel', 20);
    expect(failRes.success).toBe(false);
    expect(failRes.extracted).toBe(0);
  });

  it('processes raw materials into finished colony components', () => {
    const state = createInitialState(42, 'commander');
    state.resources.rawIce = 30;
    state.resources.rawRegolith = 60;
    state.resources.ironOre = 35;
    state.resources.siliconOre = 25;
    state.resources.battery = 50;

    const initialWater = state.resources.water;
    const initialParts = state.resources.spareParts;
    const initialBlocks = state.resources.sinteredBlocks || 0;
    const initialComponents = state.resources.metalComponents || 0;
    const initialCells = state.resources.solarCells || 0;

    // 1. Ice to water: 10kg ice -> 9L water (3 power)
    const iceRes = processMaterials(state, 'ice_to_water', 2); // 20kg ice -> 18L water
    expect(iceRes.success).toBe(true);
    expect(iceRes.nextState.resources.rawIce).toBe(10);
    expect(iceRes.nextState.resources.water).toBe(initialWater + 18);
    expect(iceRes.nextState.resources.battery).toBe(50 - 6);

    // 2. Regolith to sintered blocks: 25kg -> 2 blocks (4 power)
    const regRes = processMaterials(state, 'regolith_to_blocks', 1);
    expect(regRes.success).toBe(true);
    expect(regRes.nextState.resources.rawRegolith).toBe(35);
    expect(regRes.nextState.resources.sinteredBlocks).toBe(initialBlocks + 2);

    // 3. Ore to metal: 15kg ore -> 1 spare part + 2 metal components (5 power)
    const oreRes = processMaterials(state, 'ore_to_metal', 2);
    expect(oreRes.success).toBe(true);
    expect(oreRes.nextState.resources.ironOre).toBe(5);
    expect(oreRes.nextState.resources.spareParts).toBe(initialParts + 2);
    expect(oreRes.nextState.resources.metalComponents).toBe(initialComponents + 4);

    // 4. Silicon to solar cells: 10kg silicon -> 1 solar cell (4 power)
    const cellRes = processMaterials(state, 'silicon_to_cells', 1);
    expect(cellRes.success).toBe(true);
    expect(cellRes.nextState.resources.siliconOre).toBe(15);
    expect(cellRes.nextState.resources.solarCells).toBe(initialCells + 1);
  });

  it('dispatches SCAN_DEPOSIT, MINE_DEPOSIT, and PROCESS_MATERIAL through engine', () => {
    const engine = new SimulationEngine(999);
    let state = createInitialState(999, 'commander');

    // 1. Dispatch SCAN_DEPOSIT
    state = engine.dispatch(state, {
      type: 'SCAN_DEPOSIT',
      crewId: 'daniel',
      depositId: 'dep_water_ice',
    });
    expect(state.deposits?.dep_water_ice.scanned).toBe(true);
    expect(state.resources.science).toBeGreaterThan(0);

    // 2. Dispatch MINE_DEPOSIT
    state = engine.dispatch(state, {
      type: 'MINE_DEPOSIT',
      crewId: 'daniel',
      depositId: 'dep_water_ice',
      amount: 25,
    });
    expect(state.resources.rawIce).toBeGreaterThan(0);

    // 3. Dispatch PROCESS_MATERIAL
    const prevWater = state.resources.water;
    state = engine.dispatch(state, {
      type: 'PROCESS_MATERIAL',
      processType: 'ice_to_water',
      batches: 1,
    });
    expect(state.resources.water).toBe(prevWater + 9);
  });
});
