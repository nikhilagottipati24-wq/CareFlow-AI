import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Filter,
  Search,
  ExternalLink,
  RotateCcw,
  Send,
  Calendar,
  Layers,
  ChevronDown
} from 'lucide-react';
import { useCareFlow } from '../context/CareFlowContext';

export const TasksPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { tasks, updateTaskStatus, updateReview, showToast, summary } = useCareFlow();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || 'all');
  const [selectedTask, setSelectedTask] = useState(null);
  const [sendReviewModal, setSendReviewModal] = useState(null);
  const [reviewReason, setReviewReason] = useState('');

  // Sync state with URL params
  useEffect(() => {
    const s = searchParams.get('status');
    const c = searchParams.get('category');
    if (s) setStatusFilter(s);
    if (c) setCategoryFilter(c);
  }, [searchParams]);

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    const newParams = new URLSearchParams(searchParams);
    if (status === 'all') newParams.delete('status');
    else newParams.set('status', status);
    setSearchParams(newParams);
  };

  const handleCategoryFilterChange = (cat) => {
    setCategoryFilter(cat);
    const newParams = new URLSearchParams(searchParams);
    if (cat === 'all') newParams.delete('category');
    else newParams.set('category', cat);
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setStatusFilter('all');
    setCategoryFilter('all');
    setSearchQuery('');
    setSearchParams({});
  };

  const filteredTasks = tasks.filter((t) => {
    const matchStatus =
      statusFilter === 'all' || t.status.toLowerCase() === statusFilter.toLowerCase();
    const matchCategory =
      categoryFilter === 'all' || t.category.toLowerCase() === categoryFilter.toLowerCase();
    const matchQuery =
      !searchQuery ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.source_reference && t.source_reference.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchStatus && matchCategory && matchQuery;
  });

  const handleSendToReviewer = (task) => {
    setSendReviewModal(task);
    setReviewReason(`Discharge instruction requires clinician verification: "${task.title}"`);
  };

  const submitSendToReviewer = () => {
    if (!sendReviewModal) return;
    updateTaskStatus(sendReviewModal.id, 'Needs Review');
    showToast(`Task escalated to Human Review Center`);
    setSendReviewModal(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Care Plan Tasks
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Organized actions across medications, appointments, testing, referrals, and self-care.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700">
            Total: <strong>{summary.total_tasks}</strong>
          </span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-emerald-100 text-emerald-800">
            Completed: <strong>{summary.completed_tasks}</strong>
          </span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-amber-100 text-amber-800">
            Pending: <strong>{summary.pending_tasks}</strong>
          </span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-red-100 text-red-800">
            Needs Review: <strong>{summary.needs_review_tasks}</strong>
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
            {['all', 'Pending', 'Completed', 'Needs Review'].map((st) => (
              <button
                key={st}
                onClick={() => handleStatusFilterChange(st)}
                className={`px-3 py-1.5 rounded-md transition ${
                  statusFilter.toLowerCase() === st.toLowerCase()
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st === 'all' ? 'All Tasks' : st}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative min-w-[240px] flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search tasks, meds, tests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Category Pills & Reset */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-500 font-semibold mr-1">Category:</span>
            {['all', 'Medication', 'Appointment', 'Test', 'Referral', 'Care', 'Follow-up'].map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryFilterChange(cat)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                  categoryFilter.toLowerCase() === cat.toLowerCase()
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'all' ? 'All' : cat}
              </button>
            ))}
          </div>

          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-800 text-xs font-semibold px-2 py-1 rounded"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="p-12 bg-white rounded-xl border border-dashed border-slate-300 text-center">
            <p className="text-sm font-bold text-slate-700">No tasks match your filters</p>
            <p className="text-xs text-slate-500 mt-1">Try resetting the status or category filter.</p>
            <button
              onClick={handleResetFilters}
              className="mt-3 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 bg-white rounded-xl border transition-all shadow-2xs hover:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                task.status === 'Completed'
                  ? 'border-emerald-200 bg-emerald-50/10'
                  : task.status === 'Needs Review'
                  ? 'border-red-200 bg-red-50/15'
                  : 'border-slate-200'
              }`}
            >
              {/* Task Details */}
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                    {task.category}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      task.priority === 'High'
                        ? 'bg-rose-100 text-rose-800'
                        : task.priority === 'Medium'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {task.priority} Priority
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-semibold ${
                      task.status === 'Completed'
                        ? 'text-emerald-600'
                        : task.status === 'Needs Review'
                        ? 'text-red-600'
                        : 'text-amber-600'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {task.status}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900">{task.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{task.description}</p>

                <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    Due: <strong>{task.due_date || 'Unscheduled'}</strong>
                  </span>
                  {task.source_reference && (
                    <span className="text-slate-400 italic">
                      Source: {task.source_reference}
                    </span>
                  )}
                  {task.completed_at && (
                    <span className="text-emerald-700 font-medium">
                      Completed: {new Date(task.completed_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {task.status !== 'Completed' ? (
                  <button
                    onClick={() => updateTaskStatus(task.id, 'Completed')}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Completed</span>
                  </button>
                ) : (
                  <button
                    onClick={() => updateTaskStatus(task.id, 'Pending')}
                    className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition flex items-center gap-1"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Reopen</span>
                  </button>
                )}

                <button
                  onClick={() => setSelectedTask(task)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition"
                >
                  Details
                </button>

                {task.status !== 'Needs Review' && (
                  <button
                    onClick={() => handleSendToReviewer(task)}
                    className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition flex items-center gap-1"
                    title="Send for clinician clarification"
                  >
                    <Send className="w-3 h-3" />
                    <span>Send to Reviewer</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Task Details Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                {selectedTask.category} Details
              </span>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">{selectedTask.title}</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{selectedTask.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-500 block">Due Date:</span>
                <span className="font-semibold text-slate-800">{selectedTask.due_date || 'Unscheduled'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Priority:</span>
                <span className="font-semibold text-slate-800">{selectedTask.priority}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Status:</span>
                <span className="font-semibold text-slate-800">{selectedTask.status}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Created At:</span>
                <span className="font-mono text-[11px] text-slate-700">
                  {new Date(selectedTask.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 block">Source Reference:</span>
                <span className="font-mono text-[11px] text-slate-700">{selectedTask.source_reference}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedTask(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send to Reviewer Modal */}
      {sendReviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              Escalate Task for Human Review
            </h3>
            <p className="text-xs text-slate-600">
              This will update the task status to <strong>Needs Review</strong> and queue it in the Review Center.
            </p>

            <textarea
              rows={3}
              value={reviewReason}
              onChange={(e) => setReviewReason(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Reason for review..."
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSendReviewModal(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={submitSendToReviewer}
                className="px-4 py-1.5 text-xs font-bold bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-2xs"
              >
                Confirm Escalation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
