import React, { useState } from 'react';
import { Calendar, Tag, ShieldCheck, HelpCircle } from 'lucide-react';

export default function HolidaysView({ employee, holidays = [] }) {
  const [filter, setFilter] = useState('all');

  const filteredHolidays = filter === 'all'
    ? holidays
    : holidays.filter(h => h.type.toLowerCase() === filter.toLowerCase() || (h.department && h.department.toLowerCase() === filter.toLowerCase()));

  const getTypeBadge = (type) => {
    if (type === 'National') return 'bg-orange-50 text-orange-600 border-orange-100';
    if (type === 'Company') return 'bg-indigo-50 text-indigo-600 border-indigo-100';
    return 'bg-blue-50 text-blue-600 border-blue-100';
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto font-sans text-slate-800 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Company Calendar</h2>
          <p className="text-xs text-slate-500 mt-1">Check scheduled holidays, department retreats, and corporate summits.</p>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center gap-2">
        {['all', 'National', 'Company', 'Department'].map(chip => (
          <button
            key={chip}
            onClick={() => setFilter(chip)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all border cursor-pointer ${
              filter === chip
                ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/10'
                : 'bg-white border-slate-150 text-slate-500 hover:bg-slate-50'
            }`}
          >
            {chip === 'all' ? 'All Events' : `${chip} Holidays`}
          </button>
        ))}
      </div>

      {/* Grid of holiday cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {filteredHolidays.map((h) => (
          <div key={h.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-44">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] font-bold text-slate-400">
                  {h.id}
                </span>
                <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${getTypeBadge(h.type)}`}>
                  {h.type}
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-800 mt-3.5 leading-snug">{h.name}</h3>
              {h.department && (
                <span className="text-[10px] text-slate-400 font-semibold block mt-1.5 uppercase">
                  Dept: {h.department}
                </span>
              )}
            </div>

            <div className="border-t border-slate-50 pt-3 flex items-center space-x-2 text-xs font-bold text-blue-600">
              <Calendar className="w-4 h-4 shrink-0" />
              <span>
                {new Date(h.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
