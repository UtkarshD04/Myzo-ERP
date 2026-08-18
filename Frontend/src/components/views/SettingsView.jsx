import React, { useEffect, useState } from 'react';
import { Moon, Sun, Bell, Shield, Globe, Monitor, Check, User, Mail, KeyRound, Lock, Landmark, ImagePlus, Trash2 } from 'lucide-react';

// Same "no file-storage backend, store as a base64 data URL" convention
// used for product images (ProductsManagementView.jsx) and employee photos.
const MAX_CHEQUE_IMAGE_BYTES = 2 * 1024 * 1024;

function readImageAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const CHEQUE_FIELD_LABELS = {
  date: { label: 'Date', short: 'D' },
  payee: { label: 'Payee Line', short: 'P' },
  amountWords: { label: 'Amount in Words', short: 'W' },
  amountFigure: { label: 'Amount (Figure)', short: 'A' }
};

export default function SettingsView({ employee, onUpdateEmployee, companyBank, onUpdateCompanyBank }) {
  const [darkMode, setDarkMode] = useState(false);
  const [notifSound, setNotifSound] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [compactMode, setCompactMode] = useState(false);
  const [saved, setSaved] = useState(false);

  const isAdmin = employee?.role === 'Admin' || employee?.role?.toLowerCase() === 'admin';
  const canManageBank = employee?.role === 'Admin' || employee?.role === 'HR';

  // Company Bank Account state
  const EMPTY_BANK = { accountHolderName: '', bankName: '', branch: '', accountNumber: '', ifscCode: '', bankManagerName: '', bankManagerEmail: '', bankManagerPhone: '', chequeLeafImage: '', chequeFieldPositions: {} };
  const [bankForm, setBankForm] = useState(EMPTY_BANK);
  const [bankError, setBankError] = useState('');
  const [bankSuccess, setBankSuccess] = useState(false);
  const [isSavingBank, setIsSavingBank] = useState(false);
  const [activeChequeField, setActiveChequeField] = useState('date');

  useEffect(() => {
    if (companyBank) {
      setBankForm({
        accountHolderName: companyBank.accountHolderName || '',
        bankName: companyBank.bankName || '',
        branch: companyBank.branch || '',
        accountNumber: companyBank.accountNumber || '',
        ifscCode: companyBank.ifscCode || '',
        bankManagerName: companyBank.bankManagerName || '',
        bankManagerEmail: companyBank.bankManagerEmail || '',
        bankManagerPhone: companyBank.bankManagerPhone || '',
        chequeLeafImage: companyBank.chequeLeafImage || '',
        chequeFieldPositions: companyBank.chequeFieldPositions || {}
      });
    }
  }, [companyBank]);

  const handleBankSave = async (e) => {
    e.preventDefault();
    setBankError('');
    setBankSuccess(false);
    setIsSavingBank(true);
    try {
      await onUpdateCompanyBank(bankForm);
      setBankSuccess(true);
      setTimeout(() => setBankSuccess(false), 4000);
    } catch (err) {
      setBankError(err.message || 'Failed to update company bank details.');
    } finally {
      setIsSavingBank(false);
    }
  };

  const handleChequeImageChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > MAX_CHEQUE_IMAGE_BYTES) {
      setBankError('Cheque image must be under 2MB.');
      return;
    }
    setBankError('');
    const dataUrl = await readImageAsDataUrl(file);
    setBankForm(prev => ({ ...prev, chequeLeafImage: dataUrl, chequeFieldPositions: {} }));
  };

  const handleRemoveChequeImage = () => {
    setBankForm(prev => ({ ...prev, chequeLeafImage: '', chequeFieldPositions: {} }));
  };

  const handleChequeImageClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setBankForm(prev => ({
      ...prev,
      chequeFieldPositions: { ...prev.chequeFieldPositions, [activeChequeField]: { x, y } }
    }));
  };

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

      {/* Company Bank Account (Admin/HR only) — feeds the Payroll "Send to Bank" flow */}
      {canManageBank && (
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center">
            <Landmark className="w-4 h-4 mr-1.5 text-blue-500" />
            Company Bank Account
          </h3>
          <p className="text-[11px] text-slate-400 -mt-2">Used to print the salary disbursement cheque and to email it to the bank manager from Payroll.</p>

          <form onSubmit={handleBankSave} className="space-y-4">
            {bankError && (
              <div className="text-[11px] font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5">
                ⚠️ {bankError}
              </div>
            )}
            {bankSuccess && (
              <div className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl px-3.5 py-2.5">
                🎉 Company bank details updated successfully!
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Account Holder Name</label>
                <input
                  type="text"
                  value={bankForm.accountHolderName}
                  onChange={(e) => setBankForm({ ...bankForm, accountHolderName: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Bank Name</label>
                <input
                  type="text"
                  value={bankForm.bankName}
                  onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Branch</label>
                <input
                  type="text"
                  value={bankForm.branch}
                  onChange={(e) => setBankForm({ ...bankForm, branch: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Account Number</label>
                <input
                  type="text"
                  value={bankForm.accountNumber}
                  onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">IFSC Code</label>
                <input
                  type="text"
                  value={bankForm.ifscCode}
                  onChange={(e) => setBankForm({ ...bankForm, ifscCode: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Next Cheque No</label>
                <input
                  type="text"
                  disabled
                  value={companyBank?.nextChequeNumber ?? '--'}
                  className="w-full px-3.5 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="border-t border-slate-50 pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Bank Manager Name</label>
                <input
                  type="text"
                  value={bankForm.bankManagerName}
                  onChange={(e) => setBankForm({ ...bankForm, bankManagerName: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Bank Manager Email</label>
                <input
                  type="email"
                  value={bankForm.bankManagerEmail}
                  onChange={(e) => setBankForm({ ...bankForm, bankManagerEmail: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Bank Manager Phone</label>
                <input
                  type="text"
                  value={bankForm.bankManagerPhone}
                  onChange={(e) => setBankForm({ ...bankForm, bankManagerPhone: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="border-t border-slate-50 pt-4 space-y-3">
              <div>
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Real Cheque Leaf</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Upload a scan/photo of your actual bank cheque, then click on it to place where the date, payee line, and amount should print — like cheque printing in Tally/Zoho.</p>
              </div>

              <label className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-600 text-slate-600 font-bold rounded-lg text-[11px] cursor-pointer transition-all w-fit">
                <ImagePlus className="w-3.5 h-3.5" />
                {bankForm.chequeLeafImage ? 'Replace Cheque Image' : 'Upload Cheque Image'}
                <input type="file" accept="image/*" onChange={handleChequeImageChange} className="hidden" />
              </label>

              {bankForm.chequeLeafImage && (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {Object.entries(CHEQUE_FIELD_LABELS).map(([field, meta]) => (
                      <button
                        key={field}
                        type="button"
                        onClick={() => setActiveChequeField(field)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                          activeChequeField === field ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:border-blue-300'
                        }`}
                      >
                        {meta.label}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={handleRemoveChequeImage}
                      className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold text-red-500 hover:bg-red-50 cursor-pointer transition-all"
                    >
                      <Trash2 className="w-3 h-3" /> Remove Image
                    </button>
                  </div>

                  <p className="text-[10px] text-slate-400">Click on the cheque image to place the <strong className="text-slate-600">{CHEQUE_FIELD_LABELS[activeChequeField].label}</strong> field.</p>

                  <div style={{ position: 'relative', width: '100%', maxWidth: 480 }}>
                    <img
                      src={bankForm.chequeLeafImage}
                      onClick={handleChequeImageClick}
                      style={{ width: '100%', display: 'block', borderRadius: 8, border: '1px solid #e2e8f0', cursor: 'crosshair' }}
                    />
                    {Object.entries(bankForm.chequeFieldPositions || {}).map(([field, pos]) => (
                      <div
                        key={field}
                        style={{
                          position: 'absolute',
                          left: `${pos.x * 100}%`,
                          top: `${pos.y * 100}%`,
                          transform: 'translate(-50%, -50%)',
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          background: field === activeChequeField ? '#2563eb' : '#0f172a',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 10,
                          fontWeight: 700,
                          border: '2px solid white',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                          pointerEvents: 'none'
                        }}
                      >
                        {CHEQUE_FIELD_LABELS[field]?.short}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSavingBank}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/10 cursor-pointer active:scale-95 transition-all"
              >
                {isSavingBank ? 'Saving...' : 'Save Bank Details'}
              </button>
            </div>
          </form>
        </div>
      )}

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
