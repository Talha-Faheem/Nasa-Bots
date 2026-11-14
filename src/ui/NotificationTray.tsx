/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/ui/NotificationTray.tsx
 * Compact, Unobtrusive Notification & Space Weather System (Section 4).
 * Auto-dismissing informational toasts, persistent critical advisories, and non-overlapping positioning.
 */

import React, { useState } from 'react';
import { useGameStore } from '../store/store.ts';
import { eventBus } from '../store/bus.ts';

export const NotificationTray: React.FC = () => {
  const radiationAdvisory = useGameStore((s) => s.state.radiationAdvisory);
  const log = useGameStore((s) => s.state.log);
  const dispatch = useGameStore((s) => s.dispatch);
  const selectedEntity = useGameStore((s) => s.selectedEntity);

  const [showFullHistory, setShowFullHistory] = useState(false);

  const isAdvisoryActive = radiationAdvisory && !radiationAdvisory.resolved;
  // Show only 2 recent toasts so they never overwhelm the screen
  const recentLogs = log.slice(-2).reverse();

  // If contextual inspector is open on the right (w-84), position notifications just to the left of it or top-right
  const positionClass = selectedEntity
    ? 'top-24 right-90 max-w-xs'
    : 'top-24 right-4 max-w-sm';

  return (
    <div
      className={`absolute ${positionClass} z-20 pointer-events-none select-none flex flex-col items-end gap-1.5 transition-all duration-300 w-full`}
    >
      {/* Space Weather Alert Banner (Persistent until event passes or crew sheltered) */}
      {isAdvisoryActive && (
        <div className="pointer-events-auto w-full p-2.5 rounded-lg bg-[#101A29]/95 border border-[#F59E0B] shadow-xl backdrop-blur-md animate-fadeIn">
          <div className="flex items-start gap-2">
            <span className="text-base text-[#F59E0B] leading-none mt-0.5">⚠️</span>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#F59E0B]">
                  Space-Weather Advisory
                </span>
                <span className="px-1 py-0.2 rounded text-[8px] font-mono font-bold bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40">
                  {radiationAdvisory.sourceBadge}
                </span>
              </div>
              <p className="text-[11px] text-[#F1F5F9] mt-0.5 leading-snug">
                {radiationAdvisory.eventType} flux arrival in{' '}
                <strong className="text-[#F59E0B] font-mono">
                  {radiationAdvisory.countdownTicks} hours
                </strong>
                .
              </p>
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
                className="mt-1.5 w-full py-1 rounded bg-[#F59E0B] hover:bg-[#F59E0B]/80 text-[#080F1B] text-[10px] font-black transition-all cursor-pointer shadow"
              >
                Shelter All Astronauts ➔
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compact Event Toast Cards */}
      <div className="pointer-events-auto space-y-1 w-full">
        {recentLogs.map((entry) => {
          const isCrit = entry.type === 'alert';
          const isSucc = entry.type === 'success';

          return (
            <div
              key={entry.id}
              className={`p-2 rounded-lg text-xs shadow-md backdrop-blur-md flex items-center gap-2 border transition-all animate-fadeIn ${
                isCrit
                  ? 'bg-[#152235]/95 border-[#EF4444] text-[#EF4444]'
                  : isSucc
                  ? 'bg-[#152235]/95 border-[#22C55E]/80 text-[#22C55E]'
                  : 'bg-[#101A29]/95 border-[#26374D] text-[#94A3B8]'
              }`}
            >
              <span className="font-mono text-[9px] font-bold text-[#25C5F4] shrink-0">
                D{entry.day}:
              </span>
              <span className="text-[10px] text-[#F1F5F9] leading-snug truncate">
                {entry.message}
              </span>
            </div>
          );
        })}
      </div>

      {/* History Log Toggle Button */}
      {log.length > 0 && (
        <button
          onClick={() => setShowFullHistory(!showFullHistory)}
          className="pointer-events-auto px-2 py-0.5 rounded bg-[#101A29]/80 border border-[#26374D] hover:border-[#25C5F4] text-[9px] font-mono text-[#94A3B8] hover:text-[#F1F5F9] transition-colors cursor-pointer backdrop-blur-sm"
        >
          {showFullHistory ? 'Hide Log' : 'Event Log'}
        </button>
      )}

      {/* Full Event History Drawer / Modal */}
      {showFullHistory && (
        <div className="pointer-events-auto w-full p-2.5 rounded-lg bg-[#080F1B]/95 border border-[#26374D] shadow-2xl backdrop-blur-xl text-xs max-h-60 overflow-y-auto space-y-1 animate-fadeIn">
          <div className="flex items-center justify-between pb-1 mb-1 border-b border-[#26374D]">
            <span className="text-[10px] font-bold text-white uppercase">Mission Telemetry Log</span>
            <button
              onClick={() => setShowFullHistory(false)}
              className="text-[#94A3B8] hover:text-white text-xs font-bold"
            >
              ✕
            </button>
          </div>
          {log.slice(-15).reverse().map((entry) => (
            <div key={entry.id} className="text-[10px] font-mono py-0.5 border-b border-[#26374D]/40 text-[#94A3B8]">
              <span className="text-[#25C5F4] font-bold">D{entry.day} T{entry.tick}: </span>
              <span className="text-[#F1F5F9]">{entry.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
