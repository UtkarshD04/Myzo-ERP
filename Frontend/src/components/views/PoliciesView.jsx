import React, { useState, useMemo } from 'react';
import {
  BookOpen, Download, ExternalLink, CheckCircle2, AlertCircle, ShieldCheck, FileText, Users, Search
} from 'lucide-react';
import { POLICIES, getPolicy, findAcknowledgement } from '../../config/policies';

function formatDate(value) {
  if (!value) return '--';
  return new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function AcknowledgementTracker({ policy, employees, acknowledgements }) {
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');

  const rows = useMemo(() => employees.map(emp => ({
    emp,
    ack: findAcknowledgement(acknowledgements, policy, emp.id),
  })), [employees, acknowledgements, policy]);

  const signedCount = rows.filter(r => r.ack).length;
  const pct = rows.length ? Math.round((signedCount / rows.length) * 100) : 0;

  const q = query.trim().toLowerCase();
  const visible = rows
    .filter(r => filter === 'all' || (filter === 'signed' ? r.ack : !r.ack))
    .filter(r => !q || [r.emp.name, r.emp.id, r.emp.department].some(v => v?.toLowerCase().includes(q)))
    .sort((a, b) => (a.ack ? 1 : 0) - (b.ack ? 1 : 0) || (a.emp.name || '').localeCompare(b.emp.name || ''));

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center">
            <Users className="w-4 h-4 mr-1.5 text-blue-500" />
            Acknowledgment Tracker
          </h3>
          <p className="text-[11px] text-slate-400 font-semibold mt-1">
            {policy.title} v{policy.version}: {signedCount} of {rows.length} employees signed ({pct}%)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search employee"
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-800 focus:outline-none focus:border-blue-500 w-40"
            />
          </div>
          {[
            { id: 'all', label: 'All' },
            { id: 'pending', label: `Pending (${rows.length - signedCount})` },
            { id: 'signed', label: 'Signed' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold border cursor-pointer transition-all ${
                filter === f.id ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-[11px]">
          <thead>
            <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
              <th className="py-2 pr-3">Employee</th>
              <th className="py-2 pr-3">Department</th>
              <th className="py-2 pr-3">Status</th>
              <th className="py-2">Signed On</th>
            </tr>
          </thead>
          <tbody>
            {visible.map(({ emp, ack }) => (
              <tr key={emp.id} className="border-b border-slate-50">
                <td className="py-2.5 pr-3">
                  <p className="font-bold text-slate-700">{emp.name}</p>
                  <p className="text-[10px] text-slate-400">{emp.id}</p>
                </td>
                <td className="py-2.5 pr-3 text-slate-500 font-semibold">{emp.department || '--'}</td>
                <td className="py-2.5 pr-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    ack ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                  }`}>
                    {ack ? 'Acknowledged' : 'Pending'}
                  </span>
                </td>
                <td className="py-2.5 text-slate-500 font-semibold">{ack ? formatDate(ack.acknowledgedAt) : '--'}</td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={4} className="py-6 text-center text-slate-400 font-semibold">No employees match.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function PoliciesView({ employee, employees = [], policyAcknowledgements = [], onAcknowledgePolicy }) {
  const [selectedId, setSelectedId] = useState(POLICIES[0].id);
  const [page, setPage] = useState(1);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const policy = getPolicy(selectedId);
  const myAck = findAcknowledgement(policyAcknowledgements, policy, employee.id);
  const isHR = employee.role === 'Admin' || employee.role === 'HR';
  const pdfUrl = `${policy.file}#page=${page}`;

  const selectPolicy = (id) => {
    setSelectedId(id);
    setPage(1);
    setAgreed(false);
  };

  const handleAcknowledge = async () => {
    setSubmitting(true);
    try {
      await onAcknowledgePolicy(policy.id);
      setAgreed(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const meta = [
    ['Version', policy.version],
    ['Effective', policy.effectiveDate],
    ['Policy Owner', policy.owner],
    ['Approved By', policy.approvedBy],
    ['Applies To', policy.appliesTo],
  ].filter(([, v]) => v);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto font-sans text-slate-800 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          Company Policies
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Read the MZOBS Code of Conduct and HR Policy, and record your acknowledgment.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: policy list + sections */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-2.5">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center mb-1">
              <FileText className="w-4 h-4 mr-1.5 text-blue-500" />
              Documents
            </h3>
            {POLICIES.map(p => {
              const ack = findAcknowledgement(policyAcknowledgements, p, employee.id);
              return (
                <button
                  key={p.id}
                  onClick={() => selectPolicy(p.id)}
                  className={`w-full text-left px-3.5 py-3 rounded-xl border transition-all cursor-pointer ${
                    selectedId === p.id ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-150 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-xs font-bold ${selectedId === p.id ? 'text-blue-600' : 'text-slate-600'}`}>{p.title}</span>
                    {ack ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-100 shrink-0">Pending</span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 font-semibold mt-1 leading-relaxed">{p.summary}</p>
                </button>
              );
            })}
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Contents</h4>
            <div className="space-y-0.5">
              {policy.sections.map((s, i) => (
                <button
                  key={s.title}
                  onClick={() => setPage(s.page)}
                  className="w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-left text-[11px] font-semibold text-slate-600 hover:bg-slate-50 hover:text-blue-600 cursor-pointer transition-colors"
                >
                  <span>{i + 1}. {s.title}</span>
                  <span className="text-[10px] text-slate-400 shrink-0">p. {s.page}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: document */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-800">{policy.title}</h3>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
                  {meta.map(([k, v]) => (
                    <span key={k} className="text-[10px] text-slate-400 font-semibold">
                      {k}: <span className="text-slate-600">{v}</span>
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={policy.file}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 border border-slate-200 hover:border-slate-300 text-slate-600 bg-white rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open
                </a>
                <a
                  href={policy.file}
                  download={policy.downloadName}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </a>
              </div>
            </div>

            {/* key= remounts the viewer so a section click actually jumps pages
                (most PDF viewers ignore a hash-only change on an open document) */}
            <object
              key={pdfUrl}
              data={pdfUrl}
              type="application/pdf"
              className="w-full h-[70vh] min-h-[480px] rounded-lg border border-slate-200 bg-slate-50"
              aria-label={policy.title}
            >
              <div className="h-full flex flex-col items-center justify-center gap-3 p-6 text-center">
                <FileText className="w-8 h-8 text-slate-300" />
                <p className="text-xs text-slate-500 font-semibold">This device can't show the PDF inline.</p>
                <a href={policy.file} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-600 hover:underline">
                  Open {policy.title}
                </a>
              </div>
            </object>
          </div>

          {/* Key highlights */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Key Points at a Glance</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {policy.highlights.map(h => (
                <div key={h.label} className="p-3.5 bg-slate-50 rounded-xl">
                  <p className="text-[11px] font-bold text-slate-700">{h.label}</p>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{h.text}</p>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 font-semibold mt-3">
              This is a summary for quick reference. The full document above is the governing text.
            </p>
          </div>

          {/* Acknowledgment */}
          {myAck ? (
            <div className="flex items-start gap-2.5 p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl text-[11px] font-semibold leading-relaxed">
              <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-600" />
              <p>
                You acknowledged {policy.title} v{policy.version} on {formatDate(myAck.acknowledgedAt)}.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-amber-200 rounded-2xl p-5 shadow-sm space-y-3.5">
              <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center">
                <AlertCircle className="w-4 h-4 mr-1.5 text-amber-500" />
                Your Acknowledgment Is Pending
              </h4>
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-blue-600 shrink-0 cursor-pointer"
                />
                <span className="text-[11px] text-slate-600 leading-relaxed">{policy.acknowledgementText}</span>
              </label>
              <button
                onClick={handleAcknowledge}
                disabled={!agreed || submitting}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl cursor-pointer transition-all active:scale-95"
              >
                {submitting ? 'Saving...' : 'I Acknowledge'}
              </button>
            </div>
          )}
        </div>
      </div>

      {isHR && (
        <AcknowledgementTracker policy={policy} employees={employees} acknowledgements={policyAcknowledgements} />
      )}
    </div>
  );
}
