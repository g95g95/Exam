interface Props {
  iterations: number;
  seed: number | undefined;
  onIterationsChange: (value: number) => void;
  onSeedChange: (value: number | undefined) => void;
  onSimulate: () => void;
  loading: boolean;
  disabled: boolean;
}

const ITERATION_PRESETS = [100, 500, 1000, 5000, 10000];

export function SimulationControls({
  iterations,
  seed,
  onIterationsChange,
  onSeedChange,
  onSimulate,
  loading,
  disabled,
}: Props) {
  return (
    <div className="space-y-4">
      {/* Iterations */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Numero di iterazioni
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {ITERATION_PRESETS.map((preset) => (
            <button
              key={preset}
              onClick={() => onIterationsChange(preset)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors
                ${
                  iterations === preset
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {preset.toLocaleString()}
            </button>
          ))}
        </div>
        <input
          type="number"
          min="10"
          max="100000"
          value={iterations}
          onChange={(e) => onIterationsChange(parseInt(e.target.value) || 1000)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg
                     focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                     font-mono"
        />
        <p className="mt-1 text-xs text-gray-500">
          Maggiori iterazioni = maggiore precisione, tempo di calcolo maggiore
        </p>
      </div>

      {/* Seed */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Seed (opzionale, per riproducibilità)
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            value={seed ?? ''}
            onChange={(e) => {
              const val = e.target.value;
              onSeedChange(val === '' ? undefined : parseInt(val));
            }}
            placeholder="Casuale"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg
                       focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                       font-mono"
          />
          <button
            onClick={() => onSeedChange(Math.floor(Math.random() * 1000000))}
            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg
                       hover:bg-gray-200 transition-colors text-sm font-medium"
            title="Genera seed casuale"
          >
            Genera
          </button>
          {seed !== undefined && (
            <button
              onClick={() => onSeedChange(undefined)}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg
                         hover:bg-gray-200 transition-colors text-sm"
              title="Rimuovi seed"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Simulate button */}
      <button
        onClick={onSimulate}
        disabled={loading || disabled}
        className={`w-full py-3 px-4 rounded-lg font-semibold text-white
                    transition-all duration-200 flex items-center justify-center gap-2
                    ${
                      loading || disabled
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-primary-600 hover:bg-primary-700 shadow-lg hover:shadow-xl'
                    }`}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Simulazione in corso...</span>
          </>
        ) : (
          <>
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Avvia Simulazione</span>
          </>
        )}
      </button>
    </div>
  );
}
