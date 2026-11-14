/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/sim/types.ts
 * Pure TypeScript types for the simulation engine.
 * No Phaser, React, or DOM imports.
 */

export type SiteId = 'moon' | 'mars';
export type Difficulty = 'cadet' | 'explorer' | 'commander' | 'survival' | 'expert' | 'veteran';
export type GameSpeed = 0 | 1 | 2 | 4;

export type EndingType =
  | 'mission_accomplished'
  | 'scientific_success_resource_failure'
  | 'emergency_mission'
  | 'mission_abort';

export type BuildingId =
  | 'habitat'
  | 'power_station'
  | 'greenhouse'
  | 'recycler'
  | 'shelter'
  | 'laboratory'
  | 'comms'
  | 'rover_bay';

export type CrewId = 'alex' | 'sara' | 'daniel' | 'maya';

export type CrewLocation = BuildingId | 'surface' | 'transit';

export type CropType = 'quick_greens' | 'dwarf_tomatoes' | 'potatoes';

export interface CropDefinition {
  id: CropType;
  name: string;
  growthDays: number;
  yield: number;
  waterPerDay: number;
  description: string;
}

export interface CropBedState {
  id: 'bed1' | 'bed2';
  unlocked: boolean;
  cropType: CropType | null;
  daysPlanted: number;
  daysMissed: number;
  stage: 'empty' | 'growing' | 'ready';
  tendedToday: boolean;
}

export type PowerPriorityItem =
  | 'essential'
  | 'recycler'
  | 'greenhouse'
  | 'laboratory'
  | 'rover_upgrades';

export type GreenhouseLightSetting = 'low' | 'normal' | 'high';

export interface SystemCondition {
  condition: number; // 0-100
  isFaulted: boolean;
  faultCause?: string;
  name: string;
}

export interface RoverState extends SystemCondition {
  isAway: boolean;
  returnTick?: number;
  crewOnBoard: CrewId[];
  destination?: RoverDestinationId;
  batteryCharge?: number; // 0-100
  samplesCollected?: number;
}

export interface LabState {
  activeExperiment: boolean;
  experimentDaysLeft: number;
  condition: number;
  activeProject?: ResearchProjectId;
  progressTicks?: number;
  totalTicksNeeded?: number;
  completedProjects?: ResearchProjectId[];
}

export type CrewStatus =
  | 'IDLE'
  | 'TASK_ASSIGNED'
  | 'TRAVELLING'
  | 'PREPARING'
  | 'WORKING'
  | 'PAUSED'
  | 'RETURNING_TO_OFFICE'
  | 'RESTING'
  | 'INJURED'
  | 'UNAVAILABLE'
  | 'EMERGENCY';

export type SkillType =
  | 'engineering'
  | 'biology'
  | 'medical'
  | 'science'
  | 'operations'
  | 'mechanical';

export interface SkillRecord {
  level: number; // 1 to 5
  xp: number; // current experience points
  xpNeeded: number; // experience needed for next level
}

export interface CrewWorkHistoryEntry {
  id: string;
  missionDay: number;
  tick: number;
  taskName: string;
  category: 'Engineering' | 'Life Support' | 'Science' | 'Expedition' | 'Medical' | 'Operations';
  location: string;
  status: 'Completed' | 'Failed' | 'Interrupted' | 'Cancelled';
  durationHours: number;
  xpGained?: { skill: SkillType; amount: number };
}

export interface CrewMember {
  id: CrewId;
  name: string;
  role: string;
  perk: string;
  stamina: number; // 0-8 work hours per day (resets daily)
  staminaMax: number; // 8
  health: number; // 0-100 (start 100)
  exposure: number; // simulated exposure points
  location: CrewLocation;
  targetBuilding?: BuildingId;
  travelTicksRemaining: number;
  skippedRestOrExercise: boolean;
  currentTask?: ActiveCrewTask;

  // Autonomous Crew & Skill Progression System
  status?: CrewStatus;
  currentActivity?: string;
  officeId?: BuildingId;
  officeName?: string;
  officePos?: { x: number; z: number };
  officeDuty?: string;
  skills?: Record<SkillType, SkillRecord>;
  fatigue?: number; // 0-100
  stress?: number; // 0-100
  workHistory?: CrewWorkHistoryEntry[];
}

export type TaskType =
  | 'inspect'
  | 'minor_repair'
  | 'major_repair'
  | 'plant_crop'
  | 'tend_crop'
  | 'harvest_crop'
  | 'run_experiment'
  | 'rover_trip'
  | 'build_shield_layer'
  | 'ask_control'
  | 'move'
  | 'research'
  | 'construct'
  | 'upgrade';

export interface ActiveCrewTask {
  type: TaskType;
  buildingId: BuildingId;
  ticksRemaining: number;
  totalTicks: number;
  targetBed?: 'bed1' | 'bed2';
  cropType?: CropType;
  upgradeId?: BuildingUpgradeId;
  projectId?: ResearchProjectId;
  constructionId?: ConstructionProjectId;
  destinationId?: RoverDestinationId;
}

export interface TaskCostPreview {
  hours: number;
  power: number;
  parts: number;
  risk: string;
  description: string;
  canAfford: boolean;
  missingReason?: string;
}

export type GeologicalResourceType =
  | 'regolith'
  | 'water_ice'
  | 'iron'
  | 'titanium'
  | 'aluminum'
  | 'silicon'
  | 'he3';

export interface ResourceDeposit {
  id: string;
  name: string;
  resourceType: GeologicalResourceType;
  zone: string;
  position: { x: number; z: number };
  elevation: number;
  totalQuantity: number;
  remainingQuantity: number;
  depleted: boolean;
  scanned: boolean;
  difficulty: 'easy' | 'moderate' | 'challenging' | 'extreme';
  requiredTool: string;
  description: string;
}

export interface ResourcesState {
  battery: number; // 0-100, start 85
  oxygen: number; // 0-100, start 90
  water: number; // 0-100, start 80
  food: number; // 0-100, start 75
  shieldProtection: number; // start 60, max 90 (+10 per layer)
  shieldLayersBuilt: number; // 0 to 3
  spareParts: number; // cadet 8, commander 6, veteran 4
  science: number; // start 0, max 100 in score

  // Land Resources & Raw Geological Materials (Part 2 & 12)
  rawRegolith?: number;
  rawIce?: number;
  ironOre?: number;
  titaniumOre?: number;
  aluminumOre?: number;
  siliconOre?: number;
  he3Volatiles?: number;

  // Processed Construction & Industrial Materials (Part 5 & 12)
  sinteredBlocks?: number;
  metalComponents?: number;
  solarCells?: number;
  medicalSupplies?: number;
}

export interface PowerBreakdown {
  sunlightFactor: number; // 0.0 to 1.0
  generationPerDay: number;
  generationPerTick: number;
  essentialDemandPerDay: number;
  recyclerDemandPerDay: number;
  greenhouseDemandPerDay: number;
  labDemandPerDay: number;
  totalDemandPerDay: number;
  servedDemandPerTick: number;
  batteryDeltaPerTick: number;
  shedSystems: PowerPriorityItem[];
}

export interface RadiationAdvisory {
  active: boolean;
  eventId: string;
  eventType: string; // e.g. "X-class flare + SEP"
  classType: string;
  severity: 1 | 2 | 3 | 4 | 5;
  countdownTicks: number; // 12 ticks = 12 game hours
  sourceBadge: 'Live NASA' | 'Archived NASA' | 'Simulated';
  timestamp: string;
  details: string;
  resolved: boolean;
}

export interface DecisionOption {
  id: string;
  label: string;
  description: string;
  costDescription: string;
  hoursCost: number;
  powerCost: number;
  partsCost: number;
  action: Command;
}

export interface PendingDecision {
  id: string;
  day: number;
  title: string;
  situation: string;
  learningPoint: string;
  sourceBadge: 'Live NASA' | 'Archived NASA' | 'Simulated';
  sourceTag?: string;
  options: DecisionOption[];
  critical: boolean;
  createdAtTick: number;
}

export interface LogEntry {
  id: string;
  day: number;
  tick: number;
  message: string;
  type: 'info' | 'warning' | 'alert' | 'success';
}

export interface ScoreBreakdown {
  crewSafety: number; // max 300
  lifeSupport: number; // max 200
  power: number; // max 150
  radiationPreparedness: number; // max 150
  foodAndWater: number; // max 100
  science: number; // max 100
  total: number; // max 1000
  safetyGateTriggered: boolean;
  band: 'Gold Commander' | 'Silver' | 'Bronze' | 'Trainee';
}

export interface GameStats {
  daysOxygenNotRed: number;
  daysBatteryAbove20: number;
  emergenciesCount: number;
  consecutiveOxygenZeroTicks: number;
  maxConsecutiveOxygenZeroTicks: number;
  protectionBeforeAdvisory: number;
  experimentsCompleted: number;
  samplesCollected: number;
  advisoriesSurvived: number;
  decisionsMade: { day: number; title: string; choice: string }[];
}

export interface MissionState {
  day: number; // 1 to 30
  tick: number; // 0 to 23 per day
  totalTicks: number; // 0 to 720 (30 days * 24 ticks)
  speed: GameSpeed;
  isPaused: boolean;
  seed: number;
  difficulty: Difficulty;
  siteId: SiteId;
  stage: 1 | 2 | 3;
  status: 'in_progress' | EndingType;
  endingReason?: string;
  score?: ScoreBreakdown;
}

export type BuildingUpgradeId =
  | 'solar_cells'
  | 'dust_coating'
  | 'thermal_insulation'
  | 'emergency_o2'
  | 'nanofilter'
  | 'crop_led'
  | 'spectrometer'
  | 'high_gain_antenna'
  | 'regolith_shield';

export interface UpgradeDefinition {
  id: BuildingUpgradeId;
  buildingId: BuildingId;
  name: string;
  description: string;
  benefit: string;
  costPower: number;
  costParts: number;
  hoursNeeded: number;
}

export type ResearchProjectId =
  | 'regolith_composition'
  | 'water_ice_investigation'
  | 'solar_radiation_monitoring'
  | 'lunar_environmental_analysis'
  | 'sustainable_agriculture'
  | 'habitat_efficiency';

export interface ResearchDefinition {
  id: ResearchProjectId;
  name: string;
  category:
    | 'Geology'
    | 'Hydrology'
    | 'Heliophysics'
    | 'Life Sciences'
    | 'Engineering'
    | 'Environmental Analysis';
  description: string;
  hoursNeeded: number;
  powerPerTick: number;
  scienceReward: number;
  perkUnlocked: string;
  stemConcept: string;
}

export type RoverDestinationId =
  | 'shackleton_rim'
  | 'shadowed_crater'
  | 'malapert_peak'
  | 'apollo_descent';

export interface RoverDestination {
  id: RoverDestinationId;
  name: string;
  distanceKm: number;
  travelTicks: number;
  batteryCost: number;
  description: string;
  scienceYield: number;
  rewardType: 'science' | 'water' | 'power' | 'parts';
  rewardAmount: number;
}

export type ConstructionProjectId =
  | 'aux_battery_bank'
  | 'secondary_water_tank'
  | 'emergency_o2_cell'
  | 'surface_sensor_array';

export interface ConstructionDefinition {
  id: ConstructionProjectId;
  name: string;
  description: string;
  costParts: number;
  costPower: number;
  hoursNeeded: number;
  benefit: string;
}

export interface MissionObjective {
  id: string;
  title: string;
  description: string;
  category: 'primary' | 'secondary' | 'bonus';
  progress: number;
  target: number;
  unit: string;
  isCompleted: boolean;
  rewardDescription: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedDay?: number;
}

export interface LoggedCommand {
  tick: number;
  day: number;
  command: Command;
  timestamp?: number;
}

export interface GameState {
  mission: MissionState;
  resources: ResourcesState;
  systems: {
    solarArray: SystemCondition;
    lifeSupport: SystemCondition;
    recycler: SystemCondition;
    greenhouse: SystemCondition;
    comms: SystemCondition;
  };
  greenhouseBeds: {
    bed1: CropBedState;
    bed2: CropBedState;
  };
  greenhouseLightSetting: GreenhouseLightSetting;
  rover: RoverState;
  lab: LabState;
  crew: Record<CrewId, CrewMember>;
  powerPriority: PowerPriorityItem[];
  powerBreakdown: PowerBreakdown;
  radiationAdvisory: RadiationAdvisory | null;
  pendingDecisions: PendingDecision[];
  completedEvents: string[];
  randomEventCooldown: number; // ticks until next random event allowed
  stats: GameStats;
  log: LogEntry[];
  commandLog?: LoggedCommand[];
  upgrades?: Record<BuildingUpgradeId, boolean>;
  construction?: Record<ConstructionProjectId, { built: boolean; inProgress: boolean; progressTicks: number }>;
  objectives?: MissionObjective[];
  achievements?: Achievement[];
  deposits?: Record<string, ResourceDeposit>;
}

// Commands from Player / UI / 3D Scene
export type Command =
  | { type: 'SET_SPEED'; speed: GameSpeed }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'MOVE_CREW'; crewId: CrewId; targetBuilding: BuildingId }
  | {
      type: 'ASSIGN_TASK';
      crewId: CrewId;
      taskType: TaskType;
      buildingId: BuildingId;
      bedId?: 'bed1' | 'bed2';
      cropType?: CropType;
      upgradeId?: BuildingUpgradeId;
      projectId?: ResearchProjectId;
      constructionId?: ConstructionProjectId;
      destinationId?: RoverDestinationId;
    }
  | { type: 'CANCEL_TASK'; crewId: CrewId }
  | { type: 'SCAN_DEPOSIT'; crewId: CrewId; depositId: string }
  | { type: 'MINE_DEPOSIT'; crewId: CrewId; depositId: string; amount?: number }
  | { type: 'PROCESS_MATERIAL'; processType: 'ice_to_water' | 'regolith_to_blocks' | 'ore_to_metal' | 'silicon_to_cells'; batches?: number }
  | { type: 'SEND_TO_OFFICE'; crewId: CrewId }
  | { type: 'SEND_TO_REST'; crewId: CrewId }
  | { type: 'SET_CREW_STATUS'; crewId: CrewId; status: CrewStatus; activity?: string }
  | { type: 'SET_POWER_PRIORITY'; priority: PowerPriorityItem[] }
  | { type: 'SET_GREENHOUSE_LIGHTS'; setting: GreenhouseLightSetting }
  | { type: 'BUILD_SHIELD_LAYER' }
  | { type: 'START_ROVER_TRIP'; crew1: CrewId; crew2: CrewId }
  | { type: 'START_EXPERIMENT'; crewId: CrewId }
  | { type: 'ASK_MISSION_CONTROL'; crewId: CrewId }
  | { type: 'RESOLVE_DECISION'; decisionId: string; optionId: string }
  | { type: 'DISMISS_DECISION'; decisionId: string }
  | { type: 'PURCHASE_UPGRADE'; buildingId: BuildingId; upgradeId: BuildingUpgradeId; crewId: CrewId }
  | { type: 'START_RESEARCH'; projectId: ResearchProjectId; crewId: CrewId }
  | { type: 'START_EXPEDITION'; destinationId: RoverDestinationId; crew1: CrewId; crew2?: CrewId }
  | { type: 'START_CONSTRUCTION'; projectId: ConstructionProjectId; crewId: CrewId }
  | { type: 'TOGGLE_BUILDING_POWER'; buildingId: BuildingId };

// Site Config JSON
export interface SiteConfig {
  id: SiteId;
  name: string;
  body: 'Moon' | 'Mars';
  sunlightSchedule: {
    days1to10: number; // e.g. 1.0
    days11to15: number; // 0.8
    days16to22: number; // 0.5
    days23to30: number; // 0.7
  };
  baseArrayOutput: number; // e.g. 120
  commDelayOneWaySeconds: number; // Moon 1.3s, Mars 360s game time (6 hours)
  commDelayTicks: number; // 0 for Moon, 6 for Mars
  dustStormRisk: boolean;
  description: string;
}

// Navigation Graph for 2D A* and Travel Simulation
export interface NavNode {
  id: BuildingId;
  name: string;
  x: number; // grid or 3D coordinate
  z: number;
  connections: { target: BuildingId; travelTicks: number }[];
}

export interface NavGraph {
  nodes: Record<BuildingId, NavNode>;
}

