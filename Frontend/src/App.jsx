import React, { useState, useEffect } from 'react';
import { api } from './api';
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

  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [holidays, setHolidays] = useState(INITIAL_HOLIDAYS);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [attendanceHistory, setAttendanceHistory] = useState(INITIAL_ATTENDANCE_HISTORY);
  const [reports, setReports] = useState(INITIAL_REPORTS);
  const [apiStatus, setApiStatus] = useState('connecting');

  // --- UI States ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const applyServerState = (state) => {
    if (state.employees) setEmployees(state.employees);
    if (state.tasks) setTasks(state.tasks);
    if (state.holidays) setHolidays(state.holidays);
    if (state.notifications) setNotifications(state.notifications);
    if (state.attendance) setAttendanceHistory(state.attendance);
    if (state.reports) setReports(state.reports);
  };

  // --- API Bootstrap ---
  useEffect(() => {
    let mounted = true;

    api.bootstrap()
      .then((state) => {
        if (!mounted) return;
        applyServerState(state);
        setApiStatus('connected');

        const cachedEmployee = localStorage.getItem('myzo_logged_in_employee');
        if (cachedEmployee) {
          const current = JSON.parse(cachedEmployee);
          const refreshedEmployee = state.employees?.find(emp => emp.id === current.id);
          if (refreshedEmployee) {
            setEmployee(refreshedEmployee);
          }
        }
      })
      .catch(() => {
        if (mounted) setApiStatus('offline');
      });

    return () => {
      mounted = false;
    };
  }, []);

  // --- LocalStorage Synchronization ---
  useEffect(() => {
    if (employee) {
      localStorage.setItem('myzo_logged_in_employee', JSON.stringify(employee));
    } else {
      localStorage.removeItem('myzo_logged_in_employee');
    }
  }, [employee]);

  // --- Core Business Logics ---

  const getDefaultTab = (emp) => {
    const role = emp.role?.toLowerCase() || '';
    if (role === 'admin') return 'dashboard';
    if (role === 'manager') return 'dashboard';
    if (role === 'hr') return 'dashboard';
    return 'dashboard'; // Employee, Sales Associate, etc.
  };

  const handleLoginSuccess = async ({ employeeId: email, password }) => {
    const response = await api.login(email, password);
    applyServerState(response);
    setEmployee(response.employee);
    setActiveTab(getDefaultTab(response.employee));
  };

  const handleLogout = () => {
    setEmployee(null);
    localStorage.removeItem('myzo_logged_in_employee');
  };

  const handleCheckIn = async () => {
    try {
      const state = await api.checkIn(employee.id);
      applyServerState(state);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCheckOut = async () => {
    try {
      const state = await api.checkOut(employee.id);
      applyServerState(state);
    } catch (err) {
      alert(err.message);
    }
  };

  const markAllNotificationsAsRead = async () => {
    const state = await api.markAllNotificationsRead();
    applyServerState(state);
  };

  const markNotificationAsRead = async (id) => {
    const state = await api.markNotificationRead(id);
    applyServerState(state);
  };

  const deleteNotification = async (id) => {
    const state = await api.deleteNotification(id);
    applyServerState(state);
  };

  // --- Auth Guard ---
  if (!employee) {
    return <LoginScreen employees={employees} onLoginSuccess={handleLoginSuccess} />;
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
            markAllNotificationsAsRead={markAllNotificationsAsRead}
            markNotificationAsRead={markNotificationAsRead}
            deleteNotification={deleteNotification}
          />
        )}
        </main>

      </div>

    </div>
  );
}
