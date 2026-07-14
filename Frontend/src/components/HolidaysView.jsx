import React from 'react';
import { Calendar, MapPin } from 'lucide-react';

export default function HolidaysView({ employee, holidays }) {
  const getTypeColor = (type) => {
    switch (type) {
      case 'National': return 'bg-blue-50 text-blue-700';
      case 'Company': return 'bg-purple-50 text-purple-700';
      case 'Department': return 'bg-emerald-50 text-emerald-700';
      default: return 'bg-slate-50 text-slate-700';
    }
  };

  const upcomingHolidays = holidays
    .filter(h => new Date(h.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Company Holidays</h2>
        <p className="text-xs text-slate-500">View upcoming holidays and company events</p>
      </div>

      {/* Upcoming Holiday Highlight */}
      {upcomingHolidays.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-2xl border border-blue-100 p-6 shadow-sm">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-white rounded-xl shadow-sm">
              <Calendar className="w-6 h-6 text-[#2563EB]" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Next Holiday</h3>
              <h4 className="text-lg font-black text-slate-800">{upcomingHolidays[0].name}</h4>
              <p className="text-xs text-slate-600 mt-1">
                {new Date(upcomingHolidays[0].date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
              <span className={`inline-block mt-2 px-2.5 py-1 rounded-lg text-xs font-bold ${getTypeColor(upcomingHolidays[0].type)}`}>
                {upcomingHolidays[0].type}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* All Holidays List */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">All Holidays</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {holidays.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((holiday) => {
            const isPast = new Date(holiday.date) < new Date();
            
            return (
              <div 
                key={holiday.id} 
                className={`p-4 rounded-xl border ${
                  isPast 
                    ? 'bg-slate-50 border-slate-100 opacity-60' 
                    : 'bg-white border-slate-200 hover:border-blue-200 hover:shadow-sm transition-all'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-bold text-sm text-slate-800">{holiday.name}</h4>
                    <p className="text-xs text-slate-500 mt-1 font-mono">
                      {new Date(holiday.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                    {holiday.department && (
                      <p className="text-[10px] text-slate-400 mt-1 flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {holiday.department}
                      </p>
                    )}
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${getTypeColor(holiday.type)}`}>
                    {holiday.type}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
