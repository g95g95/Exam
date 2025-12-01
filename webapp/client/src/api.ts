/**
 * API client for the Electoral Monte Carlo Simulator
 */

import type { ElectionInfo, ElectionConfig, SimulationResult, SimulationRequest } from './types';

const API_BASE = '/api';

/**
 * Fetch all available elections
 */
export async function fetchElections(): Promise<ElectionInfo[]> {
  const response = await fetch(`${API_BASE}/elections`);
  if (!response.ok) {
    throw new Error('Failed to fetch elections');
  }
  return response.json();
}

/**
 * Fetch a specific election configuration
 */
export async function fetchElectionConfig(id: string): Promise<ElectionConfig> {
  const response = await fetch(`${API_BASE}/elections/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch election config');
  }
  return response.json();
}

/**
 * Run a Monte Carlo simulation
 */
export async function runSimulation(request: SimulationRequest): Promise<SimulationResult> {
  const response = await fetch(`${API_BASE}/simulate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Simulation failed');
  }

  return response.json();
}

/**
 * Run a single simulation draw
 */
export async function runSingleDraw(
  electionId: string,
  voteShares: Record<string, number>,
  seed?: number
): Promise<{ seats: Record<string, number> }> {
  const response = await fetch(`${API_BASE}/simulate/single`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ electionId, voteShares, seed }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Single draw failed');
  }

  return response.json();
}

/**
 * Validate a custom election configuration
 */
export async function validateConfig(config: ElectionConfig): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE}/elections/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(config),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Validation failed');
  }

  return response.json();
}
