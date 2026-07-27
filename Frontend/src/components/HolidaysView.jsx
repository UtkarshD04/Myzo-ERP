import React from 'react';
import { Calendar, MapPin, Sparkles, Clock, Star, Gift, PartyPopper } from 'lucide-react';

export default function HolidaysView({ employee, holidays }) {
  const getTypeColor = (type) => {
    switch (type) {
      case 'National': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Company': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Department': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'National': return <Star className="w-4 h-4" />;
      case 'Company': return <Gift className="w-4 h-4" />;
      case 'Department': return <PartyPopper className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const upcomingHolidays = holidays
    .filter(h => new Date(h.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastHolidays = holidays
    .filter(h => new Date(h.date) < new Date())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const nationalHolidays = holidays.filter(h => h.type === 'National');
  const companyHolidays = holidays.filter(h => h.type === 'Company');
  const departmentHolidays = holidays.filter(h => h.type === 'Department');

  // Calculate days until next holiday
  const getDaysUntil = (dateString) => {
    const holidayDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = holidayDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Header Section */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl border border-blue-100 p-8 shadow-sm">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-white rounded-2xl shadow-sm">
            <Calendar className="w-8 h-8 text-[#2563EB]" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Company Holidays</h2>
            <p className="text-xs text-slate-600 mt-1">View upcoming holidays, company events, and department-specific celebrations</p>
          </div>
        </div>
      </div>

      {/* Next Holiday Highlight */}
      {upcomingHolidays.length > 0 && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 shadow-lg text-white">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
              <Sparkles className="w-6 h-6 text-yellow-300" />
            </div>
            <div className="flex-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-100 mb-2">Next Holiday</h3>
              <h4 className="text-xl font-black mb-1">{upcomingHolidays[0].name}</h4>
              <p className="text-sm text-blue-100 mb-3">
                {new Date(upcomingHolidays[0].date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
              <div className="flex items-center space-x-3">
                <span className={`inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg text-xs font-bold border border-white/20`}>
                  {getTypeIcon(upcomingHolidays[0].type)}
                  <span>{upcomingHolidays[0].type}</span>
                </span>
                <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg text-xs font-bold border border-white/20">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{getDaysUntil(upcomingHolidays[0].date)} days away</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">National Holidays</p>
              <p className="text-2xl font-black text-slate-800">{nationalHolidays.length}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl">
              <Star className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Company Events</p>
              <p className="text-2xl font-black text-slate-800">{companyHolidays.length}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-xl">
              <Gift className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Department Events</p>
              <p className="text-2xl font-black text-slate-800">{departmentHolidays.length}</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl">
              <PartyPopper className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Holidays */}
      {upcomingHolidays.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-5">
            <div className="p-2.5 bg-blue-50 text-[#2563EB] rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Upcoming Holidays</h3>
              <p className="text-[10px] text-slate-500 font-medium">{upcomingHolidays.length} holiday{upcomingHolidays.length > 1 ? 's' : ''} remaining this year</p>
            </div>
          </div>

          <div className="space-y-3">
            {upcomingHolidays.map((holiday) => {
              const daysUntil = getDaysUntil(holiday.date);
              
              return (
                <div 
                  key={holiday.id} 
                  className="group p-4 bg-gradient-to-r from-slate-50 to-slate-50/50 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="flex-shrink-0 text-center">
                        <div className="bg-white rounded-xl p-2.5 border border-slate-200 shadow-sm">
                          <p className="text-[10px] font-bold text-slate-500 uppercase">
                            {new Date(holiday.date).toLocaleDateString('en-US', { month: 'short' })}
                          </p>
                          <p className="text-xl font-black text-slate-800 leading-none">
                            {new Date(holiday.date).getDate()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-slate-800 group-hover:text-blue-600 transition-colors">{holiday.name}</h4>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(holiday.date).toLocaleDateString('en-US', { 
                            weekday: 'short',
                            month: 'long', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                        {holiday.department && (
                          <p className="text-[10px] text-slate-400 mt-1.5 flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {holiday.department}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end space-y-2">
                      <span className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${getTypeColor(holiday.type)}`}>
                        {getTypeIcon(holiday.type)}
                        <span>{holiday.type}</span>
                      </span>
                      {daysUntil <= 7 && (
                        <span className="inline-flex items-center space-x-1 px-2 py-1 bg-amber-50 text-amber-700 rounded-lg text-[10px] font-bold border border-amber-200">
                          <Clock className="w-3 h-3" />
                          <span>{daysUntil} day{daysUntil !== 1 ? 's' : ''}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Past Holidays */}
      {pastHolidays.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-5">
            <div className="p-2.5 bg-slate-100 text-slate-600 rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Past Holidays</h3>
              <p className="text-[10px] text-slate-500 font-medium">{pastHolidays.length} holiday{pastHolidays.length > 1 ? 's' : ''} this year</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pastHolidays.map((holiday) => (
              <div 
                key={holiday.id} 
                className="p-4 bg-slate-50 rounded-xl border border-slate-200 opacity-70"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-bold text-sm text-slate-700">{holiday.name}</h4>
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
            ))}
          </div>
        </div>
      )}

      {holidays.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 shadow-sm text-center">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-600">No holidays scheduled</p>
          <p className="text-xs text-slate-400 mt-1">Check back later for upcoming events</p>
        </div>
      )}
    </div>
  );
}