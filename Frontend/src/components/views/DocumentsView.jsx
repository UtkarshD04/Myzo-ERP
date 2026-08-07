import React, { useState, useMemo } from 'react';
import { Download, Printer, Shield, FolderOpen, ArrowRight } from 'lucide-react';
import { downloadPayslipPdf, numberToIndianWords, COMPANY_INFO } from '../../utils/documentPdf';

// Plain figures, no currency symbol or thousands grouping — matches the
// company's standard printed pay slip: non-zero shows 2 decimals, zero
// shows as a bare "0".
const money = (n) => {
  const num = Number(n) || 0;
  return num === 0 ? '0' : num.toFixed(2);
};

function monthLabel(monthKey) {
  if (!monthKey) return '--';
  const [year, month] = monthKey.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-baseline gap-1.5 px-3 py-1.5">
      <span className="font-bold text-slate-900 shrink-0">{label}:</span>
      <span className="text-slate-900 font-semibold truncate">{value || '--'}</span>
    </div>
  );
}

function AmountRow({ label, value }) {
  return (
    <div className="flex items-center justify-between px-3 py-1.5 gap-2">
      <span className="text-slate-900 font-semibold">{label}:</span>
      <span className="font-bold text-slate-900">{money(value)}</span>
    </div>
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

  const totalEarning = selectedSlip ? (Number(selectedSlip.grossEarnings) || 0) + (Number(selectedSlip.commission) || 0) : 0;

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

          {/* Payslip document */}
          <div className="border-2 border-slate-800 text-[11px] text-slate-900 bg-white">
            {/* Header: logo top-left, company name/address centered independent of it */}
            <div className="relative px-4 pt-4 pb-3 text-center">
              <img src={COMPANY_INFO.logoUrl} alt="Company logo" className="absolute left-4 top-4 h-11 w-auto object-contain" />
              {/* Shows this employee's own registered email/phone, matching
                  the reference letterhead which prints the slip-holder's own
                  contact details here rather than a fixed company line. */}
              <div className="absolute right-4 top-4 text-right text-[9px] font-semibold text-slate-700 space-y-0.5">
                {employee.email && <p>Email: {employee.email}</p>}
                {employee.phone && <p>Contact No: {employee.phone}</p>}
                {COMPANY_INFO.gstin && <p>GSTIN: {COMPANY_INFO.gstin}</p>}
              </div>
              <h3 className="text-sm font-black tracking-tight">{COMPANY_INFO.name}</h3>
              {COMPANY_INFO.addressLines.map(line => (
                <p key={line} className="text-[10px] font-semibold">{line}</p>
              ))}
            </div>

            {/* Pay Slip For Month */}
            <div className="px-4 py-2 border-t border-slate-800 font-bold text-xs">
              Pay Slip For Month : {monthLabel(selectedSlip.month)}
            </div>

            {/* Employee / statutory info grid */}
            <div className="grid grid-cols-2 divide-x divide-slate-800 border-t border-slate-800">
              <div>
                <InfoRow label="Name" value={employee.name} />
                <InfoRow label="Employee ID" value={employee.id || employee.empId} />
                <InfoRow label="Designation" value={employee.designation} />
                <InfoRow label="Bank Name" value={employee.bankName} />
                <InfoRow label="Bank Account No" value={employee.accountNo} />
                <InfoRow label="Department" value={employee.department} />
              </div>
              <div>
                <InfoRow label="PAN" value={employee.pan} />
                <InfoRow label="ESI No" value={employee.esiNo} />
                <InfoRow label="PF No" value={employee.pfNo} />
                <InfoRow label="UAN No" value={employee.uanNo} />
                <InfoRow label="Location" value={employee.location} />
                <InfoRow label="Mode of Payment" value="Bank Transfer" />
              </div>
            </div>

            {/* Earnings / Deductions headers */}
            <div className="grid grid-cols-2 divide-x divide-slate-800 border-t border-slate-800 font-extrabold text-[10px] uppercase tracking-wider">
              <div className="flex justify-between px-3 py-2"><span>Earnings</span><span>Amount</span></div>
              <div className="flex justify-between px-3 py-2"><span>Deductions</span><span>Amount</span></div>
            </div>
            <div className="grid grid-cols-2 divide-x divide-slate-800 border-t border-slate-800">
              <div>
                <AmountRow label="Basic Salary" value={selectedSlip.basicPay} />
                <AmountRow label="HRA" value={selectedSlip.hra} />
                <AmountRow label="Conveyance Allowance" value={0} />
                <AmountRow label="Medical Allowance" value={selectedSlip.medical} />
                {!!selectedSlip.commission && <AmountRow label="Incentive" value={selectedSlip.commission} />}
              </div>
              <div>
                <AmountRow label="PF" value={selectedSlip.pf} />
                <AmountRow label="ESI" value={0} />
                <AmountRow label="TDS" value={0} />
                <AmountRow label="Advance" value={0} />
                {!!selectedSlip.lopAmount && <AmountRow label={`Loss of Pay (${selectedSlip.lopDays}d)`} value={selectedSlip.lopAmount} />}
                {!!selectedSlip.otherDeductions && <AmountRow label="Other Deductions" value={selectedSlip.otherDeductions} />}
              </div>
            </div>

            {/* Totals */}
            <div className="grid grid-cols-2 divide-x divide-slate-800 border-t border-slate-800 font-bold text-xs">
              <div className="flex justify-between px-3 py-2"><span>Total Earning</span><span>{money(totalEarning)}</span></div>
              <div className="flex justify-between px-3 py-2"><span>Total Deductions</span><span>{money(selectedSlip.totalDeductions)}</span></div>
            </div>

            {/* Net Pay (left) | Days Payable + Arrear Days (right) */}
            <div className="grid grid-cols-2 border-t border-slate-800">
              <div className="flex items-center gap-3 px-3 py-2.5 font-bold text-sm">
                <span>Net Pay</span>
                <span>{Math.round(Number(selectedSlip.netPay) || 0)}</span>
              </div>
              <div className="px-3 py-2 text-xs font-semibold space-y-1">
                <p>Days payable: {Number(selectedSlip.presentDays || 0).toFixed(2)}</p>
                <p>Arrear Days: 0.00</p>
              </div>
            </div>

            {/* Amount in words */}
            <div className="px-4 py-2 border-t border-slate-800 text-[11px] italic">
              Indian rupee {numberToIndianWords(selectedSlip.netPay)} only
            </div>

            {/* Relation */}
            <div className="grid grid-cols-3 gap-2 px-3 py-2 border-t border-slate-800 text-[10px] font-extrabold uppercase tracking-wider">
              <span>Relation</span>
              <span>Name</span>
              <span>DOB</span>
            </div>
            <div className="grid grid-cols-3 gap-2 px-3 py-1 text-xs font-semibold">
              <span>Father's Name</span>
              <span>{employee.fatherName || '--'}</span>
              <span>{employee.fatherDob || '--'}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 px-3 py-1 text-xs font-semibold">
              <span>Mother's Name</span>
              <span>{employee.motherName || '--'}</span>
              <span>{employee.motherDob || '--'}</span>
            </div>

            <div className="px-4 py-4 text-xs font-semibold">Authorized Signatory: ______________________</div>
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
