import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  AlertCircle,
  Calendar,
  Clock,
  CheckCircle,
  FileCheck,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  HeartPulse,
  User,
  Edit2,
  Check,
  X,
  Hospital
} from 'lucide-react';
import { useCareFlow } from '../context/CareFlowContext';
import { DashboardSummaryCards } from '../components/common/SummaryCards';
import { TaskStatusDonutChart } from '../components/charts/TaskStatusDonutChart';
import { UpcomingScheduleBarChart } from '../components/charts/UpcomingScheduleBarChart';
import { CareFlowAPI } from '../services/api';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { summary, tasks, reviews, updateTaskStatus, patient, updatePatient } = useCareFlow();

  const [statusDistribution, setStatusDistribution] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  // Patient profile inline edit state
  const [isEditingPatient, setIsEditingPatient] = useState(false);
  const [editName, setEditName] = useState(patient?.name || '');
  const [editAge, setEditAge] = useState(patient?.age || '');

  useEffect(() => {
    if (patient) {
      setEditName(patient.name || '');
      setEditAge(patient.age || '');
    }
  }, [patient]);

  const handleSavePatientInline = (e) => {
    e.preventDefault();
    if (!editName.trim()) return;
    const parsedAge = parseInt(editAge, 10);
    updatePatient({
      name: editName.trim(),
      age: isNaN(parsedAge) ? patient.age : parsedAge
    });
    setIsEditingPatient(false);
  };

  // Derive upcoming follow-ups directly from current tasks to guarantee 100% instant reliability
  const computedUpcomingData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const pad = (n) => String(n).padStart(2, '0');
    const formatYMD = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    let unscheduled = 0;
    const dateMap = {};

    for (let i = 0; i <= 14; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      const isoStr = formatYMD(d);
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const disp = `${monthNames[d.getMonth()]} ${pad(d.getDate())}`;
      dateMap[isoStr] = {
        date: isoStr,
        display_date: disp,
        count: 0,
        items: []
      };
    }

    (tasks || []).forEach(t => {
      if (!t.due_date) {
        unscheduled++;
      } else {
        const dStr = t.due_date.slice(0, 10);
        if (dateMap[dStr]) {
          dateMap[dStr].count += 1;
          dateMap[dStr].items.push({
            id: t.id,
            title: t.title,
            category: t.category,
            priority: t.priority,
            status: t.status
          });
        }
      }
    });

    return {
      schedule: Object.values(dateMap),
      unscheduled_count: unscheduled
    };
  }, [tasks]);

  useEffect(() => {
    // Fetch analytics previews
    CareFlowAPI.getTaskStatusDistribution().then((res) => {
      if (res?.data) setStatusDistribution(res.data);
    }).catch(console.warn);
  }, [summary, tasks]);


  // Derived next actions: sorted by due date
  const upcomingActions = [...tasks]
    .filter((t) => t.status !== 'Completed' && t.due_date)
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 5);

  const completionPct = summary.completion_rate || 0;
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (completionPct / 100) * circumference;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Your Post-Discharge Care Plan
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Monitor follow-ups, organize tasks, and track care-plan progress.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/discharge')}
            className="flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-2xs transition"
          >
            <FileCheck className="w-4 h-4" />
            <span>Upload Discharge Note</span>
          </button>
        </div>
      </div>

      {/* Patient Profile & Quick Name/Age Editor Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 shadow-2xs">
              <User className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-lg font-bold text-slate-900">{patient.name}</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                  Age {patient.age}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  SYNTHETIC DEMO
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                <span className="flex items-center gap-1">
                  <Hospital className="w-3.5 h-3.5 text-slate-400" />
                  {patient.hospital}
                </span>
                <span>•</span>
                <span>Discharged: <strong className="text-slate-700">{patient.discharge_date}</strong></span>
                <span>•</span>
                <span>MD: <strong className="text-slate-700">{patient.attending_physician}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center shrink-0">
            {!isEditingPatient ? (
              <button
                type="button"
                onClick={() => {
                  setEditName(patient.name);
                  setEditAge(patient.age);
                  setIsEditingPatient(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition shadow-2xs cursor-pointer"
                title="Change patient name and age"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Change Name & Age</span>
              </button>
            ) : null}
          </div>
        </div>

        {/* Inline Patient Edit Form */}
        {isEditingPatient && (
          <form
            onSubmit={handleSavePatientInline}
            className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end animate-fade-in"
          >
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Patient Name
              </label>
              <input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium text-slate-900"
                placeholder="e.g. Alex Johnson"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Age
              </label>
              <input
                type="number"
                required
                min="1"
                max="120"
                value={editAge}
                onChange={(e) => setEditAge(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium text-slate-900"
                placeholder="e.g. 52"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Profile</span>
              </button>
              <button
                type="button"
                onClick={() => setIsEditingPatient(false)}
                className="flex-1 sm:flex-none px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 4 Summary Cards */}
      <DashboardSummaryCards summary={summary} />

      {/* Grid: Care Plan Progress & Attention Required */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Care Plan Progress Circular Indicator */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Care Plan Progress</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Completed tasks relative to overall active recovery actions
            </p>
          </div>

          <div className="flex items-center justify-center my-6">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#e2e8f0"
                  strokeWidth="10"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#10b981"
                  strokeWidth="10"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-slate-900">{completionPct}%</span>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Complete
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>
              <strong>{summary.completed_tasks}</strong> of <strong>{summary.total_tasks}</strong> Tasks Completed
            </span>
            <span className="text-emerald-700 font-semibold">{summary.pending_tasks} Remaining</span>
          </div>
        </div>

        {/* Attention Required Banner & Next Scheduled Items */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                Attention Required
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Items requiring clinical clarification or patient confirmation
              </p>
            </div>
            {summary.needs_review_tasks > 0 && (
              <button
                onClick={() => navigate('/reviews')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition"
              >
                <span>Review Now ({summary.needs_review_tasks})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {reviews.length > 0 ? (
            <div className="space-y-3 my-4">
              {reviews.slice(0, 2).map((rev) => (
                <div
                  key={rev.id}
                  className="p-3.5 bg-red-50/50 rounded-lg border border-red-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-red-100 text-red-800 uppercase">
                        {rev.issue_type}
                      </span>
                      <span className="text-xs font-bold text-slate-900">{rev.issue}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-1">{rev.reason}</p>
                  </div>
                  <button
                    onClick={() => navigate(`/reviews`)}
                    className="self-start sm:self-auto shrink-0 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50"
                  >
                    Open Review
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="my-6 p-4 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-emerald-900">All instructions validated</p>
                <p className="text-xs text-emerald-700">
                  No pending ambiguities or conflicting instructions in the active care plan.
                </p>
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Discharge Date: {patient.discharge_date}</span>
            <span>Attending: {patient.attending_physician}</span>
          </div>
        </div>
      </div>

      {/* Next Actions Table */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Next Actions</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Prioritized upcoming appointments, medications, and clinical tests
            </p>
          </div>
          <button
            onClick={() => navigate('/tasks')}
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
          >
            <span>View All Tasks ({summary.total_tasks})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-3">Task Name</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Due Date</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {upcomingActions.map((task) => (
                <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3">
                    <p className="font-semibold text-slate-900">{task.title}</p>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{task.description}</p>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded font-semibold text-[10px] uppercase bg-slate-100 text-slate-700">
                      {task.category}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-700 whitespace-nowrap">
                    {task.due_date || 'Unscheduled'}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                        task.priority === 'High'
                          ? 'bg-rose-100 text-rose-800'
                          : task.priority === 'Medium'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center gap-1 font-semibold text-[11px] ${
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
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => setSelectedTask(task)}
                      className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                    >
                      View Task
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Analytics Preview Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Analytics Preview</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Interactive snapshot of care-plan distribution and upcoming 14-day schedule
            </p>
          </div>
          <button
            onClick={() => navigate('/analytics')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition shadow-2xs"
          >
            <span>View Full Analytics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Donut preview */}
          <div className="p-4 rounded-lg bg-slate-50/60 border border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Task Status Distribution
            </h3>
            <TaskStatusDonutChart
              data={
                statusDistribution || {
                  total: summary.total_tasks,
                  segments: [
                    { status: 'Pending', count: summary.pending_tasks, percentage: 62.5, color: '#f59e0b' },
                    { status: 'Completed', count: summary.completed_tasks, percentage: 25.0, color: '#10b981' },
                    { status: 'Needs Review', count: summary.needs_review_tasks, percentage: 12.5, color: '#ef4444' },
                  ],
                }
              }
              height={230}
              innerRadius={50}
              outerRadius={75}
            />
          </div>

          {/* Chart 2: Upcoming follow-up schedule */}
          <div className="p-4 rounded-lg bg-slate-50/60 border border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Upcoming Tasks by Date (Next 14 Days)
            </h3>
            <UpcomingScheduleBarChart
              data={computedUpcomingData}
              height={230}
              onUpdateTaskStatus={updateTaskStatus}
            />
          </div>
        </div>
      </div>

      {/* Task Details Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4 border border-slate-200 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                {selectedTask.category} Task
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
              <div className="col-span-2">
                <span className="text-slate-500 block">Source Reference:</span>
                <span className="font-mono text-[11px] text-slate-700">{selectedTask.source_reference}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              {selectedTask.status !== 'Completed' ? (
                <button
                  onClick={() => {
                    updateTaskStatus(selectedTask.id, 'Completed');
                    setSelectedTask(null);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition flex items-center gap-1.5"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Mark as Completed</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    updateTaskStatus(selectedTask.id, 'Pending');
                    setSelectedTask(null);
                  }}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Re-open (Mark Pending)</span>
                </button>
              )}

              <button
                onClick={() => setSelectedTask(null)}
                className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
