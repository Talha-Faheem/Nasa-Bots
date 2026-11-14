/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/game3d/Terrain.tsx
 * Realistic 3D lunar South Pole terrain with high-resolution craters, raised ejecta rims,
 * permanently shadowed ice craters with frost sheen, and geological mineral zones.
 */

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { getTerrainHeight, getTerrainSample } from './Physics/TerrainHeight.ts';

export const Terrain: React.FC = () => {
  // Generate procedural lunar heightmap and vertex color attributes
  const geometry = useMemo(() => {
    // 140x140 meters terrain grid with 80x80 subdivision for crisp crater rims
    const geo = new THREE.PlaneGeometry(140, 140, 80, 80);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    const colors: number[] = [];

    const baseRegolithColor = new THREE.Color('#64748b');
    const highlandAnorthositeColor = new THREE.Color('#94a3b8');
    const craterDeepShadowColor = new THREE.Color('#1e293b');
    const waterIceFrostColor = new THREE.Color('#38bdf8');
    const mineralOreColor = new THREE.Color('#b45309');

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);

      // Query shared single source of truth for exact terrain height
      const y = getTerrainHeight(x, z);
      pos.setY(i, y);

      const sample = getTerrainSample(x, z);
      const vertexColor = baseRegolithColor.clone();

      // Distinct Geological Zone Shading
      if (sample.zone === 'Water Ice Deposit Zone') {
        // Cold polar ice sheen in permanently shadowed crater
        const iceFactor = Math.min(1.0, Math.max(0, -y / 3.0));
        vertexColor.lerp(waterIceFrostColor, iceFactor * 0.75);
      } else if (sample.zone === 'Mineral Deposit Zone') {
        // Iron and titanium mineral deposits
        vertexColor.lerp(mineralOreColor, 0.45);
      } else if (y < -2.0) {
        // Shadowed deep crater basins
        vertexColor.lerp(craterDeepShadowColor, 0.6);
      } else if (y > 1.2) {
        // Highland ejecta ridges
        vertexColor.lerp(highlandAnorthositeColor, 0.5);
      }

      colors.push(vertexColor.r, vertexColor.g, vertexColor.b);
    }

    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial
        vertexColors
        roughness={0.88}
        metalness={0.12}
        flatShading={false}
      />
    </mesh>
  );
};
