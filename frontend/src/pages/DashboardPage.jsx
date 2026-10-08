import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  ArrowRight,
  ShieldAlert,
  FileText,
  UserCheck,
  ChevronRight,
  Activity,
  Heart,
  Sparkles,
  Pencil,
  User,
} from 'lucide-react';
import { useCareFlow } from '../context/CareFlowContext';

export const DashboardPage = () => {
  const { counts, tasks, reviews, openTaskModal, patient, openEditPatientModal } = useCareFlow();
  const navigate = useNavigate();

  // Find next action items (Blood Test and Cardiology Follow-up)
  const bloodTestTask = tasks.find(t => t.name.toLowerCase().includes('blood test') || t.task_type === 'Test') || tasks[0];
  const cardioTask = tasks.find(t => t.name.toLowerCase().includes('cardio') || t.task_type === 'Appointment') || tasks[1];

  // Active unresolved review item
  const unresolvedReview = reviews.find(r => r.status === 'Pending' || r.status === 'Needs Review') || reviews[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header matching Section 8 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-healthcare-700 bg-healthcare-50 px-2.5 py-1 rounded-md border border-healthcare-100">
            Post-Hospital Recovery Plan
          </span>
          <div className="flex flex-wrap items-center gap-2.5 mt-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Good morning, {patient.name}
            </h1>
            <button
              onClick={openEditPatientModal}
              type="button"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-healthcare-700 bg-white hover:bg-healthcare-50 border border-slate-200 hover:border-healthcare-300 rounded-lg shadow-2xs transition-all cursor-pointer"
              title="Change patient name, age, or details"
            >
              <Pencil className="w-3 h-3 text-healthcare-600" />
              <span>Edit Patient</span>
            </button>
          </div>
          <p className="text-sm font-medium text-slate-500 mt-0.5">
            Care plan for age <span className="font-semibold text-slate-700">{patient.age}</span> ({patient.gender || 'Male'}) • {patient.hospital}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-healthcare-600 hover:bg-healthcare-700 text-white text-xs font-semibold shadow-sm shadow-healthcare-200 transition-all hover:scale-[1.01] active:scale-95"
          >
            <span>Analyze New Summary</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Top 4 Summary Cards matching Section 8 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Tasks */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Tasks</span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900">{counts.total}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Across all care categories</p>
          </div>
        </div>

        {/* 2. Pending */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Pending</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-amber-600">{counts.pending}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Scheduled or due soon</p>
          </div>
        </div>

        {/* 3. Completed */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Completed</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-emerald-600">{counts.completed}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Verified discharge actions</p>
          </div>
        </div>

        {/* 4. Needs Review */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold uppercase tracking-wider ${counts.needsReview > 0 ? 'text-rose-700' : 'text-slate-500'}`}>
              Needs Review
            </span>
            <div className={`p-2 rounded-xl ${counts.needsReview > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-3xl font-extrabold ${counts.needsReview > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {counts.needsReview}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {counts.needsReview > 0 ? 'Escalated for human safety' : 'All items verified'}
            </p>
          </div>
        </div>
      </div>

      {/* Attention Required Warning Card / Resolution Card */}
      {counts.needsReview > 0 ? (
        <div className="p-5 rounded-2xl bg-rose-50/70 border border-rose-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-rose-100 text-rose-600 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
                  Attention Required
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.2 rounded-full bg-rose-200/80 text-rose-800">
                  {counts.needsReview} item{counts.needsReview > 1 ? 's' : ''} requires human review
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-900 mt-1">
                "{unresolvedReview?.issue || 'Medication duration is unclear in the discharge summary.'}"
              </p>
              <p className="text-xs text-slate-600 mt-0.5">
                CareFlow AI refused to guess missing parameters. A clinician or coordinator must review this item.
              </p>
            </div>
          </div>

          <Link
            to="/reviews"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm shadow-rose-200 transition-all shrink-0 active:scale-95"
          >
            <span>Review Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-600 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Care Plan Verified
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
                  0 Unresolved Items
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-900 mt-1">
                All review items have been resolved.
              </p>
              <p className="text-xs text-slate-600 mt-0.5">
                All post-discharge clinical directives and medication durations have been validated by human review.
              </p>
            </div>
          </div>

          <Link
            to="/reviews"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-emerald-100/60 text-emerald-800 border border-emerald-200 font-semibold text-xs transition-colors shrink-0"
          >
            <span>View Review History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Section: Next Actions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Next Actions</h2>
            <p className="text-xs text-slate-500">Upcoming clinical obligations requiring your attention</p>
          </div>
          <Link
            to="/tasks"
            className="text-xs font-semibold text-healthcare-600 hover:text-healthcare-700 flex items-center gap-1"
          >
            <span>View All Tasks ({tasks.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Blood Test */}
          {bloodTestTask && (
            <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-100">
                    Category: {bloodTestTask.task_type || 'Test'}
                  </span>
                  <span className="text-xs font-semibold text-amber-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    Status: {bloodTestTask.status}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-3">{bloodTestTask.name}</h3>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                  {bloodTestTask.patient_friendly_explanation || bloodTestTask.description}
                </p>
                <div className="flex items-center gap-2 mt-3 text-xs text-slate-500 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-healthcare-600" />
                  <span>Due: <strong>{bloodTestTask.due_date_formatted || 'October 15, 2026'}</strong></span>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Source: Required Medical Tests</span>
                <button
                  onClick={() => openTaskModal(bloodTestTask)}
                  className="px-4 py-2 rounded-lg bg-healthcare-50 hover:bg-healthcare-100 text-healthcare-700 font-bold text-xs transition-colors"
                >
                  View Task
                </button>
              </div>
            </div>
          )}

          {/* Card 2: Cardiology Follow-up */}
          {cardioTask && (
            <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100">
                    Category: {cardioTask.task_type || 'Appointment'}
                  </span>
                  <span className="text-xs font-semibold text-amber-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    Status: {cardioTask.status}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-3">{cardioTask.name}</h3>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                  {cardioTask.patient_friendly_explanation || cardioTask.description}
                </p>
                <div className="flex items-center gap-2 mt-3 text-xs text-slate-500 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-healthcare-600" />
                  <span>Due: <strong>{cardioTask.due_date_formatted || 'October 20, 2026'}</strong></span>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Source: Scheduled Appointments</span>
                <button
                  onClick={() => openTaskModal(cardioTask)}
                  className="px-4 py-2 rounded-lg bg-healthcare-50 hover:bg-healthcare-100 text-healthcare-700 font-bold text-xs transition-colors"
                >
                  View Appointment
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Timeline matching Section 8 */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Upcoming Timeline</h2>
            <p className="text-xs text-slate-500">Compact chronological post-discharge schedule</p>
          </div>
          <Link
            to="/timeline"
            className="text-xs font-semibold text-healthcare-600 hover:text-healthcare-700 flex items-center gap-1"
          >
            <span>Full Interactive Timeline</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Compact Timeline Items */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Oct 15 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 relative overflow-hidden">
            <div className="text-xs font-bold text-healthcare-700">October 15, 2026</div>
            <div className="text-sm font-bold text-slate-900 mt-1">Blood Test</div>
            <p className="text-xs text-slate-500 mt-1">Fasting metabolic & lipid profile before morning dose</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                Pending
              </span>
              <span className="text-[10px] text-slate-400">Diagnostic Test</span>
            </div>
          </div>

          {/* 2. Oct 20 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 relative overflow-hidden">
            <div className="text-xs font-bold text-healthcare-700">October 20, 2026</div>
            <div className="text-sm font-bold text-slate-900 mt-1">Cardiology Appointment</div>
            <p className="text-xs text-slate-500 mt-1">Follow-up with Dr. Arun Kumar at General Hospital Suite</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                Pending
              </span>
              <span className="text-[10px] text-slate-400">Specialist Clinic</span>
            </div>
          </div>

          {/* 3. Oct 25 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 relative overflow-hidden">
            <div className="text-xs font-bold text-healthcare-700">October 25, 2026</div>
            <div className="text-sm font-bold text-slate-900 mt-1">Follow-up Review</div>
            <p className="text-xs text-slate-500 mt-1">Surgical wound & catheter puncture healing review</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                Pending
              </span>
              <span className="text-[10px] text-slate-400">Wound Clinic</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
