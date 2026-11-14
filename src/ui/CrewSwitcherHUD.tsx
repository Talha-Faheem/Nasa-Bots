/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/ui/CrewSwitcherHUD.tsx
 * Quick astronaut switching dock with keyboard shortcuts [1-4, Q, Tab], health, stamina, and live task progress.
 */

import React from 'react';
import { useGameStore } from '../store/store.ts';
import { CrewId } from '../sim/types.ts';
import { getCrewDisplayName } from '../sim/rules/crew.ts';

const CREW_KEYS: { id: CrewId; numKey: string; icon: string }[] = [
  { id: 'alex', numKey: '1', icon: '👨‍🔧' },
  { id: 'sara', numKey: '2', icon: '👩‍🔬' },
  { id: 'daniel', numKey: '3', icon: '👨‍🚀' },
  { id: 'maya', numKey: '4', icon: '👩‍⚕️' },
];

export const CrewSwitcherHUD: React.FC = () => {
  const activePlayerCrew = useGameStore((s) => s.activePlayerCrew);
  const setActivePlayerCrew = useGameStore((s) => s.setActivePlayerCrew);
  const state = useGameStore((s) => s.state);

  return (
    <div className="absolute top-28 left-16 z-20 pointer-events-auto select-none">
      {/* Quick Switcher Bar */}
      <div className="flex flex-col gap-1.5 p-2 rounded-2xl bg-[#080E19]/90 border border-[#293A50] shadow-2xl backdrop-blur-md">
        <div className="flex items-center justify-between px-1 text-[9px] font-bold uppercase tracking-wider text-[#A7B4C8]">
          <span>Expedition Team</span>
          <span className="font-mono text-[8px] text-[#36C5F0]">[Tab] Switch</span>
        </div>

        <div className="flex gap-1.5">
          {CREW_KEYS.map((k) => {
            const member = state.crew[k.id];
            const info = getCrewDisplayName(member);
            const isActive = activePlayerCrew === k.id;
            const isWorking = !!member.currentTask;

            return (
              <button
                key={k.id}
                onClick={() => setActivePlayerCrew(k.id)}
                className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#36C5F0] text-[#080E19] border-[#36C5F0] shadow-lg font-bold scale-105'
                    : 'bg-[#17263A] border-[#293A50] text-[#A7B4C8] hover:border-[#36C5F0]/60 hover:text-white'
                }`}
                title={`Switch control to ${info.shortName} (Key ${k.numKey})`}
              >
                <div className="text-base">{k.icon}</div>
                <div>
                  <div className="flex items-center gap-1.5 leading-tight">
                    <span className="text-xs font-bold">{info.shortName}</span>
                    <span
                      className={`text-[9px] font-mono px-1 rounded ${
                        isActive
                          ? 'bg-[#080E19] text-[#36C5F0] font-bold'
                          : 'bg-[#111C2D] text-[#A7B4C8]'
                      }`}
                    >
                      [{k.numKey}]
                    </span>
                  </div>
                  <div className="text-[9px] font-mono mt-0.5 leading-tight">
                    {member.health} HP • {member.stamina}h
                  </div>
                  <div className="text-[8px] truncate max-w-[85px] mt-0.5">
                    {isWorking ? (
                      <span className={isActive ? 'text-[#080E19] font-bold' : 'text-[#37D67A]'}>
                        ⚡ {member.currentTask?.type.replace('_', ' ')}
                      </span>
                    ) : (
                      <span>Idle</span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Movement Controls Hint */}
        <div className="flex items-center justify-between text-[9px] text-[#A7B4C8] font-mono pt-1 border-t border-[#293A50] px-1">
          <span>[WASD] Walk • [Shift] Run</span>
          <span>[E] Interact • [Q] Cycle</span>
        </div>
      </div>
    </div>
  );
};
