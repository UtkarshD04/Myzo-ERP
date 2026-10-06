// Tiny pub/sub so any PDF builder can open the shared preview modal
// (components/common/PdfPreviewModal.jsx) without prop-drilling.
let listener = null;

export const subscribePdfPreview = (fn) => {
  listener = fn;
  return () => { if (listener === fn) listener = null; };
};

// Opens the preview for a finished jsPDF doc; falls back to a new tab if the
// modal isn't mounted.
export function openPdfPreview(pdf, fileName) {
  const url = pdf.output('bloburl');
  if (listener) listener({ url: String(url), fileName, pdf });
  else window.open(url, '_blank');
}

// Shared tail for every download* function: save, or preview when asked.
export function deliverPdf(pdf, fileName, { preview = false } = {}) {
  if (preview) openPdfPreview(pdf, fileName);
  else pdf.save(fileName);
}
