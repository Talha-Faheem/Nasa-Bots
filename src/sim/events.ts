/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/sim/events.ts
 * Section 9: Scripted spine and seeded random pool with fairness rules.
 */

import { GameState, PendingDecision } from './types.ts';
import { Mulberry32Rng } from './rng.ts';

export function getScriptedDecisionForDay(day: number, state: GameState): PendingDecision | null {
  const eventId = `scripted_day_${day}`;
  if (state.completedEvents.includes(eventId)) {
    return null;
  }

  switch (day) {
    case 3:
      return {
        id: eventId,
        day: 3,
        title: 'Solar Array Fault Detected',
        situation:
          'Micrometeorite dust has scratched one of the solar panel linkages. Array efficiency is dropping.',
        learningPoint:
          'Solar power is life on the Moon. Fixing hardware early prevents compounding battery deficits.',
        sourceBadge: 'Simulated',
        critical: true,
        createdAtTick: state.mission.totalTicks,
        options: [
          {
            id: 'repair_now',
            label: 'Repair Array Immediately',
            description: 'Send engineer Alex Morgan to replace linkage pins.',
            costDescription: 'Costs 4 crew hours, 1 spare part. Restores array condition to 100%.',
            hoursCost: 4,
            powerCost: 0,
            partsCost: 1,
            action: {
              type: 'ASSIGN_TASK',
              crewId: 'alex',
              taskType: 'minor_repair',
              buildingId: 'power_station',
            },
          },
          {
            id: 'defer_repair',
            label: 'Defer Repair for Later',
            description: 'Save spare parts and crew hours for life support maintenance.',
            costDescription: 'Costs 0 hours, 0 parts. Array loses 15 condition immediately.',
            hoursCost: 0,
            powerCost: 0,
            partsCost: 0,
            action: { type: 'DISMISS_DECISION', decisionId: eventId },
          },
        ],
      };

    case 6:
      return {
        id: eventId,
        day: 6,
        title: 'Stage 2 Unlock: Greenhouse & Water Recycler',
        situation:
          'Closed-loop life support modules are online! The water recycler and second greenhouse bed are ready.',
        learningPoint:
          'Recycling air and water is essential for long missions. Food requires power, water and time.',
        sourceBadge: 'Simulated',
        critical: false,
        createdAtTick: state.mission.totalTicks,
        options: [
          {
            id: 'prioritize_food',
            label: 'Start Growing Quick Greens',
            description: 'Plant leafy greens in Bed 2 immediately to supplement rations.',
            costDescription: 'Costs 2 crew hours to plant. Will consume 2 water and 10 power/day.',
            hoursCost: 2,
            powerCost: 0,
            partsCost: 0,
            action: {
              type: 'ASSIGN_TASK',
              crewId: 'sara',
              taskType: 'plant_crop',
              buildingId: 'greenhouse',
              bedId: 'bed2',
              cropType: 'quick_greens',
            },
          },
          {
            id: 'conserve_water',
            label: 'Conserve Power & Water',
            description: 'Keep Bed 2 dormant for now to protect current reserves.',
            costDescription: 'Costs 0 resources. Crew relies on packaged supplies.',
            hoursCost: 0,
            powerCost: 0,
            partsCost: 0,
            action: { type: 'DISMISS_DECISION', decisionId: eventId },
          },
        ],
      };

    case 7:
      return {
        id: eventId,
        day: 7,
        title: 'Greenhouse Power Trade-off',
        situation:
          'Dr. Sara Williams requests additional lighting to boost photosynthetic yield in the greenhouse.',
        learningPoint:
          'High lighting accelerates growth by 25% but uses 15 power per bed daily.',
        sourceBadge: 'Simulated',
        critical: false,
        createdAtTick: state.mission.totalTicks,
        options: [
          {
            id: 'lights_high',
            label: 'Set Lights to High (+25% Growth)',
            description: 'Accelerate crop maturation before the upcoming low-sunlight cycle.',
            costDescription: 'Costs 15 power/day per bed.',
            hoursCost: 0,
            powerCost: 15,
            partsCost: 0,
            action: { type: 'SET_GREENHOUSE_LIGHTS', setting: 'high' },
          },
          {
            id: 'lights_normal',
            label: 'Keep Lights at Normal (Balanced)',
            description: 'Maintain steady 10 power/day consumption.',
            costDescription: 'Standard power consumption.',
            hoursCost: 0,
            powerCost: 0,
            partsCost: 0,
            action: { type: 'SET_GREENHOUSE_LIGHTS', setting: 'normal' },
          },
        ],
      };

    case 12:
      return {
        id: eventId,
        day: 12,
        title: 'SPACE WEATHER ADVISORY: Approaching Solar Event',
        situation:
          'NASA DONKI alert: An X-class solar flare and fast Coronal Mass Ejection (CME) have been detected. High-energy protons will reach the lunar south pole in 12 hours.',
        learningPoint:
          'The Moon has no global magnetic field or atmosphere. Regolith shielding and shelter positioning protect crew cells from ionising radiation.',
        sourceBadge: 'Archived NASA',
        sourceTag: 'NASA DONKI CME-2024-05-10T06:54:00',
        critical: true,
        createdAtTick: state.mission.totalTicks,
        options: [
          {
            id: 'shelter_all',
            label: 'Order All Crew to Underground Shelter',
            description: 'Move all 4 astronauts into the Radiation Shelter (exposure factor 0.15).',
            costDescription: 'Costs 0 parts. Crew must pause surface and lab operations during storm.',
            hoursCost: 0,
            powerCost: 0,
            partsCost: 0,
            action: { type: 'MOVE_CREW', crewId: 'alex', targetBuilding: 'shelter' },
          },
          {
            id: 'build_shield_layer',
            label: 'Build Regolith Shield Layer & Shelter Critical Crew',
            description: 'Deploy regolith bulkheads to permanently increase base protection by +10.',
            costDescription: 'Costs 10 crew hours, 8 power, 1 spare part. Permanent +10 protection.',
            hoursCost: 10,
            powerCost: 8,
            partsCost: 1,
            action: { type: 'BUILD_SHIELD_LAYER' },
          },
          {
            id: 'keep_working',
            label: 'Remain at Station & Continue Operations',
            description: 'Stay in Habitat and Surface modules to maintain experiments.',
            costDescription: 'Higher simulated radiation risk for crew.',
            hoursCost: 0,
            powerCost: 0,
            partsCost: 0,
            action: { type: 'DISMISS_DECISION', decisionId: eventId },
          },
        ],
      };

    case 17:
      return {
        id: eventId,
        day: 17,
        title: 'Recycler Valve Failure During Low Sunlight',
        situation:
          'The base is in the 50% sunlight window (power generation down to 60/day). The water recycler valve has jammed.',
        learningPoint:
          'At 50% sunlight, essential systems + recycler consume all generated power. Every spare part matters.',
        sourceBadge: 'Simulated',
        critical: true,
        createdAtTick: state.mission.totalTicks,
        options: [
          {
            id: 'major_repair_recycler',
            label: 'Perform Emergency Recycler Overhaul',
            description: 'Spend 2 spare parts and 5 battery power to restore 100% recycling efficiency.',
            costDescription: 'Costs 8 crew hours, 5 power, 2 spare parts.',
            hoursCost: 8,
            powerCost: 5,
            partsCost: 2,
            action: {
              type: 'ASSIGN_TASK',
              crewId: 'alex',
              taskType: 'major_repair',
              buildingId: 'recycler',
            },
          },
          {
            id: 'ration_water',
            label: 'Implement Strict Water Rationing',
            description: 'Save spare parts, run recycler at reduced capacity, pause greenhouse.',
            costDescription: 'Costs 0 parts. Daily water drops 6-8 per day until repaired.',
            hoursCost: 0,
            powerCost: 0,
            partsCost: 0,
            action: { type: 'DISMISS_DECISION', decisionId: eventId },
          },
        ],
      };

    case 22:
      return {
        id: eventId,
        day: 22,
        title: 'Volatile Ice Sampling Opportunity',
        situation:
          'Orbital reconnaissance shows a permanently shadowed crater 3 km south containing surface ice volatiles.',
        learningPoint:
          'Sampling missions provide valuable science points, but consume battery reserves and wear rover mechanisms.',
        sourceBadge: 'Simulated',
        critical: false,
        createdAtTick: state.mission.totalTicks,
        options: [
          {
            id: 'dispatch_rover',
            label: 'Dispatch Rover Expedition (Daniel & Alex)',
            description: 'Conduct a 6-hour sampling sortie.',
            costDescription: 'Costs 6h (2 crew), 20 power, -10 rover condition. Rewards +15 (+3 perk) science.',
            hoursCost: 12,
            powerCost: 20,
            partsCost: 0,
            action: { type: 'START_ROVER_TRIP', crew1: 'daniel', crew2: 'alex' },
          },
          {
            id: 'skip_rover',
            label: 'Decline Expedition & Preserve Rover Battery',
            description: 'Keep crew safe inside the habitat and conserve battery reserves.',
            costDescription: '0 cost, 0 science.',
            hoursCost: 0,
            powerCost: 0,
            partsCost: 0,
            action: { type: 'DISMISS_DECISION', decisionId: eventId },
          },
        ],
      };

    case 27:
      return {
        id: eventId,
        day: 27,
        title: 'Final Mission Handover Systems Check',
        situation:
          'The replacement Artemis crew arrives in 3 days. We must decide whether to spend final hours securing base stability or conducting last-minute science.',
        learningPoint:
          'A successful mission requires safe handover conditions: healthy crew and operational life support.',
        sourceBadge: 'Simulated',
        critical: false,
        createdAtTick: state.mission.totalTicks,
        options: [
          {
            id: 'secure_handover',
            label: 'Conduct Comprehensive Systems Inspection',
            description: 'Thoroughly tune solar arrays, life support scrubbers, and recycler.',
            costDescription: 'Costs 8 crew hours. Ensures systems remain fault-free for scoring.',
            hoursCost: 8,
            powerCost: 0,
            partsCost: 0,
            action: {
              type: 'ASSIGN_TASK',
              crewId: 'alex',
              taskType: 'inspect',
              buildingId: 'habitat',
            },
          },
          {
            id: 'last_science_push',
            label: 'Run Final Advanced Laboratory Experiment',
            description: 'Push scientific boundaries for extra mission score.',
            costDescription: 'Costs 4 crew hours, 15 power/day for 3 days. Yields +10 science.',
            hoursCost: 4,
            powerCost: 15,
            partsCost: 0,
            action: { type: 'START_EXPERIMENT', crewId: 'daniel' },
          },
        ],
      };

    default:
      return null;
  }
}

export function tryTriggerRandomEvent(
  state: GameState,
  rng: Mulberry32Rng
): { decision: PendingDecision | null; stateModifier?: (s: GameState) => void } {
  // Fairness rule: at most one random negative event per 3 days (72 ticks)
  if (state.randomEventCooldown > 0) {
    return { decision: null };
  }

  // Check random probability per day (e.g. 25% chance on check)
  const roll = rng.next();
  if (roll > 0.3) {
    return { decision: null };
  }

  const pool = [
    'dust_on_panels',
    'greenhouse_pump_slowdown',
    'small_air_leak',
    'comms_noise',
    'rover_steering_wear',
  ];

  const selected = rng.pick(pool);
  const eventId = `random_${selected}_tick_${state.mission.totalTicks}`;

  switch (selected) {
    case 'dust_on_panels':
      return {
        decision: {
          id: eventId,
          day: state.mission.day,
          title: 'Solar Panels Regolith Dust Coat',
          situation:
            'A low-angle electrostatic dust fountain has coated the solar array in fine lunar dust.',
          learningPoint:
            'Electrostatic dust levitation on the Moon reduces photovoltaic absorption until swept or shaken off.',
          sourceBadge: 'Simulated',
          critical: false,
          createdAtTick: state.mission.totalTicks,
          options: [
            {
              id: 'dust_sweep',
              label: 'Clean Solar Panels',
              description: 'Assign astronaut to dust sweep the arrays.',
              costDescription: 'Costs 4 crew hours. Restores full panel absorption.',
              hoursCost: 4,
              powerCost: 0,
              partsCost: 0,
              action: {
                type: 'ASSIGN_TASK',
                crewId: 'alex',
                taskType: 'minor_repair',
                buildingId: 'power_station',
              },
            },
            {
              id: 'dust_ignore',
              label: 'Leave Dust (Accept -15 Condition)',
              description: 'Accept reduced power generation to conserve crew work hours.',
              costDescription: 'Solar array loses 15 condition.',
              hoursCost: 0,
              powerCost: 0,
              partsCost: 0,
              action: { type: 'DISMISS_DECISION', decisionId: eventId },
            },
          ],
        },
        stateModifier: (s) => {
          s.systems.solarArray.condition = Math.max(0, s.systems.solarArray.condition - 15);
        },
      };

    case 'small_air_leak':
      return {
        decision: {
          id: eventId,
          day: state.mission.day,
          title: 'Minor Airlock Seal Micro-Leak',
          situation:
            'Thermal expansion cycle has caused a micro-fissure around the primary airlock gasket.',
          learningPoint:
            'Extreme temperature fluctuations (-130°C to +120°C) strain elastomeric seals in vacuum.',
          sourceBadge: 'Simulated',
          critical: true,
          createdAtTick: state.mission.totalTicks,
          options: [
            {
              id: 'seal_leak',
              label: 'Reseal Gasket Immediately',
              description: 'Apply epoxy sealant to restore airtight seal.',
              costDescription: 'Costs 2 crew hours, 1 spare part. Stops oxygen loss.',
              hoursCost: 2,
              powerCost: 0,
              partsCost: 1,
              action: {
                type: 'ASSIGN_TASK',
                crewId: 'alex',
                taskType: 'minor_repair',
                buildingId: 'habitat',
              },
            },
            {
              id: 'ignore_leak',
              label: 'Vent Loss (-5 Oxygen)',
              description: 'Save spare part and accept 5 points of oxygen loss.',
              costDescription: 'Loses 5 oxygen reserve.',
              hoursCost: 0,
              powerCost: 0,
              partsCost: 0,
              action: { type: 'DISMISS_DECISION', decisionId: eventId },
            },
          ],
        },
        stateModifier: (s) => {
          s.resources.oxygen = Math.max(0, s.resources.oxygen - 5);
        },
      };

    case 'greenhouse_pump_slowdown':
      return {
        decision: {
          id: eventId,
          day: state.mission.day,
          title: 'Hydroponic Nutrient Pump Cavitation',
          situation:
            'Microgravity nutrient solution pump has formed vapor bubbles, slowing nutrient delivery.',
          learningPoint:
            'Hydroponic root misting systems require constant fluid pressure to prevent root desiccation.',
          sourceBadge: 'Simulated',
          critical: false,
          createdAtTick: state.mission.totalTicks,
          options: [
            {
              id: 'purge_pump',
              label: 'Purge & Recalibrate Pump',
              description: 'Inspect and bleed vapor bubbles from pump lines.',
              costDescription: 'Costs 2 crew hours.',
              hoursCost: 2,
              powerCost: 0,
              partsCost: 0,
              action: {
                type: 'ASSIGN_TASK',
                crewId: 'sara',
                taskType: 'inspect',
                buildingId: 'greenhouse',
              },
            },
            {
              id: 'ignore_pump',
              label: 'Run at Reduced Flow',
              description: 'Accept slower crop growth today.',
              costDescription: 'Greenhouse condition drops by 10.',
              hoursCost: 0,
              powerCost: 0,
              partsCost: 0,
              action: { type: 'DISMISS_DECISION', decisionId: eventId },
            },
          ],
        },
        stateModifier: (s) => {
          s.systems.greenhouse.condition = Math.max(0, s.systems.greenhouse.condition - 10);
        },
      };

    default:
      return { decision: null };
  }
}
