import React, { useState, useMemo } from 'react';
import { Download, Printer, Shield, FolderOpen, ArrowRight } from 'lucide-react';
import {
  downloadPayslipPdf, numberToIndianWords, payslipAmount, payslipWhole,
  PAYSLIP_TEMPLATE_URL, PAYSLIP_TEMPLATE_IMAGE_SIZE, PAYSLIP_TEMPLATE_FIELDS, PAYSLIP_PAGE_SIZE
} from '../../utils/documentPdf';

// PDF font sizes (documentPdf.js's PAYSLIP_TEMPLATE_FIELDS) are in points at
// the PDF's own page size; the on-screen SVG below renders in the template
// image's pixel space instead, so a size in points converts to image pixels
// at this ratio — keeping one field-position table as the source of truth
// for both instead of two hand-tuned layouts drifting apart.
const PX_PER_PT = PAYSLIP_TEMPLATE_IMAGE_SIZE.width / PAYSLIP_PAGE_SIZE.width;

function monthLabel(monthKey) {
  if (!monthKey) return '--';
  const [year, month] = monthKey.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

// Same value-computation as documentPdf.js's downloadPayslipPdf, so the
// on-screen preview always shows exactly what the download button produces.
// A value of `undefined` means "leave the template's own baked-in content
// untouched" (see PAYSLIP_TEMPLATE_FIELDS' `white` doc comment).
function buildPayslipFieldValues(employee, payslip, monthLbl) {
  const totalEarning = (Number(payslip.grossEarnings) || 0) + (Number(payslip.commission) || 0);
  const extraDeductions = (Number(payslip.lopAmount) || 0) + (Number(payslip.otherDeductions) || 0);
  return {
    email: employee.email || '',
    phone: employee.phone || '',
    month: monthLbl,
    name: employee.name || '--',
    employeeId: employee.id || employee.empId || '--',
    designation: employee.designation || '--',
    bankName: employee.bankName || '--',
    accountNo: employee.accountNo || '--',
    department: employee.department || '--',
    pan: employee.pan || '--',
    esiNo: employee.esiNo || '--',
    pfNo: employee.pfNo || '--',
    uanNo: employee.uanNo || '--',
    location: employee.location || '--',
    basicSalary: payslipAmount(payslip.basicPay),
    hra: payslipAmount(payslip.hra),
    medical: payslipAmount(payslip.medical),
    incentive: payslipAmount(payslip.commission),
    pfDeduction: payslipAmount(payslip.pf),
    advanceOrExtra: extraDeductions ? payslipAmount(extraDeductions) : undefined,
    totalEarning: payslipAmount(totalEarning),
    totalDeductions: payslipAmount((Number(payslip.totalDeductions) || 0) + extraDeductions),
    netPay: payslipWhole(payslip.netPay),
    daysPayable: Number(payslip.presentDays || 0).toFixed(2),
    amountWords: `Indian rupee ${numberToIndianWords(payslip.netPay)} only`,
    fatherName: employee.fatherName || undefined,
    fatherDob: employee.fatherName ? (employee.fatherDob || '--') : undefined
  };
}

// Renders the exact company payslip letterhead as the SVG background, with
// every dynamic value overlaid at the same coordinates documentPdf.js uses
// for the downloaded PDF — so the on-screen preview and the download are
// the same document, not two hand-maintained layouts.
function PayslipSvg({ employee, payslip, monthLbl }) {
  const { width: W, height: H } = PAYSLIP_TEMPLATE_IMAGE_SIZE;
  const values = buildPayslipFieldValues(employee, payslip, monthLbl);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block" role="img" aria-label={`Payslip for ${employee.name || 'employee'}, ${monthLbl}`}>
      <image href={PAYSLIP_TEMPLATE_URL} width={W} height={H} />
      {Object.entries(PAYSLIP_TEMPLATE_FIELDS).map(([key, spec]) => {
        const value = values[key];
        if (value === undefined) return null;
        return (
          <React.Fragment key={key}>
            {spec.white && (
              <rect x={spec.white[0]} y={spec.white[1]} width={spec.white[2]} height={spec.white[3]} fill="#fff" />
            )}
            {value !== '' && (
              <text
                x={spec.text[0]}
                y={spec.text[1]}
                fontSize={(spec.size || 9) * PX_PER_PT}
                fontWeight={spec.bold ? 700 : 400}
                fontStyle={spec.italic ? 'italic' : 'normal'}
                fontFamily="Helvetica, Arial, sans-serif"
                fill="#141414"
              >
                {value}
              </text>
            )}
          </React.Fragment>
        );
      })}
    </svg>
  );
}

export default function DocumentsView({ employee, payrolls = [] }) {
  const myPayslips = useMemo(
    () => payrolls
      // Non-admin/HR viewers only ever receive their own approved slips from
      // the backend (see filterPayrollsForViewer), but Admin/HR receive the
      // full company payroll unfiltered — re-apply both checks here so this
      // page never shows a slip before HR has approved it, even for one's own.
      .filter(p => p.employeeId === employee.id && p.approved)
      .sort((a, b) => b.month.localeCompare(a.month)),
    [payrolls, employee.id]
  );

  const [selectedMonth, setSelectedMonth] = useState(myPayslips[0]?.month || null);
  const selectedSlip = myPayslips.find(p => p.month === selectedMonth) || myPayslips[0] || null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    downloadPayslipPdf({ employee, payslip: selectedSlip, monthLabel: monthLabel(selectedSlip.month) });
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto font-sans text-slate-800 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Payslips & Handbooks</h2>
          <p className="text-xs text-slate-500 mt-1">Access salary statements and operational guidelines.</p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Payslips List */}
        <div className="lg:col-span-4 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center">
            <FolderOpen className="w-4 h-4 mr-1.5 text-blue-500" />
            Salary Statements
          </h3>
          <div className="space-y-2.5">
            {myPayslips.length === 0 && (
              <p className="text-[11px] text-slate-400 font-semibold px-1">
                No payslips generated yet. Contact HR once payroll has been processed.
              </p>
            )}
            {myPayslips.map((p) => (
              <button
                key={p.month}
                onClick={() => setSelectedMonth(p.month)}
                className={`w-full text-left px-3.5 py-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                  selectedMonth === p.month
                    ? 'bg-blue-50 border-blue-200 text-blue-600'
                    : 'bg-white border-slate-150 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <span>{monthLabel(p.month)} Payslip</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>

          <div className="border-t border-slate-50 pt-4 space-y-3">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Manuals & Documents</h4>
            {['Code of Conduct.pdf', 'Information Security Rules.pdf'].map(doc => (
              <div key={doc} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl text-[11px] font-semibold text-slate-600">
                <span className="truncate">{doc}</span>
                <span className="text-[9px] font-bold text-blue-600 hover:underline cursor-pointer">View</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right column: payslip document, formatted to match the printed/downloaded slip exactly */}
        <div className="print-area lg:col-span-8 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
          {!selectedSlip ? (
            <div className="py-16 text-center text-xs text-slate-400 font-semibold">
              No payslip to display yet.
            </div>
          ) : (
          <>
          {/* Toolbar (excluded from print/PDF) */}
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
              {selectedSlip.status === 'Paid' ? 'Paid' : 'Verified Statement'}
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrint}
                className="p-2 border border-slate-200 hover:border-slate-350 text-slate-500 hover:text-slate-700 bg-white rounded-xl transition-all cursor-pointer"
                title="Print statement"
              >
                <Printer className="w-4 h-4" />
              </button>
              <button
                onClick={handleDownload}
                className="p-2 border border-slate-200 hover:border-slate-350 text-slate-500 hover:text-slate-700 bg-white rounded-xl transition-all cursor-pointer"
                title="Download statement"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Payslip document — the company's own letterhead image with values overlaid, exact to the download */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <PayslipSvg employee={employee} payslip={selectedSlip} monthLbl={monthLabel(selectedSlip.month)} />
          </div>

          <div className="flex items-start space-x-2.5 p-3.5 bg-sky-50 border border-sky-100 text-sky-800 rounded-2xl text-[11px] font-semibold leading-relaxed">
            <Shield className="w-4.5 h-4.5 shrink-0 mt-0.5 text-sky-600" />
            <p>
              This slip is a digital replica generated securely for internal audit. Official physical copies are processed by HR.
            </p>
          </div>
          </>
          )}
        </div>
      </div>
    </div>
  );
}
