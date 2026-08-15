import React, { useState } from 'react';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

// Full page shown when an Office (non-Field) Employee punches out past
// 6:30 PM — punch-out only gets recorded once an IT department Admin
// approves this request (see attendanceService.checkOut's requiresApproval
// gate on the backend). Field Employees never see this — they're exempt
// from the 6:30 PM gate and instead auto punched-out at 11:59 PM if they
// forget.
export default function LateCheckoutRequestPage({ onSubmit, onCancel }) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please describe why you need to punch out late.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await onSubmit(reason.trim());
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto font-sans text-slate-800 animate-in fade-in duration-200">
      <button
        onClick={onCancel}
        className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 mb-4 cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Attendance
      </button>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-5">
        <div className="flex items-start space-x-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4.5 h-4.5 text-amber-500" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">Late Punch-Out Approval</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              It's past 6:30 PM. Tell the IT department why — your punch-out will be recorded once they approve.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Reason</label>
            <textarea
              autoFocus
              rows="6"
              placeholder="e.g. Stuck finishing a client deliverable..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {error && (
            <p className="text-[11px] text-red-600 font-semibold bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</p>
          )}

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs cursor-pointer transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-500/10 cursor-pointer transition-all"
            >
              {submitting ? 'Submitting...' : 'Send to IT Department'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
