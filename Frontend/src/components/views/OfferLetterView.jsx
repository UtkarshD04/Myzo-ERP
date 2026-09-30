import React, { useState, useMemo } from 'react';
import { FileText, Download } from 'lucide-react';
import {
  downloadOfferLetterPdf, computeOfferAnnexure,
  OFFER_ANNEXURE_EARNINGS, OFFER_ANNEXURE_DEDUCTIONS, OFFER_ANNEXURE_BENEFITS
} from '../../utils/documentPdf';

const today = () => new Date().toISOString().slice(0, 10);

const EMPTY_FORM = {
  candidateName: '', position: '', location: 'Lucknow', reportingTo: '',
  issueDate: today(), joiningDate: '', probationMonths: '', noticeDays: '',
  acceptanceHours: 48, reportingTime: '10:00 AM',
  signatoryName: 'Aseem Mishra', signatoryTitle: 'Circle Business Head'
};

const inputClass = 'w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
const inr = (n) => Math.round(n).toLocaleString('en-IN');

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

export default function OfferLetterView({ candidates = [], employees = [] }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [annexure, setAnnexure] = useState({});
  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));
  const setAmt = (key) => (e) => setAnnexure(a => ({ ...a, [key]: e.target.value }));
  const totals = useMemo(() => computeOfferAnnexure(annexure), [annexure]);

  const prefillFromCandidate = (id) => {
    const c = candidates.find(x => x.id === id);
    if (!c) return;
    setForm(f => ({ ...f, candidateName: c.name || '', position: c.position || '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    downloadOfferLetterPdf({ ...form, annexure });
  };

  const amountRow = ([key, label]) => (
    <Field key={key} label={label}>
      <input type="number" min="0" className={inputClass} value={annexure[key] ?? ''} onChange={setAmt(key)} placeholder="0" />
    </Field>
  );
  const totalRow = (label, value) => (
    <div className="flex justify-between text-sm font-bold text-slate-700 bg-slate-50 rounded-xl px-3 py-2">
      <span>{label}</span><span>₹ {inr(value)}</span>
    </div>
  );

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><FileText size={18} /> Offer Letter</h3>
        <p className="text-xs text-slate-500 mt-1">Generates the company offer letter (on letterhead) with the Annexure-A salary sheet as a PDF.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
          <h4 className="text-sm font-bold text-slate-800">Letter details</h4>
          {candidates.length > 0 && (
            <Field label="Prefill from recruitment candidate (optional)">
              <select className={inputClass} defaultValue="" onChange={(e) => prefillFromCandidate(e.target.value)}>
                <option value="">Select candidate…</option>
                {candidates.map(c => <option key={c.id} value={c.id}>{c.name}{c.position ? ` — ${c.position}` : ''}</option>)}
              </select>
            </Field>
          )}
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Candidate name *"><input required className={inputClass} value={form.candidateName} onChange={set('candidateName')} /></Field>
            <Field label="Appointed as (position) *"><input required className={inputClass} value={form.position} onChange={set('position')} /></Field>
            <Field label="Effective date (joining) *"><input required type="date" className={inputClass} value={form.joiningDate} onChange={set('joiningDate')} /></Field>
            <Field label="Reporting to *">
              <input required className={inputClass} list="offer-reporting" value={form.reportingTo} onChange={set('reportingTo')} />
              <datalist id="offer-reporting">{employees.map(e => <option key={e.id} value={e.name} />)}</datalist>
            </Field>
            <Field label="Office location"><input className={inputClass} value={form.location} onChange={set('location')} /></Field>
            <Field label="Letter date"><input type="date" className={inputClass} value={form.issueDate} onChange={set('issueDate')} /></Field>
            <Field label="Probation (months) *"><input required type="number" min="0" className={inputClass} value={form.probationMonths} onChange={set('probationMonths')} /></Field>
            <Field label="Notice period (days) *"><input required type="number" min="0" className={inputClass} value={form.noticeDays} onChange={set('noticeDays')} /></Field>
            <Field label="Acceptance & resignation within (hours)"><input type="number" min="1" className={inputClass} value={form.acceptanceHours} onChange={set('acceptanceHours')} /></Field>
            <Field label="Office reporting time"><input className={inputClass} value={form.reportingTime} onChange={set('reportingTime')} /></Field>
            <Field label="Signatory name"><input className={inputClass} value={form.signatoryName} onChange={set('signatoryName')} /></Field>
            <Field label="Signatory designation"><input className={inputClass} value={form.signatoryTitle} onChange={set('signatoryTitle')} /></Field>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
          <div>
            <h4 className="text-sm font-bold text-slate-800">Annexure A — monthly salary (₹)</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Totals, net take-home and CTC are calculated automatically.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">{OFFER_ANNEXURE_EARNINGS.map(amountRow)}</div>
          {totalRow('Gross Salary (A)', totals.gross)}
          <div className="grid sm:grid-cols-3 gap-4">{OFFER_ANNEXURE_DEDUCTIONS.map(amountRow)}</div>
          {totalRow('Total Deductions (B)', totals.deductions)}
          {totalRow('Net Take Home (A) - (B)', totals.net)}
          <div className="grid sm:grid-cols-2 gap-4">{OFFER_ANNEXURE_BENEFITS.map(amountRow)}</div>
          {totalRow('Total Benefits (C)', totals.benefits)}
          {totalRow('CTC (A) + (C) — monthly', totals.monthlyCtc)}
          {totalRow('CTC p.a.', totals.annualCtc)}
        </div>

        <button type="submit" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700">
          <Download size={14} /> Download Offer Letter
        </button>
      </form>
    </div>
  );
}
