import React, { useState } from 'react';
import { Wallet, Users, IndianRupee, CheckCircle2, Clock, PlayCircle, FileText, Download, Landmark, X } from 'lucide-react';
import { downloadSalaryDisbursementPdf, buildSalaryDisbursementPdfBase64, buildChequePdfBase64 } from '../../utils/documentPdf';
import { exportToCsv } from '../../utils/exportCsv';

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

export default function PayrollView({ payrolls = [], employees = [], companyBank, onGeneratePayroll, onUpdatePayroll, onSendPayrollToBank }) {
  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey());
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [markingPaidId, setMarkingPaidId] = useState(null);
  const [showBankModal, setShowBankModal] = useState(false);
  const [bankChequeNumber, setBankChequeNumber] = useState('');
  const [bankChequeDate, setBankChequeDate] = useState('');
  const [bankError, setBankError] = useState('');
  const [sendingToBank, setSendingToBank] = useState(false);

  const monthRows = payrolls
    .filter(p => p.month === selectedMonth)
    .sort((a, b) => (a.employeeName || '').localeCompare(b.employeeName || ''));

  const totalNetPay = monthRows.reduce((sum, p) => sum + (Number(p.netPay) || 0), 0);
  const totalCommission = monthRows.reduce((sum, p) => sum + (Number(p.commission) || 0), 0);
  const paidCount = monthRows.filter(p => p.status === 'Paid').length;
  const pendingCount = monthRows.length - paidCount;
  const sentRow = monthRows.find(p => p.sentToBankAt);

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

  const handleExport = () => {
    exportToCsv(`Payroll-${monthLabel(selectedMonth)}`, [
      { label: 'Employee', value: 'employeeName' },
      { label: 'Department', value: (p) => p.department || '' },
      { label: 'Gross Earnings', value: (p) => p.grossEarnings || 0 },
      { label: 'LOP Days', value: (p) => p.lopDays || 0 },
      { label: 'Commission', value: (p) => p.commission || 0 },
      { label: 'Total Deductions', value: (p) => p.totalDeductions || 0 },
      { label: 'Net Pay', value: (p) => p.netPay || 0 },
      { label: 'Status', value: 'status' }
    ], monthRows);
  };

  const handleOpenBankModal = () => {
    setBankError('');
    setBankChequeNumber(String(companyBank?.nextChequeNumber ?? ''));
    setBankChequeDate(new Date().toISOString().split('T')[0]);
    setShowBankModal(true);
  };

  const handleSendToBank = async (e) => {
    e.preventDefault();
    setBankError('');
    if (!companyBank?.bankManagerEmail) {
      setBankError('Bank manager email is not configured. Set it up in Settings → Company Bank Account first.');
      return;
    }
    setSendingToBank(true);
    try {
      const chequePdfBase64 = await buildChequePdfBase64({
        bank: companyBank,
        chequeNumber: bankChequeNumber,
        chequeDate: bankChequeDate,
        amount: totalNetPay
      });
      const disbursementPdfBase64 = buildSalaryDisbursementPdfBase64({
        monthLabel: monthLabel(selectedMonth),
        rows: monthRows,
        employees
      });
      await onSendPayrollToBank(selectedMonth, {
        chequeNumber: bankChequeNumber,
        chequePdfBase64,
        disbursementPdfBase64
      });
      setShowBankModal(false);
      alert(`Cheque #${bankChequeNumber} and the disbursement sheet were emailed to ${companyBank.bankManagerEmail}.`);
    } catch (err) {
      setBankError(err.message || 'Failed to send payroll to the bank.');
    } finally {
      setSendingToBank(false);
    }
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

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
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
            <IndianRupee className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-wider">Total Commission Payout</span>
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2">{money(totalCommission)}</p>
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
            <div className="flex items-center gap-2">
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-600 text-slate-600 font-bold rounded-lg text-[11px] cursor-pointer transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
              <button
                onClick={handleDownloadDisbursementLetter}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-600 text-slate-600 font-bold rounded-lg text-[11px] cursor-pointer transition-all"
              >
                <FileText className="w-3.5 h-3.5" />
                Salary Disbursement Letter
              </button>
              <button
                onClick={handleOpenBankModal}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-[11px] cursor-pointer transition-all"
              >
                <Landmark className="w-3.5 h-3.5" />
                Send to Bank
              </button>
            </div>
          )}
        </div>

        {sentRow && (
          <div className="px-5 py-2.5 bg-emerald-50/60 border-t border-emerald-100 text-[11px] font-semibold text-emerald-700 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            Sent to bank (Cheque #{sentRow.chequeNumber}) on {new Date(sentRow.sentToBankAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} by {sentRow.sentToBankByName || '--'}
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee</th>
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</th>
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Gross</th>
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">LOP Days</th>
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Commission</th>
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
                  <td className="px-5 py-3.5 text-xs font-mono font-bold text-emerald-600 text-right">
                    {p.commission ? `+${money(p.commission)}` : '--'}
                    {p.commission > 0 && (
                      <span className="block text-[9px] font-semibold text-slate-400 normal-case">
                        {p.commissionPercent}% of {money(p.commissionSales)}
                      </span>
                    )}
                  </td>
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
                  <td colSpan={9} className="px-5 py-10 text-center text-xs text-slate-400 font-semibold">
                    No payroll generated for {monthLabel(selectedMonth)} yet. Click "Generate Payroll" to run it.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showBankModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Landmark className="w-4 h-4 text-blue-600" />
                Send Payroll to Bank
              </h3>
              <button onClick={() => setShowBankModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendToBank} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Month</p>
                  <p className="font-bold text-slate-700 mt-0.5">{monthLabel(selectedMonth)}</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total Payout</p>
                  <p className="font-bold text-blue-600 mt-0.5">{money(totalNetPay)}</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Bank Manager</p>
                {companyBank?.bankManagerEmail ? (
                  <p className="font-bold text-slate-700 mt-0.5">{companyBank.bankManagerName || 'Bank Manager'} — {companyBank.bankManagerEmail}</p>
                ) : (
                  <p className="font-semibold text-red-500 mt-0.5">Not configured — set it up in Settings → Company Bank Account.</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Cheque Number</label>
                  <input
                    type="text" required value={bankChequeNumber}
                    onChange={(e) => setBankChequeNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Cheque Date</label>
                  <input
                    type="date" required value={bankChequeDate}
                    onChange={(e) => setBankChequeDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {bankError && <p className="text-[11px] text-red-600 font-semibold bg-red-50 border border-red-100 rounded-xl px-3 py-2">{bankError}</p>}

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowBankModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={sendingToBank}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-500/10 cursor-pointer transition-all disabled:opacity-60"
                >
                  {sendingToBank ? 'Sending...' : 'Confirm & Send'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
