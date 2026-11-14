/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/ui/NotificationTray.tsx
 * Space-weather emergency banner and real-time mission telemetry notification log.
 */

import React from 'react';
import { useGameStore } from '../store/store.ts';
import { eventBus } from '../store/bus.ts';

export const NotificationTray: React.FC = () => {
  const radiationAdvisory = useGameStore((s) => s.state.radiationAdvisory);
  const log = useGameStore((s) => s.state.log);
  const dispatch = useGameStore((s) => s.dispatch);

  const isAdvisoryActive = radiationAdvisory && !radiationAdvisory.resolved;
  const recentLogs = log.slice(-4).reverse();

  return (
    <div className="absolute top-28 right-4 z-20 pointer-events-none select-none flex flex-col items-end gap-2 max-w-sm w-full">
      {/* Space Weather Alert Banner */}
      {isAdvisoryActive && (
        <div className="pointer-events-auto w-full p-3 rounded-2xl bg-[#111C2D]/95 border-2 border-[#F5B942] shadow-2xl backdrop-blur-xl animate-bounce">
          <div className="flex items-start gap-2.5">
            <span className="text-2xl animate-spin">☢️</span>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#F5B942]">
                  Space-Weather Advisory
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#F5B942]/20 text-[#F5B942] border border-[#F5B942]/40">
                  {radiationAdvisory.sourceBadge}
                </span>
              </div>
              <p className="text-xs text-white font-medium mt-0.5">
                {radiationAdvisory.eventType} detected! High-energy proton flux arrival in{' '}
                <strong className="text-[#F5B942] font-black font-mono">
                  {radiationAdvisory.countdownTicks} game hours
                </strong>
                .
              </p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => {
                    for (const cid of ['alex', 'sara', 'daniel', 'maya'] as const) {
                      dispatch({
                        type: 'MOVE_CREW',
                        crewId: cid,
                        targetBuilding: 'shelter',
                      });
                    }
                    eventBus.emit('sound:play', { name: 'alarm' });
                  }}
                  className="flex-1 py-1.5 rounded-lg bg-[#F5B942] hover:bg-[#F5B942]/80 text-[#080E19] text-xs font-black shadow-lg transition-transform hover:scale-105 cursor-pointer"
                >
                  Shelter All Astronauts ➔
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Recent Event Feeds */}
      <div className="pointer-events-auto space-y-1.5 w-full">
        {recentLogs.map((entry) => (
          <div
            key={entry.id}
            className={`p-2.5 rounded-xl text-xs font-medium shadow-xl backdrop-blur-md flex items-center gap-2 border transition-all ${
              entry.type === 'alert'
                ? 'bg-[#FF5B5B]/20 border-[#FF5B5B] text-[#FF5B5B]'
                : entry.type === 'success'
                ? 'bg-[#37D67A]/20 border-[#37D67A] text-[#37D67A]'
                : 'bg-[#111C2D]/90 border-[#293A50] text-[#A7B4C8]'
            }`}
          >
            <span className="font-mono text-[10px] font-bold text-[#36C5F0] shrink-0">
              D{entry.day}:
            </span>
            <span className="text-[11px] leading-snug line-clamp-2">{entry.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
