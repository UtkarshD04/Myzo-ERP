import React, { useState } from 'react';
import { Mail, ShieldAlert, CheckCircle2, Loader2, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { api } from '../../api';

export default function ForgotPasswordScreen({ onBackToLogin }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/70 font-sans relative overflow-hidden p-4">
      <div className="absolute top-0 -left-24 w-96 h-96 bg-blue-300 rounded-full filter blur-[120px] opacity-40 animate-pulse" />
      <div className="absolute bottom-0 -right-24 w-96 h-96 bg-indigo-300 rounded-full filter blur-[120px] opacity-40 animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-violet-200 rounded-full filter blur-[100px] opacity-30 animate-float" />

      <div className="w-full max-w-5xl h-auto md:h-[640px] flex rounded-3xl overflow-hidden border border-slate-200/80 bg-white shadow-2xl shadow-slate-300/40 relative z-10 animate-in fade-in zoom-in-95 duration-500">

        <div className="hidden md:flex md:w-1/2 relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-12 flex-col justify-between overflow-hidden">
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
              <span>Account Recovery</span>
            </div>
            <h1
              className="text-4xl font-extrabold text-white tracking-tight leading-[1.15] animate-in fade-in slide-in-from-bottom duration-500"
              style={{ animationDelay: '160ms' }}
            >
              Forgot your <br />
              <span className="bg-gradient-to-r from-blue-200 via-sky-100 to-white bg-clip-text text-transparent">
                password?
              </span>
            </h1>
            <p
              className="text-blue-100/80 text-sm leading-relaxed max-w-sm animate-in fade-in slide-in-from-bottom duration-500"
              style={{ animationDelay: '240ms' }}
            >
              No worries — enter your official email and we'll send a secure link to reset it.
            </p>
          </div>

          <div className="flex items-center justify-between text-xs text-blue-200/70 pt-6 border-t border-white/10 relative z-10">
            <span>© 2026 MYZO Systems Inc.</span>
            <span>v2.1.0-alpha</span>
          </div>
        </div>

        <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center bg-white">
          <div className="space-y-6">
            <div className="md:hidden">
              <img src="/logo.png" alt="Myzo" className="h-8 w-auto" />
            </div>

            {sent ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom duration-500">
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100">
                  <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Check your inbox</h2>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    If an account exists for <span className="font-semibold text-slate-700">{email}</span>, a password reset link has been sent. The link expires in 1 hour.
                  </p>
                </div>
                <button
                  onClick={onBackToLogin}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-sm transition-all duration-200 shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Sign In</span>
                </button>
              </div>
            ) : (
              <>
                <div className="animate-in fade-in slide-in-from-bottom duration-500">
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Reset Password</h2>
                  <p className="text-xs text-slate-500 mt-1">Enter your official email to receive a reset link.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5 animate-in fade-in slide-in-from-bottom duration-500" style={{ animationDelay: '80ms' }}>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">Official Email</label>
                    <div className="relative group">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-colors group-focus-within:text-blue-600" />
                      <input
                        type="email"
                        required
                        placeholder="name@myzo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 font-medium"
                      />
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
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-blue-300 disabled:to-indigo-300 text-white font-semibold rounded-xl text-sm transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] mt-2 cursor-pointer disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2 group"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending link…</span>
                      </>
                    ) : (
                      <>
                        <span>Send Reset Link</span>
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={onBackToLogin}
                    className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 cursor-pointer transition-colors pt-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Sign In</span>
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
