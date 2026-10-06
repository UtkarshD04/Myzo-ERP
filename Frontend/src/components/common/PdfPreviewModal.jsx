import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { subscribePdfPreview } from '../../utils/pdfPreview';

export default function PdfPreviewModal() {
  const [preview, setPreview] = useState(null);

  useEffect(() => subscribePdfPreview(setPreview), []);

  const close = () => {
    if (preview) URL.revokeObjectURL(preview.url);
    setPreview(null);
  };

  useEffect(() => {
    if (!preview) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!preview) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 flex items-center justify-center p-3 md:p-6" onClick={close}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl h-full max-h-[92vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-100">
          <h4 className="text-sm font-bold text-slate-800 truncate">Preview — {preview.fileName}</h4>
          <div className="flex items-center gap-2">
            <button
              onClick={() => preview.pdf.save(preview.fileName)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-900 cursor-pointer"
            >
              <Download size={13} /> Download
            </button>
            <button onClick={close} className="p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer" title="Close">
              <X size={18} />
            </button>
          </div>
        </div>
        <iframe src={preview.url} title="Document preview" className="flex-1 w-full bg-slate-100" />
      </div>
    </div>
  );
}
