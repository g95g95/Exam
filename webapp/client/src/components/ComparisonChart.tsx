import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { SimulationResult } from '../types';

interface Props {
  result: SimulationResult;
}

export function ComparisonChart({ result }: Props) {
  if (!result.realResults) return null;

  // Create comparison data
  const comparisonData = result.coalitions.map((coalition) => {
    const expected = result.expectedSeats[coalition.id] || 0;
    const real = result.realResults?.[coalition.id] || 0;
    const diff = expected - real;

    return {
      name: coalition.shortName,
      fullName: coalition.name,
      simulated: expected,
      real: real,
      difference: diff,
      color: coalition.color,
      diffColor: diff > 0 ? '#22c55e' : diff < 0 ? '#ef4444' : '#9ca3af',
    };
  });

  // Sort by real seats
  comparisonData.sort((a, b) => b.real - a.real);

  return (
    <div className="space-y-6">
      {/* Comparison bar chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={comparisonData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis type="number" stroke="#6b7280" />
            <YAxis
              dataKey="name"
              type="category"
              width={60}
              stroke="#6b7280"
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const data = payload[0].payload;
                return (
                  <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                    <p className="font-semibold text-gray-900">{data.fullName}</p>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <p className="text-xs text-gray-500">Simulato</p>
                        <p className="text-lg font-bold text-gray-900">{data.simulated}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Reale</p>
                        <p className="text-lg font-bold text-gray-900">{data.real}</p>
                      </div>
                    </div>
                    <p className={`text-sm mt-2 font-medium ${
                      data.difference > 0 ? 'text-green-600' :
                      data.difference < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      Differenza: {data.difference > 0 ? '+' : ''}{data.difference}
                    </p>
                  </div>
                );
              }}
            />
            <Legend />
            <Bar
              dataKey="simulated"
              name="Simulato"
              radius={[0, 4, 4, 0]}
            >
              {comparisonData.map((entry, index) => (
                <Cell key={index} fill={entry.color} opacity={0.7} />
              ))}
            </Bar>
            <Bar
              dataKey="real"
              name="Reale"
              radius={[0, 4, 4, 0]}
            >
              {comparisonData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Difference table */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">
          Scostamento Simulato vs Reale
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {comparisonData.map((item) => (
            <div
              key={item.name}
              className="bg-white rounded-lg p-3 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-medium text-gray-900">{item.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {item.simulated} vs {item.real}
                </span>
                <span
                  className={`text-sm font-bold px-2 py-0.5 rounded ${
                    item.difference > 0
                      ? 'bg-green-100 text-green-700'
                      : item.difference < 0
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {item.difference > 0 ? '+' : ''}
                  {item.difference}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Accuracy metrics */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-800 mb-2">
          Metriche di Accuratezza
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-blue-600">Errore Medio Assoluto (MAE)</p>
            <p className="text-xl font-bold text-blue-900">
              {(
                comparisonData.reduce((sum, d) => sum + Math.abs(d.difference), 0) /
                comparisonData.length
              ).toFixed(1)}
            </p>
          </div>
          <div>
            <p className="text-blue-600">Errore Massimo</p>
            <p className="text-xl font-bold text-blue-900">
              {Math.max(...comparisonData.map((d) => Math.abs(d.difference)))}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
