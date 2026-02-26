import React, { useState } from 'react';
import { useSports } from '../../context/SportsContext';
import { getTopAthletes, getDisplayHouseName } from '../../utils/calculations';
import { AthleteDetailsModal } from '../modals/AthleteDetailsModal';

export const ChampionsTab = () => {
  const { data } = useSports();
  const config = data.config.championConfig.main;
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(null);

  const maleChampion = getTopAthletes(
    data.athletes,
    data.resultsLog,
    data.events,
    data.pointsConfig,
    'L',
    config,
    true
  )[0];

  const femaleChampion = getTopAthletes(
    data.athletes,
    data.resultsLog,
    data.events,
    data.pointsConfig,
    'P',
    config,
    true
  )[0];

  const renderChampCard = (p: any, title: string, icon: string, colorClass: string) => {
    if (!p || (p.displayStats ? p.displayStats.points === 0 : p.points === 0)) {
      return (
        <div className={`bg-gradient-to-br ${colorClass} rounded-2xl p-6 border border-opacity-50 text-center`}>
          <div className="text-6xl mb-4">{icon}</div>
          <h2 className="text-2xl font-bold text-yellow-400 mb-2">{title}</h2>
          <div className="mt-4 text-slate-400">Belum ditentukan</div>
        </div>
      );
    }

    const stats = p.displayStats || p.medals;
    const pts = p.displayStats ? p.displayStats.points : p.points;

    return (
      <div className={`bg-gradient-to-br ${colorClass} rounded-2xl p-6 border border-opacity-50 text-center`}>
        <div className="text-6xl mb-4">{icon}</div>
        <h2 className="text-2xl font-bold text-yellow-400 mb-2">{title}</h2>
        <div className="mt-4">
          <div
            className="font-bold text-xl text-white mb-1 cursor-pointer hover:text-blue-400 underline decoration-dotted"
            onClick={() => setSelectedAthleteId(p.id)}
          >
            {p.name}
          </div>
          <div className="text-sm text-slate-300 mb-3">
            {p.class || '-'} • {getDisplayHouseName(p.house, data.houses)} • {pts} Mata
          </div>
          <div className="flex justify-center gap-4 text-xs font-bold">
            <span className="text-yellow-400 bg-yellow-900/30 px-2 py-1 rounded">Emas: {stats.gold}</span>
            <span className="text-slate-300 bg-slate-700/50 px-2 py-1 rounded">Perak: {stats.silver}</span>
            <span className="text-orange-400 bg-orange-900/30 px-2 py-1 rounded">Gangsa: {stats.bronze}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {renderChampCard(maleChampion, 'OLAHRAGAWAN', '👨', 'from-blue-900 to-slate-800 border-blue-700')}
      {renderChampCard(femaleChampion, 'OLAHRAGAWATI', '👩', 'from-pink-900 to-slate-800 border-pink-700')}
      
      <AthleteDetailsModal
        isOpen={!!selectedAthleteId}
        onClose={() => setSelectedAthleteId(null)}
        athleteId={selectedAthleteId}
      />
    </div>
  );
};
