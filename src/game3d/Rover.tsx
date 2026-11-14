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

export const Rover3D: React.FC = () => {
  const rover = useGameStore((s) => s.state.rover);
  const totalTicks = useGameStore((s) => s.state.mission.totalTicks);
  const setSelectedEntity = useGameStore((s) => s.setSelectedEntity);
  const roverRef = useRef<THREE.Group>(null);
  const wheelsRef = useRef<THREE.Mesh[]>([]);
  const radarRef = useRef<THREE.Mesh>(null);

  // Home location: Rover Bay at (0, -16)
  // Sample Site: marked crater point at (26, -28)
  const homePos = new THREE.Vector3(0, 0.4, -16);
  const samplePos = new THREE.Vector3(26, 0.4, -28);

  useFrame((state) => {
    if (!roverRef.current) return;

    if (rover.isAway && rover.returnTick !== undefined) {
      // 6 ticks total duration
      const ticksLeft = Math.max(0, rover.returnTick - totalTicks);
      const progress = 1 - ticksLeft / 6; // 0 to 1

      let currentPos: THREE.Vector3;
      if (progress < 0.5) {
        currentPos = homePos.clone().lerp(samplePos, progress * 2);
        roverRef.current.lookAt(samplePos);
      } else {
        currentPos = samplePos.clone().lerp(homePos, (progress - 0.5) * 2);
        roverRef.current.lookAt(homePos);
      }

      // Precise Ground Surface Elevation & Suspension Bobbing
      const groundY = getTerrainHeight(currentPos.x, currentPos.z);
      const bob = Math.sin(state.clock.getElapsedTime() * 10) * 0.04;
      currentPos.y = groundY + 0.28 + Math.abs(bob);
      roverRef.current.position.copy(currentPos);

      // Pitch and roll rover to align with terrain slope
      const sample = getTerrainSample(currentPos.x, currentPos.z);
      roverRef.current.rotation.x = sample.normal.z * 0.3;
      roverRef.current.rotation.z = -sample.normal.x * 0.3;

      // Rotate wheels
      const wheelSpin = state.clock.getElapsedTime() * 12;
      for (const w of wheelsRef.current) {
        if (w) w.rotation.x = wheelSpin;
      }
    } else {
      roverRef.current.position.copy(homePos);
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
