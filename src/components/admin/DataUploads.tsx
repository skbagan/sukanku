import React, { useRef } from 'react';
import * as XLSX from 'xlsx';
import { useSports } from '../../context/SportsContext';
import { Athlete, Event, ScheduleItem } from '../../types';

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${Math.random().toString(36).substr(2, 9)}`;
};

export const DataUploads = () => {
  const { data, updateData } = useSports();
  const studentFileInput = useRef<HTMLInputElement>(null);
  const eventFileInput = useRef<HTMLInputElement>(null);
  const scheduleFileInput = useRef<HTMLInputElement>(null);

  const handleStudentUpload = async () => {
    const file = studentFileInput.current?.files?.[0];
    if (!file) return alert('Sila pilih fail!');

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const binaryStr = e.target?.result;
        const workbook = XLSX.read(binaryStr, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        let count = 0;
        let updatedCount = 0;
        
        // Create a map of existing athletes for quick lookup by name+class
        const athleteMap = new Map();
        data.athletes.forEach(a => {
            const key = `${a.name.toLowerCase().trim()}|${a.class.toLowerCase().trim()}`;
            athleteMap.set(key, a);
        });

        jsonData.forEach((row: any) => {
          const name = String(row['NAMA'] || '').trim();
          const className = String(row['KELAS'] || '').trim();
          if (!name) return;

          const key = `${name.toLowerCase()}|${className.toLowerCase()}`;
          
          const houseRaw = row['RUMAH SUKAN'];
          const houseFormatted = houseRaw ? String(houseRaw).trim() : 'Tidak Diketahui';
          
          const athleteData: Partial<Athlete> = {
            name,
            class: className,
            gender: String(row['JANTINA']).toUpperCase().startsWith('L') ? 'L' : 'P',
            house: houseFormatted,
            category: row['KATEGORI'] ? String(row['KATEGORI']).toUpperCase().trim() : 'A',
          };

          if (athleteMap.has(key)) {
            // Overwrite existing athlete data but keep ID and stats
            const existing = athleteMap.get(key);
            athleteMap.set(key, { ...existing, ...athleteData });
            updatedCount++;
          } else {
            // Add new athlete
            athleteMap.set(key, {
              id: generateId(),
              ...athleteData as Athlete,
              medals: { gold: 0, silver: 0, bronze: 0 },
              points: 0,
            });
            count++;
          }
        });

        const newAthletes = Array.from(athleteMap.values());
        await updateData({ ...data, athletes: newAthletes });
        alert(`${count} murid baru, ${updatedCount} dikemaskini.`);
        if (studentFileInput.current) studentFileInput.current.value = '';
      } catch (err) {
        console.error(err);
        alert('Gagal memproses fail.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleEventUpload = async () => {
    const file = eventFileInput.current?.files?.[0];
    if (!file) return alert('Sila pilih fail!');

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const binaryStr = e.target?.result;
        const workbook = XLSX.read(binaryStr, { type: 'array' });
        const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1 }) as any[][];

        let count = 0;
        let updatedCount = 0;
        
        // Map existing events by code for overwrite logic
        const eventMap = new Map();
        data.events.forEach(e => {
            if (e.code) eventMap.set(e.code.toString().trim(), e);
        });

        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (!row || !row[0]) continue;

          const code = row[0] ? String(row[0]).trim() : '';
          const eventName = row[1] ? String(row[1]).trim() : '';
          const categoryRaw = row[2] ? String(row[2]).trim() : '';
          
          let gender: 'L' | 'P' = 'L';
          if (eventName.toUpperCase().includes('PEREMPUAN') || eventName.toUpperCase().includes('WANITA') || (categoryRaw && categoryRaw.toUpperCase().startsWith('P'))) {
            gender = 'P';
          }

          let eventType: 'track' | 'field' = 'track';
          if (eventName.toUpperCase().includes('LOMPAT') || eventName.toUpperCase().includes('LONTAR') || eventName.toUpperCase().includes('REJAM')) {
            eventType = 'field';
          }

          const newEventData = {
            code,
            name: eventName,
            category: categoryRaw,
            gender,
            type: eventType,
          };

          if (eventMap.has(code)) {
              // Overwrite existing event details but preserve ID, status, result, participants
              const existing = eventMap.get(code);
              eventMap.set(code, { ...existing, ...newEventData });
              updatedCount++;
          } else {
              // Add new event
              eventMap.set(code, {
                id: generateId(),
                ...newEventData,
                status: 'upcoming',
                result: null,
                participants: [],
                laneAssignment: {},
              });
              count++;
          }
        }

        const newEvents = Array.from(eventMap.values());
        await updateData({ ...data, events: newEvents });
        alert(`${count} acara ditambah, ${updatedCount} dikemaskini.`);
        if (eventFileInput.current) eventFileInput.current.value = '';
      } catch (err) {
        console.error(err);
        alert('Gagal memproses fail.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleScheduleUpload = async () => {
    const file = scheduleFileInput.current?.files?.[0];
    if (!file) return alert('Sila pilih fail!');

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const binaryStr = e.target?.result;
        const workbook = XLSX.read(binaryStr, { type: 'array' });
        const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1 }) as any[][];

        let count = 0;
        const newSchedule: ScheduleItem[] = [];

        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (!row || row.length === 0) continue;

          const time = row[0] ? String(row[0]).trim() : '';
          const event = row[1] ? String(row[1]).trim() : '';

          if (event) {
            newSchedule.push({
              id: generateId(),
              time,
              event,
              category: row[2] ? String(row[2]).trim() : '',
              venue: row[3] ? String(row[3]).trim() : '',
            });
            count++;
          }
        }

        await updateData({ ...data, scheduleItems: newSchedule });
        alert(`${count} jadual berjaya dimuat naik!`);
        if (scheduleFileInput.current) scheduleFileInput.current.value = '';
      } catch (err) {
        console.error(err);
        alert('Gagal memproses fail.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6 mb-6">
      {/* Student Upload */}
      <div className="bg-slate-800/50 rounded-2xl p-6 backdrop-blur-sm border border-slate-700">
        <h3 className="text-lg font-bold mb-2 flex items-center gap-2">👥 Muat Naik Murid</h3>
        <input
          type="file"
          ref={studentFileInput}
          accept=".xlsx,.xls,.csv"
          className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 mb-3"
        />
        <button
          onClick={handleStudentUpload}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-bold"
        >
          Muat Naik Data
        </button>
      </div>

      {/* Event Upload */}
      <div className="bg-slate-800/50 rounded-2xl p-6 backdrop-blur-sm border border-slate-700">
        <h3 className="text-lg font-bold mb-2 flex items-center gap-2">📅 Muat Naik Acara</h3>
        <input
          type="file"
          ref={eventFileInput}
          accept=".xlsx,.xls,.csv"
          className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 mb-3"
        />
        <button
          onClick={handleEventUpload}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-bold"
        >
          Muat Naik Data
        </button>
      </div>

      {/* Schedule Upload */}
      <div className="bg-slate-800/50 rounded-2xl p-6 backdrop-blur-sm border border-slate-700">
        <h3 className="text-lg font-bold mb-2 flex items-center gap-2">🕒 Muat Naik Jadual</h3>
        <input
          type="file"
          ref={scheduleFileInput}
          accept=".xlsx,.xls,.csv"
          className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-600 file:text-white hover:file:bg-orange-700 mb-3"
        />
        <button
          onClick={handleScheduleUpload}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-bold"
        >
          Muat Naik Data
        </button>
      </div>
    </div>
  );
};
