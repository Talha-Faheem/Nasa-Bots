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

      // Suspension bobbing along lunar regolith
      const bob = Math.sin(state.clock.getElapsedTime() * 10) * 0.05;
      currentPos.y += Math.abs(bob);
      roverRef.current.position.copy(currentPos);

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
      {/* Headlights */}
      <mesh position={[-0.5, 0.45, -1.2]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.5, 0.45, -1.2]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Rotating Radar Dish */}
      <mesh ref={radarRef} position={[-0.4, 1.5, 0.2]}>
        <coneGeometry args={[0.25, 0.12, 12]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.6} />
      </mesh>
      {/* Rover Chassis */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.6, 2.4]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.4} roughness={0.5} />
      </mesh>

      {/* Sensor Mast & Science Camera */}
      <mesh position={[0.4, 1.2, -0.6]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 1.0, 8]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      <mesh position={[0.4, 1.7, -0.6]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.5} />
      </mesh>

      {/* Sample Container Box */}
      <mesh position={[0, 0.9, 0.5]} castShadow>
        <boxGeometry args={[1.2, 0.4, 0.8]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.3} />
      </mesh>

      {/* Six Articulated Wheels */}
      {[-0.9, 0.9].map((xSide, i) =>
        [-0.8, 0, 0.8].map((zPos, j) => (
          <mesh
            key={`${i}-${j}`}
            ref={(el) => {
              if (el) wheelsRef.current[i * 3 + j] = el;
            }}
            position={[xSide, 0.3, zPos]}
            rotation={[0, 0, Math.PI / 2]}
            castShadow
          >
            <cylinderGeometry args={[0.3, 0.3, 0.22, 16]} />
            <meshStandardMaterial color="#1e293b" roughness={0.9} />
          </mesh>
        ))
      )}
    </group>
  );
};
