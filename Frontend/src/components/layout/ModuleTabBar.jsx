import React from 'react';

export default function ModuleTabBar({ tabs, activeTab, onSelect }) {
  return (
    <div className="bg-white border-b border-slate-200 px-4 md:px-6 shrink-0">
      <div className="flex items-center gap-6 overflow-x-auto text-[13px] font-semibold">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelect(tab.id)}
              className={`py-3 border-b-2 -mb-px whitespace-nowrap cursor-pointer transition-colors ${
                isActive
                  ? 'text-blue-600 border-blue-600'
                  : 'text-slate-500 border-transparent hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
