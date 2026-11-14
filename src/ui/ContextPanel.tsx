/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/ui/ContextPanel.tsx
 * Right contextual inspection panel for Selected Building (Overview, Operations, Upgrades), Astronaut Dossier, and Rover Bay.
 */

import React, { useState } from 'react';
import { useGameStore } from '../store/store.ts';
import { BuildingId, CrewId, CropType } from '../sim/types.ts';
import { getCrewDisplayName } from '../sim/rules/crew.ts';
import { getUpgradesForBuilding } from '../sim/rules/upgrades.ts';

export const ContextPanel: React.FC = () => {
  const selectedEntity = useGameStore((s) => s.selectedEntity);
  const setSelectedEntity = useGameStore((s) => s.setSelectedEntity);
  const state = useGameStore((s) => s.state);
  const dispatch = useGameStore((s) => s.dispatch);

  const [buildingTab, setBuildingTab] = useState<'overview' | 'operations' | 'upgrades'>('overview');
  const [selectedWorker, setSelectedWorker] = useState<CrewId>('alex');
  const [selectedBed, setSelectedBed] = useState<'bed1' | 'bed2'>('bed1');
  const [selectedCrop, setSelectedCrop] = useState<CropType>('quick_greens');

  if (!selectedEntity) return null;

  // RENDER: BUILDING INSPECTION
  if (selectedEntity.type === 'building') {
    const bid = selectedEntity.id;

    // Get condition & system info
    let condition = 100;
    let isFaulted = false;
    let systemName = 'Module System';
    if (bid === 'power_station') {
      condition = state.systems.solarArray.condition;
      isFaulted = state.systems.solarArray.isFaulted;
      systemName = 'Solar Array Subsystem';
    } else if (bid === 'habitat') {
      condition = state.systems.lifeSupport.condition;
      isFaulted = state.systems.lifeSupport.isFaulted;
      systemName = 'Life Support Subsystem';
    } else if (bid === 'recycler') {
      condition = state.systems.recycler.condition;
      isFaulted = state.systems.recycler.isFaulted;
      systemName = 'Water Distillation Unit';
    } else if (bid === 'greenhouse') {
      condition = state.systems.greenhouse.condition;
      isFaulted = state.systems.greenhouse.isFaulted;
      systemName = 'Hydroponic Irrigation';
    } else if (bid === 'comms') {
      condition = state.systems.comms.condition;
      isFaulted = state.systems.comms.isFaulted;
      systemName = 'Phased Array Antenna';
    } else if (bid === 'rover_bay') {
      condition = state.rover.condition;
      isFaulted = state.rover.isFaulted;
      systemName = 'Rover Chassis & Drivetrain';
    }

    let conditionCategory = 'Excellent';
    let conditionColor = 'text-[#37D67A]';
    if (isFaulted || condition === 0) {
      conditionCategory = 'Offline / Faulted';
      conditionColor = 'text-[#FF5B5B]';
    } else if (condition < 40) {
      conditionCategory = 'Critical';
      conditionColor = 'text-[#FF5B5B]';
    } else if (condition < 70) {
      conditionCategory = 'Damaged';
      conditionColor = 'text-[#F5B942]';
    } else if (condition < 90) {
      conditionCategory = 'Good';
      conditionColor = 'text-[#36C5F0]';
    }

    const upgrades = getUpgradesForBuilding(bid);
    const worker = state.crew[selectedWorker];
    const workerInfo = getCrewDisplayName(worker);

    // Fast mechanic bonus
    const isAlex = selectedWorker === 'alex';
    const minorHours = isAlex ? 3 : 4;
    const majorHours = isAlex ? 7 : 8;
    const majorParts = isAlex ? 1 : 2;

    return (
      <div className="absolute right-4 top-28 bottom-28 w-88 bg-[#080E19]/95 border border-[#293A50] rounded-2xl shadow-2xl backdrop-blur-xl z-20 flex flex-col overflow-hidden text-[#F4F7FC] select-none pointer-events-auto animate-fadeIn">
        {/* Header */}
        <div className="p-3.5 border-b border-[#293A50] bg-[#111C2D] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">
              {bid === 'habitat' ? '🏠' : bid === 'power_station' ? '⚡' : bid === 'greenhouse' ? '🌱' : bid === 'recycler' ? '💧' : bid === 'shelter' ? '☢️' : bid === 'laboratory' ? '🔬' : bid === 'comms' ? '📡' : '🚜'}
            </span>
            <div>
              <h3 className="text-sm font-black capitalize text-white tracking-wide">
                {bid.replace('_', ' ')}
              </h3>
              <div className="text-[10px] text-[#36C5F0] font-mono">{systemName}</div>
            </div>
          </div>
          <button
            onClick={() => setSelectedEntity(null)}
            className="w-6 h-6 rounded flex items-center justify-center text-[#A7B4C8] hover:text-white hover:bg-[#17263A] text-xs font-bold transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* 3 Tabs: OVERVIEW, OPERATIONS, UPGRADES */}
        <div className="flex border-b border-[#293A50] bg-[#080E19] text-xs font-bold">
          <button
            onClick={() => setBuildingTab('overview')}
            className={`flex-1 py-2 text-center transition-all cursor-pointer ${
              buildingTab === 'overview'
                ? 'border-b-2 border-[#36C5F0] text-[#36C5F0] bg-[#17263A]/50'
                : 'text-[#A7B4C8] hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setBuildingTab('operations')}
            className={`flex-1 py-2 text-center transition-all cursor-pointer ${
              buildingTab === 'operations'
                ? 'border-b-2 border-[#36C5F0] text-[#36C5F0] bg-[#17263A]/50'
                : 'text-[#A7B4C8] hover:text-white'
            }`}
          >
            Operations
          </button>
          <button
            onClick={() => setBuildingTab('upgrades')}
            className={`flex-1 py-2 text-center transition-all cursor-pointer ${
              buildingTab === 'upgrades'
                ? 'border-b-2 border-[#36C5F0] text-[#36C5F0] bg-[#17263A]/50'
                : 'text-[#A7B4C8] hover:text-white'
            }`}
          >
            Upgrades ({upgrades.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-3.5 overflow-y-auto space-y-3 flex-1 text-xs">
          {/* TAB 1: OVERVIEW */}
          {buildingTab === 'overview' && (
            <div className="space-y-3">
              {/* Condition Banner */}
              <div className="p-3 rounded-xl bg-[#17263A] border border-[#293A50]">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] uppercase font-bold text-[#A7B4C8]">Integrity</span>
                  <span className={`font-bold font-mono ${conditionColor}`}>
                    {condition}% ({conditionCategory})
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#080E19] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      condition < 40 ? 'bg-[#FF5B5B]' : condition < 70 ? 'bg-[#F5B942]' : 'bg-[#37D67A]'
                    }`}
                    style={{ width: `${condition}%` }}
                  />
                </div>
              </div>

              {/* Functional Details */}
              <div className="p-3 rounded-xl bg-[#17263A] border border-[#293A50] space-y-2 text-[#A7B4C8]">
                <div className="flex justify-between">
                  <span>Operating Status:</span>
                  <strong className="text-white">Active / Online</strong>
                </div>
                <div className="flex justify-between">
                  <span>Crew Location:</span>
                  <strong className="text-[#36C5F0]">
                    {Object.values(state.crew).filter((c) => c.location === bid).length} Present
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Power Dependency:</span>
                  <strong className="text-white">
                    {bid === 'habitat' ? '30 kWh / day' : bid === 'recycler' ? '15 kWh / day' : bid === 'greenhouse' ? '10 kWh / day' : 'Nominal'}
                  </strong>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#111C2D] border border-[#293A50] text-[11px] text-[#A7B4C8]">
                <strong className="text-white block mb-0.5">Operational Guidance:</strong>
                Regular diagnostic inspections prevent sudden system breakdowns. Assign Alex Morgan for maintenance discounts.
              </div>
            </div>
          )}

          {/* TAB 2: OPERATIONS */}
          {buildingTab === 'operations' && (
            <div className="space-y-3">
              {/* Assign Astronaut Selector */}
              <div>
                <label className="text-[10px] font-bold text-[#A7B4C8] uppercase tracking-wider block mb-1">
                  Select Astronaut for Task:
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {(Object.keys(state.crew) as CrewId[]).map((cid) => {
                    const c = state.crew[cid];
                    const info = getCrewDisplayName(c);
                    const isSel = selectedWorker === cid;
                    return (
                      <button
                        key={cid}
                        onClick={() => setSelectedWorker(cid)}
                        className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                          isSel
                            ? 'bg-[#36C5F0] text-[#080E19] border-[#36C5F0] font-bold shadow'
                            : 'bg-[#17263A] border-[#293A50] text-[#A7B4C8] hover:text-white'
                        }`}
                      >
                        <div className="text-[10px] font-bold truncate flex items-center justify-center gap-0.5">
                          <span>{info.shortName}</span>
                          {cid === 'alex' && <span>⚡</span>}
                        </div>
                        <div className="text-[8px] opacity-80 truncate">{info.roleShort}</div>
                        <div className="text-[9px] font-mono">{c.stamina}h</div>
                      </button>
                    );
                  })}
                </div>
                <div className="text-[10px] text-[#36C5F0] mt-1">
                  Perk: {worker.name} — <em>{worker.perk}</em>
                </div>
              </div>

              {/* Maintenance Tasks */}
              <div className="space-y-1.5 pt-1 border-t border-[#293A50]">
                {/* Diagnostic */}
                <div className="p-2 rounded-xl bg-[#17263A] border border-[#293A50] flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white text-[11px]">🔍 Diagnostic Inspection</div>
                    <div className="text-[10px] text-[#A7B4C8]">Cost: 2h stamina • 0 parts</div>
                  </div>
                  <button
                    onClick={() => {
                      dispatch({
                        type: 'ASSIGN_TASK',
                        crewId: selectedWorker,
                        taskType: 'inspect',
                        buildingId: bid,
                      });
                    }}
                    className="px-2.5 py-1 rounded bg-[#111C2D] hover:bg-[#36C5F0] hover:text-[#080E19] text-[#36C5F0] font-bold text-[10px] border border-[#36C5F0]/40 transition-colors cursor-pointer"
                  >
                    Inspect
                  </button>
                </div>

                {/* Minor Repair */}
                <div className="p-2 rounded-xl bg-[#17263A] border border-[#293A50] flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white text-[11px]">🔧 Minor Repair (+30 Cond)</div>
                    <div className="text-[10px] text-[#A7B4C8]">Cost: {minorHours}h stamina • 1 part</div>
                  </div>
                  <button
                    disabled={state.resources.spareParts < 1}
                    onClick={() => {
                      dispatch({
                        type: 'ASSIGN_TASK',
                        crewId: selectedWorker,
                        taskType: 'minor_repair',
                        buildingId: bid,
                      });
                    }}
                    className="px-2.5 py-1 rounded bg-[#111C2D] hover:bg-[#F5B942] hover:text-[#080E19] text-[#F5B942] font-bold text-[10px] border border-[#F5B942]/40 disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    Repair
                  </button>
                </div>

                {/* Major Overhaul */}
                <div className="p-2 rounded-xl bg-[#17263A] border border-[#293A50] flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white text-[11px]">⚙️ Major Overhaul (+60 Cond)</div>
                    <div className="text-[10px] text-[#A7B4C8]">Cost: {majorHours}h stamina • {majorParts} parts</div>
                  </div>
                  <button
                    disabled={state.resources.spareParts < majorParts}
                    onClick={() => {
                      dispatch({
                        type: 'ASSIGN_TASK',
                        crewId: selectedWorker,
                        taskType: 'major_repair',
                        buildingId: bid,
                      });
                    }}
                    className="px-2.5 py-1 rounded bg-[#111C2D] hover:bg-[#FF5B5B] hover:text-white text-[#FF5B5B] font-bold text-[10px] border border-[#FF5B5B]/40 disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    Overhaul
                  </button>
                </div>
              </div>

              {/* Specialized Building Operations */}
              {bid === 'greenhouse' && (
                <div className="p-2.5 rounded-xl bg-[#111C2D] border border-[#293A50] space-y-2">
                  <div className="text-[10px] font-bold text-[#37D67A] uppercase">Hydroponic Crop Beds</div>
                  <div className="flex gap-2 text-[10px]">
                    {(['bed1', 'bed2'] as const).map((b) => (
                      <button
                        key={b}
                        onClick={() => setSelectedBed(b)}
                        className={`flex-1 py-1 rounded font-bold transition-colors ${
                          selectedBed === b ? 'bg-[#37D67A] text-[#080E19]' : 'bg-[#17263A] text-[#A7B4C8]'
                        }`}
                      >
                        Bed {b === 'bed1' ? '1' : '2 (D6)'}
                      </button>
                    ))}
                  </div>

                  {state.greenhouseBeds[selectedBed].stage === 'ready' ? (
                    <button
                      onClick={() => {
                        dispatch({
                          type: 'ASSIGN_TASK',
                          crewId: selectedWorker,
                          taskType: 'harvest_crop',
                          buildingId: 'greenhouse',
                          bedId: selectedBed,
                        });
                      }}
                      className="w-full py-1.5 rounded-lg bg-[#37D67A] hover:bg-[#37D67A]/80 text-[#080E19] text-xs font-black shadow-lg cursor-pointer"
                    >
                      Harvest Ripe Crop!
                    </button>
                  ) : state.greenhouseBeds[selectedBed].stage === 'growing' ? (
                    <button
                      onClick={() => {
                        dispatch({
                          type: 'ASSIGN_TASK',
                          crewId: selectedWorker,
                          taskType: 'tend_crop',
                          buildingId: 'greenhouse',
                          bedId: selectedBed,
                        });
                      }}
                      className="w-full py-1.5 rounded-lg bg-[#36C5F0] hover:bg-[#36C5F0]/80 text-[#080E19] text-xs font-black cursor-pointer"
                    >
                      Tend & Water Crop (1h)
                    </button>
                  ) : (
                    <div className="space-y-1.5">
                      <select
                        value={selectedCrop}
                        onChange={(e) => setSelectedCrop(e.target.value as CropType)}
                        className="w-full p-1.5 rounded bg-[#17263A] border border-[#293A50] text-xs text-white"
                      >
                        <option value="quick_greens">Quick Greens (8d, +12 Food)</option>
                        <option value="dwarf_tomatoes">Dwarf Tomatoes (11d, +18 Food)</option>
                        <option value="potatoes">Potatoes (14d, +30 Food)</option>
                      </select>
                      <button
                        onClick={() => {
                          dispatch({
                            type: 'ASSIGN_TASK',
                            crewId: selectedWorker,
                            taskType: 'plant_crop',
                            buildingId: 'greenhouse',
                            bedId: selectedBed,
                            cropType: selectedCrop,
                          });
                        }}
                        className="w-full py-1.5 rounded-lg bg-[#37D67A] hover:bg-[#37D67A]/80 text-[#080E19] text-xs font-black cursor-pointer"
                      >
                        Plant Seeds (2h)
                      </button>
                    </div>
                  )}
                </div>
              )}

              {bid === 'shelter' && (
                <button
                  disabled={state.resources.shieldLayersBuilt >= 3}
                  onClick={() => dispatch({ type: 'BUILD_SHIELD_LAYER' })}
                  className="w-full py-2 rounded-xl bg-[#F5B942] hover:bg-[#F5B942]/80 text-[#080E19] text-xs font-black shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  Build Regolith Shield Layer ({state.resources.shieldLayersBuilt}/3)
                </button>
              )}
            </div>
          )}

          {/* TAB 3: UPGRADES */}
          {buildingTab === 'upgrades' && (
            <div className="space-y-2.5">
              {upgrades.length === 0 ? (
                <div className="text-center py-6 text-[#A7B4C8]">
                  No direct upgrades cataloged for this module.
                </div>
              ) : (
                upgrades.map((u) => {
                  const isInstalled = state.upgrades?.[u.id];
                  return (
                    <div key={u.id} className="p-3 rounded-xl bg-[#17263A] border border-[#293A50] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">{u.name}</span>
                        {isInstalled ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#37D67A]/20 text-[#37D67A] border border-[#37D67A]/40">
                            INSTALLED
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-[#A7B4C8]">
                            {u.costParts} parts • {u.costPower} pwr
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#A7B4C8]">{u.description}</p>
                      <div className="text-[10px] text-[#36C5F0] font-medium">{u.benefit}</div>
                      {!isInstalled && (
                        <button
                          disabled={state.resources.spareParts < u.costParts || state.resources.battery < u.costPower}
                          onClick={() => {
                            dispatch({
                              type: 'PURCHASE_UPGRADE',
                              buildingId: bid,
                              upgradeId: u.id,
                              crewId: selectedWorker,
                            });
                          }}
                          className="w-full mt-1.5 py-1.5 rounded-lg bg-[#36C5F0] hover:bg-[#36C5F0]/80 disabled:opacity-40 text-[#080E19] text-xs font-black transition-colors cursor-pointer"
                        >
                          Install Upgrade ({workerInfo.shortName})
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // RENDER: ASTRONAUT DOSSIER
  if (selectedEntity.type === 'crew') {
    const member = state.crew[selectedEntity.id];
    const info = getCrewDisplayName(member);

    return (
      <div className="absolute right-4 top-28 bottom-28 w-88 bg-[#080E19]/95 border border-[#293A50] rounded-2xl shadow-2xl backdrop-blur-xl z-20 flex flex-col overflow-hidden text-[#F4F7FC] select-none pointer-events-auto animate-fadeIn">
        <div className="p-3.5 border-b border-[#293A50] bg-[#111C2D] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#36C5F0]/20 border border-[#36C5F0] flex items-center justify-center text-sm">
              👨‍🚀
            </div>
            <div>
              <h3 className="text-sm font-black text-white">{member.name}</h3>
              <div className="text-[10px] text-[#36C5F0] font-mono">{info.role}</div>
            </div>
          </div>
          <button
            onClick={() => setSelectedEntity(null)}
            className="w-6 h-6 rounded flex items-center justify-center text-[#A7B4C8] hover:text-white hover:bg-[#17263A] text-xs font-bold transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="p-3.5 overflow-y-auto space-y-3 flex-1 text-xs">
          {/* Health & Stamina */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-xl bg-[#17263A] border border-[#293A50]">
              <div className="text-[10px] text-[#A7B4C8]">Health Status</div>
              <div className="text-lg font-black text-[#37D67A] font-mono">{member.health} HP</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#17263A] border border-[#293A50]">
              <div className="text-[10px] text-[#A7B4C8]">Daily Stamina</div>
              <div className="text-lg font-black text-white font-mono">{member.stamina} / 8h</div>
            </div>
          </div>

          {/* Current Task */}
          <div className="p-3 rounded-xl bg-[#17263A] border border-[#293A50]">
            <div className="text-[10px] uppercase font-bold text-[#A7B4C8]">Current Assignment</div>
            <div className="text-xs font-bold text-white mt-1">
              {member.currentTask ? `${member.currentTask.type.replace('_', ' ')} at ${member.currentTask.buildingId}` : 'Off Duty / Resting'}
            </div>
            <div className="text-[10px] text-[#A7B4C8] mt-0.5">Location: 📍 {member.location}</div>
          </div>

          {/* Specialized Ability */}
          <div className="p-3 rounded-xl bg-[#111C2D] border border-[#293A50]">
            <div className="text-[10px] uppercase font-bold text-[#36C5F0]">Specialized Ability</div>
            <div className="text-xs font-bold text-white mt-0.5">{member.perk}</div>
          </div>

          {/* Relocate Action */}
          <div className="space-y-1.5 pt-2">
            <label className="text-[10px] uppercase font-bold text-[#A7B4C8]">Relocate Astronaut:</label>
            <div className="grid grid-cols-2 gap-1.5">
              {(['habitat', 'shelter', 'greenhouse', 'laboratory'] as BuildingId[]).map((loc) => (
                <button
                  key={loc}
                  onClick={() => {
                    dispatch({
                      type: 'MOVE_CREW',
                      crewId: member.id,
                      targetBuilding: loc,
                    });
                  }}
                  className="py-1.5 px-2 rounded-lg bg-[#17263A] hover:bg-[#36C5F0] hover:text-[#080E19] text-[#A7B4C8] text-xs font-bold transition-colors capitalize cursor-pointer"
                >
                  Move to {loc}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
