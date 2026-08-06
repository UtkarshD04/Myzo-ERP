import {
  LayoutDashboard,
  Briefcase,
  Users,
  ShoppingBag,
  Boxes,
  Building2
} from 'lucide-react';

// Single source of truth for the sidebar's module icons and the tab row
// each module reveals at the top of the page. Tab ids are the same
// `activeTab` values App.jsx already switches on — this only changes how
// they're grouped and reached, not what renders.
export function getModules(employee) {
  const role = employee?.role?.toLowerCase() || '';
  const dept = employee?.department?.toLowerCase() || '';

  const canSeeInventory = role === 'admin' || (role === 'manager' && dept === 'sales');
  const canSeeHR = role === 'admin' || role === 'hr';
  const canSeeWebsiteActivity = role === 'admin' || role === 'manager' || role === 'hr' || dept === 'sales';
  const canSeeTargets = dept === 'sales' || role === 'manager';

  const modules = [
    {
      id: 'home',
      label: 'Home',
      icon: LayoutDashboard,
      tabs: [
        { id: 'dashboard', label: 'Dashboard' },
      ],
    },
    {
      id: 'myspace',
      label: 'My Space',
      icon: Briefcase,
      tabs: [
        { id: 'attendance', label: 'Attendance' },
        { id: 'leaves', label: 'Leaves' },
        { id: 'tasks', label: 'Tasks' },
        { id: 'workreport', label: 'Work Logs' },
        { id: 'expenses', label: 'Expenses' },
        { id: 'assets', label: 'Assets' },
      ],
    },
    {
      id: 'people',
      label: 'People',
      icon: Users,
      tabs: canSeeHR
        ? [
            { id: 'employees', label: 'Employees' },
            { id: 'recruitment', label: 'Recruitment' },
            { id: 'onboarding', label: 'Onboarding' },
            { id: 'payroll', label: 'Payroll' },
          ]
        : [],
    },
    {
      id: 'sales',
      label: 'Sales',
      icon: ShoppingBag,
      tabs: [
        { id: 'customers', label: 'Customers' },
        { id: 'quotations', label: 'Quotes' },
        { id: 'invoices', label: 'Invoices' },
        ...(canSeeTargets ? [{ id: 'targets', label: 'Targets' }] : []),
      ],
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: Boxes,
      tabs: canSeeInventory
        ? [
            { id: 'products', label: 'Products' },
            { id: 'inventory', label: 'Stock' },
            { id: 'vendors', label: 'Vendors' },
          ]
        : [],
    },
    {
      id: 'company',
      label: 'Company',
      icon: Building2,
      tabs: [
        ...(canSeeWebsiteActivity ? [{ id: 'website-activity', label: 'Website Activity' }] : []),
        { id: 'holidays', label: 'Holidays' },
      ],
    },
  ];

  return modules.filter((module) => module.tabs.length > 0);
}
