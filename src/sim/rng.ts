/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/sim/rng.ts
 * Deterministic seeded random number generator (mulberry32).
 * Rule 2: Never use Date.now or Math.random in src/sim.
 */

export class Mulberry32Rng {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
    if (this.state === 0) {
      this.state = 0x6d2b79f5;
    }
  }

  /**
   * Returns a float in [0, 1)
   */
  next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Returns an integer in [min, max] inclusive
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /**
   * Returns a float in [min, max)
   */
  nextFloat(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  /**
   * Picks a random element from an array
   */
  pick<T>(array: T[]): T {
    if (array.length === 0) {
      throw new Error('Cannot pick from empty array');
    }
    const index = Math.floor(this.next() * array.length);
    return array[index];
  }

  /**
   * Returns a shuffled copy of array
   */
  shuffle<T>(array: T[]): T[] {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  getSeed(): number {
    return this.state;
  }
}

