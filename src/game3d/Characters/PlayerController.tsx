/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/game3d/Characters/PlayerController.tsx
 * Real-time third-person astronaut controller: WASD movement, sprint, direct interaction [E], and quick astronaut switching [Q, 1-4, Tab].
 */

import React, { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/store.ts';
import { BUILDING_COORDINATES } from '../../sim/rules/crew.ts';
import { BuildingId, CrewId } from '../../sim/types.ts';
import { eventBus } from '../../store/bus.ts';
import { getTerrainHeight, getTerrainSample, resolveMovementCollisions } from '../Physics/TerrainHeight.ts';

const CREW_LIST: CrewId[] = ['alex', 'sara', 'daniel', 'maya'];
const _camForward = new THREE.Vector3();
const _camRight = new THREE.Vector3();
const _moveDir = new THREE.Vector3();
const _WORLD_UP = new THREE.Vector3(0, 1, 0);
const BUILDING_ENTRIES = Object.entries(BUILDING_COORDINATES) as [BuildingId, { x: number; z: number }][];

export const PlayerController: React.FC = () => {
  const { camera } = useThree();

  const activePlayerCrew = useGameStore((s) => s.activePlayerCrew);
  const setActivePlayerCrew = useGameStore((s) => s.setActivePlayerCrew);
  const updateAstronautPosition = useGameStore((s) => s.updateAstronautPosition);
  const setNearbyBuilding = useGameStore((s) => s.setNearbyBuilding);
  const nearbyBuilding = useGameStore((s) => s.nearbyBuilding);
  const setSelectedEntity = useGameStore((s) => s.setSelectedEntity);
  const openTaskMenu = useGameStore((s) => s.openTaskMenu);
  const setShowCrewSwitcher = useGameStore((s) => s.setShowCrewSwitcher);
  const showCrewSwitcher = useGameStore((s) => s.showCrewSwitcher);
  const activeModal = useGameStore((s) => s.activeModal);

  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const currentPos = useRef(new THREE.Vector3(-2, 0, -1));
  const currentRotation = useRef(0);
  const prevNearbyBuilding = useRef<BuildingId | null>(null);

  // Setup keyboard event listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if typing in an input
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      const key = e.key.toLowerCase();
      keysPressed.current[key] = true;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        keysPressed.current['shift'] = true;
      }

      // Astronaut switching shortcuts: 1-4
      if (e.key === '1') setActivePlayerCrew('alex');
      if (e.key === '2') setActivePlayerCrew('sara');
      if (e.key === '3') setActivePlayerCrew('daniel');
      if (e.key === '4') setActivePlayerCrew('maya');

      // Cycle previous astronaut: Q
      if (key === 'q') {
        const currIdx = CREW_LIST.indexOf(activePlayerCrew);
        const prevIdx = (currIdx - 1 + CREW_LIST.length) % CREW_LIST.length;
        setActivePlayerCrew(CREW_LIST[prevIdx]);
      }

      // Toggle astronaut switcher HUD: Tab
      if (key === 'tab') {
        e.preventDefault();
        setShowCrewSwitcher(!showCrewSwitcher);
      }

      // Physical interaction key: E
      if (key === 'e') {
        if (nearbyBuilding && activeModal === 'none') {
          setSelectedEntity(null);
          openTaskMenu(nearbyBuilding);
          eventBus.emit('sound:play', { name: 'click' });
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysPressed.current[key] = false;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        keysPressed.current['shift'] = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [
    activePlayerCrew,
    nearbyBuilding,
    activeModal,
    showCrewSwitcher,
    setActivePlayerCrew,
    setSelectedEntity,
    openTaskMenu,
    setShowCrewSwitcher,
  ]);

  // Sync internal position reference when active astronaut changes
  const prevCrew = useRef(activePlayerCrew);
  useEffect(() => {
    const state = useGameStore.getState();
    const pos = state.astronautPositions[activePlayerCrew];
    if (pos) {
      currentPos.current.set(pos.x, 0, pos.z);
      currentRotation.current = pos.rotation;
    }
    prevCrew.current = activePlayerCrew;
  }, [activePlayerCrew]);

  useFrame((_, delta) => {
    // Only allow WASD movement when no blocking modal is open
    if (activeModal !== 'none') return;

    // Camera planar vectors (ignoring pitch)
    camera.getWorldDirection(_camForward);
    _camForward.y = 0;
    _camForward.normalize();

    _camRight.crossVectors(_camForward, _WORLD_UP).normalize();

    // Direction calculation
    _moveDir.set(0, 0, 0);
    if (keysPressed.current['w'] || keysPressed.current['arrowup']) _moveDir.add(_camForward);
    if (keysPressed.current['s'] || keysPressed.current['arrowdown']) _moveDir.sub(_camForward);
    if (keysPressed.current['d'] || keysPressed.current['arrowright']) _moveDir.add(_camRight);
    if (keysPressed.current['a'] || keysPressed.current['arrowleft']) _moveDir.sub(_camRight);

    const isMoving = _moveDir.lengthSq() > 0.001;

    if (isMoving) {
      _moveDir.normalize();
      const isSprinting = !!keysPressed.current['shift'];
      const speed = isSprinting ? 8.2 : 4.5; // units per second

      // Calculate tentative next step
      const stepDist = speed * delta;
      const tentativeX = currentPos.current.x + _moveDir.x * stepDist;
      const tentativeZ = currentPos.current.z + _moveDir.z * stepDist;

      // 1. Terrain slope and walkability query
      const sample = getTerrainSample(tentativeX, tentativeZ);
      const slopeFactor = sample.slopeDeg > 35 ? 0.05 : sample.slopeDeg > 20 ? 0.6 : 1.0;

      // 2. Obstacle collision resolution (buildings, large boulders)
      const targetX = THREE.MathUtils.clamp(
        currentPos.current.x + _moveDir.x * stepDist * slopeFactor,
        -55,
        55
      );
      const targetZ = THREE.MathUtils.clamp(
        currentPos.current.z + _moveDir.z * stepDist * slopeFactor,
        -55,
        55
      );

      const resolved = resolveMovementCollisions(
        { x: currentPos.current.x, z: currentPos.current.z },
        { x: targetX, z: targetZ }
      );

      // 3. Exact terrain ground height query
      const groundY = getTerrainHeight(resolved.x, resolved.z);
      currentPos.current.set(resolved.x, groundY, resolved.z);

      // Rotate toward movement direction smoothly
      const targetAngle = Math.atan2(_moveDir.x, _moveDir.z);
      currentRotation.current = THREE.MathUtils.lerp(currentRotation.current, targetAngle, 0.25);

      updateAstronautPosition(activePlayerCrew, {
        x: currentPos.current.x,
        y: currentPos.current.y,
        z: currentPos.current.z,
        rotation: currentRotation.current,
      });
    }

    // Proximity check against all 8 base buildings
    let closestBuilding: BuildingId | null = null;
    let minDistance = Infinity;

    for (let i = 0; i < BUILDING_ENTRIES.length; i++) {
      const [bid, coords] = BUILDING_ENTRIES[i];
      const dist = Math.hypot(coords.x - currentPos.current.x, coords.z - currentPos.current.z);
      if (dist <= 4.2 && dist < minDistance) {
        minDistance = dist;
        closestBuilding = bid;
      }
    }

    if (closestBuilding !== prevNearbyBuilding.current) {
      prevNearbyBuilding.current = closestBuilding;
      setNearbyBuilding(closestBuilding);
    }
  });

  return null;
};
