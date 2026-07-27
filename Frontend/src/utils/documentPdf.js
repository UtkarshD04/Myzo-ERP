import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const money = (n) => `Rs. ${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

/**
 * Builds and downloads a PDF for a quotation or invoice. Both documents share
 * the same shape (customer/items/totals) so one generator covers both, keyed
 * off the differing date field names (quoteDate/validUntil vs invoiceDate/dueDate).
 */
export function downloadDocumentPdf({ type, doc }) {
  const isQuote = type === 'QUOTATION';
  const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 40;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.setTextColor(30, 41, 59);
  pdf.text('MYZO ERP', margin, 50);

  pdf.setFontSize(20);
  pdf.setTextColor(37, 99, 235);
  pdf.text(isQuote ? 'QUOTATION' : 'INVOICE', pageWidth - margin, 50, { align: 'right' });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(100, 116, 139);
  pdf.text(doc.id, pageWidth - margin, 66, { align: 'right' });

  let y = 90;
  pdf.setDrawColor(226, 232, 240);
  pdf.line(margin, y, pageWidth - margin, y);
  y += 20;

  const leftCol = margin;
  const rightCol = pageWidth / 2 + 20;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(148, 163, 184);
  pdf.text('BILL TO', leftCol, y);
  pdf.text(isQuote ? 'QUOTE DETAILS' : 'INVOICE DETAILS', rightCol, y);
  y += 14;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(30, 41, 59);
  pdf.text(doc.customerName || '-', leftCol, y);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(71, 85, 105);
  const metaLines = isQuote
    ? [
        [`Quote Date:`, doc.quoteDate || '--'],
        [`Expiry Date:`, doc.validUntil || '--'],
        [`Salesperson:`, doc.salespersonName || '--'],
        ...(doc.referenceNumber ? [[`Reference #:`, doc.referenceNumber]] : [])
      ]
    : [
        [`Invoice Date:`, doc.invoiceDate || '--'],
        [`Due Date:`, doc.dueDate || '--'],
        [`Salesperson:`, doc.salespersonName || '--'],
        ...(doc.sourceQuotationId ? [[`From Quote:`, doc.sourceQuotationId]] : [])
      ];

  let metaY = y;
  metaLines.forEach(([label, value]) => {
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(100, 116, 139);
    pdf.text(label, rightCol, metaY);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(30, 41, 59);
    pdf.text(String(value), rightCol + 75, metaY);
    metaY += 14;
  });

  y += 14;
  if (doc.customerEmail || doc.customerPhone) {
    pdf.text([doc.customerEmail, doc.customerPhone].filter(Boolean).join('  ·  '), leftCol, y);
    y += 14;
  }
  if (doc.customerAddress) {
    const addrLines = pdf.splitTextToSize(doc.customerAddress, pageWidth / 2 - 60);
    pdf.text(addrLines, leftCol, y);
    y += addrLines.length * 12;
  }

  y = Math.max(y, metaY) + 20;

  const rows = (doc.items || []).map((item, i) => [
    String(i + 1),
    item.model ? `${item.productName}\n${item.model}` : (item.productName || ''),
    String(item.quantity ?? ''),
    money(item.unitPrice),
    money(item.lineTotal)
  ]);

  autoTable(pdf, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['#', 'Item', 'Qty', 'Price', 'Amount']],
    body: rows,
    styles: { font: 'helvetica', fontSize: 9, textColor: [51, 65, 85], cellPadding: 6 },
    headStyles: { fillColor: [241, 245, 249], textColor: [100, 116, 139], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 25 },
      2: { cellWidth: 40, halign: 'center' },
      3: { cellWidth: 80, halign: 'right' },
      4: { cellWidth: 80, halign: 'right' }
    }
  });

  let afterTableY = pdf.lastAutoTable.finalY + 20;

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

  afterTableY += 20;
  if (doc.customerNotes) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(148, 163, 184);
    pdf.text('NOTES', margin, afterTableY);
    afterTableY += 14;
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(71, 85, 105);
    const noteLines = pdf.splitTextToSize(doc.customerNotes, pageWidth - margin * 2);
    pdf.text(noteLines, margin, afterTableY);
    afterTableY += noteLines.length * 12 + 12;
  }

  if (doc.termsAndConditions) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(148, 163, 184);
    pdf.text('TERMS AND CONDITIONS', margin, afterTableY);
    afterTableY += 14;
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(71, 85, 105);
    const termLines = pdf.splitTextToSize(doc.termsAndConditions, pageWidth - margin * 2);
    pdf.text(termLines, margin, afterTableY);
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
