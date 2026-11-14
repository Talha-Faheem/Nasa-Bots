/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/ui/LeftNavPanel.tsx
 * Professional Navigation Sidebar & Management Drawers (Area D).
 * Narrow icon rail with structured drawers for Base Overview, Crew, Infrastructure, Operations, Research, Rover, Expansion, Inventory, Objectives, Achievements, and Analytics.
 */

import React from 'react';
import { useGameStore, ActiveNavTab } from '../store/store.ts';
import { BuildingId, CrewId, ResearchProjectId, RoverDestinationId, ConstructionProjectId } from '../sim/types.ts';
import { RESEARCH_PROJECTS } from '../sim/rules/research.ts';
import { ROVER_DESTINATIONS } from '../sim/rules/rover.ts';
import { CONSTRUCTION_PROJECTS } from '../sim/rules/construction.ts';
import { getCrewDisplayName } from '../sim/rules/crew.ts';
import { eventBus } from '../store/bus.ts';

const NAV_ITEMS: { id: ActiveNavTab; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: '🌐' },
  { id: 'astronauts', label: 'Crew Management', icon: '👨‍🚀' },
  { id: 'buildings', label: 'Base Infrastructure', icon: '🏢' },
  { id: 'operations', label: 'Mission Operations', icon: '⚡' },
  { id: 'research', label: 'Research Lab', icon: '🔬' },
  { id: 'rover', label: 'Rover Expeditions', icon: '🚜' },
  { id: 'construction', label: 'Base Expansion', icon: '🏗️' },
  { id: 'inventory', label: 'Inventory & Storage', icon: '📦' },
  { id: 'objectives', label: 'Objectives', icon: '🎯' },
  { id: 'achievements', label: 'Achievements', icon: '🏆' },
  { id: 'stats', label: 'Analytics', icon: '📊' },
];

export const LeftNavPanel: React.FC = () => {
  const activeNavTab = useGameStore((s) => s.activeNavTab);
  const setActiveNavTab = useGameStore((s) => s.setActiveNavTab);
  const setSelectedEntity = useGameStore((s) => s.setSelectedEntity);
  const state = useGameStore((s) => s.state);
  const dispatch = useGameStore((s) => s.dispatch);

  const toggleTab = (tab: ActiveNavTab) => {
    setActiveNavTab(activeNavTab === tab ? null : tab);
  };

  return (
    <div className="absolute left-3 top-24 bottom-20 z-20 flex pointer-events-none select-none">
      {/* Narrow Icon Rail */}
      <div className="flex flex-col gap-1 p-1 bg-[#080F1B]/95 border border-[#26374D] rounded-xl shadow-xl backdrop-blur-md pointer-events-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = activeNavTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => toggleTab(item.id)}
              className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm transition-all cursor-pointer relative group ${
                isActive
                  ? 'bg-[#25C5F4] text-[#080F1B] font-bold shadow-[0_0_8px_rgba(37,197,244,0.3)]'
                  : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#152235]'
              }`}
              title={item.label}
              aria-label={item.label}
            >
              <span>{item.icon}</span>
              {/* Tooltip on hover */}
              <span className="absolute left-full ml-2 px-2 py-1 rounded bg-[#101A29] text-[#F1F5F9] text-[10px] font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity border border-[#26374D] shadow-xl pointer-events-none z-50">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Expandable Management Drawer */}
      {activeNavTab && (
        <div className="ml-2 w-84 bg-[#080F1B]/95 border border-[#26374D] rounded-xl shadow-2xl backdrop-blur-xl pointer-events-auto flex flex-col overflow-hidden animate-fadeIn text-[#F1F5F9]">
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-[#26374D] bg-[#101A29]">
            <div className="flex items-center gap-2">
              <span className="text-base">
                {NAV_ITEMS.find((n) => n.id === activeNavTab)?.icon}
              </span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#F1F5F9]">
                {NAV_ITEMS.find((n) => n.id === activeNavTab)?.label}
              </h3>
            </div>
            <button
              onClick={() => setActiveNavTab(null)}
              className="w-6 h-6 rounded flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-[#152235] text-xs font-bold transition-colors cursor-pointer"
              title="Close Drawer"
            >
              ✕
            </button>
          </div>

          {/* Drawer Scrollable Body */}
          <div className="p-3 overflow-y-auto space-y-3 max-h-[calc(100vh-200px)] text-xs">
            {/* TAB: OVERVIEW */}
            {activeNavTab === 'overview' && (
              <div className="space-y-3">
                <div className="p-2.5 rounded-lg bg-[#101A29] border border-[#26374D]">
                  <div className="text-[10px] font-bold text-[#25C5F4] uppercase tracking-wider">
                    Base Operational Status
                  </div>
                  <div className="text-sm font-black mt-0.5 text-white">
                    {state.mission.day >= 16 && state.mission.day <= 22
                      ? 'Lunar Night Conservation Phase'
                      : 'Nominal South Polar Operations'}
                  </div>
                  <p className="text-[11px] text-[#94A3B8] mt-1">
                    Solar arrays producing {Math.round(state.powerBreakdown.generationPerDay)} kWh/day at{' '}
                    {Math.round(state.powerBreakdown.sunlightFactor * 100)}% sunlight factor.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-[#101A29] border border-[#26374D]">
                    <div className="text-[10px] text-[#94A3B8]">Spare Parts Buffer</div>
                    <div className="text-base font-black text-white font-mono mt-0.5">
                      {state.resources.spareParts} units
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#101A29] border border-[#26374D]">
                    <div className="text-[10px] text-[#94A3B8]">Research Points</div>
                    <div className="text-base font-black text-[#25C5F4] font-mono mt-0.5">
                      {state.resources.science} pts
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#101A29] border border-[#26374D]">
                  <div className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1.5">
                    Subsystem Load Priorities
                  </div>
                  <div className="space-y-1">
                    {state.powerPriority.map((p, idx) => (
                      <div key={p} className="flex items-center justify-between font-mono text-[11px] text-[#94A3B8]">
                        <span className="capitalize">{idx + 1}. {p.replace('_', ' ')}</span>
                        <span className="text-[#22C55E]">Active</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: CREW MANAGEMENT */}
            {activeNavTab === 'astronauts' && (
              <div className="space-y-2">
                <div className="text-[11px] text-[#94A3B8] mb-1">
                  Click an astronaut to open their dossier and assign tasks:
                </div>
                {(Object.keys(state.crew) as CrewId[]).map((cid) => {
                  const member = state.crew[cid];
                  const info = getCrewDisplayName(member);
                  const isWorking = !!member.currentTask;
                  return (
                    <button
                      key={cid}
                      onClick={() => setSelectedEntity({ type: 'crew', id: cid })}
                      className="w-full p-2.5 rounded-lg bg-[#101A29] hover:bg-[#152235] border border-[#26374D] hover:border-[#25C5F4]/60 text-left transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-white group-hover:text-[#25C5F4] transition-colors">
                          {member.name}
                        </span>
                        <span className="text-[#22C55E] font-mono">{member.health} HP</span>
                      </div>
                      <div className="text-[10px] text-[#25C5F4] font-medium mt-0.5">{info.role}</div>
                      <div className="flex items-center justify-between text-[10px] text-[#94A3B8] mt-1.5 font-mono">
                        <span>Stamina: {member.stamina}/8h</span>
                        <span className={`px-1 rounded text-[9px] font-bold ${isWorking ? 'bg-[#25C5F4]/20 text-[#25C5F4]' : 'bg-[#152235] text-[#94A3B8]'}`}>
                          {isWorking ? 'WORKING' : 'IDLE'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* TAB: BASE INFRASTRUCTURE */}
            {activeNavTab === 'buildings' && (
              <div className="space-y-2">
                <div className="text-[11px] text-[#94A3B8] mb-1">
                  Select a module to inspect telemetry and perform maintenance:
                </div>
                {[
                  ['habitat', 'Habitat Base', '🏠'],
                  ['power_station', 'Solar Power Array', '⚡'],
                  ['greenhouse', 'Hydroponic Greenhouse', '🌱'],
                  ['recycler', 'Water Recycler', '💧'],
                  ['shelter', 'Radiation Shelter', '☢️'],
                  ['laboratory', 'Research Laboratory', '🔬'],
                  ['comms', 'Comms Dish', '📡'],
                  ['rover_bay', 'Rover Bay', '🚜'],
                ].map(([bid, bname, bicon]) => {
                  let condition = 100;
                  let isFaulted = false;
                  if (bid === 'power_station') {
                    condition = state.systems.solarArray.condition;
                    isFaulted = state.systems.solarArray.isFaulted;
                  } else if (bid === 'habitat') {
                    condition = state.systems.lifeSupport.condition;
                    isFaulted = state.systems.lifeSupport.isFaulted;
                  } else if (bid === 'recycler') {
                    condition = state.systems.recycler.condition;
                    isFaulted = state.systems.recycler.isFaulted;
                  } else if (bid === 'greenhouse') {
                    condition = state.systems.greenhouse.condition;
                    isFaulted = state.systems.greenhouse.isFaulted;
                  } else if (bid === 'comms') {
                    condition = state.systems.comms.condition;
                    isFaulted = state.systems.comms.isFaulted;
                  } else if (bid === 'rover_bay') {
                    condition = state.rover.condition;
                    isFaulted = state.rover.isFaulted;
                  }

                  return (
                    <button
                      key={bid}
                      onClick={() => {
                        setSelectedEntity({ type: 'building', id: bid as BuildingId });
                        eventBus.emit('camera:focus', { buildingId: bid as BuildingId });
                      }}
                      className="w-full p-2.5 rounded-lg bg-[#101A29] hover:bg-[#152235] border border-[#26374D] hover:border-[#25C5F4]/60 text-left transition-all cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{bicon}</span>
                        <div>
                          <div className="text-xs font-bold text-white">{bname}</div>
                          <div className="text-[10px] text-[#94A3B8]">
                            {isFaulted ? '⚠️ Faulted' : condition < 50 ? '⚠️ Damaged' : 'Nominal'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-xs font-mono font-bold ${isFaulted || condition < 40 ? 'text-[#EF4444]' : condition < 70 ? 'text-[#F59E0B]' : 'text-[#22C55E]'}`}>
                          {condition}%
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* TAB: MISSION OPERATIONS */}
            {activeNavTab === 'operations' && (
              <div className="space-y-3">
                <div className="p-2.5 rounded-lg bg-[#101A29] border border-[#26374D]">
                  <div className="text-[10px] font-bold text-[#25C5F4] uppercase tracking-wider mb-1">
                    Greenhouse Lighting Schedule
                  </div>
                  <div className="text-[11px] text-[#94A3B8] mb-2">
                    Controls daily light cycles for crop growth vs power demand.
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {(['low', 'normal', 'high'] as const).map((setting) => (
                      <button
                        key={setting}
                        onClick={() => dispatch({ type: 'SET_GREENHOUSE_LIGHTS', setting })}
                        className={`py-1 text-center font-mono font-bold text-xs rounded transition-all capitalize ${
                          state.greenhouseLightSetting === setting
                            ? 'bg-[#25C5F4] text-[#080F1B]'
                            : 'bg-[#152235] text-[#94A3B8] hover:text-white'
                        }`}
                      >
                        {setting}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#101A29] border border-[#26374D]">
                  <div className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1">
                    Automated Shedding Priority
                  </div>
                  <div className="text-[11px] text-[#94A3B8] mb-2">
                    When battery drops below 20%, low-priority systems shed automatically.
                  </div>
                  <div className="space-y-1">
                    {state.powerPriority.map((p, idx) => (
                      <div key={p} className="p-1.5 rounded bg-[#152235] text-[11px] flex justify-between font-mono">
                        <span className="capitalize">{idx + 1}. {p.replace('_', ' ')}</span>
                        <span className="text-[#25C5F4]">Priority {idx + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: RESEARCH LAB */}
            {activeNavTab === 'research' && (
              <div className="space-y-2.5">
                <div className="text-[11px] text-[#94A3B8]">
                  Investigate lunar data and unlock active base performance perks:
                </div>
                {Object.values(RESEARCH_PROJECTS).map((proj) => {
                  const isCompleted = state.lab.completedProjects?.includes(proj.id);
                  const isCurrent = state.lab.activeProject === proj.id;
                  return (
                    <div key={proj.id} className="p-2.5 rounded-lg bg-[#101A29] border border-[#26374D] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{proj.name}</span>
                        {isCompleted ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#22C55E]/20 text-[#22C55E]">
                            COMPLETED
                          </span>
                        ) : isCurrent ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#25C5F4]/20 text-[#25C5F4] animate-pulse">
                            ACTIVE
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-[#25C5F4]">
                            +{proj.scienceReward} Science
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#94A3B8]">{proj.description}</p>
                      <div className="text-[10px] text-[#22C55E]">{proj.perkUnlocked}</div>
                      {!isCompleted && !isCurrent && (
                        <button
                          disabled={state.lab.activeExperiment}
                          onClick={() => {
                            dispatch({
                              type: 'START_RESEARCH',
                              projectId: proj.id as ResearchProjectId,
                              crewId: 'sara',
                            });
                          }}
                          className="w-full mt-1 py-1 rounded bg-[#25C5F4] hover:bg-[#25C5F4]/80 disabled:opacity-50 text-[#080F1B] text-xs font-bold transition-all cursor-pointer"
                        >
                          Start Investigation (Sara)
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB: ROVER EXPEDITIONS */}
            {activeNavTab === 'rover' && (
              <div className="space-y-2.5">
                <div className="p-2 rounded-lg bg-[#101A29] border border-[#26374D] flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[#94A3B8]">Status:</span>{' '}
                    <strong className={state.rover.isAway ? 'text-[#F59E0B]' : 'text-[#22C55E]'}>
                      {state.rover.isAway ? 'On Expedition' : 'Docked at Bay'}
                    </strong>
                  </div>
                  <div className="font-mono text-[#25C5F4]">
                    {state.rover.condition}% Condition
                  </div>
                </div>

                <div className="text-[11px] text-[#94A3B8]">
                  Select a polar site to launch a geological exploration mission:
                </div>

                {Object.values(ROVER_DESTINATIONS).map((dest) => (
                  <div key={dest.id} className="p-2.5 rounded-lg bg-[#101A29] border border-[#26374D] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{dest.name}</span>
                      <span className="text-[10px] font-mono text-[#25C5F4]">
                        +{dest.scienceYield} Science
                      </span>
                    </div>
                    <p className="text-[11px] text-[#94A3B8]">{dest.description}</p>
                    <div className="flex items-center justify-between text-[10px] text-[#94A3B8] font-mono">
                      <span>{dest.distanceKm} km</span>
                      <span>{dest.travelTicks}h • {dest.batteryCost} power</span>
                    </div>
                    <button
                      disabled={state.rover.isAway || state.rover.condition <= 0}
                      onClick={() => {
                        dispatch({
                          type: 'START_EXPEDITION',
                          destinationId: dest.id as RoverDestinationId,
                          crew1: 'daniel',
                          crew2: 'sara',
                        });
                      }}
                      className="w-full mt-1 py-1 rounded bg-[#25C5F4] hover:bg-[#25C5F4]/80 disabled:opacity-50 text-[#080F1B] text-xs font-bold transition-all cursor-pointer"
                    >
                      Launch Expedition (Daniel & Sara)
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* TAB: BASE EXPANSION */}
            {activeNavTab === 'construction' && (
              <div className="space-y-3">
                <div className="p-2.5 rounded-lg bg-[#101A29] border border-[#26374D] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Sintered Regolith Shield</span>
                    <span className="text-xs font-mono text-[#25C5F4]">
                      {state.resources.shieldLayersBuilt}/3 Layers
                    </span>
                  </div>
                  <p className="text-[11px] text-[#94A3B8]">
                    Sinter lunar soil to create passive radiation and micro-meteoroid barrier.
                  </p>
                  <button
                    disabled={state.resources.shieldLayersBuilt >= 3 || state.resources.spareParts < 1 || state.resources.battery < 8}
                    onClick={() => dispatch({ type: 'BUILD_SHIELD_LAYER' })}
                    className="w-full mt-1 py-1 rounded bg-[#25C5F4] hover:bg-[#25C5F4]/80 disabled:opacity-50 text-[#080F1B] text-xs font-bold transition-all cursor-pointer"
                  >
                    Build Shield Layer (1 Part, 8 Power)
                  </button>
                </div>

                {Object.values(CONSTRUCTION_PROJECTS).map((proj) => {
                  const status = state.construction?.[proj.id];
                  const isBuilt = status?.built;
                  return (
                    <div key={proj.id} className="p-2.5 rounded-lg bg-[#101A29] border border-[#26374D] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{proj.name}</span>
                        {isBuilt && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#22C55E]/20 text-[#22C55E]">
                            BUILT
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#94A3B8]">{proj.description}</p>
                      <div className="text-[10px] text-[#22C55E]">{proj.benefit}</div>
                      {!isBuilt && (
                        <button
                          disabled={state.resources.spareParts < proj.costParts || state.resources.battery < proj.costPower}
                          onClick={() => {
                            dispatch({
                              type: 'START_CONSTRUCTION',
                              projectId: proj.id as ConstructionProjectId,
                              crewId: 'alex',
                            });
                          }}
                          className="w-full mt-1 py-1 rounded bg-[#25C5F4] hover:bg-[#25C5F4]/80 disabled:opacity-50 text-[#080F1B] text-xs font-bold transition-all cursor-pointer"
                        >
                          Build Project (Alex)
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB: INVENTORY & STORAGE */}
            {activeNavTab === 'inventory' && (
              <div className="space-y-2">
                <div className="p-2.5 rounded-lg bg-[#101A29] border border-[#26374D]">
                  <div className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
                    Storage Reserves & Hardware Buffer
                  </div>
                  <div className="space-y-1.5 font-mono text-xs">
                    <div className="flex justify-between py-1 border-b border-[#26374D]">
                      <span className="text-[#94A3B8]">Spare Parts:</span>
                      <span className="text-white font-bold">{state.resources.spareParts} units</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#26374D]">
                      <span className="text-[#94A3B8]">Battery Buffer:</span>
                      <span className="text-white font-bold">{Math.round(state.resources.battery)} / 100 kWh</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#26374D]">
                      <span className="text-[#94A3B8]">Food Packets:</span>
                      <span className="text-white font-bold">{Math.round(state.resources.food)} rations</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#26374D]">
                      <span className="text-[#94A3B8]">Water Reservoir:</span>
                      <span className="text-white font-bold">{Math.round(state.resources.water)} Liters</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-[#94A3B8]">Oxygen Tanks:</span>
                      <span className="text-white font-bold">{Math.round(state.resources.oxygen)} kg</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: OBJECTIVES */}
            {activeNavTab === 'objectives' && (
              <div className="space-y-2">
                <div className="text-[11px] text-[#94A3B8] mb-1">
                  Expedition Milestones & South Pole Mission Goals:
                </div>
                {(state.objectives || []).map((obj) => (
                  <div key={obj.id} className="p-2.5 rounded-lg bg-[#101A29] border border-[#26374D]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{obj.title}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${obj.isCompleted ? 'bg-[#22C55E]/20 text-[#22C55E]' : 'bg-[#152235] text-[#94A3B8]'}`}>
                        {obj.isCompleted ? 'COMPLETED' : 'IN PROGRESS'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#94A3B8] mt-1">{obj.description}</p>
                    <div className="text-[10px] text-[#25C5F4] font-mono mt-1">{obj.rewardDescription}</div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB: ACHIEVEMENTS */}
            {activeNavTab === 'achievements' && (
              <div className="space-y-2">
                <div className="text-[11px] text-[#94A3B8] mb-1">
                  NASA Space Apps Mission Achievements:
                </div>
                {(state.achievements || []).map((ach) => (
                  <div key={ach.id} className={`p-2.5 rounded-lg border ${ach.unlocked ? 'bg-[#101A29] border-[#22C55E]/60' : 'bg-[#101A29]/50 border-[#26374D] opacity-60'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">{ach.icon}</span>
                        <span className="text-xs font-bold text-white">{ach.title}</span>
                      </div>
                      {ach.unlocked && (
                        <span className="text-[9px] font-bold px-1 rounded bg-[#22C55E]/20 text-[#22C55E]">
                          UNLOCKED
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#94A3B8] mt-1">{ach.description}</p>
                  </div>
                ))}
              </div>
            )}

            {/* TAB: ANALYTICS / STATS */}
            {activeNavTab === 'stats' && (
              <div className="space-y-2.5">
                <div className="p-2.5 rounded-lg bg-[#101A29] border border-[#26374D]">
                  <div className="text-[10px] font-bold text-[#25C5F4] uppercase tracking-wider mb-2">
                    Mission Telemetry & Performance
                  </div>
                  <div className="space-y-1 font-mono text-[11px]">
                    <div className="flex justify-between py-0.5 text-[#94A3B8]">
                      <span>Total Time Ticks:</span>
                      <span className="text-white font-bold">{state.mission.totalTicks}</span>
                    </div>
                    <div className="flex justify-between py-0.5 text-[#94A3B8]">
                      <span>Nominal O₂ Days:</span>
                      <span className="text-white font-bold">{state.stats.daysOxygenNotRed}</span>
                    </div>
                    <div className="flex justify-between py-0.5 text-[#94A3B8]">
                      <span>Experiments Done:</span>
                      <span className="text-white font-bold">{state.stats.experimentsCompleted}</span>
                    </div>
                    <div className="flex justify-between py-0.5 text-[#94A3B8]">
                      <span>Core Samples Gathered:</span>
                      <span className="text-white font-bold">{state.stats.samplesCollected}</span>
                    </div>
                    <div className="flex justify-between py-0.5 text-[#94A3B8]">
                      <span>Advisories Survived:</span>
                      <span className="text-white font-bold">{state.stats.advisoriesSurvived}</span>
                    </div>
                    <div className="flex justify-between py-0.5 text-[#94A3B8]">
                      <span>Decisions Resolved:</span>
                      <span className="text-white font-bold">{state.stats.decisionsMade?.length || 0}</span>
                    </div>
                    <div className="flex justify-between py-0.5 text-[#94A3B8]">
                      <span>Total Science Score:</span>
                      <span className="text-[#25C5F4] font-black">{state.resources.science} pts</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
