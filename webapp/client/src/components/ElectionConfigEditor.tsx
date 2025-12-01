interface Props {
  name: string;
  seats: number;
  proportionalPercent: number;
  majoritarianPercent: number;
  onNameChange: (name: string) => void;
  onSeatsChange: (seats: number) => void;
  onProportionalChange: (percent: number) => void;
  onMajoritarianChange: (percent: number) => void;
}

export function ElectionConfigEditor({
  name,
  seats,
  proportionalPercent,
  majoritarianPercent,
  onNameChange,
  onSeatsChange,
  onProportionalChange,
  onMajoritarianChange,
}: Props) {
  // Ensure proportional + majoritarian <= 100
  const handleProportionalChange = (value: number) => {
    const newProp = Math.min(value, 100);
    if (newProp + majoritarianPercent > 100) {
      onMajoritarianChange(100 - newProp);
    }
    onProportionalChange(newProp);
  };

  const handleMajoritarianChange = (value: number) => {
    const newMaj = Math.min(value, 100);
    if (proportionalPercent + newMaj > 100) {
      onProportionalChange(100 - newMaj);
    }
    onMajoritarianChange(newMaj);
  };

  return (
    <div className="space-y-5">
      {/* Election Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nome Elezione
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg
                     focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Nome elezione personalizzata"
        />
      </div>

      {/* Seats */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Seggi Totali: <span className="font-bold text-primary-600">{seats}</span>
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="10"
            max="1000"
            step="1"
            value={seats}
            onChange={(e) => onSeatsChange(parseInt(e.target.value))}
            className="flex-1"
          />
          <input
            type="number"
            min="10"
            max="1000"
            value={seats}
            onChange={(e) => onSeatsChange(Math.max(10, Math.min(1000, parseInt(e.target.value) || 10)))}
            className="w-24 px-2 py-1 text-sm border border-gray-300 rounded-md
                       focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                       font-mono text-right"
          />
        </div>
      </div>

      {/* Proportional Percentage */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Proporzionale: <span className="font-bold text-blue-600">{proportionalPercent}%</span>
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={proportionalPercent}
            onChange={(e) => handleProportionalChange(parseInt(e.target.value))}
            className="flex-1"
            style={{ accentColor: '#3b82f6' }}
          />
          <input
            type="number"
            min="0"
            max="100"
            value={proportionalPercent}
            onChange={(e) => handleProportionalChange(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-md
                       focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                       font-mono text-right"
          />
        </div>
      </div>

      {/* Majoritarian Percentage */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Maggioritario: <span className="font-bold text-amber-600">{majoritarianPercent}%</span>
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={majoritarianPercent}
            onChange={(e) => handleMajoritarianChange(parseInt(e.target.value))}
            className="flex-1"
            style={{ accentColor: '#f59e0b' }}
          />
          <input
            type="number"
            min="0"
            max="100"
            value={majoritarianPercent}
            onChange={(e) => handleMajoritarianChange(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-md
                       focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                       font-mono text-right"
          />
        </div>
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <p className="text-gray-500 text-xs">Seggi</p>
            <p className="font-bold text-gray-900">{seats}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-2 text-center">
            <p className="text-blue-600 text-xs">Proporzionale</p>
            <p className="font-bold text-blue-700">{Math.round(seats * proportionalPercent / 100)}</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-2 text-center">
            <p className="text-amber-600 text-xs">Maggioritario</p>
            <p className="font-bold text-amber-700">{Math.round(seats * majoritarianPercent / 100)}</p>
          </div>
        </div>
        {proportionalPercent + majoritarianPercent < 100 && (
          <p className="text-xs text-gray-500 mt-2 text-center">
            {100 - proportionalPercent - majoritarianPercent}% non allocato
          </p>
        )}
      </div>
    </div>
  );
}
