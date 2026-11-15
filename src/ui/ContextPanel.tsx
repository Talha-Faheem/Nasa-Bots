/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/ui/ContextPanel.tsx
 * Unified Contextual Inspector Panel (Section 3).
 * Single primary panel on the right side of the screen inspecting:
 * - Selected Building (Condition, telemetry, crew present, operations, upgrades)
 * - Selected Crew Member (Dossier, skills, stamina, health, direct control, assignment)
 * - Selected Resource (Telemetry breakdown, production/consumption rate, physics explanation, science tips)
 * - Selected Vehicle / Rover (Condition, expedition readiness)
 */

import React, { useState } from 'react';
import { useGameStore, SelectedEntity } from '../store/store.ts';
import { BuildingId, CrewId } from '../sim/types.ts';
import { getCrewDisplayName } from '../sim/rules/crew.ts';
import { getUpgradesForBuilding } from '../sim/rules/upgrades.ts';
import { eventBus } from '../store/bus.ts';
import {
  BUILDING_ICONS,
  RESOURCE_ICONS,
  AstronautPortrait,
  Wrench,
  Settings,
  Activity,
  Truck,
  Compass,
} from './icons.tsx';

const ContextPanelContent: React.FC<{ selectedEntity: NonNullable<SelectedEntity> }> = ({ selectedEntity }) => {
  const setSelectedEntity = useGameStore((s) => s.setSelectedEntity);
  const openTaskMenu = useGameStore((s) => s.openTaskMenu);
  const activePlayerCrew = useGameStore((s) => s.activePlayerCrew);
  const setActivePlayerCrew = useGameStore((s) => s.setActivePlayerCrew);
  const state = useGameStore((s) => s.state);
  const dispatch = useGameStore((s) => s.dispatch);

  const [buildingTab, setBuildingTab] = useState<'overview' | 'operations' | 'upgrades'>('overview');
  const [selectedWorker, setSelectedWorker] = useState<CrewId>('alex');

  const closePanel = () => {
    setSelectedEntity(null);
    eventBus.emit('sound:play', { name: 'click' });
  };

  // ==========================================
  // RENDER: BUILDING INSPECTION
  // ==========================================
  if (selectedEntity.type === 'building') {
    const bid = selectedEntity.id;

    let condition = 100;
    let isFaulted = false;
    let systemName = 'Module System';
    let powerDrain = 0;

    if (bid === 'power_station') {
      condition = state.systems.solarArray.condition;
      isFaulted = state.systems.solarArray.isFaulted;
      systemName = 'Solar Array Subsystem';
    } else if (bid === 'habitat') {
      condition = state.systems.lifeSupport.condition;
      isFaulted = state.systems.lifeSupport.isFaulted;
      systemName = 'Life Support Subsystem';
      powerDrain = state.powerBreakdown.essentialDemandPerDay;
    } else if (bid === 'recycler') {
      condition = state.systems.recycler.condition;
      isFaulted = state.systems.recycler.isFaulted;
      systemName = 'Water Distillation Unit';
      powerDrain = state.powerBreakdown.recyclerDemandPerDay;
    } else if (bid === 'greenhouse') {
      condition = state.systems.greenhouse.condition;
      isFaulted = state.systems.greenhouse.isFaulted;
      systemName = 'Hydroponic Irrigation';
      powerDrain = state.powerBreakdown.greenhouseDemandPerDay;
    } else if (bid === 'comms') {
      condition = state.systems.comms.condition;
      isFaulted = state.systems.comms.isFaulted;
      systemName = 'Phased Array Antenna';
      powerDrain = 2;
    } else if (bid === 'rover_bay') {
      condition = state.rover.condition;
      isFaulted = state.rover.isFaulted;
      systemName = 'Rover Drivetrain & Dock';
      powerDrain = 2;
    } else if (bid === 'laboratory') {
      condition = state.lab.condition;
      isFaulted = state.lab.condition === 0;
      systemName = 'Spectrometer & Bio-Lab';
      powerDrain = state.powerBreakdown.labDemandPerDay;
    } else if (bid === 'shelter') {
      condition = 100;
      systemName = 'Regolith Radiation Vault';
    }

    let conditionColor = '#22C55E';
    let conditionStatus = 'Nominal';
    if (isFaulted || condition === 0) {
      conditionColor = '#EF4444';
      conditionStatus = 'Offline / Faulted';
    } else if (condition < 40) {
      conditionColor = '#EF4444';
      conditionStatus = 'Critical Damage';
    } else if (condition < 70) {
      conditionColor = '#F59E0B';
      conditionStatus = 'Degraded Performance';
    }

    const upgrades = getUpgradesForBuilding(bid);
    const crewHere = Object.values(state.crew).filter((c) => c.location === bid);
    const worker = state.crew[selectedWorker];

    const isAlex = selectedWorker === 'alex';
    const minorHours = isAlex ? 3 : 4;
    const majorHours = isAlex ? 7 : 8;

    return (
      <div className="absolute right-3 top-24 bottom-20 w-84 bg-[#080F1B]/95 border border-[#26374D] rounded-xl shadow-2xl backdrop-blur-xl z-20 flex flex-col overflow-hidden text-[#F1F5F9] select-none pointer-events-auto animate-fadeIn">
        {/* Header */}
        <div className="px-3.5 py-2.5 border-b border-[#26374D] bg-[#101A29] flex items-center justify-between">
          <div className="flex items-center gap-2">
            {(() => {
              const BIcon = BUILDING_ICONS[bid] || BUILDING_ICONS.habitat;
              return (
                <div className="p-1.5 rounded bg-[#152235] text-[#25C5F4]">
                  <BIcon className="w-4 h-4" />
                </div>
              );
            })()}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                {bid.replace('_', ' ')}
              </h3>
              <div className="text-[10px] text-[#25C5F4] font-mono">{systemName}</div>
            </div>
          </div>
          <button
            onClick={closePanel}
            className="w-6 h-6 rounded flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-[#152235] text-xs font-bold transition-colors cursor-pointer"
            title="Close Inspector"
          >
            ✕
          </button>
        </div>

        {/* 3 Tabs */}
        <div className="flex border-b border-[#26374D] bg-[#101A29]/60 text-[11px] font-bold">
          {(['overview', 'operations', 'upgrades'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setBuildingTab(tab)}
              className={`flex-1 py-1.5 text-center transition-all cursor-pointer capitalize ${
                buildingTab === tab
                  ? 'border-b-2 border-[#25C5F4] text-[#25C5F4] bg-[#152235]'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-3 overflow-y-auto space-y-3 flex-1 text-xs">
          {buildingTab === 'overview' && (
            <div className="space-y-3">
              {/* Condition Status Card */}
              <div className="p-2.5 rounded-lg bg-[#101A29] border border-[#26374D] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#94A3B8] uppercase">Subsystem Condition</span>
                  <span className="font-mono text-xs font-bold" style={{ color: conditionColor }}>
                    {condition}% • {conditionStatus}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#080F1B] rounded-full overflow-hidden border border-[#26374D]">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${condition}%`, backgroundColor: conditionColor }}
                  />
                </div>
                {powerDrain > 0 && (
                  <div className="flex justify-between text-[10px] text-[#94A3B8] font-mono pt-1">
                    <span>Power Consumption:</span>
                    <span className="text-white font-bold">{powerDrain} kWh/day</span>
                  </div>
                )}
              </div>

              {/* Occupancy / Crew Present */}
              <div className="p-2.5 rounded-lg bg-[#101A29] border border-[#26374D]">
                <div className="text-[10px] font-bold text-[#94A3B8] uppercase mb-1">
                  Personnel Present ({crewHere.length})
                </div>
                {crewHere.length === 0 ? (
                  <div className="text-[11px] text-[#94A3B8] italic">No astronauts currently stationed here.</div>
                ) : (
                  <div className="space-y-1">
                    {crewHere.map((c) => (
                      <div key={c.id} className="flex items-center justify-between text-[11px]">
                        <span className="text-white font-semibold">{c.name}</span>
                        <span className="text-[#25C5F4] text-[10px]">{c.role}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Primary Operate Button */}
              <button
                onClick={() => openTaskMenu(bid)}
                className="w-full py-2 rounded-lg bg-[#25C5F4] hover:bg-[#25C5F4]/80 text-[#080F1B] text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <Wrench className="w-4 h-4 text-[#080F1B]" />
                <span>OPERATE MODULE TASKS</span>
              </button>
            </div>
          )}

          {buildingTab === 'operations' && (
            <div className="space-y-3">
              {/* Select Astronaut */}
              <div>
                <label className="text-[10px] font-bold text-[#94A3B8] uppercase block mb-1">
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
                        className={`p-1 rounded text-center transition-all cursor-pointer border ${
                          isSel
                            ? 'bg-[#25C5F4] text-[#080F1B] border-[#25C5F4] font-bold'
                            : 'bg-[#101A29] border-[#26374D] text-[#94A3B8] hover:text-white'
                        }`}
                      >
                        <div className="text-[10px] truncate">{info.shortName}</div>
                        <div className="text-[8px] font-mono">{c.stamina}h</div>
                      </button>
                    );
                  })}
                </div>
                <div className="text-[10px] text-[#25C5F4] mt-1">
                  Perk: {worker.name} — <em>{worker.perk}</em>
                </div>
              </div>

              {/* Quick Diagnostic */}
              <div className="p-2 rounded-lg bg-[#101A29] border border-[#26374D] flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-[11px] flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-[#25C5F4]" /> Diagnostic Inspection
                  </div>
                  <div className="text-[10px] text-[#94A3B8]">Cost: 2h stamina • 0 parts</div>
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
                  className="px-2.5 py-1 rounded bg-[#152235] hover:bg-[#25C5F4] hover:text-[#080F1B] text-[#25C5F4] font-bold text-[10px] border border-[#25C5F4]/40 transition-colors cursor-pointer"
                >
                  Inspect
                </button>
              </div>

              {/* Quick Minor Repair */}
              <div className="p-2 rounded-lg bg-[#101A29] border border-[#26374D] flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-[11px] flex items-center gap-1">
                    <Wrench className="w-3.5 h-3.5 text-[#22C55E]" /> Minor Repair (+30)
                  </div>
                  <div className="text-[10px] text-[#94A3B8]">Cost: {minorHours}h stamina • 1 part</div>
                </div>
                <button
                  disabled={state.resources.spareParts < 1 || condition >= 100}
                  onClick={() => {
                    dispatch({
                      type: 'ASSIGN_TASK',
                      crewId: selectedWorker,
                      taskType: 'minor_repair',
                      buildingId: bid,
                    });
                  }}
                  className="px-2.5 py-1 rounded bg-[#152235] hover:bg-[#22C55E] hover:text-[#080F1B] text-[#22C55E] disabled:opacity-40 font-bold text-[10px] border border-[#22C55E]/40 transition-colors cursor-pointer"
                >
                  Repair
                </button>
              </div>

              {/* Quick Overhaul */}
              <div className="p-2 rounded-lg bg-[#101A29] border border-[#26374D] flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-[11px] flex items-center gap-1">
                    <Settings className="w-3.5 h-3.5 text-[#F59E0B]" /> Major Overhaul (+60)
                  </div>
                  <div className="text-[10px] text-[#94A3B8]">Cost: {majorHours}h • 2 parts • 5 power</div>
                </div>
                <button
                  disabled={state.resources.spareParts < 2 || state.resources.battery < 5 || condition >= 100}
                  onClick={() => {
                    dispatch({
                      type: 'ASSIGN_TASK',
                      crewId: selectedWorker,
                      taskType: 'major_repair',
                      buildingId: bid,
                    });
                  }}
                  className="px-2.5 py-1 rounded bg-[#152235] hover:bg-[#F59E0B] hover:text-[#080F1B] text-[#F59E0B] disabled:opacity-40 font-bold text-[10px] border border-[#F59E0B]/40 transition-colors cursor-pointer"
                >
                  Overhaul
                </button>
              </div>
            </div>
          )}

          {buildingTab === 'upgrades' && (
            <div className="space-y-2">
              <div className="text-[11px] text-[#94A3B8]">Engineering Hardware Upgrades:</div>
              {upgrades.length === 0 ? (
                <div className="text-[11px] text-[#94A3B8] italic">No upgrades currently available for this module.</div>
              ) : (
                upgrades.map((u) => {
                  const isUnlocked = Boolean((state.upgrades as any)?.[u.id]);
                  return (
                    <div key={u.id} className="p-2.5 rounded-lg bg-[#101A29] border border-[#26374D] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{u.name}</span>
                        {isUnlocked && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#22C55E]/20 text-[#22C55E]">
                            INSTALLED
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#94A3B8]">{u.description}</p>
                      <div className="flex items-center justify-between text-[10px] font-mono text-[#25C5F4]">
                        <span>Cost: {u.costParts} parts • {u.costPower} power</span>
                        <span>{u.benefit}</span>
                      </div>
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

  // ==========================================
  // RENDER: ASTRONAUT DOSSIER
  // ==========================================
  if (selectedEntity.type === 'crew') {
    const member = state.crew[selectedEntity.id];
    const info = getCrewDisplayName(member);
    const isPlayerActive = activePlayerCrew === member.id;
    const isWorking = !!member.currentTask;

    return (
      <div className="absolute right-3 top-24 bottom-20 w-84 bg-[#080F1B]/95 border border-[#26374D] rounded-xl shadow-2xl backdrop-blur-xl z-20 flex flex-col overflow-hidden text-[#F1F5F9] select-none pointer-events-auto animate-fadeIn">
        {/* Header */}
        <div className="px-3.5 py-2.5 border-b border-[#26374D] bg-[#101A29] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AstronautPortrait crewId={member.id} size={32} isActive={isPlayerActive} />
            <div>
              <h3 className="text-xs font-bold text-white">{member.name}</h3>
              <div className="text-[10px] text-[#25C5F4] font-mono">{info.role}</div>
            </div>
          </div>
          <button
            onClick={closePanel}
            className="w-6 h-6 rounded flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-[#152235] text-xs font-bold transition-colors cursor-pointer"
            title="Close Dossier"
          >
            ✕
          </button>
        </div>

        {/* Dossier Body */}
        <div className="p-3 overflow-y-auto space-y-3 flex-1 text-xs">
          {/* Health & Stamina */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-lg bg-[#101A29] border border-[#26374D]">
              <div className="text-[10px] text-[#94A3B8]">Health Condition</div>
              <div className="text-base font-black text-[#22C55E] font-mono mt-0.5">{member.health} HP</div>
            </div>
            <div className="p-2.5 rounded-lg bg-[#101A29] border border-[#26374D]">
              <div className="text-[10px] text-[#94A3B8]">Daily Stamina</div>
              <div className="text-base font-black text-white font-mono mt-0.5">{member.stamina} / 8h</div>
            </div>
          </div>

          {/* Current Assignment */}
          <div className="p-2.5 rounded-lg bg-[#101A29] border border-[#26374D] space-y-1">
            <div className="text-[10px] uppercase font-bold text-[#94A3B8]">Current Status & Assignment</div>
            <div className="text-xs font-bold text-white">
              {isWorking ? `${member.currentTask?.type.replace('_', ' ')} at ${member.currentTask?.buildingId}` : 'Off Duty / Idle at Workstation'}
            </div>
            <div className="text-[10px] text-[#94A3B8] font-mono">Location: {member.location}</div>
          </div>

          {/* Specialized Ability */}
          <div className="p-2.5 rounded-lg bg-[#101A29] border border-[#26374D]">
            <div className="text-[10px] uppercase font-bold text-[#25C5F4]">Mission Specialization & Perk</div>
            <div className="text-xs font-semibold text-white mt-0.5">{member.perk}</div>
          </div>

          {/* Direct Physical Control Button */}
          {!isPlayerActive ? (
            <button
              onClick={() => setActivePlayerCrew(member.id)}
              className="w-full py-2 rounded-lg bg-[#25C5F4] hover:bg-[#25C5F4]/80 text-[#080F1B] text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Compass className="w-4 h-4 text-[#080F1B]" />
              <span>TAKE DIRECT PHYSICAL CONTROL</span>
            </button>
          ) : (
            <div className="p-2 rounded-lg bg-[#152235] border border-[#25C5F4]/60 text-center text-[#25C5F4] font-mono font-bold text-[11px]">
              CURRENTLY PLAYER CONTROLLED (WASD TO MOVE)
            </div>
          )}

          {/* Relocate Action */}
          <div className="space-y-1.5 pt-1">
            <label className="text-[10px] uppercase font-bold text-[#94A3B8]">Relocate Astronaut:</label>
            <div className="grid grid-cols-2 gap-1.5">
              {(['habitat', 'shelter', 'greenhouse', 'laboratory', 'power_station', 'rover_bay'] as BuildingId[]).map((loc) => (
                <button
                  key={loc}
                  onClick={() => {
                    dispatch({
                      type: 'MOVE_CREW',
                      crewId: member.id,
                      targetBuilding: loc,
                    });
                  }}
                  className="py-1 px-2 rounded bg-[#101A29] hover:bg-[#25C5F4] hover:text-[#080F1B] text-[#94A3B8] text-[11px] font-semibold transition-colors capitalize cursor-pointer border border-[#26374D]"
                >
                  {loc.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: RESOURCE MONITORING DEEP DIVE
  // ==========================================
  if (selectedEntity.type === 'resource') {
    const rid = selectedEntity.id;
    const resources = state.resources;
    const power = state.powerBreakdown;
    const systems = state.systems;

    let title = 'Resource Telemetry';
    let currentValue = '';
    let rateText = '';
    let physicsExplanation = '';
    let recommendation = '';
    const ResIcon = RESOURCE_ICONS[rid] || RESOURCE_ICONS.battery;

    if (rid === 'battery') {
      title = 'Electrical Power Subsystem (EPS)';
      currentValue = `${Math.round(resources.battery)} / 100 kWh Buffer`;
      rateText = `${Math.round(power.generationPerDay)} kWh Gen vs ${Math.round(power.totalDemandPerDay)} kWh Demand`;
      physicsExplanation =
        'Solar photovoltaic arrays convert solar photons to electrical current. Polar geography causes sunlight to dip periodically. Buffer batteries and automated priority shedding prevent catastrophic base blackout.';
      recommendation =
        'Maintain solar panels above 50% condition. Turn off non-essential systems (e.g. greenhouse boost) during low-sun periods.';
    } else if (rid === 'oxygen') {
      title = 'Atmospheric Life Support (ECLSS)';
      currentValue = `${Math.round(resources.oxygen)} / 100 kg O₂`;
      rateText = 'Baseline consumption: 6.0 kg/day (4 crew members)';
      physicsExplanation =
        'Oxygen is required for human cellular respiration. Lunar habitat scrubbers remove carbon dioxide and replenish breathing oxygen.';
      recommendation =
        'Keep Life Support condition above 40% to prevent rapid atmospheric leaks and hypoxia penalties.';
    } else if (rid === 'water') {
      title = 'Water Recovery Subsystem (WRS)';
      currentValue = `${Math.round(resources.water)} / 100 Liters H₂O`;
      rateText = '4.0 L/day crew baseline + 2.0 L/day per active crop bed';
      physicsExplanation =
        'Closed-loop vacuum distillation and catalytic oxidation reclaim humidity, urine, and hygiene wastewater at ~75% efficiency when the recycler is undamaged.';
      recommendation =
        'Conduct Rover expeditions to South Pole water-ice craters (e.g. Haworth or Shackleton) to haul supplemental water.';
    } else if (rid === 'food') {
      title = 'Biomass & Nutrition Subsystem';
      currentValue = `${Math.round(resources.food)} / 100 Rations`;
      rateText = 'Consumption: 3.5 rations/day (4 crew members)';
      physicsExplanation =
        'Pre-packaged rations support the expedition. Hydroponic greenhouse crops provide fresh produce, restoring morale and providing supplemental caloric intake.';
      recommendation =
        'Plant Quick Greens for fast 5-day yields, or Soybeans for large 30-ration yields.';
    } else if (rid === 'health') {
      title = 'Crew Physiological Telemetry';
      currentValue = `${Math.round(Object.values(state.crew).reduce((a, c) => a + c.health, 0) / 4)}% Mean Health`;
      rateText = 'Recovery: +2 HP/day when basic needs are satisfied (+1 extra with Dr. Maya Chen)';
      physicsExplanation =
        'Hypoxia, dehydration, starvation, or acute radiation exposure induce physiological damage. Regular rest, exercise, and medical treatment maintain crew stamina.';
      recommendation =
        'Ensure astronauts have stamina to rest daily and do not skip exercise periods.';
    } else if (rid === 'radiation') {
      title = 'Space Radiation & Dosimetry';
      currentValue = `${state.resources.shieldProtection}% Passive Shielding (${state.resources.shieldLayersBuilt}/3 layers)`;
      rateText = state.radiationAdvisory ? 'ACTIVE SOLAR PROTON EVENT (SPE)' : 'Nominal Background Galactic Cosmic Rays';
      physicsExplanation =
        'Without Earth’s magnetosphere, astronauts are exposed to galactic cosmic rays and sudden solar particle events (SPEs). Regolith shielding absorbs ionizing radiation.';
      recommendation =
        'During solar flare advisories, move all astronauts into the Radiation Shelter and construct sintered regolith layers.';
    } else if (rid === 'comms') {
      title = 'Deep Space Communication Network';
      currentValue = `${systems.comms.condition}% Signal Quality`;
      rateText = state.mission.siteId === 'mars' ? '6-Hour Time Delay' : '1.3-Second Speed of Light Delay';
      physicsExplanation =
        'High-gain phased array antenna links the lunar outpost directly to NASA Ground Stations on Earth. Telemetry transmission delivers scientific mission points.';
      recommendation =
        'Keep antenna aligned and serviced. Use "Ask Mission Control" for tactical advice during emergencies.';
    }

    return (
      <div className="absolute right-3 top-24 bottom-20 w-84 bg-[#080F1B]/95 border border-[#26374D] rounded-xl shadow-2xl backdrop-blur-xl z-20 flex flex-col overflow-hidden text-[#F1F5F9] select-none pointer-events-auto animate-fadeIn">
        {/* Header */}
        <div className="px-3.5 py-2.5 border-b border-[#26374D] bg-[#101A29] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-[#152235] text-[#25C5F4]">
              <ResIcon className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white truncate max-w-[210px]">
              {title}
            </h3>
          </div>
          <button
            onClick={closePanel}
            className="w-6 h-6 rounded flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-[#152235] text-xs font-bold transition-colors cursor-pointer"
            title="Close Telemetry"
          >
            ✕
          </button>
        </div>

        {/* Telemetry Body */}
        <div className="p-3 overflow-y-auto space-y-3 flex-1 text-xs">
          {/* Current Buffer */}
          <div className="p-2.5 rounded-lg bg-[#101A29] border border-[#26374D]">
            <div className="text-[10px] text-[#94A3B8] uppercase font-bold">Current Reserve Buffer</div>
            <div className="text-base font-black text-white font-mono mt-0.5">{currentValue}</div>
            <div className="text-[11px] text-[#25C5F4] font-mono mt-1">{rateText}</div>
          </div>

          {/* Science / Physics Explanation */}
          <div className="p-2.5 rounded-lg bg-[#101A29] border border-[#26374D] space-y-1">
            <div className="text-[10px] uppercase font-bold text-[#94A3B8]">NASA Engineering & Physics Concept</div>
            <p className="text-[11px] text-[#94A3B8] leading-relaxed">{physicsExplanation}</p>
          </div>

          {/* Commander Tip */}
          <div className="p-2.5 rounded-lg bg-[#101A29] border border-[#26374D] space-y-1">
            <div className="text-[10px] uppercase font-bold text-[#22C55E]">Flight Director Advice</div>
            <p className="text-[11px] text-[#F1F5F9] leading-relaxed">{recommendation}</p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: ROVER VEHICLE
  // ==========================================
  if (selectedEntity.type === 'rover') {
    return (
      <div className="absolute right-3 top-24 bottom-20 w-84 bg-[#080F1B]/95 border border-[#26374D] rounded-xl shadow-2xl backdrop-blur-xl z-20 flex flex-col overflow-hidden text-[#F1F5F9] select-none pointer-events-auto animate-fadeIn">
        <div className="px-3.5 py-2.5 border-b border-[#26374D] bg-[#101A29] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-[#152235] text-[#25C5F4]">
              <Truck className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Lunar Polar Exploration Rover
            </h3>
          </div>
          <button
            onClick={closePanel}
            className="w-6 h-6 rounded flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-[#152235] text-xs font-bold transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>
        <div className="p-3 space-y-3 flex-1 text-xs">
          <div className="p-2.5 rounded-lg bg-[#101A29] border border-[#26374D]">
            <div className="text-[10px] text-[#94A3B8]">Vehicle Condition</div>
            <div className="text-base font-black text-white font-mono mt-0.5">{state.rover.condition}%</div>
            <div className="text-[10px] text-[#25C5F4] mt-1 font-mono">
              Status: {state.rover.isAway ? 'On Expedition' : 'Docked at Rover Bay'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export const ContextPanel: React.FC = () => {
  const selectedEntity = useGameStore((s) => s.selectedEntity);
  if (!selectedEntity) return null;
  return <ContextPanelContent selectedEntity={selectedEntity} />;
};
