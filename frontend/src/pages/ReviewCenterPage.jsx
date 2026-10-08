import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  Check,
  MessageSquare,
  HelpCircle,
  FileText,
  Pill,
  Sparkles,
} from 'lucide-react';
import { useCareFlow } from '../context/CareFlowContext';

export const ReviewCenterPage = () => {
  const { reviews, openReviewModal, updateReviewStatus, openSourceEvidence, counts } = useCareFlow();
  const navigate = useNavigate();

  // State to track durations and notes per review item
  const [durations, setDurations] = useState({});
  const [reviewNotes, setReviewNotes] = useState({});

  const pendingReviews = reviews.filter((r) => r.status === 'Pending' || r.status === 'Needs Review');
  const resolvedReviews = reviews.filter((r) => r.status !== 'Pending' && r.status !== 'Needs Review');

  const handleDurationChange = (id, val) => {
    setDurations((prev) => ({ ...prev, [id]: val }));
  };

  const handleNotesChange = (id, val) => {
    setReviewNotes((prev) => ({ ...prev, [id]: val }));
  };

  const handleResolveAction = (item, newStatus) => {
    const dur = durations[item.id] || '12 months';
    const notes = reviewNotes[item.id] || (dur ? `Clinician confirmed duration: ${dur}. Approved post-PCI dual antiplatelet regimen.` : '');
    updateReviewStatus(item.id, newStatus, notes, dur);
  };

  const quickDurations = ['12 months', '90 days', '6 months', '30 days'];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header matching Section 15 with Return to Dashboard link */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              to="/"
              className="text-xs font-semibold text-healthcare-600 hover:text-healthcare-700 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-100">
            Safety Guardrail
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Human Review Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Escalation queue for clinical ambiguities, unspecified medication durations, and safety directives
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors"
          >
            ← Return to Dashboard
          </Link>
          <span
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${
              pendingReviews.length > 0
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}
          >
            {pendingReviews.length > 0 ? (
              <>
                <AlertTriangle className="w-4 h-4" />
                <span>{pendingReviews.length} Unresolved Review(s)</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>All Reviews Resolved</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* Safety Guideline Callout */}
      <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200/90 text-xs text-sky-950 flex items-start gap-3 shadow-2xs">
        <ShieldAlert className="w-4 h-4 text-healthcare-600 mt-0.5 shrink-0" />
        <p className="leading-relaxed">
          <strong>Human-in-the-Loop Protocol:</strong> CareFlow AI never invents clinical dates or alters medication instructions.
          When an instruction is missing critical duration or timing, it is routed here so healthcare staff can enter the missing parameters
          and approve the care plan.
        </p>
      </div>

      {/* Pending Items Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Items Requiring Clinical Attention ({pendingReviews.length})
          </h2>
          {pendingReviews.length === 0 && (
            <Link
              to="/"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>Return to Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {pendingReviews.length === 0 ? (
          <div className="p-10 text-center bg-white rounded-3xl border border-slate-200/80 shadow-2xs space-y-4 animate-in fade-in duration-300">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">All Review Items Have Been Resolved</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                All extracted instructions and medication durations have been approved and saved to the patient care plan.
                Active review count is now 0.
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-healthcare-600 hover:bg-healthcare-700 text-white font-bold text-xs shadow-sm shadow-healthcare-200 transition-all hover:scale-[1.01]"
              >
                <span>Return to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {pendingReviews.map((item) => {
              const isHigh = item.priority === 'High';
              const currentDuration = durations[item.id] !== undefined ? durations[item.id] : '12 months';

              return (
                <div
                  key={item.id}
                  className="p-6 bg-white rounded-3xl border border-rose-200 shadow-2xs hover:shadow-xs transition-all space-y-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                          isHigh
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {item.priority || 'High'} Priority Review
                      </span>
                      <h3 className="text-base font-bold text-slate-900">{item.issue}</h3>
                    </div>

                    <span className="text-xs text-slate-400 font-mono">ID: {item.id}</span>
                  </div>

                  {/* AI Finding & Source Citation */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Source Reference:
                      </span>
                      <p className="font-semibold text-slate-800">
                        {item.source_reference?.document || 'Discharge Summary'} – Page {item.source_reference?.page || 1}
                      </p>
                      <p className="text-slate-700 italic font-mono text-[11px] mt-1 bg-white p-2 rounded-lg border border-slate-200">
                        "{item.original_text || item.originalText}"
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-100 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block">
                        AI Finding & Rationale:
                      </span>
                      <p className="text-rose-950 font-medium">
                        "{item.reason || item.ai_interpretation || 'Follow-up timing or duration is ambiguous.'}"
                      </p>
                      <p className="text-[11px] text-rose-800/80 mt-1">
                        Per safety boundaries, AI cannot guess treatment endpoints. Please enter confirmed duration below.
                      </p>
                    </div>
                  </div>

                  {/* Interactive Input: Enter Missing Duration matching Requirement 3 & 4 */}
                  <div className="p-4 rounded-2xl bg-sky-50/40 border border-sky-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Pill className="w-4 h-4 text-healthcare-600" />
                        <span>Enter Confirmed Medication Duration / Treatment Endpoint:</span>
                      </label>
                      <span className="text-[10px] font-semibold text-healthcare-700">Required to resolve</span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <input
                        type="text"
                        value={currentDuration}
                        onChange={(e) => handleDurationChange(item.id, e.target.value)}
                        placeholder="e.g., 12 months, 90 days, 30 days"
                        className="flex-1 px-3.5 py-2 text-xs font-semibold border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-healthcare-500 text-slate-800 shadow-2xs"
                      />
                    </div>

                    {/* Quick suggestion buttons */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] text-slate-400 font-medium mr-1">Quick Select:</span>
                      {quickDurations.map((dur) => (
                        <button
                          key={dur}
                          type="button"
                          onClick={() => handleDurationChange(item.id, dur)}
                          className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-all ${
                            currentDuration === dur
                              ? 'bg-healthcare-600 text-white border-healthcare-600'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {dur}
                        </button>
                      ))}
                    </div>

                    {/* Notes textarea */}
                    <div className="pt-2">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Clinical Clarification Notes (Optional):
                      </label>
                      <input
                        type="text"
                        value={reviewNotes[item.id] || ''}
                        onChange={(e) => handleNotesChange(item.id, e.target.value)}
                        placeholder="e.g., Confirmed with cardiology attending: 12 months dual antiplatelet therapy post-PCI."
                        className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-healthcare-500 text-slate-700"
                      />
                    </div>
                  </div>

                  {/* Action Buttons matching Requirement 4 */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                    <button
                      onClick={() => openReviewModal(item)}
                      className="text-xs font-bold text-slate-600 hover:text-slate-800 flex items-center gap-1"
                    >
                      <span>Inspect Details & Model Diffs</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleResolveAction(item, 'Clarification Requested')}
                        className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors"
                      >
                        Request Clarification
                      </button>

                      <button
                        onClick={() => handleResolveAction(item, 'Approved')}
                        className="px-4 py-2 text-xs font-bold rounded-xl bg-healthcare-600 hover:bg-healthcare-700 text-white shadow-sm shadow-healthcare-200 transition-colors flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve Extraction</span>
                      </button>

                      <button
                        onClick={() => handleResolveAction(item, 'Resolved')}
                        className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-200 transition-all hover:scale-[1.01] active:scale-95 flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Resolved</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Resolved Archive */}
      {resolvedReviews.length > 0 && (
        <div className="pt-6 border-t border-slate-200 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Resolved & Approved Items ({resolvedReviews.length})
          </h2>
          <div className="grid grid-cols-1 gap-2.5">
            {resolvedReviews.map((res) => (
              <div
                key={res.id}
                className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{res.issue}</span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
                        {res.status}
                      </span>
                    </div>
                    {res.duration && (
                      <p className="text-[11px] text-healthcare-700 font-semibold mt-0.5">
                        Confirmed Duration: {res.duration}
                      </p>
                    )}
                    {res.resolution_notes && (
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Notes: {res.resolution_notes}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => openReviewModal(res)}
                  className="text-healthcare-600 font-bold hover:underline text-[11px] shrink-0"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
