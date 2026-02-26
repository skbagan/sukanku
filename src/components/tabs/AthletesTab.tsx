import React, { useState } from 'react';
import { useSports } from '../../context/SportsContext';
import { getDisplayHouseName } from '../../utils/calculations';

export const AthletesTab = () => {
  const { data } = useSports();
  const [filterClass, setFilterClass] = useState('');
  const [filterGender, setFilterGender] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [search, setSearch] = useState('');

  const uniqueClasses = [...new Set(data.athletes.map(a => a.class))].filter(Boolean).sort();
  const uniqueCategories = [...new Set(data.athletes.map(a => a.category))].filter(Boolean).sort();

  const filteredAthletes = data.athletes.filter(a =>
    (filterGender === '' || a.gender === filterGender) &&
    (filterCategory === '' || a.category === filterCategory) &&
    (filterClass === '' || a.class === filterClass) &&
    (a.name.toLowerCase().includes(search.toLowerCase()))
  );

  const getCategoryBadge = (cat: string) => {
    // Simplified badge logic
    return 'bg-slate-700 text-white px-2 py-0.5 rounded text-xs';
  };

  return (
    <div className="bg-slate-800/50 rounded-2xl p-6 backdrop-blur-sm border border-slate-700">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">🏃 Senarai Atlet</h2>
        <div className="flex flex-wrap gap-2">
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm outline-none text-white"
          >
            <option value="">Semua Kelas</option>
            {uniqueClasses.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value)}
            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm outline-none text-white"
          >
            <option value="">Semua Jantina</option>
            <option value="L">Lelaki</option>
            <option value="P">Perempuan</option>
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm outline-none text-white"
          >
            <option value="">Semua Kategori</option>
            {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama..."
            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm w-40 outline-none text-white"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto pr-2">
        {filteredAthletes.length === 0 ? (
          <div className="col-span-full text-center py-10 text-slate-500">Tiada atlet dijumpai.</div>
        ) : (
          filteredAthletes.map(a => {
            const taggedEventIds = (data.events || []).filter(e => (e.participants || []).includes(a.id.toString()));
            const eventNames = taggedEventIds.map(e => e.name).join(', ') || '-';
            
            return (
              <div key={a.id} className="bg-slate-800 p-3 rounded-xl border border-slate-700 flex flex-col gap-2 hover:bg-slate-700 transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-lg shadow-inner">
                    {a.gender === 'L' ? '👨' : '👩'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{a.name}</p>
                    <p className="text-xs text-slate-400">
                      {getDisplayHouseName(a.house, data.houses)} • {a.class || '-'} • Kat {a.category}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="block font-bold text-blue-400">{a.points} mt</span>
                    <span className="text-[10px] text-slate-500">
                      {a.medals.gold}E {a.medals.silver}P {a.medals.bronze}G
                    </span>
                  </div>
                </div>
                <div className="mt-1 pt-2 border-t border-slate-600">
                  <p className="text-[10px] text-slate-300 font-bold">Acara:</p>
                  <p className="text-[10px] text-slate-400 italic leading-tight">{eventNames}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
