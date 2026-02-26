import React, { useState } from 'react';
import { useSports } from '../../context/SportsContext';
import { isFieldEvent, getDisplayHouseName } from '../../utils/calculations';

// @ts-ignore
import html2pdf from 'html2pdf.js';

export const StatusCheckModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { data } = useSports();
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState<React.ReactNode>(null);
  const [pdfFilename, setPdfFilename] = useState('dokumen.pdf');
  const [pdfOrientation, setPdfOrientation] = useState<'portrait' | 'landscape'>('portrait');

  if (!isOpen) return null;

  const sortedEvents = [...data.events].sort((a, b) => a.name.localeCompare(b.name));

  const getCategoryBadge = (cat: string) => {
    return 'bg-slate-700 text-white px-2 py-0.5 rounded text-xs';
  };

  const handlePrint = (ev: any) => {
    const participants = ev.participants
      .map((pid: string) => data.athletes.find(a => a.id === pid))
      .filter(Boolean)
      .sort((a: any, b: any) => (a!.class || '').localeCompare(b!.class || '') || a!.name.localeCompare(b!.name));

    const isField = isFieldEvent(ev);
    const isHighJump = ev.name.toLowerCase().includes('lompat tinggi');
    const laneMap = ev.laneAssignment || {};

    setPdfOrientation(isField ? 'landscape' : 'portrait');
    setPdfFilename(`Borang_Hakim_${ev.name.replace(/\s+/g, '_')}_${data.config.year}.pdf`);

    const content = (
      <div className={`pdf-page ${isField ? 'landscape' : ''} bg-white text-black p-10 relative page-break`} style={{ width: isField ? '297mm' : '210mm', minHeight: isField ? '210mm' : '297mm' }}>
        <div className="text-center border-b-2 border-black pb-2 mb-4">
          <h1 className="text-xl font-bold uppercase">{data.config.schoolName}</h1>
          <h2 className="text-sm font-semibold uppercase">BORANG HAKIM - {data.config.year}</h2>
        </div>
        <div className="flex justify-between items-center mb-4 border p-2 bg-gray-100 text-xs shadow-sm">
          <div className="w-1/4"><strong>NO. ACARA:</strong> {ev.code || '-'}</div>
          <div className="w-1/4"><strong>ACARA:</strong> <span className="uppercase font-bold text-sm">{ev.name}</span></div>
          <div className="w-1/4 text-center"><strong>KATEGORI:</strong> <span className="font-bold">{ev.category}</span></div>
          <div className="w-1/4 text-right font-bold text-gray-600 uppercase">ACARA {isField ? 'PADANG (FIELD)' : 'BALAPAN (TRACK)'}</div>
        </div>
        
        <table className={`w-full border border-black ${isField ? 'text-[10px]' : 'text-xs'}`}>
          <thead className="bg-gray-200 border-b border-black font-bold text-center">
            {!isField ? (
              <tr>
                <th className="p-2 border-r border-black w-10">BIL</th>
                <th className="p-2 border-r border-black w-16 bg-gray-300">LORONG</th>
                <th className="p-2 border-r border-black text-left pl-3">NAMA PESERTA</th>
                <th className="p-2 border-r border-black w-20">KELAS</th>
                <th className="p-2 border-r border-black w-24">RUMAH</th>
                <th className="p-2 border-r border-black w-16">KED</th>
                <th className="p-2 w-32">MASA / CATATAN</th>
              </tr>
            ) : isHighJump ? (
              <>
                <tr>
                  <th rowSpan={3} className="p-1 border-r border-black w-6">BIL</th>
                  <th rowSpan={3} className="p-1 border-r border-black w-48 text-left pl-2">NAMA PESERTA</th>
                  <th rowSpan={3} className="p-1 border-r border-black w-12">RUMAH SUKAN</th>
                  <th colSpan={15} className="p-1 border-r border-black border-b border-gray-400">KETINGGIAN LOMPATAN</th>
                  <th rowSpan={3} className="p-1 border-r border-black w-16">LOMPATAN TERBAIK</th>
                  <th rowSpan={3} className="p-1 border-r border-black w-16">KEDUDUKAN</th>
                  <th rowSpan={3} className="p-1 w-12">MATA</th>
                </tr>
                <tr>
                  {[1, 2, 3, 4, 5].map(n => (
                    <th key={n} colSpan={3} className="border-r border-gray-400 h-6"></th>
                  ))}
                </tr>
                <tr>
                  {[1, 2, 3, 4, 5].map(n => (
                    <React.Fragment key={n}>
                      <th className="border-r border-gray-400 w-6">1</th>
                      <th className="border-r border-gray-400 w-6">2</th>
                      <th className="border-r border-black w-6">3</th>
                    </React.Fragment>
                  ))}
                </tr>
              </>
            ) : (
              <>
                <tr>
                  <th rowSpan={2} className="p-1 border-r border-black w-6">BIL</th>
                  <th rowSpan={2} className="p-1 border-r border-black w-48 text-left pl-2">NAMA PESERTA</th>
                  <th rowSpan={2} className="p-1 border-r border-black w-10">KELAS</th>
                  <th rowSpan={2} className="p-1 border-r border-black w-12">RUMAH</th>
                  <th colSpan={6} className="p-1 border-r border-black border-b border-gray-400">PERCUBAAN (JARAK/TINGGI)</th>
                  <th rowSpan={2} className="p-1 border-r border-black w-8">KED</th>
                  <th rowSpan={2} className="p-1 w-16">CATATAN</th>
                </tr>
                <tr>
                  {[1, 2, 3, 4, 5, 6].map(n => (
                    <th key={n} className={`border-r ${n % 3 === 0 ? 'border-black bg-gray-300' : 'border-gray-400'} w-4`}></th>
                  ))}
                </tr>
              </>
            )}
          </thead>
          <tbody>
            {participants.length === 0 ? (
              <tr><td colSpan={isHighJump ? 21 : (isField ? 13 : 7)} className="text-center py-12 italic text-gray-400">Tiada pendaftaran peserta.</td></tr>
            ) : (
              participants.map((p: any, i: number) => (
                <tr key={p!.id} className={`border-b border-gray-300 ${isField ? 'h-8 text-[10px]' : 'h-10 text-xs'}`}>
                  <td className={`p-1 text-center border-r border-gray-300 ${!isField ? 'p-2' : ''}`}>{i + 1}</td>
                  
                  {!isField ? (
                    <>
                      <td className="p-2 text-center border-r border-gray-300 font-bold bg-gray-50 text-base">{laneMap[p!.id] || '-'}</td>
                      <td className="p-2 border-r border-gray-300 pl-3 font-semibold uppercase text-left whitespace-normal break-words leading-tight">{p!.name}</td>
                      <td className="p-2 text-center border-r border-gray-300">{p!.class || '-'}</td>
                      <td className="p-2 text-center border-r border-gray-300">{getDisplayHouseName(p!.house, data.houses)}</td>
                    </>
                  ) : (
                    <>
                      <td className="p-1 border-r border-gray-300 pl-2 font-semibold uppercase text-left whitespace-normal break-words leading-tight">{p!.name}</td>
                      {isHighJump ? (
                        <>
                          <td className="p-1 text-center border-r border-gray-300">{getDisplayHouseName(p!.house, data.houses)}</td>
                          {[1, 2, 3, 4, 5].map(n => (
                            <React.Fragment key={n}>
                              <td className="border-r border-gray-300"></td>
                              <td className="border-r border-gray-300"></td>
                              <td className="border-r border-black"></td>
                            </React.Fragment>
                          ))}
                          <td className="border-r border-gray-300"></td>
                          <td className="border-r border-gray-300"></td>
                          <td></td>
                        </>
                      ) : (
                        <>
                          <td className="p-1 text-center border-r border-gray-300">{p!.class || '-'}</td>
                          <td className="p-1 text-center border-r border-gray-300">{getDisplayHouseName(p!.house, data.houses)}</td>
                          {[1, 2, 3, 4, 5, 6].map(n => (
                            <td key={n} className={`border-r ${n % 3 === 0 ? 'border-black bg-gray-100' : 'border-gray-300'} w-4`}></td>
                          ))}
                        </>
                      )}
                    </>
                  )}
                  
                  <td className={`border-r border-gray-300 ${!isField ? 'p-2' : 'w-8'}`}></td>
                  <td className={!isField ? 'p-2' : ''}></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        <div className="mt-2 text-[9px] text-gray-500 italic">
          {!isField ? '* Sila isikan masa dalam format MM:SS.ms atau SS.ms.' : ''}
        </div>
        
        <div className="mt-12 flex justify-between text-[10px] pt-4">
          <div className="text-center w-1/4"><div className="border-b border-black mb-1 h-8"></div><div className="font-bold">TANDATANGAN HAKIM</div></div>
          <div className="text-center w-1/4"><div className="border-b border-black mb-1 h-8"></div><div className="font-bold">TANDATANGAN PENCATAT</div></div>
          <div className="text-center w-1/4"><div className="border-b border-black mb-1 h-8"></div><div className="font-bold">PENGESAHAN REFERI</div></div>
        </div>
      </div>
    );

    setPreviewContent(content);
    setShowPreview(true);
  };

  const handleDownload = () => {
    const element = document.getElementById('pdf-preview-content');
    if (!element) return;

    // Ensure element is visible for html2pdf
    element.style.display = 'block';

    const opt = {
      margin: 0,
      filename: pdfFilename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: pdfOrientation }
    };

    html2pdf().set(opt as any).from(element).save().then(() => {
       // Optional cleanup if needed
    }).catch((err: any) => {
      console.error("PDF Download Error:", err);
      alert("Gagal memuat turun PDF. Sila gunakan fungsi cetak (Ctrl+P).");
      window.print();
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-2xl w-full max-w-3xl h-[80vh] flex flex-col shadow-2xl border border-slate-600">
        <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-900/50 rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>📊</span> Semakan Status Pendaftaran
            </h2>
            <p className="text-slate-400 text-sm mt-1">Senarai acara yang telah dan belum didaftarkan.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 bg-slate-900/50">
          <div className="flex gap-4 mb-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-700 pb-2">
            <div className="flex-1">Nama Acara</div>
            <div className="w-20 text-center">Kategori</div>
            <div className="w-32 text-center">Status</div>
            <div className="w-24 text-center">Tindakan</div>
          </div>
          <div className="space-y-2">
            {sortedEvents.length === 0 ? (
              <p className="text-center text-slate-500 italic py-10">Tiada acara didaftarkan dalam sistem.</p>
            ) : (
              sortedEvents.map(ev => {
                const hasParticipants = ev.participants && ev.participants.length > 0;
                return (
                  <div key={ev.id} className="flex items-center gap-4 bg-slate-800 p-3 rounded-lg border border-slate-700 hover:bg-slate-700 transition">
                    <div className="flex-1">
                      <div className="font-bold text-white text-sm">{ev.name}</div>
                      <div className="text-[10px] text-slate-400">{ev.code || '-'}</div>
                    </div>
                    <div className="w-20 text-center">
                      <span className={getCategoryBadge(ev.category)}>{ev.category}</span>
                    </div>
                    <div className="w-32 text-center text-sm">
                      {hasParticipants ? (
                        <span className="text-green-400 font-bold tracking-wider" style={{ textShadow: '0 0 5px #22c55e' }}>SELESAI</span>
                      ) : (
                        <span className="text-red-400 font-bold tracking-wider" style={{ textShadow: '0 0 5px #ef4444' }}>BELUM DAFTAR</span>
                      )}
                    </div>
                    <div className="w-24 text-center">
                      <button
                        onClick={() => handlePrint(ev)}
                        className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded shadow transition"
                      >
                        🖨️ Borang
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        <div className="p-4 border-t border-slate-700 bg-slate-900/50 rounded-b-2xl text-right">
          <button onClick={onClose} className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg transition">
            Tutup
          </button>
        </div>
      </div>

      {showPreview && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex flex-col z-[60] transition-opacity duration-300 no-print">
          <div className="flex justify-between items-center p-4 bg-slate-900 border-b border-slate-700 text-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg"><span className="text-xl">🖨️</span></div>
              <div><h2 className="text-lg font-bold">Pratonton Cetakan</h2><p className="text-xs text-slate-400">Semak dokumen sebelum dicetak</p></div>
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
            <div id="pdf-preview-content" className="w-max">
              {previewContent}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
