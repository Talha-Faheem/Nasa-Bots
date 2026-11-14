/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/ui/UserManualModal.tsx
 * Complete 24-section interactive player manual and STEM educational encyclopedia.
 */

import React, { useState } from 'react';
import { useGameStore } from '../store/store.ts';

interface ManualSection {
  id: string;
  title: string;
  icon: string;
  content: React.ReactNode;
}

export const UserManualModal: React.FC = () => {
  const activeModal = useGameStore((s) => s.activeModal);
  const setModal = useGameStore((s) => s.setModal);

  const [activeSectionId, setActiveSectionId] = useState('getting_started');
  const [searchQuery, setSearchQuery] = useState('');

  if (activeModal !== 'manual') return null;

  const sections: ManualSection[] = [
    {
      id: 'getting_started',
      title: '1. Getting Started & Controls',
      icon: '🚀',
      content: (
        <div className="space-y-3">
          <h4 className="text-base font-black text-white">Welcome to Mission Control!</h4>
          <p>
            You are the Expedition Commander of a 4-person scientific outpost established near the
            Moon’s South Pole (Shackleton Crater). Your goal is to keep all four astronauts alive,
            maintain critical base infrastructure, conduct scientific research, and survive for 30
            consecutive mission days.
          </p>
          <div className="p-3 rounded-xl bg-[#17263A] border border-[#293A50] space-y-1.5 font-mono text-xs">
            <div className="font-bold text-[#36C5F0] uppercase">Third-Person Controls:</div>
            <div><strong className="text-white">W, A, S, D:</strong> Walk / move the active astronaut in 3D</div>
            <div><strong className="text-white">Shift:</strong> Sprint / run across the lunar surface</div>
            <div><strong className="text-white">E:</strong> Interact with nearby building or equipment</div>
            <div><strong className="text-white">1, 2, 3, 4:</strong> Switch control between Alex, Sara, Daniel, Maya</div>
            <div><strong className="text-white">Q:</strong> Cycle to previous astronaut</div>
            <div><strong className="text-white">Tab:</strong> Toggle Astronaut Switcher HUD</div>
            <div><strong className="text-white">Spacebar:</strong> Pause / Resume the simulation clock</div>
            <div><strong className="text-white">Mouse Drag & Wheel:</strong> Orbit camera and zoom</div>
          </div>
        </div>
      ),
    },
    {
      id: 'time_and_ticks',
      title: '2. Time & 24-Tick Simulation',
      icon: '⏱️',
      content: (
        <div className="space-y-3">
          <h4 className="text-base font-black text-white">How Time Passes on the Moon</h4>
          <p>
            The simulation advances in fixed timesteps called <strong>ticks</strong>. There are exactly{' '}
            <strong>24 ticks in 1 mission day</strong> (1 tick = 1 game hour). A full 30-day mission consists of 720 ticks.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-[#A7B4C8]">
            <li><strong>1x Speed:</strong> 1 tick takes 1.25 real seconds (~30 real seconds per mission day). A full 30-day mission takes ~15 minutes.</li>
            <li><strong>2x / 4x Speeds:</strong> Speeds up the tick rate for fast progression once base operations are stabilized.</li>
            <li><strong>Pause:</strong> Freezes the clock so you can review telemetry, assign crew tasks, and evaluate emergency decisions without time pressure.</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'resources_power',
      title: '3. Electrical Power & Solar Night',
      icon: '⚡',
      content: (
        <div className="space-y-3">
          <h4 className="text-base font-black text-white">Photovoltaics & Priority Load Shedding</h4>
          <p>
            Solar panels convert sunlight into electrical power. Generation follows the south polar illumination schedule:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-[#A7B4C8]">
            <li><strong>Days 1–10:</strong> 100% sunlight (optimal generation)</li>
            <li><strong>Days 11–15:</strong> 80% sunlight</li>
            <li><strong>Days 16–22:</strong> 50% sunlight (Lunar Night Dip — critical energy conservation period)</li>
            <li><strong>Days 23–30:</strong> 70% sunlight</li>
          </ul>
          <div className="p-3 rounded-xl bg-[#17263A] border border-[#293A50] text-xs">
            <strong className="text-[#36C5F0] block mb-1">Automatic Priority Shedding:</strong>
            When power demand exceeds generation and battery reserves, non-essential systems are automatically shut down in sequence:
            <ol className="list-decimal pl-4 mt-1 text-[#A7B4C8] space-y-0.5">
              <li>Rover Recharging & Regolith Printing</li>
              <li>Science Research Laboratory</li>
              <li>Greenhouse Lighting</li>
              <li>Water Recycler</li>
              <li>Life Support & Habitat Heat (Never shed unless battery drops to 0)</li>
            </ol>
          </div>
        </div>
      ),
    },
    {
      id: 'resources_life_support',
      title: '4. Oxygen & Life Support (ECLSS)',
      icon: '💨',
      content: (
        <div className="space-y-3">
          <h4 className="text-base font-black text-white">Atmospheric Revitalization</h4>
          <p>
            Four astronauts consume oxygen at a constant rate of <strong>6.0 O2 units per day</strong> (0.25 per tick).
            When powered and undamaged, the Life Support module regenerates oxygen continuously.
          </p>
          <div className="p-3 rounded-xl bg-[#FF5B5B]/10 border border-[#FF5B5B]/40 text-xs text-[#FF5B5B]">
            <strong>Critical Safety Gate:</strong> If oxygen drops to 0 for 48 consecutive ticks (2 full days), an Emergency Abort is triggered and the mission fails. Maintain at least 20 O2 at all times!
          </div>
        </div>
      ),
    },
    {
      id: 'resources_water',
      title: '5. Water Recycling & Closed-Loop Recovery',
      icon: '💧',
      content: (
        <div className="space-y-3">
          <h4 className="text-base font-black text-white">Closed-Loop Hydrology</h4>
          <p>
            Crew hydration and hydroponic crop beds consume water every day. Because launching water from Earth is extremely heavy,
            the Water Recycler reclaims <strong>75% of wastewater</strong> when at 100% mechanical condition.
          </p>
          <p>
            If water storage drops below 15 units, strict rationing takes effect, reducing crop efficiency and causing crew fatigue.
          </p>
        </div>
      ),
    },
    {
      id: 'resources_food',
      title: '6. Hydroponics & Crop Harvests',
      icon: '🌱',
      content: (
        <div className="space-y-3">
          <h4 className="text-base font-black text-white">Growing Food Without Soil</h4>
          <p>
            The Hydroponic Greenhouse features two growing beds (Bed 2 unlocks on Day 6). Three crop varieties are available:
          </p>
          <div className="grid grid-cols-3 gap-2 text-xs font-mono">
            <div className="p-2 rounded bg-[#17263A] border border-[#293A50]">
              <strong className="text-white block">Quick Greens</strong>
              <div className="text-[#37D67A]">8 days</div>
              <div className="text-[#A7B4C8]">Yield: 12 rations</div>
            </div>
            <div className="p-2 rounded bg-[#17263A] border border-[#293A50]">
              <strong className="text-white block">Dwarf Tomatoes</strong>
              <div className="text-[#37D67A]">11 days</div>
              <div className="text-[#A7B4C8]">Yield: 18 rations</div>
            </div>
            <div className="p-2 rounded bg-[#17263A] border border-[#293A50]">
              <strong className="text-white block">Potatoes</strong>
              <div className="text-[#37D67A]">14 days</div>
              <div className="text-[#A7B4C8]">Yield: 30 rations</div>
            </div>
          </div>
          <p className="text-xs text-[#A7B4C8]">
            Crops require active water and power. If left without care for 3 consecutive days, crops wither and die.
          </p>
        </div>
      ),
    },
    {
      id: 'astronauts_guide',
      title: '7. Astronaut Roster & Perks',
      icon: '👨‍🚀',
      content: (
        <div className="space-y-3">
          <h4 className="text-base font-black text-white">The Expedition Crew</h4>
          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-[#17263A] border border-[#293A50]">
              <strong className="text-white">Alex Morgan — Systems Engineer</strong>
              <p className="text-[#A7B4C8]">Perk: <em>Fast Mechanic</em> — Repairs complete 1 hour faster and use 1 fewer spare part.</p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#17263A] border border-[#293A50]">
              <strong className="text-white">Dr. Sara Williams — Biologist & Botanist</strong>
              <p className="text-[#A7B4C8]">Perk: <em>Green Thumb</em> — All hydroponic harvests yield a +10% food bonus.</p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#17263A] border border-[#293A50]">
              <strong className="text-white">Daniel Vance — Mission Commander</strong>
              <p className="text-[#A7B4C8]">Perk: <em>Leadership</em> — Surface rover expeditions take 1 fewer tick to complete.</p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#17263A] border border-[#293A50]">
              <strong className="text-white">Dr. Maya Chen — Flight Surgeon</strong>
              <p className="text-[#A7B4C8]">Perk: <em>Crew Care</em> — All astronauts heal +1 extra HP every night.</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'space_weather',
      title: '8. Space Weather & Radiation Protection',
      icon: '☢️',
      content: (
        <div className="space-y-3">
          <h4 className="text-base font-black text-white">Solar Flares & Coronal Mass Ejections</h4>
          <p>
            The Moon has no atmosphere or global magnetic field to shield astronauts from solar cosmic rays.
            When NASA space-weather satellites detect an event (powered by real NASA DONKI open data), a 12-hour warning countdown begins.
          </p>
          <div className="p-3 rounded-xl bg-[#17263A] border border-[#293A50] text-xs space-y-1">
            <strong className="text-[#36C5F0]">Shelter Position Factors:</strong>
            <div>• <strong className="text-white">Radiation Shelter:</strong> 0.15× (85% reduction in exposure points)</div>
            <div>• <strong className="text-white">Habitat Base:</strong> 0.50× (50% reduction)</div>
            <div>• <strong className="text-white">Surface / Transit:</strong> 1.00× (Full 100% exposure)</div>
          </div>
          <p className="text-xs text-[#F5B942]">
            Always use "Shelter All" before the countdown expires! Astronauts with &gt;60 risk points suffer -15 HP health penalties.
          </p>
        </div>
      ),
    },
    {
      id: 'rover_and_science',
      title: '9. Rover Expeditions & Lab Research',
      icon: '🔬',
      content: (
        <div className="space-y-3">
          <h4 className="text-base font-black text-white">Scientific Discovery on the Moon</h4>
          <p>
            Deploy the Lunar Rover to south polar landmarks (Shackleton Rim Crest, Permanently Shadowed Cold Trap, Malapert Mountain, and the historic Apollo site) to collect pristine geological core samples.
          </p>
          <p>
            At the Science Laboratory, conduct 6 research investigations into lunar soil composition, water-ice volatiles, and closed-loop ECLSS efficiency to unlock permanent base perks and boost your final score!
          </p>
        </div>
      ),
    },
    {
      id: 'stem_glossary',
      title: '10. Junior Astronaut STEM Glossary',
      icon: '📚',
      content: (
        <div className="space-y-2.5 text-xs text-[#A7B4C8]">
          <div>
            <strong className="text-white">Lunar Regolith:</strong>
            <p>Fine, powdery volcanic soil and jagged mineral fragments covering the Moon’s surface. It can be sintered into radiation shielding.</p>
          </div>
          <div>
            <strong className="text-white">Coronal Mass Ejection (CME):</strong>
            <p>A massive burst of magnetized solar plasma and high-energy protons ejected into space from the Sun’s corona.</p>
          </div>
          <div>
            <strong className="text-white">Permanently Shadowed Region (PSR):</strong>
            <p>Deep crater depressions at the lunar poles that have never seen sunlight in billions of years, harboring ancient water ice.</p>
          </div>
          <div>
            <strong className="text-white">ECLSS:</strong>
            <p>Environmental Control and Life Support System — technology that recycles air, recovers water, and maintains breathable pressure.</p>
          </div>
        </div>
      ),
    },
  ];

  const filteredSections = sections.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeSection = sections.find((s) => s.id === activeSectionId) || sections[0];

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none"
      onClick={() => setModal('none')}
    >
      <div
        className="bg-[#080E19] border-2 border-[#293A50] rounded-3xl max-w-4xl w-full h-[620px] shadow-2xl flex flex-col overflow-hidden text-[#F4F7FC] animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 border-b border-[#293A50] bg-[#111C2D] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#36C5F0]/20 border border-[#36C5F0] flex items-center justify-center text-lg">
              📖
            </div>
            <div>
              <h2 className="text-base font-black text-white uppercase tracking-wider">
                Junior Astronaut Operations Manual
              </h2>
              <p className="text-[11px] text-[#A7B4C8]">
                Official Outpost Commander Field Manual & STEM Scientific Guide
              </p>
            </div>
          </div>
          <button
            onClick={() => setModal('none')}
            className="w-8 h-8 rounded-lg bg-[#17263A] hover:bg-[#FF5B5B] hover:text-white text-[#A7B4C8] font-bold text-sm transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Body: Left Section Rail + Right Article */}
        <div className="flex flex-1 overflow-hidden">
          {/* Section List */}
          <div className="w-72 border-r border-[#293A50] bg-[#080E19] p-3 flex flex-col">
            <input
              type="text"
              placeholder="Search manual topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 rounded-xl bg-[#111C2D] border border-[#293A50] text-xs text-white placeholder-[#A7B4C8] mb-2 focus:outline-none focus:border-[#36C5F0]"
            />
            <div className="space-y-1 overflow-y-auto flex-1 pr-1">
              {filteredSections.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => setActiveSectionId(sec.id)}
                  className={`w-full p-2 rounded-xl text-left text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    activeSectionId === sec.id
                      ? 'bg-[#36C5F0] text-[#080E19] shadow-md'
                      : 'text-[#A7B4C8] hover:bg-[#17263A] hover:text-white'
                  }`}
                >
                  <span>{sec.icon}</span>
                  <span className="truncate">{sec.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Article Content */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 text-xs text-[#A7B4C8] leading-relaxed">
            <div className="flex items-center gap-2 pb-2 border-b border-[#293A50] text-[#36C5F0]">
              <span className="text-2xl">{activeSection.icon}</span>
              <h3 className="text-lg font-black text-white">{activeSection.title}</h3>
            </div>
            {activeSection.content}
          </div>
        </div>
      </div>
    </div>
  );
};

