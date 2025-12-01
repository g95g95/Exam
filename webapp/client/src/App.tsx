import { useState, useEffect, useCallback, useMemo } from 'react';
import type { ElectionInfo, ElectionConfig, SimulationResult, Party, Coalition } from './types';
import { fetchElections, fetchElectionConfig, runSimulation } from './api';
import { ElectionSelector } from './components/ElectionSelector';
import { VoteSharesForm } from './components/VoteSharesForm';
import { SimulationControls } from './components/SimulationControls';
import { ResultsDisplay } from './components/ResultsDisplay';
import { DistributionChart } from './components/DistributionChart';
import { ComparisonChart } from './components/ComparisonChart';
import { JsonUploader } from './components/JsonUploader';
import { ElectionConfigEditor } from './components/ElectionConfigEditor';
import { PartyManager } from './components/PartyManager';
import { CoalitionManager } from './components/CoalitionManager';

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

  // Custom election state for Generic Election
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customName, setCustomName] = useState('Elezione Personalizzata');
  const [customSeats, setCustomSeats] = useState(400);
  const [customPropPercent, setCustomPropPercent] = useState(50);
  const [customMajPercent, setCustomMajPercent] = useState(50);
  const [customParties, setCustomParties] = useState<Party[]>([]);
  const [customCoalitions, setCustomCoalitions] = useState<Coalition[]>([]);
  const [useCoalitions, setUseCoalitions] = useState(false);

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

    // Check if Generic Election is selected
    const isGeneric = selectedElectionId === 'generic-election';
    setIsCustomMode(isGeneric);

    fetchElectionConfig(selectedElectionId)
      .then((config) => {
        setElectionConfig(config);

        if (isGeneric) {
          // Initialize custom state from the config
          setCustomName(config.election.name);
          setCustomSeats(config.election.seats);
          setCustomPropPercent(Math.round(config.election.proportionalCoefficient * 100));
          setCustomMajPercent(Math.round(config.election.majoritarianCoefficient * 100));
          setCustomParties(config.parties);
          setCustomCoalitions(config.coalitions);
          setUseCoalitions(config.coalitions.length > 0);
        }

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

  // Build effective config for custom mode
  const effectiveConfig = useMemo((): ElectionConfig | null => {
    if (!isCustomMode) return electionConfig;

    // In custom mode, build config from custom state
    if (customParties.length === 0) return null;

    // Determine entities for vote allocation (coalitions or parties)
    let effectiveCoalitions: Coalition[];

    if (useCoalitions && customCoalitions.length > 0) {
      // Use coalitions mode - only include coalitions that have parties assigned
      effectiveCoalitions = customCoalitions.filter(c => c.parties.length > 0);

      // Check for unassigned parties and create an "Others" coalition if needed
      const assignedPartyIds = new Set(effectiveCoalitions.flatMap(c => c.parties));
      const unassignedParties = customParties.filter(p => !assignedPartyIds.has(p.id));

      if (unassignedParties.length > 0) {
        effectiveCoalitions.push({
          id: 'others',
          name: 'Altri',
          shortName: 'Altri',
          color: '#9ca3af',
          parties: unassignedParties.map(p => p.id),
        });
      }
    } else {
      // Party-only mode - each party becomes its own "coalition"
      effectiveCoalitions = customParties.map(p => ({
        id: p.id,
        name: p.name,
        shortName: p.shortName,
        color: p.color,
        parties: [p.id],
      }));
    }

    if (effectiveCoalitions.length === 0) return null;

    return {
      election: {
        name: customName,
        seats: customSeats,
        proportionalCoefficient: customPropPercent / 100,
        majoritarianCoefficient: customMajPercent / 100,
      },
      coalitions: effectiveCoalitions,
      parties: customParties,
      defaultVoteShares: undefined,
      realResults: null,
    };
  }, [isCustomMode, electionConfig, customName, customSeats, customPropPercent, customMajPercent, customParties, customCoalitions, useCoalitions]);

  // Update vote shares when effective coalitions change in custom mode
  useEffect(() => {
    if (!isCustomMode || !effectiveConfig) return;

    const newShares: Record<string, number> = {};
    const equalShare = 1 / effectiveConfig.coalitions.length;

    effectiveConfig.coalitions.forEach((c) => {
      // Preserve existing share if available, otherwise use equal share
      newShares[c.id] = voteShares[c.id] ?? equalShare;
    });

    // Normalize if total doesn't equal 1
    const total = Object.values(newShares).reduce((a, b) => a + b, 0);
    if (Math.abs(total - 1) > 0.001) {
      Object.keys(newShares).forEach((key) => {
        newShares[key] = newShares[key] / total;
      });
    }

    // Only update if the keys have changed
    const currentKeys = Object.keys(voteShares).sort().join(',');
    const newKeys = Object.keys(newShares).sort().join(',');
    if (currentKeys !== newKeys) {
      setVoteShares(newShares);
    }
  }, [isCustomMode, effectiveConfig?.coalitions.length, effectiveConfig?.coalitions.map(c => c.id).join(',')]);

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
    const configToUse = isCustomMode ? effectiveConfig : electionConfig;
    if (!configToUse) return;

    setLoading(true);
    setError(null);

    try {
      const res = await runSimulation({
        electionId: selectedElectionId,
        voteShares,
        iterations,
        seed,
        customConfig: isCustomMode ? configToUse : undefined,
      });
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Simulation failed');
    } finally {
      setLoading(false);
    }
  }, [selectedElectionId, isCustomMode, effectiveConfig, electionConfig, voteShares, iterations, seed]);

  // Handle custom config upload
  const handleConfigUpload = useCallback((config: ElectionConfig) => {
    setElectionConfig(config);
    if (config.defaultVoteShares) {
      setVoteShares(config.defaultVoteShares);
    }
    setResult(null);
  }, []);

  const displayConfig = isCustomMode ? effectiveConfig : electionConfig;

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

            {/* Custom election editor - only show for Generic Election */}
            {isCustomMode && (
              <>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Impostazioni Elezione
                  </h2>
                  <ElectionConfigEditor
                    name={customName}
                    seats={customSeats}
                    proportionalPercent={customPropPercent}
                    majoritarianPercent={customMajPercent}
                    onNameChange={setCustomName}
                    onSeatsChange={setCustomSeats}
                    onProportionalChange={setCustomPropPercent}
                    onMajoritarianChange={setCustomMajPercent}
                  />
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Gestione Partiti
                  </h2>
                  <PartyManager
                    parties={customParties}
                    onPartiesChange={setCustomParties}
                  />
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Gestione Coalizioni
                  </h2>
                  <CoalitionManager
                    parties={customParties}
                    coalitions={customCoalitions}
                    useCoalitions={useCoalitions}
                    onCoalitionsChange={setCustomCoalitions}
                    onUseCoalitionsChange={setUseCoalitions}
                  />
                </div>
              </>
            )}

            {/* JSON uploader - only show when not in custom mode */}
            {!isCustomMode && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Carica Configurazione JSON
                </h2>
                <JsonUploader onUpload={handleConfigUpload} />
              </div>
            )}

            {/* Vote shares form */}
            {displayConfig && displayConfig.coalitions.length > 0 && (
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
                  coalitions={displayConfig.coalitions}
                  voteShares={voteShares}
                  onChange={handleVoteShareChange}
                />
              </div>
            )}

            {/* Warning if no parties/coalitions in custom mode */}
            {isCustomMode && customParties.length === 0 && (
              <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg">
                <p className="font-medium">Attenzione</p>
                <p className="text-sm">Aggiungi almeno un partito per eseguire la simulazione.</p>
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
                disabled={!displayConfig || (isCustomMode && customParties.length === 0)}
              />
            </div>
          </div>

          {/* Right column - Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Election info */}
            {displayConfig && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {displayConfig.election.name}
                </h2>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-500">Seggi Totali</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {displayConfig.election.seats}
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-blue-600">Proporzionale</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {Math.round(displayConfig.election.proportionalCoefficient * 100)}%
                    </p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-3">
                    <p className="text-amber-600">Maggioritario</p>
                    <p className="text-2xl font-bold text-amber-700">
                      {Math.round(displayConfig.election.majoritarianCoefficient * 100)}%
                    </p>
                  </div>
                </div>
                {/* Show parties/coalitions count */}
                <div className="mt-4 pt-4 border-t border-gray-200 flex gap-4 text-sm text-gray-600">
                  <span>
                    <span className="font-medium">{displayConfig.parties.length}</span> partiti
                  </span>
                  {(useCoalitions || !isCustomMode) && (
                    <span>
                      <span className="font-medium">{displayConfig.coalitions.length}</span> {isCustomMode && !useCoalitions ? 'entità' : 'coalizioni'}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Results display */}
            {result && (
              <>
                <ResultsDisplay
                  result={result}
                  totalSeats={displayConfig?.election.seats || 0}
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
                  {isCustomMode && customParties.length === 0
                    ? 'Aggiungi dei partiti e configura i parametri per eseguire una simulazione'
                    : 'Configura i parametri e clicca su "Avvia Simulazione" per vedere i risultati'}
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
