import React from 'react';
import { useSports } from '../../context/SportsContext';

export const ScheduleTab = () => {
  const { data } = useSports();
  
  // Auto-generate schedule from events
  const items = [...data.events].sort((a, b) => {
    const codeA = a.code ? String(a.code) : '';
    const codeB = b.code ? String(b.code) : '';
    return codeA.localeCompare(codeB, undefined, { numeric: true }) || a.name.localeCompare(b.name);
  });

  return (
    <div className="bg-slate-800/50 rounded-2xl p-6 backdrop-blur-sm border border-slate-700">
      <h2 className="text-xl font-bold mb-4">📅 Jadual Pertandingan</h2>
      <div className="overflow-x-auto rounded-lg border border-slate-700 max-h-[70vh] overflow-y-auto">
        <table className="w-full text-sm text-left text-slate-300">
          <thead className="text-xs uppercase bg-slate-800 text-slate-400 sticky top-0">
            <tr>
              <th className="px-4 py-3">No. Acara</th>
              <th className="px-4 py-3">Acara</th>
              <th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700 bg-slate-800/50">
            {items.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-4 text-slate-500 italic">
                  Tiada acara didaftarkan.
                </td>
              </tr>
            ) : (
              items.map((ev) => {
                const isCompleted = ev.status === 'completed' || (ev.result && ev.result.winners && ev.result.winners.length > 0);
                return (
                  <tr key={ev.id} className="hover:bg-slate-700/50">
                    <td className="px-4 py-3 font-medium text-white whitespace-nowrap">
                      {ev.code || '-'}
                    </td>
                    <td className="px-4 py-3 font-medium text-white">{ev.name}</td>
                    <td className="px-4 py-3">
                      <span className="bg-slate-700 px-2 py-0.5 rounded text-xs">
                        {ev.category || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isCompleted ? (
                        <span className="bg-green-900/50 text-green-400 px-2 py-1 rounded text-xs font-bold border border-green-700/50">
                          SELESAI
                        </span>
                      ) : (
                        <span className="bg-slate-700/50 text-slate-400 px-2 py-1 rounded text-xs border border-slate-600">
                          BELUM
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
