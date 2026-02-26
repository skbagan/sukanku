import React from 'react';
import { useSports } from '../../context/SportsContext';
import { getDisplayHouseName } from '../../utils/calculations';

interface AthleteDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  athleteId: string | null;
}

export const AthleteDetailsModal = ({ isOpen, onClose, athleteId }: AthleteDetailsModalProps) => {
  const { data } = useSports();
  const athlete = data.athletes.find(a => a.id === athleteId);

  if (!isOpen || !athlete) return null;

  const participatedEvents = data.events.filter(e => 
    e.participants && e.participants.includes(athlete.id)
  );

  const achievements: { eventName: string; rank: string; value: string; stage: string }[] = [];
  if (data.resultsLog) {
    data.resultsLog.forEach(log => {
      const winnerEntry = log.winners.find(w => 
        (w.id && w.id === athlete.id) || (!w.id && w.name === athlete.name)
      );
      
      if (winnerEntry) {
        achievements.push({
          eventName: log.eventName,
          rank: winnerEntry.rank,
          value: winnerEntry.value,
          stage: log.stage
        });
      }
    });
  }

  const getHouseColor = (houseId: string) => {
    if (houseId === 'Merah') return '#ef4444';
    if (houseId === 'Biru') return '#3b82f6';
    if (houseId === 'Kuning') return '#eab308';
    if (houseId === 'Hijau') return '#22c55e';
    return '#64748b';
  };

  const houseColor = getHouseColor(athlete.house);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl border border-slate-600">
        <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-900/50 rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>👤</span> Profil Atlet
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 bg-slate-900/50">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center text-3xl border-2" style={{ borderColor: houseColor }}>
              {athlete.gender === 'L' ? '👨' : '👩'}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">{athlete.name}</h3>
              <p className="text-slate-400">
                {getDisplayHouseName(athlete.house, data.houses)} • {athlete.class || '-'} • <span className="bg-slate-700 px-2 py-0.5 rounded text-xs">Kat {athlete.category}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 mb-6 text-center">
            <div className="bg-slate-800 p-2 rounded-lg border border-slate-700">
              <div className="text-xs text-slate-400 uppercase">Mata</div>
              <div className="text-xl font-bold text-blue-400">{athlete.points}</div>
            </div>
            <div className="bg-yellow-900/20 p-2 rounded-lg border border-yellow-700/50">
              <div className="text-xs text-yellow-500 uppercase">Emas</div>
              <div className="text-xl font-bold text-yellow-400">{athlete.medals.gold}</div>
            </div>
            <div className="bg-slate-700/30 p-2 rounded-lg border border-slate-600">
              <div className="text-xs text-slate-400 uppercase">Perak</div>
              <div className="text-xl font-bold text-slate-300">{athlete.medals.silver}</div>
            </div>
            <div className="bg-orange-900/20 p-2 rounded-lg border border-orange-700/50">
              <div className="text-xs text-orange-500 uppercase">Gangsa</div>
              <div className="text-xl font-bold text-orange-400">{athlete.medals.bronze}</div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="font-bold text-white mb-2 flex items-center gap-2">🏆 Pencapaian</h4>
              {achievements.length > 0 ? (
                <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-700 text-slate-300 text-xs uppercase">
                      <tr>
                        <th className="p-2">Acara</th>
                        <th className="p-2 text-center">Ked</th>
                        <th className="p-2 text-right">Catatan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {achievements.map((ac, i) => (
                        <tr key={i}>
                          <td className="p-2 text-white">{ac.eventName}</td>
                          <td className={`p-2 text-center font-bold ${ac.rank === '1' ? 'text-yellow-400' : ac.rank === '2' ? 'text-slate-300' : ac.rank === '3' ? 'text-orange-400' : 'text-white'}`}>
                            {ac.rank}
                          </td>
                          <td className="p-2 text-right text-slate-400">{ac.value || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-slate-500 italic text-sm">Tiada pencapaian direkodkan.</p>
              )}
            </div>

            <div>
              <h4 className="font-bold text-white mb-2 flex items-center gap-2">🏃 Penyertaan Acara</h4>
              {participatedEvents.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {participatedEvents.map(e => (
                    <span key={e.id} className="px-3 py-1 bg-slate-800 border border-slate-600 rounded-full text-xs text-slate-300">
                      {e.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 italic text-sm">Tiada penyertaan direkodkan.</p>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-700 bg-slate-900/50 rounded-b-2xl text-right">
          <button onClick={onClose} className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg transition">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
