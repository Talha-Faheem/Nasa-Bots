/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/sim/rules/food.ts
 * Section 8: Food consumption, crops, greenhouse growth and harvesting.
 */

import { CropDefinition, CropType, CropBedState, GreenhouseLightSetting } from '../types.ts';

export const CROP_DEFINITIONS: Record<CropType, CropDefinition> = {
  quick_greens: {
    id: 'quick_greens',
    name: 'Quick Greens',
    growthDays: 8,
    yield: 12,
    waterPerDay: 2,
    description: 'Fast-growing leafy greens, reliable and resilient.',
  },
  dwarf_tomatoes: {
    id: 'dwarf_tomatoes',
    name: 'Dwarf Tomatoes',
    growthDays: 11,
    yield: 18,
    waterPerDay: 2,
    description: 'Nutrient-rich compact tomatoes for balanced diet.',
  },
  potatoes: {
    id: 'potatoes',
    name: 'Potatoes',
    growthDays: 14,
    yield: 30,
    waterPerDay: 2,
    description: 'Calorie-dense staple crop, takes longer to mature.',
  },
};

export function getGrowthMultiplier(lightSetting: GreenhouseLightSetting): number {
  switch (lightSetting) {
    case 'low':
      return 0.6;
    case 'high':
      return 1.25;
    case 'normal':
    default:
      return 1.0;
  }
}

export function updateCropBedDay(
  bed: CropBedState,
  isPowered: boolean,
  waterAvailable: boolean,
  lightSetting: GreenhouseLightSetting
): {
  updatedBed: CropBedState;
  lostCrop: boolean;
} {
  if (!bed.unlocked || !bed.cropType || bed.stage !== 'growing') {
    return { updatedBed: { ...bed, tendedToday: false }, lostCrop: false };
  }

  const def = CROP_DEFINITIONS[bed.cropType];
  const conditionsMet = isPowered && waterAvailable && bed.tendedToday;

  if (!conditionsMet) {
    const newMissed = bed.daysMissed + 1;
    if (newMissed >= 3) {
      // 3 missed days lose the crop
      return {
        updatedBed: {
          ...bed,
          cropType: null,
          daysPlanted: 0,
          daysMissed: 0,
          stage: 'empty',
          tendedToday: false,
        },
        lostCrop: true,
      };
    }
    return {
      updatedBed: {
        ...bed,
        daysMissed: newMissed,
        tendedToday: false,
      },
      lostCrop: false,
    };
  }

  // Conditions met! Progress growth
  const multiplier = getGrowthMultiplier(lightSetting);
  const newDays = bed.daysPlanted + 1 * multiplier;

  const isReady = newDays >= def.growthDays;

  return {
    updatedBed: {
      ...bed,
      daysPlanted: newDays,
      stage: isReady ? 'ready' : 'growing',
      tendedToday: false, // Reset for next day
    },
    lostCrop: false,
  };
}

export function calculateFoodTick(
  currentFood: number
): {
  newFood: number;
  consumptionPerTick: number;
  isRed: boolean;
  isYellow: boolean;
} {
  // Crew eats 3.5 food per day = 3.5 / 24 per tick = ~0.1458
  const consumptionPerTick = 3.5 / 24;
  const newFood = Math.max(0, Math.min(100, currentFood - consumptionPerTick));

  const isRed = newFood < 15;
  const isYellow = newFood < 35 && !isRed;

  return {
    newFood,
    consumptionPerTick,
    isRed,
    isYellow,
  };
}

