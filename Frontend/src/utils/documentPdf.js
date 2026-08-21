import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const money = (n) => `Rs. ${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

// Header details for the payslip template. Edit these to match your registered company info.
// Exported so the on-screen payslip preview (DocumentsView) can render the same header.
export const COMPANY_INFO = {
  name: 'MESHO SOLUTION SOLAR PARK PVT LTD.',
  // Same name, split as it prints on the letterhead (two bold stacked lines)
  // rather than one all-caps line — used by the payslip header specifically.
  nameLines: ['Mesho Solution', 'Solar Park Pvt. Ltd.'],
  tagline: 'Transforming Generation Globally',
  addressLines: ['Yogi Raj Tower Near By Madhurima Sweets, Vibhuti Khand, Gomti Nagar', 'Lucknow UP 226002'],
  gstin: '09AARCM1075B1ZG',
  logoUrl: '/logo.png',
  logoAspect: 677 / 369
};

// Letterhead/contact details for the Quotation & Invoice PDFs — these are
// customer-facing sales documents branded as "Myzo", separate from the
// registered entity name used on payslips above. Email/website/phone/GSTIN
// and bank details are intentionally blank: fill them in with Myzo's real
// registered details before sending documents to customers. Any left blank
// are simply left off the printed PDF rather than showing an empty label.
export const QUOTATION_BUSINESS_INFO = {
  name: 'Myzo',
  addressLines: COMPANY_INFO.addressLines,
  // Fallback Email/Contact No only — each quotation/invoice shows the
  // creating salesperson's own email/phone instead (see doc.salespersonEmail
  // / doc.salespersonPhone below), so these are just the safety net for
  // older records that predate that field.
  email: '',
  phone: '',
  website: 'www.mmyzo.com',
  gstin: COMPANY_INFO.gstin,
  logoUrl: COMPANY_INFO.logoUrl,
  logoAspect: COMPANY_INFO.logoAspect,
  bank: { accountName: '', bankName: '', accountNumber: '', ifsc: '' }
};

// Falls back onto any Quotation/Invoice PDF whose own termsAndConditions is
// blank — covers records saved before this default existed, and ones a
// salesperson cleared out by mistake, so the T&C page always has content.
// QuotationsView.jsx imports this same constant to pre-fill the create form,
// so there's one place to edit these clauses.
export const DEFAULT_TERMS_AND_CONDITIONS = [
  'GST/applicable taxes will be charged extra as per actuals, in accordance with prevailing GST rules.',
  "In case of any damage found after receipt of goods, the buyer must share photographs of the packaging and goods, along with the invoice number, transport receipt (LR) copy and a written acceptance note, within 3 to 5 working days, and inform our sales team.",
  "Where transport is arranged on Ex-Works terms, transit insurance is the buyer's responsibility, whether the vehicle is arranged by the buyer or by Myzo; any transit damage will be charged extra under Ex-Works terms.",
  "All warranties and guarantees are as per Myzo's standard policies.",
  'For bulk orders, the buyer must inform Myzo in advance of any Pre-Delivery Inspection (PDI) or inline inspection, sharing the Quality Assurance Plan (QAP), Bill of Materials (BOM) and agreed inspection dates with our sales team.',
  'Any dispute arising out of or in connection with this document shall be subject to the jurisdiction of the courts in Lucknow, India. Neither party shall be liable for delays caused by events beyond its reasonable control, including natural disasters or government action.',
  'The customer must arrange pickup/delivery of the goods within the validity period stated above; prices may be revised to prevailing market rates without prior notice after this period.',
  "Any change in law, or new duties/taxes levied after order confirmation, will be in the buyer's scope and charged extra at actuals."
].join('\n');

function loadImageDataUrl(url) {
  return fetch(url)
    .then(res => res.blob())
    .then(blob => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    }));
}

const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
  'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function twoDigitWords(n) {
  if (n < 20) return ONES[n];
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return TENS[tens] + (ones ? ` ${ONES[ones]}` : '');
}

function threeDigitWords(n) {
  const hundred = Math.floor(n / 100);
  const rest = n % 100;
  return (hundred ? `${ONES[hundred]} Hundred${rest ? ' ' : ''}` : '') + (rest ? twoDigitWords(rest) : '');
}

// Indian numbering (crore/lakh/thousand groups), for the "amount in words" line.
export function numberToIndianWords(amount) {
  let num = Math.round(Number(amount) || 0);
  if (num === 0) return 'Zero';

  const hundred = num % 1000;
  num = Math.floor(num / 1000);
  const thousand = num % 100;
  num = Math.floor(num / 100);
  const lakh = num % 100;
  num = Math.floor(num / 100);
  const crore = num;

  const parts = [];
  if (crore) parts.push(`${twoDigitWords(crore)} Crore`);
  if (lakh) parts.push(`${twoDigitWords(lakh)} Lakh`);
  if (thousand) parts.push(`${twoDigitWords(thousand)} Thousand`);
  if (hundred) parts.push(threeDigitWords(hundred));

  // Sentence case (only the first letter capitalised) — matches how the
  // company's own printed documents write amounts in words, e.g. "Twenty
  // five thousand" rather than "Twenty Five Thousand".
  const words = parts.join(' ');
  return words.charAt(0) + words.slice(1).toLowerCase();
}

/**
 * Builds and downloads a PDF for a quotation or invoice, styled as a
 * letterhead pro-forma — logo + contact header, an order-detail grid, a
 * three-way Billing From / Bill To / Ship To block, an itemised table and
 * totals, then a Terms & Conditions + Bank Details page. Both document types
 * share the same shape (customer/items/totals) so one generator covers both,
 * keyed off the differing field names (quoteDate/validUntil vs invoiceDate/dueDate).
 */
export async function downloadDocumentPdf({ type, doc }) {
  const isQuote = type === 'QUOTATION';
  const biz = QUOTATION_BUSINESS_INFO;
  const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;

  let logoDataUrl = null;
  try {
    logoDataUrl = await loadImageDataUrl(biz.logoUrl);
  } catch {
    logoDataUrl = null;
  }

  // ---- Title ----
  const title = isQuote ? 'QUOTATION' : 'TAX INVOICE';
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.setTextColor(30, 41, 59);
  pdf.text(title, pageWidth / 2, 38, { align: 'center' });
  const titleWidth = pdf.getTextWidth(title);
  pdf.setDrawColor(30, 41, 59);
  pdf.setLineWidth(1);
  pdf.line(pageWidth / 2 - titleWidth / 2, 46, pageWidth / 2 + titleWidth / 2, 46);

  // ---- Logo (left) + contact block (right) ----
  let y = 66;
  const logoWidth = 84;
  const logoHeight = logoWidth / (biz.logoAspect || 1);
  if (logoDataUrl) {
    pdf.addImage(logoDataUrl, 'PNG', margin, y, logoWidth, logoHeight);
  }

  // The salesperson who created this document is shown as the reply-to
  // contact (matches the reference letterhead, which showed the handling
  // salesperson's own email/phone rather than a single shared inbox);
  // biz.email/biz.phone are just the fallback for older records.
  const contactEmail = doc.salespersonEmail || biz.email;
  const contactPhone = doc.salespersonPhone || biz.phone;
  const contactLines = [
    contactEmail && `Email: ${contactEmail}`,
    biz.website && `Website: ${biz.website}`,
    contactPhone && `Contact No: ${contactPhone}`,
    biz.gstin && `GSTIN: ${biz.gstin}`
  ].filter(Boolean);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(71, 85, 105);
  let contactY = y + 8;
  contactLines.forEach(line => {
    pdf.text(line, pageWidth - margin, contactY, { align: 'right' });
    contactY += 12;
  });

  y = Math.max(y + logoHeight, contactY) + 14;
  pdf.setDrawColor(226, 232, 240);
  pdf.line(margin, y, pageWidth - margin, y);
  y += 18;

  // ---- Two-column label/value info grid (wraps long values gracefully) ----
  const gridColWidth = contentWidth / 2;
  const drawGridRows = (pairs) => {
    let col = 0;
    let rowMaxLines = 1;
    pairs.forEach(([label, value]) => {
      const colX = margin + col * gridColWidth;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.setTextColor(148, 163, 184);
      pdf.text(label.toUpperCase(), colX, y);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9.5);
      pdf.setTextColor(30, 41, 59);
      const valueLines = pdf.splitTextToSize(String(value ?? '-'), gridColWidth - 16);
      pdf.text(valueLines, colX, y + 13);
      rowMaxLines = Math.max(rowMaxLines, valueLines.length);
      if (col === 1) {
        col = 0;
        y += 13 + rowMaxLines * 11 + 8;
        rowMaxLines = 1;
      } else {
        col = 1;
      }
    });
    if (col === 1) y += 13 + rowMaxLines * 11 + 8;
  };

  const taxSummary = doc.igstRate
    ? `IGST ${doc.igstRate}%`
    : (doc.cgstRate || doc.sgstRate)
      ? `CGST ${doc.cgstRate || 0}% + SGST ${doc.sgstRate || 0}%`
      : (doc.taxType && doc.taxType !== 'None')
        ? `${doc.taxType} ${doc.taxRate}%`
        : 'N/A';

  const identityPairs = [
    [isQuote ? 'Quote Date' : 'Invoice Date', doc.quoteDate || doc.invoiceDate || '-'],
    [isQuote ? 'Quotation No' : 'Invoice No', doc.id],
    ['PO Number', doc.referenceNumber || '-'],
    ['Brand', doc.brand || '-'],
    ['Packing Type', doc.packingType || '-'],
    [isQuote ? 'Expiry Date' : 'Due Date', doc.validUntil || doc.dueDate || '-']
  ];
  if (!isQuote && doc.sourceQuotationId) identityPairs.push(['From Quotation', doc.sourceQuotationId]);
  drawGridRows(identityPairs);

  pdf.setDrawColor(226, 232, 240);
  pdf.line(margin, y, pageWidth - margin, y);
  y += 16;

  drawGridRows([
    ['Customer Type', doc.customerType || '-'],
    ['Inco Term', doc.incoTerm || '-'],
    ['Payment Term', doc.paymentTerm || '-'],
    ['Fiscal Position', doc.fiscalPosition || '-'],
    ['Tax', taxSummary],
    ['Salesperson', doc.salespersonName || '-']
  ]);

  pdf.setDrawColor(226, 232, 240);
  pdf.line(margin, y, pageWidth - margin, y);
  y += 18;

  // ---- Billing From / Bill To / Ship To ----
  const colWidth = contentWidth / 3;
  const billingCols = [
    {
      heading: 'BILLING FROM',
      name: biz.name,
      lines: [...biz.addressLines, contactPhone && `Phone: ${contactPhone}`, biz.gstin && `GSTIN: ${biz.gstin}`].filter(Boolean)
    },
    {
      heading: 'BILL TO',
      name: doc.customerName || '-',
      lines: [doc.customerAddress, doc.customerPhone, doc.customerEmail].filter(Boolean)
    },
    {
      heading: 'SHIP TO',
      name: doc.customerName || null,
      lines: [doc.shippingAddress || doc.customerAddress || '-']
    }
  ];

  let maxColY = y;
  billingCols.forEach((col, i) => {
    const colX = margin + i * colWidth;
    let colY = y;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(148, 163, 184);
    pdf.text(col.heading, colX, colY);
    colY += 14;
    if (col.name) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9.5);
      pdf.setTextColor(30, 41, 59);
      const nameLines = pdf.splitTextToSize(col.name, colWidth - 14);
      pdf.text(nameLines, colX, colY);
      colY += nameLines.length * 12;
    }
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    pdf.setTextColor(71, 85, 105);
    col.lines.forEach(line => {
      const wrapped = pdf.splitTextToSize(String(line), colWidth - 14);
      pdf.text(wrapped, colX, colY);
      colY += wrapped.length * 11;
    });
    maxColY = Math.max(maxColY, colY);
  });
  y = maxColY + 14;

  pdf.setDrawColor(226, 232, 240);
  pdf.line(margin, y, pageWidth - margin, y);
  y += 16;

  // ---- Item table ----
  const perLineTaxPct = doc.igstRate || ((doc.cgstRate || 0) + (doc.sgstRate || 0)) || doc.taxRate || 0;
  const rows = (doc.items || []).map((item, i) => {
    const wp = Number(item.wattage);
    const priceWp = wp > 0 ? (Number(item.unitPrice || 0) / wp).toFixed(2) : '-';
    return [
      String(i + 1),
      item.model ? `${item.productName}\n${item.model}` : (item.productName || ''),
      String(item.quantity ?? ''),
      priceWp,
      money(item.unitPrice),
      perLineTaxPct ? `${perLineTaxPct}%` : '-',
      money(item.lineTotal)
    ];
  });

  autoTable(pdf, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['#', 'Item', 'Qty', 'Price/WP', 'Unit Price', 'Tax', 'Amount']],
    body: rows,
    styles: { font: 'helvetica', fontSize: 8.5, textColor: [51, 65, 85], cellPadding: 6 },
    headStyles: { fillColor: [241, 245, 249], textColor: [100, 116, 139], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 22 },
      2: { cellWidth: 34, halign: 'center' },
      3: { cellWidth: 55, halign: 'right' },
      4: { cellWidth: 70, halign: 'right' },
      5: { cellWidth: 40, halign: 'center' },
      6: { cellWidth: 75, halign: 'right' }
    }
  });

  let afterTableY = pdf.lastAutoTable.finalY + 20;

  // ---- Totals ----
  const totalsX = pageWidth - margin - 200;
  const totalsValueX = pageWidth - margin;
  const totalLine = (label, value, opts = {}) => {
    pdf.setFont('helvetica', opts.bold ? 'bold' : 'normal');
    pdf.setFontSize(opts.bold ? 11 : 9);
    pdf.setTextColor(...(opts.bold ? [30, 41, 59] : [71, 85, 105]));
    pdf.text(label, totalsX, afterTableY);
    pdf.text(value, totalsValueX, afterTableY, { align: 'right' });
    afterTableY += opts.bold ? 18 : 14;
  };

  totalLine('Sub Total', money(doc.subtotal));
  if (doc.discountTotal) totalLine(`Discount${doc.discountPercent ? ` (${doc.discountPercent}%)` : ''}`, `-${money(doc.discountTotal)}`);
  if (doc.cgstRate) totalLine(`CGST (${doc.cgstRate}%)`, money(doc.cgstAmount));
  if (doc.sgstRate) totalLine(`SGST (${doc.sgstRate}%)`, money(doc.sgstAmount));
  if (doc.igstRate) totalLine(`IGST (${doc.igstRate}%)`, money(doc.igstAmount));
  if (doc.taxType && doc.taxType !== 'None') totalLine(`${doc.taxType} (${doc.taxRate}%)`, money(doc.taxAmount));
  if (doc.adjustment) totalLine('Adjustment', money(doc.adjustment));

  pdf.setDrawColor(226, 232, 240);
  pdf.line(totalsX, afterTableY - 4, totalsValueX, afterTableY - 4);
  afterTableY += 8;
  totalLine('Total', money(doc.totalAmount), { bold: true });

  afterTableY += 14;
  if (doc.deliveryPlan) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(30, 41, 59);
    pdf.text('Delivery Plan:', margin, afterTableY);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(71, 85, 105);
    pdf.text(String(doc.deliveryPlan), margin + 72, afterTableY);
    afterTableY += 20;
  }

  // ---- Terms & Conditions + Bank Details, own page ----
  // Falls back to the Myzo standard terms whenever a document's own field is
  // blank (older records, or one a salesperson cleared out), so this page is
  // never silently skipped.
  const termsText = doc.termsAndConditions || DEFAULT_TERMS_AND_CONDITIONS;
  const bankConfigured = !!biz.bank.accountNumber;
  {
    pdf.addPage();
    let ty = 50;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(30, 41, 59);
    pdf.text('TERMS & CONDITIONS', margin, ty);
    ty += 10;
    pdf.setDrawColor(226, 232, 240);
    pdf.line(margin, ty, pageWidth - margin, ty);
    ty += 20;

    const clauses = termsText
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(71, 85, 105);
    clauses.forEach((clause, i) => {
      const wrapped = pdf.splitTextToSize(`${i + 1}. ${clause}`, contentWidth);
      pdf.text(wrapped, margin, ty);
      ty += wrapped.length * 13 + 4;
    });

    if (bankConfigured) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(71, 85, 105);
      pdf.text(`${clauses.length + 1}. Bank Details:`, margin, ty);
      ty += 14;
      pdf.setFont('helvetica', 'normal');
      [
        `Account Name: ${biz.bank.accountName || '-'}`,
        `Bank: ${biz.bank.bankName || '-'}`,
        `Account Number: ${biz.bank.accountNumber}`,
        `IFSC Code: ${biz.bank.ifsc || '-'}`
      ].forEach(line => {
        pdf.text(line, margin + 10, ty);
        ty += 13;
      });
    }
  }

  pdf.save(`${doc.id}.pdf`);
}

/**
 * Builds the "Annexure-A / Salary Disbursement Sheet" bank transfer
 * instruction letter for a month's payroll run and returns the jsPDF
 * instance (caller decides whether to .save() it or read out its bytes).
 */
function buildSalaryDisbursementPdf({ monthLabel, rows = [], employees = [] }) {
  const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 36;
  const center = pageWidth / 2;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(15);
  pdf.setTextColor(30, 64, 175);
  pdf.text('Annexure-A', center, 44, { align: 'center' });
  const annexureWidth = pdf.getTextWidth('Annexure-A');
  pdf.setDrawColor(30, 64, 175);
  pdf.setLineWidth(0.75);
  pdf.line(center - annexureWidth / 2, 47, center + annexureWidth / 2, 47);

  pdf.setFontSize(12);
  pdf.setTextColor(30, 41, 59);
  pdf.text('SALARY DISBURSEMENT SHEET', center, 62, { align: 'center' });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(71, 85, 105);
  pdf.text(`MONTH: ${String(monthLabel).toUpperCase()}`, center, 78, { align: 'center' });

  // Each employee's own actual payment date (stamped server-side when HR
  // marks that payroll record Paid — see payrollController.modifyPayroll),
  // not a single "today" repeated for the whole batch: rows paid on
  // different days (e.g. a correction added a day or two later) must show
  // their own date, and rows not yet paid show blank rather than a
  // premature/inaccurate date on what is effectively a bank instruction sheet.
  const formatPaymentDate = (d) => d
    ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()
    : '--';

  // "Salary" is the employee's configured base salary (Employee Details),
  // shown as-is with no deductions applied. "Net Pay" is what's actually
  // owed after PF/LOP/other deductions — the real transfer amount, and the
  // one the TOTAL line and the accompanying cheque are built from (see
  // PayrollView's totalNetPay). Keeping both columns means this sheet never
  // misrepresents the wire amount as the full salary, while still letting
  // HR/the bank see each employee's configured salary for reference.
  const body = rows.map((p, i) => {
    const emp = employees.find(e => e.id === p.employeeId) || {};
    return [
      String(i + 1),
      p.employeeName || '--',
      p.employeeId || '--',
      p.designation || emp.designation || '--',
      p.department || emp.department || '--',
      Number(emp.salary || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 }),
      Number(p.netPay || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 }),
      emp.bankName || '--',
      emp.accountNo ? `*${emp.accountNo}` : '--',
      emp.ifscCode || '--',
      p.status === 'Paid' ? formatPaymentDate(p.paidAt) : '--',
      ''
    ];
  });

  autoTable(pdf, {
    startY: 92,
    margin: { left: margin, right: margin },
    head: [['S.No', 'Employee Name', 'Emp.ID', 'Designation', 'Department', 'Salary', 'Net Pay', 'Bank Name', 'Account No', 'IFSC Code', 'Payment Date', 'Sign']],
    body,
    theme: 'grid',
    styles: { font: 'helvetica', fontSize: 7.5, textColor: [30, 41, 59], cellPadding: 5, lineColor: [203, 213, 225], lineWidth: 0.5 },
    headStyles: { fillColor: [241, 245, 249], textColor: [51, 65, 85], fontStyle: 'bold', halign: 'center', valign: 'middle' },
    columnStyles: {
      0: { cellWidth: 22, halign: 'center' },
      5: { halign: 'right' },
      6: { halign: 'right' },
      10: { halign: 'center', cellWidth: 50 },
      11: { cellWidth: 28 }
    }
  });

  const totalNetPay = rows.reduce((sum, p) => sum + (Number(p.netPay) || 0), 0);
  let y = pdf.lastAutoTable.finalY + 22;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(30, 41, 59);
  pdf.text(`TOTAL NET PAYABLE: ${totalNetPay.toLocaleString('en-IN', { maximumFractionDigits: 0 })}/-`, margin, y);

  y += 44;
  const col1 = margin;
  const col2 = center - 60;
  const col3 = pageWidth - margin - 130;

  pdf.setFontSize(9);
  pdf.text('Prepared by (HR)', col1, y);
  pdf.text('Verified By (Accounts)', col2, y);
  pdf.text('Authorized Signatory', col3, y);

  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(71, 85, 105);
  y += 20;
  pdf.text('Name: ______________________', col1, y);
  pdf.text('Name: ______________________', col2, y);
  pdf.text('Name: ______________________', col3, y);
  y += 18;
  pdf.text('Date: ______________________', col1, y);
  pdf.text('Date: ______________________', col2, y);
  pdf.text('Date: ______________________', col3, y);

  return pdf;
}

export function downloadSalaryDisbursementPdf({ monthLabel, rows = [], employees = [] }) {
  buildSalaryDisbursementPdf({ monthLabel, rows, employees }).save(`Salary-Disbursement-${monthLabel.replace(/\s+/g, '-')}.pdf`);
}

// Base64 body only (no data: URI prefix) — used to upload this PDF as an
// email attachment via the send-to-bank endpoint (see payrollController.js
// / mailService.js on the backend, which has no PDF library of its own).
export function buildSalaryDisbursementPdfBase64({ monthLabel, rows = [], employees = [] }) {
  return buildSalaryDisbursementPdf({ monthLabel, rows, employees }).output('datauristring').split(',')[1];
}

function getImageSize(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = reject;
    img.src = dataUrl;
  });
}

function imageFormatFromDataUrl(dataUrl) {
  const match = /^data:image\/(\w+);/i.exec(dataUrl);
  return (match ? match[1] : 'png').toUpperCase();
}

// Defaults used for any field the admin hasn't calibrated yet in Settings →
// Company Bank, so an incomplete calibration never crashes or silently
// drops a field from the printed cheque.
const DEFAULT_CHEQUE_FIELD_POSITIONS = {
  date: { x: 0.82, y: 0.18 },
  payee: { x: 0.15, y: 0.45 },
  amountWords: { x: 0.15, y: 0.6 },
  amountFigure: { x: 0.78, y: 0.62 }
};

/**
 * Draws the dynamic fields (date, payee, amount in words, amount figure) on
 * top of the company's real, uploaded cheque-leaf scan — positions come from
 * Settings → Company Bank's calibration panel, as percentages of the image's
 * width/height so they map onto the PDF page regardless of the scan's size.
 */
async function buildImageBackedChequePdf({ bank, chequeNumber, chequeDate, amount }) {
  const { width: imgWidth, height: imgHeight } = await getImageSize(bank.chequeLeafImage);
  const pageWidth = 580;
  const pageHeight = pageWidth / (imgWidth / imgHeight);
  const pdf = new jsPDF({ unit: 'pt', format: [pageWidth, pageHeight] });
  const ink = [20, 20, 20];

  pdf.addImage(bank.chequeLeafImage, imageFormatFromDataUrl(bank.chequeLeafImage), 0, 0, pageWidth, pageHeight);

  const positions = { ...DEFAULT_CHEQUE_FIELD_POSITIONS, ...(bank.chequeFieldPositions || {}) };
  const at = (field) => {
    const pos = positions[field] || DEFAULT_CHEQUE_FIELD_POSITIONS[field];
    return { x: pos.x * pageWidth, y: pos.y * pageHeight };
  };

  pdf.setTextColor(...ink);

  const datePt = at('date');
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.text(String(chequeDate), datePt.x, datePt.y);

  const payeePt = at('payee');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.text('SELF — Salary Account Transfer (see attached Annexure-A)', payeePt.x, payeePt.y);

  const wordsPt = at('amountWords');
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9.5);
  const wordsWrapped = pdf.splitTextToSize(`${numberToIndianWords(amount)} Only`, pageWidth - wordsPt.x - 30);
  pdf.text(wordsWrapped, wordsPt.x, wordsPt.y);

  const figurePt = at('amountFigure');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text(`Rs. ${Number(amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`, figurePt.x, figurePt.y);

  return pdf;
}

/**
 * Builds a single "pay to self" cheque-leaf PDF for a month's total payroll
 * payout, sized roughly like a real Indian cheque leaf. This is an original
 * layout (not a copy of any specific bank's proprietary security-printed
 * template) — bank name/branch/account details are whatever the company
 * configured in Settings → Company Bank.
 */
function buildHandDrawnChequePdf({ bank = {}, chequeNumber, chequeDate, amount }) {
  const pageWidth = 580;
  const pageHeight = 260;
  const pdf = new jsPDF({ unit: 'pt', format: [pageWidth, pageHeight] });
  const margin = 20;
  const ink = [20, 20, 20];

  pdf.setDrawColor(100, 100, 100);
  pdf.setLineWidth(1);
  pdf.rect(margin / 2, margin / 2, pageWidth - margin, pageHeight - margin);

  // A/C Payee crossing mark, top-left
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.5);
  pdf.setTextColor(...ink);
  pdf.text('A/C PAYEE ONLY', margin + 4, margin + 6);
  pdf.setLineWidth(0.75);
  pdf.line(margin, margin + 12, margin + 90, margin);
  pdf.line(margin, margin, margin + 90, margin + 12);

  // Bank name / branch, below the crossing mark
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.setTextColor(...ink);
  pdf.text(bank.bankName || 'Bank Name Not Configured', margin, margin + 34);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(80, 80, 80);
  if (bank.branch) pdf.text(bank.branch, margin, margin + 46);

  // Cheque No / Date, top-right
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(...ink);
  pdf.text(`Cheque No: ${chequeNumber}`, pageWidth - margin, margin + 8, { align: 'right' });
  pdf.text(`Date: ${chequeDate}`, pageWidth - margin, margin + 22, { align: 'right' });

  // Pay line
  let y = margin + 74;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9.5);
  pdf.text('Pay', margin, y);
  pdf.setFont('helvetica', 'bold');
  pdf.text('SELF — Salary Account Transfer (see attached Annexure-A)', margin + 30, y);
  pdf.setLineWidth(0.5);
  pdf.line(margin + 28, y + 3, pageWidth - margin - 100, y + 3);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  pdf.setTextColor(120, 120, 120);
  pdf.text('OR BEARER', pageWidth - margin - 90, y);

  // Amount in words
  y += 26;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9.5);
  pdf.setTextColor(...ink);
  pdf.text('Rupees', margin, y);
  pdf.setFont('helvetica', 'bold');
  const wordsWrapped = pdf.splitTextToSize(`${numberToIndianWords(amount)} Only`, pageWidth - margin - 190);
  pdf.text(wordsWrapped, margin + 44, y);
  const wordsBlockHeight = wordsWrapped.length * 11;
  pdf.setLineWidth(0.5);
  pdf.line(margin + 42, y + wordsBlockHeight - 6, pageWidth - margin - 150, y + wordsBlockHeight - 6);

  // Amount box, right
  const boxW = 130;
  const boxH = 32;
  const boxX = pageWidth - margin - boxW;
  const boxY = margin + 58;
  pdf.setLineWidth(1);
  pdf.rect(boxX, boxY, boxW, boxH);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(13);
  pdf.text(`Rs. ${Number(amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`, boxX + boxW / 2, boxY + boxH / 2 + 5, { align: 'center' });

  // Footer: account details (left) + signatory line (right)
  const footerY = pageHeight - margin - 12;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(90, 90, 90);
  const accLine = [
    bank.accountHolderName && `A/c Name: ${bank.accountHolderName}`,
    bank.accountNumber && `A/c No: ${bank.accountNumber}`,
    bank.ifscCode && `IFSC: ${bank.ifscCode}`
  ].filter(Boolean).join('   ');
  pdf.text(accLine || 'Company bank account not configured', margin, footerY);

  pdf.setLineWidth(0.5);
  pdf.setDrawColor(...ink);
  pdf.line(pageWidth - margin - 140, footerY - 16, pageWidth - margin, footerY - 16);
  pdf.setFontSize(8.5);
  pdf.setTextColor(...ink);
  pdf.text('Authorized Signatory', pageWidth - margin, footerY - 4, { align: 'right' });

  return pdf;
}

// Uses the company's uploaded real cheque-leaf scan (Settings → Company
// Bank) as the background when one is configured; falls back to the
// hand-drawn layout above otherwise — no regression for anyone who hasn't
// calibrated a real leaf yet.
async function buildChequePdf({ bank = {}, chequeNumber, chequeDate, amount }) {
  if (bank.chequeLeafImage) {
    return buildImageBackedChequePdf({ bank, chequeNumber, chequeDate, amount });
  }
  return buildHandDrawnChequePdf({ bank, chequeNumber, chequeDate, amount });
}

export async function downloadChequePdf({ bank, chequeNumber, chequeDate, amount }) {
  const pdf = await buildChequePdf({ bank, chequeNumber, chequeDate, amount });
  pdf.save(`Cheque-${chequeNumber}.pdf`);
}

// Base64 body only, for the send-to-bank email attachment (same reasoning as
// buildSalaryDisbursementPdfBase64 above).
export async function buildChequePdfBase64({ bank, chequeNumber, chequeDate, amount }) {
  const pdf = await buildChequePdf({ bank, chequeNumber, chequeDate, amount });
  return pdf.output('datauristring').split(',')[1];
}

// Payslip line items print as plain figures — no currency symbol and no
// thousands grouping — matching the company's standard printed pay slip:
// non-zero amounts show 2 decimals, zero shows as a bare "0". Net Pay is
// its own headline figure and always prints as a whole number.
export const payslipAmount = (n) => {
  const num = Number(n) || 0;
  return num === 0 ? '0' : num.toFixed(2);
};
export const payslipWhole = (n) => String(Math.round(Number(n) || 0));

// The company's own blank payslip letterhead (Settings-free — it's a fixed
// asset at Frontend/public/payslip-template.jpg), used as the PDF page
// background so every printed payslip is pixel-identical to the physical
// template HR already uses. Fields are overlaid on top at coordinates
// measured directly off that image (see PAYSLIP_TEMPLATE_FIELDS below);
// PAYSLIP_TEMPLATE_IMAGE_SIZE is the template's own pixel dimensions
// (an 8.5x11in page at ~568dpi). It's not a calibration panel like the
// cheque leaf's, since this template has one fixed source image rather
// than a per-company upload. Exported so DocumentsView's on-screen
// preview can render the exact same image + field coordinates in an SVG,
// instead of drifting from the PDF as a separate hand-recreated layout.
export const PAYSLIP_TEMPLATE_URL = '/payslip-template.jpg';
export const PAYSLIP_TEMPLATE_IMAGE_SIZE = { width: 4830, height: 6250 };
export const PAYSLIP_PAGE_SIZE = { width: 612, height: 792 }; // US Letter, matching the template's own aspect ratio

// Every dynamic field's position, measured directly off the blank template
// image (pixel coordinates, top-left origin). `white` is a rectangle wiped
// back to white before the value is drawn — needed only where the blank
// template itself already has baked-in placeholder text (the sample
// employee's email/phone in the header, "CBH" under Designation, and the
// "0" deduction figures) that would otherwise show through underneath the
// real value. Fields with no baked-in text (most of the form) don't need it.
export const PAYSLIP_TEMPLATE_FIELDS = {
  email: { white: [3390, 388, 1350, 80], text: [3399, 452] },
  phone: { white: [3380, 540, 900, 65], text: [3390, 588] },
  month: { text: [1460, 1245] },
  name: { text: [1000, 1335] },
  employeeId: { text: [1250, 1560] },
  designation: { white: [1180, 1708, 1200, 90], text: [1225, 1775] },
  bankName: { text: [1210, 1975] },
  accountNo: { text: [1405, 2188] },
  department: { text: [1230, 2413] },
  pan: { text: [2925, 1338] },
  esiNo: { text: [3025, 1544] },
  pfNo: { text: [3000, 1751] },
  uanNo: { text: [3080, 1958] },
  location: { text: [3090, 2166] },
  basicSalary: { text: [1860, 2734] },
  hra: { text: [1860, 2933] },
  medical: { text: [1860, 3360] },
  incentive: { text: [1860, 3573] },
  pfDeduction: { white: [3550, 2663, 500, 70], text: [3564, 2716] },
  advanceOrExtra: { white: [3550, 3285, 500, 70], text: [3564, 3338] },
  totalEarning: { text: [1860, 3800] },
  totalDeductions: { white: [3550, 3730, 500, 95], text: [3564, 3800] },
  netPay: { text: [1040, 4140], size: 12, bold: true },
  daysPayable: { text: [3270, 4015] },
  amountWords: { text: [726, 4300], italic: true },
  fatherName: { text: [1863, 4850] },
  fatherDob: { text: [2715, 4850] }
};

/**
 * Builds and downloads an individual employee's monthly payslip. The
 * company's blank letterhead (see PAYSLIP_TEMPLATE_URL) is placed as the
 * page background and every dynamic value is drawn on top at its measured
 * position, so the printed slip is exact to the template rather than a
 * hand-recreated approximation of it.
 */
export async function downloadPayslipPdf({ employee = {}, payslip, monthLabel }) {
  if (!payslip) return;

  const pdf = new jsPDF({ unit: 'pt', format: [PAYSLIP_PAGE_SIZE.width, PAYSLIP_PAGE_SIZE.height] });
  const sx = PAYSLIP_PAGE_SIZE.width / PAYSLIP_TEMPLATE_IMAGE_SIZE.width;
  const sy = PAYSLIP_PAGE_SIZE.height / PAYSLIP_TEMPLATE_IMAGE_SIZE.height;
  const ink = [20, 20, 20];

  let templateDataUrl = null;
  try {
    templateDataUrl = await loadImageDataUrl(PAYSLIP_TEMPLATE_URL);
  } catch {
    templateDataUrl = null;
  }
  if (templateDataUrl) {
    pdf.addImage(templateDataUrl, 'JPEG', 0, 0, PAYSLIP_PAGE_SIZE.width, PAYSLIP_PAGE_SIZE.height);
  }

  // `value === undefined` skips the field entirely (leaves the template's
  // own baked-in content untouched); `value === ''` still wipes a baked
  // placeholder back to blank without writing new text over it — needed for
  // the header email/phone, which must never leak the template's sample
  // employee's contact details onto another employee's slip.
  const field = (key, value) => {
    if (value === undefined) return;
    const spec = PAYSLIP_TEMPLATE_FIELDS[key];
    if (spec.white) {
      const [x, y, w, h] = spec.white;
      pdf.setFillColor(255, 255, 255);
      pdf.rect(x * sx, y * sy, w * sx, h * sy, 'F');
    }
    if (value === '' || value === null) return;
    pdf.setFont('helvetica', spec.bold ? 'bold' : (spec.italic ? 'italic' : 'normal'));
    pdf.setFontSize(spec.size || 9);
    pdf.setTextColor(...ink);
    pdf.text(String(value), spec.text[0] * sx, spec.text[1] * sy);
  };

  // Header contact block — this employee's own registered email/phone,
  // matching the reference letterhead which prints the slip-holder's own
  // contact details here rather than a fixed company line. Always wiped
  // even when blank, since the template's baked-in sample values must not
  // leak onto another employee's slip.
  field('email', employee.email || '');
  field('phone', employee.phone || '');

  field('month', monthLabel);
  field('name', employee.name || '--');
  field('employeeId', employee.id || employee.empId || '--');
  field('designation', employee.designation || '--');
  field('bankName', employee.bankName || '--');
  field('accountNo', employee.accountNo || '--');
  field('department', employee.department || '--');
  field('pan', employee.pan || '--');
  field('esiNo', employee.esiNo || '--');
  field('pfNo', employee.pfNo || '--');
  field('uanNo', employee.uanNo || '--');
  field('location', employee.location || '--');

  field('basicSalary', payslipAmount(payslip.basicPay));
  field('hra', payslipAmount(payslip.hra));
  field('medical', payslipAmount(payslip.medical));
  field('incentive', payslipAmount(payslip.commission));
  field('pfDeduction', payslipAmount(payslip.pf));

  // The template's fixed Deductions rows have no spare line for Loss-of-Pay
  // or ad-hoc "other" deductions, so both fold into the Advance row — which
  // is otherwise always 0 — rather than being dropped silently. This is
  // purely a display breakdown: payslip.totalDeductions from the backend
  // (generatePayrollForMonth) is already lopAmount + pf + otherDeductions,
  // so the total below must NOT add extraDeductions again on top of it.
  const extraDeductions = (Number(payslip.lopAmount) || 0) + (Number(payslip.otherDeductions) || 0);
  if (extraDeductions) field('advanceOrExtra', payslipAmount(extraDeductions));

  const totalEarning = (Number(payslip.grossEarnings) || 0) + (Number(payslip.commission) || 0);
  field('totalEarning', payslipAmount(totalEarning));
  field('totalDeductions', payslipAmount(payslip.totalDeductions));

  field('netPay', payslipWhole(payslip.netPay));
  field('daysPayable', Number(payslip.presentDays || 0).toFixed(2));
  field('amountWords', `Indian rupee ${numberToIndianWords(payslip.netPay)} only`);

  if (employee.fatherName) {
    field('fatherName', employee.fatherName);
    field('fatherDob', employee.fatherDob || '--');
  }

  pdf.save(`Payslip-${(employee.name || 'Employee').replace(/\s+/g, '-')}-${monthLabel.replace(/\s+/g, '-')}.pdf`);
}
