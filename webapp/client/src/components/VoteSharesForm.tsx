import type { Coalition } from '../types';

interface Props {
  coalitions: Coalition[];
  voteShares: Record<string, number>;
  onChange: (id: string, value: number) => void;
}

export function VoteSharesForm({ coalitions, voteShares, onChange }: Props) {
  const total = Object.values(voteShares).reduce((a, b) => a + b, 0);
  const totalPercent = (total * 100).toFixed(1);
  const isValid = Math.abs(total - 1) < 0.001;

  return (
    <div className="space-y-4">
      {coalitions.map((coalition) => {
        const share = voteShares[coalition.id] || 0;
        const percent = (share * 100).toFixed(1);

        return (
          <div key={coalition.id} className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: coalition.color }}
                />
                <span className="font-medium text-gray-900">
                  {coalition.shortName}
                </span>
                <span className="text-gray-500 text-sm">
                  {coalition.name}
                </span>
              </div>
              <span className="font-mono text-sm font-medium text-gray-700">
                {percent}%
              </span>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="100"
                step="0.1"
                value={share * 100}
                onChange={(e) => onChange(coalition.id, parseFloat(e.target.value) / 100)}
                className="flex-1"
                style={{
                  accentColor: coalition.color,
                }}
              />
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={percent}
                onChange={(e) => onChange(coalition.id, parseFloat(e.target.value) / 100)}
                className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-md
                           focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                           font-mono text-right"
              />
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
