import React, { useState } from 'react';
import { useSports } from '../../context/SportsContext';
import { ExternalPoints as ExternalPointsType } from '../../types';

export const ExternalPoints = () => {
  const { data, updateData } = useSports();
  const [extPoints, setExtPoints] = useState<ExternalPointsType>(data.externalPoints);

  const handleScoreChange = (type: 'merentasDesa' | 'sukantara', houseId: string, value: string) => {
    const newExt = { ...extPoints };
    newExt[type].scores[houseId] = parseInt(value) || 0;
    setExtPoints(newExt);
  };

  const handleToggle = (type: 'merentasDesa' | 'sukantara', checked: boolean) => {
    const newExt = { ...extPoints };
    newExt[type].enabled = checked;
    setExtPoints(newExt);
  };

  const handleSave = async () => {
    const newData = { ...data };
    newData.externalPoints = extPoints;
    await updateData(newData);
    alert('Markah tambahan disimpan.');
  };

  const houses = ['Merah', 'Biru', 'Kuning', 'Hijau'];
  const getHouseColor = (houseId: string) => {
    if (houseId === 'Merah') return '#ef4444';
    if (houseId === 'Biru') return '#3b82f6';
    if (houseId === 'Kuning') return '#eab308';
    if (houseId === 'Hijau') return '#22c55e';
    return '#64748b';
  };

  return (
    <div className="bg-slate-800/50 rounded-2xl p-6 backdrop-blur-sm border border-slate-700 mb-6">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">⭐ Markah Tambahan (Keseluruhan)</h3>
      <div className="grid md:grid-cols-2 gap-6">
        {/* Merentas Desa */}
        <div className="bg-slate-700/30 p-4 rounded-xl border border-slate-600">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-bold text-sm text-green-300">Merentas Desa</h4>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={extPoints.merentasDesa.enabled}
                onChange={(e) => handleToggle('merentasDesa', e.target.checked)}
                className="w-4 h-4 rounded text-green-500 bg-slate-800 border-slate-500"
              />
              <span className="text-xs text-slate-300">Kira dalam keputusan</span>
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {houses.map((h) => (
              <div key={h}>
                <label className="text-[10px] block mb-1" style={{ color: getHouseColor(h) }}>
                  Rumah {h}
                </label>
                <input
                  type="number"
                  value={extPoints.merentasDesa.scores[h] || 0}
                  onChange={(e) => handleScoreChange('merentasDesa', h, e.target.value)}
                  className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Sukantara */}
        <div className="bg-slate-700/30 p-4 rounded-xl border border-slate-600">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-bold text-sm text-yellow-300">Sukantara</h4>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={extPoints.sukantara.enabled}
                onChange={(e) => handleToggle('sukantara', e.target.checked)}
                className="w-4 h-4 rounded text-yellow-500 bg-slate-800 border-slate-500"
              />
              <span className="text-xs text-slate-300">Kira dalam keputusan</span>
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {houses.map((h) => (
              <div key={h}>
                <label className="text-[10px] block mb-1" style={{ color: getHouseColor(h) }}>
                  Rumah {h}
                </label>
                <input
                  type="number"
                  value={extPoints.sukantara.scores[h] || 0}
                  onChange={(e) => handleScoreChange('sukantara', h, e.target.value)}
                  className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <button
        onClick={handleSave}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg mt-4 text-sm transition"
      >
        💾 Simpan Markah Tambahan
      </button>
    </div>
  );
};
