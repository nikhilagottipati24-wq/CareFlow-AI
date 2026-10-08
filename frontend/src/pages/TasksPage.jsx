import React, { useState } from 'react';
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Filter,
  Search,
  ExternalLink,
  ChevronRight,
  Send,
} from 'lucide-react';
import { useCareFlow } from '../context/CareFlowContext';

export const TasksPage = () => {
  const { tasks, updateTaskStatus, openTaskModal, openSourceEvidence, openReviewModal } = useCareFlow();

  const [statusFilter, setStatusFilter] = useState('All'); // All | Pending | Completed | Needs Review
  const [categoryFilter, setCategoryFilter] = useState('All'); // All | Medication | Appointment | Test | Referral | Care | Follow-up
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', 'Medication', 'Appointment', 'Test', 'Referral', 'Care'];

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesStatus =
      statusFilter === 'All' || task.status.toLowerCase() === statusFilter.toLowerCase();

    const matchesCategory =
      categoryFilter === 'All' ||
      (task.task_type && task.task_type.toLowerCase() === categoryFilter.toLowerCase());

    const matchesSearch =
      task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesCategory && matchesSearch;
  });

  const handleSendToReviewer = (task) => {
    openReviewModal({
      id: `rev-${task.id}`,
      issue: `Clinical review requested for ${task.name}`,
      priority: task.priority || 'High',
      reason: 'Flagged from Tasks page for physician/coordinator clarification.',
      original_text: task.description,
      ai_interpretation: task.patient_friendly_explanation,
      source_reference: task.source_reference,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-healthcare-700 bg-healthcare-50 px-2.5 py-1 rounded-md border border-healthcare-100">
            Care Plan Execution
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Care Tasks
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Organized, trackable recovery milestones extracted from your discharge instructions
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-healthcare-500"
          />
        </div>
      </div>

      {/* Filters matching Section 12 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {['All', 'Pending', 'Completed', 'Needs Review'].map((status) => {
            const count =
              status === 'All'
                ? tasks.length
                : tasks.filter((t) => t.status.toLowerCase() === status.toLowerCase()).length;

            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  statusFilter === status
                    ? 'bg-healthcare-600 text-white shadow-xs'
                    : 'bg-slate-100/70 hover:bg-slate-200/70 text-slate-600'
                }`}
              >
                <span>{status}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    statusFilter === status
                      ? 'bg-healthcare-700 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                categoryFilter === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80">
          <CheckSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800">No tasks match your criteria</h3>
          <p className="text-xs text-slate-400 mt-1">Try switching filters or clearing your search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTasks.map((task) => {
            const isCompleted = task.status === 'Completed';
            const isNeedsReview = task.status === 'Needs Review';

            return (
              <div
                key={task.id}
                className={`p-5 bg-white rounded-2xl border transition-all shadow-2xs hover:shadow-xs flex flex-col justify-between ${
                  isNeedsReview
                    ? 'border-rose-200 bg-rose-50/20'
                    : isCompleted
                    ? 'border-emerald-100 bg-emerald-50/10'
                    : 'border-slate-200/80'
                }`}
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {task.task_type || 'Care'}
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase text-slate-400">
                        {task.priority || 'Medium'} Priority
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-800'
                            : isNeedsReview
                            ? 'bg-rose-100 text-rose-800 animate-pulse'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {task.status}
                      </span>
                    </div>
                  </div>

                  {/* Task Name */}
                  <h3
                    className={`text-sm font-bold text-slate-900 ${
                      isCompleted ? 'line-through text-slate-400' : ''
                    }`}
                  >
                    {task.name}
                  </h3>

                  {/* Patient-friendly / Description */}
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed line-clamp-2">
                    {task.patient_friendly_explanation || task.description}
                  </p>

                  {/* Due Date */}
                  <div className="flex items-center gap-2 mt-3 text-xs text-slate-500 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-healthcare-600" />
                    <span>
                      Target: <strong>{task.due_date_formatted || 'October 20, 2026'}</strong>
                    </span>
                  </div>

                  {/* Source Reference */}
                  {task.source_reference && (
                    <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
                      <span className="truncate max-w-[220px]">
                        Source: {task.source_reference.section || 'Discharge Record'}
                      </span>
                      <button
                        onClick={() => openSourceEvidence(task.source_reference)}
                        className="text-healthcare-600 hover:text-healthcare-700 font-bold flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Source</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Card Action Buttons matching Section 12 */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <button
                    onClick={() => openTaskModal(task)}
                    className="text-xs font-bold text-slate-700 hover:text-healthcare-700"
                  >
                    View Details
                  </button>

                  <div className="flex items-center gap-2">
                    {isNeedsReview && (
                      <button
                        onClick={() => handleSendToReviewer(task)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-colors"
                      >
                        <Send className="w-3 h-3" />
                        <span>Send to Reviewer</span>
                      </button>
                    )}

                    <button
                      onClick={() =>
                        updateTaskStatus(task.id, isCompleted ? 'Pending' : 'Completed')
                      }
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs ${
                        isCompleted
                          ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isCompleted ? 'Mark Pending' : 'Mark Completed'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
