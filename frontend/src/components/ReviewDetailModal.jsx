import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Check, CheckCircle2, MessageSquare, Ban, ShieldAlert, ArrowRight, Pill } from 'lucide-react';
import { useCareFlow } from '../context/CareFlowContext';

export const ReviewDetailModal = () => {
  const { reviewModal, closeReviewModal, updateReviewStatus } = useCareFlow();
  const { isOpen, data } = reviewModal;
  const [notes, setNotes] = useState('');
  const [duration, setDuration] = useState('12 months');

  useEffect(() => {
    if (data) {
      setNotes(data.resolution_notes || '');
      setDuration(data.duration || '12 months');
    }
  }, [data]);

  if (!isOpen || !data) return null;

  const handleAction = (status) => {
    updateReviewStatus(data.id, status, notes, duration);
    closeReviewModal();
  };

  const quickDurations = ['12 months', '90 days', '6 months', '30 days'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-rose-50/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-rose-100 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded">
                  {data.priority || 'High'} Priority Review
                </span>
                <span className="text-xs text-slate-400">ID: {data.id}</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">{data.issue}</h3>
            </div>
          </div>
          <button
            onClick={closeReviewModal}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content matching Section 16 */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Section 1: Original Text */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                1. Original Text
              </h4>
              <span className="text-[11px] text-slate-400">
                {data.source_reference?.document || 'Discharge_Summary.pdf'}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm font-mono leading-relaxed">
              "{data.original_text || data.originalText}"
            </div>
          </div>

          {/* Section 2: AI Interpretation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              2. AI Interpretation
            </h4>
            <div className="p-3.5 rounded-xl bg-sky-50/60 border border-sky-100 text-slate-800 text-sm leading-relaxed">
              {data.ai_interpretation || data.aiInterpretation || "Ambiguity identified during entity extraction."}
            </div>
          </div>

          {/* Section 3: Issue */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              3. Issue (Why Human Review is Required)
            </h4>
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 text-sm leading-relaxed flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">{data.reason || "Follow-up timing is ambiguous."}</p>
                <p className="text-xs text-amber-700/90 mt-1">
                  CareFlow AI strictly refuses to fabricate dates, alter dosages, or guess medical directives. A licensed clinician or care coordinator must approve the extraction or clarify with the hospital.
                </p>
              </div>
            </div>
          </div>

          {/* Missing Medication Duration Input matching Requirement 3 */}
          <div className="p-4 rounded-xl bg-sky-50/50 border border-sky-100 space-y-2">
            <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Pill className="w-4 h-4 text-healthcare-600" />
              <span>Enter Confirmed Medication Duration / Treatment Endpoint:</span>
            </label>
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g. 12 months, 90 days, 30 days"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-healthcare-500 bg-white font-medium"
            />
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-slate-400 font-medium mr-1">Quick Select:</span>
              {quickDurations.map((dur) => (
                <button
                  key={dur}
                  type="button"
                  onClick={() => setDuration(dur)}
                  className={`px-2 py-0.5 text-[10px] font-semibold rounded border transition-all ${
                    duration === dur
                      ? 'bg-healthcare-600 text-white border-healthcare-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {dur}
                </button>
              ))}
            </div>
          </div>

          {/* Clinician Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reviewer Notes / Clinical Clarification
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Confirmed with attending nurse: Clopidogrel duration is 12 months..."
              rows={2}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-healthcare-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Action Buttons matching Section 16 & Requirements */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 px-6 py-4 border-t border-slate-100 bg-slate-50/80 shrink-0">
          <button
            onClick={() => handleAction('Rejected')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
          >
            <Ban className="w-3.5 h-3.5" />
            <span>Reject</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAction('Clarification Requested')}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-800 bg-amber-100/70 hover:bg-amber-100 rounded-lg border border-amber-200 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-700" />
              <span>Clarify</span>
            </button>

            <button
              onClick={() => handleAction('Approved')}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-healthcare-600 hover:bg-healthcare-700 rounded-lg shadow-sm shadow-healthcare-200 transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Approve</span>
            </button>

            <button
              onClick={() => handleAction('Resolved')}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm shadow-emerald-200 transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark Resolved</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
