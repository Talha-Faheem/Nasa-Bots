/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/game3d/World.tsx
 * Three.js + React Three Fiber 3D world canvas and fixed-timestep accumulator loop.
 */

import React, { useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { Terrain } from './Terrain.tsx';
import { Lighting } from './Lighting.tsx';
import { CameraRig } from './CameraRig.tsx';
import { BuildingMesh } from './Buildings/BuildingMesh.tsx';
import { CrewRoster3D } from './Crew.tsx';
import { Rover3D } from './Rover.tsx';
import { PlayerController } from './Characters/PlayerController.tsx';
import { ColonyInfrastructure } from './ColonyInfrastructure.tsx';
import { DepositMarkers } from './Environment/DepositMarkers.tsx';
import { DebugOverlay } from './DebugOverlay.tsx';
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

// Procedural Earth in the Lunar Sky with atmospheric halo
const EarthInSky: React.FC = () => {
  return (
    <group position={[35, 45, -75]}>
      {/* Earth Sphere */}
      <mesh>
        <sphereGeometry args={[4.2, 32, 32]} />
        <meshStandardMaterial
          color="#1e40af"
          roughness={0.5}
          metalness={0.1}
          emissive="#1e3a8a"
          emissiveIntensity={0.25}
        />
      </mesh>
      {/* Cloud & Continent Swirl Layer */}
      <mesh position={[0, 0, 0.05]}>
        <sphereGeometry args={[4.26, 32, 16]} />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.35}
          roughness={0.8}
        />
      </mesh>
      {/* Atmospheric Rayleigh Glow Ring */}
      <mesh>
        <sphereGeometry args={[4.55, 32, 16]} />
        <meshBasicMaterial
          color="#60a5fa"
          transparent
          opacity={0.15}
          side={THREE.BackSide}
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
        <color attach="background" args={['#03060d']} />
        <fog attach="fog" args={['#03060d', 75, 150]} />

        {/* Procedural deep space starfield */}
        <Stars radius={100} depth={50} count={3500} factor={4} saturation={0} fade speed={0.5} />

        <EarthInSky />
        <Lighting />
        <Terrain />
        <CameraRig />
        <PlayerController />
        <SimAccumulator />

        {/* Authentic 3D Modular Colony Infrastructure & Props */}
        <ColonyInfrastructure />

        {/* In-Situ Lunar Geological Outcrops & Interactive Beacons */}
        <DepositMarkers />

        {/* 8 Outpost Buildings */}
        <BuildingMesh id="habitat" name="Habitat Base" />
        <BuildingMesh id="power_station" name="Solar Power Array" />
        <BuildingMesh id="greenhouse" name="Hydroponic Greenhouse" />
        <BuildingMesh id="recycler" name="Water Recycler" />
        <BuildingMesh id="shelter" name="Radiation Shelter" />
        <BuildingMesh id="laboratory" name="Research Laboratory" />
        <BuildingMesh id="comms" name="Comms Dish" />
        <BuildingMesh id="rover_bay" name="Rover Bay" />

        {/* Dynamic Crew Figures & Rover */}
        <CrewRoster3D />
        <Rover3D />

        {/* F3 Authoritative Debug Visualizer */}
        <DebugOverlay />
      </Canvas>
    </div>
  );
};

