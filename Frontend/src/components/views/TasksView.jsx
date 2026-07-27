import React, { useState } from 'react';
import { Plus, Clock, MessageSquare, PlusCircle, CheckSquare, Edit3, ArrowLeft } from 'lucide-react';
import { api } from '../../api';

export default function TasksView({ employee, employees = [], tasks = [], setTasks }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(null);
  
  // Form states for adding task
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState('Medium');
  const [newDueDate, setNewDueDate] = useState('');
  const [newType, setNewType] = useState('Today');
  const [newAssignedTo, setNewAssignedTo] = useState('');

  // Comment state for detail modal
  const [newComment, setNewComment] = useState('');

  const isSenior = ['Manager', 'Admin', 'HR'].includes(employee.role);

  // Filter tasks based on assignment and role
  const visibleTasks = tasks.filter(t => 
    t.assignedTo === employee.id || 
    t.assignedBy === employee.id ||
    isSenior
  );

  const columns = [
    { id: 'To Do', title: 'To Do', color: 'border-t-slate-400 text-slate-700 bg-slate-50' },
    { id: 'In Progress', title: 'In Progress', color: 'border-t-blue-500 text-blue-700 bg-blue-50/10' },
    { id: 'In Review', title: 'In Review', color: 'border-t-amber-500 text-amber-700 bg-amber-50/10' },
    { id: 'Completed', title: 'Completed', color: 'border-t-emerald-500 text-emerald-700 bg-emerald-50/10' }
  ];

  const handleUpdateStatus = async (taskId, nextStatus) => {
    let nextProgress = 0;
    if (nextStatus === 'Completed') nextProgress = 100;
    else if (nextStatus === 'In Review') nextProgress = 90;
    else if (nextStatus === 'In Progress') nextProgress = 30;

    try {
      const updatedState = await api.modifyTask(taskId, { status: nextStatus, progress: nextProgress });
      setTasks(updatedState.tasks);
      if (showDetailModal && showDetailModal.id === taskId) {
        setShowDetailModal(prev => ({ ...prev, status: nextStatus, progress: nextProgress }));
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateProgress = async (taskId, pct) => {
    try {
      const updatedState = await api.modifyTask(taskId, { progress: pct });
      setTasks(updatedState.tasks);
      if (showDetailModal && showDetailModal.id === taskId) {
        setShowDetailModal(prev => ({ ...prev, progress: pct }));
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !showDetailModal) return;

    const commentObj = {
      author: employee.name,
      text: newComment.trim(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };

    const updatedComments = [...(showDetailModal.comments || []), commentObj];

    try {
      const updatedState = await api.modifyTask(showDetailModal.id, { comments: updatedComments });
      setTasks(updatedState.tasks);
      setShowDetailModal(prev => ({ ...prev, comments: updatedComments }));
      setNewComment('');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    const payload = {
      title: newTitle,
      description: newDesc,
      priority: newPriority,
      dueDate: newDueDate || new Date().toISOString().split('T')[0],
      type: newType,
      assignedTo: newAssignedTo || employee.id,
      assignedBy: employee.id
    };

    try {
      const updatedState = await api.addTask(payload);
      setTasks(updatedState.tasks);
      setShowAddModal(false);
      setNewTitle('');
      setNewDesc('');
      setNewDueDate('');
      setNewAssignedTo('');
    } catch (err) {
      alert(err.message);
    }
  };

  const getPriorityBadge = (p) => {
    if (p === 'High') return 'bg-red-50 text-red-600 border-red-100';
    if (p === 'Medium') return 'bg-amber-50 text-amber-700 border-amber-100';
    return 'bg-slate-50 text-slate-500 border-slate-100';
  };

  if (showAddModal) {
    return (
      <div className="p-4 md:p-6 space-y-6 max-w-2xl mx-auto font-sans text-slate-800 animate-in fade-in duration-200">
        <button
          onClick={() => setShowAddModal(false)}
          className="flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-blue-600 cursor-pointer transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Task Board</span>
        </button>

        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2.5">
            <CheckSquare className="w-5 h-5 text-blue-600" />
            <span>Create Workspace Task</span>
          </h2>
        </div>

        <form onSubmit={handleAddTask} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Task Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Audit Sales Dashboard UI"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Description</label>
            <textarea
              required
              rows="3"
              placeholder="Details of the deliverable..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Priority</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Due Date</label>
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Cycle Type</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              >
                <option value="Today">Today</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Assignee</label>
              <select
                value={newAssignedTo}
                onChange={(e) => setNewAssignedTo(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              >
                <option value="">Self</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name} ({emp.designation})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-3.5 pt-2">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs cursor-pointer transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-500/10 cursor-pointer transition-all"
            >
              Publish Task
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto font-sans text-slate-800 animate-in fade-in duration-200">
      {/* Header card */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Sprint Task Board</h2>
          <p className="text-xs text-slate-500 mt-1">Manage, update, and comment on project deliverables.</p>
        </div>
        {isSenior && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center space-x-2 shadow-md shadow-blue-500/10 cursor-pointer transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        )}
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {columns.map(col => {
          const colTasks = visibleTasks.filter(t => t.status === col.id);

          return (
            <div key={col.id} className="space-y-4">
              {/* Column Header */}
              <div className={`p-3 bg-white border border-slate-100 rounded-xl flex items-center justify-between shadow-sm border-t-4 ${col.color}`}>
                <span className="font-extrabold text-xs">{col.title}</span>
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-slate-100 rounded-md text-slate-600">
                  {colTasks.length}
                </span>
              </div>

              {/* Tasks in Column */}
              <div className="space-y-3 min-h-[400px]">
                {colTasks.map(t => {
                  const assignedUser = employees.find(e => e.id === t.assignedTo);

                  return (
                    <div
                      key={t.id}
                      onClick={() => setShowDetailModal(t)}
                      className="bg-white border border-slate-100 hover:border-slate-200 rounded-2xl p-4.5 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[9px] font-bold text-blue-500 bg-blue-50/50 px-1.5 py-0.5 rounded border border-blue-100">
                          {t.id}
                        </span>
                        <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded border ${getPriorityBadge(t.priority)}`}>
                          {t.priority}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-slate-800 mt-2.5 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2">
                        {t.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 font-medium">{t.description}</p>

                      {/* Info footer */}
                      <div className="flex items-center justify-between border-t border-slate-50 pt-3.5 mt-3.5">
                        <div className="flex items-center text-[9px] text-slate-400 font-semibold space-x-2">
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-0.5 shrink-0" />
                            {t.dueDate}
                          </span>
                          <span className="flex items-center">
                            <MessageSquare className="w-3 h-3 mr-0.5 shrink-0" />
                            {t.comments?.length || 0}
                          </span>
                        </div>
                        {assignedUser && (
                          <img
                            src={assignedUser.photo}
                            alt={assignedUser.name}
                            className="w-5.5 h-5.5 rounded-full object-cover border border-slate-100"
                            title={`Assigned to: ${assignedUser.name}`}
                            referrerPolicy="no-referrer"
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Details & Update Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-100 rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4.5 border-b border-slate-50 pb-3">
              <span className="font-mono text-xs font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                {showDetailModal.id}
              </span>
              <button
                onClick={() => setShowDetailModal(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-slate-800 text-base">{showDetailModal.title}</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{showDetailModal.description}</p>
              </div>

              {/* Status and Progress adjustment */}
              <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-50 py-4.5">
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Sprint Status</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {['To Do', 'In Progress', 'In Review', 'Completed'].map(st => (
                      <button
                        key={st}
                        onClick={() => handleUpdateStatus(showDetailModal.id, st)}
                        className={`py-1.5 text-[10px] font-bold rounded-lg border transition-all ${
                          showDetailModal.status === st
                            ? 'bg-blue-50 border-blue-200 text-blue-600'
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Progress Ratio ({showDetailModal.progress}%)</label>
                  <div className="grid grid-cols-5 gap-1">
                    {[0, 25, 50, 75, 100].map(val => (
                      <button
                        key={val}
                        onClick={() => handleUpdateProgress(showDetailModal.id, val)}
                        className={`py-1.5 text-[9px] font-mono font-bold rounded-lg border transition-all ${
                          showDetailModal.progress === val
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        {val}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Comments stream */}
              <div className="space-y-3">
                <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Discussion stream</label>
                <div className="max-h-40 overflow-y-auto space-y-2.5 divide-y divide-slate-50/50 pr-1.5">
                  {(showDetailModal.comments || []).length === 0 ? (
                    <p className="text-[10px] text-slate-400 italic">No notes shared inside this feed yet.</p>
                  ) : (
                    (showDetailModal.comments || []).map((comm, index) => (
                      <div key={index} className={`text-[11px] ${index > 0 ? 'pt-2.5' : ''}`}>
                        <div className="flex items-center justify-between text-slate-500 font-semibold mb-0.5">
                          <span>{comm.author}</span>
                          <span className="font-mono text-[9px] font-medium">{comm.date}</span>
                        </div>
                        <p className="text-slate-600 font-medium">{comm.text}</p>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleAddComment} className="flex items-center space-x-2.5 pt-2">
                  <input
                    type="text"
                    placeholder="Enter message notes..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/10 cursor-pointer transition-all"
                  >
                    Post
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
