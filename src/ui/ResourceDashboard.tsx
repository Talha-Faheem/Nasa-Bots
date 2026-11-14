/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/ui/ResourceDashboard.tsx
 * Professional NASA-inspired telemetry cards with live rates, trends, status tags, and educational tooltips.
 */

import React, { useState } from 'react';
import { useGameStore } from '../store/store.ts';

interface TooltipData {
  title: string;
  category: string;
  current: string;
  rate: string;
  status: string;
  physicsExplanation: string;
  managementTip: string;
}

export const ResourceDashboard: React.FC = () => {
  const state = useGameStore((s) => s.state);
  const [activeTooltip, setActiveTooltip] = useState<TooltipData | null>(null);

  const { resources, powerBreakdown, systems, crew, greenhouseBeds } = state;

  // Average crew health
  const crewMembers = Object.values(crew);
  const avgHealth = Math.round(crewMembers.reduce((acc, c) => acc + c.health, 0) / crewMembers.length);
  const totalStamina = crewMembers.reduce((acc, c) => acc + c.stamina, 0);
  const maxStamina = crewMembers.length * 8;

  // Maximum risk points among crew
  const maxExposure = Math.max(...crewMembers.map((c) => c.exposure));

  // Battery status & trends
  const batteryDelta = Math.round(powerBreakdown.batteryDeltaPerTick * 24 * 10) / 10;
  const isBatteryDraining = powerBreakdown.batteryDeltaPerTick < 0;

  // Active crop count
  const activeBeds = [greenhouseBeds.bed1, greenhouseBeds.bed2].filter((b) => b.unlocked && b.cropType !== null);
  const readyBeds = activeBeds.filter((b) => b.stage === 'ready');

  // Days of oxygen remaining estimate
  const oxygenDaysLeft = resources.oxygen > 0 ? (resources.oxygen / 6.0).toFixed(1) : '0';
  // Days of water remaining estimate
  const waterDemandDaily = 4.0 + activeBeds.length * 2.0;
  const netWaterDaily = Math.max(0.5, waterDemandDaily - (waterDemandDaily * 0.75 * (systems.recycler.condition / 100)));
  const waterDaysLeft = (resources.water / netWaterDaily).toFixed(1);
  // Days of food remaining estimate
  const foodDaysLeft = (resources.food / 3.5).toFixed(1);

  return (
    <div className="relative px-4 pt-2 select-none z-20 pointer-events-auto">
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {/* 1. Electricity ⚡ */}
        <div
          className="relative bg-[#17263A]/90 hover:bg-[#17263A] border border-[#293A50] hover:border-[#36C5F0]/60 rounded-xl p-2.5 shadow-lg backdrop-blur-md cursor-help transition-all"
          onMouseEnter={() =>
            setActiveTooltip({
              title: 'Electrical Power Subsystem (EPS)',
              category: 'Power & Energy Storage',
              current: `${Math.round(resources.battery)} / 100 kWh Buffer`,
              rate: `${batteryDelta >= 0 ? '+' : ''}${batteryDelta} kWh / day`,
              status:
                powerBreakdown.shedSystems.length > 0
                  ? `Load Shedding (${powerBreakdown.shedSystems.join(', ')})`
                  : systems.solarArray.condition < 50
                  ? 'Degraded Photovoltaics'
                  : 'Nominal Generation',
              physicsExplanation:
                'Photovoltaic panels convert solar photons into electricity. Because nights near the lunar pole drop sunlight, battery reserves and automatic priority shedding prevent total outpost blackout.',
              managementTip:
                'Repair the Solar Array if condition drops below 50%. Build the Aerogel Insulation upgrade to reduce habitat heating drain.',
            })
          }
          onMouseLeave={() => setActiveTooltip(null)}
        >
          <div className="flex items-center justify-between text-[11px] font-bold text-[#A7B4C8]">
            <span className="flex items-center gap-1 text-[#F4F7FC]">
              <span>⚡</span> Power
            </span>
            <span
              className={`font-mono text-[10px] px-1 rounded ${
                isBatteryDraining ? 'text-[#FF5B5B] bg-[#FF5B5B]/10' : 'text-[#37D67A] bg-[#37D67A]/10'
              }`}
            >
              {batteryDelta >= 0 ? '+' : ''}
              {batteryDelta}/d
            </span>
          </div>

          <div className="flex items-baseline justify-between mt-1">
            <span className="text-lg font-black font-mono text-[#F4F7FC]">
              {Math.round(resources.battery)}%
            </span>
            <span className="text-[10px] font-mono text-[#A7B4C8]">
              {Math.round(powerBreakdown.generationPerDay)} gen / {Math.round(powerBreakdown.totalDemandPerDay)} dem
            </span>
          </div>

          <div className="w-full h-1.5 bg-[#080E19] rounded-full overflow-hidden mt-1.5 border border-[#293A50]">
            <div
              className={`h-full rounded-full transition-all ${
                resources.battery < 20
                  ? 'bg-[#FF5B5B]'
                  : resources.battery < 50
                  ? 'bg-[#F5B942]'
                  : 'bg-[#36C5F0]'
              }`}
              style={{ width: `${Math.max(0, Math.min(100, resources.battery))}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[9px] text-[#A7B4C8] mt-1 font-mono">
            <span>Solar: {systems.solarArray.condition}%</span>
            <span>Sun: {Math.round(powerBreakdown.sunlightFactor * 100)}%</span>
          </div>
        </div>

        {/* 2. Oxygen 💨 */}
        <div
          className="relative bg-[#17263A]/90 hover:bg-[#17263A] border border-[#293A50] hover:border-[#36C5F0]/60 rounded-xl p-2.5 shadow-lg backdrop-blur-md cursor-help transition-all"
          onMouseEnter={() =>
            setActiveTooltip({
              title: 'Atmosphere Revitalization (ECLSS)',
              category: 'Life Support & Atmosphere',
              current: `${Math.round(resources.oxygen)} / 100 O2 Reserve`,
              rate: '-6.0 O2 / day crew respiration',
              status:
                systems.lifeSupport.isFaulted
                  ? 'CRITICAL FAULT (No Generation)'
                  : systems.lifeSupport.condition < 50
                  ? 'Low O2 Generation'
                  : 'Atmosphere Pressurized',
              physicsExplanation:
                'Electrolysis units split recycled water into oxygen and hydrogen, while scrubbers remove exhaled carbon dioxide. Maintaining at least 20 O2 is mandatory for crew survival.',
              managementTip:
                'Assign Alex Morgan to perform preventative maintenance on Life Support. Consecutive zero oxygen for 2 days triggers an emergency abort.',
            })
          }
          onMouseLeave={() => setActiveTooltip(null)}
        >
          <div className="flex items-center justify-between text-[11px] font-bold text-[#A7B4C8]">
            <span className="flex items-center gap-1 text-[#F4F7FC]">
              <span>💨</span> Oxygen
            </span>
            <span className="font-mono text-[10px] text-[#A7B4C8]">~{oxygenDaysLeft}d</span>
          </div>

          <div className="flex items-baseline justify-between mt-1">
            <span className="text-lg font-black font-mono text-[#F4F7FC]">
              {Math.round(resources.oxygen)}%
            </span>
            <span
              className={`text-[10px] font-bold ${
                systems.lifeSupport.isFaulted
                  ? 'text-[#FF5B5B]'
                  : systems.lifeSupport.condition < 60
                  ? 'text-[#F5B942]'
                  : 'text-[#37D67A]'
              }`}
            >
              {systems.lifeSupport.condition}% Cond
            </span>
          </div>

          <div className="w-full h-1.5 bg-[#080E19] rounded-full overflow-hidden mt-1.5 border border-[#293A50]">
            <div
              className={`h-full rounded-full transition-all ${
                resources.oxygen < 20
                  ? 'bg-[#FF5B5B]'
                  : resources.oxygen < 50
                  ? 'bg-[#F5B942]'
                  : 'bg-[#37D67A]'
              }`}
              style={{ width: `${Math.max(0, Math.min(100, resources.oxygen))}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[9px] text-[#A7B4C8] mt-1 font-mono">
            <span>Crew: 4/4</span>
            <span className={resources.oxygen < 20 ? 'text-[#FF5B5B] font-bold' : ''}>
              {resources.oxygen < 20 ? 'Shortage!' : 'Stable'}
            </span>
          </div>
        </div>

        {/* 3. Water 💧 */}
        <div
          className="relative bg-[#17263A]/90 hover:bg-[#17263A] border border-[#293A50] hover:border-[#36C5F0]/60 rounded-xl p-2.5 shadow-lg backdrop-blur-md cursor-help transition-all"
          onMouseEnter={() =>
            setActiveTooltip({
              title: 'Water Recovery System (WRS)',
              category: 'Closed-Loop Hydrology',
              current: `${Math.round(resources.water)} / 100 Liters Buffer`,
              rate: `-${netWaterDaily.toFixed(1)} L / day net`,
              status:
                systems.recycler.isFaulted
                  ? 'Recycler Offline'
                  : `75% Recovery at ${systems.recycler.condition}% Cond`,
              physicsExplanation:
                'Because transporting water from Earth is extremely costly (~$10,000/kg), closed-loop vacuum distillation reclaims 75% of graywater and moisture.',
              managementTip:
                'Install the Graphene Nanofilter upgrade to boost reclamation to 85%, or dispatch the rover to the cold-trap crater to discover ice reserves.',
            })
          }
          onMouseLeave={() => setActiveTooltip(null)}
        >
          <div className="flex items-center justify-between text-[11px] font-bold text-[#A7B4C8]">
            <span className="flex items-center gap-1 text-[#F4F7FC]">
              <span>💧</span> Water
            </span>
            <span className="font-mono text-[10px] text-[#A7B4C8]">~{waterDaysLeft}d</span>
          </div>

          <div className="flex items-baseline justify-between mt-1">
            <span className="text-lg font-black font-mono text-[#F4F7FC]">
              {Math.round(resources.water)}%
            </span>
            <span className="text-[10px] font-mono text-[#A7B4C8]">
              {systems.recycler.condition}% Recycler
            </span>
          </div>

          <div className="w-full h-1.5 bg-[#080E19] rounded-full overflow-hidden mt-1.5 border border-[#293A50]">
            <div
              className={`h-full rounded-full transition-all ${
                resources.water < 15
                  ? 'bg-[#FF5B5B]'
                  : resources.water < 40
                  ? 'bg-[#F5B942]'
                  : 'bg-[#36C5F0]'
              }`}
              style={{ width: `${Math.max(0, Math.min(100, resources.water))}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[9px] text-[#A7B4C8] mt-1 font-mono">
            <span>Crops: {activeBeds.length} beds</span>
            <span className={resources.water < 15 ? 'text-[#FF5B5B] font-bold' : ''}>
              {resources.water < 15 ? 'Rationing' : 'Recycled'}
            </span>
          </div>
        </div>

        {/* 4. Food 🥗 */}
        <div
          className="relative bg-[#17263A]/90 hover:bg-[#17263A] border border-[#293A50] hover:border-[#36C5F0]/60 rounded-xl p-2.5 shadow-lg backdrop-blur-md cursor-help transition-all"
          onMouseEnter={() =>
            setActiveTooltip({
              title: 'Hydroponic Biomass Production',
              category: 'Controlled Agriculture (CEA)',
              current: `${Math.round(resources.food)} / 100 Rations`,
              rate: '-3.5 rations / day consumption',
              status: readyBeds.length > 0 ? `${readyBeds.length} Crop(s) Ready to Harvest!` : 'Crops Vegetating',
              physicsExplanation:
                'Hydroponics cultivates crops in nutrient-enriched water without soil. Fresh greens provide vital micronutrients and prevent crew fatigue and malnutrition.',
              managementTip:
                'Assign Dr. Sara Williams to harvest ready crops to trigger her Green Thumb perk (+10% food yield bonus).',
            })
          }
          onMouseLeave={() => setActiveTooltip(null)}
        >
          <div className="flex items-center justify-between text-[11px] font-bold text-[#A7B4C8]">
            <span className="flex items-center gap-1 text-[#F4F7FC]">
              <span>🥗</span> Food
            </span>
            <span className="font-mono text-[10px] text-[#A7B4C8]">~{foodDaysLeft}d</span>
          </div>

          <div className="flex items-baseline justify-between mt-1">
            <span className="text-lg font-black font-mono text-[#F4F7FC]">
              {Math.round(resources.food)}%
            </span>
            <span className="text-[10px] font-mono text-[#37D67A]">
              {readyBeds.length > 0 ? 'HARVEST READY' : `${activeBeds.length} growing`}
            </span>
          </div>

          <div className="w-full h-1.5 bg-[#080E19] rounded-full overflow-hidden mt-1.5 border border-[#293A50]">
            <div
              className={`h-full rounded-full transition-all ${
                resources.food < 15
                  ? 'bg-[#FF5B5B]'
                  : resources.food < 40
                  ? 'bg-[#F5B942]'
                  : 'bg-[#37D67A]'
              }`}
              style={{ width: `${Math.max(0, Math.min(100, resources.food))}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[9px] text-[#A7B4C8] mt-1 font-mono">
            <span>Beds: {greenhouseBeds.bed2.unlocked ? '2/2' : '1/2'}</span>
            <span className={resources.food < 15 ? 'text-[#FF5B5B] font-bold' : ''}>
              {resources.food < 15 ? 'Malnutrition' : 'Supplied'}
            </span>
          </div>
        </div>

        {/* 5. Crew Health ❤️ */}
        <div
          className="relative bg-[#17263A]/90 hover:bg-[#17263A] border border-[#293A50] hover:border-[#36C5F0]/60 rounded-xl p-2.5 shadow-lg backdrop-blur-md cursor-help transition-all"
          onMouseEnter={() =>
            setActiveTooltip({
              title: 'Expedition Medical Telemetry',
              category: 'Human Factors & Bio-Monitoring',
              current: `Avg ${avgHealth} HP • ${totalStamina}/${maxStamina}h Stamina`,
              rate: '+2 HP / night nominal (+1 Dr. Maya perk)',
              status:
                avgHealth < 40
                  ? 'Medical Emergency!'
                  : totalStamina < 10
                  ? 'Crew Exhaustion Warning'
                  : 'Vital Signs Nominal',
              physicsExplanation:
                'Astronauts experience muscular atrophy, bone density loss, and mental strain in lunar gravity. Daily rest and balanced nutrition are necessary for tissue repair.',
              managementTip:
                'Do not exceed 8 hours of work per astronaut daily. Working overtime flags skipped rest (-3 HP daily penalty).',
            })
          }
          onMouseLeave={() => setActiveTooltip(null)}
        >
          <div className="flex items-center justify-between text-[11px] font-bold text-[#A7B4C8]">
            <span className="flex items-center gap-1 text-[#F4F7FC]">
              <span>❤️</span> Crew HP
            </span>
            <span className="font-mono text-[10px] text-[#A7B4C8]">{totalStamina}h stam</span>
          </div>

          <div className="flex items-baseline justify-between mt-1">
            <span className="text-lg font-black font-mono text-[#F4F7FC]">
              {avgHealth} HP
            </span>
            <span
              className={`text-[10px] font-bold ${
                avgHealth < 40
                  ? 'text-[#FF5B5B]'
                  : avgHealth < 70
                  ? 'text-[#F5B942]'
                  : 'text-[#37D67A]'
              }`}
            >
              {avgHealth >= 70 ? 'Fit for Duty' : avgHealth >= 40 ? 'Fatigued' : 'Critical'}
            </span>
          </div>

          <div className="w-full h-1.5 bg-[#080E19] rounded-full overflow-hidden mt-1.5 border border-[#293A50]">
            <div
              className={`h-full rounded-full transition-all ${
                avgHealth < 30
                  ? 'bg-[#FF5B5B]'
                  : avgHealth < 60
                  ? 'bg-[#F5B942]'
                  : 'bg-[#37D67A]'
              }`}
              style={{ width: `${Math.max(0, Math.min(100, avgHealth))}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[9px] text-[#A7B4C8] mt-1 font-mono">
            <span>Flight Surgeon: Maya</span>
            <span>+3 HP/night</span>
          </div>
        </div>

        {/* 6. Radiation ☢️ */}
        <div
          className="relative bg-[#17263A]/90 hover:bg-[#17263A] border border-[#293A50] hover:border-[#36C5F0]/60 rounded-xl p-2.5 shadow-lg backdrop-blur-md cursor-help transition-all"
          onMouseEnter={() =>
            setActiveTooltip({
              title: 'Radiation Risk Telemetry (Simulated)',
              category: 'Space Weather Preparedness',
              current: `Max ${maxExposure} pts • Shield: ${resources.shieldProtection}%`,
              rate: '0.5 pts / day surface baseline',
              status:
                state.radiationAdvisory && !state.radiationAdvisory.resolved
                  ? `ADVISORY: ${state.radiationAdvisory.countdownTicks}h to impact!`
                  : maxExposure >= 60
                  ? 'RED HAZARD (Continuous HP Drain)'
                  : maxExposure >= 30
                  ? 'YELLOW HAZARD'
                  : 'Background Normal',
              physicsExplanation:
                'Galactic cosmic rays and solar particle events bombard the airless Moon. In Lunar Frontier, exposure is tracked as simulated educational risk points (never real biological doses).',
              managementTip:
                'Move crew inside the Radiation Shelter (0.15 position factor) before solar storms hit. Build sintered regolith layers for +10 protection each.',
            })
          }
          onMouseLeave={() => setActiveTooltip(null)}
        >
          <div className="flex items-center justify-between text-[11px] font-bold text-[#A7B4C8]">
            <span className="flex items-center gap-1 text-[#F4F7FC]">
              <span>☢️</span> Radiation
            </span>
            <span className="font-mono text-[10px] text-[#36C5F0]">{resources.shieldProtection}% Shld</span>
          </div>

          <div className="flex items-baseline justify-between mt-1">
            <span className="text-lg font-black font-mono text-[#F4F7FC]">
              {maxExposure} <span className="text-xs text-[#A7B4C8]">pts</span>
            </span>
            <span
              className={`text-[10px] font-bold ${
                maxExposure >= 60
                  ? 'text-[#FF5B5B]'
                  : maxExposure >= 30
                  ? 'text-[#F5B942]'
                  : 'text-[#37D67A]'
              }`}
            >
              {maxExposure >= 60 ? 'Red Level' : maxExposure >= 30 ? 'Yellow Level' : 'Green Level'}
            </span>
          </div>

          <div className="w-full h-1.5 bg-[#080E19] rounded-full overflow-hidden mt-1.5 border border-[#293A50]">
            <div
              className={`h-full rounded-full transition-all ${
                maxExposure >= 60
                  ? 'bg-[#FF5B5B]'
                  : maxExposure >= 30
                  ? 'bg-[#F5B942]'
                  : 'bg-[#37D67A]'
              }`}
              style={{ width: `${Math.min(100, (maxExposure / 60) * 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[9px] text-[#A7B4C8] mt-1 font-mono">
            <span>Layers: {resources.shieldLayersBuilt}/3</span>
            <span>Shelter: 0.15×</span>
          </div>
        </div>

        {/* 7. Communication 📡 */}
        <div
          className="relative bg-[#17263A]/90 hover:bg-[#17263A] border border-[#293A50] hover:border-[#36C5F0]/60 rounded-xl p-2.5 shadow-lg backdrop-blur-md cursor-help transition-all"
          onMouseEnter={() =>
            setActiveTooltip({
              title: 'Deep Space Communications Subsystem',
              category: 'Earth Telemetry Link',
              current: `${systems.comms.condition}% Link Integrity`,
              rate: '1.3 sec speed-of-light one-way',
              status:
                systems.comms.condition < 25
                  ? 'High Signal Degradation'
                  : 'Earth Uplink Locked',
              physicsExplanation:
                'Radio waves travel at 300,000 km/s. At Moon distance (~384,000 km), delay is 1.3 seconds, enabling near-instantaneous tactical advice from NASA flight controllers.',
              managementTip:
                'Use "Consult Mission Control" at the Comms Station to receive scientific hints and telemetry bonus points.',
            })
          }
          onMouseLeave={() => setActiveTooltip(null)}
        >
          <div className="flex items-center justify-between text-[11px] font-bold text-[#A7B4C8]">
            <span className="flex items-center gap-1 text-[#F4F7FC]">
              <span>📡</span> Comms
            </span>
            <span className="font-mono text-[10px] text-[#37D67A]">1.3s delay</span>
          </div>

          <div className="flex items-baseline justify-between mt-1">
            <span className="text-lg font-black font-mono text-[#F4F7FC]">
              {systems.comms.condition}%
            </span>
            <span className="text-[10px] font-mono text-[#36C5F0]">
              {resources.spareParts} parts
            </span>
          </div>

          <div className="w-full h-1.5 bg-[#080E19] rounded-full overflow-hidden mt-1.5 border border-[#293A50]">
            <div
              className={`h-full rounded-full transition-all ${
                systems.comms.condition < 25
                  ? 'bg-[#FF5B5B]'
                  : systems.comms.condition < 50
                  ? 'bg-[#F5B942]'
                  : 'bg-[#36C5F0]'
              }`}
              style={{ width: `${systems.comms.condition}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[9px] text-[#A7B4C8] mt-1 font-mono">
            <span>Science: {resources.science} pts</span>
            <span>Link: Online</span>
          </div>
        </div>
      </div>

      {/* Floating Detailed Educational Tooltip */}
      {activeTooltip && (
        <div className="absolute top-full left-4 right-4 mt-2 p-3.5 bg-[#17263A] border border-[#36C5F0]/80 rounded-2xl shadow-2xl backdrop-blur-xl z-50 text-slate-200 animate-fadeIn max-w-2xl mx-auto">
          <div className="flex items-center justify-between border-b border-[#293A50] pb-2 mb-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#36C5F0] block">
                {activeTooltip.category}
              </span>
              <h4 className="text-sm font-black text-white">{activeTooltip.title}</h4>
            </div>
            <div className="text-right font-mono text-xs">
              <span className="text-[#F4F7FC] font-bold">{activeTooltip.current}</span>
              <div className="text-[10px] text-[#36C5F0]">{activeTooltip.rate}</div>
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-[#A7B4C8]">
            <p>
              <strong className="text-white">NASA Engineering Principle:</strong>{' '}
              {activeTooltip.physicsExplanation}
            </p>
            <p className="text-[11px] text-[#F5B942]">
              <strong className="text-white">Commander Tip:</strong> {activeTooltip.managementTip}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

