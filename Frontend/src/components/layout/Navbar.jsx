import React from 'react';
import { LogOut, Menu } from 'lucide-react';

export default function Navbar({
  employee,
  onLogout,
  onMenuClick,
  attendanceHistory = []
}) {
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendance = attendanceHistory.find(a => a.date === todayStr);
  const isCheckedIn = todayAttendance && todayAttendance.checkIn && !todayAttendance.checkOut;

  return (
    <header className="h-16 bg-white border-b border-slate-100 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm shadow-slate-100/40">
      {/* Left section: Hamburger (mobile) & Title */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:block">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Myzo Workspace</span>
          <h1 className="text-base font-black text-slate-800 -mt-0.5 tracking-tight">Employee Hub</h1>
        </div>
      </div>

      {/* Right section: Actions & Profile */}
      <div className="flex items-center space-x-4">
        
        {/* Attendance Pulse */}
        <div className="hidden md:flex items-center space-x-2 px-3.5 py-1.5 bg-slate-50 rounded-full border border-slate-100 text-xs">
          <span className={`w-2 h-2 rounded-full ${isCheckedIn ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`}></span>
          <span className="font-semibold text-slate-600">
            {isCheckedIn ? 'Online · Active' : 'Offline · Checked Out'}
          </span>
          {todayAttendance?.checkIn && (
            <span className="text-slate-400 font-medium pl-1 border-l border-slate-200">
              Shift: {todayAttendance.checkIn}
            </span>
          )}
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-100" />

        {/* Profile Chip */}
        <div className="flex items-center space-x-3.5">
          <img
            src={employee.photo}
            alt={employee.name}
            className="w-9 h-9 rounded-xl object-cover border border-slate-200/80 shadow-sm"
            referrerPolicy="no-referrer"
          />
          <div className="hidden lg:block min-w-0 text-left">
            <p className="font-extrabold text-xs text-slate-800 leading-none truncate">{employee.name}</p>
            <span className="text-[10px] font-bold text-slate-400 block mt-1 tracking-wider uppercase">
              {employee.role === 'Employee' ? employee.designation : employee.role}
            </span>
          </div>
          <button
            onClick={onLogout}
            className="p-2.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 active:scale-95 transition-all cursor-pointer"
            title="Log Out"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>

      </div>
    </header>
  );
}
