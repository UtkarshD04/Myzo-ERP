import React, { useState } from 'react';
import { KeyRound, ShieldAlert, Mail, Eye, EyeOff, Loader2 } from 'lucide-react';

function DeskIllustration() {
  return (
    <svg viewBox="0 0 400 400" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Window */}
      <rect x="250" y="18" width="120" height="150" rx="8" fill="#EEF2FF" stroke="#C7D2FE" strokeWidth="6" />
      <line x1="310" y1="18" x2="310" y2="168" stroke="#C7D2FE" strokeWidth="6" />
      <line x1="250" y1="93" x2="370" y2="93" stroke="#C7D2FE" strokeWidth="6" />

      {/* Shelf */}
      <rect x="14" y="150" width="66" height="150" rx="6" fill="#1E1B4B" />
      <rect x="22" y="176" width="50" height="6" fill="#4338CA" />
      <rect x="22" y="222" width="50" height="6" fill="#4338CA" />
      <rect x="26" y="188" width="14" height="30" rx="2" fill="#818CF8" />
      <rect x="44" y="184" width="14" height="34" rx="2" fill="#6366F1" />

      {/* Desk */}
      <rect x="70" y="288" width="300" height="16" rx="4" fill="#1E1B4B" />
      <rect x="90" y="304" width="10" height="70" fill="#312E81" />
      <rect x="340" y="304" width="10" height="70" fill="#312E81" />

      {/* Plant */}
      <path d="M120 288 C110 260 118 232 132 214 C146 232 154 260 144 288 Z" fill="#10B981" />
      <path d="M132 288 C126 268 130 248 140 234 C150 248 152 268 146 288 Z" fill="#34D399" />
      <rect x="112" y="286" width="42" height="28" rx="5" fill="#1E1B4B" />

      {/* Monitor */}
      <rect x="188" y="188" width="120" height="86" rx="8" fill="#312E81" />
      <rect x="198" y="198" width="100" height="62" rx="3" fill="#818CF8" />
      <rect x="236" y="274" width="24" height="16" fill="#1E1B4B" />
      <rect x="222" y="290" width="52" height="8" rx="3" fill="#1E1B4B" />

      {/* Mug */}
      <rect x="320" y="266" width="22" height="22" rx="4" fill="#4338CA" />
      <path d="M342 270 q10 0 10 8 t-10 8" stroke="#4338CA" strokeWidth="4" fill="none" />

      {/* Chair */}
      <rect x="196" y="330" width="70" height="16" rx="6" fill="#1E1B4B" />
      <rect x="205" y="234" width="52" height="96" rx="14" fill="#1E293B" />

      {/* Person */}
      <path d="M190 260 C190 228 214 210 232 210 C250 210 274 228 274 260 L274 300 L190 300 Z" fill="#6366F1" />
      <circle cx="232" cy="176" r="30" fill="#F3C99D" />
      <path d="M202 168 C202 142 218 128 232 128 C248 128 264 142 262 166 C256 156 246 150 232 150 C218 150 206 156 202 168 Z" fill="#1E1B4B" />
      <rect x="208" y="232" width="20" height="46" rx="8" fill="#F3C99D" />
      <rect x="238" y="232" width="20" height="46" rx="8" fill="#F3C99D" />
    </svg>
  );
}

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
    Admin: 'bg-indigo-500/40 text-white border border-indigo-300/30',
    Manager: 'bg-amber-500/40 text-white border border-amber-300/30',
    HR: 'bg-rose-500/40 text-white border border-rose-300/30',
    Employee: 'bg-sky-500/40 text-white border border-sky-300/30',
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center lg:justify-start relative overflow-hidden bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 font-sans px-4 lg:pl-16 xl:pl-28">

      {/* Full-page wave background */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        preserveAspectRatio="none"
        viewBox="0 0 1920 1080"
        fill="none"
      >
        <path d="M0,320 C420,520 720,140 1920,460 L1920,1080 L0,1080 Z" fill="#C7D2FE" opacity="0.55" />
        <path d="M0,520 C520,720 920,360 1920,660 L1920,1080 L0,1080 Z" fill="#A5B4FC" opacity="0.45" />
        <path d="M0,720 C620,860 1020,610 1920,860 L1920,1080 L0,1080 Z" fill="#818CF8" opacity="0.25" />
      </svg>

      {/* Desk illustration */}
      <div className="hidden lg:block absolute right-16 xl:right-32 bottom-16 w-64 xl:w-80 z-10">
        <DeskIllustration />
      </div>

      {/* Card */}
      <div className="relative z-20 w-full max-w-sm md:max-w-md rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl shadow-indigo-950/20 my-10">
        {/* Card wave background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-blue-900 to-blue-700" />
        <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 500 700" fill="none">
          <path d="M0,140 C150,300 350,40 500,210 L500,700 L0,700 Z" fill="#3B82F6" opacity="0.35" />
          <path d="M0,270 C180,420 320,170 500,370 L500,700 L0,700 Z" fill="#60A5FA" opacity="0.25" />
        </svg>

        <div className="relative z-10 p-7 sm:p-9 md:p-10">

          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-9">
           
            <span className="text-lg font-extrabold text-white tracking-tight">    <img src="/loginpagelogo.png" alt="Myzo" className="w-10 h-10 rounded-xl object-cover" /><span className="text-blue-400">ERP</span></span>
          </div>

          <h2 className="text-2xl font-bold text-white mb-6">Welcome back!</h2>

          {/* Employee preview */}
          {preview && (
            <div className="flex items-center gap-3 p-3 rounded-xl mb-5 bg-white/10 border border-white/15">
              <img
                src={preview.photo}
                alt={preview.name}
                className="w-9 h-9 rounded-lg object-cover shrink-0 border border-white/15"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-white truncate">{preview.name}</p>
                <p className="text-[10px] text-white/50 truncate">{preview.designation} · {preview.department}</p>
              </div>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${roleColor[preview.role] || 'bg-white/20 text-white'}`}>
                {preview.role}
              </span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-white/60">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className="w-full pl-4 pr-14 py-3.5 rounded-xl text-sm text-slate-800 bg-white/95 placeholder-slate-400 border border-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all font-medium"
                />
                <span className="absolute right-1.5 top-1.5 bottom-1.5 w-10 rounded-lg bg-indigo-950 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-white" />
                </span>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-white/60">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-4 pr-14 py-3.5 rounded-xl text-sm text-slate-800 bg-white/95 placeholder-slate-400 border border-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-1.5 top-1.5 bottom-1.5 w-10 rounded-lg bg-indigo-950 flex items-center justify-center cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 text-white" /> : <KeyRound className="w-4 h-4 text-white" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2.5 p-3 rounded-xl text-xs font-semibold text-red-200 bg-red-500/20 border border-red-400/30">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-indigo-950 hover:bg-indigo-900 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-indigo-950/40 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating…</span>
                </>
              ) : (
                <span>Login Now</span>
              )}
            </button>
          </form>

          <p className="text-white/25 text-[10px] text-center mt-7">© 2026 MYZO Systems Inc.</p>
        </div>
      </div>
    </div>
  );
}
