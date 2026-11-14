/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/game3d/World.tsx
 * Three.js + React Three Fiber 3D world canvas and fixed-timestep accumulator loop.
 */

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { Terrain } from './Terrain.tsx';
import { Lighting } from './Lighting.tsx';
import { CameraRig } from './CameraRig.tsx';
import { BuildingMesh } from './Buildings/BuildingMesh.tsx';
import { CrewRoster3D } from './Crew.tsx';
import { Rover3D } from './Rover.tsx';
import { PlayerController } from './Characters/PlayerController.tsx';
import { useGameStore } from '../store/store.ts';

// Fixed-timestep simulation accumulator component inside R3F Canvas
const SimAccumulator: React.FC = () => {
  const advanceTick = useGameStore((s) => s.advanceTick);
  const speed = useGameStore((s) => s.state.mission.speed);
  const isPaused = useGameStore((s) => s.state.mission.isPaused);

  const accumulator = useRef(0);
  const SECONDS_PER_TICK = 1.25; // 24 ticks = 30s per day at 1x speed

  useFrame((_, delta) => {
    if (isPaused || speed === 0) return;

    // Advance simulation accumulator by delta * speed
    accumulator.current += delta * speed;

    while (accumulator.current >= SECONDS_PER_TICK) {
      accumulator.current -= SECONDS_PER_TICK;
      advanceTick();
    }
  });

  return null;
};

// Procedural Earth in the Lunar Sky
const EarthInSky: React.FC = () => {
  return (
    <group position={[35, 45, -75]}>
      {/* Earth Sphere */}
      <mesh>
        <sphereGeometry args={[4.2, 32, 32]} />
        <meshStandardMaterial
          color="#2563eb"
          roughness={0.6}
          metalness={0.1}
          emissive="#1d4ed8"
          emissiveIntensity={0.2}
        />
      </mesh>
      {/* Cloud & Land Swirl Layers */}
      <mesh position={[0, 0, 0.05]}>
        <sphereGeometry args={[4.26, 32, 16]} />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.35}
          roughness={0.8}
        />
      </mesh>
    </group>
  );
};

export const World: React.FC = () => {
  return (
    <div className="w-full h-full absolute inset-0 bg-black z-0 isolate">
      <Canvas
        shadows
        gl={{ antialias: true, alpha: false }}
        camera={{ position: [0, 24, 28], fov: 45 }}
      >
        <color attach="background" args={['#050811']} />
        <fog attach="fog" args={['#050811', 30, 110]} />

        {/* Procedural deep space starfield */}
        <Stars radius={100} depth={50} count={3500} factor={4} saturation={0} fade speed={0.5} />

        <EarthInSky />
        <Lighting />
        <Terrain />
        <CameraRig />
        <PlayerController />
        <SimAccumulator />

        {/* 8 Outpost Buildings */}
        <BuildingMesh id="habitat" name="Habitat Base" icon="🏠" />
        <BuildingMesh id="power_station" name="Solar Power Array" icon="⚡" />
        <BuildingMesh id="greenhouse" name="Hydroponic Greenhouse" icon="🌱" />
        <BuildingMesh id="recycler" name="Water Recycler" icon="💧" />
        <BuildingMesh id="shelter" name="Radiation Shelter" icon="☢️" />
        <BuildingMesh id="laboratory" name="Research Laboratory" icon="🔬" />
        <BuildingMesh id="comms" name="Comms Dish" icon="📡" />
        <BuildingMesh id="rover_bay" name="Rover Bay" icon="🚜" />

        {/* Dynamic Crew Figures & Rover */}
        <CrewRoster3D />
        <Rover3D />
      </Canvas>
    </div>
  );
};

