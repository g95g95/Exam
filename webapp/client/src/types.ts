/**
 * Shared types for the Electoral Monte Carlo Simulator
 */

export interface Party {
  id: string;
  name: string;
  shortName: string;
  color: string;
  territorialita?: boolean; // Flag per partiti piu forti in regioni specifiche
  coalitionId?: string; // ID della coalizione di appartenenza
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
  defaultVoteShares?: Record<string, number>; // Coalition vote shares
  defaultPartyVoteShares?: Record<string, number>; // Party vote shares
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
  voteShares: Record<string, number>; // Coalition vote shares (calcolate da party shares)
  partyVoteShares: Record<string, number>; // Party vote shares (input utente)
  partyTerritorialita: Record<string, boolean>; // Flag territorialita per partito
  iterations?: number;
  seed?: number;
  customConfig?: ElectionConfig;
}

// For custom election editing
export interface CustomElectionState {
  name: string;
  seats: number;
  proportionalPercent: number;
  majoritarianPercent: number;
  parties: Party[];
  coalitions: Coalition[];
  useCoalitions: boolean;
}
