/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/ui/ResourceDashboard.tsx
 * Compact Resource Monitoring Panel (Area B).
 * Sleek, high-density telemetry strip with interactive deep-dive inspection.
 */

import React from 'react';
import { useGameStore } from '../store/store.ts';
import { eventBus } from '../store/bus.ts';

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
      icon: '⚡',
      name: 'Power',
      value: `${Math.round(resources.battery)}%`,
      trend: `${batteryDelta >= 0 ? '+' : ''}${batteryDelta}/d`,
      percent: resources.battery,
      status: resources.battery < 20 ? 'critical' : resources.battery < 45 ? 'warning' : 'nominal',
      statusColor: resources.battery < 20 ? '#EF4444' : resources.battery < 45 ? '#F59E0B' : '#25C5F4',
    },
    {
      id: 'oxygen' as const,
      icon: '🫁',
      name: 'Oxygen',
      value: `${Math.round(resources.oxygen)}%`,
      trend: `${oxygenDaysLeft}d`,
      percent: resources.oxygen,
      status: resources.oxygen < 20 ? 'critical' : resources.oxygen < 40 ? 'warning' : 'nominal',
      statusColor: resources.oxygen < 20 ? '#EF4444' : resources.oxygen < 40 ? '#F59E0B' : '#22C55E',
    },
    {
      id: 'water' as const,
      icon: '💧',
      name: 'Water',
      value: `${Math.round(resources.water)}%`,
      trend: `${waterDaysLeft}d`,
      percent: resources.water,
      status: resources.water < 20 ? 'critical' : resources.water < 40 ? 'warning' : 'nominal',
      statusColor: resources.water < 20 ? '#EF4444' : resources.water < 40 ? '#F59E0B' : '#25C5F4',
    },
    {
      id: 'food' as const,
      icon: '🥗',
      name: 'Food',
      value: `${Math.round(resources.food)}%`,
      trend: `${foodDaysLeft}d`,
      percent: resources.food,
      status: resources.food < 20 ? 'critical' : resources.food < 40 ? 'warning' : 'nominal',
      statusColor: resources.food < 20 ? '#EF4444' : resources.food < 40 ? '#F59E0B' : '#22C55E',
    },
    {
      id: 'health' as const,
      icon: '❤️',
      name: 'Crew Health',
      value: `${avgHealth}%`,
      trend: `min ${minHealth}%`,
      percent: avgHealth,
      status: minHealth < 40 ? 'critical' : minHealth < 70 ? 'warning' : 'nominal',
      statusColor: minHealth < 40 ? '#EF4444' : minHealth < 70 ? '#F59E0B' : '#22C55E',
    },
    {
      id: 'radiation' as const,
      icon: '🛡️',
      name: 'Radiation',
      value: `${totalExposure} pts`,
      trend: totalExposure >= 60 ? 'HIGH' : totalExposure >= 30 ? 'MOD' : 'SAFE',
      percent: Math.min(100, (totalExposure / 100) * 100),
      status: totalExposure >= 60 ? 'critical' : totalExposure >= 30 ? 'warning' : 'nominal',
      statusColor: totalExposure >= 60 ? '#EF4444' : totalExposure >= 30 ? '#F59E0B' : '#22C55E',
    },
    {
      id: 'comms' as const,
      icon: '📡',
      name: 'Comms',
      value: `${systems.comms.condition}%`,
      trend: systems.comms.isFaulted ? 'OFFLINE' : 'ONLINE',
      percent: systems.comms.condition,
      status: systems.comms.isFaulted || systems.comms.condition < 25 ? 'critical' : systems.comms.condition < 60 ? 'warning' : 'nominal',
      statusColor: systems.comms.isFaulted || systems.comms.condition < 25 ? '#EF4444' : systems.comms.condition < 60 ? '#F59E0B' : '#25C5F4',
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
    <div className="h-9 bg-[#101A29]/95 border-b border-[#26374D] px-4 flex items-center justify-between gap-1.5 select-none z-20 backdrop-blur-md shadow-md pointer-events-auto">
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full">
        {items.map((item) => {
          const isSelected = selectedEntity?.type === 'resource' && selectedEntity.id === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelectResource(item.id)}
              className={`flex-1 min-w-[125px] max-w-[175px] h-7 px-2 rounded-md flex items-center justify-between gap-1.5 transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-[#152235] border-[#25C5F4] shadow-[0_0_8px_rgba(37,197,244,0.2)]'
                  : 'bg-[#080F1B]/60 border-[#26374D]/80 hover:border-[#25C5F4]/60 hover:bg-[#152235]/60'
              }`}
              title={`Inspect ${item.name} Telemetry & Physics Breakdown`}
            >
              {/* Icon & Name */}
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-xs leading-none">{item.icon}</span>
                <span className="text-[11px] font-semibold text-[#94A3B8] truncate leading-none">
                  {item.name}
                </span>
              </div>

              {/* Value & Micro Trend */}
              <div className="flex items-center gap-1.5 shrink-0 font-mono leading-none">
                <span className="text-xs font-black text-[#F1F5F9]">{item.value}</span>
                <span
                  className="text-[9px] font-semibold px-1 py-0.2 rounded"
                  style={{
                    color: item.statusColor,
                    backgroundColor: `${item.statusColor}1A`,
                  }}
                >
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
