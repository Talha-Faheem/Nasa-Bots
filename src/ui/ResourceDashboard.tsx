/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/ui/ResourceDashboard.tsx
 * Professional Game Resource Telemetry Bar.
 * Clean, compact horizontal row displaying Power, Oxygen, Water, Food, Health, Radiation, Comms.
 * With professional SVG icons, current values, consumption/production trends, and clear warning states.
 */

import React from 'react';
import { useGameStore } from '../store/store.ts';
import { eventBus } from '../store/bus.ts';
import {
  Zap,
  Wind,
  Droplets,
  Wheat,
  HeartPulse,
  Radiation,
  Radio,
} from './icons.tsx';

export const ResourceDashboard: React.FC = () => {
  const resources = useGameStore((s) => s.state.resources);
  const systems = useGameStore((s) => s.state.systems);
  const powerBreakdown = useGameStore((s) => s.state.powerBreakdown);
  const greenhouseBeds = useGameStore((s) => s.state.greenhouseBeds);
  const crew = useGameStore((s) => s.state.crew);
  const selectedEntity = useGameStore((s) => s.selectedEntity);
  const setSelectedEntity = useGameStore((s) => s.setSelectedEntity);

  const activeBeds = [greenhouseBeds.bed1, greenhouseBeds.bed2].filter((b) => b.unlocked && b.cropType !== null);
  const batteryDelta = Math.round(powerBreakdown.generationPerDay - powerBreakdown.totalDemandPerDay);

  // Remaining days estimates
  const oxygenDaysLeft = resources.oxygen > 0 ? (resources.oxygen / 6.0).toFixed(1) : '0';
  const waterDemandDaily = 4.0 + activeBeds.length * 2.0;
  const netWaterDaily = Math.max(0.5, waterDemandDaily - (waterDemandDaily * 0.75 * (systems.recycler.condition / 100)));
  const waterDaysLeft = (resources.water / netWaterDaily).toFixed(1);
  const foodDaysLeft = (resources.food / 3.5).toFixed(1);

  // Crew health summary
  const crewList = Object.values(crew);
  const minHealth = Math.min(...crewList.map((c) => c.health));
  const avgHealth = Math.round(crewList.reduce((acc, c) => acc + c.health, 0) / crewList.length);

  // Radiation summary
  const totalExposure = Math.max(...crewList.map((c) => c.exposure));

  const items = [
    {
      id: 'battery' as const,
      icon: Zap,
      iconColor: '#38bdf8',
      name: 'Power',
      value: `${Math.round(resources.battery)}%`,
      trend: `${batteryDelta >= 0 ? '+' : ''}${batteryDelta}/d`,
      percent: resources.battery,
      isWarning: resources.battery < 45,
      isCritical: resources.battery < 20,
    },
    {
      id: 'oxygen' as const,
      icon: Wind,
      iconColor: '#22c55e',
      name: 'Oxygen',
      value: `${Math.round(resources.oxygen)}%`,
      trend: `${oxygenDaysLeft}d left`,
      percent: resources.oxygen,
      isWarning: resources.oxygen < 40,
      isCritical: resources.oxygen < 20,
    },
    {
      id: 'water' as const,
      icon: Droplets,
      iconColor: '#38bdf8',
      name: 'Water',
      value: `${Math.round(resources.water)}%`,
      trend: `${waterDaysLeft}d left`,
      percent: resources.water,
      isWarning: resources.water < 40,
      isCritical: resources.water < 20,
    },
    {
      id: 'food' as const,
      icon: Wheat,
      iconColor: '#22c55e',
      name: 'Food',
      value: `${Math.round(resources.food)}%`,
      trend: `${foodDaysLeft}d left`,
      percent: resources.food,
      isWarning: resources.food < 40,
      isCritical: resources.food < 20,
    },
    {
      id: 'health' as const,
      icon: HeartPulse,
      iconColor: '#ec4899',
      name: 'Crew Health',
      value: `${avgHealth}%`,
      trend: `min ${minHealth}%`,
      percent: avgHealth,
      isWarning: minHealth < 70,
      isCritical: minHealth < 40,
    },
    {
      id: 'radiation' as const,
      icon: Radiation,
      iconColor: '#f59e0b',
      name: 'Radiation',
      value: `${totalExposure} pts`,
      trend: totalExposure >= 60 ? 'HIGH' : totalExposure >= 30 ? 'MODERATE' : 'NOMINAL',
      percent: Math.min(100, (totalExposure / 100) * 100),
      isWarning: totalExposure >= 30,
      isCritical: totalExposure >= 60,
    },
    {
      id: 'comms' as const,
      icon: Radio,
      iconColor: '#38bdf8',
      name: 'Comms',
      value: `${systems.comms.condition}%`,
      trend: systems.comms.isFaulted ? 'FAULT' : 'ONLINE',
      percent: systems.comms.condition,
      isWarning: systems.comms.condition < 60,
      isCritical: systems.comms.isFaulted || systems.comms.condition < 25,
    },
  ];

  const handleSelectResource = (id: typeof items[number]['id']) => {
    if (selectedEntity?.type === 'resource' && selectedEntity.id === id) {
      setSelectedEntity(null);
    } else {
      setSelectedEntity({ type: 'resource', id });
      eventBus.emit('sound:play', { name: 'click' });
    }
  };

  return (
    <div className="h-9 bg-[#0b1322]/95 border-b border-[#26374D] px-4 flex items-center justify-between gap-1.5 select-none z-20 backdrop-blur-md shadow-md pointer-events-auto">
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full">
        {items.map((item) => {
          const isSelected = selectedEntity?.type === 'resource' && selectedEntity.id === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => handleSelectResource(item.id)}
              className={`flex-1 min-w-[125px] max-w-[175px] h-7 px-2 rounded flex items-center justify-between gap-1.5 transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-[#152235] border-[#25C5F4] shadow-[0_0_8px_rgba(37,197,244,0.25)]'
                  : item.isCritical
                  ? 'bg-[#ef4444]/15 border-[#ef4444]/60 hover:bg-[#ef4444]/25'
                  : item.isWarning
                  ? 'bg-[#f59e0b]/10 border-[#f59e0b]/50 hover:bg-[#f59e0b]/20'
                  : 'bg-[#080F1B]/60 border-[#26374D]/80 hover:border-[#25C5F4]/60 hover:bg-[#152235]/60'
              }`}
              title={`Inspect ${item.name} Breakdown`}
            >
              {/* Icon & Name */}
              <div className="flex items-center gap-1.5 truncate">
                <Icon
                  className="w-3.5 h-3.5 shrink-0"
                  style={{ color: item.isCritical ? '#ef4444' : item.isWarning ? '#f59e0b' : item.iconColor }}
                />
                <span className="text-[11px] font-semibold text-[#94A3B8] truncate leading-none">
                  {item.name}
                </span>
              </div>

              {/* Value & Trend */}
              <div className="flex items-baseline gap-1 text-right shrink-0">
                <span
                  className={`text-xs font-mono font-bold leading-none ${
                    item.isCritical
                      ? 'text-[#ef4444]'
                      : item.isWarning
                      ? 'text-[#f59e0b]'
                      : 'text-[#F1F5F9]'
                  }`}
                >
                  {item.value}
                </span>
                <span className="text-[9px] font-mono text-[#64748b] leading-none">
                  {item.trend}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
