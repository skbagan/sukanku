import React from 'react';
import { useSports } from '../../context/SportsContext';

export const EventLimitModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { data, updateData } = useSports();
  const [enabled, setEnabled] = React.useState(data.config.enableEventLimit);
  const [maxInd, setMaxInd] = React.useState(data.config.maxInd);
  const [maxTeam, setMaxTeam] = React.useState(data.config.maxTeam);

  if (!isOpen) return null;

  const handleSave = async () => {
    const newData = { ...data };
    newData.config.enableEventLimit = enabled;
    newData.config.maxInd = maxInd;
    newData.config.maxTeam = maxTeam;
    await updateData(newData);
    alert('Tetapan had acara disimpan.');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-96 text-gray-800 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">🚦 Had Penyertaan</h2>
        
        <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-100 mb-4">
          <label htmlFor="enable-limit" className="text-sm font-bold text-blue-900">Aktifkan Had</label>
          <input
            type="checkbox"
            id="enable-limit"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Maksimum Individu</label>
            <input
              type="number"
              value={maxInd}
              onChange={(e) => setMaxInd(parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Maksimum Pasukan</label>
            <input
              type="number"
              value={maxTeam}
              onChange={(e) => setMaxTeam(parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
        
        <button
          onClick={handleSave}
          className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-bold shadow-lg transition"
        >
          Simpan Tetapan
        </button>
      </div>
    </div>
  );
};
