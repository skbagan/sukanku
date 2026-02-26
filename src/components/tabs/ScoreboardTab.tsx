import React from 'react';
import { useSports } from '../../context/SportsContext';
import { calculateHouseStats, getDisplayHouseName } from '../../utils/calculations';

export const ScoreboardTab = () => {
  const { data } = useSports();
  const houseStats = calculateHouseStats(data.resultsLog, data.events, data.houses, data.pointsConfig, data.externalPoints);

  const getHouseColor = (houseId: string) => {
    if (houseId === 'Merah') return '#ef4444';
    if (houseId === 'Biru') return '#3b82f6';
    if (houseId === 'Kuning') return '#eab308';
    if (houseId === 'Hijau') return '#22c55e';
    return '#64748b';
  };

  const completedEvents = data.events.filter(e => e.status === 'completed').reverse();

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* House Rankings */}
        <div className="bg-slate-800/50 rounded-2xl p-6 backdrop-blur-sm border border-slate-700">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="text-2xl">🏠</span> Kedudukan Rumah
          </h2>
          <div className="space-y-3">
            {houseStats.map((h, i) => (
              <div
                key={h.id}
                className="flex items-center justify-between p-4 rounded-xl shadow-lg relative overflow-hidden group mb-3"
                style={{ background: getHouseColor(h.id), color: 'white' }}
              >
                <div className="flex items-center gap-4 z-10">
                  <span className="text-2xl font-bold w-8 text-center bg-black/20 rounded-lg py-1">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-bold text-lg">{h.name}</h3>
                    <p className="text-xs opacity-90">
                      Pungutan: {h.gold}E {h.silver}P {h.bronze}G
                    </p>
                  </div>
                </div>
                <div className="text-4xl font-black z-10">{h.points}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-600 text-xs text-slate-400">
            *Markah termasuk mata individu dan markah tambahan.
          </div>
        </div>

        {/* Medal Tally */}
        <div className="bg-slate-800/50 rounded-2xl p-6 backdrop-blur-sm border border-slate-700">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="text-2xl">🏅</span> Jumlah Pingat
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-600 text-slate-400">
                  <th className="text-left py-2">Rumah</th>
                  <th className="text-center py-2 text-yellow-500">🥇</th>
                  <th className="text-center py-2 text-slate-300">🥈</th>
                  <th className="text-center py-2 text-orange-500">🥉</th>
                  <th className="text-center py-2">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {houseStats.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-700/30 transition">
                    <td className="py-3 px-2 font-medium">
                      <span
                        className="inline-block w-2 h-2 rounded-full mr-2"
                        style={{ background: getHouseColor(h.id) }}
                      ></span>
                      {h.name}
                    </td>
                    <td className="text-center py-3 text-yellow-400 font-bold bg-yellow-900/10">
                      {h.gold}
                    </td>
                    <td className="text-center py-3 text-slate-300 font-bold bg-slate-700/10">
                      {h.silver}
                    </td>
                    <td className="text-center py-3 text-orange-400 font-bold bg-orange-900/10">
                      {h.bronze}
                    </td>
                    <td className="text-center py-3 font-bold text-blue-400">
                      {h.gold + h.silver + h.bronze}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Results */}
      <div className="bg-slate-800/50 rounded-2xl p-6 backdrop-blur-sm border border-slate-700">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          📢 Keputusan Terkini (Selesai)
        </h2>
        <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin">
          {completedEvents.length === 0 ? (
            <p className="text-slate-500 italic text-center">Tiada keputusan direkodkan.</p>
          ) : (
            completedEvents.map((ev) => (
              <div
                key={ev.id}
                className="bg-slate-800 p-3 rounded border border-slate-700 text-xs flex justify-between items-center"
              >
                <div>
                  <div className="font-bold text-blue-300">{ev.name}</div>
                  <div className="text-slate-400">{ev.category}</div>
                </div>
                {/* PDF generation logic would go here, simplified for now */}
                <button className="bg-green-600 hover:bg-green-500 text-white px-2 py-1 rounded text-[10px] font-bold">
                  👁️ Lihat
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
