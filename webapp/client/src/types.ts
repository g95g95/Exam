/**
 * Shared types for the Electoral Monte Carlo Simulator
 */

export interface Party {
  id: string;
  name: string;
  shortName: string;
  color: string;
}

export interface Coalition {
  id: string;
  name: string;
  shortName: string;
  color: string;
  parties: string[];
}

export interface ElectionInfo {
  id: string;
  name: string;
  seats: number;
  coalitionCount: number;
}

export interface ElectionConfig {
  election: {
    name: string;
    seats: number;
    proportionalCoefficient: number;
    majoritarianCoefficient: number;
    description?: string;
  };
  coalitions: Coalition[];
  parties: Party[];
  defaultVoteShares?: Record<string, number>;
  realResults?: Record<string, number> | null;
}

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
  realResults?: Record<string, number> | null;
  coalitions: Coalition[];
}

export interface SimulationRequest {
  electionId: string;
  voteShares: Record<string, number>;
  iterations?: number;
  seed?: number;
}
