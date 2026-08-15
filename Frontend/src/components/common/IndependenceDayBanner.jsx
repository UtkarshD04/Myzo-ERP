import React, { useState } from 'react';
import { X } from 'lucide-react';

// Shown only during isIndependenceDaySeason's window (see utils/festiveSeason)
// — a tasteful tricolor moment around Aug 15, not a permanent fixture.
export default function IndependenceDayBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl shadow-sm border border-slate-200">
      <div className="flex flex-col sm:flex-row">
        <div className="h-1.5 sm:h-auto sm:w-1.5 bg-[#FF9933] shrink-0" />
        <div className="h-1.5 sm:h-auto sm:w-1.5 bg-white border-y sm:border-y-0 sm:border-x border-slate-100 shrink-0" />
        <div className="h-1.5 sm:h-auto sm:w-1.5 bg-[#138808] shrink-0" />
        <div className="flex-1 bg-white px-5 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-lg leading-none shrink-0">🇮🇳</span>
            <p className="text-xs sm:text-[13px] font-bold text-slate-700 truncate">
              Happy Independence Day! Wishing Team Myzo a proud 15th August.
            </p>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-slate-300 hover:text-slate-500 shrink-0 cursor-pointer"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
