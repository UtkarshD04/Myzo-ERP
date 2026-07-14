import React, { useState } from 'react';
import { INITIAL_EMPLOYEES } from '../data';
import { KeyRound, ShieldAlert, Activity } from 'lucide-react';

export default function LoginScreen({ onLoginSuccess }) {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    const found = INITIAL_EMPLOYEES.find(emp => emp.id.toLowerCase() === employeeId.trim().toLowerCase());
    if (found) {
      setError('');
      onLoginSuccess(found);
    } else {
      setError('Invalid Employee ID. Try a demo account below.');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left: Hero Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop"
          alt="Modern office workspace"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 to-slate-900/60" />
        {/* Text on image */}
        <div className="relative z-10 flex flex-col justify-end p-12 text-white">
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">MYZO ERP</span>
          </div>
          <h2 className="text-4xl font-bold leading-tight mb-3">
            Manage your workforce<br />smarter, faster.
          </h2>
          <p className="text-blue-100 text-sm leading-relaxed max-w-sm">
            Attendance tracking, task management, KPI dashboards — all in one place for your entire team.
          </p>
        </div>
      </div>

      {/* Right: Form */}
      <div className="w-full lg:w-1/2 bg-slate-50 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-sm space-y-5">

          {/* Mobile brand */}
          <div className="lg:hidden text-center">
            <div className="inline-flex items-center space-x-2 text-blue-600 mb-1">
              <Activity className="w-5 h-5" />
              <span className="font-bold text-lg">MYZO ERP</span>
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-800">Welcome back</h1>
            <p className="text-sm text-slate-500 mt-1">Sign in to your account</p>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Employee ID</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EMP102"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all pr-10"
                  />
                  <KeyRound className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>

              {error && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 text-red-600 rounded-xl border border-red-100 text-xs">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all"
              >
                Sign In
              </button>
            </form>
          </div>

          {/* Demo Accounts */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 mb-3">Quick Demo — Click to login</p>
            <div className="grid grid-cols-3 gap-2">
              {INITIAL_EMPLOYEES.map((emp) => (
                <button
                  key={emp.id}
                  onClick={() => onLoginSuccess(emp)}
                  className="flex flex-col items-start p-2.5 border border-slate-100 hover:border-blue-300 hover:bg-blue-50/30 rounded-xl transition-all text-left"
                >
                  <span className="font-mono text-[10px] font-bold text-blue-600">{emp.id}</span>
                  <span className="font-semibold text-slate-700 text-xs truncate w-full">{emp.name.split(' ')[0]}</span>
                  <span className="text-[9px] text-slate-400 mt-0.5">{emp.role}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
