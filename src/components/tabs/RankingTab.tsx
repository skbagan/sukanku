import React, { useState } from 'react';
import { useSports } from '../../context/SportsContext';
import { getTopAthletes, getDisplayHouseName } from '../../utils/calculations';
import { AthleteDetailsModal } from '../modals/AthleteDetailsModal';

export const RankingTab = () => {
  const { data } = useSports();
  const [filterClass, setFilterClass] = useState('');
  const [filterGender, setFilterGender] = useState('');
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(null);

  const uniqueClasses = [...new Set(data.athletes.map(a => a.class))].filter(Boolean).sort();

  const athletes = getTopAthletes(
    data.athletes,
    data.resultsLog,
    data.events,
    data.pointsConfig,
    filterGender as 'L' | 'P' | null
  ).filter(a => filterClass === '' || a.class === filterClass).slice(0, 50);

  return (
    <div className="bg-slate-800/50 rounded-2xl p-6 backdrop-blur-sm border border-slate-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">📊 Ranking Individu</h2>
        <div className="flex gap-2">
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1 text-sm outline-none text-white"
          >
            <option value="">Semua Kelas</option>
            {uniqueClasses.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value)}
            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1 text-sm outline-none text-white"
          >
            <option value="">Semua Jantina</option>
            <option value="L">Lelaki</option>
            <option value="P">Perempuan</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900/50 text-slate-400 uppercase font-medium">
            <tr>
              <th className="p-3 rounded-l-lg">Ked</th>
              <th className="p-3">Nama</th>
              <th className="p-3">Kelas</th>
              <th className="p-3">Rumah</th>
              <th className="p-3">Kat</th>
              <th className="p-3 text-center">🥇</th>
              <th className="p-3 text-center">🥈</th>
              <th className="p-3 text-center">🥉</th>
              <th className="p-3 text-center">4th</th>
              <th className="p-3 text-right rounded-r-lg">Mata</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {athletes.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center text-slate-400 py-8">Tiada data ranking.</td>
              </tr>
            ) : (
              athletes.map((a, i) => (
                <tr key={a.id} className="hover:bg-slate-800 transition border-b border-slate-800 last:border-0">
                  <td className="p-3 text-slate-500 font-mono">
                    {i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}
                  </td>
                  <td
                    className="p-3 font-medium cursor-pointer hover:text-blue-400 text-white underline decoration-dotted"
                    onClick={() => setSelectedAthleteId(a.id)}
                  >
                    {a.name}
                  </td>
                  <td className="p-3 text-xs opacity-75">{a.class || '-'}</td>
                  <td className="p-3 text-xs opacity-75">
                    <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ background: 'gray' }}></span>
                    {getDisplayHouseName(a.house, data.houses)}
                  </td>
                  <td className="p-3">
                    <span className="bg-slate-700 px-2 py-0.5 rounded text-xs">Kat {a.category}</span>
                  </td>
                  <td className="p-3 text-center text-yellow-500 font-bold bg-yellow-900/10">{a.medals.gold}</td>
                  <td className="p-3 text-center text-slate-400 font-bold bg-slate-900/10">{a.medals.silver}</td>
                  <td className="p-3 text-center text-orange-500 font-bold bg-orange-900/10">{a.medals.bronze}</td>
                  <td className="p-3 text-center">
                    {a.points >= 1 && !a.medals.gold && !a.medals.silver && !a.medals.bronze ? '✔' : '-'}
                  </td>
                  <td className="p-3 text-right font-bold text-blue-400">{a.points}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AthleteDetailsModal
        isOpen={!!selectedAthleteId}
        onClose={() => setSelectedAthleteId(null)}
        athleteId={selectedAthleteId}
      />
    </div>
  );
};
