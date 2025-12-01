import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { SimulationResult } from '../types';

interface Props {
  result: SimulationResult;
}

export function DistributionChart({ result }: Props) {
  // Create histogram data for each coalition
  const histogramData: Record<string, number[]> = {};

  result.coalitions.forEach((coalition) => {
    const values = result.allResults[coalition.id] || [];
    if (values.length === 0) return;

    // Calculate histogram bins
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binCount = Math.min(20, max - min + 1);
    const binSize = (max - min + 1) / binCount;

    const bins = new Array(binCount).fill(0);
    values.forEach((v) => {
      const binIndex = Math.min(Math.floor((v - min) / binSize), binCount - 1);
      bins[binIndex]++;
    });

    histogramData[coalition.id] = bins;
  });

  // Create chart data combining all coalitions
  const chartData = result.coalitions.map((coalition) => ({
    name: coalition.shortName,
    fullName: coalition.name,
    expected: result.expectedSeats[coalition.id] || 0,
    mean: result.statistics[coalition.id]?.mean || 0,
    stdDev: result.statistics[coalition.id]?.stdDev || 0,
    min: result.statistics[coalition.id]?.min || 0,
    max: result.statistics[coalition.id]?.max || 0,
    color: coalition.color,
  }));

  // Sort by expected seats
  chartData.sort((a, b) => b.expected - a.expected);

  return (
    <div className="space-y-6">
      {/* Bar chart of expected seats */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical">
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
                    <p className="text-sm text-gray-600">
                      Seggi attesi: <span className="font-bold">{data.expected}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Media: {data.mean.toFixed(1)} (±{data.stdDev.toFixed(1)})
                    </p>
                    <p className="text-sm text-gray-600">
                      Range: {data.min} - {data.max}
                    </p>
                  </div>
                );
              }}
            />
            <Bar
              dataKey="expected"
              name="Seggi Attesi"
              radius={[0, 4, 4, 0]}
              fill="#3b82f6"
            >
              {chartData.map((entry, index) => (
                <rect key={index} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Statistics summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {chartData.slice(0, 4).map((item) => (
          <div
            key={item.name}
            className="bg-gray-50 rounded-lg p-4 border-l-4"
            style={{ borderColor: item.color }}
          >
            <p className="text-sm font-medium text-gray-600">{item.name}</p>
            <p className="text-2xl font-bold text-gray-900">{item.expected}</p>
            <p className="text-xs text-gray-500">
              Range: {item.min}-{item.max}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
