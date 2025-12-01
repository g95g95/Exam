import { useState, useCallback } from 'react';
import type { ElectionConfig } from '../types';

interface Props {
  onUpload: (config: ElectionConfig) => void;
}

export function JsonUploader({ onUpload }: Props) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const validateConfig = (config: unknown): config is ElectionConfig => {
    if (!config || typeof config !== 'object') return false;
    const c = config as Record<string, unknown>;

    if (!c.election || typeof c.election !== 'object') return false;
    if (!c.coalitions || !Array.isArray(c.coalitions)) return false;
    if (!c.parties || !Array.isArray(c.parties)) return false;

    const election = c.election as Record<string, unknown>;
    if (typeof election.name !== 'string') return false;
    if (typeof election.seats !== 'number') return false;
    if (typeof election.proportionalCoefficient !== 'number') return false;
    if (typeof election.majoritarianCoefficient !== 'number') return false;

    return true;
  };

  const handleFile = useCallback(
    (file: File) => {
      setError(null);
      setFileName(file.name);

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsed = JSON.parse(content);

          if (!validateConfig(parsed)) {
            throw new Error('Struttura JSON non valida. Verifica che contenga election, coalitions e parties.');
          }

          onUpload(parsed);
          setError(null);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Errore nel parsing del JSON');
          setFileName(null);
        }
      };
      reader.readAsText(file);
    },
    [onUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);

      const file = e.dataTransfer.files[0];
      if (file && file.type === 'application/json') {
        handleFile(file);
      } else {
        setError('Per favore carica un file JSON');
      }
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-6 text-center
                    transition-colors cursor-pointer
                    ${
                      dragActive
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
      >
        <input
          type="file"
          accept=".json,application/json"
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="space-y-2">
          <svg
            className={`mx-auto h-10 w-10 ${
              dragActive ? 'text-primary-500' : 'text-gray-400'
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="text-sm text-gray-600">
            <span className="font-medium text-primary-600">Clicca per caricare</span>
            {' '}o trascina un file JSON
          </p>
          <p className="text-xs text-gray-500">
            File JSON con configurazione elezione
          </p>
        </div>
      </div>

      {fileName && !error && (
        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span>Caricato: {fileName}</span>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
          <svg
            className="h-4 w-4 mt-0.5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Example JSON structure hint */}
      <details className="text-xs text-gray-500">
        <summary className="cursor-pointer hover:text-gray-700">
          Esempio struttura JSON
        </summary>
        <pre className="mt-2 p-3 bg-gray-100 rounded-lg overflow-x-auto text-left">
{`{
  "election": {
    "name": "Nome Elezione",
    "seats": 400,
    "proportionalCoefficient": 0.5,
    "majoritarianCoefficient": 0.5
  },
  "coalitions": [
    {
      "id": "coal-a",
      "name": "Coalizione A",
      "shortName": "A",
      "color": "#3b82f6",
      "parties": ["party-1"]
    }
  ],
  "parties": [
    {
      "id": "party-1",
      "name": "Partito 1",
      "shortName": "P1",
      "color": "#3b82f6"
    }
  ],
  "defaultVoteShares": {
    "coal-a": 0.5
  }
}`}
        </pre>
      </details>
    </div>
  );
}
