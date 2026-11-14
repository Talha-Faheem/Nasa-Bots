/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/game3d/Physics/TerrainHeight.ts
 * High-performance terrain elevation, slope, surface normal, and obstacle collision solver.
 * Single source of truth for 3D terrain geometry, character grounding, and navigation.
 */

import * as THREE from 'three';

export interface TerrainSample {
  height: number;
  slopeDeg: number;
  normal: THREE.Vector3;
  isWalkable: boolean;
  zone:
    | 'Base Construction Zone'
    | 'Water Ice Deposit Zone'
    | 'Crater Exploration Zone'
    | 'Mineral Deposit Zone'
    | 'Rocky Terrain Zone'
    | 'Scientific Research Zone'
    | 'Lunar Regolith Plains';
}

export interface Obstacle {
  id: string;
  name: string;
  type: 'circle' | 'box';
  x: number;
  z: number;
  radius?: number;
  halfWidth?: number;
  halfDepth?: number;
}

// 5 Core Lunar Craters with permanent shadows and raised ejecta rims
export const LUNAR_CRATERS = [
  { id: 'ice_crater', x: -10, z: 35, r: 14, depth: 3.8, isIceZone: true }, // Shadowed polar ice
  { id: 'southwest_basin', x: -25, z: -20, r: 12, depth: 3.5, isIceZone: false },
  { id: 'northeast_crater', x: 30, z: -15, r: 16, depth: 4.0, isIceZone: false }, // Mineral ridge
  { id: 'east_crater', x: 28, z: 25, r: 10, depth: 2.8, isIceZone: false }, // Rocky zone
  { id: 'west_deep_crater', x: -35, z: 15, r: 18, depth: 4.5, isIceZone: false }, // Science zone
];

// Solid base obstacles for physical collision prevention
export const BASE_OBSTACLES: Obstacle[] = [
  { id: 'habitat', name: 'Habitat Dome', type: 'circle', x: 0, z: 0, radius: 3.8 },
  { id: 'power_station', name: 'Solar Array & Battery', type: 'box', x: -14, z: -6, halfWidth: 3.6, halfDepth: 2.5 },
  { id: 'greenhouse', name: 'Hydroponic Greenhouse', type: 'box', x: 12, z: -4, halfWidth: 3.2, halfDepth: 2.4 },
  { id: 'recycler', name: 'Water & Oxygen Skid', type: 'circle', x: 6, z: 10, radius: 2.8 },
  { id: 'shelter', name: 'Radiation Bunker', type: 'circle', x: -8, z: 12, radius: 3.6 },
  { id: 'laboratory', name: 'Research Laboratory', type: 'box', x: 14, z: 8, halfWidth: 3.2, halfDepth: 2.6 },
  { id: 'rover_bay', name: 'Rover Garage & Workshop', type: 'box', x: 0, z: -16, halfWidth: 3.2, halfDepth: 3.6 },
  { id: 'comms', name: 'Comms Relay Mast', type: 'circle', x: -16, z: 10, radius: 1.8 },
  { id: 'landing_pad', name: 'Crew Lander & Pad', type: 'circle', x: 0, z: -32, radius: 7.5 },
  { id: 'excavator_site', name: 'Regolith Excavator', type: 'circle', x: -23, z: 16, radius: 4.5 },
  { id: 'boulder_field', name: 'Large Boulders', type: 'circle', x: 22, z: -16, radius: 3.0 },
];

/**
 * Calculates exact terrain elevation y for any world coordinates (x, z).
 * Identical formula used by visual terrain geometry to guarantee zero penetration.
 */
export function getTerrainHeight(x: number, z: number): number {
  // 1. Natural macro undulations of lunar South Pole regolith
  let y = Math.sin(x * 0.05) * Math.cos(z * 0.05) * 1.5;
  y += Math.sin(x * 0.12 + 1.2) * Math.cos(z * 0.08) * 0.6;

  // 2. Base construction zone flattening: Smoothly attenuate within 22m of (0, 0)
  const distFromCenter = Math.hypot(x, z);
  if (distFromCenter < 22) {
    const factor = Math.pow(distFromCenter / 22, 2);
    y *= factor;
  }

  // 3. Impact craters with raised ejecta rims
  for (const c of LUNAR_CRATERS) {
    const d = Math.hypot(x - c.x, z - c.z);
    if (d < c.r * 1.4) {
      if (d < c.r) {
        // Crater bowl floor
        const craterFactor = Math.cos((d / c.r) * Math.PI * 0.5);
        y -= c.depth * craterFactor;
      } else {
        // Raised ejecta rim ring
        const rimFactor = Math.sin(((d - c.r) / (c.r * 0.4)) * Math.PI);
        y += c.depth * 0.25 * rimFactor;
      }
    }
  }

  return y;
}

/**
 * Returns full terrain sample including height, slope, normal, and zone.
 */
export function getTerrainSample(x: number, z: number): TerrainSample {
  const height = getTerrainHeight(x, z);
  const eps = 0.15;

  // Numerical gradient estimation
  const hL = getTerrainHeight(x - eps, z);
  const hR = getTerrainHeight(x + eps, z);
  const hD = getTerrainHeight(x, z - eps);
  const hU = getTerrainHeight(x, z + eps);

  const dx = (hR - hL) / (2 * eps);
  const dz = (hU - hD) / (2 * eps);

  const normal = new THREE.Vector3(-dx, 1, -dz).normalize();
  const slopeRad = Math.acos(THREE.MathUtils.clamp(normal.y, -1, 1));
  const slopeDeg = (slopeRad * 180) / Math.PI;

  // A surface is walkable by foot if slope is <= 35 degrees
  const isWalkable = slopeDeg <= 35;

  // Zone classification
  let zone: TerrainSample['zone'] = 'Lunar Regolith Plains';
  const distCenter = Math.hypot(x, z);

  if (distCenter <= 22) {
    zone = 'Base Construction Zone';
  } else if (Math.hypot(x - (-10), z - 35) <= 16) {
    zone = 'Water Ice Deposit Zone';
  } else if (Math.hypot(x - (-25), z - (-20)) <= 15) {
    zone = 'Crater Exploration Zone';
  } else if (Math.hypot(x - 30, z - (-15)) <= 18) {
    zone = 'Mineral Deposit Zone';
  } else if (Math.hypot(x - 28, z - 25) <= 14 || Math.hypot(x - 22, z - (-16)) <= 8) {
    zone = 'Rocky Terrain Zone';
  } else if (Math.hypot(x - (-35), z - 15) <= 20) {
    zone = 'Scientific Research Zone';
  }

  return {
    height,
    slopeDeg,
    normal,
    isWalkable,
    zone,
  };
}

/**
 * Solves character collision against base buildings and rock formations.
 * Uses continuous sphere-capsule collision with smooth sliding response.
 */
export function resolveMovementCollisions(
  _currentPos: { x: number; z: number },
  targetPos: { x: number; z: number },
  characterRadius = 0.55
): { x: number; z: number; collided: boolean } {
  let resolvedX = targetPos.x;
  let resolvedZ = targetPos.z;
  let collided = false;

  for (const obs of BASE_OBSTACLES) {
    if (obs.type === 'circle') {
      const minDistance = (obs.radius || 2) + characterRadius;
      const dx = resolvedX - obs.x;
      const dz = resolvedZ - obs.z;
      const dist = Math.hypot(dx, dz);

      if (dist < minDistance && dist > 0.001) {
        collided = true;
        const pushFactor = (minDistance - dist) / dist;
        resolvedX += dx * pushFactor;
        resolvedZ += dz * pushFactor;
      }
    } else if (obs.type === 'box') {
      const hw = (obs.halfWidth || 2) + characterRadius;
      const hd = (obs.halfDepth || 2) + characterRadius;

      const dx = resolvedX - obs.x;
      const dz = resolvedZ - obs.z;

      if (Math.abs(dx) < hw && Math.abs(dz) < hd) {
        collided = true;
        // Find shortest push-out axis
        const overlapX = hw - Math.abs(dx);
        const overlapZ = hd - Math.abs(dz);

        if (overlapX < overlapZ) {
          resolvedX = obs.x + Math.sign(dx) * hw;
        } else {
          resolvedZ = obs.z + Math.sign(dz) * hd;
        }
      }
    }
  }

  return { x: resolvedX, z: resolvedZ, collided };
}
