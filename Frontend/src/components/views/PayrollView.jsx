import React, { useState } from 'react';
import { Wallet, Users, IndianRupee, CheckCircle2, Clock, PlayCircle, FileText } from 'lucide-react';
import { downloadSalaryDisbursementPdf } from '../../utils/documentPdf';

const STATUS_STYLES = {
  Generated: 'bg-amber-50 text-amber-600 border-amber-100',
  Paid: 'bg-emerald-50 text-emerald-600 border-emerald-100'
};

const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

function currentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(monthKey) {
  if (!monthKey) return '--';
  const [year, month] = monthKey.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

export default function PayrollView({ payrolls = [], employees = [], onGeneratePayroll, onUpdatePayroll }) {
  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey());
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [markingPaidId, setMarkingPaidId] = useState(null);

  const monthRows = payrolls
    .filter(p => p.month === selectedMonth)
    .sort((a, b) => (a.employeeName || '').localeCompare(b.employeeName || ''));

  const totalNetPay = monthRows.reduce((sum, p) => sum + (Number(p.netPay) || 0), 0);
  const paidCount = monthRows.filter(p => p.status === 'Paid').length;
  const pendingCount = monthRows.length - paidCount;

  const handleGenerate = async () => {
    setError('');
    setGenerating(true);
    try {
      await onGeneratePayroll(selectedMonth);
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadDisbursementLetter = () => {
    downloadSalaryDisbursementPdf({ monthLabel: monthLabel(selectedMonth), rows: monthRows, employees });
  };

  const handleMarkPaid = async (payroll) => {
    setMarkingPaidId(payroll.id);
    try {
      await onUpdatePayroll(payroll.id, { status: 'Paid' });
    } catch (err) {
      alert(err.message);
    } finally {
      setMarkingPaidId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto font-sans text-slate-800 animate-in fade-in duration-200 p-4 md:p-6 space-y-6">

      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-blue-600" />
            Payroll Processing
          </h2>
          <p className="text-xs text-slate-500 mt-1">Generate monthly payslips from salary structure and attendance.</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-500/10 cursor-pointer transition-all disabled:opacity-60"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            {generating ? 'Generating...' : 'Generate Payroll'}
          </button>
        </div>
      </div>

      {error && (
        <div className="text-[11px] font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-400">
            <Users className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-wider">Employees Processed</span>
          </div>
          <p className="text-2xl font-black text-slate-800 mt-2">{monthRows.length}</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-400">
            <IndianRupee className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-wider">Total Net Payout</span>
          </div>
          <p className="text-2xl font-black text-blue-600 mt-2">{money(totalNetPay)}</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-400">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-wider">Paid / Pending</span>
          </div>
          <p className="text-2xl font-black text-slate-800 mt-2">
            <span className="text-emerald-600">{paidCount}</span>
            <span className="text-slate-300"> / </span>
            <span className="text-amber-600">{pendingCount}</span>
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-bold text-slate-600">{monthLabel(selectedMonth)}</span>
          </div>
          {monthRows.length > 0 && (
            <button
              onClick={handleDownloadDisbursementLetter}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-600 text-slate-600 font-bold rounded-lg text-[11px] cursor-pointer transition-all"
            >
              <FileText className="w-3.5 h-3.5" />
              Salary Disbursement Letter
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee</th>
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</th>
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Gross</th>
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">LOP Days</th>
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Deductions</th>
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Net Pay</th>
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {monthRows.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3.5 text-xs font-bold text-slate-800">{p.employeeName}</td>
                  <td className="px-5 py-3.5 text-xs font-semibold text-slate-500">{p.department || '--'}</td>
                  <td className="px-5 py-3.5 text-xs font-mono font-bold text-slate-700 text-right">{money(p.grossEarnings)}</td>
                  <td className="px-5 py-3.5 text-xs font-semibold text-slate-500 text-center">{p.lopDays}</td>
                  <td className="px-5 py-3.5 text-xs font-mono font-bold text-red-500 text-right">-{money(p.totalDeductions)}</td>
                  <td className="px-5 py-3.5 text-xs font-mono font-black text-blue-600 text-right">{money(p.netPay)}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${STATUS_STYLES[p.status] || STATUS_STYLES.Generated}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => handleMarkPaid(p)}
                      disabled={p.status === 'Paid' || markingPaidId === p.id}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-700 disabled:text-slate-300 disabled:cursor-not-allowed cursor-pointer transition-all"
                    >
                      {p.status === 'Paid' ? 'Paid' : (markingPaidId === p.id ? 'Marking...' : 'Mark Paid')}
                    </button>
                  </td>
                </tr>
              ))}

              {monthRows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-xs text-slate-400 font-semibold">
                    No payroll generated for {monthLabel(selectedMonth)} yet. Click "Generate Payroll" to run it.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
