import React, { useState } from 'react';
import { useSports } from '../../context/SportsContext';
import { RegistrationModal } from '../modals/RegistrationModal';
import { StatusCheckModal } from '../modals/StatusCheckModal';

export const RegistrationManager = () => {
  const { data } = useSports();
  const [selectedEventId, setSelectedEventId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const sortedEvents = [...data.events].sort((a, b) => {
    const codeA = a.code ? String(a.code) : '';
    const codeB = b.code ? String(b.code) : '';
    return codeA.localeCompare(codeB, undefined, { numeric: true }) || a.name.localeCompare(b.name);
  });

  const handleOpenModal = () => {
    if (selectedEventId) {
      setIsModalOpen(true);
    } else {
      alert('Sila pilih acara dahulu.');
    }
  };

  return (
    <div className="bg-slate-800/50 rounded-2xl p-6 backdrop-blur-sm border border-slate-700 mb-6">
      <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
        <h3 className="text-lg font-bold flex items-center gap-2">📋 Daftar & Edit Peserta Acara</h3>
        <button
          onClick={() => setIsStatusModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-500 rounded-lg text-sm font-bold text-white transition shadow-lg group"
        >
          <span>🔍</span> Semakan Status
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse group-hover:bg-green-400"></span>
        </button>
      </div>
      <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-600 text-center">
        <label className="block text-slate-300 font-medium mb-3">Pilih Acara untuk Menguruskan Pendaftaran:</label>
        <div className="max-w-md mx-auto flex gap-2">
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full bg-slate-800 border border-slate-500 rounded-xl px-4 py-3 text-base outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer hover:bg-slate-700 text-white"
          >
            <option value="">-- Sila Pilih Acara --</option>
            {sortedEvents.map(e => (
              <option key={e.id} value={e.id}>
                {e.code ? `[${e.code}] ` : ''}{e.name} ({e.category})
              </option>
            ))}
          </select>
          <button
            onClick={handleOpenModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold transition"
          >
            Buka
          </button>
        </div>
      </div>

      {isModalOpen && (
        <RegistrationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          eventId={selectedEventId}
        />
      )}

      <StatusCheckModal isOpen={isStatusModalOpen} onClose={() => setIsStatusModalOpen(false)} />
    </div>
  );
};
