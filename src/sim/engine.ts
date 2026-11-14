/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/sim/engine.ts
 * Pure TypeScript tick engine (Section 5, 7-10).
 * Rule 1: Fixed 24 ticks = 1 mission day.
 * Rule 2: Deterministic seeded RNG (mulberry32). No Date.now or Math.random.
 * Rule 3: No Phaser, React, or DOM imports.
 */

import {
  GameState,
  Command,
  Difficulty,
  SiteConfig,
  BuildingId,
  CrewId,
  ActiveCrewTask,
  ConstructionProjectId,
} from './types.ts';
import { Mulberry32Rng } from './rng.ts';
import { INITIAL_CREW, calculateTravelTicks, calculateDailyHealthDelta } from './rules/crew.ts';
import { calculatePowerTick } from './rules/power.ts';
import { calculateLifeSupportTick } from './rules/life.ts';
import { calculateWaterTick } from './rules/water.ts';
import { calculateFoodTick, updateCropBedDay, CROP_DEFINITIONS } from './rules/food.ts';
import {
  getPositionFactor,
  calculateEventExposure,
  calculateBaselineSurfaceExposurePerTick,
  checkExposureThresholds,
} from './rules/radiation.ts';
import { getScriptedDecisionForDay, tryTriggerRandomEvent } from './events.ts';
import { calculateScore, determineEnding } from './scoring.ts';
import { BUILDING_UPGRADES } from './rules/upgrades.ts';
import { RESEARCH_PROJECTS } from './rules/research.ts';
import { ROVER_DESTINATIONS } from './rules/rover.ts';
import { CONSTRUCTION_PROJECTS } from './rules/construction.ts';
import { createInitialObjectives, createInitialAchievements } from './rules/objectives.ts';

export function createInitialState(
  seed: number,
  difficulty: Difficulty = 'commander',
  siteConfig?: SiteConfig
): GameState {
  const spareParts =
    difficulty === 'cadet' ? 8 : difficulty === 'expert' || difficulty === 'veteran' ? 4 : 6;

  const startBattery = difficulty === 'cadet' ? 95 : 85;
  const startOxygen = difficulty === 'cadet' ? 95 : 90;
  const startWater = difficulty === 'cadet' ? 90 : 80;
  const startFood = difficulty === 'cadet' ? 85 : 75;

  const crew = JSON.parse(JSON.stringify(INITIAL_CREW)) as typeof INITIAL_CREW;

  const state: GameState = {
    mission: {
      day: 1,
      tick: 0,
      totalTicks: 0,
      speed: 1,
      isPaused: false,
      seed,
      difficulty,
      siteId: siteConfig?.id ?? 'moon',
      stage: 1,
      status: 'in_progress',
    },
    resources: {
      battery: startBattery,
      oxygen: startOxygen,
      water: startWater,
      food: startFood,
      shieldProtection: 60,
      shieldLayersBuilt: 0,
      spareParts,
      science: 0,
    },
    systems: {
      solarArray: { condition: 100, isFaulted: false, name: 'Solar Array' },
      lifeSupport: { condition: 100, isFaulted: false, name: 'Life Support' },
      recycler: { condition: 100, isFaulted: false, name: 'Water Recycler' },
      greenhouse: { condition: 100, isFaulted: false, name: 'Greenhouse' },
      comms: { condition: 100, isFaulted: false, name: 'Communications' },
    },
    greenhouseBeds: {
      bed1: {
        id: 'bed1',
        unlocked: true,
        cropType: null,
        daysPlanted: 0,
        daysMissed: 0,
        stage: 'empty',
        tendedToday: false,
      },
      bed2: {
        id: 'bed2',
        unlocked: false, // Unlocks Day 6
        cropType: null,
        daysPlanted: 0,
        daysMissed: 0,
        stage: 'empty',
        tendedToday: false,
      },
    },
    greenhouseLightSetting: 'normal',
    rover: {
      condition: 100,
      isFaulted: false,
      name: 'Exploration Rover',
      isAway: false,
      crewOnBoard: [],
      batteryCharge: 100,
      samplesCollected: 0,
    },
    lab: {
      activeExperiment: false,
      experimentDaysLeft: 0,
      condition: 100,
      completedProjects: [],
      progressTicks: 0,
      totalTicksNeeded: 0,
    },
    crew,
    powerPriority: ['essential', 'recycler', 'greenhouse', 'laboratory', 'rover_upgrades'],
    powerBreakdown: {
      sunlightFactor: 1.0,
      generationPerDay: 120,
      generationPerTick: 5,
      essentialDemandPerDay: 45,
      recyclerDemandPerDay: 15,
      greenhouseDemandPerDay: 0,
      labDemandPerDay: 0,
      totalDemandPerDay: 60,
      servedDemandPerTick: 2.5,
      batteryDeltaPerTick: 2.5,
      shedSystems: [],
    },
    radiationAdvisory: null,
    pendingDecisions: [],
    completedEvents: [],
    randomEventCooldown: 48, // Initial grace period
    stats: {
      daysOxygenNotRed: 0,
      daysBatteryAbove20: 0,
      emergenciesCount: 0,
      consecutiveOxygenZeroTicks: 0,
      maxConsecutiveOxygenZeroTicks: 0,
      protectionBeforeAdvisory: 60,
      experimentsCompleted: 0,
      samplesCollected: 0,
      advisoriesSurvived: 0,
      decisionsMade: [],
    },
    upgrades: {
      solar_cells: false,
      dust_coating: false,
      thermal_insulation: false,
      emergency_o2: false,
      nanofilter: false,
      crop_led: false,
      spectrometer: false,
      high_gain_antenna: false,
      regolith_shield: false,
    },
    construction: {
      aux_battery_bank: { built: false, inProgress: false, progressTicks: 0 },
      secondary_water_tank: { built: false, inProgress: false, progressTicks: 0 },
      emergency_o2_cell: { built: false, inProgress: false, progressTicks: 0 },
      surface_sensor_array: { built: false, inProgress: false, progressTicks: 0 },
    },
    objectives: createInitialObjectives(),
    achievements: createInitialAchievements(),
    commandLog: [],
    log: [
      {
        id: 'init_1',
        day: 1,
        tick: 0,
        message: 'Lunar Frontier outpost activated at Lunar South Pole. Mission Day 1 commenced.',
        type: 'info',
      },
    ],
  };

  return state;
}

export class SimulationEngine {
  private rng: Mulberry32Rng;
  private siteConfig?: SiteConfig;

  constructor(seed: number, siteConfig?: SiteConfig) {
    this.rng = new Mulberry32Rng(seed);
    this.siteConfig = siteConfig;
  }

  getRng(): Mulberry32Rng {
    return this.rng;
  }

  /**
   * Executes a command on the game state deterministically.
   */
  dispatch(state: GameState, command: Command): GameState {
    const nextState = JSON.parse(JSON.stringify(state)) as GameState;
    if (!nextState.commandLog) {
      nextState.commandLog = [];
    }
    nextState.commandLog.push({
      tick: nextState.mission.tick,
      day: nextState.mission.day,
      command,
    });

    switch (command.type) {
      case 'SET_SPEED':
        nextState.mission.speed = command.speed;
        nextState.mission.isPaused = command.speed === 0;
        break;

      case 'PAUSE':
        nextState.mission.isPaused = true;
        break;

      case 'RESUME':
        nextState.mission.isPaused = false;
        if (nextState.mission.speed === 0) {
          nextState.mission.speed = 1;
        }
        break;

      case 'MOVE_CREW': {
        const member = nextState.crew[command.crewId];
        if (member && member.location !== command.targetBuilding) {
          const travelTicks = calculateTravelTicks(
            member.location === 'transit' || member.location === 'surface'
              ? 'habitat'
              : member.location,
            command.targetBuilding
          );
          member.location = 'transit';
          member.targetBuilding = command.targetBuilding;
          member.travelTicksRemaining = travelTicks;
          // Cancel active task if moving away
          if (member.currentTask && member.currentTask.buildingId !== command.targetBuilding) {
            member.currentTask = undefined;
          }
        }
        break;
      }

      case 'ASSIGN_TASK': {
        const member = nextState.crew[command.crewId];
        if (!member) break;

        // Check if member needs to travel to building
        const travelTicks =
          member.location === command.buildingId
            ? 0
            : calculateTravelTicks(
                member.location === 'transit' || member.location === 'surface'
                  ? 'habitat'
                  : member.location,
                command.buildingId
              );

        // Calculate task hours
        let hours = 2;
        if (command.taskType === 'minor_repair') hours = command.crewId === 'alex' ? 3 : 4;
        if (command.taskType === 'major_repair') hours = command.crewId === 'alex' ? 7 : 8;
        if (command.taskType === 'plant_crop') hours = 2;
        if (command.taskType === 'tend_crop') hours = 1;
        if (command.taskType === 'harvest_crop') hours = 2;
        if (command.taskType === 'run_experiment') hours = 4;
        if (command.taskType === 'inspect') hours = 2;

        // Convert task hours to ticks: 1 hour = 1 tick (since 24h = 24 ticks!)
        const totalTicks = travelTicks + hours;

        if (travelTicks > 0) {
          member.location = 'transit';
          member.targetBuilding = command.buildingId;
          member.travelTicksRemaining = travelTicks;
        }

        member.currentTask = {
          type: command.taskType,
          buildingId: command.buildingId,
          ticksRemaining: totalTicks,
          totalTicks,
          targetBed: command.bedId,
          cropType: command.cropType,
        };

        // Deduct stamina (can go negative if forced to work past stamina)
        member.stamina -= hours;
        if (member.stamina < 0) {
          member.skippedRestOrExercise = true;
        }

        // Deduct parts if repair
        if (command.taskType === 'minor_repair') {
          nextState.resources.spareParts = Math.max(0, nextState.resources.spareParts - 1);
        } else if (command.taskType === 'major_repair') {
          nextState.resources.spareParts = Math.max(0, nextState.resources.spareParts - 2);
          nextState.resources.battery = Math.max(0, nextState.resources.battery - 5);
        }
        break;
      }

      case 'CANCEL_TASK': {
        const member = nextState.crew[command.crewId];
        if (member) {
          member.currentTask = undefined;
        }
        break;
      }

      case 'SET_POWER_PRIORITY':
        nextState.powerPriority = [...command.priority];
        break;

      case 'SET_GREENHOUSE_LIGHTS':
        nextState.greenhouseLightSetting = command.setting;
        break;

      case 'BUILD_SHIELD_LAYER': {
        // Costs: 10 crew hours, 8 power, 1 part -> protection +10 (max 3 layers)
        if (
          nextState.resources.shieldLayersBuilt < 3 &&
          nextState.resources.spareParts >= 1 &&
          nextState.resources.battery >= 8
        ) {
          nextState.resources.spareParts -= 1;
          nextState.resources.battery -= 8;
          nextState.resources.shieldLayersBuilt += 1;
          nextState.resources.shieldProtection = Math.min(
            90,
            nextState.resources.shieldProtection + 10
          );

          // Find crew member with available stamina or assign Alex
          const builder = nextState.crew.alex;
          builder.stamina -= 10;
          if (builder.stamina < 0) {
            builder.skippedRestOrExercise = true;
          }

          nextState.log.push({
            id: `shield_${nextState.mission.totalTicks}`,
            day: nextState.mission.day,
            tick: nextState.mission.tick,
            message: `Regolith shield layer ${nextState.resources.shieldLayersBuilt}/3 constructed. Base protection is now ${nextState.resources.shieldProtection}.`,
            type: 'success',
          });
        }
        break;
      }

      case 'START_ROVER_TRIP': {
        // Costs: 6h (2 crew), 20 power, rover wear -10 -> +15 science (+3 Daniel perk)
        if (
          !nextState.rover.isAway &&
          nextState.rover.condition > 0 &&
          nextState.resources.battery >= 20
        ) {
          nextState.resources.battery -= 20;
          nextState.rover.isAway = true;
          nextState.rover.returnTick = nextState.mission.totalTicks + 6; // 6 hours = 6 ticks
          nextState.rover.crewOnBoard = [command.crew1, command.crew2];
          nextState.rover.condition = Math.max(0, nextState.rover.condition - 10);

          const c1 = nextState.crew[command.crew1];
          const c2 = nextState.crew[command.crew2];
          c1.location = 'surface';
          c2.location = 'surface';
          c1.stamina -= 6;
          c2.stamina -= 6;
          if (c1.stamina < 0) c1.skippedRestOrExercise = true;
          if (c2.stamina < 0) c2.skippedRestOrExercise = true;

          nextState.log.push({
            id: `rover_start_${nextState.mission.totalTicks}`,
            day: nextState.mission.day,
            tick: nextState.mission.tick,
            message: `Rover departed for crater sampling with ${c1.name} and ${c2.name}.`,
            type: 'info',
          });
        }
        break;
      }

      case 'START_EXPERIMENT': {
        // Costs: 4h, 15 power/day for 3 days -> +10 science on completion
        if (!nextState.lab.activeExperiment && nextState.lab.condition > 0) {
          const c = nextState.crew[command.crewId];
          c.stamina -= 4;
          if (c.stamina < 0) c.skippedRestOrExercise = true;
          nextState.lab.activeExperiment = true;
          nextState.lab.experimentDaysLeft = 3;

          nextState.log.push({
            id: `exp_start_${nextState.mission.totalTicks}`,
            day: nextState.mission.day,
            tick: nextState.mission.tick,
            message: `${c.name} initiated 3-day lab research experiment.`,
            type: 'info',
          });
        }
        break;
      }

      case 'ASK_MISSION_CONTROL': {
        // Costs: 1h, 5 power -> +2 science and hint
        if (nextState.systems.comms.condition >= 25 && nextState.resources.battery >= 5) {
          nextState.resources.battery -= 5;
          const c = nextState.crew[command.crewId];
          c.stamina -= 1;
          nextState.resources.science = Math.min(100, nextState.resources.science + 2);

          nextState.log.push({
            id: `comms_ask_${nextState.mission.totalTicks}`,
            day: nextState.mission.day,
            tick: nextState.mission.tick,
            message: 'Mission Control transmitted advisory telemetry (+2 science).',
            type: 'info',
          });
        }
        break;
      }

      case 'RESOLVE_DECISION': {
        const index = nextState.pendingDecisions.findIndex((d) => d.id === command.decisionId);
        if (index !== -1) {
          const decision = nextState.pendingDecisions[index];
          const option = decision.options.find((o) => o.id === command.optionId);
          if (option) {
            nextState.stats.decisionsMade.push({
              day: decision.day,
              title: decision.title,
              choice: option.label,
            });
            nextState.completedEvents.push(decision.id);
            nextState.pendingDecisions.splice(index, 1);

            // Execute the action associated with this option
            return this.dispatch(nextState, option.action);
          }
        }
        break;
      }

      case 'DISMISS_DECISION': {
        const idx = nextState.pendingDecisions.findIndex((d) => d.id === command.decisionId);
        if (idx !== -1) {
          nextState.completedEvents.push(command.decisionId);
          nextState.pendingDecisions.splice(idx, 1);
        }
        break;
      }

      case 'PURCHASE_UPGRADE': {
        const upgradeDef = BUILDING_UPGRADES[command.upgradeId];
        if (!upgradeDef) break;
        const upgrades = (nextState.upgrades = nextState.upgrades || ({} as any));

        // Regolith shield has up to 3 layers
        if (command.upgradeId === 'regolith_shield') {
          return this.dispatch(nextState, { type: 'BUILD_SHIELD_LAYER' });
        }

        if (upgrades[command.upgradeId]) break; // Already built

        // Alex Morgan Fast Mechanic perk: 1 fewer part (min 1), 1 fewer hour
        const isAlex = command.crewId === 'alex';
        const partsCost = isAlex ? Math.max(1, upgradeDef.costParts - 1) : upgradeDef.costParts;
        const hoursCost = isAlex ? Math.max(1, upgradeDef.hoursNeeded - 1) : upgradeDef.hoursNeeded;

        if (
          nextState.resources.spareParts >= partsCost &&
          nextState.resources.battery >= upgradeDef.costPower
        ) {
          nextState.resources.spareParts -= partsCost;
          nextState.resources.battery -= upgradeDef.costPower;
          upgrades[command.upgradeId] = true;

          const worker = nextState.crew[command.crewId];
          if (worker) {
            worker.stamina -= hoursCost;
            if (worker.stamina < 0) worker.skippedRestOrExercise = true;
          }

          if (command.upgradeId === 'emergency_o2') {
            nextState.resources.oxygen = Math.min(115, nextState.resources.oxygen + 15);
          }

          nextState.log.push({
            id: `upgrade_${command.upgradeId}_${nextState.mission.totalTicks}`,
            day: nextState.mission.day,
            tick: nextState.mission.tick,
            message: `Installed upgrade: ${upgradeDef.name}! ${upgradeDef.benefit}`,
            type: 'success',
          });
        }
        break;
      }

      case 'START_RESEARCH': {
        const proj = RESEARCH_PROJECTS[command.projectId];
        if (!proj) break;
        if (nextState.lab.condition <= 0) break;
        if (nextState.lab.completedProjects?.includes(command.projectId)) break;

        // Dr. Sara Williams perk: botany/biology projects take 2 fewer hours
        const isSara = command.crewId === 'sara';
        const hoursNeeded =
          isSara && proj.category === 'Life Sciences'
            ? Math.max(4, proj.hoursNeeded - 2)
            : proj.hoursNeeded;

        nextState.lab.activeProject = command.projectId;
        nextState.lab.activeExperiment = true;
        nextState.lab.progressTicks = 0;
        nextState.lab.totalTicksNeeded = hoursNeeded;

        const researcher = nextState.crew[command.crewId];
        if (researcher) {
          researcher.stamina -= 4;
          if (researcher.stamina < 0) researcher.skippedRestOrExercise = true;
        }

        nextState.log.push({
          id: `res_start_${nextState.mission.totalTicks}`,
          day: nextState.mission.day,
          tick: nextState.mission.tick,
          message: `Initiated research investigation: ${proj.name}. Progressing over ${hoursNeeded} game hours.`,
          type: 'info',
        });
        break;
      }

      case 'START_EXPEDITION': {
        const dest = ROVER_DESTINATIONS[command.destinationId];
        if (!dest) break;
        if (nextState.rover.isAway || nextState.rover.condition <= 0) break;
        if (nextState.resources.battery < dest.batteryCost) break;

        // Daniel Vance Leadership perk: travel time reduced by 1 tick
        const hasDaniel = command.crew1 === 'daniel' || command.crew2 === 'daniel';
        const duration = hasDaniel ? Math.max(2, dest.travelTicks - 1) : dest.travelTicks;

        nextState.resources.battery -= dest.batteryCost;
        nextState.rover.isAway = true;
        nextState.rover.returnTick = nextState.mission.totalTicks + duration;
        nextState.rover.destination = command.destinationId;
        nextState.rover.crewOnBoard = [command.crew1, ...(command.crew2 ? [command.crew2] : [])];
        nextState.rover.condition = Math.max(0, nextState.rover.condition - 8);

        const c1 = nextState.crew[command.crew1];
        if (c1) {
          c1.location = 'surface';
          c1.stamina -= 4;
          if (c1.stamina < 0) c1.skippedRestOrExercise = true;
        }
        if (command.crew2) {
          const c2 = nextState.crew[command.crew2];
          if (c2) {
            c2.location = 'surface';
            c2.stamina -= 4;
            if (c2.stamina < 0) c2.skippedRestOrExercise = true;
          }
        }

        nextState.log.push({
          id: `exp_dep_${nextState.mission.totalTicks}`,
          day: nextState.mission.day,
          tick: nextState.mission.tick,
          message: `Rover departed on expedition to ${dest.name} (Estimated traverse: ${duration} hours).`,
          type: 'info',
        });
        break;
      }

      case 'START_CONSTRUCTION': {
        const cdef = CONSTRUCTION_PROJECTS[command.projectId];
        if (!cdef) break;
        const construction = (nextState.construction = nextState.construction || ({} as any));
        if (construction[command.projectId]?.built) break;

        const isAlex = command.crewId === 'alex';
        const partsCost = isAlex ? Math.max(1, cdef.costParts - 1) : cdef.costParts;

        if (
          nextState.resources.spareParts >= partsCost &&
          nextState.resources.battery >= cdef.costPower
        ) {
          nextState.resources.spareParts -= partsCost;
          nextState.resources.battery -= cdef.costPower;
          construction[command.projectId] = {
            built: false,
            inProgress: true,
            progressTicks: 0,
          };

          const builder = nextState.crew[command.crewId];
          if (builder) {
            builder.stamina -= 4;
            if (builder.stamina < 0) builder.skippedRestOrExercise = true;
          }

          nextState.log.push({
            id: `const_start_${nextState.mission.totalTicks}`,
            day: nextState.mission.day,
            tick: nextState.mission.tick,
            message: `Began construction on ${cdef.name}. Completion estimated in ${cdef.hoursNeeded} hours.`,
            type: 'info',
          });
        }
        break;
      }

      case 'TOGGLE_BUILDING_POWER': {
        nextState.log.push({
          id: `pwr_toggle_${nextState.mission.totalTicks}`,
          day: nextState.mission.day,
          tick: nextState.mission.tick,
          message: `Toggled power circuit for ${command.buildingId}.`,
          type: 'info',
        });
        break;
      }
    }

    return nextState;
  }

  /**
   * Advances the simulation by 1 tick (1/24th of a mission day).
   */
  tick(state: GameState): GameState {
    if (state.mission.isPaused || state.mission.status !== 'in_progress') {
      return state;
    }

    const nextState = JSON.parse(JSON.stringify(state)) as GameState;
    const mission = nextState.mission;

    // Check Stage updates: Stage 1 (Days 1-5), Stage 2 (Days 6-15), Stage 3 (Days 16-30)
    if (mission.day >= 16) {
      mission.stage = 3;
    } else if (mission.day >= 6) {
      mission.stage = 2;
      nextState.greenhouseBeds.bed2.unlocked = true;
    } else {
      mission.stage = 1;
    }

    // 1. Process Power
    const powerResult = calculatePowerTick(nextState, this.siteConfig);
    nextState.powerBreakdown = powerResult.breakdown;
    nextState.resources.battery = powerResult.newBattery;

    // 2. Process Life Support (Oxygen)
    const lifeResult = calculateLifeSupportTick(
      nextState,
      powerResult.poweredSystems.lifeSupport && !nextState.systems.lifeSupport.isFaulted
    );
    nextState.resources.oxygen = lifeResult.newOxygen;

    if (nextState.resources.oxygen === 0) {
      nextState.stats.consecutiveOxygenZeroTicks += 1;
      nextState.stats.maxConsecutiveOxygenZeroTicks = Math.max(
        nextState.stats.maxConsecutiveOxygenZeroTicks,
        nextState.stats.consecutiveOxygenZeroTicks
      );
    } else {
      nextState.stats.consecutiveOxygenZeroTicks = 0;
    }

    // 3. Process Water (from Day 6 active, but runs background)
    const waterResult = calculateWaterTick(
      nextState,
      powerResult.poweredSystems.recycler && !nextState.systems.recycler.isFaulted
    );
    nextState.resources.water = waterResult.newWater;

    // 4. Process Food
    const foodResult = calculateFoodTick(nextState.resources.food);
    nextState.resources.food = foodResult.newFood;

    // 5. Baseline Radiation Exposure for astronauts outside/surface
    for (const crew of Object.values(nextState.crew)) {
      const baseline = calculateBaselineSurfaceExposurePerTick(crew.location);
      crew.exposure = Math.round((crew.exposure + baseline) * 100) / 100;
    }

    // 6. Process Active Radiation Advisory Countdown & Impact
    if (nextState.radiationAdvisory && !nextState.radiationAdvisory.resolved) {
      nextState.radiationAdvisory.countdownTicks -= 1;
      if (nextState.radiationAdvisory.countdownTicks <= 0) {
        // Solar Storm Hits Outpost!
        const adv = nextState.radiationAdvisory;
        adv.resolved = true;
        nextState.stats.advisoriesSurvived += 1;

        for (const crew of Object.values(nextState.crew)) {
          const posFactor = getPositionFactor(crew.location);
          const exposurePoints = calculateEventExposure(
            adv.severity,
            posFactor,
            nextState.resources.shieldProtection
          );
          crew.exposure = Math.round((crew.exposure + exposurePoints) * 100) / 100;

          // Check if entered red exposure
          const thresholds = checkExposureThresholds(crew);
          if (thresholds.isRed) {
            crew.health = Math.max(0, crew.health - thresholds.healthPenalty);
          }
        }

        nextState.log.push({
          id: `solar_hit_${mission.totalTicks}`,
          day: mission.day,
          tick: mission.tick,
          message: `Space-weather event (${adv.eventType}) struck the outpost! Simulated radiation absorbed based on crew shelter positions.`,
          type: 'alert',
        });
      }
    }

    // 7. Process Crew Travel & Active Tasks
    for (const crew of Object.values(nextState.crew)) {
      // Process travel
      if (crew.location === 'transit') {
        crew.travelTicksRemaining -= 1;
        if (crew.travelTicksRemaining <= 0) {
          crew.location = crew.targetBuilding || 'habitat';
          crew.targetBuilding = undefined;
        }
      }

      // Process current task
      if (crew.currentTask) {
        crew.currentTask.ticksRemaining -= 1;
        if (crew.currentTask.ticksRemaining <= 0) {
          // Task Completed!
          this.completeTask(nextState, crew, crew.currentTask);
          crew.currentTask = undefined;
        }
      }
    }

    // 8. Process Rover Trip
    if (nextState.rover.isAway && nextState.rover.returnTick !== undefined) {
      if (mission.totalTicks >= nextState.rover.returnTick) {
        nextState.rover.isAway = false;
        nextState.rover.returnTick = undefined;

        // Reward science (+15 baseline; +3 perk if Daniel was on board)
        const hasDaniel = nextState.rover.crewOnBoard.includes('daniel');
        let scienceReward = 15 + (hasDaniel ? 3 : 0);

        if (nextState.rover.destination) {
          const dest = ROVER_DESTINATIONS[nextState.rover.destination];
          if (dest) {
            scienceReward = dest.scienceYield + (hasDaniel ? 5 : 0);
            if (dest.rewardType === 'water') {
              nextState.resources.water = Math.min(100, nextState.resources.water + dest.rewardAmount);
            } else if (dest.rewardType === 'power') {
              nextState.resources.battery = Math.min(100, nextState.resources.battery + dest.rewardAmount);
            } else if (dest.rewardType === 'parts') {
              nextState.resources.spareParts += dest.rewardAmount;
            }
          }
          nextState.rover.destination = undefined;
        }

        nextState.resources.science = Math.min(100, nextState.resources.science + scienceReward);
        nextState.stats.samplesCollected += 1;

        // Return crew to rover bay
        for (const id of nextState.rover.crewOnBoard) {
          const c = nextState.crew[id];
          if (c) c.location = 'rover_bay';
        }
        nextState.rover.crewOnBoard = [];

        nextState.log.push({
          id: `rover_return_${mission.totalTicks}`,
          day: mission.day,
          tick: mission.tick,
          message: `Rover returned safely from expedition! Yielded +${scienceReward} science.`,
          type: 'success',
        });
      }
    }

    // 9. Process Active Research Investigation
    if (nextState.lab.activeProject) {
      const proj = RESEARCH_PROJECTS[nextState.lab.activeProject];
      if (proj && nextState.resources.battery >= (proj.powerPerTick || 0.8)) {
        nextState.resources.battery = Math.max(0, nextState.resources.battery - (proj.powerPerTick || 0.8));
        const speedBonus = nextState.upgrades?.spectrometer ? 1.3 : 1.0;
        nextState.lab.progressTicks = (nextState.lab.progressTicks || 0) + 1 * speedBonus;

        if (nextState.lab.progressTicks >= (nextState.lab.totalTicksNeeded || proj.hoursNeeded)) {
          if (!nextState.lab.completedProjects) nextState.lab.completedProjects = [];
          nextState.lab.completedProjects.push(proj.id);
          nextState.resources.science = Math.min(100, nextState.resources.science + proj.scienceReward);
          nextState.stats.experimentsCompleted += 1;
          const finishedId = nextState.lab.activeProject;
          nextState.lab.activeProject = undefined;
          nextState.lab.activeExperiment = false;

          if (finishedId === 'water_ice_investigation') {
            nextState.resources.water = Math.min(100, nextState.resources.water + 15);
          }

          nextState.log.push({
            id: `res_done_${mission.totalTicks}`,
            day: mission.day,
            tick: mission.tick,
            message: `Research completed: ${proj.name}! +${proj.scienceReward} Science. Perk unlocked: ${proj.perkUnlocked}`,
            type: 'success',
          });
        }
      }
    }

    // 10. Process Active Construction Projects
    if (nextState.construction) {
      for (const [cid, cstate] of Object.entries(nextState.construction)) {
        if (cstate.inProgress && !cstate.built) {
          cstate.progressTicks += 1;
          const cdef = CONSTRUCTION_PROJECTS[cid as ConstructionProjectId];
          if (cdef && cstate.progressTicks >= cdef.hoursNeeded) {
            cstate.inProgress = false;
            cstate.built = true;
            if (cid === 'aux_battery_bank') {
              nextState.resources.battery = Math.min(125, nextState.resources.battery + 20);
            } else if (cid === 'secondary_water_tank') {
              nextState.resources.water = Math.min(125, nextState.resources.water + 20);
            } else if (cid === 'emergency_o2_cell') {
              nextState.resources.oxygen = Math.min(125, nextState.resources.oxygen + 20);
            }
            nextState.log.push({
              id: `const_done_${mission.totalTicks}`,
              day: mission.day,
              tick: mission.tick,
              message: `Expansion built: ${cdef.name}! ${cdef.benefit}`,
              type: 'success',
            });
          }
        }
      }
    }

    // Advance Tick Counter
    mission.tick += 1;
    mission.totalTicks += 1;

    // Check End of Mission Day (every 24 ticks)
    if (mission.tick >= 24) {
      mission.tick = 0;
      this.handleEndOfDay(nextState);
      mission.day += 1;
    }

    // 11. Update Mission Objectives & Achievement Progress
    this.updateObjectivesAndAchievements(nextState);

    // Decrement random event cooldown
    if (nextState.randomEventCooldown > 0) {
      nextState.randomEventCooldown -= 1;
    }

    // Check Trigger Scripted Events & Random Events
    this.checkForEvents(nextState);

    // Check Endings
    const endingCheck = determineEnding(nextState);
    if (endingCheck) {
      mission.status = endingCheck.ending;
      mission.endingReason = endingCheck.reason;
      mission.isPaused = true;
      mission.score = calculateScore(nextState);
    }

    return nextState;
  }

  private completeTask(state: GameState, crew: typeof INITIAL_CREW[CrewId], task: ActiveCrewTask) {
    switch (task.type) {
      case 'inspect': {
        state.log.push({
          id: `inspect_${state.mission.totalTicks}`,
          day: state.mission.day,
          tick: state.mission.tick,
          message: `${crew.name} inspected ${task.buildingId}. Systems verified.`,
          type: 'info',
        });
        break;
      }

      case 'minor_repair': {
        const sys = this.getSystemForBuilding(state, task.buildingId);
        if (sys) {
          sys.condition = Math.min(100, sys.condition + 30);
          if (sys.condition >= 25) sys.isFaulted = false;
        }
        state.log.push({
          id: `repair_${state.mission.totalTicks}`,
          day: state.mission.day,
          tick: state.mission.tick,
          message: `${crew.name} finished minor repairs on ${task.buildingId} (+30 condition).`,
          type: 'success',
        });
        break;
      }

      case 'major_repair': {
        const sys = this.getSystemForBuilding(state, task.buildingId);
        if (sys) {
          sys.condition = Math.min(100, sys.condition + 60);
          sys.isFaulted = false;
        }
        state.log.push({
          id: `major_repair_${state.mission.totalTicks}`,
          day: state.mission.day,
          tick: state.mission.tick,
          message: `${crew.name} completed major overhaul of ${task.buildingId} (+60 condition, fault cleared).`,
          type: 'success',
        });
        break;
      }

      case 'plant_crop': {
        if (task.targetBed && task.cropType) {
          const bed = state.greenhouseBeds[task.targetBed];
          bed.cropType = task.cropType;
          bed.daysPlanted = 0;
          bed.daysMissed = 0;
          bed.stage = 'growing';
          bed.tendedToday = true;
          state.log.push({
            id: `plant_${state.mission.totalTicks}`,
            day: state.mission.day,
            tick: state.mission.tick,
            message: `${crew.name} planted ${CROP_DEFINITIONS[task.cropType].name} in ${task.targetBed}.`,
            type: 'info',
          });
        }
        break;
      }

      case 'tend_crop': {
        if (task.targetBed) {
          state.greenhouseBeds[task.targetBed].tendedToday = true;
          state.log.push({
            id: `tend_${state.mission.totalTicks}`,
            day: state.mission.day,
            tick: state.mission.tick,
            message: `${crew.name} tended greenhouse crops in ${task.targetBed}.`,
            type: 'info',
          });
        }
        break;
      }

      case 'harvest_crop': {
        if (task.targetBed) {
          const bed = state.greenhouseBeds[task.targetBed];
          if (bed.cropType && bed.stage === 'ready') {
            const def = CROP_DEFINITIONS[bed.cropType];
            let yieldAmount = def.yield;
            if (crew.id === 'sara') {
              yieldAmount = Math.round(yieldAmount * 1.1); // Sara +10% yield perk
            }
            state.resources.food = Math.min(100, state.resources.food + yieldAmount);
            bed.cropType = null;
            bed.stage = 'empty';
            bed.daysPlanted = 0;
            bed.daysMissed = 0;
            state.log.push({
              id: `harvest_${state.mission.totalTicks}`,
              day: state.mission.day,
              tick: state.mission.tick,
              message: `${crew.name} harvested ${def.name} (+${yieldAmount} food)!`,
              type: 'success',
            });
          }
        }
        break;
      }
    }
  }

  private getSystemForBuilding(state: GameState, buildingId: BuildingId) {
    if (buildingId === 'power_station') return state.systems.solarArray;
    if (buildingId === 'habitat') return state.systems.lifeSupport;
    if (buildingId === 'recycler') return state.systems.recycler;
    if (buildingId === 'greenhouse') return state.systems.greenhouse;
    if (buildingId === 'comms') return state.systems.comms;
    if (buildingId === 'rover_bay') return state.rover;
    return null;
  }

  private handleEndOfDay(state: GameState) {
    const hasMaya = state.crew.maya !== undefined;

    // 1. Stats tracking for score
    if (state.resources.oxygen >= 20) {
      state.stats.daysOxygenNotRed += 1;
    }
    if (state.resources.battery >= 20) {
      state.stats.daysBatteryAbove20 += 1;
    }

    // 2. Hardware wear: -1 condition per day
    state.systems.solarArray.condition = Math.max(0, state.systems.solarArray.condition - 1);
    state.systems.lifeSupport.condition = Math.max(0, state.systems.lifeSupport.condition - 1);
    state.systems.recycler.condition = Math.max(0, state.systems.recycler.condition - 1);
    state.systems.greenhouse.condition = Math.max(0, state.systems.greenhouse.condition - 1);
    state.systems.comms.condition = Math.max(0, state.systems.comms.condition - 1);

    // Update fault status: condition < 25 is faulted
    for (const sys of Object.values(state.systems)) {
      if (sys.condition < 25) {
        sys.isFaulted = true;
      }
    }

    // 3. Greenhouse crop progression
    const isGreenhousePowered = state.powerBreakdown.servedDemandPerTick > 0;
    const waterAvailable = state.resources.water >= 15;

    for (const bedKey of ['bed1', 'bed2'] as const) {
      const res = updateCropBedDay(
        state.greenhouseBeds[bedKey],
        isGreenhousePowered,
        waterAvailable,
        state.greenhouseLightSetting
      );
      state.greenhouseBeds[bedKey] = res.updatedBed;
      if (res.lostCrop) {
        state.log.push({
          id: `crop_lost_${state.mission.totalTicks}`,
          day: state.mission.day,
          tick: 0,
          message: `Crop in ${bedKey} withered and was lost due to 3 missed days of care/water/power.`,
          type: 'alert',
        });
      }
    }

    // 4. Lab experiments
    if (state.lab.activeExperiment) {
      state.lab.experimentDaysLeft -= 1;
      if (state.lab.experimentDaysLeft <= 0) {
        state.lab.activeExperiment = false;
        state.resources.science = Math.min(100, state.resources.science + 10);
        state.stats.experimentsCompleted += 1;
        state.log.push({
          id: `exp_done_${state.mission.totalTicks}`,
          day: state.mission.day,
          tick: 0,
          message: 'Laboratory research experiment completed successfully (+10 science)!',
          type: 'success',
        });
      }
    }

    // 5. Crew health & stamina reset
    for (const crew of Object.values(state.crew)) {
      const delta = calculateDailyHealthDelta(crew, state.resources, hasMaya);
      crew.health = Math.max(0, Math.min(100, crew.health + delta));

      if (crew.health < 30) {
        state.stats.emergenciesCount += 1;
      }

      // Reset daily stamina bar to 8
      crew.stamina = crew.staminaMax;
      crew.skippedRestOrExercise = false;
    }
  }

  private updateObjectivesAndAchievements(state: GameState) {
    if (!state.objectives) return;

    for (const obj of state.objectives) {
      if (obj.id === 'obj_survive') {
        obj.progress = Math.min(30, state.mission.day);
        if (state.mission.day >= 30) obj.isCompleted = true;
      } else if (obj.id === 'obj_crew_alive') {
        const aliveCount = Object.values(state.crew).filter((c) => c.health > 10).length;
        obj.progress = aliveCount;
        if (state.mission.day >= 30 && aliveCount === 4) obj.isCompleted = true;
      } else if (obj.id === 'obj_research') {
        obj.progress = state.lab.completedProjects?.length || 0;
        if (obj.progress >= obj.target) obj.isCompleted = true;
      } else if (obj.id === 'obj_crops') {
        obj.progress = Math.min(
          obj.target,
          state.stats.experimentsCompleted * 10 + (state.resources.food > 75 ? 12 : 0)
        );
        if (obj.progress >= obj.target) obj.isCompleted = true;
      } else if (obj.id === 'obj_rover') {
        obj.progress = state.stats.samplesCollected;
        if (obj.progress >= obj.target) obj.isCompleted = true;
      } else if (obj.id === 'obj_shield') {
        obj.progress = state.resources.shieldLayersBuilt;
        if (obj.progress >= obj.target) obj.isCompleted = true;
      } else if (obj.id === 'obj_power_conservation') {
        if (state.mission.day >= 16 && state.mission.day <= 22 && state.resources.battery >= 20) {
          obj.progress = Math.min(7, state.mission.day - 15);
          if (obj.progress >= 7) obj.isCompleted = true;
        }
      }
    }

    if (!state.achievements) return;
    for (const ach of state.achievements) {
      if (ach.unlocked) continue;
      if (ach.id === 'lunar_rover' && state.stats.samplesCollected >= 1) {
        ach.unlocked = true;
        ach.unlockedDay = state.mission.day;
      } else if (
        ach.id === 'science_breakthrough' &&
        (state.lab.completedProjects?.length || 0) >= 1
      ) {
        ach.unlocked = true;
        ach.unlockedDay = state.mission.day;
      } else if (ach.id === 'solar_fortress' && state.resources.shieldLayersBuilt >= 1) {
        ach.unlocked = true;
        ach.unlockedDay = state.mission.day;
      } else if (ach.id === 'perfect_health' && state.mission.day >= 15) {
        const allHealthy = Object.values(state.crew).every((c) => c.health >= 75);
        if (allHealthy) {
          ach.unlocked = true;
          ach.unlockedDay = state.mission.day;
        }
      }
    }
  }

  private checkForEvents(state: GameState) {
    // 1. Scripted spine
    if (state.mission.tick === 1) {
      const decision = getScriptedDecisionForDay(state.mission.day, state);
      if (decision) {
        state.pendingDecisions.push(decision);
        if (decision.critical) {
          state.mission.isPaused = true; // Critical events auto-pause
        }

        // Trigger Day 12-13 Space-weather radiation advisory
        if (state.mission.day === 12 && !state.radiationAdvisory) {
          state.stats.protectionBeforeAdvisory = state.resources.shieldProtection;
          state.radiationAdvisory = {
            active: true,
            eventId: 'DONKI_CME_2024_05',
            eventType: 'X-class Flare + Fast CME',
            classType: 'X5.8',
            severity: 4, // Severity 4
            countdownTicks: 12, // 12 game hours
            sourceBadge: 'Archived NASA',
            timestamp: '2024-05-10T06:54:00Z',
            details:
              'Coronal Mass Ejection detected by SOHO/LASCO. Proton flux enhancement expected at lunar surface.',
            resolved: false,
          };
        }
      }
    }

    // 2. Random events (from pool, respecting cooldown)
    if (state.mission.tick === 8 && state.mission.day > 3 && state.pendingDecisions.length === 0) {
      const randomEvt = tryTriggerRandomEvent(state, this.rng);
      if (randomEvt.decision) {
        state.pendingDecisions.push(randomEvt.decision);
        state.randomEventCooldown = 72; // At most one random negative event per 3 days (72 ticks)
        if (randomEvt.decision.critical) {
          state.mission.isPaused = true;
        }
        if (randomEvt.stateModifier) {
          randomEvt.stateModifier(state);
        }
      }
    }
  }
}
