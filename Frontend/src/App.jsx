import React, { useState, useEffect } from 'react';
import {
  INITIAL_EMPLOYEES,
  INITIAL_TASKS,
  INITIAL_HOLIDAYS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ATTENDANCE_HISTORY,
  INITIAL_REPORTS
} from './data';

// Component Imports
import LoginScreen from './components/LoginScreen';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import DashboardView from './components/DashboardView';
import ProfileView from './components/ProfileView';
import AttendanceView from './components/AttendanceView';
import HolidaysView from './components/HolidaysView';
import TasksView from './components/TasksView';
import TargetsView from './components/TargetsView';
import WorkReportView from './components/WorkReportView';
import DocumentsView from './components/DocumentsView';
import SettingsView from './components/SettingsView';
import NotificationsView from './components/NotificationsView';

export default function App() {
  // --- Persistent States ---
  const [employee, setEmployee] = useState(() => {
    const cached = localStorage.getItem('myzo_logged_in_employee');
    return cached ? JSON.parse(cached) : null;
  });

  const [employees, setEmployees] = useState(() => {
    const cached = localStorage.getItem('myzo_employees');
    return cached ? JSON.parse(cached) : INITIAL_EMPLOYEES;
  });

  const [tasks, setTasks] = useState(() => {
    const cached = localStorage.getItem('myzo_tasks');
    return cached ? JSON.parse(cached) : INITIAL_TASKS;
  });

  const [holidays] = useState(INITIAL_HOLIDAYS);

  const [notifications, setNotifications] = useState(() => {
    const cached = localStorage.getItem('myzo_notifications');
    return cached ? JSON.parse(cached) : INITIAL_NOTIFICATIONS;
  });

  const [attendanceHistory, setAttendanceHistory] = useState(() => {
    const cached = localStorage.getItem('myzo_attendance_history');
    return cached ? JSON.parse(cached) : INITIAL_ATTENDANCE_HISTORY;
  });

  const [reports, setReports] = useState(() => {
    const cached = localStorage.getItem('myzo_reports');
    return cached ? JSON.parse(cached) : INITIAL_REPORTS;
  });

  // --- UI States ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // --- LocalStorage Synchronization ---
  useEffect(() => {
    if (employee) {
      localStorage.setItem('myzo_logged_in_employee', JSON.stringify(employee));
    } else {
      localStorage.removeItem('myzo_logged_in_employee');
    }
  }, [employee]);

  useEffect(() => {
    localStorage.setItem('myzo_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('myzo_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('myzo_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('myzo_attendance_history', JSON.stringify(attendanceHistory));
  }, [attendanceHistory]);

  useEffect(() => {
    localStorage.setItem('myzo_reports', JSON.stringify(reports));
  }, [reports]);

  // --- Core Business Logics ---

  const handleLoginSuccess = (user) => {
    setEmployee(user);
    setActiveTab('dashboard');

    // Create a welcome notification
    const newAlert = {
      id: `NOT-${Date.now().toString().slice(-4)}`,
      title: 'Sign In Approved',
      message: `Access granted under Designation: ${user.designation}. Welcome back to MYZO, ${user.name}!`,
      time: 'Just now',
      read: false,
      category: 'System'
    };
    setNotifications(prev => [newAlert, ...prev]);
  };

  const handleLogout = () => {
    setEmployee(null);
    localStorage.removeItem('myzo_logged_in_employee');
  };

  const handleCheckIn = () => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

    // Check if already checked in today
    const exists = attendanceHistory.some(r => r.date === dateStr);
    if (exists) {
      alert("You have already initiated a clock-in record for today!");
      return;
    }

    const newRecord = {
      date: dateStr,
      checkIn: timeStr,
      checkOut: null,
      workingHours: 0,
      overtime: 0,
      status: 'Present',
      lateMark: false
    };

    setAttendanceHistory(prev => [...prev, newRecord]);

    // Notification trigger
    const newAlert = {
      id: `NOT-${Date.now().toString().slice(-4)}`,
      title: 'Shift Logged: In',
      message: `Checked in successfully today at ${timeStr}. Roster active.`,
      time: 'Just now',
      read: false,
      category: 'Attendance'
    };
    setNotifications(prev => [newAlert, ...prev]);
  };

  const handleCheckOut = () => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

    const updated = attendanceHistory.map(record => {
      if (record.date === dateStr) {
        // Calculate dynamic mockup working hours (between 7.5 to 9.25 hours)
        const mockHours = +(7.5 + Math.random() * 1.75).toFixed(2);
        const mockOvertime = mockHours > 8 ? +(mockHours - 8).toFixed(2) : 0;
        return {
          ...record,
          checkOut: timeStr,
          workingHours: mockHours,
          overtime: mockOvertime
        };
      }
      return record;
    });

    setAttendanceHistory(updated);

    // Notification trigger
    const newAlert = {
      id: `NOT-${Date.now().toString().slice(-4)}`,
      title: 'Shift Logged: Out',
      message: `Checked out successfully today at ${timeStr}. Overtime logged.`,
      time: 'Just now',
      read: false,
      category: 'Attendance'
    };
    setNotifications(prev => [newAlert, ...prev]);
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // --- Auth Guard ---
  if (!employee) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] font-sans antialiased text-[#1E293B]">

      {/* Collapsible Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        employee={employee}
        employees={employees}
        onLogout={handleLogout}
        unreadNotifications={unreadNotificationsCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top Navbar */}
        <Navbar
          employee={employee}
          setEmployee={setEmployee}
          notifications={notifications}
          markAllNotificationsAsRead={markAllNotificationsAsRead}
          onLogout={handleLogout}
        />

        {/* Scrollable View Panel */}
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC]">
          {activeTab === 'dashboard' && (
            <DashboardView
              employee={employee}
              employees={employees}
              tasks={tasks}
              holidays={holidays}
              notifications={notifications}
              attendanceHistory={attendanceHistory}
              reports={reports}
              setActiveTab={setActiveTab}
              onCheckIn={handleCheckIn}
              onCheckOut={handleCheckOut}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileView
              employee={employee}
              employees={employees}
            />
          )}

          {activeTab === 'attendance' && (
            <AttendanceView
              employee={employee}
              attendanceHistory={attendanceHistory}
              onCheckIn={handleCheckIn}
              onCheckOut={handleCheckOut}
            />
          )}

          {activeTab === 'holidays' && (
            <HolidaysView
              employee={employee}
              holidays={holidays}
            />
          )}

          {activeTab === 'tasks' && (
            <TasksView
              employee={employee}
              employees={employees}
              tasks={tasks}
              setTasks={setTasks}
            />
          )}

          {activeTab === 'targets' && (
            <TargetsView
              employee={employee}
            />
          )}

          {activeTab === 'workreport' && (
            <WorkReportView
              employee={employee}
              employees={employees}
              reports={reports}
              setReports={setReports}
            />
          )}

          {activeTab === 'employeereport' && (
            <WorkReportView
              employee={employee}
              employees={employees}
              reports={reports}
              setReports={setReports}
              initialSubTab="team-logs"
            />
          )}

          {activeTab === 'documents' && (
            <DocumentsView />
          )}

          {activeTab === 'settings' && (
            <SettingsView />
          )}

          {activeTab === 'notifications' && (
            <NotificationsView
              notifications={notifications}
              setNotifications={setNotifications}
              markAllNotificationsAsRead={markAllNotificationsAsRead}
            />
          )}
        </main>

      </div>

    </div>
  );
}
