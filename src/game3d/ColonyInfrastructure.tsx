/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/game3d/ColonyInfrastructure.tsx
 * Real 3D modular colony infrastructure: Landing pad, crew lander, mining excavator,
 * pressurized connecting tunnels, tool carts, and environmental lunar props.
 */

import React from 'react';
import { GLTFModel } from './ModelLoader.tsx';

export const ColonyInfrastructure: React.FC = () => {
  return (
    <group>
      {/* 1. Artemis Landing Pad Complex (South of Base) */}
      <group position={[0, 0, -32]}>
        {/* Sintered Landing Pad Surface */}
        <GLTFModel
          url="/assets/models/buildings/landing_pad.glb"
          scale={1.05}
          position={[0, 0, 0]}
        />
        {/* Lunar Crew Lander with Ascent Stage */}
        <GLTFModel
          url="/assets/models/buildings/crew_lander.glb"
          scale={0.92}
          position={[0, 0.2, 0]}
        />
        {/* Blast Deflector Wall */}
        <GLTFModel
          url="/assets/models/buildings/landing_pad_blast_wall.glb"
          scale={1.0}
          position={[0, 0, 9.5]}
        />
        {/* High-Intensity Approach Guidance Beacons */}
        <GLTFModel
          url="/assets/models/buildings/approach_light_beacon.glb"
          scale={0.8}
          position={[-7.5, 0, -7.5]}
        />
        <GLTFModel
          url="/assets/models/buildings/approach_light_beacon.glb"
          scale={0.8}
          position={[7.5, 0, -7.5]}
        />
        <GLTFModel
          url="/assets/models/buildings/approach_light_beacon.glb"
          scale={0.8}
          position={[-7.5, 0, 7.5]}
        />
        <GLTFModel
          url="/assets/models/buildings/approach_light_beacon.glb"
          scale={0.8}
          position={[7.5, 0, 7.5]}
        />
        {/* Cryogenic Propellant Transfer Arm */}
        <GLTFModel
          url="/assets/models/buildings/transfer_arm_tower.glb"
          scale={0.85}
          position={[8.5, 0, 0]}
        />
      </group>

      {/* 2. In-Situ Regolith Mining & Sintering Facility (West of Base) */}
      <group position={[-23, 0, 16]}>
        {/* Regolith Bucket Drum Excavator */}
        <GLTFModel
          url="/assets/models/mining/regolith_excavator.glb"
          scale={0.88}
          position={[0, 0, 0]}
          rotation={[0, 0.4, 0]}
        />
        {/* Regolith Hopper & Screening Deck */}
        <GLTFModel
          url="/assets/models/mining/regolith_hopper_screen.glb"
          scale={0.88}
          position={[4.5, 0, -1]}
          rotation={[0, -0.2, 0]}
        />
        {/* 3D Sintering Print Gantry */}
        <GLTFModel
          url="/assets/models/mining/regolith_sintering_gantry.glb"
          scale={0.85}
          position={[-4.5, 0, 1]}
          rotation={[0, 0.8, 0]}
        />
        {/* Cryogenic Propellant & Gas Tank Farm */}
        <GLTFModel
          url="/assets/models/storage/propellant_tank_farm.glb"
          scale={0.7}
          position={[2.5, 0, 6.0]}
        />
      </group>

      {/* 3. Pressurized Surface Tunnels connecting Base Modules */}
      <group>
        {/* Tunnel from Habitat (0, 0) to Greenhouse (12, -4) */}
        <GLTFModel
          url="/assets/models/tunnels/tunnel_straight.glb"
          scale={0.72}
          position={[5.5, 0, -1.8]}
          rotation={[0, -0.32, 0]}
        />

        {/* Tunnel from Habitat (0, 0) to Laboratory (14, 8) */}
        <GLTFModel
          url="/assets/models/tunnels/tunnel_straight.glb"
          scale={0.72}
          position={[6.5, 0, 3.8]}
          rotation={[0, 0.52, 0]}
        />

        {/* Tunnel from Habitat (0, 0) to Water Recycler (6, 10) */}
        <GLTFModel
          url="/assets/models/tunnels/tunnel_straight.glb"
          scale={0.72}
          position={[2.8, 0, 4.8]}
          rotation={[0, 1.05, 0]}
        />

        {/* Radiation Shelter Blast Berm Corridor (-8, 12) */}
        <GLTFModel
          url="/assets/models/buildings/blast_berm.glb"
          scale={0.8}
          position={[-5, 0, 8]}
          rotation={[0, 0.6, 0]}
        />
      </group>

      {/* 4. Support Equipment & Tool Carts */}
      <group>
        {/* Astronaut Tool Cart near Habitat */}
        <GLTFModel
          url="/assets/models/astronauts/tool_cart.glb"
          scale={0.8}
          position={[2.2, 0, 2.0]}
          rotation={[0, 0.5, 0]}
        />
        {/* Heavy Equipment Sled near Rover Bay */}
        <GLTFModel
          url="/assets/models/astronauts/equipment_sled.glb"
          scale={0.85}
          position={[-2.8, 0, -14.5]}
          rotation={[0, -0.4, 0]}
        />
        {/* Autonomous Survey Robot Rover near Solar Farm */}
        <GLTFModel
          url="/assets/models/rovers/rover_survey_robot.glb"
          scale={0.75}
          position={[-11, 0, -8]}
          rotation={[0, 1.2, 0]}
        />
      </group>

      {/* 5. Geological Surface Details & Navigation Beacons */}
      <group>
        {/* Survey Marker Array near South Crater Rim */}
        <GLTFModel
          url="/assets/models/environment/survey_marker_array.glb"
          scale={0.9}
          position={[-9, 0, -17]}
        />
        {/* Natural Lunar Boulder Field */}
        <GLTFModel
          url="/assets/models/environment/boulder_field_tile.glb"
          scale={0.85}
          position={[22, 0, -16]}
        />
        {/* Regolith Dust Berm Protective Enclosure */}
        <GLTFModel
          url="/assets/models/environment/graded_dust_berm.glb"
          scale={0.9}
          position={[-15, 0, 3]}
          rotation={[0, 0.4, 0]}
        />
      </group>
    </group>
  );
};
