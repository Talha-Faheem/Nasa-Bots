/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/game3d/Crew.tsx
 * Low-poly astronauts with direct player WASD control, autonomous working animations, held tools, stamina rings, and selection halos.
 */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { CrewId } from '../sim/types.ts';
import { BUILDING_COORDINATES, getCrewDisplayName } from '../sim/rules/crew.ts';
import { useGameStore } from '../store/store.ts';
import { eventBus } from '../store/bus.ts';

const SUIT_ACCENTS: Record<CrewId, string> = {
  alex: '#3b82f6', // Systems Blue
  sara: '#10b981', // Biology Green
  daniel: '#f59e0b', // Commander Gold
  maya: '#ec4899', // Medical Rose
};

const CREW_OFFSETS: Record<CrewId, [number, number]> = {
  alex: [-1.4, -1.0],
  sara: [1.4, -1.0],
  daniel: [-1.4, 1.0],
  maya: [1.4, 1.0],
};

export const CrewFigure: React.FC<{ id: CrewId }> = ({ id }) => {
  const crew = useGameStore((s) => s.state.crew[id]);
  const activePlayerCrew = useGameStore((s) => s.activePlayerCrew);
  const astronautPositions = useGameStore((s) => s.astronautPositions);
  const setSelectedEntity = useGameStore((s) => s.setSelectedEntity);
  const selectedEntity = useGameStore((s) => s.selectedEntity);
  const setActivePlayerCrew = useGameStore((s) => s.setActivePlayerCrew);
  const reducedMotion = useGameStore((s) => s.reducedMotion);
  const activeModal = useGameStore((s) => s.activeModal);

  const groupRef = useRef<THREE.Group>(null);
  const visualRotRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  const toolRef = useRef<THREE.Group>(null);

  // Smooth position interpolation
  const visualPos = useRef(new THREE.Vector3(0, 0, 0));
  const prevPos = useRef(new THREE.Vector3(0, 0, 0));

  const isPlayerControlled = activePlayerCrew === id;

  useFrame((state) => {
    if (!groupRef.current) return;

    let targetX = 0;
    let targetZ = 0;
    let targetRot = 0;

    if (isPlayerControlled) {
      // Position is driven directly by PlayerController in real-time
      const realPos = astronautPositions[id] || { x: 0, z: 0, rotation: 0 };
      targetX = realPos.x;
      targetZ = realPos.z;
      targetRot = realPos.rotation;
    } else {
      // Autonomous astronaut: stay at workstation or base location
      const offset = CREW_OFFSETS[id];
      if (crew.currentTask) {
        const bCoords = BUILDING_COORDINATES[crew.currentTask.buildingId] ?? { x: 0, z: 0 };
        targetX = bCoords.x + offset[0] * 1.1;
        targetZ = bCoords.z + offset[1] * 1.1;
        // Face toward building center
        targetRot = Math.atan2(-offset[0], -offset[1]);
      } else {
        const locKey =
          crew.location === 'transit' || crew.location === 'surface'
            ? 'habitat'
            : crew.location;
        const bCoords = BUILDING_COORDINATES[locKey] ?? { x: 0, z: 0 };
        targetX = bCoords.x + offset[0] * 1.4;
        targetZ = bCoords.z + offset[1] * 1.4;
        targetRot = 0;
      }
    }

    prevPos.current.copy(visualPos.current);

    // Smooth movement interpolation
    const lerpFactor = isPlayerControlled ? 0.35 : 0.08;
    visualPos.current.x = THREE.MathUtils.lerp(visualPos.current.x, targetX, lerpFactor);
    visualPos.current.z = THREE.MathUtils.lerp(visualPos.current.z, targetZ, lerpFactor);

    const moveDx = visualPos.current.x - prevPos.current.x;
    const moveDz = visualPos.current.z - prevPos.current.z;
    const isMoving = Math.hypot(moveDx, moveDz) > 0.003;
    const isWorking = !!crew.currentTask && !isMoving;

    // Body rotation
    if (visualRotRef.current) {
      if (isPlayerControlled) {
        visualRotRef.current.rotation.y = THREE.MathUtils.lerp(
          visualRotRef.current.rotation.y,
          targetRot,
          0.3
        );
      } else if (isMoving) {
        const moveAngle = Math.atan2(moveDx, moveDz);
        visualRotRef.current.rotation.y = THREE.MathUtils.lerp(
          visualRotRef.current.rotation.y,
          moveAngle,
          0.2
        );
      } else {
        visualRotRef.current.rotation.y = THREE.MathUtils.lerp(
          visualRotRef.current.rotation.y,
          targetRot,
          0.1
        );
      }
    }

    // Procedural Animations: Walk, Run, Work, Idle
    if (!reducedMotion) {
      const clockTime = state.clock.getElapsedTime();

      if (isMoving) {
        const t = clockTime * 11;
        visualPos.current.y = Math.abs(Math.sin(t)) * 0.14; // Footstep bounce
        if (leftLegRef.current && rightLegRef.current) {
          leftLegRef.current.rotation.x = Math.sin(t) * 0.7;
          rightLegRef.current.rotation.x = -Math.sin(t) * 0.7;
        }
        if (leftArmRef.current && rightArmRef.current) {
          leftArmRef.current.rotation.x = -Math.sin(t) * 0.55;
          rightArmRef.current.rotation.x = Math.sin(t) * 0.55;
        }
      } else if (isWorking) {
        visualPos.current.y = 0;
        const taskType = crew.currentTask?.type;

        if (taskType === 'minor_repair' || taskType === 'major_repair') {
          // Kneeling / bending repair motion
          const wt = clockTime * 6;
          if (leftArmRef.current && rightArmRef.current) {
            leftArmRef.current.rotation.x = -1.4 + Math.sin(wt) * 0.35;
            rightArmRef.current.rotation.x = -1.3 - Math.sin(wt) * 0.35;
          }
        } else if (taskType === 'plant_crop' || taskType === 'tend_crop') {
          // Gardening / tending motion
          const gt = clockTime * 3.5;
          if (leftArmRef.current && rightArmRef.current) {
            leftArmRef.current.rotation.x = -1.2 + Math.sin(gt) * 0.2;
            rightArmRef.current.rotation.x = -1.2 - Math.sin(gt) * 0.2;
          }
        } else if (taskType === 'research' || taskType === 'run_experiment') {
          // Holding data tablet
          if (leftArmRef.current && rightArmRef.current) {
            leftArmRef.current.rotation.x = -1.1;
            rightArmRef.current.rotation.x = -1.1;
          }
        } else {
          // General inspection motion
          const it = clockTime * 2.5;
          if (leftArmRef.current && rightArmRef.current) {
            leftArmRef.current.rotation.x = -0.8 + Math.sin(it) * 0.25;
            rightArmRef.current.rotation.x = -0.8;
          }
        }
      } else {
        // Natural idle breathing
        const bt = clockTime * 2.2;
        visualPos.current.y = Math.sin(bt) * 0.02;
        if (leftLegRef.current && rightLegRef.current) {
          leftLegRef.current.rotation.x = 0;
          rightLegRef.current.rotation.x = 0;
        }
        if (leftArmRef.current && rightArmRef.current) {
          leftArmRef.current.rotation.x = Math.sin(bt) * 0.05;
          rightArmRef.current.rotation.x = -Math.sin(bt) * 0.05;
        }
      }
    }

    groupRef.current.position.copy(visualPos.current);
  });

  const accent = SUIT_ACCENTS[id];

  // Stamina ring color
  let ringColor = '#22c55e';
  if (crew.exposure >= 60 || crew.stamina <= 1) {
    ringColor = '#ef4444';
  } else if (crew.exposure >= 30 || crew.stamina <= 3) {
    ringColor = '#f59e0b';
  }

  return (
    <group
      ref={groupRef}
      onClick={(e) => {
        e.stopPropagation();
        setActivePlayerCrew(id);
        setSelectedEntity({ type: 'crew', id });
        eventBus.emit('sound:play', { name: 'click' });
      }}
    >
      {/* Player Spotlight Aura under active astronaut */}
      {isPlayerControlled && (
        <group position={[0, 0.05, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[1.1, 28]} />
            <meshBasicMaterial color="#36C5F0" transparent opacity={0.35} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.05, 1.15, 28]} />
            <meshBasicMaterial color="#36C5F0" />
          </mesh>
        </group>
      )}

      {/* Stamina & Radiation Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <ringGeometry args={[0.55, 0.72, 24]} />
        <meshBasicMaterial color={ringColor} side={THREE.DoubleSide} />
      </mesh>

      {/* Rotating figure body */}
      <group ref={visualRotRef}>
        {/* White Extravehicular Mobility Suit (EMU) Body */}
        <mesh position={[0, 0.9, 0]} castShadow>
          <capsuleGeometry args={[0.3, 0.6, 8, 16]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.35} metalness={0.1} />
        </mesh>

        {/* Mission Role Chest Accent Stripe */}
        <mesh position={[0, 1.0, 0.22]}>
          <boxGeometry args={[0.34, 0.32, 0.08]} />
          <meshStandardMaterial color={accent} roughness={0.3} />
        </mesh>

        {/* Portable Life Support System (PLSS) Backpack */}
        <mesh position={[0, 0.95, -0.28]} castShadow>
          <boxGeometry args={[0.4, 0.58, 0.24]} />
          <meshStandardMaterial color="#475569" metalness={0.6} roughness={0.35} />
        </mesh>

        {/* Extravehicular Visor Helmet with Gold Solar Reflection Shield */}
        <mesh position={[0, 1.5, 0]} castShadow>
          <sphereGeometry args={[0.32, 16, 16]} />
          <meshStandardMaterial color="#ffffff" roughness={0.2} />
        </mesh>
        <mesh position={[0, 1.5, 0.16]}>
          <sphereGeometry args={[0.22, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.45]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.95} roughness={0.05} />
        </mesh>

        {/* Left and Right Legs */}
        <mesh ref={leftLegRef} position={[-0.16, 0.32, 0]} castShadow>
          <capsuleGeometry args={[0.1, 0.42, 6, 8]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>
        <mesh ref={rightLegRef} position={[0.16, 0.32, 0]} castShadow>
          <capsuleGeometry args={[0.1, 0.42, 6, 8]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>

        {/* Left and Right Arms */}
        <mesh ref={leftArmRef} position={[-0.38, 1.0, 0]} castShadow>
          <capsuleGeometry args={[0.08, 0.38, 6, 8]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>
        <mesh ref={rightArmRef} position={[0.38, 1.0, 0]} castShadow>
          <capsuleGeometry args={[0.08, 0.38, 6, 8]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>

        {/* Dynamic Held Tool / Equipment when working */}
        {crew.currentTask && (
          <group ref={toolRef} position={[0.3, 0.85, 0.35]}>
            {crew.currentTask.type === 'minor_repair' || crew.currentTask.type === 'major_repair' ? (
              // Welding/Repair Torch Tool
              <mesh rotation={[0.4, 0, 0]}>
                <cylinderGeometry args={[0.03, 0.04, 0.35, 8]} />
                <meshStandardMaterial color="#f59e0b" metalness={0.8} />
              </mesh>
            ) : crew.currentTask.type === 'plant_crop' || crew.currentTask.type === 'tend_crop' ? (
              // Hydroponic Greenery Pod
              <mesh position={[0, 0, 0]}>
                <sphereGeometry args={[0.12, 8, 8]} />
                <meshStandardMaterial color="#22c55e" roughness={0.8} />
              </mesh>
            ) : (
              // Holographic Science Data Pad
              <mesh rotation={[-0.4, 0, 0]}>
                <boxGeometry args={[0.26, 0.02, 0.36]} />
                <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.6} />
              </mesh>
            )}
          </group>
        )}
      </group>

      {/* Floating Status Tag above astronaut (Hidden when a modal dialog or drawer is open) */}
      {activeModal === 'none' && !selectedEntity && (
        <Html
          position={[0, 2.15, 0]}
          distanceFactor={22}
          center
          zIndexRange={[5, 0]}
          className="pointer-events-none select-none"
        >
          <div
            className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-lg transition-transform ${
              isPlayerControlled
                ? 'bg-[#36C5F0] text-[#080E19] ring-2 ring-white scale-110 font-black shadow-[#36C5F0]/40'
                : 'bg-[#080E19]/90 text-slate-200 border border-[#293A50]'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent }} />
            <span>{getCrewDisplayName(crew).shortName}</span>
            <span className="font-mono">({crew.stamina}h)</span>
            {crew.currentTask && <span className="animate-pulse">⚡</span>}
            {isPlayerControlled && <span className="text-[9px] font-black uppercase tracking-wider">[ACTIVE]</span>}
          </div>
        </Html>
      )}
    </group>
  );
};

export const CrewRoster3D: React.FC = () => {
  return (
    <group>
      <CrewFigure id="alex" />
      <CrewFigure id="sara" />
      <CrewFigure id="daniel" />
      <CrewFigure id="maya" />
    </group>
  );
};
