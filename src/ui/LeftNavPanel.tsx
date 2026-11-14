/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/ui/LeftNavPanel.tsx
 * Left navigation rail and expandable drawers for Base Overview, Buildings, Construction, Rover, Research, Objectives, Achievements, and Statistics.
 */

import React from 'react';
import { useGameStore, ActiveNavTab } from '../store/store.ts';
import { BuildingId, CrewId, ResearchProjectId, RoverDestinationId, ConstructionProjectId } from '../sim/types.ts';
import { RESEARCH_PROJECTS } from '../sim/rules/research.ts';
import { ROVER_DESTINATIONS } from '../sim/rules/rover.ts';
import { CONSTRUCTION_PROJECTS } from '../sim/rules/construction.ts';
import { getCrewDisplayName } from '../sim/rules/crew.ts';

const NAV_ITEMS: { id: ActiveNavTab; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: '🌐' },
  { id: 'buildings', label: 'Modules', icon: '🏢' },
  { id: 'construction', label: 'Expansion', icon: '🏗️' },
  { id: 'rover', label: 'Rover Expeditions', icon: '🚜' },
  { id: 'research', label: 'Research Lab', icon: '🔬' },
  { id: 'astronauts', label: 'Astronauts', icon: '👨‍🚀' },
  { id: 'objectives', label: 'Objectives', icon: '🎯' },
  { id: 'achievements', label: 'Achievements', icon: '🏆' },
  { id: 'stats', label: 'Statistics', icon: '📊' },
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
    <div className="absolute left-4 top-28 bottom-28 z-20 flex pointer-events-none select-none">
      {/* Icon Rail */}
      <div className="flex flex-col gap-1.5 p-1.5 bg-[#080E19]/90 border border-[#293A50] rounded-2xl shadow-2xl backdrop-blur-md pointer-events-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = activeNavTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => toggleTab(item.id)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all cursor-pointer relative group ${
                isActive
                  ? 'bg-[#36C5F0] text-[#080E19] shadow-lg shadow-[#36C5F0]/20 scale-105'
                  : 'bg-[#17263A] text-[#A7B4C8] hover:bg-[#293A50] hover:text-[#F4F7FC]'
              }`}
              title={item.label}
            >
              <span>{item.icon}</span>
              {/* Tooltip on hover */}
              <span className="absolute left-full ml-2 px-2 py-1 rounded bg-[#17263A] text-white text-[10px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity border border-[#293A50] shadow-xl pointer-events-none z-50">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Expandable Content Drawer */}
      {activeNavTab && (
        <div className="ml-2 w-80 bg-[#080E19]/95 border border-[#293A50] rounded-2xl shadow-2xl backdrop-blur-xl pointer-events-auto flex flex-col overflow-hidden animate-fadeIn text-[#F4F7FC]">
          {/* Drawer Header */}
          <div className="flex items-center justify-between p-3.5 border-b border-[#293A50] bg-[#111C2D]">
            <div className="flex items-center gap-2">
              <span className="text-lg">
                {NAV_ITEMS.find((n) => n.id === activeNavTab)?.icon}
              </span>
              <h3 className="text-sm font-black uppercase tracking-wider text-[#F4F7FC]">
                {NAV_ITEMS.find((n) => n.id === activeNavTab)?.label}
              </h3>
            </div>
            <button
              onClick={() => setActiveNavTab(null)}
              className="w-6 h-6 rounded flex items-center justify-center text-[#A7B4C8] hover:text-white hover:bg-[#17263A] text-xs font-bold transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Drawer Scrollable Body */}
          <div className="p-3 overflow-y-auto space-y-3 max-h-[calc(100vh-250px)]">
            {/* TAB: OVERVIEW */}
            {activeNavTab === 'overview' && (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-[#17263A] border border-[#293A50]">
                  <div className="text-[10px] font-bold text-[#36C5F0] uppercase tracking-wider">
                    Base Operational Status
                  </div>
                  <div className="text-base font-black mt-0.5 text-white">
                    {state.mission.day >= 16 && state.mission.day <= 22
                      ? 'Lunar Night Conservation Phase'
                      : 'Nominal South Polar Operations'}
                  </div>
                  <p className="text-xs text-[#A7B4C8] mt-1">
                    Solar arrays are producing {Math.round(state.powerBreakdown.generationPerDay)} kWh/day at{' '}
                    {Math.round(state.powerBreakdown.sunlightFactor * 100)}% sunlight factor.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-[#17263A] border border-[#293A50]">
                    <div className="text-[10px] text-[#A7B4C8]">Spare Parts</div>
                    <div className="text-lg font-black text-white font-mono">
                      {state.resources.spareParts} units
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#17263A] border border-[#293A50]">
                    <div className="text-[10px] text-[#A7B4C8]">Total Science</div>
                    <div className="text-lg font-black text-[#36C5F0] font-mono">
                      {state.resources.science} pts
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#17263A] border border-[#293A50]">
                  <div className="text-[10px] font-bold text-[#A7B4C8] uppercase tracking-wider mb-1">
                    Load Priority Order
                  </div>
                  <div className="space-y-1 text-xs">
                    {state.powerPriority.map((p, idx) => (
                      <div key={p} className="flex items-center justify-between font-mono text-[11px] text-[#A7B4C8]">
                        <span className="capitalize">{idx + 1}. {p.replace('_', ' ')}</span>
                        <span className="text-[#37D67A]">Active</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: BUILDINGS */}
            {activeNavTab === 'buildings' && (
              <div className="space-y-2">
                {[
                  ['habitat', 'Habitat Base', '🏠'],
                  ['power_station', 'Solar Power Array', '⚡'],
                  ['greenhouse', 'Hydroponic Greenhouse', '🌱'],
                  ['recycler', 'Water Recycler', '💧'],
                  ['shelter', 'Radiation Shelter', '☢️'],
                  ['laboratory', 'Research Laboratory', '🔬'],
                  ['comms', 'Comms Dish', '📡'],
                  ['rover_bay', 'Rover Bay', '🚜'],
                ].map(([bid, bname, bicon]) => (
                  <button
                    key={bid}
                    onClick={() => {
                      setSelectedEntity({ type: 'building', id: bid as BuildingId });
                    }}
                    className="w-full p-2.5 rounded-xl bg-[#17263A] hover:bg-[#293A50] border border-[#293A50] flex items-center justify-between text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{bicon}</span>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-[#36C5F0] transition-colors">
                          {bname}
                        </div>
                        <div className="text-[10px] text-[#A7B4C8]">Click to inspect & upgrade</div>
                      </div>
                    </div>
                    <span className="text-[#36C5F0] text-xs">➔</span>
                  </button>
                ))}
              </div>
            )}

            {/* TAB: CONSTRUCTION */}
            {activeNavTab === 'construction' && (
              <div className="space-y-2.5">
                <p className="text-xs text-[#A7B4C8]">
                  Build base expansion modules to increase storage capacity and survive the 30-day mission.
                </p>
                {Object.values(CONSTRUCTION_PROJECTS).map((proj) => {
                  const cstate = state.construction?.[proj.id];
                  const isBuilt = cstate?.built;
                  const inProgress = cstate?.inProgress;
                  return (
                    <div key={proj.id} className="p-3 rounded-xl bg-[#17263A] border border-[#293A50] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{proj.name}</span>
                        {isBuilt ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#37D67A]/20 text-[#37D67A] border border-[#37D67A]/40">
                            BUILT
                          </span>
                        ) : inProgress ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#F5B942]/20 text-[#F5B942] animate-pulse">
                            {cstate.progressTicks}/{proj.hoursNeeded}h
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#A7B4C8] font-mono">
                            {proj.costParts} parts • {proj.costPower} pwr
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#A7B4C8]">{proj.description}</p>
                      <div className="text-[10px] text-[#36C5F0] font-medium">{proj.benefit}</div>
                      {!isBuilt && !inProgress && (
                        <button
                          onClick={() => {
                            dispatch({
                              type: 'START_CONSTRUCTION',
                              projectId: proj.id as ConstructionProjectId,
                              crewId: 'alex',
                            });
                          }}
                          className="w-full mt-1.5 py-1.5 rounded-lg bg-[#36C5F0] hover:bg-[#36C5F0]/80 text-[#080E19] text-xs font-black transition-all cursor-pointer"
                        >
                          Build Project (Assign Alex)
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
                <div className="p-2.5 rounded-xl bg-[#17263A] border border-[#293A50] flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[#A7B4C8]">Rover Status:</span>{' '}
                    <strong className={state.rover.isAway ? 'text-[#F5B942]' : 'text-[#37D67A]'}>
                      {state.rover.isAway ? 'Expedition in Progress' : 'Docked at Bay'}
                    </strong>
                  </div>
                  <div className="font-mono text-[#36C5F0]">
                    {state.rover.condition}% Condition
                  </div>
                </div>

                <div className="text-[11px] text-[#A7B4C8]">
                  Select a lunar south pole site to launch an exploration expedition:
                </div>

                {Object.values(ROVER_DESTINATIONS).map((dest) => (
                  <div key={dest.id} className="p-3 rounded-xl bg-[#17263A] border border-[#293A50] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{dest.name}</span>
                      <span className="text-[10px] font-mono text-[#36C5F0]">
                        +{dest.scienceYield} Science
                      </span>
                    </div>
                    <p className="text-[11px] text-[#A7B4C8]">{dest.description}</p>
                    <div className="flex items-center justify-between text-[10px] text-[#A7B4C8] font-mono">
                      <span>Distance: {dest.distanceKm} km</span>
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
                      className="w-full mt-1 py-1.5 rounded-lg bg-[#36C5F0] hover:bg-[#36C5F0]/80 disabled:opacity-50 text-[#080E19] text-xs font-black transition-all cursor-pointer"
                    >
                      Launch Expedition (Daniel & Sara)
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* TAB: RESEARCH LAB */}
            {activeNavTab === 'research' && (
              <div className="space-y-2.5">
                <div className="p-2.5 rounded-xl bg-[#17263A] border border-[#293A50] flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[#A7B4C8]">Lab State:</span>{' '}
                    <strong className={state.lab.activeExperiment ? 'text-[#36C5F0]' : 'text-[#A7B4C8]'}>
                      {state.lab.activeExperiment ? 'Research Active' : 'Idle'}
                    </strong>
                  </div>
                  <div className="font-mono text-[#37D67A]">
                    {state.lab.completedProjects?.length || 0}/6 Done
                  </div>
                </div>

                {Object.values(RESEARCH_PROJECTS).map((proj) => {
                  const isCompleted = state.lab.completedProjects?.includes(proj.id as ResearchProjectId);
                  const isCurrent = state.lab.activeProject === proj.id;
                  return (
                    <div key={proj.id} className="p-3 rounded-xl bg-[#17263A] border border-[#293A50] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{proj.name}</span>
                        {isCompleted ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#37D67A]/20 text-[#37D67A] border border-[#37D67A]/40">
                            COMPLETED
                          </span>
                        ) : isCurrent ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#36C5F0]/20 text-[#36C5F0] animate-pulse">
                            IN PROGRESS
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-[#36C5F0]">
                            +{proj.scienceReward} Science
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#A7B4C8]">{proj.description}</p>
                      <div className="text-[10px] text-[#37D67A]">{proj.perkUnlocked}</div>
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
                          className="w-full mt-1 py-1.5 rounded-lg bg-[#36C5F0] hover:bg-[#36C5F0]/80 disabled:opacity-50 text-[#080E19] text-xs font-black transition-all cursor-pointer"
                        >
                          Start Investigation (Sara)
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB: ASTRONAUTS */}
            {activeNavTab === 'astronauts' && (
              <div className="space-y-2">
                {(Object.keys(state.crew) as CrewId[]).map((cid) => {
                  const member = state.crew[cid];
                  const info = getCrewDisplayName(member);
                  return (
                    <button
                      key={cid}
                      onClick={() => setSelectedEntity({ type: 'crew', id: cid })}
                      className="w-full p-2.5 rounded-xl bg-[#17263A] hover:bg-[#293A50] border border-[#293A50] text-left transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-white">{info.shortName}</span>
                        <span className="text-[#37D67A] font-mono">{member.health} HP</span>
                      </div>
                      <div className="text-[10px] text-[#36C5F0] font-medium">{info.role}</div>
                      <div className="text-[10px] text-[#A7B4C8] mt-1 font-mono">
                        Stamina: {member.stamina}/8h • 📍 {member.location}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* TAB: OBJECTIVES */}
            {activeNavTab === 'objectives' && (
              <div className="space-y-2.5">
                {state.objectives?.map((obj) => (
                  <div key={obj.id} className="p-3 rounded-xl bg-[#17263A] border border-[#293A50] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{obj.title}</span>
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          obj.isCompleted ? 'bg-[#37D67A]/20 text-[#37D67A]' : 'bg-[#111C2D] text-[#A7B4C8]'
                        }`}
                      >
                        {obj.isCompleted ? 'DONE' : `${obj.progress}/${obj.target} ${obj.unit}`}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#A7B4C8]">{obj.description}</p>
                    <div className="w-full h-1 bg-[#080E19] rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-[#36C5F0] rounded-full transition-all"
                        style={{ width: `${Math.min(100, (obj.progress / obj.target) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB: ACHIEVEMENTS */}
            {activeNavTab === 'achievements' && (
              <div className="space-y-2">
                {state.achievements?.map((ach) => (
                  <div
                    key={ach.id}
                    className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all ${
                      ach.unlocked
                        ? 'bg-[#17263A] border-[#36C5F0]/60'
                        : 'bg-[#111C2D]/60 border-[#293A50] opacity-60'
                    }`}
                  >
                    <span className="text-2xl">{ach.icon}</span>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{ach.title}</span>
                        {ach.unlocked && (
                          <span className="text-[9px] text-[#37D67A] font-bold">UNLOCKED (D{ach.unlockedDay})</span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#A7B4C8]">{ach.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB: STATISTICS */}
            {activeNavTab === 'stats' && (
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-[#17263A] border border-[#293A50] space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-[#A7B4C8]">Oxygen Maintained Nominal:</span>
                    <strong className="text-white font-mono">{state.stats.daysOxygenNotRed} days</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#A7B4C8]">Battery Above 20%:</span>
                    <strong className="text-white font-mono">{state.stats.daysBatteryAbove20} days</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#A7B4C8]">Solar Storms Survived:</span>
                    <strong className="text-[#36C5F0] font-mono">{state.stats.advisoriesSurvived}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#A7B4C8]">Soil Samples Collected:</span>
                    <strong className="text-white font-mono">{state.stats.samplesCollected}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#A7B4C8]">Decisions Resolved:</span>
                    <strong className="text-white font-mono">{state.stats.decisionsMade.length}</strong>
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

