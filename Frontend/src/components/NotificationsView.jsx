import React, { useState } from 'react';
import { Bell, CheckCheck, Trash2, Filter } from 'lucide-react';

export default function NotificationsView({
  notifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  deleteNotification
}) {
  const [filter, setFilter] = useState('all');

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => {
        if (filter === 'unread') return !n.read;
        if (filter === 'read') return n.read;
        return n.category === filter;
      });

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Task': return 'bg-blue-50 text-blue-700';
      case 'Attendance': return 'bg-emerald-50 text-emerald-700';
      case 'Holiday': return 'bg-purple-50 text-purple-700';
      case 'System': return 'bg-amber-50 text-amber-700';
      default: return 'bg-slate-50 text-slate-700';
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Notifications</h2>
            <p className="text-xs text-slate-500 mt-1">
              {notifications.filter(n => !n.read).length} unread notifications
            </p>
          </div>
          <button 
            onClick={markAllNotificationsAsRead}
            className="px-4 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-all flex items-center space-x-2"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All as Read</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <button 
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              filter === 'all' 
                ? 'bg-[#2563EB] text-white' 
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              filter === 'unread' 
                ? 'bg-[#2563EB] text-white' 
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Unread
          </button>
          <button 
            onClick={() => setFilter('Task')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              filter === 'Task' 
                ? 'bg-[#2563EB] text-white' 
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Tasks
          </button>
          <button 
            onClick={() => setFilter('Attendance')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              filter === 'Attendance' 
                ? 'bg-[#2563EB] text-white' 
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Attendance
          </button>
          <button 
            onClick={() => setFilter('System')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              filter === 'System' 
                ? 'bg-[#2563EB] text-white' 
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            System
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 shadow-sm text-center">
            <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No notifications found</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all ${
                notification.read ? 'border-slate-100' : 'border-blue-200 bg-blue-50/30'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${getCategoryColor(notification.category)}`}>
                      {notification.category}
                    </span>
                    {!notification.read && (
                      <span className="w-2 h-2 bg-[#2563EB] rounded-full"></span>
                    )}
                  </div>
                  
                  <h4 className="font-bold text-sm text-slate-800 mb-1">{notification.title}</h4>
                  <p className="text-xs text-slate-600 mb-2">{notification.message}</p>
                  
                  <div className="flex items-center space-x-3 text-[10px] text-slate-400">
                    <span>{notification.time}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  {!notification.read && (
                    <button 
                      onClick={() => markNotificationAsRead(notification.id)}
                      className="p-2 hover:bg-blue-50 rounded-lg transition-all"
                      title="Mark as read"
                    >
                      <CheckCheck className="w-4 h-4 text-blue-600" />
                    </button>
                  )}
                  <button 
                    onClick={() => deleteNotification(notification.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-all"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
