/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/game3d/Lighting.tsx
 * South Pole low-angle solar lighting, dynamic sun intensity, and calm amber space-weather visuals.
 */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store/store.ts';

const COLOR_NORMAL = new THREE.Color('#fff7e6');
const COLOR_ADVISORY = new THREE.Color('#ffb84d');

export const Lighting: React.FC = () => {
  const sunlightFactor = useGameStore((s) => s.state.powerBreakdown.sunlightFactor);
  const radiationAdvisory = useGameStore((s) => s.state.radiationAdvisory);
  const quality = useGameStore((s) => s.qualitySetting);

  const sunRef = useRef<THREE.DirectionalLight>(null);
  const ambientRef = useRef<THREE.AmbientLight>(null);

  useFrame((stateFrame) => {
    if (!sunRef.current) return;

    // Normal solar light intensity follows site sunlight factor
    let baseIntensity = 2.4 * sunlightFactor;
    let sunColor = COLOR_NORMAL;

    // Calm space-weather visuals: gentle amber warmth and subtle pulse
    if (radiationAdvisory && !radiationAdvisory.resolved) {
      const pulse = Math.sin(stateFrame.clock.getElapsedTime() * 2) * 0.15;
      baseIntensity = (2.0 + pulse) * sunlightFactor;
      sunColor = COLOR_ADVISORY;
    }

    sunRef.current.intensity = baseIntensity;
    sunRef.current.color = sunColor;
  });

  const enableShadows = quality !== 'low';
  const shadowMapSize = quality === 'high' ? 2048 : 1024;

  return (
    <>
      {/* Low ambient light (lunar space is black except earthlight and regolith scatter) */}
      <ambientLight
        ref={ambientRef}
        intensity={radiationAdvisory && !radiationAdvisory.resolved ? 0.45 : 0.25}
        color={radiationAdvisory && !radiationAdvisory.resolved ? '#ffa64d' : '#8fa2c4'}
      />

      {/* Earthfill light from above */}
      <directionalLight position={[0, 40, -10]} intensity={0.2} color="#6ba4ff" />

      {/* Low-angle south-pole sun creating iconic long shadows */}
      <directionalLight
        ref={sunRef}
        position={[-35, 12, -40]}
        intensity={2.4}
        castShadow={enableShadows}
        shadow-mapSize-width={shadowMapSize}
        shadow-mapSize-height={shadowMapSize}
        shadow-camera-near={10}
        shadow-camera-far={120}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
      />
    </>
  );
};

