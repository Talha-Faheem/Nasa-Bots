/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/game3d/CameraRig.tsx
 * Ultra-smooth RTS camera rig with WASD / Arrow pan, zoom, damping, and focus tracking.
 */

import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { eventBus } from '../store/bus.ts';
import { BUILDING_COORDINATES } from '../sim/rules/crew.ts';
import { useGameStore } from '../store/store.ts';

export const CameraRig: React.FC = () => {
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();
  const reducedMotion = useGameStore((s) => s.reducedMotion);
  const activePlayerCrew = useGameStore((s) => s.activePlayerCrew);
  const astronautPositions = useGameStore((s) => s.astronautPositions);

  const targetLookAt = useRef(new THREE.Vector3(0, 1.2, 0));

  useEffect(() => {
    camera.position.set(0, 10, 14);
    camera.lookAt(0, 1.2, 0);

    const unsubFocus = eventBus.on('camera:focus', ({ buildingId, crewId }) => {
      if (buildingId) {
        const coords = BUILDING_COORDINATES[buildingId];
        targetLookAt.current.set(coords.x, 1.2, coords.z);
      } else if (crewId) {
        const pos = useGameStore.getState().astronautPositions[crewId];
        if (pos) targetLookAt.current.set(pos.x, 1.2, pos.z);
      }
    });

    const unsubReset = eventBus.on('camera:reset', () => {
      const pos = useGameStore.getState().astronautPositions[useGameStore.getState().activePlayerCrew];
      if (pos) targetLookAt.current.set(pos.x, 1.2, pos.z);
    });

    return () => {
      unsubFocus();
      unsubReset();
    };
  }, [camera]);

  useFrame(() => {
    if (!controlsRef.current) return;

    // Follow active player astronaut smoothly in third-person
    const pos = astronautPositions[activePlayerCrew] || { x: 0, z: 0 };
    targetLookAt.current.set(pos.x, 1.2, pos.z);

    if (reducedMotion) {
      controlsRef.current.target.copy(targetLookAt.current);
    } else {
      controlsRef.current.target.lerp(targetLookAt.current, 0.12);
    }

    controlsRef.current.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      minDistance={3.5}
      maxDistance={28}
      minPolarAngle={THREE.MathUtils.degToRad(20)}
      maxPolarAngle={THREE.MathUtils.degToRad(75)}
    />
  );
};
