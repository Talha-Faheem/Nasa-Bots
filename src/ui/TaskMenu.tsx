/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/ui/TaskMenu.tsx
 * Task assignment menu with complete Cost Preview (hours, power, parts, risk) before player confirms.
 */

import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/store.ts';
import { CrewId, CropType } from '../sim/types.ts';
import { getCrewDisplayName } from '../sim/rules/crew.ts';
import { eventBus } from '../store/bus.ts';
import {
  Wrench,
  Zap,
  Move,
  Activity,
  Settings,
  Sprout,
  Shield,
  Truck,
  FlaskConical,
  Radio,
  AlertTriangle,
  Info,
} from './icons.tsx';

export const TaskMenu: React.FC = () => {
  const buildingId = useGameStore((s) => s.taskTargetBuilding);
  const activeModal = useGameStore((s) => s.activeModal);
  const activePlayerCrew = useGameStore((s) => s.activePlayerCrew);
  const state = useGameStore((s) => s.state);
  const dispatch = useGameStore((s) => s.dispatch);
  const setModal = useGameStore((s) => s.setModal);

  const [selectedCrew, setSelectedCrew] = useState<CrewId>('alex');
  const [selectedCrop, setSelectedCrop] = useState<CropType>('quick_greens');
  const [selectedBed, setSelectedBed] = useState<'bed1' | 'bed2'>('bed1');

  // Automatically sync selected astronaut with physically controlled astronaut on open
  useEffect(() => {
    if (activeModal === 'task_menu' && activePlayerCrew) {
      setSelectedCrew(activePlayerCrew);
    }
  }, [activeModal, activePlayerCrew]);

  // Keyboard accessibility: ESC key closes Task Menu immediately
  useEffect(() => {
    if (activeModal !== 'task_menu') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setModal('none');
        eventBus.emit('sound:play', { name: 'click' });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModal, setModal]);

  if (activeModal !== 'task_menu' || !buildingId) return null;

  const closeMenu = () => {
    setModal('none');
    eventBus.emit('sound:play', { name: 'click' });
  };
  const crewMember = state.crew[selectedCrew];

  // Helper to preview and validate cost
  const getPreview = (
    hours: number,
    power: number,
    parts: number,
    riskDesc: string
  ) => {
    const hasHours = crewMember.stamina >= hours;
    const hasPower = state.resources.battery >= power;
    const hasParts = state.resources.spareParts >= parts;
    const canAfford = hasPower && hasParts;

    return {
      hours,
      power,
      parts,
      risk: riskDesc,
      canAfford,
      overtimeWarning: !hasHours,
    };
  };

  const minorRepairHours = selectedCrew === 'alex' ? 3 : 4;
  const majorRepairHours = selectedCrew === 'alex' ? 7 : 8;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none pointer-events-auto"
      onClick={closeMenu}
    >
      <div
        className="bg-[#080F1B] border border-[#26374D] rounded-2xl max-w-lg w-full p-5 shadow-2xl text-[#F1F5F9] animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#26374D] pb-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Wrench className="w-4 h-4 text-[#25C5F4]" /> {buildingId.replace('_', ' ')} Operations
            </h2>
            <p className="text-xs text-[#94A3B8]">
              Select an astronaut and assign a mission task. Review resource costs below.
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeMenu();
            }}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#152235] hover:bg-[#EF4444] text-[#94A3B8] hover:text-white font-bold text-base transition-all cursor-pointer border border-[#26374D] hover:border-[#EF4444]"
            title="Close Menu (Esc)"
            aria-label="Close Operations Menu"
          >
            ✕
          </button>
        </div>

        {/* Astronaut Selector */}
        <div className="mb-4">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] block mb-1.5">
            Assign Astronaut:
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(Object.keys(state.crew) as CrewId[]).map((cid) => {
              const c = state.crew[cid];
              const info = getCrewDisplayName(c);
              const isSel = selectedCrew === cid;
              const isEngineer = cid === 'alex';

              const roleBadgeColor =
                cid === 'alex'
                  ? 'text-[#25C5F4] bg-[#25C5F4]/10 border-[#25C5F4]/40'
                  : cid === 'sara'
                  ? 'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/40'
                  : cid === 'daniel'
                  ? 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/40'
                  : 'text-pink-400 bg-pink-950/30 border-pink-800/60';

              return (
                <button
                  key={cid}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCrew(cid);
                    eventBus.emit('sound:play', { name: 'click' });
                  }}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col justify-between items-center ${
                    isSel
                      ? 'bg-[#152235] border-[#25C5F4] ring-1 ring-[#25C5F4] text-white shadow-md'
                      : 'bg-[#101A29] border-[#26374D] text-[#94A3B8] hover:border-[#25C5F4]/40 hover:bg-[#152235]'
                  }`}
                >
                  <div className="w-full">
                    <div className="text-xs font-bold text-white flex items-center justify-center gap-1">
                      <span>{info.shortName}</span>
                      {isEngineer && <Zap className="w-3 h-3 text-[#25C5F4]" />}
                    </div>
                    <div className={`text-[10px] font-bold border rounded px-1 py-0.5 mt-1 truncate ${roleBadgeColor}`}>
                      {info.roleShort}
                    </div>
                  </div>
                  <div className="text-[10px] text-[#94A3B8] font-mono mt-1.5 px-1 py-0.5 rounded bg-[#080F1B] border border-[#26374D] w-full text-center">
                    {c.stamina}h stamina
                  </div>
                </button>
              );
            })}
          </div>
          <div className="text-[11px] text-[#94A3B8] mt-2 p-2 rounded-lg bg-[#101A29] border border-[#26374D]">
            Perk: <strong className="text-white">{crewMember.name}</strong> ({crewMember.role}) —{' '}
            <strong className="text-[#25C5F4]">{crewMember.perk}</strong>
          </div>
        </div>

        {/* Available Tasks List with Live Cost Preview */}
        <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
          {/* Universal Task 1: Move Crew */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Move className="w-3.5 h-3.5 text-[#25C5F4]" /> Relocate Astronaut to Module
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Takes travel ticks based on base grid distance.
              </div>
            </div>
            <button
              onClick={() => {
                dispatch({
                  type: 'MOVE_CREW',
                  crewId: selectedCrew,
                  targetBuilding: buildingId,
                });
                closeMenu();
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-colors"
            >
              Relocate
            </button>
          </div>

          {/* Universal Task 2: Inspect Hardware */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#25C5F4]" /> Diagnostic Inspection (2h)
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Cost: 2h stamina · 0 power · 0 parts
              </div>
            </div>
            <button
              onClick={() => {
                dispatch({
                  type: 'ASSIGN_TASK',
                  crewId: selectedCrew,
                  taskType: 'inspect',
                  buildingId,
                });
                closeMenu();
              }}
              className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-xs font-bold text-white transition-colors"
            >
              Inspect
            </button>
          </div>

          {/* Universal Task 3: Minor Repair */}
          {(() => {
            const preview = getPreview(minorRepairHours, 0, 1, 'Restores +30 condition.');
            return (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-[#22C55E]" /> Minor Repair (+30 condition)
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Cost: <strong className="text-sky-300">{minorRepairHours}h</strong> stamina · 0
                    power · <strong className="text-amber-300">1 part</strong>
                  </div>
                  {preview.overtimeWarning && (
                    <div className="text-[10px] text-amber-400 flex items-center gap-1 mt-0.5">
                      <AlertTriangle className="w-3 h-3 text-[#F59E0B]" />
                      <span>Will exceed daily stamina (-3 health penalty)</span>
                    </div>
                  )}
                </div>
                <button
                  disabled={!preview.canAfford}
                  onClick={() => {
                    dispatch({
                      type: 'ASSIGN_TASK',
                      crewId: selectedCrew,
                      taskType: 'minor_repair',
                      buildingId,
                    });
                    closeMenu();
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-colors ${
                    preview.canAfford
                      ? 'bg-amber-600 hover:bg-amber-500'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Repair
                </button>
              </div>
            );
          })()}

          {/* Universal Task 4: Major Repair */}
          {(() => {
            const preview = getPreview(majorRepairHours, 5, 2, 'Restores +60 condition & clears faults.');
            return (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Settings className="w-3.5 h-3.5 text-[#F59E0B]" /> Major Overhaul (+60 condition & clear fault)
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Cost: <strong className="text-sky-300">{majorRepairHours}h</strong> ·{' '}
                    <strong className="text-sky-300">5 power</strong> ·{' '}
                    <strong className="text-amber-300">2 parts</strong>
                  </div>
                </div>
                <button
                  disabled={!preview.canAfford}
                  onClick={() => {
                    dispatch({
                      type: 'ASSIGN_TASK',
                      crewId: selectedCrew,
                      taskType: 'major_repair',
                      buildingId,
                    });
                    closeMenu();
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-colors ${
                    preview.canAfford
                      ? 'bg-orange-600 hover:bg-orange-500'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Overhaul
                </button>
              </div>
            );
          })()}

          {/* Building-Specific: Greenhouse Operations */}
          {buildingId === 'greenhouse' && (
            <div className="p-3 rounded-xl bg-slate-950 border border-emerald-900/60 space-y-2">
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Sprout className="w-4 h-4 text-[#22C55E]" /> Hydroponic Crop Planting & Harvesting
              </div>

              <div className="flex gap-2">
                <select
                  value={selectedBed}
                  onChange={(e) => setSelectedBed(e.target.value as any)}
                  className="bg-slate-900 border border-slate-700 text-xs rounded-lg px-2 py-1 text-slate-200"
                >
                  <option value="bed1">Bed 1 (Active)</option>
                  <option value="bed2" disabled={!state.greenhouseBeds.bed2.unlocked}>
                    Bed 2 {state.greenhouseBeds.bed2.unlocked ? '(Active)' : '(Locked Day 6)'}
                  </option>
                </select>

                <select
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value as any)}
                  className="bg-slate-900 border border-slate-700 text-xs rounded-lg px-2 py-1 text-slate-200"
                >
                  <option value="quick_greens">Quick Greens (8d, yield 12)</option>
                  <option value="dwarf_tomatoes">Dwarf Tomatoes (11d, yield 18)</option>
                  <option value="potatoes">Potatoes (14d, yield 30)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => {
                    dispatch({
                      type: 'ASSIGN_TASK',
                      crewId: selectedCrew,
                      taskType: 'plant_crop',
                      buildingId: 'greenhouse',
                      bedId: selectedBed,
                      cropType: selectedCrop,
                    });
                    closeMenu();
                  }}
                  className="flex-1 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-xs font-bold text-white transition-colors"
                >
                  Plant Crop (2h)
                </button>

                <button
                  onClick={() => {
                    dispatch({
                      type: 'ASSIGN_TASK',
                      crewId: selectedCrew,
                      taskType: 'harvest_crop',
                      buildingId: 'greenhouse',
                      bedId: selectedBed,
                    });
                    closeMenu();
                  }}
                  className="flex-1 py-1.5 rounded-lg bg-lime-700 hover:bg-lime-600 text-xs font-bold text-white transition-colors"
                >
                  Harvest (2h)
                </button>
              </div>
            </div>
          )}

          {/* Building-Specific: Radiation Shelter Shield Layer Upgrade */}
          {buildingId === 'shelter' && (
            <div className="p-3 rounded-xl bg-slate-950 border border-amber-900/60 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-[#F59E0B]" /> Build Regolith Shield Layer (+10 Protection)
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Cost: 10 crew hours · 8 power · 1 part (Built:{' '}
                  {state.resources.shieldLayersBuilt}/3)
                </div>
              </div>
              <button
                disabled={
                  state.resources.shieldLayersBuilt >= 3 ||
                  state.resources.spareParts < 1 ||
                  state.resources.battery < 8
                }
                onClick={() => {
                  dispatch({ type: 'BUILD_SHIELD_LAYER' });
                  closeMenu();
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-colors ${
                  state.resources.shieldLayersBuilt < 3 &&
                  state.resources.spareParts >= 1 &&
                  state.resources.battery >= 8
                    ? 'bg-amber-600 hover:bg-amber-500'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                Build Layer
              </button>
            </div>
          )}

          {/* Building-Specific: Rover Sampling Expedition */}
          {buildingId === 'rover_bay' && (
            <div className="p-3 rounded-xl bg-slate-950 border border-amber-800/60 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-[#F59E0B]" /> Crater Volatiles Sampling Trip (6h)
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Cost: 6h (2 crew) · 20 power · -10 rover wear (+15 science)
                </div>
              </div>
              <button
                disabled={
                  state.rover.isAway ||
                  state.rover.condition <= 0 ||
                  state.resources.battery < 20
                }
                onClick={() => {
                  dispatch({
                    type: 'START_ROVER_TRIP',
                    crew1: 'daniel',
                    crew2: selectedCrew === 'daniel' ? 'alex' : selectedCrew,
                  });
                  closeMenu();
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-colors ${
                  !state.rover.isAway &&
                  state.rover.condition > 0 &&
                  state.resources.battery >= 20
                    ? 'bg-amber-600 hover:bg-amber-500'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                Launch Trip
              </button>
            </div>
          )}

          {/* Building-Specific: Laboratory Research Experiment */}
          {buildingId === 'laboratory' && (
            <div className="p-3 rounded-xl bg-slate-950 border border-violet-900/60 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-violet-300 flex items-center gap-1.5">
                  <FlaskConical className="w-4 h-4 text-violet-400" /> Run 3-Day Scientific Experiment
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Cost: 4 crew hours · 15 power/day for 3 days (+10 science)
                </div>
              </div>
              <button
                disabled={state.lab.activeExperiment || state.lab.condition <= 0}
                onClick={() => {
                  dispatch({ type: 'START_EXPERIMENT', crewId: selectedCrew });
                  closeMenu();
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-colors ${
                  !state.lab.activeExperiment && state.lab.condition > 0
                    ? 'bg-violet-600 hover:bg-violet-500'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                {state.lab.activeExperiment ? 'Running...' : 'Start'}
              </button>
            </div>
          )}

          {/* Building-Specific: Ask Mission Control */}
          {buildingId === 'comms' && (
            <div className="p-3 rounded-xl bg-slate-950 border border-sky-900/60 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-[#25C5F4]" /> Inquire Mission Control Advice
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Cost: 1 crew hour · 5 power (+2 science telemetry)
                </div>
              </div>
              <button
                disabled={state.systems.comms.condition < 25 || state.resources.battery < 5}
                onClick={() => {
                  dispatch({ type: 'ASK_MISSION_CONTROL', crewId: selectedCrew });
                  closeMenu();
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-colors ${
                  state.systems.comms.condition >= 25 && state.resources.battery >= 5
                    ? 'bg-sky-600 hover:bg-sky-500'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                Contact
              </button>
            </div>
          )}
        </div>

        {/* Footer Dismiss Button */}
        <div className="mt-4 pt-3 border-t border-[#26374D] flex items-center justify-between">
          <div className="text-[11px] text-[#94A3B8] flex items-center gap-1.5 font-mono">
            <Info className="w-3.5 h-3.5 text-[#25C5F4]" /> Press <kbd className="px-1.5 py-0.5 rounded bg-[#101A29] border border-[#26374D] text-[#25C5F4] text-[10px]">ESC</kbd> or click ✕ to close
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeMenu();
            }}
            className="px-4 py-1.5 rounded-lg bg-[#152235] hover:bg-[#26374D] text-[#F1F5F9] text-xs font-bold transition-all cursor-pointer border border-[#26374D]"
          >
            Close Menu
          </button>
        </div>
      </div>
    </div>
  );
};
