import React, { useState } from 'react';
import { KeyRound, ShieldAlert, Sparkles, Mail, Eye, EyeOff, Building2 } from 'lucide-react';

export default function LoginScreen({ employees = [], onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailChange = (val) => {
    setEmail(val);
    setError('');
    const match = employees.find(
      (e) => e.officialEmail?.toLowerCase() === val.trim().toLowerCase()
    );
    setPreview(match || null);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await onLoginSuccess({ employeeId: email, password });
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const roleColor = {
    Admin: 'bg-indigo-50 text-indigo-600 border border-indigo-100',
    Manager: 'bg-amber-50 text-amber-600 border border-amber-100',
    HR: 'bg-rose-50 text-rose-600 border border-rose-100',
    Employee: 'bg-sky-50 text-sky-600 border border-sky-100',
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 font-sans relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-600 rounded-full filter blur-[128px] opacity-10 animate-pulse" />
      <div className="absolute bottom-0 -right-4 w-96 h-96 bg-indigo-600 rounded-full filter blur-[128px] opacity-10 animate-pulse" />

      {/* Main Glass Box */}
      <div className="w-full max-w-5xl h-[640px] flex rounded-3xl overflow-hidden border border-slate-800 bg-slate-900/40 backdrop-blur-xl shadow-2xl relative z-10 m-4">
        {/* Left Side: Dynamic Workspace Visualizer */}
        <div className="hidden md:flex md:w-1/2 relative bg-slate-950/60 p-12 flex-col justify-between border-r border-slate-800/80">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/20">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white flex items-center">
              MYZO<span className="text-blue-500 font-medium ml-1 text-sm bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-500/20">ERP</span>
            </span>
          </div>

          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-xs font-semibold text-blue-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Production Grade Performance</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight leading-[1.15]">
              Redefining <br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
                Workforce Intelligence.
              </span>
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              An enterprise dashboard equipped with geolocated attendance trackers, Kanban-style sprint boards, and intuitive role-based views.
            </p>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-6 border-t border-slate-900">
            <span>© 2026 MYZO Systems Inc.</span>
            <span>v2.1.0-alpha</span>
          </div>
        </div>

        {/* Right Side: Glassmorphic Credential Form */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center bg-slate-900/20">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">System Access</h2>
              <p className="text-xs text-slate-400 mt-1">Provide your credentials to check in and initialize your dashboard.</p>
            </div>

            {/* Live Employee Match Preview */}
            {preview && (
              <div className="flex items-center space-x-3.5 p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
                <img
                  src={preview.photo}
                  alt={preview.name}
                  className="w-11 h-11 rounded-xl object-cover border border-slate-800 shadow-md"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-slate-100 truncate">{preview.name}</p>
                  <p className="text-xs text-slate-400 truncate">{preview.designation} · {preview.department}</p>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0 ${roleColor[preview.role] || 'bg-slate-800 text-slate-400'}`}>
                  {preview.role}
                </span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Official Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="name@myzo.com"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-950/50 border border-slate-800 focus:border-blue-600 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Password</label>
                  <span className="text-[10px] text-blue-500 hover:underline cursor-pointer font-semibold">Forgot Password?</span>
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-11 py-3 bg-slate-950/50 border border-slate-800 focus:border-blue-600 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center space-x-2.5 p-3.5 bg-red-950/20 border border-red-900/30 text-red-400 rounded-xl text-xs font-semibold animate-shake">
                  <ShieldAlert className="w-4.5 h-4.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-blue-600/40 disabled:to-indigo-600/40 disabled:text-slate-400 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-blue-500/10 active:scale-[0.99] mt-2 cursor-pointer"
              >
                {loading ? 'Authenticating System...' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
