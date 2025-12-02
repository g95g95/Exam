import type { Party, Coalition } from '../types';

interface Props {
  parties: Party[];
  coalitions: Coalition[];
  voteShares: Record<string, number>;
  territorialita: Record<string, boolean>;
  onChange: (id: string, value: number) => void;
  onTerritorialitaChange: (id: string, value: boolean) => void;
}

export function VoteSharesForm({
  parties,
  coalitions,
  voteShares,
  territorialita,
  onChange,
  onTerritorialitaChange
}: Props) {
  const total = Object.values(voteShares).reduce((a, b) => a + b, 0);
  const totalPercent = (total * 100).toFixed(1);
  const isValid = Math.abs(total - 1) < 0.001;

  // Raggruppa i partiti per coalizione
  const getCoalitionForParty = (partyId: string): Coalition | undefined => {
    return coalitions.find(c => c.parties.includes(partyId));
  };

  // Ordina i partiti per coalizione
  const sortedParties = [...parties].sort((a, b) => {
    const coalA = getCoalitionForParty(a.id);
    const coalB = getCoalitionForParty(b.id);
    if (!coalA && !coalB) return 0;
    if (!coalA) return 1;
    if (!coalB) return -1;
    return coalitions.indexOf(coalA) - coalitions.indexOf(coalB);
  });

  let currentCoalition: Coalition | undefined;

  return (
    <div className="space-y-3">
      {sortedParties.map((party) => {
        const share = voteShares[party.id] || 0;
        const percent = (share * 100).toFixed(1);
        const coalition = getCoalitionForParty(party.id);
        const isTerritorial = territorialita[party.id] || false;

        // Mostra l'intestazione della coalizione se cambia
        const showCoalitionHeader = coalition && coalition !== currentCoalition;
        if (coalition) {
          currentCoalition = coalition;
        }

        return (
          <div key={party.id}>
            {showCoalitionHeader && coalition && (
              <div
                className="flex items-center gap-2 mt-4 mb-2 pb-1 border-b"
                style={{ borderColor: coalition.color + '40' }}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: coalition.color }}
                />
                <span className="text-sm font-semibold" style={{ color: coalition.color }}>
                  {coalition.name}
                </span>
              </div>
            )}

            <div className="space-y-1.5 pl-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: party.color }}
                  />
                  <span className="font-medium text-gray-900 text-sm">
                    {party.shortName}
                  </span>
                  <span className="text-gray-500 text-xs hidden sm:inline">
                    {party.name}
                  </span>
                </div>
                <span className="font-mono text-xs font-medium text-gray-700">
                  {percent}%
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="0.1"
                  value={share * 100}
                  onChange={(e) => onChange(party.id, parseFloat(e.target.value) / 100)}
                  className="flex-1"
                  style={{
                    accentColor: party.color,
                  }}
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={percent}
                  onChange={(e) => onChange(party.id, parseFloat(e.target.value) / 100)}
                  className="w-16 px-2 py-1 text-xs border rounded-md font-mono text-right"
                />
              </div>

              {/* Checkbox territorialita */}
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="checkbox"
                  id={`territorial-${party.id}`}
                  checked={isTerritorial}
                  onChange={(e) => onTerritorialitaChange(party.id, e.target.checked)}
                  className="w-3.5 h-3.5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label
                  htmlFor={`territorial-${party.id}`}
                  className="text-xs text-gray-500 cursor-pointer select-none"
                >
                  Territorialita (+20% maggioritario)
                </label>
              </div>
            </div>
          </div>
        );
      })}

      {/* Total indicator */}
      <div className={`mt-4 pt-4 border-t border-gray-200 flex justify-between items-center
                       ${isValid ? 'text-green-600' : 'text-amber-600'}`}>
        <span className="font-medium">Totale</span>
        <span className="font-mono font-bold">
          {totalPercent}%
          {!isValid && (
            <span className="ml-2 text-xs">
              {total > 1 ? '(eccede 100%)' : '(meno di 100%)'}
            </span>
          )}
        </span>
      </div>
    </div>
  );
}
