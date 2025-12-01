/**
 * Electoral Monte Carlo Simulator - Express Server
 */

import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdir, readFile } from 'fs/promises';
import { MonteCarloElectoral } from './simulation/MonteCarloElectoral.js';
import type { ElectionConfig, SimulationInput } from './simulation/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Data directory
const DATA_DIR = join(__dirname, 'data', 'elections');

/**
 * GET /api/elections
 * List all available election configurations
 */
app.get('/api/elections', async (req, res) => {
  try {
    const files = await readdir(DATA_DIR);
    const elections = await Promise.all(
      files
        .filter((f) => f.endsWith('.json'))
        .map(async (file) => {
          const content = await readFile(join(DATA_DIR, file), 'utf-8');
          const config = JSON.parse(content) as ElectionConfig & {
            defaultVoteShares?: Record<string, number>;
            realResults?: Record<string, number> | null;
          };
          return {
            id: file.replace('.json', ''),
            name: config.election.name,
            seats: config.election.seats,
            coalitionCount: config.coalitions.length,
          };
        })
    );
    res.json(elections);
  } catch (error) {
    console.error('Error listing elections:', error);
    res.status(500).json({ error: 'Failed to list elections' });
  }
});

/**
 * GET /api/elections/:id
 * Get a specific election configuration
 */
app.get('/api/elections/:id', async (req, res) => {
  try {
    const filePath = join(DATA_DIR, `${req.params.id}.json`);
    const content = await readFile(filePath, 'utf-8');
    const config = JSON.parse(content);
    res.json(config);
  } catch (error) {
    console.error('Error reading election:', error);
    res.status(404).json({ error: 'Election not found' });
  }
});

/**
 * POST /api/simulate
 * Run a Monte Carlo simulation
 */
app.post('/api/simulate', async (req, res) => {
  try {
    const {
      electionId,
      voteShares,
      iterations = 1000,
      seed,
    } = req.body as {
      electionId: string;
      voteShares: Record<string, number>;
      iterations?: number;
      seed?: number;
    };

    // Validate inputs
    if (!electionId) {
      return res.status(400).json({ error: 'electionId is required' });
    }

    if (!voteShares || Object.keys(voteShares).length === 0) {
      return res.status(400).json({ error: 'voteShares is required' });
    }

    // Load election config
    const filePath = join(DATA_DIR, `${electionId}.json`);
    const content = await readFile(filePath, 'utf-8');
    const config = JSON.parse(content) as ElectionConfig;

    // Create simulator and load data
    const simulator = new MonteCarloElectoral(seed);
    const input: SimulationInput = {
      config,
      voteShares,
    };

    simulator.loadFromConfig(input);

    // Run simulation
    const result = simulator.completeSimulation(iterations, seed);

    // Add real results for comparison if available
    const configWithResults = JSON.parse(content) as ElectionConfig & {
      realResults?: Record<string, number> | null;
    };
    const response = {
      ...result,
      realResults: configWithResults.realResults || null,
      coalitions: config.coalitions,
    };

    res.json(response);
  } catch (error) {
    console.error('Simulation error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Simulation failed',
    });
  }
});

/**
 * POST /api/simulate/single
 * Run a single simulation draw
 */
app.post('/api/simulate/single', async (req, res) => {
  try {
    const {
      electionId,
      voteShares,
      seed,
    } = req.body as {
      electionId: string;
      voteShares: Record<string, number>;
      seed?: number;
    };

    if (!electionId || !voteShares) {
      return res.status(400).json({ error: 'electionId and voteShares are required' });
    }

    const filePath = join(DATA_DIR, `${electionId}.json`);
    const content = await readFile(filePath, 'utf-8');
    const config = JSON.parse(content) as ElectionConfig;

    const simulator = new MonteCarloElectoral(seed);
    simulator.loadFromConfig({ config, voteShares });

    const seats = simulator.fillSeats(seed);
    res.json({ seats, coalitions: config.coalitions });
  } catch (error) {
    console.error('Single simulation error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Simulation failed',
    });
  }
});

/**
 * POST /api/elections/upload
 * Upload a custom election configuration
 */
app.post('/api/elections/upload', async (req, res) => {
  try {
    const config = req.body as ElectionConfig;

    // Validate structure
    if (!config.election || !config.coalitions || !config.parties) {
      return res.status(400).json({
        error: 'Invalid configuration: must include election, coalitions, and parties',
      });
    }

    // Return validated config (in-memory only for now)
    res.json({
      success: true,
      config,
      message: 'Configuration validated successfully',
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(400).json({ error: 'Invalid configuration format' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Electoral Simulator API running on http://localhost:${PORT}`);
});
