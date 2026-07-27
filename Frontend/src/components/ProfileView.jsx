import React from 'react';
import { 
  User, 
  Briefcase, 
  Calendar, 
  Mail, 
  Phone, 
  Building2, 
  Award, 
  TrendingUp,
  Users,
  UserCheck,
  Clock,
  Target,
  CheckCircle2,
  ArrowUpRight
} from 'lucide-react';

export default function ProfileView({ employee, employees }) {
  // Calculate tenure
  const joiningDate = new Date(employee.joiningDate);
  const today = new Date();
  const tenureYears = Math.floor((today - joiningDate) / (365 * 24 * 60 * 60 * 1000));
  const tenureMonths = Math.floor(((today - joiningDate) % (365 * 24 * 60 * 60 * 1000)) / (30 * 24 * 60 * 60 * 1000));

  // Find manager details
  const manager = employees.find(e => 
    employee.reportsTo && e.name && employee.reportsTo.includes(e.name.split(' (')[0])
  );

  // Find direct reports
  const directReports = employees.filter(e => 
    e.reportsTo && e.reportsTo.includes(employee.name)
  );

  // Employment status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'Active': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'On Leave': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Inactive': return 'bg-slate-50 text-slate-700 border-slate-200';
      default: return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Hero Section - Profile Header */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200 p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* Profile Photo */}
          <div className="relative flex-shrink-0 mx-auto lg:mx-0">
            <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-white shadow-lg">
              <img 
                src={employee.photo} 
                alt={employee.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-white rounded-xl p-1.5 shadow-md">
              <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${getStatusColor(employee.employmentStatus)}`}>
                {employee.employmentStatus}
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1 text-center lg:text-left">
            <div className="space-y-2">
              <div>
                <span className="inline-block px-3 py-1 bg-[#2563EB]/10 text-[#2563EB] text-[10px] font-bold rounded-full uppercase tracking-wider mb-2">
                  {employee.role}
                </span>
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">{employee.name}</h1>
                <p className="text-sm text-slate-600 font-semibold mt-1">{employee.designation}</p>
              </div>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-slate-500 pt-2">
                <div className="flex items-center space-x-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  <span className="font-semibold">{employee.department}</span>
                </div>
                <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                <div className="flex items-center space-x-1.5">
                  <Award className="w-3.5 h-3.5" />
                  <span className="font-semibold">{employee.post}</span>
                </div>
                <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="font-semibold">{tenureYears}Y {tenureMonths}M tenure</span>
                </div>
              </div>

              <div className="flex items-center justify-center lg:justify-start gap-2 pt-3">
                <span className="text-[10px] font-mono text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                  ID: {employee.id}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 w-full lg:w-auto">
            <div className="bg-white rounded-xl p-4 border border-slate-200 text-center">
              <Target className="w-5 h-5 text-blue-600 mx-auto mb-1.5" />
              <p className="text-lg font-black text-slate-800">{employee.department}</p>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Department</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-200 text-center">
              <Calendar className="w-5 h-5 text-emerald-600 mx-auto mb-1.5" />
              <p className="text-lg font-black text-slate-800">{new Date(employee.joiningDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Joined</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-200 text-center">
              <TrendingUp className="w-5 h-5 text-purple-600 mx-auto mb-1.5" />
              <p className="text-lg font-black text-slate-800">{employee.employmentStatus}</p>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Status</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Contact & Personal Info */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Contact Information */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <div className="flex items-center space-x-3 mb-5">
              <div className="p-2.5 bg-blue-50 text-[#2563EB] rounded-xl">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Contact Information</h3>
                <p className="text-[10px] text-slate-500 font-medium">How to reach {employee.name.split(' ')[0]}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="group p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                <div className="flex items-start space-x-3">
                  <Mail className="w-4 h-4 text-slate-400 mt-0.5 group-hover:text-blue-600 transition-colors" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Official Email</p>
                    <p className="text-sm font-bold text-slate-800 break-all">{employee.officialEmail}</p>
                  </div>
                </div>
              </div>

              <div className="group p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                <div className="flex items-start space-x-3">
                  <Phone className="w-4 h-4 text-slate-400 mt-0.5 group-hover:text-blue-600 transition-colors" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Phone Number</p>
                    <p className="text-sm font-bold text-slate-800">{employee.phone}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Work Details */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <div className="flex items-center space-x-3 mb-5">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Work Details</h3>
                <p className="text-[10px] text-slate-500 font-medium">Professional information and role</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</p>
                <p className="text-sm font-bold text-slate-800">{employee.name}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Employee ID</p>
                <p className="text-sm font-bold text-slate-800 font-mono">{employee.id}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Department</p>
                <p className="text-sm font-bold text-slate-800">{employee.department}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Designation</p>
                <p className="text-sm font-bold text-slate-800">{employee.designation}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Post / Level</p>
                <p className="text-sm font-bold text-slate-800">{employee.post}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Joining Date</p>
                <p className="text-sm font-bold text-slate-800">{new Date(employee.joiningDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Reporting & Organization */}
        <div className="space-y-6">
          
          {/* Reporting Manager */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Reports To</h3>
                <p className="text-[10px] text-slate-500 font-medium">Direct supervisor</p>
              </div>
            </div>

            {manager ? (
              <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <img 
                  src={manager.photo} 
                  alt={manager.name}
                  className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{manager.name}</p>
                  <p className="text-[10px] text-slate-500 font-semibold truncate">{manager.designation}</p>
                  <p className="text-[10px] text-blue-600 font-bold truncate">{manager.reportsToDesignation}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-3">No manager assigned</p>
            )}
          </div>

          {/* Direct Reports */}
          {directReports.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Direct Reports</h3>
                  <p className="text-[10px] text-slate-500 font-medium">{directReports.length} team member{directReports.length > 1 ? 's' : ''}</p>
                </div>
              </div>

              <div className="space-y-2.5">
                {directReports.map((report, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100 hover:border-amber-200 transition-all cursor-pointer group">
                    <img 
                      src={report.photo} 
                      alt={report.name}
                      className="w-9 h-9 rounded-lg object-cover border-2 border-white shadow-sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">{report.name}</p>
                      <p className="text-[10px] text-slate-500 font-medium truncate">{report.designation}</p>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Employment Status Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-6 shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2.5 bg-white text-[#2563EB] rounded-xl">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Employment</h3>
                <p className="text-[10px] text-slate-600 font-medium">Current status</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-blue-100">
                <span className="text-xs font-semibold text-slate-600">Status</span>
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${getStatusColor(employee.employmentStatus)}`}>
                  {employee.employmentStatus}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-blue-100">
                <span className="text-xs font-semibold text-slate-600">Role Type</span>
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200">
                  {employee.role}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-blue-100">
                <span className="text-xs font-semibold text-slate-600">Tenure</span>
                <span className="text-xs font-bold text-slate-800">
                  {tenureYears} {tenureYears === 1 ? 'year' : 'years'} {tenureMonths} {tenureMonths === 1 ? 'month' : 'months'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}