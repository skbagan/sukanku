import React, { useState } from 'react';
import { useSports } from '../../context/SportsContext';
import { getDisplayHouseName } from '../../utils/calculations';

// @ts-ignore
import html2pdf from 'html2pdf.js';

export const ResultEntry = () => {
  const { data, updateData } = useSports();
  const [selectedEventId, setSelectedEventId] = useState('');
  const [stage, setStage] = useState<'Saringan' | 'Akhir' | ''>('');
  const [results, setResults] = useState<{ id: string; rank: string; value: string }[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState<React.ReactNode>(null);

  const sortedEvents = [...data.events].sort((a, b) => {
    const codeA = a.code ? String(a.code) : '';
    const codeB = b.code ? String(b.code) : '';
    return codeA.localeCompare(codeB, undefined, { numeric: true }) || a.name.localeCompare(b.name);
  });

  const event = data.events.find(e => e.id === selectedEventId);

  const handleEventChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedEventId(e.target.value);
    setStage('');
    setResults([]);
  };

  const handleStageChange = (val: 'Saringan' | 'Akhir') => {
    setStage(val);
    if (event) {
      const participants = event.participants.map(pid => {
        const athlete = data.athletes.find(a => a.id === pid);
        return athlete ? { id: athlete.id, rank: '', value: '' } : null;
      }).filter(Boolean) as { id: string; rank: string; value: string }[];
      setResults(participants);
    }
  };

  const handleResultChange = (id: string, field: 'rank' | 'value', val: string) => {
    setResults(prev => prev.map(r => r.id === id ? { ...r, [field]: val } : r));
  };

  const handlePrintOfficial = (targetEvent?: any, targetStage: 'Saringan' | 'Akhir' = 'Akhir') => {
    const ev = targetEvent || event;
    if (!ev) return;

    // Use results from state if current event, otherwise reconstruct from event data
    let rankedResults: any[] = [];
    
    if (ev.id === selectedEventId && results.length > 0 && stage === targetStage) {
        rankedResults = results
          .filter(r => r.rank)
          .sort((a, b) => parseInt(a.rank) - parseInt(b.rank));
    } else {
        if (targetStage === 'Akhir' && ev.result && ev.result.winners) {
            rankedResults = ev.result.winners.map((w: any) => ({
                id: w.id,
                rank: w.rank,
                value: w.result || '-'
            })).sort((a: any, b: any) => parseInt(a.rank) - parseInt(b.rank));
        } else if (targetStage === 'Saringan' && ev.result && ev.result.heats) {
            // Flatten heats results
             rankedResults = ev.result.heats.flatMap((h: any) => 
                h.participants.map((p: any) => ({
                    id: p.id,
                    rank: p.rank,
                    value: p.result || '-',
                    heat: h.heatNo
                }))
             )
             .filter((r: any) => r.rank)
             .sort((a: any, b: any) => {
                 // Sort by rank, then by heat if needed
                 const rankA = parseInt(a.rank);
                 const rankB = parseInt(b.rank);
                 return rankA - rankB;
             });
        }
    }

    if (rankedResults.length === 0) {
      alert(`Tiada keputusan ${targetStage} untuk dicetak.`);
      return;
    }

    const content = (
      <div className="pdf-page bg-white text-black p-10 relative page-break" style={{ width: '210mm', minHeight: '297mm' }}>
        <div className="text-center border-b-2 border-black pb-2 mb-6">
          <h1 className="text-xl font-bold uppercase">{data.config.schoolName}</h1>
          <h2 className="text-lg font-bold uppercase">KEPUTUSAN RASMI - {data.config.year}</h2>
        </div>
        
        <div className="mb-6 border p-4 bg-gray-50 text-sm shadow-sm rounded">
          <div className="grid grid-cols-2 gap-4">
            <div><strong>NO. ACARA:</strong> {ev.code || '-'}</div>
            <div><strong>ACARA:</strong> <span className="uppercase font-bold">{ev.name}</span></div>
            <div><strong>KATEGORI:</strong> <span className="bg-black text-white px-2 py-0.5 rounded text-xs">{ev.category}</span></div>
            <div><strong>PERINGKAT:</strong> <span className="uppercase font-bold">{targetStage.toUpperCase()}</span></div>
          </div>
        </div>

        <table className="w-full border border-black text-sm mb-8">
          <thead className="bg-gray-200 border-b border-black font-bold">
            <tr>
              <th className="p-3 border-r border-black w-16 text-center">KED</th>
              <th className="p-3 border-r border-black text-left pl-4">NAMA PESERTA</th>
              <th className="p-3 border-r border-black w-24 text-center">KELAS</th>
              <th className="p-3 border-r border-black w-32 text-center">RUMAH</th>
              <th className="p-3 w-32 text-center">CATATAN</th>
            </tr>
          </thead>
          <tbody>
            {rankedResults.map((r) => {
              const athlete = data.athletes.find(a => a.id === r.id);
              return (
                <tr key={r.id} className="border-b border-gray-300">
                  <td className="p-3 text-center border-r border-gray-300 font-bold text-lg">{r.rank}</td>
                  <td className="p-3 border-r border-gray-300 pl-4 font-semibold uppercase whitespace-normal break-words leading-tight">
                      {athlete?.name}
                      {r.heat && <span className="text-xs text-gray-500 block ml-1">(Saringan {r.heat})</span>}
                  </td>
                  <td className="p-3 text-center border-r border-gray-300">{athlete?.class}</td>
                  <td className="p-3 text-center border-r border-gray-300">{getDisplayHouseName(athlete?.house || '', data.houses)}</td>
                  <td className="p-3 text-center font-mono">{r.value || '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="mt-12 flex justify-between text-xs pt-8">
          <div className="text-center w-1/3 px-4">
            <div className="border-b border-black mb-2 h-16"></div>
            <div className="font-bold">TANDATANGAN HAKIM</div>
          </div>
          <div className="text-center w-1/3 px-4">
            <div className="border-b border-black mb-2 h-16"></div>
            <div className="font-bold">PENGESAHAN REFERI</div>
          </div>
        </div>
        
        <div className="absolute bottom-10 left-10 text-[10px] text-gray-400">
          Dicetak pada: {new Date().toLocaleString('ms-MY')}
        </div>
      </div>
    );

    setPreviewContent(content);
    setShowPreview(true);
  };

  const handleDownload = () => {
    const element = document.getElementById('pdf-result-preview');
    if (!element) return;
    
    // Ensure element is visible
    element.style.display = 'block';

    const opt = {
      margin: 0,
      filename: `Keputusan_Rasmi_${event?.code || ''}_${event?.name.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt as any).from(element).save().then(() => {
        // cleanup
    }).catch((err: any) => {
      console.error("PDF Download Error:", err);
      alert("Gagal memuat turun PDF.");
      window.print();
    });
  };

  const handleSubmit = async () => {
    if (!event || !stage) return;

    const winners = results
      .filter(r => r.rank)
      .map(r => {
        const athlete = data.athletes.find(a => a.id === r.id);
        return {
          id: r.id,
          name: athlete?.name || '',
          house: getDisplayHouseName(athlete?.house || '', data.houses),
          rank: r.rank,
          value: r.value
        };
      });

    if (winners.length === 0) {
      alert('Sila pilih sekurang-kurangnya seorang pemenang.');
      return;
    }

    const newData = { ...data };
    
    // Update medals/points if Final
    if (stage === 'Akhir') {
      winners.forEach(w => {
        const athleteIndex = newData.athletes.findIndex(a => a.id === w.id);
        if (athleteIndex >= 0) {
          const rank = parseInt(w.rank);
          if (rank === 1) {
            newData.athletes[athleteIndex].medals.gold++;
            newData.athletes[athleteIndex].points += newData.pointsConfig.gold;
          } else if (rank === 2) {
            newData.athletes[athleteIndex].medals.silver++;
            newData.athletes[athleteIndex].points += newData.pointsConfig.silver;
          } else if (rank === 3) {
            newData.athletes[athleteIndex].medals.bronze++;
            newData.athletes[athleteIndex].points += newData.pointsConfig.bronze;
          } else if (rank === 4) {
            newData.athletes[athleteIndex].points += newData.pointsConfig.fourth;
          }
        }
      });

      const evIndex = newData.events.findIndex(e => e.id === event.id);
      if (evIndex >= 0) {
        newData.events[evIndex].status = 'completed';
        newData.events[evIndex].result = { winners };
      }
    }

    // Add to Log
    newData.resultsLog.push({
      eventId: event.id,
      eventName: event.name,
      stage: stage,
      winners: winners,
      timestamp: new Date().toISOString()
    });

    await updateData(newData);
    alert('Keputusan berjaya disimpan!');
    setSelectedEventId('');
    setStage('');
    setResults([]);
  };

  return (
    <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 mb-6">
      <h3 className="text-lg font-bold mb-4 text-blue-400">🏅 Rekod Keputusan</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-400 mb-1">1. Pilih Acara</label>
          <select
            value={selectedEventId}
            onChange={handleEventChange}
            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 outline-none text-white"
          >
            <option value="">Pilih Acara...</option>
            {sortedEvents.map(e => (
              <option key={e.id} value={e.id}>
                {e.code ? `[${e.code}] ` : ''}{e.name} ({e.category})
              </option>
            ))}
          </select>
        </div>

        {selectedEventId && (
          <div className="animate-fade-in">
            <label className="block text-xs font-bold text-slate-400 mb-2">2. Peringkat</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer bg-slate-700 px-4 py-2 rounded-lg hover:bg-slate-600">
                <input
                  type="radio"
                  name="result-stage"
                  checked={stage === 'Saringan'}
                  onChange={() => handleStageChange('Saringan')}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm">Saringan</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer bg-slate-700 px-4 py-2 rounded-lg hover:bg-slate-600">
                <input
                  type="radio"
                  name="result-stage"
                  checked={stage === 'Akhir'}
                  onChange={() => handleStageChange('Akhir')}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm font-bold text-yellow-400">Akhir (Kira Mata)</span>
              </label>
            </div>
          </div>
        )}

        {stage && (
          <div className="mt-4 animate-fade-in">
            <label className="block text-xs font-bold text-slate-400 mb-2">3. Masukkan Keputusan (Tanda pemenang & isi masa)</label>
            <div className="bg-slate-900 rounded-lg border border-slate-600 overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-700 text-slate-300">
                  <tr>
                    <th className="p-3">Nama Atlet</th>
                    <th className="p-3 w-32">Kedudukan</th>
                    <th className="p-3 w-40">Catatan (Masa/Jarak)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-600">
                  {results.map((r) => {
                    const athlete = data.athletes.find(a => a.id === r.id);
                    if (!athlete) return null;
                    return (
                      <tr key={r.id} className="hover:bg-slate-800">
                        <td className="p-3 border-b border-slate-700">
                          <div className="font-bold text-white">{athlete.name}</div>
                          <div className="text-xs text-slate-400">
                            {athlete.class} • {getDisplayHouseName(athlete.house, data.houses)}
                          </div>
                        </td>
                        <td className="p-3 border-b border-slate-700">
                          <select
                            value={r.rank}
                            onChange={(e) => handleResultChange(r.id, 'rank', e.target.value)}
                            className="w-full bg-slate-800 border border-slate-600 rounded p-1 text-sm text-white"
                          >
                            <option value="">-</option>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => <option key={n} value={n}>{n}</option>)}
                          </select>
                        </td>
                        <td className="p-3 border-b border-slate-700">
                          <input
                            type="text"
                            value={r.value}
                            onChange={(e) => handleResultChange(r.id, 'value', e.target.value)}
                            className="w-full bg-slate-800 border border-slate-600 rounded p-1 text-sm text-white"
                            placeholder="Masa/Jarak"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-2 text-[10px] text-slate-400">
              *Sistem Pemarkahan: Emas={data.pointsConfig.gold}, Perak={data.pointsConfig.silver}, Gangsa={data.pointsConfig.bronze}, Keempat={data.pointsConfig.fourth}
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleSubmit}
                className="w-full bg-green-600 hover:bg-green-500 text-white py-3 rounded-lg font-bold shadow-lg"
              >
                Simpan Keputusan
              </button>
            </div>
          </div>
        )}

        {/* List of Completed Events */}
        <div className="mt-8 border-t border-slate-700 pt-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span>✅</span> Acara Selesai
          </h3>
          <div className="space-y-2">
            {sortedEvents.filter(e => e.status === 'completed' || (e.result && e.result.winners && e.result.winners.length > 0) || (e.result && e.result.heats && e.result.heats.length > 0)).length === 0 ? (
              <p className="text-slate-500 italic text-sm">Tiada acara yang telah selesai.</p>
            ) : (
              sortedEvents
                .filter(e => e.status === 'completed' || (e.result && e.result.winners && e.result.winners.length > 0) || (e.result && e.result.heats && e.result.heats.length > 0))
                .map(ev => {
                  const hasFinals = ev.status === 'completed' || (ev.result && ev.result.winners && ev.result.winners.length > 0);
                  const hasHeats = ev.result && ev.result.heats && ev.result.heats.length > 0;

                  return (
                    <div key={ev.id} className="flex items-center justify-between bg-slate-800 p-3 rounded-lg border border-slate-700 hover:bg-slate-700 transition">
                      <div>
                        <div className="font-bold text-white text-sm">{ev.name}</div>
                        <div className="text-[10px] text-slate-400">{ev.code || '-'} • {ev.category}</div>
                      </div>
                      <div className="flex gap-2">
                        {hasHeats && (
                          <button
                            onClick={() => handlePrintOfficial(ev, 'Saringan')}
                            className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded text-xs font-bold shadow flex items-center gap-1"
                          >
                            <span>🖨️</span> Saringan
                          </button>
                        )}
                        {hasFinals && (
                          <button
                            onClick={() => handlePrintOfficial(ev, 'Akhir')}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded text-xs font-bold shadow flex items-center gap-1"
                          >
                            <span>🖨️</span> Akhir
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>

      {showPreview && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex flex-col z-[60] transition-opacity duration-300 no-print">
          <div className="flex justify-between items-center p-4 bg-slate-900 border-b border-slate-700 text-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg"><span className="text-xl">🖨️</span></div>
              <div><h2 className="text-lg font-bold">Pratonton Keputusan Rasmi</h2><p className="text-xs text-slate-400">Semak dokumen sebelum dicetak</p></div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleDownload} className="bg-green-600 hover:bg-green-500 text-white px-5 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg transition hover:scale-105">
                🖨️ Cetak / Simpan PDF
              </button>
              <button onClick={() => setShowPreview(false)} className="bg-slate-700 hover:bg-slate-600 text-white px-5 py-2 rounded-lg font-bold text-sm transition">
                Tutup
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-8 bg-gray-500/50 flex justify-center">
            <div id="pdf-result-preview" className="w-max">
              {previewContent}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
