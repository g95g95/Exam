import { useState } from 'react';
import type { Party, Coalition } from '../types';

// Predefined colors for coalitions
const COALITION_COLORS = [
  '#1e40af', // dark blue
  '#b91c1c', // dark red
  '#15803d', // dark green
  '#b45309', // dark amber
  '#6d28d9', // dark violet
  '#9ca3af', // gray (for "others")
];

interface Props {
  parties: Party[];
  coalitions: Coalition[];
  useCoalitions: boolean;
  onCoalitionsChange: (coalitions: Coalition[]) => void;
  onUseCoalitionsChange: (use: boolean) => void;
}

export function CoalitionManager({
  parties,
  coalitions,
  useCoalitions,
  onCoalitionsChange,
  onUseCoalitionsChange,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draggedParty, setDraggedParty] = useState<string | null>(null);

  const generateId = () => `coalition-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const getNextColor = () => {
    const usedColors = new Set(coalitions.map(c => c.color));
    for (const color of COALITION_COLORS) {
      if (!usedColors.has(color)) return color;
    }
    return COALITION_COLORS[coalitions.length % COALITION_COLORS.length];
  };

  const addCoalition = () => {
    const newCoalition: Coalition = {
      id: generateId(),
      name: `Coalizione ${coalitions.length + 1}`,
      shortName: `C${coalitions.length + 1}`,
      color: getNextColor(),
      parties: [],
    };
    onCoalitionsChange([...coalitions, newCoalition]);
    setEditingId(newCoalition.id);
  };

  const updateCoalition = (id: string, updates: Partial<Coalition>) => {
    onCoalitionsChange(
      coalitions.map(c => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const removeCoalition = (id: string) => {
    onCoalitionsChange(coalitions.filter(c => c.id !== id));
  };

  const assignPartyToCoalition = (partyId: string, coalitionId: string | null) => {
    // Remove party from any existing coalition
    const updated = coalitions.map(c => ({
      ...c,
      parties: c.parties.filter(p => p !== partyId),
    }));

    // Add to new coalition if specified
    if (coalitionId) {
      const targetIndex = updated.findIndex(c => c.id === coalitionId);
      if (targetIndex >= 0) {
        updated[targetIndex] = {
          ...updated[targetIndex],
          parties: [...updated[targetIndex].parties, partyId],
        };
      }
    }

    onCoalitionsChange(updated);
  };

  const getPartyCoalition = (partyId: string): string | null => {
    for (const coalition of coalitions) {
      if (coalition.parties.includes(partyId)) {
        return coalition.id;
      }
    }
    return null;
  };

  const unassignedParties = parties.filter(p => !getPartyCoalition(p.id));

  const generateShortName = (name: string): string => {
    const words = name.trim().split(/\s+/);
    if (words.length === 1) {
      return name.slice(0, 3).toUpperCase();
    }
    return words.map(w => w[0]).join('').toUpperCase().slice(0, 4);
  };

  const handleDragStart = (partyId: string) => {
    setDraggedParty(partyId);
  };

  const handleDragEnd = () => {
    setDraggedParty(null);
  };

  const handleDrop = (coalitionId: string | null) => {
    if (draggedParty) {
      assignPartyToCoalition(draggedParty, coalitionId);
    }
    setDraggedParty(null);
  };

  return (
    <div className="space-y-4">
      {/* Toggle for using coalitions */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div>
          <p className="text-sm font-medium text-gray-900">Usa Coalizioni</p>
          <p className="text-xs text-gray-500">
            {useCoalitions
              ? 'I seggi saranno calcolati per coalizione'
              : 'I seggi saranno calcolati per singolo partito'}
          </p>
        </div>
        <button
          onClick={() => onUseCoalitionsChange(!useCoalitions)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                     ${useCoalitions ? 'bg-primary-600' : 'bg-gray-300'}`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                       ${useCoalitions ? 'translate-x-6' : 'translate-x-1'}`}
          />
        </button>
      </div>

      {useCoalitions && (
        <>
          {/* Add coalition button */}
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-700">
              Coalizioni ({coalitions.length})
            </h3>
            <button
              onClick={addCoalition}
              className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Aggiungi Coalizione
            </button>
          </div>

          {/* Coalitions list */}
          {coalitions.length === 0 ? (
            <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
              <p className="text-sm">Nessuna coalizione creata</p>
              <button
                onClick={addCoalition}
                className="mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Crea la prima coalizione
              </button>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {coalitions.map((coalition) => {
                const coalitionParties = parties.filter(p => coalition.parties.includes(p.id));
                return (
                  <div
                    key={coalition.id}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      draggedParty ? 'border-dashed border-primary-300 bg-primary-50' : 'border-gray-200 bg-white'
                    }`}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(coalition.id)}
                  >
                    {/* Coalition header */}
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="color"
                        value={coalition.color}
                        onChange={(e) => updateCoalition(coalition.id, { color: e.target.value })}
                        className="w-6 h-6 rounded cursor-pointer border-0 p-0"
                      />
                      {editingId === coalition.id ? (
                        <input
                          type="text"
                          value={coalition.name}
                          onChange={(e) => {
                            const newName = e.target.value;
                            updateCoalition(coalition.id, {
                              name: newName,
                              shortName: generateShortName(newName),
                            });
                          }}
                          onBlur={() => setEditingId(null)}
                          onKeyDown={(e) => e.key === 'Enter' && setEditingId(null)}
                          autoFocus
                          className="flex-1 px-2 py-1 text-sm border border-primary-300 rounded
                                     focus:ring-2 focus:ring-primary-500"
                        />
                      ) : (
                        <button
                          onClick={() => setEditingId(coalition.id)}
                          className="flex-1 text-left text-sm font-medium text-gray-900 hover:text-primary-600"
                        >
                          {coalition.name}
                        </button>
                      )}
                      <span
                        className="px-2 py-0.5 text-xs font-medium rounded text-white"
                        style={{ backgroundColor: coalition.color }}
                      >
                        {coalition.shortName}
                      </span>
                      <button
                        onClick={() => removeCoalition(coalition.id)}
                        className="p-1 text-gray-400 hover:text-red-500"
                        title="Rimuovi coalizione"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* Parties in coalition */}
                    <div className="flex flex-wrap gap-1 min-h-[32px]">
                      {coalitionParties.length === 0 ? (
                        <span className="text-xs text-gray-400 italic">
                          Trascina qui i partiti
                        </span>
                      ) : (
                        coalitionParties.map((party) => (
                          <div
                            key={party.id}
                            draggable
                            onDragStart={() => handleDragStart(party.id)}
                            onDragEnd={handleDragEnd}
                            className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs cursor-move group"
                          >
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: party.color }}
                            />
                            <span>{party.shortName}</span>
                            <button
                              onClick={() => assignPartyToCoalition(party.id, null)}
                              className="ml-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Unassigned parties */}
          {unassignedParties.length > 0 && (
            <div
              className={`p-3 rounded-lg border-2 transition-colors ${
                draggedParty ? 'border-dashed border-gray-400 bg-gray-100' : 'border-gray-200 bg-gray-50'
              }`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(null)}
            >
              <p className="text-xs font-medium text-gray-500 mb-2">
                Partiti non assegnati ({unassignedParties.length})
              </p>
              <div className="flex flex-wrap gap-1">
                {unassignedParties.map((party) => (
                  <div
                    key={party.id}
                    draggable
                    onDragStart={() => handleDragStart(party.id)}
                    onDragEnd={handleDragEnd}
                    className="flex items-center gap-1 px-2 py-1 bg-white rounded text-xs cursor-move border border-gray-200"
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: party.color }}
                    />
                    <span>{party.shortName}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-gray-500 italic">
            Trascina i partiti nelle coalizioni per assegnarli.
          </p>
        </>
      )}
    </div>
  );
}
