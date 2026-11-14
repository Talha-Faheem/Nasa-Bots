import { describe, it, expect } from 'vitest';
import { createInitialState } from '../src/sim/engine.ts';
import { calculateScore } from '../src/sim/scoring.ts';

describe('Scoring Rules and Safety Gate', () => {
  it('awards full 1000 points and Gold Commander for flawless mission', () => {
    const state = createInitialState(777, 'commander');
    state.mission.day = 30;
    state.mission.totalTicks = 720;

    // Full health, no red exposure
    for (const c of Object.values(state.crew)) {
      c.health = 100;
      c.exposure = 5;
    }

    state.stats.daysOxygenNotRed = 30;
    state.stats.emergenciesCount = 0;
    state.stats.daysBatteryAbove20 = 30;
    state.stats.protectionBeforeAdvisory = 80;
    state.resources.water = 50; // >= 40 for full marks
    state.resources.food = 50; // >= 40 for full marks
    state.resources.science = 100; // max 100

    const score = calculateScore(state);

    expect(score.crewSafety).toBe(300);
    expect(score.lifeSupport).toBe(200);
    expect(score.power).toBe(150);
    expect(score.radiationPreparedness).toBe(150);
    expect(score.foodAndWater).toBe(100);
    expect(score.science).toBe(100);
    expect(score.total).toBe(1000);
    expect(score.safetyGateTriggered).toBe(false);
    expect(score.band).toBe('Gold Commander');
  });

  it('triggers the Safety Gate when an astronaut has red exposure (>=60), nullifying science and capping band at Bronze', () => {
    const state = createInitialState(778, 'commander');
    state.mission.day = 30;
    state.mission.totalTicks = 720;

    // Astronaut Alex suffered red exposure
    state.crew.alex.exposure = 65;
    for (const c of Object.values(state.crew)) {
      c.health = 90;
    }

    state.stats.daysOxygenNotRed = 30;
    state.stats.daysBatteryAbove20 = 30;
    state.resources.science = 100; // Player earned 100 science
    state.resources.water = 45;
    state.resources.food = 45;

    const score = calculateScore(state);

    expect(score.safetyGateTriggered).toBe(true);
    expect(score.science).toBe(0); // Science nullified to 0 by Safety Gate!
    expect(score.band).not.toBe('Gold Commander');
    expect(score.band).not.toBe('Silver');
    expect(['Bronze', 'Trainee']).toContain(score.band);
  });

  it('triggers the Safety Gate when Crew Safety falls below 150', () => {
    const state = createInitialState(779, 'commander');
    state.mission.day = 30;
    state.mission.totalTicks = 720;

    // Severely injured crew (avg health 40 -> 300 * 0.4 = 120 < 150)
    for (const c of Object.values(state.crew)) {
      c.health = 40;
    }

    state.resources.science = 80;
    const score = calculateScore(state);

    expect(score.crewSafety).toBeLessThan(150);
    expect(score.safetyGateTriggered).toBe(true);
    expect(score.science).toBe(0);
    expect(['Bronze', 'Trainee']).toContain(score.band);
  });

  it('correctly maps scores to Silver and Trainee bands', () => {
    const state = createInitialState(780, 'commander');
    state.mission.day = 30;
    state.mission.totalTicks = 720;

    // Set metrics for ~800 points (Silver)
    for (const c of Object.values(state.crew)) {
      c.health = 90;
      c.exposure = 10;
    }
    state.stats.daysOxygenNotRed = 27;
    state.stats.daysBatteryAbove20 = 25;
    state.stats.protectionBeforeAdvisory = 60;
    state.resources.water = 35;
    state.resources.food = 35;
    state.resources.science = 60;

    const silverScore = calculateScore(state);
    expect(silverScore.total).toBeGreaterThanOrEqual(750);
    expect(silverScore.total).toBeLessThan(900);
    expect(silverScore.band).toBe('Silver');

    // Very poor run (< 550 points -> Trainee)
    for (const c of Object.values(state.crew)) {
      c.health = 30;
      c.exposure = 65;
    }
    state.stats.daysOxygenNotRed = 10;
    state.stats.daysBatteryAbove20 = 10;
    state.resources.water = 10;
    state.resources.food = 10;

    const traineeScore = calculateScore(state);
    expect(traineeScore.total).toBeLessThan(550);
    expect(traineeScore.band).toBe('Trainee');
  });
});

