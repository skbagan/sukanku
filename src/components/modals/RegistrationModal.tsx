import React, { useState, useEffect } from 'react';
import { useSports } from '../../context/SportsContext';
import { Event, Athlete } from '../../types';
import { getDisplayHouseName } from '../../utils/calculations';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string | null;
}

export const RegistrationModal = ({ isOpen, onClose, eventId }: RegistrationModalProps) => {
  const { data, updateData } = useSports();
  const [selectedAthletes, setSelectedAthletes] = useState<Set<string>>(new Set());
  const [filterClass, setFilterClass] = useState('');
  const [filterHouse, setFilterHouse] = useState('');
  const [search, setSearch] = useState('');
  const [laneAssignments, setLaneAssignments] = useState<Record<string, number>>({});
  const [view, setView] = useState<'selection' | 'lane'>('selection');
  const [regMode, setRegMode] = useState<'individual' | 'team'>('individual');

  const event = data.events.find(e => e.id === eventId);

  useEffect(() => {
    if (event) {
      setSelectedAthletes(new Set(event.participants));
      setLaneAssignments(event.laneAssignment || {});
      
      const isRelay = /4x|kuartet|relay|berpasukan/i.test(event.name);
      if (isRelay) {
        setRegMode('team'); // Default to team for relays, though user can switch
      } else {
        setRegMode('individual');
      }
    }
  }, [event]);

  if (!isOpen || !event) return null;

  const uniqueClasses: string[] = [...new Set(data.athletes.map(a => a.class))].filter((c): c is string => !!c).sort();
  const uniqueHouses: string[] = [...new Set(data.athletes.map(a => a.house))].filter((h): h is string => !!h).sort();

  const filteredAthletes = data.athletes.filter(a => {
    if (regMode === 'individual') {
      // Strict category filter for individual events unless overridden (simplified here)
      if (event.category && a.category !== event.category) return false;
      if (event.gender && a.gender !== event.gender) return false;
    }
    
    if (filterClass && a.class !== filterClass) return false;
    if (filterHouse && a.house !== filterHouse) return false;
    if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedAthletes);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedAthletes(newSet);
  };

  const handleSave = async () => {
    const newData = { ...data };
    const evIndex = newData.events.findIndex(e => e.id === eventId);
    if (evIndex >= 0) {
      newData.events[evIndex].participants = Array.from(selectedAthletes);
      newData.events[evIndex].laneAssignment = laneAssignments;
      await updateData(newData);
      alert('Pendaftaran disimpan.');
      onClose();
    }
  };

  const isTrack = (event.type === 'track') || (!event.type && !event.name.toLowerCase().includes('lompat') && !event.name.toLowerCase().includes('lontar'));

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl border border-slate-600">
        <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-900/50 rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>📋</span> Pengurusan Peserta
            </h2>
            <p className="text-blue-400 text-sm font-medium mt-1">
              {event.code ? `[${event.code}] ` : ''}{event.name} • {event.category}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col p-6 relative">
          {view === 'selection' && (
            <div className="flex flex-col h-full">
              <div className="flex flex-wrap gap-3 mb-4">
                <select
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm outline-none text-white"
                >
                  <option value="">Semua Kelas</option>
                  {uniqueClasses.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select
                  value={filterHouse}
                  onChange={(e) => setFilterHouse(e.target.value)}
                  className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm outline-none text-white"
                >
                  <option value="">Semua Rumah</option>
                  {uniqueHouses.map(h => <option key={h} value={h}>{getDisplayHouseName(h, data.houses)}</option>)}
                </select>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari nama murid..."
                  className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm outline-none text-white"
                />
              </div>

              <div className="flex-1 overflow-y-auto bg-slate-900/50 rounded-xl border border-slate-700 p-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {filteredAthletes.map(a => (
                    <label key={a.id} className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg border border-slate-600 hover:border-blue-500 cursor-pointer transition select-none">
                      <input
                        type="checkbox"
                        checked={selectedAthletes.has(a.id)}
                        onChange={() => toggleSelection(a.id)}
                        className="w-5 h-5 rounded text-blue-600 bg-slate-700 border-slate-500 focus:ring-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">{a.name}</div>
                        <div className="text-xs text-slate-400">
                          {a.class} • {getDisplayHouseName(a.house, data.houses)} • <span className="text-yellow-500 font-bold">Kat {a.category}</span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {view === 'lane' && (
            <div className="flex flex-col h-full">
              <div className="bg-blue-900/30 p-4 rounded-lg mb-4 border border-blue-500/30">
                <h3 className="font-bold text-blue-300 mb-1">Tetapan Lorong Balapan</h3>
                <p className="text-xs text-slate-400">Sila tetapkan nombor lorong (1-8) bagi setiap atlet yang dipilih.</p>
              </div>
              <div className="flex-1 overflow-y-auto bg-slate-900/50 rounded-xl border border-slate-700 p-4 space-y-2">
                {Array.from(selectedAthletes).map((id: string) => {
                  const athlete = data.athletes.find(a => a.id === id);
                  if (!athlete) return null;
                  return (
                    <div key={id} className="flex items-center justify-between bg-slate-800 p-3 rounded-lg border border-slate-600">
                      <div>
                        <div className="font-bold text-white">{athlete.name}</div>
                        <div className="text-xs text-slate-400">{athlete.class} • {getDisplayHouseName(athlete.house, data.houses)}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">Lorong:</span>
                        <select
                          value={laneAssignments[id] || ''}
                          onChange={(e) => setLaneAssignments({ ...laneAssignments, [id]: parseInt(e.target.value) })}
                          className="bg-slate-700 text-white text-sm rounded px-2 py-1 border border-slate-500 focus:border-blue-500 outline-none w-16 text-center"
                        >
                          <option value="">-</option>
                          {[1, 2, 3, 4, 5, 6, 7, 8].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-700 bg-slate-900/50 rounded-b-2xl flex justify-between items-center">
          <span className="text-sm text-blue-300 font-bold">{selectedAthletes.size} dipilih</span>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-6 py-2 rounded-lg text-slate-300 hover:bg-slate-700 font-medium transition">
              Batal
            </button>
            {isTrack && view === 'selection' && (
              <button
                onClick={() => setView('lane')}
                className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg transition"
              >
                Seterusnya (Lorong)
              </button>
            )}
            {isTrack && view === 'lane' && (
              <button
                onClick={() => setView('selection')}
                className="px-6 py-2 rounded-lg text-slate-300 hover:bg-slate-700 font-medium transition"
              >
                Kembali
              </button>
            )}
            {(!isTrack || view === 'lane') && (
              <button
                onClick={handleSave}
                className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg transition transform active:scale-95"
              >
                💾 Simpan
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
