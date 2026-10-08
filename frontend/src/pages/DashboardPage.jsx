import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  ListTodo,
  Calendar,
  ArrowRight,
  TestTube,
  Heart,
  Stethoscope,
  Pill,
  ExternalLink,
  ChevronRight,
  Sparkles,
  UploadCloud,
  Edit2
} from 'lucide-react';
import { getDashboard, updateTaskStatus } from '../api';
import SourceModal from '../components/SourceModal';
import { useAuth } from '../context/AuthContext';
import { useReview } from '../context/ReviewContext';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { patient: authPatient, openNameModal } = useAuth();
  const { activeReviewCount, reviews, fetchReviews, lastUpdated } = useReview();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSourceItem, setSelectedSourceItem] = useState(null);

  const fetchDashboard = async () => {
    try {
      const res = await getDashboard();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [activeReviewCount, lastUpdated]);

  const handleToggleTask = async (taskId, currentStatus) => {
    const nextStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
    // Optimistic update of summary_stats and next_actions
    setData((prev) => {
      if (!prev) return prev;
      const isNowCompleted = nextStatus === 'Completed';
      const curPending = prev.summary_stats?.pending ?? 5;
      const curCompleted = prev.summary_stats?.completed ?? 2;
      return {
        ...prev,
        summary_stats: {
          ...prev.summary_stats,
          pending: isNowCompleted ? Math.max(0, curPending - 1) : curPending + 1,
          completed: isNowCompleted ? curCompleted + 1 : Math.max(0, curCompleted - 1),
        },
        next_actions: (prev.next_actions || []).map((t) =>
          t.id === taskId ? { ...t, status: nextStatus } : t
        ),
      };
    });

    try {
      await updateTaskStatus(taskId, nextStatus);
      await fetchDashboard();
      if (fetchReviews) await fetchReviews();
    } catch (err) {
      console.error(err);
      fetchDashboard();
    }
  };

  if (loading || !data) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500 font-medium">
            Loading your post-discharge care plan...
          </p>
        </div>
      </div>
    );
  }

  const { patient, summary_stats, next_actions, timeline_preview, attention_required } = data;
  const activePatientName = authPatient?.name || patient?.name || 'Alex Johnson';
  const firstName = activePatientName.trim().split(' ')[0] || 'Patient';

  // Synchronize review items with tasks dynamically
  const revMap = reviews.reduce((acc, r) => {
    acc[r.id.toUpperCase()] = r.status;
    return acc;
  }, {});

  const syncTaskStatus = (task) => {
    for (const r of reviews) {
      const rId = r.id.toUpperCase();
      const rStatus = revMap[rId];
      if (!rStatus) continue;

      let isMatch = false;
      if (task.id === 'task-verify-doc' && rId.includes('DOC')) isMatch = true;
      else if (task.id === 'task-3' && rId === 'REV-001') isMatch = true;
      else if (task.id === 'task-5' && rId === 'REV-002') isMatch = true;
      else if (task.id === 'task-6' && rId === 'REV-003') isMatch = true;
      else if (task.source_reference && r.source_reference && task.source_reference === r.source_reference) isMatch = true;

      if (isMatch) {
        if (['Approved', 'Resolved'].includes(rStatus)) {
          return task.status === 'Needs Review' ? 'Completed' : task.status;
        }
        if (rStatus === 'Needs Clarification') {
          return task.status === 'Needs Review' ? 'Pending' : task.status;
        }
        return 'Needs Review';
      }
    }
    return task.status;
  };

  const syncedNextActions = (next_actions || []).map((t) => ({
    ...t,
    status: syncTaskStatus(t)
  }));

  const activeReviews = reviews.filter((r) => r.status === 'Needs Review');
  const displayNeedsReview = activeReviewCount !== undefined ? activeReviewCount : (summary_stats?.needs_review ?? 3);
  const displayCompleted = summary_stats?.completed ?? 2;
  const displayPending = summary_stats?.pending ?? 5;
  const displayTotal = summary_stats?.total_tasks || 10;
  const primaryReviewItem = activeReviews[0] || attention_required?.primary_item;

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Header (Section 8) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-100">
              Discharged {authPatient?.discharge_date || patient.discharge_date}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">
              {authPatient?.hospital || patient.hospital}
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Good morning, {firstName}</span>
            <button
              onClick={openNameModal}
              className="p-1 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
              title="Click to edit patient name"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Active care plan for{' '}
            <button
              onClick={openNameModal}
              className="font-semibold text-slate-700 hover:text-sky-600 underline decoration-slate-300 hover:decoration-sky-500 transition-colors cursor-pointer"
              title="Click to edit patient name"
            >
              {activePatientName}
            </button>{' '}
            monitored by AI coordination agents.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/upload')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <UploadCloud className="w-4 h-4 text-slate-500" />
            <span>Upload New Document</span>
          </button>
          <button
            onClick={() => navigate('/tasks')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 text-white hover:bg-sky-700 text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <span>View All Tasks</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Top Summary Cards (Section 8) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tasks */}
        <div
          onClick={() => navigate('/tasks')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-400 transition-all cursor-pointer group"
          title="Click to view all care tasks"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider group-hover:text-slate-800 transition-colors">
              Total Tasks
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
              <ListTodo className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {displayTotal}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Action items across care plan
          </p>
        </div>

        {/* Pending */}
        <div
          onClick={() => navigate('/tasks?status=Pending')}
          className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-xs hover:border-amber-400 transition-all cursor-pointer group"
          title="Click to view pending care tasks"
        >
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider group-hover:text-amber-800 transition-colors">
              Pending
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-700 tracking-tight">
            {displayPending}
          </div>
          <p className="text-[11px] text-amber-600/80 mt-1">
            Scheduled follow-ups & labs
          </p>
        </div>

        {/* Completed */}
        <div
          onClick={() => navigate('/tasks?status=Completed')}
          className="bg-white p-5 rounded-2xl border border-emerald-200/80 shadow-xs hover:border-emerald-400 transition-all cursor-pointer group"
          title="Click to view completed checklist tasks"
        >
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider group-hover:text-emerald-800 transition-colors">
              Completed
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-700 tracking-tight">
            {displayCompleted}
          </div>
          <p className="text-[11px] text-emerald-600/80 mt-1">
            Verified checklist tasks
          </p>
        </div>

        {/* Needs Review */}
        <div
          onClick={() => navigate('/review-center')}
          className="bg-white p-5 rounded-2xl border border-rose-200/80 shadow-xs hover:border-rose-400 transition-all cursor-pointer group"
          title="Click to open Human Review Center"
        >
          <div className="flex items-center justify-between text-rose-600 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider group-hover:text-rose-700">
              Needs Review
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 group-hover:bg-rose-100 flex items-center justify-center transition-colors">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-rose-700 tracking-tight">
            {displayNeedsReview}
          </div>
          <p className="text-[11px] text-rose-600/80 mt-1">
            Unclear / ambiguous items
          </p>
        </div>
      </div>

      {/* Attention Required Banner (Section 8) */}
      {displayNeedsReview > 0 && (
        <div className="bg-gradient-to-r from-rose-50 via-rose-50/70 to-amber-50/60 border border-rose-200 p-5 rounded-2xl shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-rose-900">
                  {displayNeedsReview} {displayNeedsReview === 1 ? 'item requires' : 'items require'} human review
                </span>
                <span className="text-[10px] font-bold uppercase bg-rose-200/70 text-rose-800 px-2 py-0.5 rounded-full">
                  High Priority
                </span>
              </div>
              <p className="text-xs text-rose-800 mt-1 font-medium max-w-2xl">
                "{primaryReviewItem?.issue || 'Medication duration unspecified'}"
              </p>
              <p className="text-[11px] text-rose-600 mt-0.5">
                {primaryReviewItem?.reason || 'System paused automation on this item until verified by clinical reviewer.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate(`/review-center?id=${primaryReviewItem?.id || 'REV-001'}`)}
            className="px-4 py-2.5 rounded-xl bg-rose-600 text-white hover:bg-rose-700 text-xs font-bold transition-all shadow-xs shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <span>Review Now</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Grid: Next Actions & Upcoming Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Next Actions (2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Next Actions
              </h2>
              <p className="text-xs text-slate-500">
                Immediate upcoming requirements extracted from your discharge record.
              </p>
            </div>
            <button
              onClick={() => navigate('/tasks')}
              className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
            >
              <span>All Tasks</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {syncedNextActions.map((task) => {
              const isTest = task.category === 'Test';
              const isAppt = task.category === 'Appointment';
              const isMed = task.category === 'Medication';
              const isNeedsReview = task.status === 'Needs Review';
              const isCompleted = task.status === 'Completed';

              return (
                <div
                  key={task.id}
                  onClick={() => {
                    if (isNeedsReview) navigate('/review-center');
                  }}
                  className={`bg-white p-5 rounded-2xl border transition-all shadow-xs flex flex-col justify-between space-y-4 group ${
                    isNeedsReview
                      ? 'border-rose-200/90 hover:border-rose-300 hover:shadow-xs cursor-pointer bg-rose-50/20'
                      : 'border-slate-200/80 hover:border-sky-300'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className={`text-[11px] font-bold uppercase px-2.5 py-1 rounded-full ${
                        isTest
                          ? 'bg-purple-50 text-purple-700 border border-purple-100'
                          : isAppt
                          ? 'bg-sky-50 text-sky-700 border border-sky-100'
                          : isMed
                          ? 'bg-teal-50 text-teal-700 border border-teal-100'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {task.category}
                      </span>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                        isCompleted
                          ? 'bg-emerald-50 text-emerald-700'
                          : isNeedsReview
                          ? 'bg-rose-50 text-rose-700 border border-rose-200 font-bold'
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {task.status}
                      </span>
                    </div>

                    <div>
                      <h3 className={`font-bold text-sm transition-colors ${
                        isNeedsReview ? 'text-slate-900 group-hover:text-rose-700' : 'text-slate-900 group-hover:text-sky-700'
                      }`}>
                        {task.task_name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {task.patient_friendly_explanation || task.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-1.5 font-medium text-slate-700">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Due: {task.due_date || 'Schedule required'}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSourceItem(task);
                        }}
                        className="text-[11px] text-sky-600 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Source</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleTask(task.id, task.status);
                        }}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                          isCompleted
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isCompleted ? 'Completed' : 'Mark Completed'}</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isNeedsReview) {
                            const matchingRev = reviews.find(
                              (r) =>
                                (task.id === 'task-verify-doc' && r.id.toUpperCase().includes('DOC')) ||
                                (task.id === 'task-3' && r.id.toUpperCase() === 'REV-001') ||
                                (task.id === 'task-5' && r.id.toUpperCase() === 'REV-002') ||
                                (task.id === 'task-6' && r.id.toUpperCase() === 'REV-003') ||
                                (r.source_reference && task.source_reference && r.source_reference === task.source_reference)
                            );
                            if (matchingRev) {
                              navigate(`/review-center?id=${matchingRev.id}`);
                            } else {
                              navigate('/review-center');
                            }
                          } else if (isAppt) {
                            navigate('/timeline');
                          } else {
                            navigate('/tasks');
                          }
                        }}
                        className={`py-2 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          isNeedsReview
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold'
                            : 'bg-sky-50 text-sky-700 hover:bg-sky-100'
                        }`}
                      >
                        {isNeedsReview ? 'Review Now' : isAppt ? 'View Appointment' : 'View Task'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Timeline (1 Column) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Upcoming Timeline
              </h2>
              <p className="text-xs text-slate-500">
                Chronological care roadmap
              </p>
            </div>
            <button
              onClick={() => navigate('/timeline')}
              className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
            >
              <span>Full View</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {timeline_preview.map((item, idx) => (
                <div key={item.id || idx} className="relative group">
                  <div className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-white shadow-xs ${
                    item.status === 'Completed'
                      ? 'bg-emerald-500'
                      : item.status === 'Needs Review'
                      ? 'bg-rose-500'
                      : 'bg-sky-500'
                  }`} />
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      {item.date}
                    </div>
                    <div className="text-sm font-bold text-slate-900 mt-0.5 group-hover:text-sky-700 transition-colors">
                      {item.title}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                      {item.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate('/timeline')}
              className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors flex items-center justify-center gap-1.5"
            >
              <Calendar className="w-4 h-4 text-slate-500" />
              <span>Explore Complete Timeline</span>
            </button>
          </div>
        </div>
      </div>

      {/* Source Verification Modal */}
      {selectedSourceItem && (
        <SourceModal
          item={selectedSourceItem}
          isOpen={!!selectedSourceItem}
          onClose={() => setSelectedSourceItem(null)}
        />
      )}
    </div>
  );
}
