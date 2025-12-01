import { useState } from 'react';
import type { Party } from '../types';

// Predefined colors for parties
const PARTY_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#22c55e', // green
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f97316', // orange
  '#6366f1', // indigo
  '#14b8a6', // teal
  '#a855f7', // purple
];

interface Props {
  parties: Party[];
  onPartiesChange: (parties: Party[]) => void;
}

export function PartyManager({ parties, onPartiesChange }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const generateId = () => `party-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const getNextColor = () => {
    const usedColors = new Set(parties.map(p => p.color));
    for (const color of PARTY_COLORS) {
      if (!usedColors.has(color)) return color;
    }
    return PARTY_COLORS[parties.length % PARTY_COLORS.length];
  };

  const addParty = () => {
    const newParty: Party = {
      id: generateId(),
      name: `Partito ${parties.length + 1}`,
      shortName: `P${parties.length + 1}`,
      color: getNextColor(),
    };
    onPartiesChange([...parties, newParty]);
    setEditingId(newParty.id);
  };

  const updateParty = (id: string, updates: Partial<Party>) => {
    onPartiesChange(
      parties.map(p => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const removeParty = (id: string) => {
    onPartiesChange(parties.filter(p => p.id !== id));
  };

  const generateShortName = (name: string): string => {
    const words = name.trim().split(/\s+/);
    if (words.length === 1) {
      return name.slice(0, 3).toUpperCase();
    }
    return words.map(w => w[0]).join('').toUpperCase().slice(0, 4);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-700">
          Partiti ({parties.length})
        </h3>
        <button
          onClick={addParty}
          className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Aggiungi Partito
        </button>
      </div>

      {parties.length === 0 ? (
        <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
          <p className="text-sm">Nessun partito creato</p>
          <button
            onClick={addParty}
            className="mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Crea il primo partito
          </button>
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {parties.map((party, index) => (
            <div
              key={party.id}
              className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg group"
            >
              {/* Color picker */}
              <input
                type="color"
                value={party.color}
                onChange={(e) => updateParty(party.id, { color: e.target.value })}
                className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                title="Cambia colore"
              />

              {/* Index */}
              <span className="text-xs text-gray-400 w-4">{index + 1}.</span>

              {/* Name input */}
              {editingId === party.id ? (
                <input
                  type="text"
                  value={party.name}
                  onChange={(e) => {
                    const newName = e.target.value;
                    updateParty(party.id, {
                      name: newName,
                      shortName: generateShortName(newName),
                    });
                  }}
                  onBlur={() => setEditingId(null)}
                  onKeyDown={(e) => e.key === 'Enter' && setEditingId(null)}
                  autoFocus
                  className="flex-1 px-2 py-1 text-sm border border-primary-300 rounded
                             focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              ) : (
                <button
                  onClick={() => setEditingId(party.id)}
                  className="flex-1 text-left text-sm text-gray-900 hover:text-primary-600 truncate"
                  title="Clicca per modificare"
                >
                  {party.name}
                </button>
              )}

              {/* Short name */}
              <span
                className="px-2 py-0.5 text-xs font-medium rounded text-white min-w-[40px] text-center"
                style={{ backgroundColor: party.color }}
              >
                {party.shortName}
              </span>

              {/* Delete button */}
              <button
                onClick={() => removeParty(party.id)}
                className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Rimuovi partito"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {parties.length > 0 && (
        <p className="text-xs text-gray-500 italic">
          Clicca sul nome per modificarlo. I colori possono essere cambiati con il selettore.
        </p>
      )}
    </div>
  );
}
