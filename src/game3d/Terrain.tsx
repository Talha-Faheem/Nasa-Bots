/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/game3d/Terrain.tsx
 * Low-frequency displaced lunar regolith terrain with craters and starfield.
 */

import React, { useMemo } from 'react';
import * as THREE from 'three';

export const Terrain: React.FC = () => {
  // Generate procedural lunar heightmap with craters
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(120, 120, 64, 64);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    const craters = [
      { x: -25, z: -20, r: 12, depth: 3.5 },
      { x: 30, z: -15, r: 16, depth: 4.0 },
      { x: -10, z: 35, r: 14, depth: 3.8 },
      { x: 28, z: 25, r: 10, depth: 2.8 },
      { x: -35, z: 15, r: 18, depth: 4.5 },
    ];

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);

      // Low frequency noise displacement
      let y = Math.sin(x * 0.05) * Math.cos(z * 0.05) * 1.5;
      y += Math.sin(x * 0.12 + 1.2) * Math.cos(z * 0.08) * 0.6;

      // Flatten base outpost area near (0, 0)
      const distFromCenter = Math.hypot(x, z);
      if (distFromCenter < 22) {
        y *= Math.pow(distFromCenter / 22, 2);
      }

      // Sculpt craters with raised ejecta rims
      for (const c of craters) {
        const d = Math.hypot(x - c.x, z - c.z);
        if (d < c.r * 1.4) {
          if (d < c.r) {
            // Crater floor
            const craterFactor = Math.cos((d / c.r) * Math.PI * 0.5);
            y -= c.depth * craterFactor;
          } else {
            // Raised rim
            const rimFactor = Math.sin(((d - c.r) / (c.r * 0.4)) * Math.PI);
            y += (c.depth * 0.25) * rimFactor;
          }
        }
      }

      pos.setY(i, y);
    }

    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial
        color="#707684"
        roughness={0.92}
        metalness={0.08}
        flatShading={false}
      />
    </mesh>
  );
};

