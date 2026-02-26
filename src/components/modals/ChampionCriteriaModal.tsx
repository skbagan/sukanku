import React from 'react';
import { useSports } from '../../context/SportsContext';

export const ChampionCriteriaModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { data, updateData } = useSports();
  const [mainCats, setMainCats] = React.useState(data.config.championConfig.main.cats.join(', '));
  const [mainYears, setMainYears] = React.useState(data.config.championConfig.main.years.join(', '));
  const [mainMode, setMainMode] = React.useState(data.config.championConfig.main.mode);
  const [hopeCats, setHopeCats] = React.useState(data.config.championConfig.hope.cats.join(', '));
  const [hopeYears, setHopeYears] = React.useState(data.config.championConfig.hope.years.join(', '));
  const [hopeMode, setHopeMode] = React.useState(data.config.championConfig.hope.mode);

  if (!isOpen) return null;

  const handleSave = async () => {
    const newData = { ...data };
    newData.config.championConfig = {
      main: {
        cats: mainCats.split(',').map(s => s.trim().toUpperCase()).filter(Boolean),
        years: mainYears.split(',').map(s => s.trim()).filter(Boolean),
        mode: mainMode
      },
      hope: {
        cats: hopeCats.split(',').map(s => s.trim().toUpperCase()).filter(Boolean),
        years: hopeYears.split(',').map(s => s.trim()).filter(Boolean),
        mode: hopeMode
      }
    };
    await updateData(newData);
    alert('Kriteria Anugerah disimpan!');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg text-gray-800 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
        <h2 className="text-xl font-bold mb-1 flex items-center gap-2">🏆 Kriteria Anugerah</h2>
        <p className="text-xs text-gray-500 mb-6">Tetapkan syarat pemilihan pemenang.</p>
        
        {/* Olahragawan Settings */}
        <div className="border rounded-xl p-4 mb-4 bg-yellow-50/50 border-yellow-100">
          <h3 className="font-bold text-yellow-700 text-sm mb-3">Olahragawan / Olahragawati</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Kategori Dibenarkan</label>
              <input
                type="text"
                value={mainCats}
                onChange={(e) => setMainCats(e.target.value)}
                placeholder="Cth: A, B, L18, P18"
                className="w-full border rounded p-2 uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Tahun Dibenarkan</label>
              <input
                type="text"
                value={mainYears}
                onChange={(e) => setMainYears(e.target.value)}
                placeholder="Cth: 5, 6"
                className="w-full border rounded p-2"
              />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-4">
            <label className="text-xs font-bold text-gray-500">Syarat Gabungan:</label>
            <div className="flex gap-2">
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="crit-main-mode"
                  checked={mainMode === 'OR'}
                  onChange={() => setMainMode('OR')}
                  className="text-yellow-600"
                />
                <span className="text-xs">ATAU (Salah satu)</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="crit-main-mode"
                  checked={mainMode === 'AND'}
                  onChange={() => setMainMode('AND')}
                  className="text-yellow-600"
                />
                <span className="text-xs">DAN (Mesti kedua-dua)</span>
              </label>
            </div>
          </div>
          <p className="text-[10px] text-gray-400 mt-2 italic">Masukkan kod kategori dipisahkan dengan koma (contoh: L18, P18).</p>
        </div>

        {/* Harapan Settings */}
        <div className="border rounded-xl p-4 mb-4 bg-purple-50/50 border-purple-100">
          <h3 className="font-bold text-purple-700 text-sm mb-3">Atlet Harapan (Lelaki & Perempuan)</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Kategori Dibenarkan</label>
              <input
                type="text"
                value={hopeCats}
                onChange={(e) => setHopeCats(e.target.value)}
                placeholder="Cth: C, D, L12, P12"
                className="w-full border rounded p-2 uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Tahun Dibenarkan</label>
              <input
                type="text"
                value={hopeYears}
                onChange={(e) => setHopeYears(e.target.value)}
                placeholder="Cth: 3, 4"
                className="w-full border rounded p-2"
              />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-4">
            <label className="text-xs font-bold text-gray-500">Syarat Gabungan:</label>
            <div className="flex gap-2">
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="crit-hope-mode"
                  checked={hopeMode === 'OR'}
                  onChange={() => setHopeMode('OR')}
                  className="text-purple-600"
                />
                <span className="text-xs">ATAU</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="crit-hope-mode"
                  checked={hopeMode === 'AND'}
                  onChange={() => setHopeMode('AND')}
                  className="text-purple-600"
                />
                <span className="text-xs">DAN</span>
              </label>
            </div>
          </div>
          <p className="text-[10px] text-gray-400 mt-2 italic">Masukkan kod kategori dipisahkan dengan koma (contoh: L12, P12).</p>
        </div>
        
        <button
          onClick={handleSave}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold shadow-lg transition"
        >
          Simpan Kriteria
        </button>
      </div>
    </div>
  );
};
