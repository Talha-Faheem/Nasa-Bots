/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/ui/InteractionPrompt.tsx
 * Subtle, Professional Proximity Interaction Prompt [E].
 * Displays when astronaut approaches an operational base module.
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
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 pointer-events-auto select-none animate-fadeIn">
      <button
        onClick={handleInteract}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#080F1B]/95 border border-[#25C5F4] hover:border-white shadow-xl backdrop-blur-md transition-all hover:scale-105 cursor-pointer text-left group"
      >
        <span className="text-base leading-none">{info.icon}</span>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            {info.name}
          </span>
          <span className="px-1.5 py-0.5 rounded bg-[#25C5F4] text-[#080F1B] text-[10px] font-mono font-black shadow-sm">
            [E]
          </span>
        </div>
      </button>
    </div>
  );
};
