/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/ui/TutorialOverlay.tsx
 * Friendly, interactive step-by-step onboarding walkthrough designed for junior astronauts (ages 7–12).
 */

import React from 'react';
import { useGameStore } from '../store/store.ts';

interface StepData {
  title: string;
  badge: string;
  description: string;
  tip: string;
  highlightPosition: string; // for UI focus
}

const TUTORIAL_STEPS: StepData[] = [
  {
    title: 'Welcome to Lunar Frontier, Commander!',
    badge: 'Step 1 of 7',
    description:
      'Congratulations on taking command of Lunar Outpost Alpha near the Moon’s South Pole. You and four courageous astronauts must survive for 30 days while managing air, water, power, and food!',
    tip: 'Click Next to begin your flight orientation training.',
    highlightPosition: 'center',
  },
  {
    title: 'Monitoring Critical Base Telemetry',
    badge: 'Step 2 of 7',
    description:
      'At the top of your screen, seven resource cards track your power, oxygen, water, food, crew health, radiation risk, and communications link. Hover your mouse over any card to inspect detailed engineering data!',
    tip: 'Keep your oxygen above 20 units and power above 20% to prevent life support failures.',
    highlightPosition: 'top',
  },
  {
    title: 'Operating 3D Base Modules',
    badge: 'Step 3 of 7',
    description:
      'The central 3D view shows your eight outpost buildings. Click on any building (like the Solar Array or Habitat) to center your camera, inspect equipment condition, assign maintenance, or install upgrades!',
    tip: 'Drag your mouse to orbit around the base and mousewheel to zoom.',
    highlightPosition: 'center',
  },
  {
    title: 'Your Expedition Astronaut Team',
    badge: 'Step 4 of 7',
    description:
      'At the bottom of your screen, your four crew members (Alex, Dr. Sara, Daniel, and Dr. Maya) are ready for duty. Each astronaut has 8 daily stamina hours and a unique specialized perk!',
    tip: 'Alex Morgan performs repairs faster, while Dr. Sara Williams gets extra crop yields.',
    highlightPosition: 'bottom',
  },
  {
    title: 'Hydroponic Greenhouse Farming',
    badge: 'Step 5 of 7',
    description:
      'Crops provide fresh rations and keep the crew healthy. You can plant Quick Greens (8 days), Dwarf Tomatoes (11 days), or Potatoes (14 days). Remember to water crops so they don’t wither!',
    tip: 'Assign Dr. Sara Williams to harvest ripe crops for a 10% food bonus.',
    highlightPosition: 'center',
  },
  {
    title: 'Space Weather & Radiation Protection',
    badge: 'Step 6 of 7',
    description:
      'Solar flares and coronal mass ejections can strike the airless Moon! When a space-weather alert appears, you will have a 12-hour warning to move your astronauts into the underground Radiation Shelter.',
    tip: 'The Radiation Shelter reduces incoming solar cosmic radiation by 85%!',
    highlightPosition: 'top',
  },
  {
    title: 'Simulation Speeds & Manual',
    badge: 'Step 7 of 7',
    description:
      'Use the Pause, 1x, 2x, and 4x buttons at the top to control time. If you ever need guidance, click the MANUAL button to open the complete 24-section encyclopedia at any time.',
    tip: 'Press the Spacebar at any moment to pause the game and plan your next move!',
    highlightPosition: 'top',
  },
];

export const TutorialOverlay: React.FC = () => {
  const tutorialStep = useGameStore((s) => s.tutorialStep);
  const setTutorialStep = useGameStore((s) => s.setTutorialStep);

  if (tutorialStep < 0 || tutorialStep >= TUTORIAL_STEPS.length) return null;

  const current = TUTORIAL_STEPS[tutorialStep];
  const isFirst = tutorialStep === 0;
  const isLast = tutorialStep === TUTORIAL_STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[120] pointer-events-auto select-none bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#080E19] border-2 border-[#36C5F0] rounded-3xl max-w-lg w-full p-6 shadow-2xl text-[#F4F7FC]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#293A50] mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎓</span>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#36C5F0] block">
                {current.badge}
              </span>
              <h3 className="text-base font-black text-white">{current.title}</h3>
            </div>
          </div>
          <button
            onClick={() => setTutorialStep(-1)}
            className="text-xs text-[#A7B4C8] hover:text-white font-bold cursor-pointer"
          >
            Skip Tutorial
          </button>
        </div>

        {/* Body */}
        <p className="text-xs text-[#A7B4C8] leading-relaxed mb-3">
          {current.description}
        </p>

        <div className="p-3 rounded-xl bg-[#111C2D] border border-[#293A50] mb-5">
          <span className="text-[#36C5F0] font-bold text-xs block mb-0.5">Commander Tip:</span>
          <span className="text-[11px] text-white">{current.tip}</span>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between pt-2">
          {!isFirst ? (
            <button
              onClick={() => setTutorialStep(tutorialStep - 1)}
              className="px-4 py-2 rounded-xl bg-[#17263A] hover:bg-[#293A50] text-xs font-bold text-[#A7B4C8] hover:text-white transition-colors cursor-pointer"
            >
              Previous
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={() => {
              if (isLast) {
                setTutorialStep(-1);
              } else {
                setTutorialStep(tutorialStep + 1);
              }
            }}
            className="px-5 py-2 rounded-xl bg-[#36C5F0] hover:bg-[#36C5F0]/80 text-[#080E19] text-xs font-black shadow-lg transition-transform hover:scale-105 cursor-pointer"
          >
            {isLast ? 'Complete Training ➔' : 'Next Step ➔'}
          </button>
        </div>
      </div>
    </div>
  );
};

