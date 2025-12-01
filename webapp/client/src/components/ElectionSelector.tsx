import type { ElectionInfo } from '../types';

interface Props {
  elections: ElectionInfo[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function ElectionSelector({ elections, selectedId, onSelect }: Props) {
  return (
    <div className="space-y-3">
      {elections.length === 0 ? (
        <p className="text-gray-500 text-sm">Caricamento elezioni...</p>
      ) : (
        <select
          value={selectedId}
          onChange={(e) => onSelect(e.target.value)}
          className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg
                     focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                     text-gray-900 font-medium transition-colors"
        >
          {elections.map((election) => (
            <option key={election.id} value={election.id}>
              {election.name}
            </option>
          ))}
        </select>
      )}

      {selectedId && elections.length > 0 && (
        <div className="text-sm text-gray-500 space-y-1">
          {elections
            .filter((e) => e.id === selectedId)
            .map((e) => (
              <div key={e.id}>
                <span className="font-medium">{e.seats}</span> seggi,{' '}
                <span className="font-medium">{e.coalitionCount}</span> coalizioni
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
