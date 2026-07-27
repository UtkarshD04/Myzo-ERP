import React, { useState, useRef, useEffect } from 'react';
import { Bell, LogOut, Menu, User, Shield, CheckCircle2, Clock, CalendarDays, UserPlus, Boxes } from 'lucide-react';

export default function Navbar({
  employee,
  notifications = [],
  markAllNotificationsAsRead,
  onLogout,
  onMenuClick,
  attendanceHistory = []
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

        {/* Notifications Dropdown Container */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-xl text-slate-600 hover:bg-slate-50 active:scale-95 transition-all relative cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-[9px] font-black text-white rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2.5 w-80 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-3 duration-200">
              <div className="px-4.5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <span className="text-xs font-black text-slate-800">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={() => {
                      markAllNotificationsAsRead();
                      setShowNotifications(false);
                    }}
                    className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-slate-400 text-xs font-medium">
                    No notifications available
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3.5 flex items-start space-x-3 transition-colors ${
                        n.read ? 'bg-white' : 'bg-blue-50/20'
                      }`}
                    >
                      <div className="mt-0.5">
                        {n.category === 'Attendance' && <Clock className="w-4 h-4 text-emerald-500" />}
                        {n.category === 'Task' && <CheckCircle2 className="w-4 h-4 text-blue-500" />}
                        {n.category === 'System' && <Shield className="w-4 h-4 text-indigo-500" />}
                        {n.category === 'Leave' && <CalendarDays className="w-4 h-4 text-amber-500" />}
                        {n.category === 'Recruitment' && <UserPlus className="w-4 h-4 text-purple-500" />}
                        {n.category === 'Inventory' && <Boxes className="w-4 h-4 text-orange-500" />}
                        {!['Attendance', 'Task', 'System', 'Leave', 'Recruitment', 'Inventory'].includes(n.category) && <Bell className="w-4 h-4 text-slate-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-xs text-slate-800 leading-snug">{n.title}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                        <span className="text-[9px] text-slate-400 font-semibold block mt-1">{n.time}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
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
