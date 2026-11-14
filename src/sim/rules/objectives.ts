/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/sim/rules/objectives.ts
 * Mission objectives and achievement definitions.
 * Pure TypeScript. No React, Three, or DOM imports.
 */

import { Achievement, MissionObjective } from '../types.ts';

export function createInitialObjectives(): MissionObjective[] {
  return [
    {
      id: 'obj_survive',
      title: 'Survive 30 Mission Days',
      description: 'Keep the outpost operational and maintain life support until the Day 30 relief crew arrives.',
      category: 'primary',
      progress: 1,
      target: 30,
      unit: 'days',
      isCompleted: false,
      rewardDescription: 'Primary mission success criterion.',
    },
    {
      id: 'obj_crew_alive',
      title: 'Zero Crew Casualties',
      description: 'Protect all four astronauts from life-support failures, exhaustion, and radiation hazards.',
      category: 'primary',
      progress: 4,
      target: 4,
      unit: 'astronauts',
      isCompleted: false,
      rewardDescription: 'Required for Silver or Gold Commander badge.',
    },
    {
      id: 'obj_research',
      title: 'Complete 3 Science Investigations',
      description: 'Conduct deep-space research at the Laboratory into regolith, volatiles, and closed-loop systems.',
      category: 'secondary',
      progress: 0,
      target: 3,
      unit: 'studies',
      isCompleted: false,
      rewardDescription: '+50 Mission Science Score.',
    },
    {
      id: 'obj_crops',
      title: 'Harvest 24 Fresh Food Rations',
      description: 'Cultivate and harvest hydroponic crops (Quick Greens, Tomatoes, Potatoes) in the greenhouse.',
      category: 'secondary',
      progress: 0,
      target: 24,
      unit: 'rations',
      isCompleted: false,
      rewardDescription: '+30 Food Security Score.',
    },
    {
      id: 'obj_rover',
      title: 'Execute 2 Rover Surface Expeditions',
      description: 'Deploy the lunar rover to craters, peaks, or historic sites to collect geological samples.',
      category: 'secondary',
      progress: 0,
      target: 2,
      unit: 'expeditions',
      isCompleted: false,
      rewardDescription: '+40 Exploration Science Score.',
    },
    {
      id: 'obj_shield',
      title: 'Build Maximum Regolith Shielding',
      description: 'Construct 3 layers of sintered lunar soil over the Radiation Shelter for maximum solar flare protection.',
      category: 'bonus',
      progress: 0,
      target: 3,
      unit: 'layers',
      isCompleted: false,
      rewardDescription: '+50 Radiation Preparedness Score.',
    },
    {
      id: 'obj_power_conservation',
      title: 'Survive Lunar Night Power Dip',
      description: 'Maintain battery storage above 20% throughout the critical Days 16–22 sunlight reduction.',
      category: 'bonus',
      progress: 0,
      target: 7,
      unit: 'days',
      isCompleted: false,
      rewardDescription: '+30 Power Management Score.',
    },
  ];
}

export function createInitialAchievements(): Achievement[] {
  return [
    {
      id: 'first_harvest',
      title: 'First Lunar Harvest',
      description: 'Successfully harvested fresh crops grown inside the Hydroponic Greenhouse.',
      icon: '🌱',
      unlocked: false,
    },
    {
      id: 'master_mechanic',
      title: 'Fast Mechanic',
      description: 'Completed a building repair utilizing Alex Morgan’s specialized engineering perk.',
      icon: '🛠️',
      unlocked: false,
    },
    {
      id: 'lunar_rover',
      title: 'Cold-Trap Explorer',
      description: 'Dispatched the lunar rover to a permanently shadowed south polar crater.',
      icon: '🚜',
      unlocked: false,
    },
    {
      id: 'science_breakthrough',
      title: 'Scientific Discovery',
      description: 'Completed a scientific research investigation inside the Science Laboratory.',
      icon: '🔬',
      unlocked: false,
    },
    {
      id: 'solar_fortress',
      title: 'Regolith Bastion',
      description: 'Constructed sintered regolith radiation shielding over the habitat.',
      icon: '☢️',
      unlocked: false,
    },
    {
      id: 'gold_commander',
      title: 'Gold Commander Badge',
      description: 'Achieved the prestigious Gold Commander score rating upon completing 30 days.',
      icon: '🏆',
      unlocked: false,
    },
    {
      id: 'space_botanist',
      title: 'Green Thumb Bonus',
      description: 'Harvested crops with Dr. Sara Williams to earn the +10% yield bonus.',
      icon: '🍅',
      unlocked: false,
    },
    {
      id: 'perfect_health',
      title: 'Expedition in Peak Health',
      description: 'Kept all four crew members above 75 HP through day 15.',
      icon: '❤️',
      unlocked: false,
    },
  ];
}

