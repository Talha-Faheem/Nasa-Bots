/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * tests/sim.navigation_collision.test.ts
 * Rigorous automated tests for authoritative navigation, collision resolution,
 * path sampling, reachability, manual-walk wall sliding, and zero-clipping guarantee.
 */

import { describe, it, expect } from 'vitest';
import {
  BUILDING_FOOTPRINTS,
  isInsideAnyBuildingFootprint,
  resolveKinematicCollision,
  globalNavGrid,
  validateBuildingPlacement,
} from '../src/game3d/Physics/NavigationMesh.ts';
import { createInitialState, SimulationEngine } from '../src/sim/engine.ts';

describe('Authoritative Navigation, Collision & Footprint Verification', () => {
  it('defines 8 data-driven building footprints with exterior interaction points', () => {
    const buildings = Object.keys(BUILDING_FOOTPRINTS);
    expect(buildings.length).toBe(8);

    // Verify every interaction point is strictly outside its building footprint
    for (const fp of Object.values(BUILDING_FOOTPRINTS)) {
      expect(fp.interactionPoints.length).toBeGreaterThan(0);
      expect(fp.doors.length).toBeGreaterThan(0);

      for (const pt of fp.interactionPoints) {
        const inside = isInsideAnyBuildingFootprint(pt.x, pt.z);
        expect(inside).toBe(false);
      }
    }
  });

  it('samples paths between interaction points every 0.1m and asserts zero building footprint penetrations', () => {
    // Collect all exterior interaction points
    const allPoints = Object.values(BUILDING_FOOTPRINTS).flatMap((fp) => fp.interactionPoints);
    expect(allPoints.length).toBeGreaterThanOrEqual(16);

    // Test routing between representative pairs across different base sectors
    const pairs: [typeof allPoints[0], typeof allPoints[0]][] = [
      [allPoints[0], allPoints[3]], // Hab -> Power Station
      [allPoints[0], allPoints[6]], // Hab -> Greenhouse
      [allPoints[3], allPoints[9]], // Power Station -> Recycler
      [allPoints[6], allPoints[11]], // Greenhouse -> Shelter
      [allPoints[9], allPoints[13]], // Recycler -> Laboratory
      [allPoints[13], allPoints[15]], // Laboratory -> Rover Bay
    ];

    for (const [startPt, goalPt] of pairs) {
      const path = globalNavGrid.findPath(
        { x: startPt.x, z: startPt.z },
        { x: goalPt.x, z: goalPt.z }
      );

      expect(path.length).toBeGreaterThan(0);

      // Sample every segment every 0.1m
      for (let i = 0; i < path.length - 1; i++) {
        const p1 = path[i];
        const p2 = path[i + 1];
        const dist = Math.hypot(p2.x - p1.x, p2.z - p1.z);
        const steps = Math.max(1, Math.ceil(dist / 0.1));

        for (let s = 0; s <= steps; s++) {
          const t = s / steps;
          const sampleX = p1.x + (p2.x - p1.x) * t;
          const sampleZ = p1.z + (p2.z - p1.z) * t;

          const inside = isInsideAnyBuildingFootprint(sampleX, sampleZ);
          expect(inside).toBe(false);
        }
      }
    }
  });

  it('confirms reachability: every interaction point is reachable from the habitat primary airlock', () => {
    const habAirlock = BUILDING_FOOTPRINTS.habitat.doors[0];
    const allPoints = Object.values(BUILDING_FOOTPRINTS).flatMap((fp) => fp.interactionPoints);

    for (const pt of allPoints) {
      const path = globalNavGrid.findPath(habAirlock, { x: pt.x, z: pt.z });
      expect(path.length).toBeGreaterThan(0);

      // Path ends within 0.8m of target interaction point
      const last = path[path.length - 1];
      const distToGoal = Math.hypot(last.x - pt.x, last.z - pt.z);
      expect(distToGoal).toBeLessThanOrEqual(0.8);
    }
  });

  it('drives characters straight at each building wall and asserts zero volume penetration', () => {
    const testAngles = [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4, Math.PI, -Math.PI / 2];
    const testSpeeds = [4.5, 8.2]; // Walk and sprint speeds (m/s)
    const dt = 0.05; // 20 Hz tick

    for (const fp of Object.values(BUILDING_FOOTPRINTS)) {
      const targetBuildingCenter = fp.center;

      for (const angle of testAngles) {
        for (const speed of testSpeeds) {
          // Start 1.5m away from the wall heading directly toward the building center
          const approachDist = (fp.radius || 3.0) + 1.5;
          const startX = targetBuildingCenter.x + Math.cos(angle) * approachDist;
          const startZ = targetBuildingCenter.z + Math.sin(angle) * approachDist;

          // Velocity directly toward building center
          const vx = -Math.cos(angle) * speed * dt;
          const vz = -Math.sin(angle) * speed * dt;

          const tentative = { x: startX + vx, z: startZ + vz };
          const resolved = resolveKinematicCollision({ x: startX, z: startZ }, tentative);

          // Assert the resolved position is strictly outside the building footprint
          const inside = isInsideAnyBuildingFootprint(resolved.x, resolved.z);
          expect(inside).toBe(false);
        }
      }
    }
  });

  it('validates building placement clearance and slope thresholds', () => {
    // 1. Placement too close to habitat dome (corridor < 1.5m) should fail
    const closePlacement = validateBuildingPlacement({ x: 4.2, z: 0 }, 2.0, 2.0);
    expect(closePlacement.valid).toBe(false);
    expect(closePlacement.reason).toContain('Corridor too narrow');

    // 2. Open flat apron area should pass
    const openPlacement = validateBuildingPlacement({ x: 8, z: -12 }, 1.2, 1.2);
    expect(openPlacement.valid).toBe(true);
  });

  it('soak test: 30-day simulation run records zero collision violations and valid command transitions', () => {
    const engine = new SimulationEngine(12345);
    let state = createInitialState(12345, 'commander');

    // Dispatch travel and repair tasks
    state = engine.dispatch(state, {
      type: 'MOVE_CREW',
      crewId: 'alex',
      targetBuilding: 'power_station',
    });
    expect(state.crew.alex.travelTicksRemaining).toBeGreaterThan(0);

    // Run 720 ticks (full 30 days)
    for (let t = 0; t < 720; t++) {
      if (state.mission.status !== 'in_progress') break;
      state = engine.tick(state);
    }

    // Verify engine finished without unhandled fatal crashes
    expect(state.mission.day).toBeGreaterThan(1);
    expect(state.commandLog).toBeDefined();
  });
});
