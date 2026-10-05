import React, { useState } from 'react';
import { FileText, Download, Send } from 'lucide-react';
import { api } from '../../api';
import { buildOfferLetterPdf, buildInternshipOfferLetterPdf, downloadNdaPdf, pdfToBase64 } from '../../utils/documentPdf';

const today = () => new Date().toISOString().slice(0, 10);

const EMPTY_FORM = {
  candidateName: '', candidateEmail: '', position: '', location: 'Lucknow', reportingTo: '',
  issueDate: today(), joiningDate: '', probationDays: 30, noticeDays: 30,
  acceptanceHours: 48, reportingTime: '10:00 AM',
  signatoryName: 'Aseem Mishra', signatoryTitle: 'Circle Business Head'
};

const EMPTY_INTERN = {
  candidateName: '', candidateEmail: '', role: '', department: '', startDate: '', durationMonths: 3,
  stipend: '', leavesPerMonth: 2, noticeDays: 15, issueDate: today(),
  signatoryName: 'Aseem Mishra', signatoryTitle: 'Circle Business Head'
};

const EMPTY_NDA = {
  employeeName: '', agreementDate: today(), effectiveDate: today(),
  signatoryName: 'Aseem Mishra', signatoryTitle: 'Circle Business Head'
};

const inputClass = 'w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

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
  const [type, setType] = useState('fulltime');
  const [intern, setIntern] = useState(EMPTY_INTERN);
  const [nda, setNda] = useState(EMPTY_NDA);
  const setN = (key) => (e) => setNda(f => ({ ...f, [key]: e.target.value }));
  const setI = (key) => (e) => setIntern(f => ({ ...f, [key]: e.target.value }));
  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const prefillFromCandidate = (id) => {
    const c = candidates.find(x => x.id === id);
    if (!c) return;
    setForm(f => ({ ...f, candidateName: c.name || '', candidateEmail: c.email || '', position: c.position || '' }));
    setIntern(f => ({ ...f, candidateName: c.name || '', candidateEmail: c.email || '', role: c.position || '' }));
    setNda(f => ({ ...f, employeeName: c.name || '' }));
  };

  const prefillFromEmployee = (id) => {
    const emp = employees.find(x => x.id === id);
    if (!emp) return;
    setNda(f => ({ ...f, employeeName: emp.name || '', effectiveDate: emp.joiningDate || f.effectiveDate }));
  };

  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState(null); // { ok: boolean, message: string }

  // Two ways out for an offer letter: "download" just saves the PDF; "send"
  // emails it to the candidate from the HR mailbox (and needs their email).
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    if (type === 'nda') { downloadNdaPdf(nda); return; }

    const action = e.nativeEvent.submitter?.value === 'send' ? 'send' : 'download';
    const isIntern = type === 'intern';
    const data = isIntern ? intern : form;
    const to = (data.candidateEmail || '').trim();
    if (action === 'send' && !to) {
      setStatus({ ok: false, message: "Enter the candidate's email address to send the offer letter." });
      return;
    }

    setSending(true);
    try {
      const { pdf, fileName } = await (isIntern ? buildInternshipOfferLetterPdf(data) : buildOfferLetterPdf(data));
      if (action === 'download') {
        pdf.save(fileName);
        setStatus({ ok: true, message: 'Offer letter downloaded.' });
        return;
      }
      try {
        await api.sendOfferLetter({
          to,
          candidateName: data.candidateName,
          position: isIntern ? data.role : data.position,
          isInternship: isIntern,
          fileName,
          pdfBase64: pdfToBase64(pdf)
        });
        setStatus({ ok: true, message: `Offer letter emailed to ${to} from hr@mzobs.com.` });
      } catch (err) {
        setStatus({ ok: false, message: `The email was not sent: ${err.message}` });
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><FileText size={18} /> Offer Letter</h3>
        <p className="text-xs text-slate-500 mt-1">Generates the offer letter or NDA (on letterhead) as a PDF. You can download an offer letter, or send it straight to the candidate's email from hr@mzobs.com.</p>
      </div>

      <div className="inline-flex bg-slate-100 rounded-xl p-1 text-sm font-bold">
        {[['fulltime', 'Full Time'], ['intern', 'Internship'], ['nda', 'NDA']].map(([k, label]) => (
          <button key={k} type="button" onClick={() => setType(k)}
            className={`px-4 py-1.5 rounded-lg ${type === k ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>{label}</button>
        ))}
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
          {type === 'nda' && employees.length > 0 && (
            <Field label="Prefill from employee (optional)">
              <select className={inputClass} defaultValue="" onChange={(e) => prefillFromEmployee(e.target.value)}>
                <option value="">Select employee…</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.name}{e.designation ? ` — ${e.designation}` : ''}</option>)}
              </select>
            </Field>
          )}
          {type === 'nda' ? (
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Employee name *"><input required className={inputClass} value={nda.employeeName} onChange={setN('employeeName')} /></Field>
            <Field label="Agreement made on *"><input required type="date" className={inputClass} value={nda.agreementDate} onChange={setN('agreementDate')} /></Field>
            <Field label="Effective from *"><input required type="date" className={inputClass} value={nda.effectiveDate} onChange={setN('effectiveDate')} /></Field>
            <Field label="Signatory name"><input className={inputClass} value={nda.signatoryName} onChange={setN('signatoryName')} /></Field>
            <Field label="Signatory designation"><input className={inputClass} value={nda.signatoryTitle} onChange={setN('signatoryTitle')} /></Field>
          </div>
          ) : type === 'intern' ? (
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Candidate name *"><input required className={inputClass} value={intern.candidateName} onChange={setI('candidateName')} /></Field>
            <Field label="Candidate email (needed to send)"><input type="email" className={inputClass} placeholder="Offer letter is emailed here" value={intern.candidateEmail} onChange={setI('candidateEmail')} /></Field>
            <Field label="Role / title (shown as '… Intern') *"><input required className={inputClass} value={intern.role} onChange={setI('role')} /></Field>
            <Field label="Department *"><input required className={inputClass} value={intern.department} onChange={setI('department')} /></Field>
            <Field label="Internship start date *"><input required type="date" className={inputClass} value={intern.startDate} onChange={setI('startDate')} /></Field>
            <Field label="Duration (months) *"><input required type="number" min="1" className={inputClass} value={intern.durationMonths} onChange={setI('durationMonths')} /></Field>
            <Field label="Stipend per month (₹) *"><input required type="number" min="0" className={inputClass} value={intern.stipend} onChange={setI('stipend')} /></Field>
            <Field label="Paid leave per month"><input type="number" min="0" className={inputClass} value={intern.leavesPerMonth} onChange={setI('leavesPerMonth')} /></Field>
            <Field label="Notice period (days)"><input type="number" min="0" className={inputClass} value={intern.noticeDays} onChange={setI('noticeDays')} /></Field>
            <Field label="Letter date"><input type="date" className={inputClass} value={intern.issueDate} onChange={setI('issueDate')} /></Field>
            <Field label="Signatory name"><input className={inputClass} value={intern.signatoryName} onChange={setI('signatoryName')} /></Field>
            <Field label="Signatory designation"><input className={inputClass} value={intern.signatoryTitle} onChange={setI('signatoryTitle')} /></Field>
          </div>
          ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Candidate name *"><input required className={inputClass} value={form.candidateName} onChange={set('candidateName')} /></Field>
            <Field label="Candidate email (needed to send)"><input type="email" className={inputClass} placeholder="Offer letter is emailed here" value={form.candidateEmail} onChange={set('candidateEmail')} /></Field>
            <Field label="Appointed as (position) *"><input required className={inputClass} value={form.position} onChange={set('position')} /></Field>
            <Field label="Effective date (joining) *"><input required type="date" className={inputClass} value={form.joiningDate} onChange={set('joiningDate')} /></Field>
            <Field label="Reporting to *">
              <input required className={inputClass} list="offer-reporting" value={form.reportingTo} onChange={set('reportingTo')} />
              <datalist id="offer-reporting">{employees.map(e => <option key={e.id} value={e.name} />)}</datalist>
            </Field>
            <Field label="Office location"><input className={inputClass} value={form.location} onChange={set('location')} /></Field>
            <Field label="Letter date"><input type="date" className={inputClass} value={form.issueDate} onChange={set('issueDate')} /></Field>
            <Field label="Probation (days) *"><input required type="number" min="0" className={inputClass} value={form.probationDays} onChange={set('probationDays')} /></Field>
            <Field label="Notice period (days) *"><input required type="number" min="0" className={inputClass} value={form.noticeDays} onChange={set('noticeDays')} /></Field>
            <Field label="Acceptance & resignation within (hours)"><input type="number" min="1" className={inputClass} value={form.acceptanceHours} onChange={set('acceptanceHours')} /></Field>
            <Field label="Office reporting time"><input className={inputClass} value={form.reportingTime} onChange={set('reportingTime')} /></Field>
            <Field label="Signatory name"><input className={inputClass} value={form.signatoryName} onChange={set('signatoryName')} /></Field>
            <Field label="Signatory designation"><input className={inputClass} value={form.signatoryTitle} onChange={set('signatoryTitle')} /></Field>
          </div>
          )}
        </div>

        {status && (
          <div className={`text-xs font-semibold rounded-xl px-3 py-2 border ${status.ok ? 'text-emerald-700 bg-emerald-50 border-emerald-100' : 'text-red-600 bg-red-50 border-red-100'}`}>
            {status.message}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button type="submit" value="download" disabled={sending} className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm font-bold rounded-xl hover:bg-slate-900 disabled:opacity-50">
            <Download size={14} /> {type === 'nda' ? 'Download NDA' : 'Download Offer Letter'}
          </button>
          {type !== 'nda' && (
            <button type="submit" value="send" disabled={sending} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50">
              <Send size={14} /> {sending ? 'Working…' : 'Send Offer Letter'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
