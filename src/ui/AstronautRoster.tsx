/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/ui/AstronautRoster.tsx
 * Compact & Collapsible Crew Management Bar (Area E).
 * Horizontal bottom panel showing character avatars, roles, HP, stamina, assignments, and active physical control.
 */

import React, { useState } from 'react';
import { useGameStore } from '../store/store.ts';
import { CrewId } from '../sim/types.ts';
import { getCrewDisplayName } from '../sim/rules/crew.ts';
import { eventBus } from '../store/bus.ts';

const CREW_AVATARS: Record<CrewId, string> = {
  alex: '👨‍🔧',
  sara: '👩‍🔬',
  daniel: '👨‍🚀',
  maya: '👩‍⚕️',
};

const SHORTCUT_KEYS: Record<CrewId, string> = {
  alex: '1',
  sara: '2',
  daniel: '3',
  maya: '4',
};

export const AstronautRoster: React.FC = () => {
  const crew = useGameStore((s) => s.state.crew);
  const selectedCrew = useGameStore((s) => s.selectedCrew);
  const activePlayerCrew = useGameStore((s) => s.activePlayerCrew);
  const setActivePlayerCrew = useGameStore((s) => s.setActivePlayerCrew);
  const setSelectedEntity = useGameStore((s) => s.setSelectedEntity);
  const openTaskMenu = useGameStore((s) => s.openTaskMenu);

  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleSelectCrew = (cid: CrewId) => {
    setSelectedEntity({ type: 'crew', id: cid });
    eventBus.emit('sound:play', { name: 'click' });
  };

  const handleTakeControl = (e: React.MouseEvent, cid: CrewId) => {
    e.stopPropagation();
    setActivePlayerCrew(cid);
    setSelectedEntity({ type: 'crew', id: cid });
    eventBus.emit('sound:play', { name: 'click' });
  };

  return (
    <div className="absolute bottom-2 left-16 right-4 z-20 pointer-events-auto select-none transition-all duration-300">
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        {/* Collapse / Expand Toggle Pill */}
        <div className="flex justify-center mb-1">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="px-2.5 py-0.5 rounded-full bg-[#080F1B]/90 border border-[#26374D] hover:border-[#25C5F4] text-[10px] font-mono text-[#94A3B8] hover:text-[#F1F5F9] backdrop-blur-md transition-all flex items-center gap-1 cursor-pointer shadow-md"
            title={isCollapsed ? 'Expand Crew Panel' : 'Collapse Crew Panel'}
          >
            <span>👨‍🚀 CREW ROSTER</span>
            <span>{isCollapsed ? '▲' : '▼'}</span>
          </button>
        </div>

        {/* Collapsed Minimal Strip */}
        {isCollapsed ? (
          <div className="flex items-center gap-2 bg-[#080F1B]/95 border border-[#26374D] rounded-lg px-3 py-1 shadow-xl backdrop-blur-md animate-fadeIn">
            {(Object.keys(crew) as CrewId[]).map((cid) => {
              const member = crew[cid];
              const info = getCrewDisplayName(member);
              const isPlayerActive = activePlayerCrew === cid;
              const isWorking = !!member.currentTask;

              return (
                <button
                  key={cid}
                  onClick={() => handleSelectCrew(cid)}
                  className={`flex items-center gap-1.5 px-2 py-0.5 rounded transition-all cursor-pointer text-xs font-mono border ${
                    isPlayerActive
                      ? 'bg-[#152235] border-[#25C5F4] text-white shadow-[0_0_6px_rgba(37,197,244,0.3)]'
                      : 'bg-[#101A29]/70 border-[#26374D] text-[#94A3B8] hover:text-white'
                  }`}
                >
                  <span className="text-[10px] text-[#25C5F4] font-bold">[{SHORTCUT_KEYS[cid]}]</span>
                  <span>{info.shortName}</span>
                  <span className="text-[#22C55E] text-[10px] font-bold">{member.health} HP</span>
                  <span className={`w-1.5 h-1.5 rounded-full ${isWorking ? 'bg-[#25C5F4] animate-pulse' : 'bg-[#94A3B8]'}`} />
                </button>
              );
            })}
          </div>
        ) : (
          /* Expanded Full Compact Cards */
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full animate-fadeIn">
            {(Object.keys(crew) as CrewId[]).map((cid) => {
              const member = crew[cid];
              const info = getCrewDisplayName(member);
              const isSelected = selectedCrew === cid;
              const isPlayerActive = activePlayerCrew === cid;
              const isWorking = !!member.currentTask;

              return (
                <div
                  key={cid}
                  onClick={() => handleSelectCrew(cid)}
                  className={`p-2 rounded-lg border transition-all cursor-pointer shadow-lg backdrop-blur-md flex flex-col justify-between ${
                    isPlayerActive
                      ? 'bg-[#152235] border-[#25C5F4] ring-1 ring-[#25C5F4] shadow-[0_0_10px_rgba(37,197,244,0.2)]'
                      : isSelected
                      ? 'bg-[#101A29] border-[#25C5F4]/60'
                      : 'bg-[#080F1B]/90 border-[#26374D] hover:border-[#25C5F4]/40 hover:bg-[#101A29]'
                  }`}
                >
                  {/* Row 1: Key Shortcut, Avatar, Name & HP */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded bg-[#101A29] border border-[#26374D] text-[9px] font-mono font-bold text-[#25C5F4] flex items-center justify-center">
                        {SHORTCUT_KEYS[cid]}
                      </span>
                      <span className="text-sm">{CREW_AVATARS[cid]}</span>
                      <div className="leading-tight">
                        <div className="text-xs font-bold text-[#F1F5F9] truncate max-w-[90px]">
                          {info.shortName}
                        </div>
                        <div className="text-[9px] text-[#25C5F4] font-medium leading-none">
                          {info.roleShort}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-mono font-bold text-[#22C55E]">
                        {member.health} HP
                      </span>
                      {isPlayerActive && (
                        <div className="text-[8px] font-mono font-black text-[#25C5F4] tracking-wider uppercase">
                          ACTIVE
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Status & Quick Activity */}
                  <div className="flex items-center justify-between text-[10px] mt-1.5 pt-1 border-t border-[#26374D]/70 font-mono">
                    <span className="text-[#94A3B8] truncate max-w-[95px]">
                      {isWorking ? member.currentTask?.type.replace('_', ' ') : 'Idle'}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-[#94A3B8] text-[9px]">{member.stamina}h</span>
                      {!isPlayerActive ? (
                        <button
                          onClick={(e) => handleTakeControl(e, cid)}
                          className="px-1.5 py-0.2 rounded bg-[#101A29] hover:bg-[#25C5F4] text-[#25C5F4] hover:text-[#080F1B] text-[9px] font-bold border border-[#25C5F4]/40 transition-colors"
                          title={`Switch direct control to ${member.name} (${SHORTCUT_KEYS[cid]})`}
                        >
                          Control
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEntity({ type: 'crew', id: cid });
                            openTaskMenu(
                              member.location === 'transit' || member.location === 'surface'
                                ? 'habitat'
                                : member.location
                            );
                          }}
                          className="px-1.5 py-0.2 rounded bg-[#25C5F4]/20 hover:bg-[#25C5F4] text-[#25C5F4] hover:text-[#080F1B] text-[9px] font-bold border border-[#25C5F4]/50 transition-colors"
                          title="Assign task at current module"
                        >
                          Task
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
