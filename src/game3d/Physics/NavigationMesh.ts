/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/game3d/Physics/NavigationMesh.ts
 * Authoritative Navigation Mesh, Inflated Obstacle A* Pathfinding,
 * Data-Driven Building Footprints, Kinematic Character Collision & Wall Sliding.
 */

import { BuildingId, CrewId } from '../../sim/types.ts';
import { getTerrainHeight, getTerrainSample } from './TerrainHeight.ts';

export interface InteractionPoint {
  id: string;
  name: string;
  buildingId: BuildingId;
  x: number;
  z: number;
  assignedCrew?: CrewId;
}

export interface BuildingFootprint {
  id: BuildingId;
  name: string;
  center: { x: number; z: number };
  type: 'box' | 'circle';
  radius?: number;
  halfWidth?: number;
  halfDepth?: number;
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
  doors: { x: number; z: number }[];
  interactionPoints: InteractionPoint[];
}

export const AGENT_RADIUS = 0.4;
export const SAFETY_MARGIN = 0.25;
export const INFLATION = AGENT_RADIUS + SAFETY_MARGIN; // 0.65m

// Data-Driven Building Footprints with explicit exterior interaction bays and doors
export const BUILDING_FOOTPRINTS: Record<BuildingId, BuildingFootprint> = {
  habitat: {
    id: 'habitat',
    name: 'Habitat Central Dome',
    center: { x: 0, z: 0 },
    type: 'circle',
    radius: 3.8,
    bounds: { minX: -3.8, maxX: 3.8, minZ: -3.8, maxZ: 3.8 },
    doors: [{ x: 0, z: 4.2 }, { x: 0, z: -4.2 }],
    interactionPoints: [
      { id: 'hab_airlock_south', name: 'Primary Airlock Dust Console', buildingId: 'habitat', x: 0, z: 4.8 },
      { id: 'hab_life_support_bay', name: 'Suit Diagnostics Port', buildingId: 'habitat', x: -4.5, z: 0 },
      { id: 'hab_med_eva_dock', name: 'Emergency EVA Transfer Bay', buildingId: 'habitat', x: 4.5, z: 0 },
    ],
  },
  power_station: {
    id: 'power_station',
    name: 'Solar Array & Battery Storage',
    center: { x: -14, z: -6 },
    type: 'box',
    halfWidth: 3.6,
    halfDepth: 2.5,
    bounds: { minX: -17.6, maxX: -10.4, minZ: -8.5, maxZ: -3.5 },
    doors: [{ x: -14, z: -3.0 }],
    interactionPoints: [
      { id: 'pwr_inverter_rack', name: 'Photovoltaic Inverter Rack', buildingId: 'power_station', x: -14, z: -2.8 },
      { id: 'pwr_battery_bms', name: 'Battery Management Console', buildingId: 'power_station', x: -18.2, z: -6 },
      { id: 'pwr_solar_mast', name: 'Tracking Motor Servos', buildingId: 'power_station', x: -9.8, z: -6 },
    ],
  },
  greenhouse: {
    id: 'greenhouse',
    name: 'Hydroponic Greenhouse Module',
    center: { x: 12, z: -4 },
    type: 'box',
    halfWidth: 3.2,
    halfDepth: 2.4,
    bounds: { minX: 8.8, maxX: 15.2, minZ: -6.4, maxZ: -1.6 },
    doors: [{ x: 8.4, z: -4 }],
    interactionPoints: [
      { id: 'gh_airlock_inlet', name: 'Biomass Airlock Inlet', buildingId: 'greenhouse', x: 8.2, z: -4 },
      { id: 'gh_nutrient_feeder', name: 'Nutrient Solution Injector', buildingId: 'greenhouse', x: 12, z: -1.0 },
      { id: 'gh_climate_scrubber', name: 'Atmospheric Transpiration Condenser', buildingId: 'greenhouse', x: 15.8, z: -4 },
    ],
  },
  recycler: {
    id: 'recycler',
    name: 'Water & Sabatier Recycler Skid',
    center: { x: 6, z: 10 },
    type: 'circle',
    radius: 2.8,
    bounds: { minX: 3.2, maxX: 8.8, minZ: 7.2, maxZ: 12.8 },
    doors: [{ x: 6, z: 6.8 }],
    interactionPoints: [
      { id: 'rec_filter_bay', name: 'Distillation Core & Filter Bay', buildingId: 'recycler', x: 6, z: 6.6 },
      { id: 'rec_pump_skid', name: 'High-Pressure Condensate Pumps', buildingId: 'recycler', x: 9.4, z: 10 },
    ],
  },
  shelter: {
    id: 'shelter',
    name: 'Sub-Regolith Radiation Shelter',
    center: { x: -8, z: 12 },
    type: 'circle',
    radius: 3.6,
    bounds: { minX: -11.6, maxX: -4.4, minZ: 8.4, maxZ: 15.6 },
    doors: [{ x: -8, z: 7.8 }],
    interactionPoints: [
      { id: 'she_blast_hatch', name: 'Heavy Regolith Blast Hatch', buildingId: 'shelter', x: -8, z: 7.6 },
      { id: 'she_dosimetry_mast', name: 'Solar Cosmic Ray Dosimeter', buildingId: 'shelter', x: -4.0, z: 12 },
    ],
  },
  laboratory: {
    id: 'laboratory',
    name: 'Research & Geological Lab',
    center: { x: 14, z: 8 },
    type: 'box',
    halfWidth: 3.2,
    halfDepth: 2.6,
    bounds: { minX: 10.8, maxX: 17.2, minZ: 5.4, maxZ: 10.6 },
    doors: [{ x: 10.4, z: 8 }],
    interactionPoints: [
      { id: 'lab_sample_hatch', name: 'Core Sample Deposition Hatch', buildingId: 'laboratory', x: 10.2, z: 8 },
      { id: 'lab_spectrometer', name: 'X-Ray Diffraction Spectrometer', buildingId: 'laboratory', x: 14, z: 11.2 },
    ],
  },
  comms: {
    id: 'comms',
    name: 'Deep Space Comms Dish & Mast',
    center: { x: -16, z: 10 },
    type: 'circle',
    radius: 1.8,
    bounds: { minX: -17.8, maxX: -14.2, minZ: 8.2, maxZ: 11.8 },
    doors: [{ x: -14.0, z: 10 }],
    interactionPoints: [
      { id: 'comms_gimbal_actuator', name: 'High-Gain Gimbal Actuator', buildingId: 'comms', x: -13.8, z: 10 },
    ],
  },
  rover_bay: {
    id: 'rover_bay',
    name: 'Rover Maintenance Bay & Lift',
    center: { x: 0, z: -16 },
    type: 'box',
    halfWidth: 3.2,
    halfDepth: 3.6,
    bounds: { minX: -3.2, maxX: 3.2, minZ: -19.6, maxZ: -12.4 },
    doors: [{ x: 0, z: -12.0 }],
    interactionPoints: [
      { id: 'rov_recharge_boom', name: 'Cryogenic Fluid & Power Umbilical', buildingId: 'rover_bay', x: 0, z: -11.8 },
      { id: 'rov_tool_rack', name: 'Wheel Suspension Service Jack', buildingId: 'rover_bay', x: 3.8, z: -16 },
    ],
  },
};

/**
 * Checks if a point (x, z) lies inside any building footprint (uninflated).
 */
export function isInsideAnyBuildingFootprint(x: number, z: number): boolean {
  for (const fp of Object.values(BUILDING_FOOTPRINTS)) {
    if (fp.type === 'circle') {
      const dist = Math.hypot(x - fp.center.x, z - fp.center.z);
      if (dist <= (fp.radius || 3.0)) return true;
    } else if (fp.type === 'box') {
      const hw = fp.halfWidth || 3.0;
      const hd = fp.halfDepth || 2.5;
      if (
        x >= fp.center.x - hw &&
        x <= fp.center.x + hw &&
        z >= fp.center.z - hd &&
        z <= fp.center.z + hd
      ) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Checks if a point (x, z) lies inside an inflated building obstacle.
 */
export function isInsideInflatedObstacle(x: number, z: number, inflation = INFLATION): boolean {
  for (const fp of Object.values(BUILDING_FOOTPRINTS)) {
    if (fp.type === 'circle') {
      const dist = Math.hypot(x - fp.center.x, z - fp.center.z);
      if (dist <= (fp.radius || 3.0) + inflation) return true;
    } else if (fp.type === 'box') {
      const hw = (fp.halfWidth || 3.0) + inflation;
      const hd = (fp.halfDepth || 2.5) + inflation;
      if (
        x >= fp.center.x - hw &&
        x <= fp.center.x + hw &&
        z >= fp.center.z - hd &&
        z <= fp.center.z + hd
      ) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Kinematic character controller collision solver with tangent wall sliding.
 */
export function resolveKinematicCollision(
  oldPos: { x: number; z: number },
  targetPos: { x: number; z: number },
  radius = AGENT_RADIUS
): { x: number; z: number; collided: boolean; normal?: { x: number; z: number } } {
  let resX = targetPos.x;
  let resZ = targetPos.z;
  let collided = false;
  let collNormal: { x: number; z: number } | undefined;

  for (const fp of Object.values(BUILDING_FOOTPRINTS)) {
    if (fp.type === 'circle') {
      const minDistance = (fp.radius || 3.0) + radius;
      const dx = resX - fp.center.x;
      const dz = resZ - fp.center.z;
      const dist = Math.hypot(dx, dz);

      if (dist < minDistance && dist > 0.0001) {
        collided = true;
        const nx = dx / dist;
        const nz = dz / dist;
        collNormal = { x: nx, z: nz };

        // Push out along normal
        resX = fp.center.x + nx * minDistance;
        resZ = fp.center.z + nz * minDistance;
      }
    } else if (fp.type === 'box') {
      const hw = (fp.halfWidth || 3.0) + radius;
      const hd = (fp.halfDepth || 2.5) + radius;

      const minX = fp.center.x - hw;
      const maxX = fp.center.x + hw;
      const minZ = fp.center.z - hd;
      const maxZ = fp.center.z + hd;

      if (resX > minX && resX < maxX && resZ > minZ && resZ < maxZ) {
        collided = true;
        // Find closest edge to push out to
        const dLeft = resX - minX;
        const dRight = maxX - resX;
        const dTop = resZ - minZ;
        const dBottom = maxZ - resZ;

        const minEdge = Math.min(dLeft, dRight, dTop, dBottom);
        if (minEdge === dLeft) {
          resX = minX;
          collNormal = { x: -1, z: 0 };
        } else if (minEdge === dRight) {
          resX = maxX;
          collNormal = { x: 1, z: 0 };
        } else if (minEdge === dTop) {
          resZ = minZ;
          collNormal = { x: 0, z: -1 };
        } else {
          resZ = maxZ;
          collNormal = { x: 0, z: 1 };
        }
      }
    }
  }

  // Slope limitation: EVA suit cannot walk up slopes steeper than 35°
  const sample = getTerrainSample(resX, resZ);
  if (!sample.isWalkable) {
    resX = oldPos.x;
    resZ = oldPos.z;
    collided = true;
  }

  return { x: resX, z: resZ, collided, normal: collNormal };
}

/**
 * Local avoidance separation steering between astronauts.
 */
export function calculateSeparation(
  selfId: CrewId,
  selfPos: { x: number; z: number },
  allPositions: Record<CrewId, { x: number; z: number }>,
  separationRadius = 0.85
): { vx: number; vz: number } {
  let forceX = 0;
  let forceZ = 0;

  for (const [id, otherPos] of Object.entries(allPositions)) {
    if (id === selfId) continue;
    const dx = selfPos.x - otherPos.x;
    const dz = selfPos.z - otherPos.z;
    const dist = Math.hypot(dx, dz);

    if (dist < separationRadius && dist > 0.001) {
      const push = (separationRadius - dist) / dist;
      forceX += dx * push * 0.5;
      forceZ += dz * push * 0.5;
    }
  }

  return { vx: forceX, vz: forceZ };
}

/**
 * A* Pathfinding Grid over 80x80 lunar terrain with inflated obstacles.
 */
export class NavGrid {
  private gridResolution = 0.5; // 0.5m grid
  private minBound = -38;
  private maxBound = 38;
  private cols: number;
  private rows: number;
  private walkable: boolean[][];

  constructor() {
    this.cols = Math.round((this.maxBound - this.minBound) / this.gridResolution);
    this.rows = Math.round((this.maxBound - this.minBound) / this.gridResolution);
    this.walkable = [];

    // Precompute walkable status
    for (let c = 0; c < this.cols; c++) {
      this.walkable[c] = [];
      const wx = this.minBound + c * this.gridResolution;
      for (let r = 0; r < this.rows; r++) {
        const wz = this.minBound + r * this.gridResolution;
        const insideObstacle = isInsideInflatedObstacle(wx, wz, INFLATION);
        const sample = getTerrainSample(wx, wz);
        this.walkable[c][r] = !insideObstacle && sample.isWalkable;
      }
    }
  }

  worldToGrid(wx: number, wz: number): { c: number; r: number } {
    const c = Math.max(0, Math.min(this.cols - 1, Math.round((wx - this.minBound) / this.gridResolution)));
    const r = Math.max(0, Math.min(this.rows - 1, Math.round((wz - this.minBound) / this.gridResolution)));
    return { c, r };
  }

  gridToWorld(c: number, r: number): { x: number; z: number } {
    return {
      x: this.minBound + c * this.gridResolution,
      z: this.minBound + r * this.gridResolution,
    };
  }

  isWalkable(c: number, r: number): boolean {
    if (c < 0 || c >= this.cols || r < 0 || r >= this.rows) return false;
    return this.walkable[c][r];
  }

  /**
   * Finds shortest corridor path using A*.
   */
  findPath(
    start: { x: number; z: number },
    goal: { x: number; z: number }
  ): { x: number; z: number }[] {
    const startGrid = this.worldToGrid(start.x, start.z);
    const goalGrid = this.worldToGrid(goal.x, goal.z);

    if (startGrid.c === goalGrid.c && startGrid.r === goalGrid.r) {
      return [{ x: goal.x, z: goal.z }];
    }

    interface Node {
      c: number;
      r: number;
      g: number;
      h: number;
      f: number;
      parent?: Node;
    }

    const openSet: Node[] = [];
    const closedSet = new Set<string>();

    const startNode: Node = {
      c: startGrid.c,
      r: startGrid.r,
      g: 0,
      h: Math.hypot(goalGrid.c - startGrid.c, goalGrid.r - startGrid.r),
      f: 0,
    };
    startNode.f = startNode.g + startNode.h;
    openSet.push(startNode);

    const neighbors = [
      { dc: 1, dr: 0, cost: 1 },
      { dc: -1, dr: 0, cost: 1 },
      { dc: 0, dr: 1, cost: 1 },
      { dc: 0, dr: -1, cost: 1 },
      { dc: 1, dr: 1, cost: 1.414 },
      { dc: -1, dr: 1, cost: 1.414 },
      { dc: 1, dr: -1, cost: 1.414 },
      { dc: -1, dr: -1, cost: 1.414 },
    ];

    let bestNode = startNode;
    let minH = startNode.h;
    let iterations = 0;

    while (openSet.length > 0 && iterations < 3500) {
      iterations++;
      // Get lowest f
      let lowestIdx = 0;
      for (let i = 1; i < openSet.length; i++) {
        if (openSet[i].f < openSet[lowestIdx].f) lowestIdx = i;
      }
      const current = openSet.splice(lowestIdx, 1)[0];
      const key = `${current.c}_${current.r}`;
      closedSet.add(key);

      if (current.h < minH) {
        minH = current.h;
        bestNode = current;
      }

      if (
        (current.c === goalGrid.c && current.r === goalGrid.r) ||
        Math.hypot(current.c - goalGrid.c, current.r - goalGrid.r) <= 1
      ) {
        bestNode = current;
        break;
      }

      for (const n of neighbors) {
        const nc = current.c + n.dc;
        const nr = current.r + n.dr;
        const nKey = `${nc}_${nr}`;

        if (closedSet.has(nKey) || !this.isWalkable(nc, nr)) continue;

        const tentativeG = current.g + n.cost;
        const existing = openSet.find((node) => node.c === nc && node.r === nr);

        if (!existing) {
          const h = Math.hypot(goalGrid.c - nc, goalGrid.r - nr);
          const newNode: Node = {
            c: nc,
            r: nr,
            g: tentativeG,
            h,
            f: tentativeG + h,
            parent: current,
          };
          openSet.push(newNode);
        } else if (tentativeG < existing.g) {
          existing.g = tentativeG;
          existing.f = tentativeG + existing.h;
          existing.parent = current;
        }
      }
    }

    // Reconstruct path
    const path: { x: number; z: number }[] = [];
    let curr: Node | undefined = bestNode;
    while (curr) {
      path.unshift(this.gridToWorld(curr.c, curr.r));
      curr = curr.parent;
    }

    // Replace final point with exact goal
    if (path.length > 0) {
      path[path.length - 1] = { x: goal.x, z: goal.z };
    }

    // Path smoothing (string pulling)
    return this.smoothPath(path);
  }

  private smoothPath(rawPath: { x: number; z: number }[]): { x: number; z: number }[] {
    if (rawPath.length <= 2) return rawPath;
    const smoothed: { x: number; z: number }[] = [rawPath[0]];

    let currentIdx = 0;
    while (currentIdx < rawPath.length - 1) {
      let furthest = currentIdx + 1;
      for (let test = currentIdx + 2; test < rawPath.length; test++) {
        if (this.hasLineOfSight(rawPath[currentIdx], rawPath[test])) {
          furthest = test;
        }
      }
      smoothed.push(rawPath[furthest]);
      currentIdx = furthest;
    }

    return smoothed;
  }

  hasLineOfSight(p1: { x: number; z: number }, p2: { x: number; z: number }): boolean {
    const dist = Math.hypot(p2.x - p1.x, p2.z - p1.z);
    const steps = Math.ceil(dist / (this.gridResolution * 0.75));
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const testX = p1.x + (p2.x - p1.x) * t;
      const testZ = p1.z + (p2.z - p1.z) * t;
      if (isInsideInflatedObstacle(testX, testZ, INFLATION * 0.8)) {
        return false;
      }
    }
    return true;
  }
}

// Global NavGrid Singleton
export const globalNavGrid = new NavGrid();

/**
 * Validates building placement before construction.
 */
export function validateBuildingPlacement(
  center: { x: number; z: number },
  halfWidth: number,
  halfDepth: number
): { valid: boolean; reason?: string } {
  const minCorridorWidth = 1.5;

  for (const fp of Object.values(BUILDING_FOOTPRINTS)) {
    const dx = Math.abs(center.x - fp.center.x);
    const dz = Math.abs(center.z - fp.center.z);

    const otherHw = fp.type === 'circle' ? fp.radius! : fp.halfWidth!;
    const otherHd = fp.type === 'circle' ? fp.radius! : fp.halfDepth!;

    if (dx < halfWidth + otherHw + minCorridorWidth && dz < halfDepth + otherHd + minCorridorWidth) {
      return {
        valid: false,
        reason: `Corridor too narrow with ${fp.name} (requires at least ${minCorridorWidth}m clearance).`,
      };
    }
  }

  // Check surface foundation grading slope
  const sample = getTerrainSample(center.x, center.z);
  if (sample.slopeDeg > 28) {
    return {
      valid: false,
      reason: `Surface slope too steep (${sample.slopeDeg.toFixed(1)}° > 28° foundation grading limit).`,
    };
  }

  return { valid: true };
}

/**
 * Camera collision solver: pushes camera forward away from walls or terrain.
 */
export function resolveCameraCollision(
  pivot: { x: number; y: number; z: number },
  desiredCameraPos: { x: number; y: number; z: number },
  minDistance = 0.6
): { x: number; y: number; z: number } {
  let cx = desiredCameraPos.x;
  let cy = desiredCameraPos.y;
  let cz = desiredCameraPos.z;

  // 1. Terrain collision: keep camera at least 0.5m above ground
  const groundY = getTerrainHeight(cx, cz);
  if (cy < groundY + 0.5) {
    cy = groundY + 0.5;
  }

  // 2. Obstacle collision
  for (const fp of Object.values(BUILDING_FOOTPRINTS)) {
    const d = Math.hypot(cx - fp.center.x, cz - fp.center.z);
    const safeR = (fp.radius || 3.0) + minDistance;
    if (d < safeR && d > 0.001) {
      // Lerp camera toward pivot
      cx = THREE_lerp(cx, pivot.x, 0.4);
      cz = THREE_lerp(cz, pivot.z, 0.4);
    }
  }

  return { x: cx, y: cy, z: cz };
}

function THREE_lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
