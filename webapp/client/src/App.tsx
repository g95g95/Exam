import { useState, useEffect, useCallback } from 'react';
import type { ElectionInfo, ElectionConfig, SimulationResult } from './types';
import { fetchElections, fetchElectionConfig, runSimulation } from './api';
import { ElectionSelector } from './components/ElectionSelector';
import { VoteSharesForm } from './components/VoteSharesForm';
import { SimulationControls } from './components/SimulationControls';
import { ResultsDisplay } from './components/ResultsDisplay';
import { DistributionChart } from './components/DistributionChart';
import { ComparisonChart } from './components/ComparisonChart';
import { JsonUploader } from './components/JsonUploader';

function App() {
  // State
  const [elections, setElections] = useState<ElectionInfo[]>([]);
  const [selectedElectionId, setSelectedElectionId] = useState<string>('');
  const [electionConfig, setElectionConfig] = useState<ElectionConfig | null>(null);
  const [voteShares, setVoteShares] = useState<Record<string, number>>({});
  const [iterations, setIterations] = useState(1000);
  const [seed, setSeed] = useState<number | undefined>(undefined);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load elections on mount
  useEffect(() => {
    fetchElections()
      .then((data) => {
        setElections(data);
        if (data.length > 0) {
          setSelectedElectionId(data[0].id);
        }
      })
      .catch((err) => setError(err.message));
  }, []);

  // Load election config when selection changes
  useEffect(() => {
    if (!selectedElectionId) return;

    fetchElectionConfig(selectedElectionId)
      .then((config) => {
        setElectionConfig(config);
        // Initialize vote shares from defaults
        if (config.defaultVoteShares) {
          setVoteShares(config.defaultVoteShares);
        } else {
          // Create equal shares
          const equalShare = 1 / config.coalitions.length;
          const shares: Record<string, number> = {};
          config.coalitions.forEach((c) => {
            shares[c.id] = equalShare;
          });
          setVoteShares(shares);
        }
        setResult(null);
      })
      .catch((err) => setError(err.message));
  }, [selectedElectionId]);

  // Handle vote share changes
  const handleVoteShareChange = useCallback((id: string, value: number) => {
    setVoteShares((prev) => ({
      ...prev,
      [id]: value,
    }));
  }, []);

  // Normalize vote shares to sum to 1
  const normalizeShares = useCallback(() => {
    const total = Object.values(voteShares).reduce((a, b) => a + b, 0);
    if (total > 0) {
      const normalized: Record<string, number> = {};
      Object.entries(voteShares).forEach(([id, value]) => {
        normalized[id] = value / total;
      });
      setVoteShares(normalized);
    }
  }, [voteShares]);

  // Run simulation
  const handleSimulate = useCallback(async () => {
    if (!selectedElectionId || !electionConfig) return;

    setLoading(true);
    setError(null);

    try {
      const res = await runSimulation({
        electionId: selectedElectionId,
        voteShares,
        iterations,
        seed,
      });
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Simulation failed');
    } finally {
      setLoading(false);
    }
  }, [selectedElectionId, electionConfig, voteShares, iterations, seed]);

  // Handle custom config upload
  const handleConfigUpload = useCallback((config: ElectionConfig) => {
    setElectionConfig(config);
    if (config.defaultVoteShares) {
      setVoteShares(config.defaultVoteShares);
    }
    setResult(null);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Electoral Monte Carlo Simulator
          </h1>
          <p className="mt-2 text-gray-600">
            Simula l'allocazione dei seggi parlamentari con sistema misto proporzionale-maggioritario
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Error display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-medium">Errore</p>
            <p>{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-sm underline hover:no-underline"
            >
              Chiudi
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Configuration */}
          <div className="lg:col-span-1 space-y-6">
            {/* Election selector */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Configurazione Elezione
              </h2>
              <ElectionSelector
                elections={elections}
                selectedId={selectedElectionId}
                onSelect={setSelectedElectionId}
              />
            </div>

            {/* JSON uploader */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Carica Configurazione JSON
              </h2>
              <JsonUploader onUpload={handleConfigUpload} />
            </div>

            {/* Vote shares form */}
            {electionConfig && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Quote di Voto (%)
                  </h2>
                  <button
                    onClick={normalizeShares}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Normalizza
                  </button>
                </div>
                <VoteSharesForm
                  coalitions={electionConfig.coalitions}
                  voteShares={voteShares}
                  onChange={handleVoteShareChange}
                />
              </div>
            )}

            {/* Simulation controls */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Parametri Simulazione
              </h2>
              <SimulationControls
                iterations={iterations}
                seed={seed}
                onIterationsChange={setIterations}
                onSeedChange={setSeed}
                onSimulate={handleSimulate}
                loading={loading}
                disabled={!electionConfig}
              />
            </div>
          </div>

          {/* Right column - Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Election info */}
            {electionConfig && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {electionConfig.election.name}
                </h2>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-500">Seggi Totali</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {electionConfig.election.seats}
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-blue-600">Proporzionale</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {Math.round(electionConfig.election.proportionalCoefficient * 100)}%
                    </p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-3">
                    <p className="text-amber-600">Maggioritario</p>
                    <p className="text-2xl font-bold text-amber-700">
                      {Math.round(electionConfig.election.majoritarianCoefficient * 100)}%
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Results display */}
            {result && (
              <>
                <ResultsDisplay
                  result={result}
                  totalSeats={electionConfig?.election.seats || 0}
                />

                {/* Charts */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Distribuzione dei Seggi
                  </h2>
                  <DistributionChart result={result} />
                </div>

                {result.realResults && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      Confronto con Risultati Reali
                    </h2>
                    <ComparisonChart result={result} />
                  </div>
                )}
              </>
            )}

            {/* Empty state */}
            {!result && !loading && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <svg
                    className="mx-auto h-16 w-16"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nessuna simulazione eseguita
                </h3>
                <p className="text-gray-500">
                  Configura i parametri e clicca su "Avvia Simulazione" per vedere i risultati
                </p>
              </div>
            )}

            {/* Loading state */}
            {loading && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="animate-spin mx-auto h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Simulazione in corso...
                </h3>
                <p className="text-gray-500">
                  Esecuzione di {iterations.toLocaleString()} iterazioni Monte Carlo
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            Electoral Monte Carlo Simulator - Sistema misto proporzionale/maggioritario
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
