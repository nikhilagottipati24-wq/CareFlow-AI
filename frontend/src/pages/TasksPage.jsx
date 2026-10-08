import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  CheckSquare,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  ExternalLink,
  Send,
  Eye,
  Info,
  ShieldAlert
} from 'lucide-react';
import { getTasks, updateTaskStatus } from '../api';
import SourceModal from '../components/SourceModal';
import ReviewModal from '../components/ReviewModal';
import { useReview } from '../context/ReviewContext';

const CATEGORIES = ['All', 'Medication', 'Appointment', 'Test', 'Referral', 'Care', 'Follow-up'];
const STATUSES = ['All', 'Pending', 'Completed', 'Needs Review'];

export default function TasksPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { fetchReviews, activeReviewCount, reviews, lastUpdated } = useReview();
  const [tasks, setTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedTaskDetails, setSelectedTaskDetails] = useState(null);
  const [selectedSourceItem, setSelectedSourceItem] = useState(null);
  const [selectedReviewForModal, setSelectedReviewForModal] = useState(null);

  // Sync filter state from URL query parameters (e.g. ?status=Pending)
  useEffect(() => {
    const statusQuery = searchParams.get('status');
    if (statusQuery && STATUSES.includes(statusQuery)) {
      setStatusFilter(statusQuery);
    }
    const catQuery = searchParams.get('category');
    if (catQuery && CATEGORIES.includes(catQuery)) {
      setCategoryFilter(catQuery);
    }
  }, [searchParams]);

  const fetchTasks = async () => {
    try {
      const all = await getTasks();
      setAllTasks(all);
      if (statusFilter === 'All' && categoryFilter === 'All') {
        setTasks(all);
      } else {
        const data = await getTasks(statusFilter, categoryFilter);
        setTasks(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [statusFilter, categoryFilter, lastUpdated, activeReviewCount]);

  const handleToggleStatus = async (taskId, currentStatus) => {
    const nextStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
    try {
      await updateTaskStatus(taskId, nextStatus);
      await fetchTasks();
      if (fetchReviews) await fetchReviews();
    } catch (err) {
      console.error(err);
    }
  };

  const getMatchingReview = (task) => {
    return reviews.find(
      (r) =>
        (task.id === 'task-verify-doc' && r.id.toUpperCase().includes('DOC')) ||
        (task.id === 'task-3' && r.id.toUpperCase() === 'REV-001') ||
        (task.id === 'task-5' && r.id.toUpperCase() === 'REV-002') ||
        (task.id === 'task-6' && r.id.toUpperCase() === 'REV-003') ||
        (r.source_reference && task.source_reference && r.source_reference === task.source_reference)
    );
  };

  const tasksForCounts = allTasks.length > 0 ? allTasks : tasks;
  const pendingCount = tasksForCounts.filter((t) => t.status === 'Pending').length;
  const completedCount = tasksForCounts.filter((t) => t.status === 'Completed').length;
  const reviewCount = activeReviewCount !== undefined ? activeReviewCount : tasksForCounts.filter((t) => t.status === 'Needs Review').length;

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Actionable Care Tasks
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Agent 3 generated trackable items based directly on your discharge summary instructions.
          </p>
        </div>

        {/* Interactive Task Counter Filter Badges */}
        <div className="flex items-center gap-2 text-xs font-semibold flex-wrap">
          <button
            onClick={() => setStatusFilter('All')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'All'
                ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
            title="Show all tasks"
          >
            Total: {tasksForCounts.length}
          </button>
          <button
            onClick={() => setStatusFilter('Pending')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'Pending'
                ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                : 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
            }`}
            title="Filter by Pending tasks"
          >
            Pending: {pendingCount}
          </button>
          <button
            onClick={() => setStatusFilter('Completed')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'Completed'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
            }`}
            title="Filter by Completed tasks"
          >
            Completed: {completedCount}
          </button>
          <button
            onClick={() => setStatusFilter('Needs Review')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'Needs Review'
                ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                : 'bg-rose-50 border-rose-200 text-rose-800 hover:bg-rose-100'
            }`}
            title="Filter tasks requiring human review"
          >
            Needs Review: {reviewCount}
          </button>
        </div>
      </div>

      {/* Filter Controls (Section 12) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Status filter pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold text-slate-400 mr-2 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Status:
            </span>
            {STATUSES.map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Category filter pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold text-slate-400 mr-2">Category:</span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  categoryFilter === cat
                    ? 'bg-sky-600 text-white font-semibold'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Task List Cards (Section 12) */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-2">
          <CheckSquare className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">No tasks found</p>
          <p className="text-xs text-slate-400">Try adjusting your filters above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => {
            const isCompleted = task.status === 'Completed';
            const isReview = task.status === 'Needs Review';
            const isHigh = task.priority === 'High';

            return (
              <div
                key={task.id}
                onClick={() => {
                  if (isReview) navigate('/review-center');
                }}
                className={`bg-white rounded-2xl border p-5 flex flex-col justify-between transition-all shadow-xs space-y-4 hover:shadow-sm ${
                  isReview
                    ? 'border-rose-300/80 bg-rose-50/20 cursor-pointer hover:border-rose-400'
                    : isCompleted
                    ? 'border-emerald-200 bg-emerald-50/10'
                    : 'border-slate-200/90 hover:border-sky-300'
                }`}
                title={isReview ? 'Needs clinical review - click to open Human Review Center' : undefined}
              >
                <div className="space-y-3">
                  {/* Category & Status Header */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {task.category}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        isHigh ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {task.priority} Priority
                      </span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : isReview
                          ? 'bg-rose-100 text-rose-800 animate-pulse'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                  </div>

                  {/* Task Title & Description */}
                  <div>
                    <h3 className={`font-bold text-sm tracking-tight ${
                      isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
                    }`}>
                      {task.task_name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-3 leading-relaxed">
                      {task.description}
                    </p>
                  </div>

                  {/* Patient-friendly note if available */}
                  {task.patient_friendly_explanation && (
                    <div className="p-2.5 rounded-lg bg-sky-50/50 border border-sky-100 text-xs text-slate-700">
                      <span className="font-semibold text-sky-800 block text-[10px] uppercase">
                        Patient-Friendly Note:
                      </span>
                      {task.patient_friendly_explanation}
                    </div>
                  )}
                </div>

                {/* Footer Meta & Actions */}
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1.5 font-medium text-slate-700">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{task.due_date || 'Unspecified (Review)'}</span>
                    </div>
                    <button
                      onClick={() => setSelectedSourceItem(task)}
                      className="text-[11px] text-sky-600 hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Source</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    {/* Mark Completed or Review Item Button */}
                    {isReview ? (
                      <div className="flex-1 flex items-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const matchingRev = getMatchingReview(task);
                            if (matchingRev) {
                              setSelectedReviewForModal(matchingRev);
                            } else {
                              navigate('/review-center');
                            }
                          }}
                          className="flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white cursor-pointer shadow-xs"
                          title="Inspect and resolve ambiguity in review modal"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Review & Resolve</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStatus(task.id, 'Needs Review');
                          }}
                          className="p-2 rounded-xl border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 text-slate-500 transition-colors cursor-pointer"
                          title="Mark task completed directly"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleStatus(task.id, task.status);
                        }}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-900 text-white hover:bg-slate-800'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isCompleted ? 'Mark Pending' : 'Mark Completed'}</span>
                      </button>
                    )}

                    {/* View Details */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTaskDetails(task);
                      }}
                      className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Task Details Modal */}
      {selectedTaskDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Task Details</h3>
              <button
                onClick={() => setSelectedTaskDetails(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-semibold uppercase text-[10px] block">Task Name</span>
                <p className="font-bold text-slate-900 text-sm">{selectedTaskDetails.task_name}</p>
              </div>
              <div>
                <span className="text-slate-400 font-semibold uppercase text-[10px] block">Description</span>
                <p className="text-slate-700">{selectedTaskDetails.description}</p>
              </div>
              <div>
                <span className="text-slate-400 font-semibold uppercase text-[10px] block">Plain English Explanation</span>
                <p className="p-2.5 rounded-lg bg-sky-50 text-sky-950 font-medium">
                  {selectedTaskDetails.patient_friendly_explanation || 'Follow discharge instructions.'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <div>
                  <span className="text-slate-400 font-semibold uppercase text-[10px] block">Due Date</span>
                  <p className="font-semibold text-slate-800">{selectedTaskDetails.due_date || 'Unspecified'}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold uppercase text-[10px] block">Status</span>
                  <p className="font-semibold text-slate-800">{selectedTaskDetails.status}</p>
                </div>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedTaskDetails(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Source Modal */}
      {selectedSourceItem && (
        <SourceModal
          item={selectedSourceItem}
          isOpen={!!selectedSourceItem}
          onClose={() => setSelectedSourceItem(null)}
        />
      )}

      {/* Inline Review Resolution Modal */}
      {selectedReviewForModal && (
        <ReviewModal
          review={selectedReviewForModal}
          isOpen={!!selectedReviewForModal}
          onClose={() => setSelectedReviewForModal(null)}
          onReviewUpdated={async () => {
            await fetchTasks();
            if (fetchReviews) await fetchReviews();
          }}
        />
      )}
    </div>
  );
}
