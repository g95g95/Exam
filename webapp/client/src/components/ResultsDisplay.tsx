import type { SimulationResult } from '../types';

interface Props {
  result: SimulationResult;
  totalSeats: number;
}

export function ResultsDisplay({ result, totalSeats }: Props) {
  // Sort coalitions by expected seats
  const sortedCoalitions = [...result.coalitions].sort(
    (a, b) => (result.expectedSeats[b.id] || 0) - (result.expectedSeats[a.id] || 0)
  );

  // Calculate total expected seats
  const totalExpected = Object.values(result.expectedSeats).reduce((a, b) => a + b, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">
          Risultati Simulazione
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {result.iterations.toLocaleString()} iterazioni Monte Carlo
        </p>
      </div>

      {/* Seat bar visualization */}
      <div className="p-6 bg-gray-50">
        <div className="h-12 rounded-lg overflow-hidden flex shadow-inner">
          {sortedCoalitions.map((coalition) => {
            const seats = result.expectedSeats[coalition.id] || 0;
            const percentage = (seats / totalSeats) * 100;
            if (percentage < 0.5) return null;

            return (
              <div
                key={coalition.id}
                className="relative group transition-all duration-300 hover:brightness-110"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: coalition.color,
                }}
              >
                {percentage > 8 && (
                  <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
                    {coalition.shortName}
                  </div>
                )}

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                                opacity-0 group-hover:opacity-100 transition-opacity
                                pointer-events-none z-10">
                  <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                    {coalition.name}: {seats} seggi ({percentage.toFixed(1)}%)
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Majority line */}
        <div className="relative mt-2">
          <div
            className="absolute h-full w-px bg-red-500"
            style={{ left: '50%' }}
          />
          <div className="text-center">
            <span className="text-xs text-red-600 font-medium bg-white px-2">
              Maggioranza: {Math.ceil(totalSeats / 2)} seggi
            </span>
          </div>
        </div>
      </div>

      {/* Detailed results table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-y border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Coalizione
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Seggi Attesi
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Media
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Dev. Std.
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Range
              </th>
              {result.realResults && (
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Reale
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedCoalitions.map((coalition) => {
              const seats = result.expectedSeats[coalition.id] || 0;
              const stats = result.statistics[coalition.id];
              const realSeats = result.realResults?.[coalition.id];
              const diff = realSeats !== undefined ? seats - realSeats : null;

              return (
                <tr key={coalition.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: coalition.color }}
                      />
                      <div>
                        <div className="font-medium text-gray-900">
                          {coalition.shortName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {coalition.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-xl font-bold text-gray-900">
                      {seats}
                    </span>
                    <span className="text-gray-500 text-sm ml-1">
                      ({((seats / totalSeats) * 100).toFixed(1)}%)
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-mono text-sm text-gray-600">
                    {stats?.mean.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-mono text-sm text-gray-600">
                    ±{stats?.stdDev.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-mono text-sm text-gray-600">
                    {stats?.min}-{stats?.max}
                  </td>
                  {result.realResults && (
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {realSeats !== undefined && (
                        <div className="flex items-center justify-end gap-2">
                          <span className="font-bold text-gray-900">
                            {realSeats}
                          </span>
                          {diff !== null && (
                            <span
                              className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                                diff > 0
                                  ? 'bg-green-100 text-green-700'
                                  : diff < 0
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {diff > 0 ? '+' : ''}
                              {diff}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-gray-50 border-t border-gray-200">
            <tr>
              <td className="px-6 py-3 font-semibold text-gray-900">
                Totale
              </td>
              <td className="px-6 py-3 text-right font-bold text-gray-900">
                {totalExpected}
              </td>
              <td colSpan={result.realResults ? 4 : 3}></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
