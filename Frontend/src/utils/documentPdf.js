import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const money = (n) => `Rs. ${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

// Header details for the payslip template. Edit these to match your registered company info.
// Exported so the on-screen payslip preview (DocumentsView) can render the same header.
export const COMPANY_INFO = {
  name: 'MESHO SOLUTION SOLAR PARK PVT LTD.',
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
  return parts.join(' ');
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
 * Builds and downloads the "Annexure-A / Salary Disbursement Sheet" bank
 * transfer instruction letter for a month's payroll run.
 */
export function downloadSalaryDisbursementPdf({ monthLabel, rows = [], employees = [] }) {
  const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 36;
  const center = pageWidth / 2;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(15);
  pdf.setTextColor(30, 41, 59);
  pdf.text('Annexure-A', center, 44, { align: 'center' });

  pdf.setFontSize(12);
  pdf.text('SALARY DISBURSEMENT SHEET', center, 62, { align: 'center' });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(71, 85, 105);
  pdf.text(`MONTH: ${String(monthLabel).toUpperCase()}`, center, 78, { align: 'center' });

  const todayLabel = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();

  const body = rows.map((p, i) => {
    const emp = employees.find(e => e.id === p.employeeId) || {};
    return [
      String(i + 1),
      p.employeeName || '--',
      p.employeeId || '--',
      p.designation || emp.designation || '--',
      p.department || emp.department || '--',
      Number(p.netPay || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 }),
      emp.bankName || '--',
      emp.accountNo ? `*${emp.accountNo}` : '--',
      emp.ifscCode || '--',
      todayLabel,
      ''
    ];
  });

  autoTable(pdf, {
    startY: 92,
    margin: { left: margin, right: margin },
    head: [['S.No', 'Employee Name', 'Emp.ID', 'Designation', 'Department', 'Salary', 'Bank Name', 'Account No', 'IFSC Code', 'Payment Date', 'Sign']],
    body,
    theme: 'grid',
    styles: { font: 'helvetica', fontSize: 7.5, textColor: [30, 41, 59], cellPadding: 5, lineColor: [203, 213, 225], lineWidth: 0.5 },
    headStyles: { fillColor: [241, 245, 249], textColor: [51, 65, 85], fontStyle: 'bold', halign: 'center', valign: 'middle' },
    columnStyles: {
      0: { cellWidth: 22, halign: 'center' },
      5: { halign: 'right' },
      9: { halign: 'center', cellWidth: 55 },
      10: { cellWidth: 30 }
    }
  });

  const totalSalary = rows.reduce((sum, p) => sum + (Number(p.netPay) || 0), 0);
  let y = pdf.lastAutoTable.finalY + 22;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(30, 41, 59);
  pdf.text(`TOTAL SALARY: ${totalSalary.toLocaleString('en-IN', { maximumFractionDigits: 0 })}/-`, margin, y);

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

  pdf.save(`Salary-Disbursement-${monthLabel.replace(/\s+/g, '-')}.pdf`);
}

// Payslip line items print as plain figures — no currency symbol and no
// thousands grouping — matching the company's standard printed pay slip:
// non-zero amounts show 2 decimals, zero shows as a bare "0". Net Pay is
// its own headline figure and always prints as a whole number.
const payslipAmount = (n) => {
  const num = Number(n) || 0;
  return num === 0 ? '0' : num.toFixed(2);
};
const payslipWhole = (n) => String(Math.round(Number(n) || 0));

/**
 * Builds and downloads an individual employee's monthly payslip, formatted
 * like the company's standard printed pay slip (header, employee/bank
 * details grid, Earnings vs Deductions table, net pay in words).
 */
export async function downloadPayslipPdf({ employee = {}, payslip, monthLabel }) {
  if (!payslip) return;

  const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 40;
  const boxLeft = margin;
  const boxRight = pageWidth - margin;
  const boxWidth = boxRight - boxLeft;
  const colMid = boxLeft + boxWidth / 2;
  const ink = [20, 20, 20];
  const lineColor = [60, 60, 60];

  let logoDataUrl = null;
  try {
    logoDataUrl = await loadImageDataUrl(COMPANY_INFO.logoUrl);
  } catch {
    logoDataUrl = null;
  }

  // Logo sits top-left on its own; the company name/address are centered on
  // the full page width independent of it, matching the reference letterhead.
  const logoWidth = 80;
  const logoHeight = logoWidth / COMPANY_INFO.logoAspect;
  const logoTop = 20;
  if (logoDataUrl) {
    pdf.addImage(logoDataUrl, 'PNG', boxLeft, logoTop, logoWidth, logoHeight);
  }

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(13);
  pdf.setTextColor(...ink);
  pdf.text(COMPANY_INFO.name, pageWidth / 2, 34, { align: 'center' });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(...ink);
  let headerY = 50;
  COMPANY_INFO.addressLines.forEach(line => {
    pdf.text(line, pageWidth / 2, headerY, { align: 'center' });
    headerY += 13;
  });

  // Contact block, top-right — shows this employee's own registered
  // email/phone (matching the reference letterhead, which prints the
  // slip-holder's own contact details here rather than a fixed company line).
  const contactLines = [
    employee.email && `Email: ${employee.email}`,
    employee.phone && `Contact No: ${employee.phone}`,
    COMPANY_INFO.gstin && `GSTIN: ${COMPANY_INFO.gstin}`
  ].filter(Boolean);
  pdf.setFontSize(8);
  let contactY = logoTop + 8;
  contactLines.forEach(line => {
    pdf.text(line, boxRight, contactY, { align: 'right' });
    contactY += 12;
  });

  const boxTop = Math.max(headerY, logoTop + logoHeight, contactY) + 14;
  pdf.setDrawColor(...lineColor);
  pdf.setLineWidth(0.75);

  // "Pay Slip For Month" bar
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(...ink);
  pdf.text(`Pay Slip For Month : ${monthLabel}`, boxLeft + 8, boxTop + 14);
  let sectionY = boxTop + 20;
  pdf.line(boxLeft, sectionY, boxRight, sectionY);

  // Employee / statutory info grid — plain (no per-row lines), just the
  // section separators drawn manually below.
  const infoStartY = sectionY;
  const infoRows = [
    ['Name', employee.name || '--', 'PAN', employee.pan || '--'],
    ['Employee ID', employee.id || employee.empId || '--', 'ESI No', employee.esiNo || '--'],
    ['Designation', employee.designation || '--', 'PF No', employee.pfNo || '--'],
    ['Bank Name', employee.bankName || '--', 'UAN No', employee.uanNo || '--'],
    ['Bank Account No', employee.accountNo || '--', 'Location', employee.location || '--'],
    ['Department', employee.department || '--', 'Mode of Payment', 'Bank Transfer']
  ];
  autoTable(pdf, {
    startY: infoStartY,
    margin: { left: boxLeft, right: margin },
    body: infoRows,
    theme: 'plain',
    styles: { font: 'helvetica', fontSize: 8.5, cellPadding: { top: 4.5, bottom: 4.5, left: 8, right: 4 }, textColor: ink },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 110 },
      1: { cellWidth: boxWidth / 2 - 110 },
      2: { fontStyle: 'bold', cellWidth: 110 },
      3: { cellWidth: boxWidth / 2 - 110 }
    }
  });
  sectionY = pdf.lastAutoTable.finalY;
  pdf.line(boxLeft, sectionY, boxRight, sectionY);

  // Earnings / Deductions header
  autoTable(pdf, {
    startY: sectionY,
    margin: { left: boxLeft, right: margin },
    body: [['Earnings', 'Amount', 'Deductions', 'Amount']],
    theme: 'plain',
    styles: { font: 'helvetica', fontSize: 9, fontStyle: 'bold', cellPadding: { top: 5, bottom: 5, left: 8, right: 8 }, textColor: ink },
    columnStyles: { 1: { halign: 'right' }, 3: { halign: 'right' } }
  });
  sectionY = pdf.lastAutoTable.finalY;
  pdf.line(boxLeft, sectionY, boxRight, sectionY);

  // Earnings / Deductions body
  const earnings = [
    ['Basic Salary', payslipAmount(payslip.basicPay)],
    ['HRA', payslipAmount(payslip.hra)],
    ['Conveyance Allowance', payslipAmount(0)],
    ['Medical Allowance', payslipAmount(payslip.medical)],
    ['Incentive', payslipAmount(payslip.commission)]
  ];
  const deductions = [
    ['PF', payslipAmount(payslip.pf)],
    ['ESI', payslipAmount(0)],
    ['TDS', payslipAmount(0)],
    ['Advance', payslipAmount(0)]
  ];
  if (payslip.lopAmount) deductions.push([`Loss of Pay (${payslip.lopDays}d)`, payslipAmount(payslip.lopAmount)]);
  if (payslip.otherDeductions) deductions.push(['Other Deductions', payslipAmount(payslip.otherDeductions)]);

  const rowCount = Math.max(earnings.length, deductions.length);
  const earnDeductBody = Array.from({ length: rowCount }, (_, i) => [
    earnings[i]?.[0] || '', earnings[i]?.[1] || '',
    deductions[i]?.[0] || '', deductions[i]?.[1] || ''
  ]);
  autoTable(pdf, {
    startY: sectionY,
    margin: { left: boxLeft, right: margin },
    body: earnDeductBody,
    theme: 'plain',
    styles: { font: 'helvetica', fontSize: 9, cellPadding: { top: 4.5, bottom: 4.5, left: 8, right: 8 }, textColor: ink },
    columnStyles: { 1: { halign: 'right' }, 3: { halign: 'right' } }
  });
  sectionY = pdf.lastAutoTable.finalY;
  pdf.line(boxLeft, sectionY, boxRight, sectionY);

  // Totals
  const totalEarning = (Number(payslip.grossEarnings) || 0) + (Number(payslip.commission) || 0);
  autoTable(pdf, {
    startY: sectionY,
    margin: { left: boxLeft, right: margin },
    body: [['Total Earning', payslipAmount(totalEarning), 'Total Deductions', payslipAmount(payslip.totalDeductions)]],
    theme: 'plain',
    styles: { font: 'helvetica', fontSize: 9.5, fontStyle: 'bold', cellPadding: { top: 5, bottom: 5, left: 8, right: 8 }, textColor: ink },
    columnStyles: { 1: { halign: 'right' }, 3: { halign: 'right' } }
  });
  sectionY = pdf.lastAutoTable.finalY;
  pdf.line(boxLeft, sectionY, boxRight, sectionY);

  // Single vertical divider spanning the two-column section (info grid
  // through totals) only — matches the reference, which doesn't carry the
  // divider through the Net Pay / words / relation rows below.
  pdf.line(colMid, infoStartY, colMid, sectionY);

  // Net Pay (left) | Days Payable + Arrear Days (right)
  const netPayRowTop = sectionY;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(...ink);
  pdf.text('Net Pay', boxLeft + 8, netPayRowTop + 16);
  pdf.text(payslipWhole(payslip.netPay), boxLeft + 90, netPayRowTop + 16);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(...ink);
  pdf.text(`Days payable: ${Number(payslip.presentDays || 0).toFixed(2)}`, colMid + 8, netPayRowTop + 13);
  pdf.text('Arrear Days: 0.00', colMid + 8, netPayRowTop + 26);

  sectionY = netPayRowTop + 34;
  pdf.line(boxLeft, sectionY, boxRight, sectionY);

  // Amount in words
  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(9);
  pdf.setTextColor(...ink);
  pdf.text(`Indian rupee ${numberToIndianWords(payslip.netPay)} only`, boxLeft + 8, sectionY + 16);
  sectionY += 24;
  pdf.line(boxLeft, sectionY, boxRight, sectionY);

  // Relation (plain 3-column layout, no internal lines)
  autoTable(pdf, {
    startY: sectionY,
    margin: { left: boxLeft, right: margin },
    head: [['Relation', 'Name', 'DOB']],
    body: [
      ["Father's Name", employee.fatherName || '--', employee.fatherDob || '--'],
      ["Mother's Name", employee.motherName || '--', employee.motherDob || '--']
    ],
    theme: 'plain',
    styles: { font: 'helvetica', fontSize: 8.5, cellPadding: { top: 4.5, bottom: 4.5, left: 8, right: 8 }, textColor: ink },
    headStyles: { fontStyle: 'bold' }
  });
  sectionY = pdf.lastAutoTable.finalY;

  // Signatory
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(...ink);
  const signatoryY = sectionY + 26;
  pdf.text('Authorized Signatory: ______________________', boxLeft + 8, signatoryY);
  const boxBottom = signatoryY + 14;

  // Outer border around the whole form
  pdf.setLineWidth(1);
  pdf.rect(boxLeft, boxTop, boxWidth, boxBottom - boxTop);

  pdf.save(`Payslip-${(employee.name || 'Employee').replace(/\s+/g, '-')}-${monthLabel.replace(/\s+/g, '-')}.pdf`);
}
