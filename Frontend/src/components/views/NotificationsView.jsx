import React from 'react';
import { Bell, Check, Trash2, Clock, CheckCircle2, Shield, Calendar } from 'lucide-react';

export default function NotificationsView({
  notifications = [],
  markAllNotificationsAsRead,
  markNotificationAsRead,
  deleteNotification
}) {
  const unreadCount = notifications.filter(n => !n.read).length;

  const getCategoryIcon = (cat) => {
    if (cat === 'Attendance') return <Clock className="w-4.5 h-4.5 text-emerald-500" />;
    if (cat === 'Task') return <CheckCircle2 className="w-4.5 h-4.5 text-blue-500" />;
    if (cat === 'System') return <Shield className="w-4.5 h-4.5 text-indigo-500" />;
    if (cat === 'Holiday') return <Calendar className="w-4.5 h-4.5 text-orange-500" />;
    return <Bell className="w-4.5 h-4.5 text-slate-400" />;
  };

  const getCategoryBadge = (cat) => {
    if (cat === 'Attendance') return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    if (cat === 'Task') return 'bg-blue-50 text-blue-600 border-blue-100';
    if (cat === 'System') return 'bg-indigo-50 text-indigo-600 border-indigo-100';
    if (cat === 'Holiday') return 'bg-orange-50 text-orange-600 border-orange-100';
    return 'bg-slate-50 text-slate-600 border-slate-100';
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-3xl mx-auto font-sans text-slate-800 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-[10px] font-black rounded-full">
                {unreadCount} new
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-500 mt-1">System, HR, and task activity updates across the platform.</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllNotificationsAsRead}
            className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-bold text-xs rounded-xl flex items-center space-x-1.5 cursor-pointer transition-all active:scale-95"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-300">
            <Bell className="w-12 h-12 mb-4" />
            <p className="font-bold text-sm text-slate-400">No notifications yet</p>
            <p className="text-xs text-slate-300 mt-1">Activity updates will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`flex items-start gap-4 p-5 transition-colors hover:bg-slate-50/50 ${
                  !n.read ? 'bg-blue-50/10 border-l-2 border-blue-400' : ''
                }`}
              >
                {/* Icon */}
                <div className="mt-0.5 shrink-0">
                  {getCategoryIcon(n.category)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`font-bold text-sm leading-snug ${n.read ? 'text-slate-700' : 'text-slate-900'}`}>
                      {n.title}
                    </p>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border shrink-0 ${getCategoryBadge(n.category)}`}>
                      {n.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">{n.message}</p>
                  <span className="text-[10px] text-slate-400 font-semibold block mt-2">{n.time}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-1.5 shrink-0 mt-0.5">
                  {!n.read && (
                    <button
                      onClick={() => markNotificationAsRead(n.id)}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-blue-500 hover:border-blue-200 hover:bg-blue-50 transition-all cursor-pointer"
                      title="Mark as read"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(n.id)}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
