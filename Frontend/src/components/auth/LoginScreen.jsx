import React, { useState } from 'react';
import { KeyRound, ShieldAlert, Sparkles, Mail, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/70 font-sans relative overflow-hidden p-4">
      {/* Ambient Background Blobs */}
      <div className="absolute top-0 -left-24 w-96 h-96 bg-blue-300 rounded-full filter blur-[120px] opacity-40 animate-pulse" />
      <div className="absolute bottom-0 -right-24 w-96 h-96 bg-indigo-300 rounded-full filter blur-[120px] opacity-40 animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-violet-200 rounded-full filter blur-[100px] opacity-30 animate-float" />

      {/* Main Card */}
      <div className="w-full max-w-5xl h-auto md:h-[640px] flex rounded-3xl overflow-hidden border border-slate-200/80 bg-white shadow-2xl shadow-slate-300/40 relative z-10 animate-in fade-in zoom-in-95 duration-500">

        {/* Left Side: Brand Showcase */}
        <div className="hidden md:flex md:w-1/2 relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-12 flex-col justify-between overflow-hidden">
          {/* Decorative texture */}
          <div className="absolute -top-16 -right-16 w-64 h-64 border border-white/10 rounded-full" />
          <div className="absolute top-24 -right-8 w-40 h-40 border border-white/10 rounded-full" />
          <div className="absolute -bottom-20 -left-10 w-72 h-72 bg-white/5 rounded-full filter blur-2xl animate-float" style={{ animationDelay: '0.5s' }} />

          <div className="bg-white rounded-2xl px-4 py-2.5 shadow-lg shadow-blue-950/20 inline-flex self-start relative z-10 animate-in fade-in slide-in-from-top-2 duration-500">
            <img src="/logo.png" alt="Myzo" className="h-8 w-auto" />
          </div>

          <div className="space-y-6 relative z-10">
            <div
              className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 border border-white/15 backdrop-blur-sm rounded-full text-xs font-semibold text-blue-100 animate-in fade-in slide-in-from-bottom duration-500"
              style={{ animationDelay: '80ms' }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Production Grade Performance</span>
            </div>
            <h1
              className="text-4xl font-extrabold text-white tracking-tight leading-[1.15] animate-in fade-in slide-in-from-bottom duration-500"
              style={{ animationDelay: '160ms' }}
            >
              Redefining <br />
              <span className="bg-gradient-to-r from-blue-200 via-sky-100 to-white bg-clip-text text-transparent">
                Workforce Intelligence.
              </span>
            </h1>
            <p
              className="text-blue-100/80 text-sm leading-relaxed max-w-sm animate-in fade-in slide-in-from-bottom duration-500"
              style={{ animationDelay: '240ms' }}
            >
              An enterprise dashboard equipped with geolocated attendance trackers, Kanban-style sprint boards, and intuitive role-based views.
            </p>
          </div>

          <div className="flex items-center justify-between text-xs text-blue-200/70 pt-6 border-t border-white/10 relative z-10">
            <span>© 2026 MYZO Systems Inc.</span>
            <span>v2.1.0-alpha</span>
          </div>
        </div>

        {/* Right Side: Credential Form */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center bg-white">
          <div className="space-y-6">
            <div className="md:hidden">
              <img src="/logo.png" alt="Myzo" className="h-8 w-auto" />
            </div>
            <div className="animate-in fade-in slide-in-from-bottom duration-500">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">System Access</h2>
              <p className="text-xs text-slate-500 mt-1">Provide your credentials to check in and initialize your dashboard.</p>
            </div>

            {/* Live Employee Match Preview */}
            {preview && (
              <div className="flex items-center space-x-3.5 p-3.5 bg-blue-50/60 border border-blue-100 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
                <img
                  src={preview.photo}
                  alt={preview.name}
                  className="w-11 h-11 rounded-xl object-cover border border-white shadow-sm"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-slate-800 truncate">{preview.name}</p>
                  <p className="text-xs text-slate-500 truncate">{preview.designation} · {preview.department}</p>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0 ${roleColor[preview.role] || 'bg-slate-100 text-slate-500'}`}>
                  {preview.role}
                </span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div
                className="space-y-1.5 animate-in fade-in slide-in-from-bottom duration-500"
                style={{ animationDelay: '80ms' }}
              >
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">Official Email</label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-colors group-focus-within:text-blue-600" />
                  <input
                    type="email"
                    required
                    placeholder="name@myzo.com"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 font-medium"
                  />
                </div>
              </div>

              <div
                className="space-y-1.5 animate-in fade-in slide-in-from-bottom duration-500"
                style={{ animationDelay: '160ms' }}
              >
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">Password</label>
                  <span className="text-[10px] text-blue-600 hover:underline cursor-pointer font-semibold">Forgot Password?</span>
                </div>
                <div className="relative group">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-colors group-focus-within:text-blue-600" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center space-x-2.5 p-3.5 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-semibold animate-shake">
                  <ShieldAlert className="w-4.5 h-4.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-blue-300 disabled:to-indigo-300 text-white font-semibold rounded-xl text-sm transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] mt-2 cursor-pointer disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2 group animate-in fade-in slide-in-from-bottom duration-500"
                style={{ animationDelay: '240ms' }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Authenticating…</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
