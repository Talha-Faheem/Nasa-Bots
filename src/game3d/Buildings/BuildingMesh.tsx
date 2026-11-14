/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/game3d/Buildings/BuildingMesh.tsx
 * Highly interactive 3D buildings with growing greenhouse crops, animated comms dishes, fluid levels, and live hover telemetry.
 */

import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { BuildingId } from '../../sim/types.ts';
import { BUILDING_COORDINATES } from '../../sim/rules/crew.ts';
import { useGameStore } from '../../store/store.ts';
import { eventBus } from '../../store/bus.ts';

interface BuildingProps {
  id: BuildingId;
  name: string;
  icon: string;
}

export const BuildingMesh: React.FC<BuildingProps> = ({ id, name, icon }) => {
  const [hovered, setHovered] = useState(false);
  const selectedBuilding = useGameStore((s) => s.selectedBuilding);
  const setSelectedEntity = useGameStore((s) => s.setSelectedEntity);
  const activeModal = useGameStore((s) => s.activeModal);
  const selectedEntity = useGameStore((s) => s.selectedEntity);
  const activeNavTab = useGameStore((s) => s.activeNavTab);

  const state = useGameStore((s) => s.state);
  const coords = BUILDING_COORDINATES[id];
  const isSelected = selectedBuilding === id;

  const dishRef = useRef<THREE.Group>(null);
  const beaconRef = useRef<THREE.Mesh>(null);

  // Animated elements inside useFrame
  useFrame((stateFrame) => {
    const t = stateFrame.clock.getElapsedTime();

    // Rotate comms dish slowly
    if (id === 'comms' && dishRef.current) {
      dishRef.current.rotation.y = Math.sin(t * 0.4) * 0.4;
    }

    // Pulse beacon light
    if (beaconRef.current) {
      const scale = 1 + Math.sin(t * 3) * 0.15;
      beaconRef.current.scale.set(scale, scale, scale);
    }
  });

  // Determine system condition & status color
  let condition = 100;
  let isFaulted = false;
  if (id === 'power_station') {
    condition = state.systems.solarArray.condition;
    isFaulted = state.systems.solarArray.isFaulted;
  } else if (id === 'habitat') {
    condition = state.systems.lifeSupport.condition;
    isFaulted = state.systems.lifeSupport.isFaulted;
  } else if (id === 'recycler') {
    condition = state.systems.recycler.condition;
    isFaulted = state.systems.recycler.isFaulted;
  } else if (id === 'greenhouse') {
    condition = state.systems.greenhouse.condition;
    isFaulted = state.systems.greenhouse.isFaulted;
  } else if (id === 'comms') {
    condition = state.systems.comms.condition;
    isFaulted = state.systems.comms.isFaulted;
  } else if (id === 'rover_bay') {
    condition = state.rover.condition;
    isFaulted = state.rover.isFaulted;
  }

  let statusColor = '#22c55e'; // Green
  if (isFaulted || condition < 25) {
    statusColor = '#ef4444'; // Red
  } else if (condition < 50) {
    statusColor = '#eab308'; // Yellow
  }

  const isAdvisoryActive =
    id === 'shelter' && state.radiationAdvisory && !state.radiationAdvisory.resolved;

  return (
    <group
      position={[coords.x, 0, coords.z]}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedEntity({ type: 'building', id });
        eventBus.emit('sound:play', { name: 'click' });
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      {/* Selection Ground Decal / Ring */}
      {isSelected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
          <ringGeometry args={[3.8, 4.4, 32]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Hover Outline Aura */}
      {hovered && !isSelected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
          <ringGeometry args={[3.8, 4.2, 32]} />
          <meshBasicMaterial color="#94a3b8" transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Visual Building Geometries */}
      {id === 'habitat' && (
        <group>
          {/* Main Dome */}
          <mesh position={[0, 2.2, 0]} castShadow receiveShadow>
            <sphereGeometry args={[3.2, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
            <meshStandardMaterial
              color={isSelected ? '#38bdf8' : hovered ? '#f1f5f9' : '#e2e8f0'}
              roughness={0.25}
              metalness={0.2}
            />
          </mesh>
          {/* Base Rim */}
          <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[3.4, 3.6, 0.8, 32]} />
            <meshStandardMaterial color="#334155" roughness={0.7} />
          </mesh>
          {/* Airlock Tunnel */}
          <mesh position={[0, 0.7, 3.4]} castShadow receiveShadow>
            <boxGeometry args={[1.6, 1.4, 1.8]} />
            <meshStandardMaterial color="#475569" roughness={0.5} />
          </mesh>
        </group>
      )}

      {id === 'power_station' && (
        <group>
          {/* Battery Hub Box */}
          <mesh position={[0, 1.0, 0]} castShadow receiveShadow>
            <boxGeometry args={[3.0, 2.0, 3.0]} />
            <meshStandardMaterial
              color={isSelected ? '#38bdf8' : '#334155'}
              roughness={0.4}
              metalness={0.6}
            />
          </mesh>
          {/* 8 Solar Panels in 2 Rows */}
          {[-3.5, 3.5].map((rowOffset, rIdx) =>
            [-3, -1, 1, 3].map((colOffset, cIdx) => (
              <group key={`${rIdx}-${cIdx}`} position={[colOffset * 1.5, 0, rowOffset]}>
                <mesh position={[0, 0.8, 0]} castShadow>
                  <cylinderGeometry args={[0.08, 0.1, 1.6, 8]} />
                  <meshStandardMaterial color="#94a3b8" />
                </mesh>
                <mesh position={[0, 1.5, 0]} rotation={[0.4, 0.3, 0]} castShadow receiveShadow>
                  <boxGeometry args={[1.3, 0.08, 0.9]} />
                  <meshStandardMaterial
                    color="#1e3a8a"
                    emissive="#38bdf8"
                    emissiveIntensity={
                      state.powerBreakdown.sunlightFactor > 0.5 ? 0.35 : 0.1
                    }
                    roughness={0.15}
                    metalness={0.8}
                  />
                </mesh>
              </group>
            ))
          )}
        </group>
      )}

      {id === 'greenhouse' && (
        <group>
          {/* Translucent Geodesic Dome */}
          <mesh position={[0, 2.0, 0]} castShadow>
            <sphereGeometry args={[3.0, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
            <meshPhysicalMaterial
              color="#a7f3d0"
              transparent
              opacity={0.65}
              roughness={0.1}
              transmission={0.6}
              thickness={1.2}
            />
          </mesh>
          {/* Foundation */}
          <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[3.2, 3.3, 0.6, 24]} />
            <meshStandardMaterial color="#334155" />
          </mesh>

          {/* Dynamic 3D Crops inside Bed 1 */}
          <group position={[-1.0, 0.5, 0]}>
            <mesh castShadow>
              <boxGeometry args={[1.4, 0.3, 2.0]} />
              <meshStandardMaterial color="#78350f" />
            </mesh>
            {state.greenhouseBeds.bed1.cropType && (
              <mesh
                position={[
                  0,
                  0.2 + (state.greenhouseBeds.bed1.daysPlanted / 14) * 0.4,
                  0,
                ]}
                scale={[
                  1,
                  Math.max(0.2, state.greenhouseBeds.bed1.daysPlanted / 8),
                  1,
                ]}
              >
                <sphereGeometry args={[0.5, 8, 8]} />
                <meshStandardMaterial
                  color={
                    state.greenhouseBeds.bed1.stage === 'ready'
                      ? '#4ade80'
                      : '#15803d'
                  }
                />
              </mesh>
            )}
          </group>

          {/* Dynamic 3D Crops inside Bed 2 */}
          <group position={[1.0, 0.5, 0]}>
            <mesh castShadow>
              <boxGeometry args={[1.4, 0.3, 2.0]} />
              <meshStandardMaterial
                color={state.greenhouseBeds.bed2.unlocked ? '#78350f' : '#475569'}
              />
            </mesh>
            {state.greenhouseBeds.bed2.cropType && (
              <mesh
                position={[
                  0,
                  0.2 + (state.greenhouseBeds.bed2.daysPlanted / 14) * 0.4,
                  0,
                ]}
                scale={[
                  1,
                  Math.max(0.2, state.greenhouseBeds.bed2.daysPlanted / 8),
                  1,
                ]}
              >
                <sphereGeometry args={[0.5, 8, 8]} />
                <meshStandardMaterial
                  color={
                    state.greenhouseBeds.bed2.stage === 'ready'
                      ? '#4ade80'
                      : '#15803d'
                  }
                />
              </mesh>
            )}
          </group>
        </group>
      )}

      {id === 'recycler' && (
        <group>
          {/* Water Tanks with fluid level */}
          <mesh position={[-1.1, 1.6, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.9, 0.9, 2.8, 16]} />
            <meshStandardMaterial color="#0284c7" metalness={0.6} roughness={0.3} />
          </mesh>
          <mesh position={[1.1, 1.4, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.8, 0.8, 2.4, 16]} />
            <meshStandardMaterial color="#0369a1" metalness={0.6} roughness={0.3} />
          </mesh>
          {/* Condenser Base */}
          <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
            <boxGeometry args={[3.4, 0.6, 2.2]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
        </group>
      )}

      {id === 'shelter' && (
        <group>
          {/* Reinforced Mound */}
          <mesh position={[0, 1.3, 0]} castShadow receiveShadow>
            <sphereGeometry args={[3.6, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.4]} />
            <meshStandardMaterial
              color={isAdvisoryActive ? '#f59e0b' : '#64748b'}
              emissive={isAdvisoryActive ? '#d97706' : '#000000'}
              emissiveIntensity={isAdvisoryActive ? 0.6 : 0}
              roughness={0.9}
            />
          </mesh>
          {/* Heavy Blast Hatch */}
          <mesh position={[0, 0.7, 3.2]} castShadow receiveShadow>
            <boxGeometry args={[2.0, 1.4, 1.2]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
          </mesh>
        </group>
      )}

      {id === 'laboratory' && (
        <group>
          <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
            <boxGeometry args={[3.6, 2.6, 2.8]} />
            <meshStandardMaterial
              color={isSelected ? '#38bdf8' : '#f8fafc'}
              roughness={0.3}
              metalness={0.4}
            />
          </mesh>
          <mesh position={[1.2, 3.2, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.08, 1.8, 8]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
          </mesh>
        </group>
      )}

      {id === 'comms' && (
        <group>
          <mesh position={[0, 3.5, 0]} castShadow>
            <cylinderGeometry args={[0.15, 0.3, 6.5, 8]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.8} />
          </mesh>
          {/* Animated Rotating Earth Dish */}
          <group ref={dishRef} position={[0, 6.4, 0]}>
            <mesh rotation={[0.4, 0, 0]} castShadow>
              <sphereGeometry args={[1.6, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.35]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.6} roughness={0.2} />
            </mesh>
          </group>
        </group>
      )}

      {id === 'rover_bay' && (
        <group>
          <mesh position={[0, 0.15, 0]} receiveShadow>
            <boxGeometry args={[4.2, 0.3, 5.0]} />
            <meshStandardMaterial color="#334155" roughness={0.8} />
          </mesh>
          <mesh position={[-1.8, 1.0, -1.8]} castShadow>
            <boxGeometry args={[0.4, 1.8, 0.4]} />
            <meshStandardMaterial color="#f59e0b" />
          </mesh>
          <mesh position={[1.8, 1.0, -1.8]} castShadow>
            <boxGeometry args={[0.4, 1.8, 0.4]} />
            <meshStandardMaterial color="#f59e0b" />
          </mesh>
        </group>
      )}

      {/* Ground Selection / Hover Ring */}
      {(isSelected || hovered) && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[3.2, 3.4, 32]} />
          <meshBasicMaterial color={isSelected ? '#25C5F4' : '#94A3B8'} transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Emissive Status Indicator Light */}
      <mesh ref={beaconRef} position={[0, id === 'comms' ? 7.2 : 3.8, 0]}>
        <sphereGeometry args={[0.2, 12, 12]} />
        <meshBasicMaterial color={statusColor} />
      </mesh>

      {/* Floating Interactive Marker (Discreet when idle, expanded when hovered/selected; hidden during modals, inspections, or drawers) */}
      {activeModal === 'none' && !selectedEntity && activeNavTab === 'overview' && (
        <Html
          position={[0, id === 'comms' ? 8.2 : 4.6, 0]}
          distanceFactor={26}
          center
          zIndexRange={[5, 0]}
          className="pointer-events-auto select-none"
        >
          <div className="flex flex-col items-center">
            {hovered || isSelected ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedEntity({ type: 'building', id });
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold shadow-xl backdrop-blur-md transition-all border ${
                  isSelected
                    ? 'bg-[#152235] border-[#25C5F4] text-white ring-1 ring-[#25C5F4]'
                    : isFaulted
                    ? 'bg-[#101A29]/95 text-[#EF4444] border-[#EF4444]'
                    : condition < 50
                    ? 'bg-[#101A29]/95 text-[#F59E0B] border-[#F59E0B]'
                    : 'bg-[#101A29]/95 text-[#F1F5F9] border-[#26374D]'
                }`}
              >
                <span className="text-xs">{icon}</span>
                <span className="whitespace-nowrap">{name}</span>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusColor }} />
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedEntity({ type: 'building', id });
                }}
                className="w-5 h-5 rounded-full bg-[#101A29]/80 border border-[#26374D] hover:border-[#25C5F4] flex items-center justify-center text-[10px] shadow-md backdrop-blur-sm cursor-pointer transition-transform hover:scale-125"
                title={`${name} (${condition}%)`}
              >
                <span>{icon}</span>
              </button>
            )}
          </div>
        </Html>
      )}
    </group>
  );
};
