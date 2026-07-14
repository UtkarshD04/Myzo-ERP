import React from 'react';
import { Bell } from 'lucide-react';

export default function Navbar({ employee, notifications, markAllNotificationsAsRead }) {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="bg-white border-b border-slate-100 px-5 py-3 flex items-center justify-between shrink-0">
      <div>
        <p className="text-sm font-bold text-slate-800">{employee.name}</p>
        <p className="text-xs text-slate-400">{employee.designation}</p>
      </div>

      <div className="flex items-center space-x-3">
        <button
          onClick={markAllNotificationsAsRead}
          className="relative p-2 hover:bg-slate-50 rounded-xl transition-all"
        >
          <Bell className="w-5 h-5 text-slate-500" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          )}
        </button>

        <img
          src={employee.photo}
          alt={employee.name}
          className="w-8 h-8 rounded-xl object-cover border border-slate-200"
        />
      </div>
    </header>
  );
}
