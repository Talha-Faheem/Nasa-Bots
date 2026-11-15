/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/game3d/Rover.tsx
 * Six-wheel lunar rover with animated wheel rotation, terrain suspension bob, and sampling mission pathing.
 */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store/store.ts';
import { eventBus } from '../store/bus.ts';
import { GLTFModel } from './ModelLoader.tsx';
import { getTerrainHeight, getTerrainSample } from './Physics/TerrainHeight.ts';

const HOME_POS = new THREE.Vector3(0, 0.4, -16);
const SAMPLE_POS = new THREE.Vector3(26, 0.4, -28);
const _currentPos = new THREE.Vector3();

export const Rover3D: React.FC = () => {
  const rover = useGameStore((s) => s.state.rover);
  const totalTicks = useGameStore((s) => s.state.mission.totalTicks);
  const setSelectedEntity = useGameStore((s) => s.setSelectedEntity);
  const roverRef = useRef<THREE.Group>(null);
  const wheelsRef = useRef<THREE.Mesh[]>([]);
  const radarRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!roverRef.current) return;

    if (rover.isAway && rover.returnTick !== undefined) {
      // 6 ticks total duration
      const ticksLeft = Math.max(0, rover.returnTick - totalTicks);
      const progress = 1 - ticksLeft / 6; // 0 to 1

      if (progress < 0.5) {
        _currentPos.lerpVectors(HOME_POS, SAMPLE_POS, progress * 2);
        roverRef.current.lookAt(SAMPLE_POS);
      } else {
        _currentPos.lerpVectors(SAMPLE_POS, HOME_POS, (progress - 0.5) * 2);
        roverRef.current.lookAt(HOME_POS);
      }

      // Precise Ground Surface Elevation & Suspension Bobbing
      const groundY = getTerrainHeight(_currentPos.x, _currentPos.z);
      const bob = Math.sin(state.clock.getElapsedTime() * 10) * 0.04;
      _currentPos.y = groundY + 0.28 + Math.abs(bob);
      roverRef.current.position.copy(_currentPos);

      // Pitch and roll rover to align with terrain slope
      const sample = getTerrainSample(_currentPos.x, _currentPos.z);
      roverRef.current.rotation.x = sample.normal.z * 0.3;
      roverRef.current.rotation.z = -sample.normal.x * 0.3;

      // Rotate wheels
      const wheelSpin = state.clock.getElapsedTime() * 12;
      for (const w of wheelsRef.current) {
        if (w) w.rotation.x = wheelSpin;
      }
    } else {
      roverRef.current.position.copy(HOME_POS);
      roverRef.current.rotation.set(0, 0, 0);
    }

    // Spin radar dish
    if (radarRef.current) {
      radarRef.current.rotation.y = state.clock.getElapsedTime() * 2;
    }
  });

  return (
    <group
      ref={roverRef}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedEntity({ type: 'building', id: 'rover_bay' });
        eventBus.emit('sound:play', { name: 'click' });
      }}
    >
      {/* Authentic Science Exploration Rover Model */}
      <GLTFModel
        url="/assets/models/rovers/rover_science.glb"
        scale={0.82}
        position={[0, 0, 0]}
        fallbackGeometry="box"
        fallbackSize={[1.6, 0.8, 2.4]}
        fallbackColor="#e2e8f0"
      />

      {/* Dynamic Headlights */}
      <mesh position={[-0.45, 0.45, -1.2]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.45, 0.45, -1.2]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
};
