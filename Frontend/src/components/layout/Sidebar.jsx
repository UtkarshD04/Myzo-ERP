import React from 'react';

export default function Sidebar({
  modules,
  activeModuleId,
  onSelectModule,
}) {
  return (
    <aside className="h-screen w-20 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col relative z-50 shrink-0">
      {/* Brand logo */}
      <div className="h-16 flex items-center justify-center border-b border-slate-800/80 px-2.5 shrink-0">
        <div className="w-full bg-white rounded-lg px-1.5 py-1.5 shadow-sm">
          <img src="/logo.png" alt="Myzo" className="w-full h-auto object-contain" />
        </div>
      </div>

      {/* Module rail */}
      <nav className="flex-1 py-4 px-2 space-y-1.5 overflow-y-auto">
        {modules.map((module) => {
          const Icon = module.icon;
          const isActive = activeModuleId === module.id;

          return (
            <button
              key={module.id}
              onClick={() => onSelectModule(module)}
              className={`w-full flex flex-col items-center gap-1 rounded-xl py-2.5 px-1 transition-all duration-150 cursor-pointer group ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/10'
                  : 'hover:bg-slate-800/60 text-slate-400 hover:text-slate-100'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
              <span className="text-[9px] font-bold tracking-wide text-center leading-tight">{module.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
