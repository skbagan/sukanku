import React from 'react';
import { SchoolSettings } from '../admin/SchoolSettings';
import { HouseSettings } from '../admin/HouseSettings';
import { ExternalPoints } from '../admin/ExternalPoints';
import { DataUploads } from '../admin/DataUploads';
import { RegistrationManager } from '../admin/RegistrationManager';
import { ResultEntry } from '../admin/ResultEntry';
import { PrintManager } from '../admin/PrintManager';
import { useSports } from '../../context/SportsContext';

export const AdminTab = () => {
  const { resetData, logout } = useSports();

  const handleReset = async () => {
    if (confirm('Anda yakin? Semua data akan dipadam.')) {
      try {
        await resetData();
        alert('Sistem di-reset.');
        window.location.reload();
      } catch (error) {
        console.error("Reset failed:", error);
        alert('Gagal melakukan reset data.');
      }
    }
  };

  return (
    <div>
      <SchoolSettings />
      <HouseSettings />
      <ExternalPoints />
      <DataUploads />
      <RegistrationManager />
      <ResultEntry />
      <PrintManager />

      <div className="flex justify-end items-center mt-8 pt-4 border-t border-slate-700 gap-4">
        <button onClick={handleReset} className="text-red-400 text-xs hover:text-red-300 underline">
          Reset Data Sistem
        </button>
        <button onClick={logout} className="text-slate-400 text-xs hover:text-white underline">
          Log Keluar Admin
        </button>
      </div>
    </div>
  );
};
