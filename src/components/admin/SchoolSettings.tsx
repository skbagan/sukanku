import React, { useState } from 'react';
import { useSports } from '../../context/SportsContext';

export const SchoolSettings = () => {
  const { data, updateData } = useSports();
  const [schoolName, setSchoolName] = useState(data.config.schoolName);
  const [year, setYear] = useState(data.config.year);

  const handleSave = async () => {
    const newData = { ...data };
    newData.config.schoolName = schoolName;
    newData.config.year = year;
    await updateData(newData);
    alert('Tetapan disimpan.');
  };

  return (
    <div className="bg-slate-800/50 rounded-2xl p-6 backdrop-blur-sm border border-slate-700 mb-6">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">🏫 Tetapan Sekolah</h3>
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nama Sekolah</label>
          <input
            type="text"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tahun</label>
          <input
            type="text"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white"
          />
        </div>
      </div>
      <button
        onClick={handleSave}
        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-bold transition"
      >
        💾 Simpan Tetapan
      </button>
    </div>
  );
};
