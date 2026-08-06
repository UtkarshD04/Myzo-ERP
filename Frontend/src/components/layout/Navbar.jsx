import React, { useState } from 'react';
import { LogOut, Menu, Settings, User, FileText, ChevronDown } from 'lucide-react';

export default function Navbar({
  employee,
  onLogout,
  onMenuClick,
  onNavigate,
  attendanceHistory = []
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendance = attendanceHistory.find(a => a.date === todayStr);
  const isCheckedIn = todayAttendance && todayAttendance.checkIn && !todayAttendance.checkOut;

  const goTo = (tab) => {
    setMenuOpen(false);
    onNavigate(tab);
  };

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
            {isCheckedIn ? 'Online · Active' : 'Offline · Punched Out'}
          </span>
          {todayAttendance?.checkIn && (
            <span className="text-slate-400 font-medium pl-1 border-l border-slate-200">
              Shift: {todayAttendance.checkIn}
            </span>
          )}
        </div>

        {/* Settings shortcut */}
        <button
          onClick={() => goTo('settings')}
          className="p-2.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
          title="Settings"
        >
          <Settings className="w-4.5 h-4.5" />
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-100" />

        {/* Profile Chip + Dropdown */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center space-x-2.5 rounded-xl cursor-pointer"
          >
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
            <ChevronDown className={`hidden lg:block w-3.5 h-3.5 text-slate-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-[calc(100%+10px)] w-52 bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-200/60 py-2 z-50 animate-in fade-in duration-150">
                <button
                  onClick={() => goTo('profile')}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-800 cursor-pointer transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>My Profile</span>
                </button>
                <button
                  onClick={() => goTo('documents')}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-800 cursor-pointer transition-colors"
                >
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span>Payslips & Docs</span>
                </button>
                <button
                  onClick={() => goTo('settings')}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-800 cursor-pointer transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Settings</span>
                </button>
                <div className="my-1.5 border-t border-slate-100" />
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-red-500 hover:bg-red-50 cursor-pointer transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </header>
  );
}
