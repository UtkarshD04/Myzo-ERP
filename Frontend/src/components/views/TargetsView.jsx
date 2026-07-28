import React from 'react';
import SalesManagerDashboard from '../dashboards/SalesManagerDashboard';
import SalesAssociateDashboard from '../dashboards/SalesAssociateDashboard';
import BDEDashboard from '../dashboards/BDEDashboard';

// Reachable whenever the sidebar shows "Target Analytics" — sales department
// staff, plus any manager (see layout/Sidebar.jsx). Routes to the same
// quota/commission dashboards used on the home Dashboard, since those are
// already real, quotation-driven target analytics rather than mock numbers.
export default function TargetsView({ employee, employees = [], quotations = [], payrolls = [] }) {
  const role = employee.role?.toLowerCase() || '';
  const dept = employee.department?.toLowerCase() || '';
  const designation = employee.designation?.toLowerCase() || '';

  const isSalesManager = role === 'manager' && dept === 'sales';
  const isBDE = designation.includes('bde') || designation.includes('business development');
  const isSalesAssociate = !isBDE && dept === 'sales' && role !== 'manager';

  const renderTargets = () => {
    if (isSalesManager) {
      return <SalesManagerDashboard employee={employee} employees={employees} quotations={quotations} payrolls={payrolls} scope="team" />;
    }
    if (isBDE) {
      return <BDEDashboard employee={employee} payrolls={payrolls} />;
    }
    if (isSalesAssociate) {
      return <SalesAssociateDashboard employee={employee} quotations={quotations} payrolls={payrolls} />;
    }
    // Managers outside the sales department land here too — team quota
    // tracking is quotation-based, so this is an honest "nothing to show
    // yet" state rather than fabricated numbers.
    return <SalesManagerDashboard employee={employee} employees={employees} quotations={quotations} payrolls={payrolls} scope="team" />;
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto font-sans text-slate-800 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
        <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 bg-blue-600/10 text-blue-600 rounded-full border border-blue-100">
          Target Analytics
        </span>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight mt-1.5">
          Quota & Commission Tracking
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Live figures computed from quotations and this month's payroll.
        </p>
      </div>

      {renderTargets()}
    </div>
  );
}
