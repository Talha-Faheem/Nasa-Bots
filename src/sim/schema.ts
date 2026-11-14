/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/sim/schema.ts
 * Runtime Zod schema validation for data configs and save states.
 * Enforces strict typing, bounds, and versioning.
 */

import { z } from 'zod';

export const FoodBalanceSchema = z.object({
  consumptionPerAstronautPerDay: z.number().positive(),
  startingStock: z.number().nonnegative(),
  storageCapacity: z.number().positive(),
  greenhouseBatchDays: z.number().positive(),
  greenhouseYieldRations: z.number().positive(),
  greenhouseWaterCostPerDay: z.number().positive(),
  greenhousePowerCostKW: z.number().positive(),
});

export const WaterBalanceSchema = z.object({
  consumptionPerAstronautPerDay: z.number().positive(),
  startingStock: z.number().nonnegative(),
  storageCapacity: z.number().positive(),
  recyclerRecoveryRate: z.number().min(0).max(1),
  recyclerPowerCostKW: z.number().positive(),
});

export const OxygenBalanceSchema = z.object({
  consumptionPerAstronautPerDay: z.number().positive(),
  startingStock: z.number().nonnegative(),
  storageCapacity: z.number().positive(),
  generatorProductionPerDay: z.number().positive(),
  generatorWaterInputRatio: z.number().positive(),
  generatorPowerCostKW: z.number().positive(),
});

export const PowerDrawSchema = z.object({
  lifeSupportKW: z.number().nonnegative(),
  habitatKW: z.number().nonnegative(),
  greenhouseKW: z.number().nonnegative(),
  labKW: z.number().nonnegative(),
  commsKW: z.number().nonnegative(),
  recyclerKW: z.number().nonnegative(),
  oxygenGeneratorKW: z.number().nonnegative(),
});

export const PowerBalanceSchema = z.object({
  solarGenerationPeakKW: z.number().positive(),
  batteryCapacityKWh: z.number().positive(),
  startingBatteryKWh: z.number().nonnegative(),
  basePowerDraw: PowerDrawSchema,
});

export const DifficultyModifierSchema = z.object({
  suppliesMultiplier: z.number().positive(),
  consumptionMultiplier: z.number().positive(),
  eventFrequencyMultiplier: z.number().positive(),
  startingParts: z.number().int().nonnegative(),
});

export const BalanceConfigSchema = z.object({
  version: z.string(),
  difficulty: z.enum(['explorer', 'survival', 'expert']),
  food: FoodBalanceSchema,
  water: WaterBalanceSchema,
  oxygen: OxygenBalanceSchema,
  power: PowerBalanceSchema,
  spareParts: z.object({
    startingStock: z.number().int().nonnegative(),
    storageCapacity: z.number().int().positive(),
  }),
  difficultyModifiers: z.object({
    explorer: DifficultyModifierSchema,
    survival: DifficultyModifierSchema,
    expert: DifficultyModifierSchema,
  }),
  crew: z.object({
    vitals: z.object({
      healthMax: z.literal(100),
      staminaMax: z.literal(100),
      moraleMax: z.literal(100),
    }),
    efficiencyFormula: z.object({
      baseSpeed: z.number().positive(),
      skillMultiplier: z.number().positive(),
    }),
  }),
});

export type BalanceConfig = z.infer<typeof BalanceConfigSchema>;

/**
 * Validates any JSON balance object against BalanceConfigSchema.
 * Throws a descriptive ZodError if invalid.
 */
export function validateBalanceConfig(data: unknown): BalanceConfig {
  return BalanceConfigSchema.parse(data);
}

/**
 * Schema for Save/Load state with migration versioning.
 */
export const SaveStateHeaderSchema = z.object({
  schemaVersion: z.number().int().positive(),
  saveTimestamp: z.number().int().positive(),
  slotId: z.string(),
  missionDay: z.number().int().min(1).max(30),
  seed: z.number().int(),
  difficulty: z.enum(['cadet', 'explorer', 'commander', 'survival', 'expert', 'veteran']),
  crewAlive: z.number().int().min(0).max(4),
});

export type SaveStateHeader = z.infer<typeof SaveStateHeaderSchema>;
