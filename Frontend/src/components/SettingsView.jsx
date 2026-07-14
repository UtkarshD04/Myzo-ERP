import React, { useState } from 'react';
import { Settings, Bell, Shield, Palette, Globe, Moon, Sun, Volume2, VolumeX } from 'lucide-react';

export default function SettingsView() {
  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: true,
    darkMode: false,
    soundEnabled: true,
    language: 'en',
    timezone: 'Asia/Kolkata'
  });

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-50 text-[#2563EB] rounded-2xl">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Settings</h2>
            <p className="text-xs text-slate-500 mt-1">Manage your account preferences</p>
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-4">
        {/* Notifications Settings */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <Bell className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Notifications</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div>
                <p className="text-sm font-semibold text-slate-800">Push Notifications</p>
                <p className="text-xs text-slate-500">Receive browser notifications</p>
              </div>
              <button 
                onClick={() => toggleSetting('notifications')}
                className={`w-12 h-6 rounded-full transition-all ${
                  settings.notifications ? 'bg-[#2563EB]' : 'bg-slate-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-all ${
                  settings.notifications ? 'ml-6' : 'ml-0.5'
                }`}></div>
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div>
                <p className="text-sm font-semibold text-slate-800">Email Alerts</p>
                <p className="text-xs text-slate-500">Receive email notifications</p>
              </div>
              <button 
                onClick={() => toggleSetting('emailAlerts')}
                className={`w-12 h-6 rounded-full transition-all ${
                  settings.emailAlerts ? 'bg-[#2563EB]' : 'bg-slate-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-all ${
                  settings.emailAlerts ? 'ml-6' : 'ml-0.5'
                }`}></div>
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div>
                <p className="text-sm font-semibold text-slate-800">Sound Effects</p>
                <p className="text-xs text-slate-500">Play sounds for notifications</p>
              </div>
              <button 
                onClick={() => toggleSetting('soundEnabled')}
                className={`w-12 h-6 rounded-full transition-all ${
                  settings.soundEnabled ? 'bg-[#2563EB]' : 'bg-slate-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-all ${
                  settings.soundEnabled ? 'ml-6' : 'ml-0.5'
                }`}></div>
              </button>
            </div>
          </div>
        </div>

        {/* Appearance Settings */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <Palette className="w-5 h-5 text-purple-600" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Appearance</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div>
                <p className="text-sm font-semibold text-slate-800">Dark Mode</p>
                <p className="text-xs text-slate-500">Enable dark theme</p>
              </div>
              <button 
                onClick={() => toggleSetting('darkMode')}
                className={`w-12 h-6 rounded-full transition-all ${
                  settings.darkMode ? 'bg-[#2563EB]' : 'bg-slate-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-all ${
                  settings.darkMode ? 'ml-6' : 'ml-0.5'
                }`}></div>
              </button>
            </div>
          </div>
        </div>

        {/* Language & Region */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <Globe className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Language & Region</h3>
          </div>
          
          <div className="space-y-3">
            <div className="p-3 bg-slate-50 rounded-xl">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Language</label>
              <select className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-[#2563EB]">
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </select>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Timezone</label>
              <select className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-[#2563EB]">
                <option value="Asia/Kolkata">India (IST) - UTC+5:30</option>
                <option value="America/New_York">Eastern Time (ET) - UTC-5:00</option>
                <option value="America/Los_Angeles">Pacific Time (PT) - UTC-8:00</option>
                <option value="Europe/London">London (GMT) - UTC+0:00</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="w-5 h-5 text-red-600" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Security</h3>
          </div>
          
          <div className="space-y-3">
            <button className="w-full p-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-left transition-all">
              <p className="text-sm font-semibold text-slate-800">Change Password</p>
              <p className="text-xs text-slate-500">Update your account password</p>
            </button>

            <button className="w-full p-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-left transition-all">
              <p className="text-sm font-semibold text-slate-800">Two-Factor Authentication</p>
              <p className="text-xs text-slate-500">Add an extra layer of security</p>
            </button>

            <button className="w-full p-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-left transition-all">
              <p className="text-sm font-semibold text-slate-800">Active Sessions</p>
              <p className="text-xs text-slate-500">Manage your logged-in devices</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
