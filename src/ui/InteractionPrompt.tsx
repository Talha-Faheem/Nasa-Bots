/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/ui/InteractionPrompt.tsx
 * Floating interaction prompt displayed when the player approaches within interaction radius of a base building.
 */

import React from 'react';
import { useGameStore } from '../store/store.ts';
import { eventBus } from '../store/bus.ts';

const BUILDING_NAMES: { [key: string]: { name: string; icon: string; action: string } } = {
  habitat: { name: 'Habitat Base', icon: '🏠', action: 'Rest, Sleep & Thermal Life Support' },
  power_station: { name: 'Solar Power Array', icon: '⚡', action: 'Clean Panels, Inspect Cells & Maintenance' },
  greenhouse: { name: 'Hydroponic Greenhouse', icon: '🌱', action: 'Plant Seeds, Tend Crops & Harvest Fresh Food' },
  recycler: { name: 'Water Recycler', icon: '💧', action: 'Inspect Distillation, Replace Filters & Service WRS' },
  shelter: { name: 'Radiation Shelter', icon: '☢️', action: 'Shelter Crew & Build Sintered Regolith Shield' },
  laboratory: { name: 'Science Laboratory', icon: '🔬', action: 'Analyze Regolith, Core Ice & Research' },
  comms: { name: 'Comms Dish', icon: '📡', action: 'Earth Uplink, Transmit Science & Consult Control' },
  rover_bay: { name: 'Rover Bay', icon: '🚜', action: 'Prepare Rover & Deploy Polar Expeditions' },
};

export const InteractionPrompt: React.FC = () => {
  const nearbyBuilding = useGameStore((s) => s.nearbyBuilding);
  const activeModal = useGameStore((s) => s.activeModal);
  const setSelectedEntity = useGameStore((s) => s.setSelectedEntity);
  const openTaskMenu = useGameStore((s) => s.openTaskMenu);

  if (!nearbyBuilding || activeModal !== 'none') return null;

  const info = BUILDING_NAMES[nearbyBuilding] || {
    name: nearbyBuilding,
    icon: '⚙️',
    action: 'Operate Module',
  };

  const handleInteract = () => {
    setSelectedEntity(null);
    openTaskMenu(nearbyBuilding);
    eventBus.emit('sound:play', { name: 'click' });
  };

  return (
    <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-30 pointer-events-auto select-none animate-fadeIn">
      <button
        onClick={handleInteract}
        className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-[#080E19]/95 border-2 border-[#36C5F0] hover:border-white shadow-2xl backdrop-blur-xl transition-all hover:scale-105 cursor-pointer text-left group"
      >
        <span className="text-2xl group-hover:scale-110 transition-transform">
          {info.icon}
        </span>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-white">
              {info.name}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-[#36C5F0] text-[#080E19] text-[10px] font-black font-mono shadow-sm">
              [ E ]
            </span>
          </div>
          <div className="text-[10px] text-[#A7B4C8] font-medium mt-0.5">
            {info.action}
          </div>
        </div>

        <div className="ml-2 text-xs font-black text-[#36C5F0] uppercase tracking-wider group-hover:translate-x-1 transition-transform">
          OPERATE ➔
        </div>
      </button>
    </div>
  );
};
