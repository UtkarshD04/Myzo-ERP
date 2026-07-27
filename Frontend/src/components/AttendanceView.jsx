import React, { useState } from 'react';
import { Clock, Calendar, UserCheck, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';

function LocationLink({ location }) {
  if (!location) return <span className="text-slate-400">—</span>;
  const url = `https://www.google.com/maps?q=${location.lat},${location.lng}`;
  return (
    <a href={url} target="_blank" rel="noreferrer"
      className="inline-flex items-center gap-1 text-blue-600 hover:underline">
      <MapPin className="w-3 h-3" />
      {location.placeName || `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`}
    </a>
  );
}

export default function AttendanceView({ employee, attendanceHistory, onCheckIn, onCheckOut }) {
  const today = new Date().toISOString().split('T')[0];
  const todayRecord = attendanceHistory.find(r => r.employeeId === employee?.id && r.date === today);
  const isCheckedIn = todayRecord && todayRecord.checkIn && !todayRecord.checkOut;

  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present': return 'bg-emerald-500 hover:bg-emerald-600';
      case 'Late': return 'bg-amber-500 hover:bg-amber-600';
      case 'Absent': return 'bg-red-500 hover:bg-red-600';
      case 'Half Day': return 'bg-blue-500 hover:bg-blue-600';
      case 'On Leave': return 'bg-purple-500 hover:bg-purple-600';
      default: return 'bg-slate-300 hover:bg-slate-400';
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'Present': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Late': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Absent': return 'bg-red-50 text-red-700 border-red-200';
      case 'Half Day': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'On Leave': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case 'Present': return 'text-emerald-700';
      case 'Late': return 'text-amber-700';
      case 'Absent': return 'text-red-700';
      case 'Half Day': return 'text-blue-700';
      case 'On Leave': return 'text-purple-700';
      default: return 'text-slate-700';
    }
  };

  // Calendar functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    return { daysInMonth, firstDay };
  };

  const getAttendanceForDate = (dateString) => {
    return attendanceHistory.find(r => r.employeeId === employee?.id && r.date === dateString);
  };

  const { daysInMonth, firstDay } = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Calculate attendance stats
  const employeeAttendance = attendanceHistory.filter(r => r.employeeId === employee?.id);
  const presentDays = employeeAttendance.filter(r => r.status === 'Present').length;
  const lateDays = employeeAttendance.filter(r => r.status === 'Late').length;
  const absentDays = employeeAttendance.filter(r => r.status === 'Absent').length;
  const totalDays = presentDays + lateDays + absentDays;
  const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Attendance Header Card */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Attendance Management</h2>
            <p className="text-xs text-slate-500 mt-1">Track your daily work hours and attendance status</p>
          </div>

          <div className="flex items-center space-x-3">
            {isCheckedIn ? (
              <button 
                onClick={onCheckOut}
                className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-sm rounded-xl border border-red-200 transition-all active:scale-95"
              >
                Check Out
              </button>
            ) : (
              <button 
                onClick={onCheckIn}
                className="px-5 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-blue-500/10 active:scale-95"
              >
                Check In
              </button>
            )}
            
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-semibold">Today's Status</p>
              <h3 className="text-lg font-black text-slate-800 mt-1">
                {todayRecord ? todayRecord.status : 'Not Checked In'}
              </h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-semibold">Check In Time</p>
              <h3 className="text-lg font-black text-slate-800 mt-1 font-mono">
                {todayRecord?.checkIn || '--:--'}
              </h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-500 rounded-2xl">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-semibold">Working Hours</p>
              <h3 className="text-lg font-black text-slate-800 mt-1">
                {todayRecord?.workingHours ? `${todayRecord.workingHours}h` : '0h'}
              </h3>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-semibold">Attendance Rate</p>
              <h3 className="text-lg font-black text-slate-800 mt-1">
                {attendancePercentage}%
              </h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Calendar View */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-50 text-[#2563EB] rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Attendance Calendar</h3>
              <p className="text-[10px] text-slate-500 font-medium">View your attendance status for each day</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={previousMonth}
              className="p-2 hover:bg-slate-100 rounded-lg transition-all"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <span className="text-sm font-bold text-slate-800 min-w-[150px] text-center">
              {monthName}
            </span>
            <button 
              onClick={nextMonth}
              className="p-2 hover:bg-slate-100 rounded-lg transition-all"
            >
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Week day headers */}
          {weekDays.map(day => (
            <div key={day} className="text-center py-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{day}</span>
            </div>
          ))}
          
          {/* Calendar days */}
          {days.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="aspect-square"></div>;
            }

            const dateString = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const attendance = getAttendanceForDate(dateString);
            const isToday = dateString === today;
            const status = attendance?.status;
            const hasStatus = status && status !== 'Not Checked In';

            return (
              <div
                key={day}
                className={`aspect-square flex flex-col items-center justify-center rounded-xl border-2 transition-all relative ${
                  isToday 
                    ? 'border-blue-500 bg-blue-50' 
                    : hasStatus 
                      ? `${getStatusColor(status)} border-transparent text-white` 
                      : 'border-slate-200 bg-slate-50'
                }`}
              >
                <span className={`text-sm font-bold ${
                  isToday 
                    ? 'text-blue-700' 
                    : hasStatus 
                      ? 'text-white' 
                      : 'text-slate-700'
                }`}>
                  {day}
                </span>
                {hasStatus && (
                  <span className="text-[9px] font-bold uppercase tracking-wider mt-0.5">
                    {status === 'Present' ? '✓' : status === 'Late' ? 'L' : status === 'Absent' ? '✗' : status === 'Half Day' ? '½' : '○'}
                  </span>
                )}
                {isToday && !hasStatus && (
                  <span className="text-[9px] font-bold text-blue-600 mt-0.5">Today</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-slate-100">
          <p className="text-xs font-bold text-slate-700 mb-3">Legend:</p>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-500"></div>
              <span className="text-xs text-slate-600 font-medium">Present</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-lg bg-amber-500"></div>
              <span className="text-xs text-slate-600 font-medium">Late</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-lg bg-red-500"></div>
              <span className="text-xs text-slate-600 font-medium">Absent</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-lg bg-blue-500"></div>
              <span className="text-xs text-slate-600 font-medium">Half Day</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-lg bg-purple-500"></div>
              <span className="text-xs text-slate-600 font-medium">On Leave</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-lg border-2 border-blue-500 bg-blue-50"></div>
              <span className="text-xs text-slate-600 font-medium">Today</span>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl border border-emerald-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">Present Days</p>
              <p className="text-2xl font-black text-emerald-700">{presentDays}</p>
            </div>
            <div className="p-3 bg-white rounded-xl">
              <UserCheck className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-2xl border border-amber-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">Late Days</p>
              <p className="text-2xl font-black text-amber-700">{lateDays}</p>
            </div>
            <div className="p-3 bg-white rounded-xl">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100/50 rounded-2xl border border-red-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-1">Absent Days</p>
              <p className="text-2xl font-black text-red-700">{absentDays}</p>
            </div>
            <div className="p-3 bg-white rounded-xl">
              <Calendar className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Attendance History</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-3 px-4 font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="text-left py-3 px-4 font-bold text-slate-500 uppercase tracking-wider">Check In</th>
                <th className="text-left py-3 px-4 font-bold text-slate-500 uppercase tracking-wider">In Location</th>
                <th className="text-left py-3 px-4 font-bold text-slate-500 uppercase tracking-wider">Check Out</th>
                <th className="text-left py-3 px-4 font-bold text-slate-500 uppercase tracking-wider">Out Location</th>
                <th className="text-left py-3 px-4 font-bold text-slate-500 uppercase tracking-wider">Hours</th>
                <th className="text-left py-3 px-4 font-bold text-slate-500 uppercase tracking-wider">Overtime</th>
                <th className="text-left py-3 px-4 font-bold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {attendanceHistory.filter(r => r.employeeId === employee?.id).slice().reverse().map((record, index) => (
                <tr key={index} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-mono text-slate-700">{record.date}</td>
                  <td className="py-3 px-4 text-slate-600">{record.checkIn || '--:--'}</td>
                  <td className="py-3 px-4"><LocationLink location={record.checkInLocation} /></td>
                  <td className="py-3 px-4 text-slate-600">{record.checkOut || 'Active'}</td>
                  <td className="py-3 px-4"><LocationLink location={record.checkOutLocation} /></td>
                  <td className="py-3 px-4 text-slate-800 font-semibold">{record.workingHours}h</td>
                  <td className="py-3 px-4 text-slate-600">{record.overtime > 0 ? `+${record.overtime}h` : '0h'}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-2.5 py-1 rounded-lg font-bold ${getStatusBgColor(record.status)}`}>
                      {record.status}
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