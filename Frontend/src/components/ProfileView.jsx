import React from 'react';

export default function ProfileView({ employee, employees }) {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 mb-6">My Profile</h2>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Profile Photo & Basic Info */}
          <div className="flex-shrink-0">
            <img 
              src={employee.photo} 
              alt={employee.name} 
              className="w-32 h-32 rounded-2xl object-cover border border-slate-200"
            />
            <div className="mt-4 text-center">
              <span className="inline-block px-3 py-1 bg-blue-50 text-[#2563EB] text-xs font-bold rounded-full">
                {employee.role}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Full Name</label>
                <p className="text-sm font-bold text-slate-800 mt-1">{employee.name}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Employee ID</label>
                <p className="text-sm font-bold text-slate-800 mt-1 font-mono">{employee.id}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</label>
                <p className="text-sm font-bold text-slate-800 mt-1">{employee.department}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Designation</label>
                <p className="text-sm font-bold text-slate-800 mt-1">{employee.designation}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Post</label>
                <p className="text-sm font-bold text-slate-800 mt-1">{employee.post}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Joining Date</label>
                <p className="text-sm font-bold text-slate-800 mt-1">{employee.joiningDate}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Official Email</label>
                <p className="text-sm font-bold text-slate-800 mt-1">{employee.officialEmail}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone</label>
                <p className="text-sm font-bold text-slate-800 mt-1">{employee.phone}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Reports To</label>
                <p className="text-sm font-bold text-slate-800 mt-1">{employee.reportsTo}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Employment Status</label>
                <p className="text-sm font-bold text-slate-800 mt-1">
                  <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs rounded-full">
                    {employee.employmentStatus}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
