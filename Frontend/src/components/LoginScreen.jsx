import React, { useState } from 'react';
import { INITIAL_EMPLOYEES } from '../data';
import { KeyRound, ShieldAlert, Activity, Mail, Eye, EyeOff } from 'lucide-react';

export default function LoginScreen({ employees = INITIAL_EMPLOYEES, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [preview, setPreview] = useState(null); // matched employee preview
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Live-match employee from DB as user types email
  const handleEmailChange = (val) => {
    setEmail(val);
    setError('');
    const match = employees.find(e => e.officialEmail?.toLowerCase() === val.trim().toLowerCase());
    setPreview(match || null);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onLoginSuccess({ employeeId: email, password });
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const roleColor = {
    Admin: 'bg-purple-100 text-purple-700',
    Manager: 'bg-amber-100 text-amber-700',
    HR: 'bg-pink-100 text-pink-700',
    Employee: 'bg-blue-100 text-blue-700',
  };

  return (
    <div className="min-h-screen flex">
      {/* Left: Hero Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop"
          alt="Modern office"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 to-slate-900/60" />
        <div className="relative z-10 flex flex-col justify-end p-12 text-white">
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold">MYZO ERP</span>
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

          <div className="lg:hidden text-center">
            <div className="inline-flex items-center space-x-2 text-blue-600">
              <Activity className="w-5 h-5" />
              <span className="font-bold text-lg">MYZO ERP</span>
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-800">Welcome back</h1>
            <p className="text-sm text-slate-500 mt-1">Sign in with your official email</p>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">

            {/* Employee preview card — shows when email matches */}
            {preview && (
              <div className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                <img src={preview.photo} alt={preview.name} className="w-10 h-10 rounded-xl object-cover border border-blue-200" referrerPolicy="no-referrer" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-slate-800 truncate">{preview.name}</p>
                  <p className="text-xs text-slate-500 truncate">{preview.designation} · {preview.department}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${roleColor[preview.role] || 'bg-slate-100 text-slate-600'}`}>
                  {preview.role}
                </span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Official Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="you@myzo.com"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Password</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
                  />
                  <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
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
                disabled={loading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-all"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>



        </div>
      </div>
    </div>
  );
}
