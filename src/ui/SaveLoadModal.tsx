/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/ui/SaveLoadModal.tsx
 * Slot-based save & load management with difficulty selection and mission reset.
 */

import React, { useState } from 'react';
import { useGameStore } from '../store/store.ts';

export const SaveLoadModal: React.FC = () => {
  const activeModal = useGameStore((s) => s.activeModal);
  const setModal = useGameStore((s) => s.setModal);
  const saveGame = useGameStore((s) => s.saveGame);
  const loadGame = useGameStore((s) => s.loadGame);
  const hasSavedGame = useGameStore((s) => s.hasSavedGame);
  const restartMission = useGameStore((s) => s.restartMission);

  const [selectedDifficulty, setSelectedDifficulty] = useState<'cadet' | 'explorer' | 'commander'>('commander');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (activeModal !== 'save_load') return null;

  const slots = [
    { id: 'lunar_save_slot_1', label: 'Mission Slot 1' },
    { id: 'lunar_save_slot_2', label: 'Mission Slot 2' },
    { id: 'lunar_save_slot_3', label: 'Mission Slot 3' },
  ];

  const handleSave = (slotId: string) => {
    saveGame(slotId);
    setStatusMessage(`Saved current progress to ${slotId}!`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleLoad = (slotId: string) => {
    const ok = loadGame(slotId);
    if (ok) {
      setModal('none');
    } else {
      setStatusMessage('No valid mission data found in this slot.');
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none"
      onClick={() => setModal('none')}
    >
      <div
        className="bg-[#080E19] border-2 border-[#293A50] rounded-3xl max-w-lg w-full p-6 shadow-2xl text-[#F4F7FC] animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#293A50] mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">💾</span>
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-wider">
                Mission Persistence
              </h3>
              <p className="text-[11px] text-[#A7B4C8]">
                Save mission progress or start a new expedition with difficulty selection
              </p>
            </div>
          </div>
          <button
            onClick={() => setModal('none')}
            className="w-7 h-7 rounded-lg bg-[#17263A] hover:bg-[#FF5B5B] hover:text-white text-[#A7B4C8] font-bold text-xs transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {statusMessage && (
          <div className="p-2 mb-3 rounded-lg bg-[#36C5F0]/20 border border-[#36C5F0] text-xs text-[#36C5F0] text-center font-bold">
            {statusMessage}
          </div>
        )}

        {/* Save Slots */}
        <div className="space-y-2 mb-5">
          <label className="text-[10px] uppercase font-bold text-[#A7B4C8] tracking-wider block">
            Mission Save Slots:
          </label>
          {slots.map((slot) => {
            const exists = hasSavedGame(slot.id);
            return (
              <div
                key={slot.id}
                className="p-3 rounded-xl bg-[#17263A] border border-[#293A50] flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-white">{slot.label}</div>
                  <div className="text-[10px] text-[#A7B4C8] font-mono">
                    {exists ? 'Saved Mission Available' : 'Empty Slot'}
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleSave(slot.id)}
                    className="px-2.5 py-1 rounded bg-[#36C5F0] hover:bg-[#36C5F0]/80 text-[#080E19] text-xs font-bold transition-colors cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    disabled={!exists}
                    onClick={() => handleLoad(slot.id)}
                    className="px-2.5 py-1 rounded bg-[#111C2D] hover:bg-[#37D67A] hover:text-[#080E19] text-[#37D67A] disabled:opacity-30 border border-[#37D67A]/40 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Load
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Start New Mission / Difficulty Selector */}
        <div className="p-4 rounded-2xl bg-[#111C2D] border border-[#293A50] space-y-3">
          <div className="text-xs font-black text-white uppercase tracking-wider">
            Start New Mission (Difficulty Selection)
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'cadet', label: 'Cadet', desc: 'Higher starting supplies & slower wear.' },
              { id: 'explorer', label: 'Explorer', desc: 'Balanced standard simulation.' },
              { id: 'commander', label: 'Commander', desc: 'Demanding resource constraints.' },
            ].map((diff) => (
              <button
                key={diff.id}
                onClick={() => setSelectedDifficulty(diff.id as any)}
                className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedDifficulty === diff.id
                    ? 'bg-[#36C5F0] text-[#080E19] border-[#36C5F0] font-bold shadow'
                    : 'bg-[#17263A] border-[#293A50] text-[#A7B4C8] hover:text-white'
                }`}
              >
                <div className="text-xs font-bold">{diff.label}</div>
                <div className="text-[9px] mt-0.5 leading-tight opacity-90">{diff.desc}</div>
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              if (window.confirm('Start a new 30-day mission with selected difficulty? Unsaved progress will be reset.')) {
                restartMission(undefined, selectedDifficulty);
              }
            }}
            className="w-full py-2 rounded-xl bg-[#FF5B5B] hover:bg-[#FF5B5B]/80 text-white text-xs font-black shadow-lg transition-all cursor-pointer"
          >
            Start New Mission ({selectedDifficulty.toUpperCase()})
          </button>
        </div>
      </div>
    </div>
  );
};
