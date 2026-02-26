import React, { useState } from 'react';
import { useSports } from '../../context/SportsContext';
import { House } from '../../types';
import { EventLimitModal } from '../modals/EventLimitModal';
import { ChampionCriteriaModal } from '../modals/ChampionCriteriaModal';

export const HouseSettings = () => {
  const { data, updateData } = useSports();
  const [houses, setHouses] = useState<House[]>(data.houses);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showCriteriaModal, setShowCriteriaModal] = useState(false);

  const getHouseColor = (houseId: string) => {
    if (houseId === 'Merah') return '#ef4444';
    if (houseId === 'Biru') return '#3b82f6';
    if (houseId === 'Kuning') return '#eab308';
    if (houseId === 'Hijau') return '#22c55e';
    return '#64748b';
  };

  const handleHouseChange = (index: number, field: keyof House, value: any) => {
    const newHouses = [...houses];
    newHouses[index] = { ...newHouses[index], [field]: value };
    setHouses(newHouses);
  };

  const handleSave = async () => {
    const newData = { ...data };
    newData.houses = houses;
    await updateData(newData);
    alert('Tetapan rumah sukan disimpan.');
  };

  return (
    <div className="bg-slate-800/50 rounded-2xl p-6 backdrop-blur-sm border border-slate-700 mb-6">
      <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
        <h3 className="text-lg font-bold flex items-center gap-2">🏠 Tetapan Rumah Sukan</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowLimitModal(true)}
            className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded-lg border border-slate-500 flex items-center gap-1 transition"
          >
            <span>🚦</span> Had Acara
          </button>
          <button
            onClick={() => setShowCriteriaModal(true)}
            className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded-lg border border-slate-500 flex items-center gap-1 transition"
          >
            <span>🏆</span> Kriteria Anugerah
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {houses.map((h, i) => (
          <div key={h.id} className="bg-slate-700/30 p-3 rounded-lg border border-slate-600">
            <label className="block text-xs font-bold mb-1" style={{ color: getHouseColor(h.id) }}>
              Rumah {h.id}
            </label>
            <input
              type="text"
              value={h.name}
              onChange={(e) => handleHouseChange(i, 'name', e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm mb-2 text-white"
            />
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={h.active}
                onChange={(e) => handleHouseChange(i, 'active', e.target.checked)}
                className="rounded bg-slate-800 border-slate-600"
              />
              Papar di Dashboard
            </label>
          </div>
        ))}
      </div>
      <button
        onClick={handleSave}
        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-bold mt-4 transition"
      >
        💾 Simpan Rumah Sukan
      </button>

      <EventLimitModal isOpen={showLimitModal} onClose={() => setShowLimitModal(false)} />
      <ChampionCriteriaModal isOpen={showCriteriaModal} onClose={() => setShowCriteriaModal(false)} />
    </div>
  );
};
