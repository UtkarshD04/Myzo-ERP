import React, { useState } from 'react';
import { Moon, Sun, Bell, Shield, Globe, Monitor, Check, User, Mail, KeyRound, Lock } from 'lucide-react';

export default function SettingsView({ employee, onUpdateEmployee }) {
  const [darkMode, setDarkMode] = useState(false);
  const [notifSound, setNotifSound] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [compactMode, setCompactMode] = useState(false);
  const [saved, setSaved] = useState(false);

  const isAdmin = employee?.role === 'Admin' || employee?.role?.toLowerCase() === 'admin';

  // Admin Profile edit states
  const [name, setName] = useState(employee?.name || '');
  const [officialEmail, setOfficialEmail] = useState(employee?.officialEmail || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleAdminUpdate = async (e) => {
    e.preventDefault();
    setUpdateError('');
    setUpdateSuccess(false);

    if (!name.trim()) {
      setUpdateError('Name cannot be empty.');
      return;
    }

    if (!officialEmail.trim()) {
      setUpdateError('Official Email cannot be empty.');
      return;
    }

    if (password) {
      if (password.length < 6) {
        setUpdateError('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setUpdateError('Passwords do not match.');
        return;
      }
    }

    setIsUpdating(true);
    try {
      const updates = {
        name: name.trim(),
        officialEmail: officialEmail.trim().toLowerCase(),
      };
      if (password) {
        updates.password = password;
      }

      await onUpdateEmployee(employee.id, updates);
      setUpdateSuccess(true);
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => setUpdateSuccess(false), 4000);
    } catch (err) {
      setUpdateError(err.message || 'Failed to update account details.');
    } finally {
      setIsUpdating(false);
    }
  };

  const Toggle = ({ value, onChange }) => (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-all duration-300 cursor-pointer ${
        value ? 'bg-blue-600' : 'bg-slate-200'
      }`}
    >
      <span
        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${
          value ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-3xl mx-auto font-sans text-slate-800 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800">System Settings</h2>
        <p className="text-xs text-slate-500 mt-1">Manage your workspace preferences and notification behaviors.</p>
      </div>

      {/* Appearance */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-5">
        <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center">
          <Monitor className="w-4 h-4 mr-1.5 text-blue-500" />
          Appearance
        </h3>

        <div className="flex items-center justify-between py-3 border-b border-slate-50">
          <div>
            <p className="font-semibold text-sm text-slate-700">Dark Mode</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Switch the ERP interface to a dark themed layout</p>
          </div>
          <Toggle value={darkMode} onChange={setDarkMode} />
        </div>

        <div className="flex items-center justify-between py-3 border-b border-slate-50">
          <div>
            <p className="font-semibold text-sm text-slate-700">Compact View</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Condense sidebar and reduce card spacing for smaller screens</p>
          </div>
          <Toggle value={compactMode} onChange={setCompactMode} />
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-5">
        <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center">
          <Bell className="w-4 h-4 mr-1.5 text-blue-500" />
          Notifications
        </h3>

        <div className="flex items-center justify-between py-3 border-b border-slate-50">
          <div>
            <p className="font-semibold text-sm text-slate-700">Alert Sound Effects</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Play a sound when new task or HR notifications appear</p>
          </div>
          <Toggle value={notifSound} onChange={setNotifSound} />
        </div>

        <div className="flex items-center justify-between py-3">
          <div>
            <p className="font-semibold text-sm text-slate-700">Email Notification Alerts</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Receive email copies for reviewed/approved reports</p>
          </div>
          <Toggle value={emailAlerts} onChange={setEmailAlerts} />
        </div>
      </div>

      {/* Account Info / Edit Profile for Admin */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center">
          <Shield className="w-4 h-4 mr-1.5 text-blue-500" />
          Account Security
        </h3>

        {isAdmin ? (
          <form onSubmit={handleAdminUpdate} className="space-y-4">
            {updateError && (
              <div className="text-[11px] font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5 animate-in fade-in duration-200">
                ⚠️ {updateError}
              </div>
            )}
            {updateSuccess && (
              <div className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl px-3.5 py-2.5 animate-in fade-in duration-200">
                🎉 Account details updated successfully!
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Official Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={officialEmail}
                    onChange={(e) => setOfficialEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">New Password</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    placeholder="•••••••• (leave blank to keep current)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    placeholder="•••••••• (leave blank to keep current)"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isUpdating}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/10 cursor-pointer active:scale-95 transition-all flex items-center space-x-1.5"
              >
                {isUpdating ? (
                  <span>Updating Account...</span>
                ) : (
                  <span>Update Account Details</span>
                )}
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Official Email</span>
                <span className="font-bold text-slate-700">{employee?.officialEmail || 'N/A'}</span>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Employee Role</span>
                <span className="font-bold text-slate-700">{employee?.role || 'N/A'}</span>
              </div>
            </div>

            <div className="p-3.5 bg-amber-50/60 border border-amber-200/40 rounded-xl text-[11px] text-amber-800 font-semibold leading-relaxed">
              🔒 Password changes must be processed through IT Admin Dwight Schrute via the internal helpdesk portal.
            </div>
          </>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className={`px-6 py-2.5 font-bold text-xs rounded-xl transition-all cursor-pointer active:scale-95 flex items-center space-x-2 ${
            saved
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/10'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/10'
          }`}
        >
          {saved ? (
            <>
              <Check className="w-4 h-4" />
              <span>Saved!</span>
            </>
          ) : (
            <span>Save Preferences</span>
          )}
        </button>
      </div>
    </div>
  );
}
