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
import { GLTFModel } from '../ModelLoader.tsx';
import { getTerrainHeight } from '../Physics/TerrainHeight.ts';
import { BUILDING_ICONS } from '../../ui/icons.tsx';

interface BuildingProps {
  id: BuildingId;
  name: string;
  icon?: string;
}

export const BuildingMesh: React.FC<BuildingProps> = ({ id, name }) => {
  const Icon = BUILDING_ICONS[id];
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

  if (isAdvisoryActive) {
    statusColor = '#f59e0b';
  }

  return (
    <group
      position={[coords.x, getTerrainHeight(coords.x, coords.z), coords.z]}
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

      {/* Visual Building Geometries - Authentic GLB Models */}
      {id === 'habitat' && (
        <group>
          <GLTFModel
            url="/assets/models/habitats/inflatable_dome_shielded.glb"
            scale={0.72}
            position={[0, 0, 0]}
            fallbackGeometry="sphere"
            fallbackSize={[3.2, 3.2, 3.2]}
            fallbackColor="#e2e8f0"
          />
          <GLTFModel
            url="/assets/models/tunnels/airlock_dustlock.glb"
            scale={0.7}
            position={[0, 0, 3.6]}
            rotation={[0, 0, 0]}
          />
          <GLTFModel
            url="/assets/models/habitats/cupola_turret.glb"
            scale={0.65}
            position={[0, 4.4, 0]}
          />
        </group>
      )}

      {id === 'power_station' && (
        <group>
          <GLTFModel
            url="/assets/models/power/solar_array_tracking.glb"
            scale={0.9}
            position={[-2.4, 0, 0]}
            fallbackGeometry="box"
            fallbackSize={[1.5, 1.8, 1.5]}
            fallbackColor="#1e3a8a"
          />
          <GLTFModel
            url="/assets/models/power/solar_array_tracking.glb"
            scale={0.9}
            position={[2.4, 0, 0]}
          />
          <GLTFModel
            url="/assets/models/power/battery_storage_container.glb"
            scale={0.8}
            position={[0, 0, -2.2]}
          />
          <GLTFModel
            url="/assets/models/power/solar_tower.glb"
            scale={0.8}
            position={[0, 0, 2.2]}
          />
        </group>
      )}

      {id === 'greenhouse' && (
        <group>
          <GLTFModel
            url="/assets/models/farming/greenhouse_module.glb"
            scale={0.85}
            position={[0, 0, 0]}
            fallbackGeometry="cylinder"
            fallbackSize={[3.0, 3.0, 2.0]}
            fallbackColor="#a7f3d0"
          />
          <GLTFModel
            url="/assets/models/tunnels/airlock_dustlock.glb"
            scale={0.7}
            position={[-3.4, 0, 0]}
            rotation={[0, Math.PI / 2, 0]}
          />

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
          <GLTFModel
            url="/assets/models/machinery/water_processing_skid.glb"
            scale={1.1}
            position={[-1.4, 0, 0]}
            fallbackGeometry="cylinder"
            fallbackSize={[1.2, 1.2, 2.5]}
            fallbackColor="#0284c7"
          />
          <GLTFModel
            url="/assets/models/machinery/oxygen_extraction_skid.glb"
            scale={1.1}
            position={[1.4, 0, 0]}
            fallbackGeometry="box"
            fallbackSize={[1.5, 1.5, 2.0]}
            fallbackColor="#38bdf8"
          />
        </group>
      )}

      {id === 'shelter' && (
        <group>
          <GLTFModel
            url="/assets/models/habitats/regolith_shielded_habitat.glb"
            scale={0.88}
            position={[0, 0, 0]}
            fallbackGeometry="sphere"
            fallbackSize={[3.5, 3.5, 2.5]}
            fallbackColor="#64748b"
          />
          <GLTFModel
            url="/assets/models/mining/regolith_sintering_gantry.glb"
            scale={0.7}
            position={[0, 0, 3.2]}
          />
        </group>
      )}

      {id === 'laboratory' && (
        <group>
          <GLTFModel
            url="/assets/models/laboratories/medical_crew_care_module.glb"
            scale={0.82}
            position={[0, 0, 0]}
            fallbackGeometry="box"
            fallbackSize={[3.5, 2.5, 2.5]}
            fallbackColor="#f8fafc"
          />
          <GLTFModel
            url="/assets/models/habitats/cupola_turret.glb"
            scale={0.7}
            position={[2.8, 0, 0]}
          />
        </group>
      )}

      {id === 'comms' && (
        <group>
          <GLTFModel
            url="/assets/models/environment/comms_relay_mast.glb"
            scale={1.0}
            position={[0, 0, 0]}
            fallbackGeometry="cylinder"
            fallbackSize={[0.3, 0.3, 6.0]}
            fallbackColor="#94a3b8"
          />
        </group>
      )}

      {id === 'rover_bay' && (
        <group>
          <GLTFModel
            url="/assets/models/machinery/workshop_vehicle_bay.glb"
            scale={0.88}
            position={[0, 0, 0]}
            fallbackGeometry="box"
            fallbackSize={[4.0, 1.5, 5.0]}
            fallbackColor="#334155"
          />
          <GLTFModel
            url="/assets/models/vehicles/crane_rover.glb"
            scale={0.65}
            position={[3.4, 0, 0]}
          />
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
                {Icon && <Icon className="w-3.5 h-3.5 text-[#25C5F4] flex-shrink-0" />}
                <span className="whitespace-nowrap">{name}</span>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusColor }} />
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedEntity({ type: 'building', id });
                }}
                className="w-5 h-5 rounded-full bg-[#101A29]/80 border border-[#26374D] hover:border-[#25C5F4] flex items-center justify-center text-[10px] shadow-md backdrop-blur-sm cursor-pointer transition-transform hover:scale-125 text-[#25C5F4]"
                title={`${name} (${condition}%)`}
              >
                {Icon ? <Icon className="w-3 h-3 text-[#25C5F4]" /> : null}
              </button>
            )}
          </div>
        </Html>
      )}
    </group>
  );
};
