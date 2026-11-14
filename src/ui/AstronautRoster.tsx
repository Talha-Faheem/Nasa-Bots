/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/ui/AstronautRoster.tsx
 * Bottom astronaut crew cards with health, stamina, current task, and one-click task assignment.
 */

import React from 'react';
import { useGameStore } from '../store/store.ts';
import { CrewId } from '../sim/types.ts';
import { getCrewDisplayName } from '../sim/rules/crew.ts';

const CREW_AVATARS: Record<CrewId, string> = {
  alex: '👨‍🔧',
  sara: '👩‍🔬',
  daniel: '👨‍🚀',
  maya: '👩‍⚕️',
};

export const AstronautRoster: React.FC = () => {
  const crew = useGameStore((s) => s.state.crew);
  const selectedCrew = useGameStore((s) => s.selectedCrew);
  const setSelectedEntity = useGameStore((s) => s.setSelectedEntity);
  const openTaskMenu = useGameStore((s) => s.openTaskMenu);

  return (
    <div className="absolute bottom-3 left-4 right-4 z-20 pointer-events-auto select-none">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 max-w-5xl mx-auto">
        {(Object.keys(crew) as CrewId[]).map((cid) => {
          const member = crew[cid];
          const info = getCrewDisplayName(member);
          const isSelected = selectedCrew === cid;
          const isTired = member.stamina <= 1;

          return (
            <div
              key={cid}
              onClick={() => setSelectedEntity({ type: 'crew', id: cid })}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer shadow-xl backdrop-blur-md flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#17263A] border-[#36C5F0] ring-1 ring-[#36C5F0]'
                  : 'bg-[#080E19]/90 border-[#293A50] hover:border-[#36C5F0]/60 hover:bg-[#111C2D]'
              }`}
            >
              {/* Header: Avatar, Name, HP */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#111C2D] border border-[#293A50] flex items-center justify-center text-sm">
                    {CREW_AVATARS[cid]}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white leading-tight">
                      {info.shortName}
                    </div>
                    <div className="text-[9px] text-[#36C5F0] font-medium leading-tight">
                      {info.role}
                    </div>
                  </div>
                </div>

                <div
                  className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    member.health < 30
                      ? 'bg-[#FF5B5B]/20 text-[#FF5B5B] animate-pulse'
                      : member.health < 60
                      ? 'bg-[#F5B942]/20 text-[#F5B942]'
                      : 'bg-[#37D67A]/20 text-[#37D67A]'
                  }`}
                >
                  {member.health} HP
                </div>
              </div>

              {/* Stamina bar */}
              <div className="my-1.5">
                <div className="flex justify-between text-[9px] text-[#A7B4C8] font-mono mb-0.5">
                  <span>Stamina</span>
                  <span className={isTired ? 'text-[#FF5B5B] font-bold' : ''}>
                    {member.stamina} / 8h
                  </span>
                </div>
                <div className="w-full h-1 bg-[#111C2D] rounded-full overflow-hidden border border-[#293A50]">
                  <div
                    className={`h-full rounded-full transition-all ${
                      member.stamina <= 1
                        ? 'bg-[#FF5B5B]'
                        : member.stamina <= 3
                        ? 'bg-[#F5B942]'
                        : 'bg-[#37D67A]'
                    }`}
                    style={{ width: `${(Math.max(0, member.stamina) / 8) * 100}%` }}
                  />
                </div>
              </div>

              {/* Location & Task Action */}
              <div className="flex items-center justify-between text-[10px] text-[#A7B4C8] pt-1 border-t border-[#293A50]/60">
                <span className="truncate max-w-[110px]">
                  📍 {member.location.replace('_', ' ')}
                </span>
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
                  className="px-2 py-0.5 rounded bg-[#17263A] hover:bg-[#36C5F0] text-[#36C5F0] hover:text-[#080E19] font-bold text-[9px] border border-[#36C5F0]/40 transition-colors cursor-pointer"
                >
                  Task ➔
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

