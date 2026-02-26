import React, { useState } from 'react';
import { useSports } from '../../context/SportsContext';
import { getTopAthletes, getDisplayHouseName } from '../../utils/calculations';
import { AthleteDetailsModal } from '../modals/AthleteDetailsModal';

export const HopesTab = () => {
  const { data } = useSports();
  const config = data.config.championConfig.hope;
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(null);

  const maleHope = getTopAthletes(
    data.athletes,
    data.resultsLog,
    data.events,
    data.pointsConfig,
    'L',
    config,
    true
  )[0];

  const femaleHope = getTopAthletes(
    data.athletes,
    data.resultsLog,
    data.events,
    data.pointsConfig,
    'P',
    config,
    true
  )[0];

  const renderHopeCard = (p: any, title: string, colorClass: string, iconColor: string) => {
    if (!p || (p.displayStats ? p.displayStats.points === 0 : p.points === 0)) {
      return (
        <div className={`bg-gradient-to-br ${colorClass} rounded-2xl p-6 border border-opacity-50 text-center`}>
          <div className={`w-20 h-20 ${iconColor} rounded-full mx-auto flex items-center justify-center mb-3 shadow-lg`}>
            <span className="text-4xl">⭐</span>
          </div>
          <h2 className="text-xl font-bold text-cyan-400">{title}</h2>
          <div className="mt-4 text-slate-400">Belum ditentukan</div>
        </div>
      );
    }

    const stats = p.displayStats || p.medals;
    const pts = p.displayStats ? p.displayStats.points : p.points;

    return (
      <div className={`bg-gradient-to-br ${colorClass} rounded-2xl p-6 border border-opacity-50 text-center`}>
        <div className={`w-20 h-20 ${iconColor} rounded-full mx-auto flex items-center justify-center mb-3 shadow-lg`}>
          <span className="text-4xl">⭐</span>
        </div>
        <h2 className="text-xl font-bold text-cyan-400">{title}</h2>
        <div className="mt-4">
          <div
            className="text-xl font-bold mb-1 cursor-pointer hover:text-blue-400 underline decoration-dotted"
            onClick={() => setSelectedAthleteId(p.id)}
          >
            {p.name}
          </div>
          <div className="text-slate-300 text-sm mb-2">
            {p.class || '-'} • {getDisplayHouseName(p.house, data.houses)}
          </div>
          <div className="mb-2">
            <span className="bg-slate-700 px-2 py-0.5 rounded text-xs">Kat {p.category}</span>
          </div>
          <div className="flex justify-center gap-3 text-xs mb-2">
            <span>🥇{stats.gold}</span>
            <span>🥈{stats.silver}</span>
            <span>🥉{stats.bronze}</span>
          </div>
          <div className="text-blue-400 font-bold">{pts} Mata</div>
        </div>
      </div>
    );
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {renderHopeCard(maleHope, 'ATLET HARAPAN LELAKI', 'from-cyan-900 to-slate-800 border-cyan-700', 'bg-cyan-500/20')}
      {renderHopeCard(femaleHope, 'ATLET HARAPAN WANITA', 'from-purple-900 to-slate-800 border-purple-700', 'bg-purple-500/20')}
      
      <AthleteDetailsModal
        isOpen={!!selectedAthleteId}
        onClose={() => setSelectedAthleteId(null)}
        athleteId={selectedAthleteId}
      />
    </div>
  );
};
