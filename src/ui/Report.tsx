/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/ui/Report.tsx
 * End-of-mission debrief report with score breakdown, safety gate, ending analysis, and replay buttons.
 */

import React from 'react';
import { useGameStore } from '../store/store.ts';
import {
  Trophy,
  FlaskConical,
  AlertTriangle,
  Compass,
  Shield,
  Radio,
  RotateCcw,
} from './icons.tsx';

export const ReportModal: React.FC = () => {
  const state = useGameStore((s) => s.state);
  const restartMission = useGameStore((s) => s.restartMission);
  const setModal = useGameStore((s) => s.setModal);

  const score = state.mission.score;
  const status = state.mission.status;

  if (status === 'in_progress') return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border-2 border-sky-500/80 rounded-2xl max-w-2xl w-full p-6 shadow-2xl text-slate-200 max-h-[90vh] overflow-y-auto animate-fadeIn">
        {/* Header */}
        <div className="text-center pb-4 border-b border-slate-800">
          <div className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-950 text-sky-300 border border-sky-600 mb-2 font-mono">
            Mission Debriefing · NASA Space Apps Junior Trainer
          </div>
          <h1 className="text-2xl font-black text-white flex items-center justify-center gap-2">
            {status === 'mission_accomplished' && (
              <>
                <Trophy className="w-6 h-6 text-[#f59e0b]" />
                <span>Mission Accomplished!</span>
              </>
            )}
            {status === 'scientific_success_resource_failure' && (
              <>
                <FlaskConical className="w-6 h-6 text-[#38bdf8]" />
                <span>Scientific Breakthrough / Resource Strain</span>
              </>
            )}
            {status === 'emergency_mission' && (
              <>
                <AlertTriangle className="w-6 h-6 text-[#f59e0b]" />
                <span>Expedition Complete (Survival Mission)</span>
              </>
            )}
            {status === 'mission_abort' && (
              <>
                <Compass className="w-6 h-6 text-[#ef4444]" />
                <span>Precautionary Mission Abort & Evacuation</span>
              </>
            )}
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            {state.mission.endingReason ?? '30-day lunar surface expedition concluded.'}
          </p>
        </div>

        {/* Score & Band Showcase */}
        {score && (
          <div className="my-5 p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Final Commander Score
              </span>
              <div className="text-4xl font-black text-white mt-0.5">
                {score.total} <span className="text-lg text-slate-500 font-normal">/ 1000</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Evaluation Rank
              </span>
              <div
                className={`text-xl font-black px-3 py-1 rounded-lg mt-1 inline-block ${
                  score.band === 'Gold Commander'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500'
                    : score.band === 'Silver'
                    ? 'bg-slate-300/20 text-slate-200 border border-slate-400'
                    : score.band === 'Bronze'
                    ? 'bg-amber-700/20 text-amber-500 border border-amber-700'
                    : 'bg-slate-700/20 text-slate-400 border border-slate-600'
                }`}
              >
                {score.band}
              </div>
            </div>
          </div>
        )}

        {/* Safety Gate Warning if Triggered */}
        {score?.safetyGateTriggered && (
          <div className="p-3.5 rounded-xl bg-red-950/70 border border-red-500 mb-4 text-xs text-red-200 flex items-start gap-2">
            <Shield className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <strong>NASA Safety Gate Activated:</strong> In human spaceflight, crew safety
              supersedes research. Because an astronaut sustained red radiation exposure or final
              health fell below safe thresholds, science points counted as zero and the maximum rank was
              restricted to Bronze.
            </div>
          </div>
        )}

        {/* 6 Category Breakdown */}
        {score && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-5 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-slate-400 flex items-center justify-between">
                <span>Crew Safety</span>
                <span className="font-bold text-white">{score.crewSafety} / 300</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="h-full bg-emerald-500"
                  style={{ width: `${(score.crewSafety / 300) * 100}%` }}
                />
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-slate-400 flex items-center justify-between">
                <span>Life Support</span>
                <span className="font-bold text-white">{score.lifeSupport} / 200</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="h-full bg-sky-500"
                  style={{ width: `${(score.lifeSupport / 200) * 100}%` }}
                />
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-slate-400 flex items-center justify-between">
                <span>Power Systems</span>
                <span className="font-bold text-white">{score.power} / 150</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="h-full bg-amber-500"
                  style={{ width: `${(score.power / 150) * 100}%` }}
                />
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-slate-400 flex items-center justify-between">
                <span>Radiation Defense</span>
                <span className="font-bold text-white">{score.radiationPreparedness} / 150</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="h-full bg-purple-500"
                  style={{ width: `${(score.radiationPreparedness / 150) * 100}%` }}
                />
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-slate-400 flex items-center justify-between">
                <span>Food & Water</span>
                <span className="font-bold text-white">{score.foodAndWater} / 100</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="h-full bg-cyan-500"
                  style={{ width: `${(score.foodAndWater / 100) * 100}%` }}
                />
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-slate-400 flex items-center justify-between">
                <span>Science Research</span>
                <span className="font-bold text-white">{score.science} / 100</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="h-full bg-violet-500"
                  style={{ width: `${(score.science / 100) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Real-World Science Comparison */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 mb-5 text-xs text-slate-300">
          <div className="text-[11px] font-bold uppercase tracking-wider text-sky-400 mb-1 flex items-center gap-1.5 font-mono">
            <Radio className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span>Real-World NASA Comparison:</span>
          </div>
          <p>
            During your mission, the base faced an X-class solar flare advisory based on real NASA DONKI
            space-weather observations. In actual mission planning, astronauts on the Artemis base camp
            rely on in-situ regolith mass shielding and underground lava tube shelters, as tested in NASA
            OSDR studies.
          </p>
        </div>

        {/* Decision History */}
        {state.stats.decisionsMade.length > 0 && (
          <div className="mb-5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2 font-mono">
              Decision Timeline:
            </span>
            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1 text-xs">
              {state.stats.decisionsMade.map((d, i) => (
                <div
                  key={i}
                  className="p-2 rounded bg-slate-950/80 border border-slate-800 flex items-center justify-between"
                >
                  <span className="text-slate-400">Day {d.day}:</span>
                  <span className="text-white font-medium">{d.title}</span>
                  <span className="text-sky-300 font-bold">{d.choice}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Replay Controls */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={() => {
              restartMission(state.mission.seed);
              setModal('none');
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Try Again (#{state.mission.seed})</span>
          </button>
          <button
            onClick={() => {
              restartMission();
              setModal('none');
            }}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-lg transition-transform hover:scale-105 flex items-center gap-1.5 cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Launch New Expedition</span>
          </button>
        </div>
      </div>
    </div>
  );
};

