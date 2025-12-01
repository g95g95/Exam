/**
 * Monte Carlo Electoral Simulator
 *
 * This module implements a Monte Carlo simulation for mixed electoral systems
 * (proportional + majoritarian). It replicates the Python logic in TypeScript.
 *
 * Mathematical Framework:
 * - Proportional tier: Uses Hare (largest-remainder) method
 * - Majoritarian tier: Uses weighted multinomial sampling
 */

import type {
  ElectionData,
  SimulationResult,
  ElectionConfig,
  SimulationInput,
} from './types.js';

/**
 * Seeded pseudo-random number generator (Mulberry32)
 * Provides deterministic results when seeded
 */
class SeededRandom {
  private state: number;

  constructor(seed?: number) {
    this.state = seed ?? Date.now();
  }

  /**
   * Generate a random number between 0 and 1
   */
  random(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
}

/**
 * Validate election data
 */
function validateElectionData(data: ElectionData): void {
  if (!data.parties || data.parties.length === 0) {
    throw new Error('At least one party must be provided');
  }

  if (data.parties.length !== data.proportionalShares.length) {
    throw new Error('Each party must have a corresponding share value');
  }

  const uniqueParties = new Set(data.parties);
  if (uniqueParties.size !== data.parties.length) {
    throw new Error('Each party must have a unique name');
  }

  if (data.proportionalShares.some((share) => share < 0)) {
    throw new Error('Vote shares cannot contain negative values');
  }

  if (data.proportionalCoefficient < 0 || data.proportionalCoefficient > 1) {
    throw new Error('The proportional coefficient must lie in [0, 1]');
  }

  if (data.majoritarianCoefficient < 0 || data.majoritarianCoefficient > 1) {
    throw new Error('The majoritarian coefficient must lie in [0, 1]');
  }

  if (data.proportionalCoefficient + data.majoritarianCoefficient > 1) {
    throw new Error(
      'The sum of proportional and majoritarian coefficients cannot exceed one'
    );
  }

  if (data.seats <= 0) {
    throw new Error('The total number of seats must be strictly positive');
  }

  const totalShares = data.proportionalShares.reduce((a, b) => a + b, 0);
  if (totalShares > 1 + 1e-9) {
    throw new Error(
      'The sum of proportional results exceeds one; the inputs are not normalised'
    );
  }
}

/**
 * Allocate proportional seats using the Hare (largest-remainder) method
 *
 * @param shares - Vote shares for each party
 * @param totalSeats - Total proportional seats to allocate
 * @returns Array of seat counts for each party
 */
function allocateProportionalSeats(
  shares: number[],
  totalSeats: number
): number[] {
  // Calculate raw quotas
  const rawQuotas = shares.map((share) => share * totalSeats);

  // Assign integer parts (floor)
  const base = rawQuotas.map((q) => Math.floor(q));
  const assigned = base.reduce((a, b) => a + b, 0);
  let remainder = totalSeats - assigned;

  // Distribute remaining seats by largest fractional parts
  if (remainder > 0) {
    const fractional = rawQuotas.map((q, i) => ({
      index: i,
      fraction: q - base[i],
      share: shares[i],
    }));

    // Sort by: highest fraction, then highest share, then lowest index
    fractional.sort((a, b) => {
      if (Math.abs(b.fraction - a.fraction) > 1e-10) {
        return b.fraction - a.fraction;
      }
      if (Math.abs(b.share - a.share) > 1e-10) {
        return b.share - a.share;
      }
      return a.index - b.index;
    });

    // Assign remaining seats
    for (let i = 0; i < remainder && i < fractional.length; i++) {
      base[fractional[i].index]++;
    }
  }

  return base;
}

/**
 * Weighted random choice from an array of weights
 *
 * @param rng - Random number generator
 * @param weights - Array of weights
 * @returns Index of the selected element
 */
function weightedChoice(rng: SeededRandom, weights: number[]): number {
  const total = weights.reduce((a, b) => a + b, 0);
  if (total <= 0) {
    throw new Error('Weights must sum to a positive value');
  }

  const threshold = rng.random() * total;
  let cumulative = 0;

  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i];
    if (threshold <= cumulative) {
      return i;
    }
  }

  return weights.length - 1;
}

/**
 * Allocate majoritarian seats using multinomial sampling
 *
 * @param rng - Random number generator
 * @param shares - Vote shares for each party
 * @param totalSeats - Total majoritarian seats to allocate
 * @returns Array of seat counts for each party
 */
function allocateMajoritarianSeats(
  rng: SeededRandom,
  shares: number[],
  totalSeats: number
): number[] {
  if (totalSeats <= 0) {
    return shares.map(() => 0);
  }

  const result = shares.map(() => 0);

  for (let i = 0; i < totalSeats; i++) {
    const winner = weightedChoice(rng, shares);
    result[winner]++;
  }

  return result;
}

/**
 * Run a single Monte Carlo simulation draw
 *
 * @param rng - Random number generator
 * @param data - Election data
 * @returns Array of seat counts for each party
 */
function simulateSingleDraw(rng: SeededRandom, data: ElectionData): number[] {
  const proportionalTotal = Math.round(
    data.seats * data.proportionalCoefficient
  );
  const majoritarianTotal = Math.round(
    data.seats * data.majoritarianCoefficient
  );

  const proportionalSeats = allocateProportionalSeats(
    data.proportionalShares,
    proportionalTotal
  );

  const majoritarianSeats = allocateMajoritarianSeats(
    rng,
    data.proportionalShares,
    majoritarianTotal
  );

  // Combine both allocations
  return proportionalSeats.map((p, i) => p + majoritarianSeats[i]);
}

/**
 * Calculate statistics for an array of numbers
 */
function calculateStatistics(values: number[]): {
  mean: number;
  stdDev: number;
  min: number;
  max: number;
  median: number;
} {
  const n = values.length;
  if (n === 0) {
    return { mean: 0, stdDev: 0, min: 0, max: 0, median: 0 };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const mean = values.reduce((a, b) => a + b, 0) / n;
  const variance =
    values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);
  const min = sorted[0];
  const max = sorted[n - 1];
  const median =
    n % 2 === 0
      ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
      : sorted[Math.floor(n / 2)];

  return { mean, stdDev, min, max, median };
}

/**
 * Main Monte Carlo Electoral Simulator class
 */
export class MonteCarloElectoral {
  private data: ElectionData;
  private rng: SeededRandom;
  private allResults: Map<string, number[]>;

  constructor(seed?: number) {
    this.data = {
      name: '',
      parties: [],
      proportionalShares: [],
      proportionalCoefficient: 0.61,
      majoritarianCoefficient: 0.37,
      seats: 630,
    };
    this.rng = new SeededRandom(seed);
    this.allResults = new Map();
  }

  /**
   * Load election data from configuration
   */
  loadFromConfig(input: SimulationInput): void {
    const { config, voteShares } = input;
    const coalitionIds = config.coalitions.map((c) => c.id);
    const shares = coalitionIds.map((id) => voteShares[id] ?? 0);

    this.data = {
      name: config.election.name,
      parties: coalitionIds,
      proportionalShares: shares,
      proportionalCoefficient: config.election.proportionalCoefficient,
      majoritarianCoefficient: config.election.majoritarianCoefficient,
      seats: config.election.seats,
    };

    validateElectionData(this.data);
  }

  /**
   * Load election data directly
   */
  loadData(data: ElectionData): void {
    this.data = { ...data };
    validateElectionData(this.data);
  }

  /**
   * Run a single simulation draw
   */
  fillSeats(seed?: number): Record<string, number> {
    const rng = seed !== undefined ? new SeededRandom(seed) : this.rng;
    const seats = simulateSingleDraw(rng, this.data);

    return Object.fromEntries(
      this.data.parties.map((party, i) => [party, seats[i]])
    );
  }

  /**
   * Run a complete Monte Carlo simulation
   *
   * @param iterations - Number of iterations (default: 1000)
   * @param seed - Optional random seed for reproducibility
   * @returns Simulation results
   */
  completeSimulation(iterations = 1000, seed?: number): SimulationResult {
    if (iterations <= 0) {
      throw new Error('The number of iterations must be strictly positive');
    }

    const rng = seed !== undefined ? new SeededRandom(seed) : this.rng;
    const partyCount = this.data.parties.length;
    const totals = new Array(partyCount).fill(0);
    const history: number[][] = Array.from({ length: partyCount }, () => []);

    // Run iterations
    for (let i = 0; i < iterations; i++) {
      const draw = simulateSingleDraw(rng, this.data);
      for (let j = 0; j < partyCount; j++) {
        totals[j] += draw[j];
        history[j].push(draw[j]);
      }
    }

    // Store results
    this.allResults.clear();
    this.data.parties.forEach((party, i) => {
      this.allResults.set(party, history[i]);
    });

    // Calculate expected seats (rounded average)
    const expectedSeats: Record<string, number> = {};
    this.data.parties.forEach((party, i) => {
      expectedSeats[party] = Math.round(totals[i] / iterations);
    });

    // Calculate statistics
    const statistics: SimulationResult['statistics'] = {};
    this.data.parties.forEach((party, i) => {
      statistics[party] = calculateStatistics(history[i]);
    });

    // Convert allResults to plain object
    const allResultsObj: Record<string, number[]> = {};
    this.allResults.forEach((values, key) => {
      allResultsObj[key] = values;
    });

    return {
      electionName: this.data.name,
      iterations,
      expectedSeats,
      allResults: allResultsObj,
      statistics,
    };
  }

  /**
   * Get the current election data
   */
  getData(): ElectionData {
    return { ...this.data };
  }

  /**
   * Get all results from the last simulation
   */
  getAllResults(): Record<string, number[]> {
    const result: Record<string, number[]> = {};
    this.allResults.forEach((values, key) => {
      result[key] = [...values];
    });
    return result;
  }
}

export default MonteCarloElectoral;
