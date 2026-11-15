/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/game3d/ModelLoader.tsx
 * High-performance GLTF / GLB model loader using Drei useGLTF & Clone with graceful fallback.
 */

import React, { Suspense } from 'react';
import { useGLTF, Clone } from '@react-three/drei';
import * as THREE from 'three';

interface GLTFModelProps {
  url: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  castShadow?: boolean;
  receiveShadow?: boolean;
  fallbackColor?: string;
  fallbackGeometry?: 'box' | 'cylinder' | 'sphere';
  fallbackSize?: [number, number, number];
}

const ModelInner: React.FC<GLTFModelProps> = ({
  url,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  castShadow = true,
  receiveShadow = true,
}) => {
  const { scene } = useGLTF(url);

  // Apply shadows to all child meshes in the cloned scene
  React.useEffect(() => {
    scene.traverse((child: THREE.Object3D) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = castShadow;
        child.receiveShadow = receiveShadow;
      }
    });
  }, [scene, castShadow, receiveShadow]);

  const scaleArr: [number, number, number] =
    typeof scale === 'number' ? [scale, scale, scale] : scale;

  return (
    <group position={position} rotation={rotation} scale={scaleArr}>
      <Clone object={scene} deep />
    </group>
  );
};

export const GLTFModel: React.FC<GLTFModelProps> = React.memo((props) => {
  const {
    fallbackColor = '#25C5F4',
    fallbackGeometry = 'box',
    fallbackSize = [2, 2, 2],
    position = [0, 0, 0],
  } = props;

  return (
    <Suspense
      fallback={
        <group position={position}>
          {fallbackGeometry === 'box' && (
            <mesh position={[0, fallbackSize[1] / 2, 0]}>
              <boxGeometry args={fallbackSize} />
              <meshStandardMaterial color={fallbackColor} roughness={0.4} />
            </mesh>
          )}
          {fallbackGeometry === 'cylinder' && (
            <mesh position={[0, fallbackSize[1] / 2, 0]}>
              <cylinderGeometry
                args={[fallbackSize[0], fallbackSize[0], fallbackSize[1], 16]}
              />
              <meshStandardMaterial color={fallbackColor} roughness={0.4} />
            </mesh>
          )}
          {fallbackGeometry === 'sphere' && (
            <mesh position={[0, fallbackSize[0], 0]}>
              <sphereGeometry args={[fallbackSize[0], 16, 16]} />
              <meshStandardMaterial color={fallbackColor} roughness={0.4} />
            </mesh>
          )}
        </group>
      }
    >
      <ModelInner {...props} />
    </Suspense>
  );
});

// Preload high-priority models to eliminate pop-in
export function preloadColonyAssets() {
  const models = [
    '/assets/models/habitats/inflatable_dome_shielded.glb',
    '/assets/models/farming/greenhouse_module.glb',
    '/assets/models/power/solar_array_tracking.glb',
    '/assets/models/power/battery_storage_container.glb',
    '/assets/models/machinery/water_processing_skid.glb',
    '/assets/models/habitats/regolith_shielded_habitat.glb',
    '/assets/models/laboratories/medical_crew_care_module.glb',
    '/assets/models/environment/comms_relay_mast.glb',
    '/assets/models/machinery/workshop_vehicle_bay.glb',
    '/assets/models/rovers/rover_science.glb',
    '/assets/models/astronauts/astronaut_eva_suit.glb',
    '/assets/models/buildings/landing_pad.glb',
    '/assets/models/buildings/crew_lander.glb',
  ];

  for (const m of models) {
    try {
      useGLTF.preload(m);
    } catch {
      // Ignore if browser is offline
    }
  }
}
