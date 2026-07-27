import React, { useRef, useState } from 'react';
import { User, Mail, Phone, Calendar, ArrowRight, Shield, Camera, Loader2 } from 'lucide-react';

function resizeImageToDataUrl(file, maxSize = 320, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height) {
          if (width > maxSize) { height = Math.round((height * maxSize) / width); width = maxSize; }
        } else if (height > maxSize) {
          width = Math.round((width * maxSize) / height); height = maxSize;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error('Could not read image.'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Could not read file.'));
    reader.readAsDataURL(file);
  });
}

export default function ProfileView({ employee, employees = [], onUpdatePhoto }) {
  const manager = employees.find(e => employee.reportsTo && e.name && e.name.includes(employee.reportsTo.split(' (')[0])) || employees.find(e => e.role === 'Admin');

  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setUploadError('Image is too large (max 8MB).');
      return;
    }

    setUploadError('');
    setUploading(true);
    try {
      const dataUrl = await resizeImageToDataUrl(file);
      await onUpdatePhoto?.(dataUrl);
    } catch (err) {
      setUploadError('Failed to upload photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto font-sans text-slate-800 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">My Profile</h2>
          <p className="text-xs text-slate-500 mt-1">Manage credentials and audit system classifications.</p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Profile Identity Card */}
        <div className="lg:col-span-4 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
          <div className="relative">
            <img
              src={employee.photo}
              alt={employee.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-slate-100 shadow-md shadow-slate-100/50"
              referrerPolicy="no-referrer"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              title="Change profile photo"
              className="absolute bottom-0 right-0 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full border-2 border-white shadow-md cursor-pointer transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </div>
          {uploadError && <p className="text-[10px] text-red-500 font-semibold mt-2 max-w-45">{uploadError}</p>}
          <h3 className="text-lg font-black text-slate-800 mt-4 leading-none">{employee.name}</h3>
          <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 border border-blue-100 rounded-md px-2.5 py-0.5 mt-2.5 uppercase tracking-wider">
            {employee.designation}
          </span>

          <div className="w-full border-t border-slate-50 mt-5 pt-5 space-y-3 text-xs text-left font-medium text-slate-600">
            <div className="flex items-center space-x-2.5">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{employee.officialEmail}</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{employee.phone || 'Not Specified'}</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Joined: {employee.joiningDate}</span>
            </div>
          </div>
        </div>

        {/* Corporate hierarchy and financial summary */}
        <div className="lg:col-span-8 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
          <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-4">Corporate Hierarchy Mapping</h3>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4.5 bg-slate-50 border border-slate-100 rounded-2xl">
            <div className="flex items-center space-x-3 text-xs">
              <img
                src={employee.photo}
                alt={employee.name}
                className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0">
                <p className="font-bold text-slate-800 truncate">{employee.name}</p>
                <p className="text-[9px] text-slate-400 font-semibold">{employee.designation}</p>
              </div>
            </div>

            <ArrowRight className="hidden sm:block w-4 h-4 text-slate-400 shrink-0" />

            {manager && (
              <div className="flex items-center space-x-3 text-xs">
                <img
                  src={manager.photo}
                  alt={manager.name}
                  className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 truncate">{manager.name}</p>
                  <p className="text-[9px] text-slate-400 font-semibold">{manager.designation}</p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-slate-600">
            <div className="p-4.5 border border-slate-100 rounded-2xl">
              <span className="text-[9px] font-bold text-slate-400 block uppercase">Department Area</span>
              <span className="text-slate-800 font-black text-sm block mt-1">{employee.department}</span>
            </div>

            <div className="p-4.5 border border-slate-100 rounded-2xl">
              <span className="text-[9px] font-bold text-slate-400 block uppercase">Basic Salary Rate</span>
              <span className="text-slate-800 font-black text-sm block mt-1">₹{employee.salary?.toLocaleString()}/month</span>
            </div>
          </div>

          <div className="p-3.5 bg-blue-50/50 border border-blue-100 rounded-xl text-[10px] text-slate-500 font-medium leading-relaxed flex items-start space-x-2">
            <Shield className="w-4.5 h-4.5 text-blue-500 shrink-0 mt-0.5" />
            <p>
              Hierarchy mapping dictates work reports routing flow. If your reporting details are incorrect, flag with IT Admin Dwight Schrute.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
