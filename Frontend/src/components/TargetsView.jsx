import React from 'react';
import { Target, TrendingUp, Award } from 'lucide-react';

export default function TargetsView({ employee }) {
  const getTargetData = () => {
    switch (employee.department) {
      case 'Sales':
        return {
          title: 'Sales Targets',
          icon: TrendingUp,
          color: 'emerald',
          targets: [
            { label: 'Daily Sales Target', current: 3200, target: 5000, unit: '₹' },
            { label: 'Monthly Target', current: 84000, target: 120000, unit: '₹' },
            { label: 'Yearly Target', current: 1120000, target: 1500000, unit: '₹' },
          ]
        };
      case 'Web Developer':
        return {
          title: 'Development Sprint Goals',
          icon: Target,
          color: 'blue',
          targets: [
            { label: 'Sprint Tasks', current: 8, target: 12, unit: '' },
            { label: 'Bugs Fixed', current: 14, target: 16, unit: '' },
            { label: 'Features Delivered', current: 5, target: 8, unit: '' },
          ]
        };
      case 'Finance':
        return {
          title: 'Financial KPIs',
          icon: Award,
          color: 'purple',
          targets: [
            { label: 'Invoices Processed', current: 42, target: 50, unit: '' },
            { label: 'Payment Verifications', current: 18, target: 20, unit: '' },
            { label: 'Monthly Closing', current: 75, target: 100, unit: '%' },
          ]
        };
      case 'HR':
        return {
          title: 'HR Recruitment Goals',
          icon: Target,
          color: 'pink',
          targets: [
            { label: 'Interviews Scheduled', current: 14, target: 20, unit: '' },
            { label: 'Hiring Target', current: 6, target: 10, unit: '' },
            { label: 'Onboarding Count', current: 4, target: 6, unit: '' },
          ]
        };
      default:
        return {
          title: 'Performance Targets',
          icon: Target,
          color: 'slate',
          targets: [
            { label: 'Tasks Completed', current: 0, target: 10, unit: '' },
            { label: 'Projects Delivered', current: 0, target: 5, unit: '' },
            { label: 'Efficiency Score', current: 0, target: 100, unit: '%' },
          ]
        };
    }
  };

  const targetData = getTargetData();
  const Icon = targetData.icon;

  const getColorClasses = (color) => {
    switch (color) {
      case 'emerald': return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' };
      case 'blue': return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' };
      case 'purple': return { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' };
      case 'pink': return { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-100' };
      default: return { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-100' };
    }
  };

  const colors = getColorClasses(targetData.color);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className={`p-3 ${colors.bg} ${colors.text} rounded-2xl`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">{targetData.title}</h2>
            <p className="text-xs text-slate-500 mt-1">Track your performance against set goals</p>
          </div>
        </div>
      </div>

      {/* Targets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {targetData.targets.map((target, index) => {
          const percentage = Math.round((target.current / target.target) * 100);
          
          return (
            <div key={index} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{target.label}</h3>
                  <span className={`text-xs font-bold ${percentage >= 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {percentage}%
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-black text-slate-800">
                      {target.unit}{target.current.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400">/ {target.unit}{target.target.toLocaleString()}</span>
                  </div>
                  
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        percentage >= 100 ? 'bg-emerald-500' : percentage >= 70 ? 'bg-blue-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Performance Summary */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Performance Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-4 rounded-xl border ${colors.border} ${colors.bg}`}>
            <p className="text-xs text-slate-600 font-semibold mb-1">Overall Progress</p>
            <p className="text-lg font-black text-slate-800">
              {Math.round(targetData.targets.reduce((sum, t) => sum + (t.current / t.target) * 100, 0) / targetData.targets.length)}%
            </p>
          </div>
          <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50">
            <p className="text-xs text-slate-600 font-semibold mb-1">Status</p>
            <p className="text-lg font-black text-emerald-700">On Track</p>
          </div>
        </div>
      </div>
    </div>
  );
}
