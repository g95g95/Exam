/**
 * Types for the Monte Carlo Electoral Simulator
 */

/**
 * Represents a political party or coalition
 */
export interface Party {
  id: string;
  name: string;
  shortName: string;
  color: string;
}

/**
 * Election configuration data
 */
export interface ElectionData {
  name: string;
  parties: string[];
  proportionalShares: number[];
  proportionalCoefficient: number;
  majoritarianCoefficient: number;
  seats: number;
}

/**
 * Coalition/Schieramento definition
 */
export interface Coalition {
  id: string;
  name: string;
  shortName: string;
  color: string;
  parties: string[];
}

/**
 * Complete election configuration loaded from JSON
 */
export interface ElectionConfig {
  election: {
    name: string;
    seats: number;
    proportionalCoefficient: number;
    majoritarianCoefficient: number;
  };
  coalitions: Coalition[];
  parties: Party[];
}

/**
 * Simulation input with vote shares
 */
export interface SimulationInput {
  config: ElectionConfig;
  voteShares: Record<string, number>; // coalitionId -> share (0-1)
}

/**
 * Single simulation draw result
 */
export interface SimulationDraw {
  seats: Record<string, number>; // coalitionId -> seats
}

/**
 * Complete simulation result
 */
export interface SimulationResult {
  electionName: string;
  iterations: number;
  expectedSeats: Record<string, number>;
  allResults: Record<string, number[]>;
  statistics: Record<string, {
    mean: number;
    stdDev: number;
    min: number;
    max: number;
    median: number;
  }>;
}

/**
 * Real election results for comparison
 */
export interface RealResults {
  electionName: string;
  seats: Record<string, number>;
}
