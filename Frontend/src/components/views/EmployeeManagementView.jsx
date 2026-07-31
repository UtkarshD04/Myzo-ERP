import React, { useState } from 'react';
import { Plus, Search, UserCog, UserX, UserCheck2, Users, Trash2, AlertTriangle, Clock, ArrowLeft, MapPin, CalendarClock, FileSpreadsheet, ChevronRight, TrendingUp } from 'lucide-react';

const QUOTE_STATUS_STYLES = {
  Draft: 'bg-slate-50 text-slate-600 border-slate-100',
  Sent: 'bg-blue-50 text-blue-600 border-blue-100',
  Accepted: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  Rejected: 'bg-red-50 text-red-600 border-red-100'
};

const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

const EMPTY_FORM = {
  name: '',
  officialEmail: '',
  phone: '',
  department: '',
  designation: '',
  post: '',
  role: 'Employee',
  reportsTo: '',
  joiningDate: '',
  salary: '',
  basicPercent: '',
  hraPercent: '',
  medicalAllowance: '',
  pfPercent: '',
  commissionPercent: '',
  bankName: '',
  accountNo: '',
  ifscCode: '',
  pan: '',
  esiNo: '',
  pfNo: '',
  uanNo: '',
  location: '',
  fatherName: '',
  fatherDob: '',
  motherName: '',
  motherDob: ''
};

function currentMonthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default function EmployeeManagementView({ employee, employees = [], attendanceHistory = [], quotations = [], onAddEmployee, onUpdateEmployee, onDeleteEmployee }) {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  // Kept out of `form`/EMPTY_FORM on purpose: that same state also backs the
  // edit flow, and an empty `password: ''` field would round-trip into the
  // update payload and silently wipe the stored hash (see backend's
  // `if (updates.password)` check — an empty string is falsy but still gets
  // sent). Only ever read when creating a new account.
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [detailTab, setDetailTab] = useState('menu');
  const [attendanceMonth, setAttendanceMonth] = useState(currentMonthKey());

  const openEmployeeDetail = (emp) => {
    setSelectedEmployee(emp);
    setDetailTab('menu');
  };

  const filtered = employees.filter(e => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      e.name?.toLowerCase().includes(q) ||
      e.officialEmail?.toLowerCase().includes(q) ||
      e.department?.toLowerCase().includes(q) ||
      e.designation?.toLowerCase().includes(q)
    );
  });

  const openAddModal = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setPassword('');
    setError('');
    setShowModal(true);
  };

  const openEditModal = (emp) => {
    setEditingId(emp.id);
    setForm({
      name: emp.name || '',
      officialEmail: emp.officialEmail || '',
      phone: emp.phone || '',
      department: emp.department || '',
      designation: emp.designation || '',
      post: emp.post || '',
      role: emp.role || 'Employee',
      reportsTo: emp.reportsTo || '',
      joiningDate: emp.joiningDate || '',
      salary: emp.salary || '',
      basicPercent: emp.basicPercent ?? '',
      hraPercent: emp.hraPercent ?? '',
      medicalAllowance: emp.medicalAllowance ?? '',
      pfPercent: emp.pfPercent ?? '',
      commissionPercent: emp.commissionPercent ?? '',
      bankName: emp.bankName || '',
      accountNo: emp.accountNo || '',
      ifscCode: emp.ifscCode || '',
      pan: emp.pan || '',
      esiNo: emp.esiNo || '',
      pfNo: emp.pfNo || '',
      uanNo: emp.uanNo || '',
      location: emp.location || '',
      fatherName: emp.fatherName || '',
      fatherDob: emp.fatherDob || '',
      motherName: emp.motherName || '',
      motherDob: emp.motherDob || ''
    });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const payload = {
      ...form,
      ...(editingId ? {} : { password }),
      salary: form.salary ? Number(form.salary) : undefined,
      basicPercent: form.basicPercent !== '' ? Number(form.basicPercent) : undefined,
      hraPercent: form.hraPercent !== '' ? Number(form.hraPercent) : undefined,
      medicalAllowance: form.medicalAllowance !== '' ? Number(form.medicalAllowance) : undefined,
      pfPercent: form.pfPercent !== '' ? Number(form.pfPercent) : undefined,
      commissionPercent: form.commissionPercent !== '' ? Number(form.commissionPercent) : undefined
    };

    try {
      if (editingId) {
        await onUpdateEmployee(editingId, payload);
      } else {
        await onAddEmployee(payload);
      }
      setShowModal(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (emp) => {
    const nextStatus = emp.employmentStatus === 'Inactive' ? 'Active' : 'Inactive';
    try {
      await onUpdateEmployee(emp.id, { employmentStatus: nextStatus });
    } catch (err) {
      alert(err.message);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await onDeleteEmployee(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleting(false);
    }
  };

  if (selectedEmployee && detailTab === 'attendance') {
    const emp = selectedEmployee;
    const monthRecords = attendanceHistory
      .filter(a => a.employeeId === emp.id && (a.date || '').startsWith(attendanceMonth))
      .sort((a, b) => a.date.localeCompare(b.date));

    const daysPresent = monthRecords.filter(r => r.status === 'Present').length;
    const daysLate = monthRecords.filter(r => r.status === 'Late').length;
    const daysAbsent = monthRecords.filter(r => r.status === 'Absent').length;
    const totalHours = monthRecords.reduce((s, r) => s + (r.workingHours || 0), 0);
    const totalOvertime = monthRecords.reduce((s, r) => s + (r.overtime || 0), 0);

    const monthLabel = new Date(`${attendanceMonth}-01T00:00:00`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return (
      <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto font-sans text-slate-800 animate-in fade-in duration-200">
        <button
          onClick={() => setDetailTab('menu')}
          className="flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {emp.name}</span>
        </button>

        {/* Header card */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5 min-w-0">
            <img
              src={emp.photo}
              alt={emp.name}
              className="w-14 h-14 rounded-2xl object-cover border border-slate-100 shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-slate-800 truncate">{emp.name}</h2>
              <p className="text-xs text-slate-500 mt-0.5 truncate">{emp.designation} · {emp.department}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <CalendarClock className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="month"
              value={attendanceMonth}
              onChange={(e) => setAttendanceMonth(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Month summary stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm min-w-0">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block truncate">Days Present</span>
            <h3 className="text-2xl font-black text-slate-800 mt-1">{daysPresent}</h3>
            <span className="text-[10px] text-slate-400 font-semibold block mt-1.5 truncate">of {monthRecords.length} logged in {monthLabel}</span>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm min-w-0">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block truncate">Total Working Hours</span>
            <h3 className="text-2xl font-black text-slate-800 mt-1">{totalHours.toFixed(1)}h</h3>
            <span className="text-[10px] text-slate-400 font-semibold block mt-1.5 truncate">across {monthLabel}</span>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm min-w-0">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block truncate">Overtime</span>
            <h3 className="text-2xl font-black text-slate-800 mt-1">{totalOvertime.toFixed(1)}h</h3>
            <span className="text-[10px] text-slate-400 font-semibold block mt-1.5 truncate">beyond standard shift hours</span>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm min-w-0">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block truncate">Late / Absent</span>
            <h3 className="text-2xl font-black text-slate-800 mt-1">{daysLate} / {daysAbsent}</h3>
            <span className="text-[10px] text-slate-400 font-semibold block mt-1.5 truncate">late arrivals / absences</span>
          </div>
        </div>

        {/* Daily log table */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 pt-5">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-1">Daily Log — {monthLabel}</h3>
          </div>
          <div className="overflow-x-auto p-6 pt-3">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider">
                  <th className="py-3 pr-4 font-extrabold">Date</th>
                  <th className="py-3 pr-4 font-extrabold">Check-In</th>
                  <th className="py-3 pr-4 font-extrabold">Check-Out</th>
                  <th className="py-3 pr-4 font-extrabold">Hours</th>
                  <th className="py-3 pr-4 font-extrabold">Overtime</th>
                  <th className="py-3 pr-4 font-extrabold">Location</th>
                  <th className="py-3 font-extrabold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium">
                {monthRecords.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 font-semibold">
                      No attendance records for {monthLabel}.
                    </td>
                  </tr>
                )}
                {monthRecords.slice().reverse().map((log, index) => (
                  <tr key={index} className="hover:bg-slate-50/50">
                    <td className="py-3.5 pr-4 text-slate-800 font-bold">{log.date}</td>
                    <td className="py-3.5 pr-4 text-slate-600">{log.checkIn || '--:--'}</td>
                    <td className="py-3.5 pr-4 text-slate-600">{log.checkOut || 'Active'}</td>
                    <td className="py-3.5 pr-4 text-slate-700 font-mono">{log.workingHours ? `${log.workingHours}h` : '--'}</td>
                    <td className="py-3.5 pr-4 text-slate-500 font-mono">{log.overtime > 0 ? `+${log.overtime}h` : '0h'}</td>
                    <td className="py-3.5 pr-4 text-slate-500">
                      {(log.checkInLocation?.placeName || log.checkOutLocation?.placeName) ? (
                        <span className="flex items-center">
                          <MapPin className="w-3 h-3 text-blue-500 mr-1 shrink-0" />
                          <span className="truncate max-w-40">{log.checkInLocation?.placeName || log.checkOutLocation?.placeName}</span>
                        </span>
                      ) : '--'}
                    </td>
                    <td className="py-3.5">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${
                        log.status === 'Present' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        log.status === 'Late' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        log.status === 'Absent' ? 'bg-red-50 text-red-600 border-red-100' :
                        'bg-slate-50 text-slate-600 border-slate-100'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (selectedEmployee && detailTab === 'quotations') {
    const emp = selectedEmployee;
    const empQuotations = quotations
      .filter(q => q.salesperson === emp.id)
      .sort((a, b) => (b.createdAt || b.quoteDate || '').localeCompare(a.createdAt || a.quoteDate || ''));

    const totalCount = empQuotations.length;
    const totalValue = empQuotations.reduce((s, q) => s + (q.totalAmount || 0), 0);
    const acceptedQuotes = empQuotations.filter(q => q.status === 'Accepted');
    const rejectedQuotes = empQuotations.filter(q => q.status === 'Rejected');
    const acceptedValue = acceptedQuotes.reduce((s, q) => s + (q.totalAmount || 0), 0);
    const decidedCount = acceptedQuotes.length + rejectedQuotes.length;
    const winRate = decidedCount > 0 ? Math.round((acceptedQuotes.length / decidedCount) * 100) : 0;
    const statusCounts = ['Draft', 'Sent', 'Accepted', 'Rejected'].map(st => ({
      status: st,
      count: empQuotations.filter(q => q.status === st).length
    }));

    return (
      <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto font-sans text-slate-800 animate-in fade-in duration-200">
        <button
          onClick={() => setDetailTab('menu')}
          className="flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {emp.name}</span>
        </button>

        {/* Header card */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center space-x-3.5">
          <img
            src={emp.photo}
            alt={emp.name}
            className="w-14 h-14 rounded-2xl object-cover border border-slate-100 shrink-0"
            referrerPolicy="no-referrer"
          />
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-slate-800 truncate">{emp.name} — Quotation Performance</h2>
            <p className="text-xs text-slate-500 mt-0.5 truncate">{emp.designation} · {emp.department}</p>
          </div>
        </div>

        {/* Performance stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm min-w-0">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block truncate">Total Quotations</span>
            <h3 className="text-2xl font-black text-slate-800 mt-1">{totalCount}</h3>
            <span className="text-[10px] text-slate-400 font-semibold block mt-1.5 truncate">created by {emp.name.split(' ')[0]}</span>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm min-w-0">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block truncate">Total Value Quoted</span>
            <h3 className="text-2xl font-black text-slate-800 mt-1 truncate">{money(totalValue)}</h3>
            <span className="text-[10px] text-slate-400 font-semibold block mt-1.5 truncate">across all quotations</span>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm min-w-0">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block truncate">Accepted Value</span>
            <h3 className="text-2xl font-black text-slate-800 mt-1 truncate">{money(acceptedValue)}</h3>
            <span className="text-[10px] text-emerald-500 font-bold block mt-1.5 truncate">{acceptedQuotes.length} won</span>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm min-w-0">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block truncate">Win Rate</span>
            <h3 className="text-2xl font-black text-slate-800 mt-1 flex items-center">
              {winRate}% <TrendingUp className="w-4 h-4 ml-1.5 text-emerald-500 shrink-0" />
            </h3>
            <span className="text-[10px] text-slate-400 font-semibold block mt-1.5 truncate">{decidedCount} decided quotation{decidedCount === 1 ? '' : 's'}</span>
          </div>
        </div>

        {/* Status breakdown */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-4">Status Breakdown</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {statusCounts.map(({ status, count }) => (
              <div key={status} className={`rounded-xl border p-3.5 text-center ${QUOTE_STATUS_STYLES[status]}`}>
                <span className="text-xl font-black block">{count}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider">{status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quotations table */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 pt-5">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-1">All Quotations</h3>
          </div>
          <div className="overflow-x-auto p-6 pt-3">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider">
                  <th className="py-3 pr-4 font-extrabold">Quote #</th>
                  <th className="py-3 pr-4 font-extrabold">Customer</th>
                  <th className="py-3 pr-4 font-extrabold">Items</th>
                  <th className="py-3 pr-4 font-extrabold">Total</th>
                  <th className="py-3 pr-4 font-extrabold">Status</th>
                  <th className="py-3 font-extrabold">Quote Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium">
                {empQuotations.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 font-semibold">
                      {emp.name} hasn't created any quotations yet.
                    </td>
                  </tr>
                )}
                {empQuotations.map(q => (
                  <tr key={q.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 pr-4">
                      <span className="font-mono text-[10px] font-bold text-blue-500 bg-blue-50/50 px-1.5 py-0.5 rounded border border-blue-100">
                        {q.id}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-slate-800 font-bold">{q.customerName}</td>
                    <td className="py-3.5 pr-4 text-slate-500">{q.items?.length || 0} item(s)</td>
                    <td className="py-3.5 pr-4 text-slate-800 font-bold font-mono">{money(q.totalAmount)}</td>
                    <td className="py-3.5 pr-4">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${QUOTE_STATUS_STYLES[q.status] || QUOTE_STATUS_STYLES.Draft}`}>
                        {q.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-400">{q.quoteDate || '--'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (selectedEmployee) {
    const emp = selectedEmployee;
    const empQuotationCount = quotations.filter(q => q.salesperson === emp.id).length;
    const todayKey = currentMonthKey();
    const monthAttendanceCount = attendanceHistory.filter(a => a.employeeId === emp.id && (a.date || '').startsWith(todayKey) && a.status === 'Present').length;

    return (
      <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto font-sans text-slate-800 animate-in fade-in duration-200">
        <button
          onClick={() => setSelectedEmployee(null)}
          className="flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Employee Directory</span>
        </button>

        {/* Header card */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center space-x-3.5">
          <img
            src={emp.photo}
            alt={emp.name}
            className="w-16 h-16 rounded-2xl object-cover border border-slate-100 shrink-0"
            referrerPolicy="no-referrer"
          />
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-slate-800 truncate">{emp.name}</h2>
            <p className="text-xs text-slate-500 mt-0.5 truncate">{emp.designation} · {emp.department}</p>
            <span className={`inline-block mt-1.5 text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${
              emp.employmentStatus === 'Inactive'
                ? 'bg-red-50 text-red-600 border-red-100'
                : 'bg-emerald-50 text-emerald-600 border-emerald-100'
            }`}>
              {emp.employmentStatus || 'Active'}
            </span>
          </div>
        </div>

        {/* Option cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => setDetailTab('attendance')}
            className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm text-left cursor-pointer hover:border-blue-200 hover:bg-blue-50/20 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                <Clock className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 mt-4">Attendance</h3>
            <p className="text-xs text-slate-500 mt-1">Monthly check-in/out history, working hours and overtime.</p>
            <p className="text-[10px] text-slate-400 font-semibold mt-3">{monthAttendanceCount} day(s) present this month</p>
          </button>

          <button
            onClick={() => setDetailTab('quotations')}
            className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm text-left cursor-pointer hover:border-blue-200 hover:bg-blue-50/20 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 mt-4">Quotations</h3>
            <p className="text-xs text-slate-500 mt-1">Quotations created, their status and win-rate performance.</p>
            <p className="text-[10px] text-slate-400 font-semibold mt-3">{empQuotationCount} quotation(s) created</p>
          </button>
        </div>
      </div>
    );
  }

  if (showModal) {
    return (
      <div className="p-4 md:p-6 space-y-6 max-w-3xl mx-auto font-sans text-slate-800 animate-in fade-in duration-200">
        <button
          onClick={() => setShowModal(false)}
          className="flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-blue-600 cursor-pointer transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Employee Directory</span>
        </button>

        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2.5">
            <Users className="w-5 h-5 text-blue-600" />
            <span>{editingId ? 'Edit Employee' : 'Onboard New Employee'}</span>
          </h2>
        </div>

        {error && (
          <div className="text-[11px] font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Official Email</label>
            <input
              type="email"
              required
              disabled={!!editingId}
              value={form.officialEmail}
              onChange={(e) => setForm({ ...form, officialEmail: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 disabled:text-slate-400"
            />
          </div>

          {!editingId && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Login Password</label>
              <input
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Department</label>
              <input
                type="text"
                required
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Designation</label>
              <input
                type="text"
                required
                value={form.designation}
                onChange={(e) => setForm({ ...form, designation: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              >
                <option value="Employee">Employee</option>
                <option value="Manager">Manager</option>
                <option value="HR">HR</option>
                {/* Only an Admin can grant the Admin role (enforced server-side too) —
                    still shown when editing a record that's already Admin, so HR can
                    see/save its other fields without the select silently losing the value. */}
                {(employee?.role === 'Admin' || form.role === 'Admin') && (
                  <option value="Admin">Admin</option>
                )}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Phone</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={10}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Joining Date</label>
              <input
                type="date"
                value={form.joiningDate}
                onChange={(e) => setForm({ ...form, joiningDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Salary</label>
              <input
                type="number"
                value={form.salary}
                onChange={(e) => setForm({ ...form, salary: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Basic % of Salary</label>
              <input
                type="number"
                placeholder="50"
                value={form.basicPercent}
                onChange={(e) => setForm({ ...form, basicPercent: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">HRA % of Basic</label>
              <input
                type="number"
                placeholder="40"
                value={form.hraPercent}
                onChange={(e) => setForm({ ...form, hraPercent: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Medical Allowance</label>
              <input
                type="number"
                placeholder="2000"
                value={form.medicalAllowance}
                onChange={(e) => setForm({ ...form, medicalAllowance: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">PF % of Basic</label>
              <input
                type="number"
                placeholder="12"
                value={form.pfPercent}
                onChange={(e) => setForm({ ...form, pfPercent: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Commission % of Closed Sales</label>
              <input
                type="number"
                placeholder="0"
                value={form.commissionPercent}
                onChange={(e) => setForm({ ...form, commissionPercent: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
              <p className="text-[9px] text-slate-400 font-medium mt-1">Paid on quotations this employee closes each month; included automatically in payroll.</p>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Reports To</label>
            <select
              value={form.reportsTo}
              onChange={(e) => setForm({ ...form, reportsTo: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
            >
              <option value="">No one (top of hierarchy)</option>
              {employees.filter(e => e.id !== editingId).map(e => (
                <option key={e.id} value={e.id}>{e.name} ({e.designation || e.role})</option>
              ))}
            </select>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-3">Banking Details</h3>
            <p className="text-[10px] text-slate-400 font-semibold mb-3">Used to populate the Salary Disbursement Letter — visible/editable to Admin and HR only.</p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Bank Name</label>
                <input
                  type="text"
                  value={form.bankName}
                  onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Account No.</label>
                <input
                  type="text"
                  value={form.accountNo}
                  onChange={(e) => setForm({ ...form, accountNo: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">IFSC Code</label>
                <input
                  type="text"
                  value={form.ifscCode}
                  onChange={(e) => setForm({ ...form, ifscCode: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-3">Statutory & Payslip Details</h3>
            <p className="text-[10px] text-slate-400 font-semibold mb-3">Printed on the employee's payslip — visible/editable to Admin and HR only.</p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">PAN</label>
                <input
                  type="text"
                  value={form.pan}
                  onChange={(e) => setForm({ ...form, pan: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">ESI No.</label>
                <input
                  type="text"
                  value={form.esiNo}
                  onChange={(e) => setForm({ ...form, esiNo: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">PF No.</label>
                <input
                  type="text"
                  value={form.pfNo}
                  onChange={(e) => setForm({ ...form, pfNo: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">UAN No.</label>
                <input
                  type="text"
                  value={form.uanNo}
                  onChange={(e) => setForm({ ...form, uanNo: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Location</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-3">Family Details (for Payslip)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Father's Name</label>
                <input
                  type="text"
                  value={form.fatherName}
                  onChange={(e) => setForm({ ...form, fatherName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Father's DOB</label>
                <input
                  type="date"
                  value={form.fatherDob}
                  onChange={(e) => setForm({ ...form, fatherDob: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Mother's Name</label>
                <input
                  type="text"
                  value={form.motherName}
                  onChange={(e) => setForm({ ...form, motherName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Mother's DOB</label>
                <input
                  type="date"
                  value={form.motherDob}
                  onChange={(e) => setForm({ ...form, motherDob: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3.5 pt-2">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs cursor-pointer transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-500/10 cursor-pointer transition-all disabled:opacity-60"
            >
              {submitting ? 'Saving...' : editingId ? 'Save Changes' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto font-sans text-slate-800 animate-in fade-in duration-200">
      {/* Header card */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Employee Directory</h2>
          <p className="text-xs text-slate-500 mt-1">Onboard, edit, and manage employee accounts.</p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center space-x-2 shadow-md shadow-blue-500/10 cursor-pointer transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-center space-x-2.5">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Search by name, email, department, designation..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee</th>
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</th>
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Designation</th>
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(emp => (
                <tr key={emp.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => openEmployeeDetail(emp)}
                      title="View employee details"
                      className="flex items-center space-x-3 min-w-0 cursor-pointer group text-left"
                    >
                      <img
                        src={emp.photo}
                        alt={emp.name}
                        className="w-8 h-8 rounded-xl object-cover border border-slate-100 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-slate-800 truncate group-hover:text-blue-600 transition-colors">{emp.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{emp.officialEmail}</p>
                      </div>
                    </button>
                  </td>
                  <td className="px-5 py-3.5 text-xs font-semibold text-slate-600">{emp.department}</td>
                  <td className="px-5 py-3.5 text-xs font-semibold text-slate-600">{emp.designation}</td>
                  <td className="px-5 py-3.5 text-xs font-semibold text-slate-600">{emp.role}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${
                      emp.employmentStatus === 'Inactive'
                        ? 'bg-red-50 text-red-600 border-red-100'
                        : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                    }`}>
                      {emp.employmentStatus || 'Active'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => { setSelectedEmployee(emp); setDetailTab('attendance'); }}
                        title="View attendance details"
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 cursor-pointer transition-all"
                      >
                        <Clock className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => { setSelectedEmployee(emp); setDetailTab('quotations'); }}
                        title="View quotation performance"
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 cursor-pointer transition-all"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openEditModal(emp)}
                        title="Edit employee"
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 cursor-pointer transition-all"
                      >
                        <UserCog className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => toggleStatus(emp)}
                        title={emp.employmentStatus === 'Inactive' ? 'Reactivate employee' : 'Deactivate employee'}
                        className={`p-1.5 rounded-lg border cursor-pointer transition-all ${
                          emp.employmentStatus === 'Inactive'
                            ? 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                            : 'border-red-200 text-red-500 hover:bg-red-50'
                        }`}
                      >
                        {emp.employmentStatus === 'Inactive'
                          ? <UserCheck2 className="w-3.5 h-3.5" />
                          : <UserX className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => setDeleteTarget(emp)}
                        title="Delete employee"
                        className="p-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 cursor-pointer transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-xs text-slate-400 font-semibold">
                    No employees match this search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-100 rounded-3xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2.5 bg-red-50 rounded-xl shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="font-extrabold text-sm text-slate-800">Delete Employee?</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              This will permanently delete <span className="font-bold text-slate-700">{deleteTarget.name}</span> from the database. This action cannot be undone.
            </p>

            <div className="flex items-center space-x-3.5 pt-5">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs cursor-pointer transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-red-500/10 cursor-pointer transition-all disabled:opacity-60"
              >
                {deleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
