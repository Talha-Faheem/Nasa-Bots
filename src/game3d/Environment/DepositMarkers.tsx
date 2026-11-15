/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/game3d/Environment/DepositMarkers.tsx
 * Physical 3D geological outcrops, interactive holographic survey beacons,
 * and in-situ mining triggers on the lunar surface.
 */

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../store/store.ts';
import { eventBus } from '../../store/bus.ts';
import { getTerrainHeight } from '../Physics/TerrainHeight.ts';
import { ResourceDeposit } from '../../sim/types.ts';

interface SingleDepositProps {
  deposit: ResourceDeposit;
}

const SingleDepositMesh: React.FC<SingleDepositProps> = ({ deposit }) => {
  const [hovered, setHovered] = useState(false);
  const [isNearby, setIsNearby] = useState(false);
  const isNearbyRef = useRef(false);
  const beaconRef = useRef<THREE.Group>(null);
  const pulseRef = useRef<THREE.Mesh>(null);

  const activePlayerCrew = useGameStore((s) => s.activePlayerCrew);
  const dispatch = useGameStore((s) => s.dispatch);
  const openLearnCard = useGameStore((s) => s.openLearnCard);

  const posX = deposit.position.x;
  const posZ = deposit.position.z;
  const posY = deposit.elevation ?? getTerrainHeight(posX, posZ);

  useFrame((state, delta) => {
    // Gentle rotation of holographic waypoint beacon
    if (beaconRef.current) {
      beaconRef.current.rotation.y += delta * 0.8;
    }
    // Subtle breathing pulse for volatile/shadowed deposits
    if (pulseRef.current) {
      const s = 1 + Math.sin(state.clock.getElapsedTime() * 3) * 0.08;
      pulseRef.current.scale.set(s, s, s);
    }

    // High-performance proximity check: only trigger React re-render when crossing threshold
    const player = useGameStore.getState().astronautPositions[activePlayerCrew];
    if (player) {
      const distSq = (player.x - posX) ** 2 + (player.z - posZ) ** 2;
      const nearby = distSq <= 30.25; // 5.5m squared
      if (nearby !== isNearbyRef.current) {
        isNearbyRef.current = nearby;
        setIsNearby(nearby);
      }
    }
  });

  const handleScan = (e: any) => {
    e.stopPropagation();
    eventBus.emit('sound:play', { name: 'click' });
    dispatch({
      type: 'SCAN_DEPOSIT',
      crewId: activePlayerCrew,
      depositId: deposit.id,
    });
  };

  const handleMine = (e: any) => {
    e.stopPropagation();
    eventBus.emit('sound:play', { name: 'click' });
    dispatch({
      type: 'MINE_DEPOSIT',
      crewId: activePlayerCrew,
      depositId: deposit.id,
      amount: 25,
    });
  };

  const handleInspect = (e: any) => {
    e.stopPropagation();
    eventBus.emit('sound:play', { name: 'click' });
    openLearnCard({
      title: deposit.name,
      threeLineSummary: [
        deposit.description,
        `Geological Zone: ${deposit.zone}`,
        `Required Instrument: ${deposit.requiredTool}`,
      ],
      scienceConcept: `In-Situ Resource Utilization (ISRU): ${deposit.resourceType.toUpperCase()} deposits at the lunar south pole provide essential feedstocks for life support, radiation shielding, rocket propellant, and permanent base manufacturing without reliance on terrestrial resupply.`,
      sourceBadge: 'Live NASA',
      readMoreUrl: 'https://www.nasa.gov/mission/artemis/isru',
    });
  };

  // Distinct geological visuals per resource type
  const renderGeologicalFeature = () => {
    switch (deposit.resourceType) {
      case 'water_ice':
        return (
          <group position={[0, 0, 0]}>
            {/* Cryogenic ice crystals nestled in shadowed depression */}
            <mesh position={[0, 0.6, 0]} rotation={[0.2, 0.4, 0.1]} castShadow receiveShadow>
              <coneGeometry args={[1.1, 2.2, 5]} />
              <meshStandardMaterial
                color="#7dd3fc"
                roughness={0.15}
                metalness={0.2}
                emissive="#38bdf8"
                emissiveIntensity={0.45}
                transparent
                opacity={0.88}
              />
            </mesh>
            <mesh position={[0.7, 0.4, -0.4]} rotation={[-0.3, 0.6, 0.2]} castShadow>
              <coneGeometry args={[0.7, 1.5, 5]} />
              <meshStandardMaterial
                color="#bae6fd"
                roughness={0.1}
                emissive="#0284c7"
                emissiveIntensity={0.4}
                transparent
                opacity={0.85}
              />
            </mesh>
            <mesh position={[-0.6, 0.35, 0.5]} rotation={[0.4, -0.5, -0.1]} castShadow>
              <coneGeometry args={[0.6, 1.3, 5]} />
              <meshStandardMaterial color="#e0f2fe" roughness={0.1} emissive="#38bdf8" emissiveIntensity={0.35} />
            </mesh>
            {/* Cold frost ground ring */}
            <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.8, 2.2, 24]} />
              <meshBasicMaterial color="#38bdf8" transparent opacity={0.3} />
            </mesh>
          </group>
        );

      case 'regolith':
        return (
          <group position={[0, 0, 0]}>
            {/* High-grade sintering soil mound & excavator marks */}
            <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[1.6, 2.3, 0.9, 8]} />
              <meshStandardMaterial color="#475569" roughness={0.9} />
            </mesh>
            {/* Basalt blocks */}
            <mesh position={[0.8, 0.7, 0.3]} castShadow>
              <boxGeometry args={[0.7, 0.5, 0.7]} />
              <meshStandardMaterial color="#334155" roughness={0.85} />
            </mesh>
            {/* Survey stakes */}
            <mesh position={[-1.2, 0.6, -0.8]}>
              <cylinderGeometry args={[0.03, 0.03, 1.2]} />
              <meshBasicMaterial color="#f59e0b" />
            </mesh>
          </group>
        );

      case 'iron':
        return (
          <group position={[0, 0, 0]}>
            {/* Metallic reddish-brown ilmenite boulder vein */}
            <mesh position={[0, 0.7, 0]} rotation={[0.4, 0.8, 0.2]} castShadow receiveShadow>
              <dodecahedronGeometry args={[1.2, 0]} />
              <meshStandardMaterial color="#78350f" roughness={0.5} metalness={0.75} />
            </mesh>
            <mesh position={[0.9, 0.45, -0.5]} rotation={[-0.2, 0.5, -0.3]} castShadow>
              <dodecahedronGeometry args={[0.8, 0]} />
              <meshStandardMaterial color="#92400e" roughness={0.4} metalness={0.8} />
            </mesh>
          </group>
        );

      case 'titanium':
        return (
          <group position={[0, 0, 0]}>
            {/* Silver-gray lustrous crystalline outcrop */}
            <mesh position={[0, 0.8, 0]} rotation={[0.3, 0.2, 0.5]} castShadow receiveShadow>
              <octahedronGeometry args={[1.3, 0]} />
              <meshStandardMaterial color="#94a3b8" roughness={0.25} metalness={0.9} />
            </mesh>
            <mesh position={[-0.7, 0.5, 0.6]} rotation={[-0.5, 0.3, 0.2]} castShadow>
              <octahedronGeometry args={[0.7, 0]} />
              <meshStandardMaterial color="#cbd5e1" roughness={0.2} metalness={0.92} />
            </mesh>
          </group>
        );

      case 'aluminum':
        return (
          <group position={[0, 0, 0]}>
            {/* Highland feldspar pale chalky formation */}
            <mesh position={[0, 0.65, 0]} castShadow receiveShadow>
              <sphereGeometry args={[1.1, 8, 8]} />
              <meshStandardMaterial color="#e2e8f0" roughness={0.7} metalness={0.4} />
            </mesh>
            <mesh position={[0.7, 0.4, 0.6]} castShadow>
              <sphereGeometry args={[0.65, 7, 7]} />
              <meshStandardMaterial color="#f1f5f9" roughness={0.75} metalness={0.35} />
            </mesh>
          </group>
        );

      case 'silicon':
        return (
          <group position={[0, 0, 0]}>
            {/* Glassy silicate crystals */}
            <mesh position={[0, 0.75, 0]} rotation={[0.1, 0.5, 0]} castShadow receiveShadow>
              <coneGeometry args={[0.8, 1.8, 6]} />
              <meshStandardMaterial
                color="#93c5fd"
                roughness={0.1}
                metalness={0.15}
                emissive="#60a5fa"
                emissiveIntensity={0.25}
                transparent
                opacity={0.85}
              />
            </mesh>
            <mesh position={[0.6, 0.5, 0.4]} rotation={[-0.2, 0.8, 0.3]} castShadow>
              <coneGeometry args={[0.5, 1.2, 6]} />
              <meshStandardMaterial color="#bfdbfe" roughness={0.1} transparent opacity={0.8} />
            </mesh>
          </group>
        );

      case 'he3':
      default:
        return (
          <group position={[0, 0, 0]}>
            {/* Primordial solar wind degassing vent with violet pulse */}
            <mesh ref={pulseRef} position={[0, 0.5, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.8, 1.4, 0.8, 12]} />
              <meshStandardMaterial
                color="#6b21a8"
                roughness={0.4}
                emissive="#c084fc"
                emissiveIntensity={0.65}
              />
            </mesh>
            <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.6, 2.0, 16]} />
              <meshBasicMaterial color="#a855f7" transparent opacity={0.35} />
            </mesh>
          </group>
        );
    }
  };

  const statusColor = deposit.depleted
    ? '#ef4444'
    : deposit.scanned
    ? '#22c55e'
    : '#f59e0b';

  return (
    <group
      position={[posX, posY, posZ]}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
      onClick={handleInspect}
    >
      {/* 3D Geological Rock / Ice Feature */}
      {renderGeologicalFeature()}

      {/* Holographic Survey Beacon Floating Overhead */}
      <group position={[0, 2.6, 0]}>
        <group ref={beaconRef}>
          {/* Outer Rotating Hexagonal Ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.7, 0.035, 8, 6]} />
            <meshBasicMaterial color={statusColor} wireframe={!deposit.scanned} />
          </mesh>
          {/* Inner Marker Diamond */}
          <mesh>
            <octahedronGeometry args={[0.22, 0]} />
            <meshStandardMaterial
              color={statusColor}
              emissive={statusColor}
              emissiveIntensity={hovered || isNearby ? 1.0 : 0.4}
            />
          </mesh>
        </group>

        {/* Floating HTML HUD Card on Hover or Astronaut Proximity */}
        {(hovered || isNearby) && (
          <Html position={[0, 0.9, 0]} center distanceFactor={14} zIndexRange={[100, 0]}>
            <div className="bg-[#080F1B]/95 border border-[#26374D] rounded-lg p-2.5 shadow-2xl backdrop-blur-md min-w-[210px] pointer-events-auto select-none font-sans text-left transition-all scale-100">
              <div className="flex items-center justify-between gap-2 border-b border-[#26374D] pb-1 mb-1.5">
                <span className="text-xs font-bold text-white tracking-wide truncate">
                  {deposit.scanned ? deposit.name : 'Unsurveyed Deposit'}
                </span>
                <span
                  className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider"
                  style={{
                    backgroundColor: `${statusColor}25`,
                    color: statusColor,
                  }}
                >
                  {deposit.depleted ? 'DEPLETED' : deposit.scanned ? 'SCANNED' : 'UNSCANNED'}
                </span>
              </div>

              <div className="text-[10px] text-[#94A3B8] mb-1 font-mono">
                Zone: <span className="text-white">{deposit.zone}</span>
              </div>

              {deposit.scanned ? (
                <div className="space-y-1 mb-2">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-[#94A3B8]">Remaining:</span>
                    <span className="text-[#25C5F4] font-bold">
                      {deposit.remainingQuantity} / {deposit.totalQuantity} units
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-[#152235] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#25C5F4] transition-all"
                      style={{
                        width: `${Math.max(0, (deposit.remainingQuantity / deposit.totalQuantity) * 100)}%`,
                      }}
                    />
                  </div>
                  <div className="text-[9px] text-[#64748B] italic">{deposit.requiredTool}</div>
                </div>
              ) : (
                <div className="text-[10px] text-[#f59e0b] mb-2">
                  Geological survey required. Daniel Vance awards +6 Science.
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-1.5 pt-1">
                {!deposit.scanned ? (
                  <button
                    onClick={handleScan}
                    className="flex-1 py-1 px-2 rounded bg-[#f59e0b] hover:bg-[#d97706] text-[#080F1B] font-bold text-[10px] transition-all cursor-pointer shadow"
                  >
                    🔍 Scan Deposit
                  </button>
                ) : !deposit.depleted ? (
                  <button
                    onClick={handleMine}
                    className="flex-1 py-1 px-2 rounded bg-[#22c55e] hover:bg-[#16a34a] text-[#080F1B] font-bold text-[10px] transition-all cursor-pointer shadow"
                  >
                    ⛏️ Mine 25 units
                  </button>
                ) : (
                  <span className="text-[10px] text-red-400 font-mono italic">Deposit Exhausted</span>
                )}
                <button
                  onClick={handleInspect}
                  className="py-1 px-2 rounded bg-[#1e293b] hover:bg-[#334155] text-white font-medium text-[10px] transition-all cursor-pointer border border-[#475569]"
                >
                  Info
                </button>
              </div>
            </div>
          </Html>
        )}
      </group>
    </group>
  );
};

export const DepositMarkers: React.FC = () => {
  const deposits = useGameStore((s) => s.state.deposits);

  if (!deposits) return null;

  return (
    <group name="LunarGeologicalDeposits">
      {Object.values(deposits).map((dep) => (
        <SingleDepositMesh key={dep.id} deposit={dep} />
      ))}
    </group>
  );
};
