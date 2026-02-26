import React, { useState } from 'react';
import { useSports } from '../../context/SportsContext';
import { isFieldEvent, getDisplayHouseName } from '../../utils/calculations';

// @ts-ignore
import html2pdf from 'html2pdf.js';

export const PrintManager = () => {
  const { data } = useSports();
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState<React.ReactNode>(null);
  const [pdfFilename, setPdfFilename] = useState('dokumen.pdf');
  const [pdfOrientation, setPdfOrientation] = useState<'portrait' | 'landscape'>('portrait');

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

  const printTrackForms = () => {
    const trackEvents = data.events.filter(e => !isFieldEvent(e));
    if (trackEvents.length === 0) {
      alert("Tiada acara Balapan ditemui.");
      return;
    }
    trackEvents.sort((a, b) => {
        const codeA = a.code ? String(a.code) : '';
        const codeB = b.code ? String(b.code) : '';
        return codeA.localeCompare(codeB, undefined, { numeric: true }) || a.name.localeCompare(b.name);
    });
    
    setPdfFilename(`Borang_Hakim_Balapan_${data.config.year}.pdf`);
    setPdfOrientation('portrait');
    
    const content = (
      <>
        {trackEvents.map((ev, index) => {
          const participants = ev.participants
            .map(pid => data.athletes.find(a => a.id === pid))
            .filter(Boolean)
            .sort((a, b) => (a!.class || '').localeCompare(b!.class || '') || a!.name.localeCompare(b!.name));
            
          const laneMap = ev.laneAssignment || {};

          return (
            <div key={ev.id} className="pdf-page bg-white text-black p-10 relative page-break" style={{ width: '210mm', minHeight: '297mm' }}>
              <div className="text-center border-b-2 border-black pb-2 mb-4">
                <h1 className="text-xl font-bold uppercase">{data.config.schoolName}</h1>
                <h2 className="text-sm font-semibold uppercase">BORANG HAKIM - {data.config.year}</h2>
              </div>
              <div className="flex justify-between items-center mb-4 border p-2 bg-gray-100 text-xs shadow-sm">
                <div className="w-1/4"><strong>NO. ACARA:</strong> {ev.code || '-'}</div>
                <div className="w-1/4"><strong>ACARA:</strong> <span className="uppercase font-bold text-sm">{ev.name}</span></div>
                <div className="w-1/4 text-center"><strong>KATEGORI:</strong> <span className="font-bold">{ev.category}</span></div>
                <div className="w-1/4 text-right font-bold text-gray-600 uppercase">ACARA BALAPAN (TRACK)</div>
              </div>
              
              <table className="w-full border border-black text-xs">
                <thead className="bg-gray-200 border-b border-black font-bold">
                  <tr>
                    <th className="p-2 border-r border-black w-10">BIL</th>
                    <th className="p-2 border-r border-black w-16 bg-gray-300">LORONG</th>
                    <th className="p-2 border-r border-black text-left pl-3">NAMA PESERTA</th>
                    <th className="p-2 border-r border-black w-20">KELAS</th>
                    <th className="p-2 border-r border-black w-24">RUMAH</th>
                    <th className="p-2 border-r border-black w-16">KED</th>
                    <th className="p-2 w-32">MASA / CATATAN</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-12 italic text-gray-400">Tiada pendaftaran peserta.</td></tr>
                  ) : (
                    participants.map((p, i) => (
                      <tr key={p!.id} className="border-b border-gray-300 h-10 text-xs">
                        <td className="p-2 text-center border-r border-gray-300">{i + 1}</td>
                        <td className="p-2 text-center border-r border-gray-300 font-bold bg-gray-50 text-base">{laneMap[p!.id] || '-'}</td>
                        <td className="p-2 border-r border-gray-300 pl-3 font-semibold uppercase text-left whitespace-normal break-words leading-tight">{p!.name}</td>
                        <td className="p-2 text-center border-r border-gray-300">{p!.class || '-'}</td>
                        <td className="p-2 text-center border-r border-gray-300">{getDisplayHouseName(p!.house, data.houses)}</td>
                        <td className="p-2 text-center border-r border-gray-300"></td>
                        <td className="p-2 text-center"></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              
              <div className="mt-2 text-[9px] text-gray-500 italic">* Sila isikan masa dalam format MM:SS.ms atau SS.ms.</div>
              
              <div className="mt-12 flex justify-between text-[10px] pt-4">
                <div className="text-center w-1/4"><div className="border-b border-black mb-1 h-8"></div><div className="font-bold">TANDATANGAN HAKIM</div></div>
                <div className="text-center w-1/4"><div className="border-b border-black mb-1 h-8"></div><div className="font-bold">TANDATANGAN PENCATAT</div></div>
                <div className="text-center w-1/4"><div className="border-b border-black mb-1 h-8"></div><div className="font-bold">PENGESAHAN REFERI</div></div>
              </div>
            </div>
          );
        })}
      </>
    );

    setPreviewContent(content);
    setShowPreview(true);
  };

  const printFieldForms = () => {
    const fieldEvents = data.events.filter(e => isFieldEvent(e));
    if (fieldEvents.length === 0) {
      alert("Tiada acara Padang ditemui.");
      return;
    }
    fieldEvents.sort((a, b) => {
        const codeA = a.code ? String(a.code) : '';
        const codeB = b.code ? String(b.code) : '';
        return codeA.localeCompare(codeB, undefined, { numeric: true }) || a.name.localeCompare(b.name);
    });
    
    setPdfFilename(`Borang_Hakim_Padang_${data.config.year}.pdf`);
    setPdfOrientation('landscape');
    
    const content = (
      <>
        {fieldEvents.map((ev, index) => {
          const participants = ev.participants
            .map(pid => data.athletes.find(a => a.id === pid))
            .filter(Boolean)
            .sort((a, b) => (a!.class || '').localeCompare(b!.class || '') || a!.name.localeCompare(b!.name));

          const isHighJump = ev.name.toLowerCase().includes('lompat tinggi');

          return (
            <div key={ev.id} className="pdf-page landscape bg-white text-black p-10 relative page-break" style={{ width: '297mm', minHeight: '210mm' }}>
              <div className="text-center border-b-2 border-black pb-2 mb-4">
                <h1 className="text-xl font-bold uppercase">{data.config.schoolName}</h1>
                <h2 className="text-sm font-semibold uppercase">BORANG HAKIM - {data.config.year}</h2>
              </div>
              <div className="flex justify-between items-center mb-4 border p-2 bg-gray-100 text-xs shadow-sm">
                <div className="w-1/4"><strong>NO. ACARA:</strong> {ev.code || '-'}</div>
                <div className="w-1/4"><strong>ACARA:</strong> <span className="uppercase font-bold text-sm">{ev.name}</span></div>
                <div className="w-1/4 text-center"><strong>KATEGORI:</strong> <span className="font-bold">{ev.category}</span></div>
                <div className="w-1/4 text-right font-bold text-gray-600 uppercase">ACARA PADANG (FIELD)</div>
              </div>
              
              <table className="w-full border border-black text-[10px]">
                <thead className="bg-gray-200 border-b border-black font-bold text-center">
                  {isHighJump ? (
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
                    <tr><td colSpan={isHighJump ? 21 : 13} className="text-center py-12 italic text-gray-400">Tiada pendaftaran peserta.</td></tr>
                  ) : (
                    participants.map((p, i) => (
                      <tr key={p!.id} className="border-b border-gray-300 h-8 text-[10px]">
                        <td className="p-1 text-center border-r border-gray-300">{i + 1}</td>
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
                            <td className="border-r border-gray-300 w-8"></td>
                            <td></td>
                          </>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              
              <div className="mt-12 flex justify-between text-[10px] pt-4">
                <div className="text-center w-1/4"><div className="border-b border-black mb-1 h-8"></div><div className="font-bold">TANDATANGAN HAKIM</div></div>
                <div className="text-center w-1/4"><div className="border-b border-black mb-1 h-8"></div><div className="font-bold">TANDATANGAN PENCATAT</div></div>
                <div className="text-center w-1/4"><div className="border-b border-black mb-1 h-8"></div><div className="font-bold">PENGESAHAN REFERI</div></div>
              </div>
            </div>
          );
        })}
      </>
    );

    setPreviewContent(content);
    setShowPreview(true);
  };

  return null;
};
