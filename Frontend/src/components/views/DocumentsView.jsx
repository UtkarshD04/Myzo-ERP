import React, { useState, useMemo } from 'react';
import { Download, Printer, Shield, FolderOpen, ArrowRight } from 'lucide-react';

const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

function monthLabel(monthKey) {
  if (!monthKey) return '--';
  const [year, month] = monthKey.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

export default function DocumentsView({ employee, payrolls = [] }) {
  const myPayslips = useMemo(
    () => payrolls
      .filter(p => p.employeeId === employee.id)
      .sort((a, b) => b.month.localeCompare(a.month)),
    [payrolls, employee.id]
  );

  const [selectedMonth, setSelectedMonth] = useState(myPayslips[0]?.month || null);
  const selectedSlip = myPayslips.find(p => p.month === selectedMonth) || myPayslips[0] || null;

  const handlePrint = () => {
    window.print();
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

        {/* Right column: Interactive digital payslip visualizer */}
        <div className="lg:col-span-8 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
          {!selectedSlip ? (
            <div className="py-16 text-center text-xs text-slate-400 font-semibold">
              No payslip to display yet.
            </div>
          ) : (
          <>
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                {selectedSlip.status === 'Paid' ? 'Paid' : 'Verified Statement'}
              </span>
              <h3 className="text-base font-black text-slate-800 tracking-tight mt-2.5">
                Salary slip: {monthLabel(selectedSlip.month)}
              </h3>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrint}
                className="p-2 border border-slate-200 hover:border-slate-350 text-slate-500 hover:text-slate-700 bg-white rounded-xl transition-all cursor-pointer"
                title="Print statement"
              >
                <Printer className="w-4 h-4" />
              </button>
              <button
                onClick={() => alert('Download PDF mock initiated.')}
                className="p-2 border border-slate-200 hover:border-slate-350 text-slate-500 hover:text-slate-700 bg-white rounded-xl transition-all cursor-pointer"
                title="Download statement"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Payslip parameters */}
          <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-600 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
            <div>
              <span className="text-[9px] font-bold text-slate-400 block uppercase">Employee Name</span>
              <span className="text-slate-800 font-bold block mt-0.5">{employee.name}</span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-400 block uppercase">Employee ID</span>
              <span className="text-slate-800 font-bold block mt-0.5">{employee.id}</span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-400 block uppercase">Designation</span>
              <span className="text-slate-800 font-bold block mt-0.5">{employee.designation}</span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-400 block uppercase">Department</span>
              <span className="text-slate-800 font-bold block mt-0.5">{employee.department}</span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-400 block uppercase">Working Days</span>
              <span className="text-slate-800 font-bold block mt-0.5">{selectedSlip.workingDays}</span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-400 block uppercase">Present Days (LOP Days)</span>
              <span className="text-slate-800 font-bold block mt-0.5">{selectedSlip.presentDays} ({selectedSlip.lopDays})</span>
            </div>
          </div>

          <div className="border border-slate-100 rounded-2xl overflow-hidden text-xs">
            <div className="grid grid-cols-2 font-extrabold text-[10px] uppercase tracking-wider bg-slate-50 text-slate-400 p-3.5 border-b border-slate-100">
              <span>Earnings</span>
              <span>Deductions</span>
            </div>
            <div className="grid grid-cols-2 divide-x divide-slate-100 font-medium">
              {/* Earnings */}
              <div className="p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Basic Pay:</span>
                  <span className="font-bold text-slate-700">{money(selectedSlip.basicPay)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">HRA Allowance ({selectedSlip.hraPercent}%):</span>
                  <span className="font-bold text-slate-700">{money(selectedSlip.hra)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Medical Allowance:</span>
                  <span className="font-bold text-slate-700">{money(selectedSlip.medical)}</span>
                </div>
              </div>

              {/* Deductions */}
              <div className="p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Provident Fund ({selectedSlip.pfPercent}%):</span>
                  <span className="font-bold text-slate-700">{money(selectedSlip.pf)}</span>
                </div>
                {!!selectedSlip.lopAmount && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Loss of Pay ({selectedSlip.lopDays} days):</span>
                    <span className="font-bold text-slate-700">{money(selectedSlip.lopAmount)}</span>
                  </div>
                )}
                {!!selectedSlip.otherDeductions && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Other Deductions:</span>
                    <span className="font-bold text-slate-700">{money(selectedSlip.otherDeductions)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Net Salary Row */}
            <div className="grid grid-cols-2 bg-blue-600 text-white font-black text-sm p-4.5 border-t border-slate-100">
              <span>NET TAKE HOME PAY</span>
              <span className="text-right">{money(selectedSlip.netPay)}</span>
            </div>
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
