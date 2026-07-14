import React, { useState } from 'react';
import { CheckSquare, Plus, Clock, AlertCircle, MessageSquare } from 'lucide-react';

export default function TasksView({ employee, employees, tasks, setTasks }) {
  const [filter, setFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const myTasks = tasks.filter(t => 
    t.assignedTo === employee.id || 
    (employee.role === 'Manager' || employee.role === 'Admin')
  );

  const filteredTasks = filter === 'all' 
    ? myTasks 
    : myTasks.filter(t => t.type === filter || t.status === filter);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-700';
      case 'Medium': return 'bg-amber-100 text-amber-700';
      case 'Low': return 'bg-blue-100 text-blue-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-50 text-emerald-700';
      case 'In Progress': return 'bg-blue-50 text-blue-700';
      case 'In Review': return 'bg-amber-50 text-amber-700';
      case 'To Do': return 'bg-slate-50 text-slate-700';
      default: return 'bg-slate-50 text-slate-700';
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">My Tasks</h2>
            <p className="text-xs text-slate-500 mt-1">Manage and track your assigned tasks</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-all flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              filter === 'all' 
                ? 'bg-[#2563EB] text-white' 
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Tasks
          </button>
          <button 
            onClick={() => setFilter('Today')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              filter === 'Today' 
                ? 'bg-[#2563EB] text-white' 
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Today
          </button>
          <button 
            onClick={() => setFilter('Weekly')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              filter === 'Weekly' 
                ? 'bg-[#2563EB] text-white' 
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Weekly
          </button>
          <button 
            onClick={() => setFilter('Monthly')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              filter === 'Monthly' 
                ? 'bg-[#2563EB] text-white' 
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Monthly
          </button>
          <button 
            onClick={() => setFilter('Completed')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              filter === 'Completed' 
                ? 'bg-[#2563EB] text-white' 
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.map((task) => (
          <div key={task.id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-mono text-[10px] font-bold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded">
                    {task.id}
                  </span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase px-2 py-0.5 rounded-md bg-slate-50">
                    {task.type}
                  </span>
                </div>
                
                <h4 className="font-bold text-sm text-slate-800 mb-1">{task.title}</h4>
                <p className="text-xs text-slate-500 mb-3">{task.description}</p>
                
                <div className="flex items-center space-x-4 text-[10px] text-slate-400">
                  <span className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    Due: {task.dueDate}
                  </span>
                  <span className="flex items-center">
                    <MessageSquare className="w-3 h-3 mr-1" />
                    {task.comments.length} comments
                  </span>
                  <span>Progress: {task.progress}%</span>
                </div>
              </div>

              <div className="ml-4 w-24">
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div 
                    className="bg-[#2563EB] h-2 rounded-full transition-all" 
                    style={{ width: `${task.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
