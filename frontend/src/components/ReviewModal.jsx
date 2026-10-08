import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  CheckCheck,
  FileText,
  ShieldCheck,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  User,
  Clock
} from 'lucide-react';
import { useReview } from '../context/ReviewContext';
import SourceModal from './SourceModal';

export default function ReviewModal({ review: initialReview, isOpen, onClose, onReviewUpdated }) {
  const { updateReview, reviews } = useReview();
  const review = reviews.find((r) => r.id?.toUpperCase() === initialReview?.id?.toUpperCase()) || initialReview;
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSourceText, setShowSourceText] = useState(false);
  const [showSourceModal, setShowSourceModal] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  if (!isOpen || !review) return null;

  const handleAction = async (status) => {
    setLoading(true);
    setActionSuccess(`Status updated to "${status}"`);
    try {
      await updateReview(review.id, status, notes);
      if (onReviewUpdated) {
        onReviewUpdated({ ...review, status, reviewer_notes: notes });
      }
      setTimeout(() => {
        setActionSuccess('');
        onClose();
      }, 750);
    } catch (err) {
      console.error(err);
      setActionSuccess('');
    } finally {
      setLoading(false);
    }
  };

  const isHigh = review.priority === 'HIGH' || review.priority === 'High';
  const isMed = review.priority === 'MEDIUM' || review.priority === 'Medium';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                isHigh
                  ? 'bg-rose-100 text-rose-700'
                  : isMed
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-sky-100 text-sky-700'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-500">
                  {review.id}
                </span>
                <span className="text-slate-300">•</span>
                <h3 className="font-bold text-base text-slate-900">
                  {review.issue}
                </h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    isHigh
                      ? 'bg-rose-100 text-rose-800'
                      : isMed
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {review.priority}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-400" />
                  Patient: <strong className="text-slate-700">{review.patient_name || 'Alex Johnson'}</strong>
                </span>
                <span>•</span>
                <span>Source: {review.source_reference}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            title="Close review modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {actionSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 font-medium">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
          )}

          {/* Section A: Original Discharge Instruction */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-slate-800 font-bold uppercase tracking-wider text-[11px]">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>A. ORIGINAL DISCHARGE INSTRUCTION</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-mono text-[12px] whitespace-pre-wrap leading-relaxed">
              "{review.original_text}"
            </div>
          </div>

          {/* Section B: AI Interpretation */}
          <div className="space-y-1.5">
            <div className="text-slate-800 font-bold uppercase tracking-wider text-[11px]">
              B. AI INTERPRETATION
            </div>
            <div className="p-3.5 rounded-xl bg-sky-50/70 border border-sky-100 text-sky-950 font-medium leading-relaxed">
              {review.ai_interpretation}
            </div>
          </div>

          {/* Section C: Why Human Review is Required */}
          <div className="space-y-1.5">
            <div className="text-slate-800 font-bold uppercase tracking-wider text-[11px]">
              C. WHY HUMAN REVIEW IS REQUIRED
            </div>
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-950 leading-relaxed space-y-1.5">
              <p className="font-medium">{review.reason}</p>
              <div className="pt-1.5 border-t border-amber-200/60 text-[11px] text-amber-900 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>
                  CareFlow AI cannot infer missing clinical information. Human clarification is required.
                </span>
              </div>
            </div>
          </div>

          {/* Source Evidence Section (Section 8 Requirement) */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block">
                  Source Evidence
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  <strong>Source:</strong> {review.source_document || 'Synthetic Discharge Summary'} • <strong>Page:</strong> {review.source_page || '2'} • <strong>Section:</strong> {review.source_section || 'Medication Instructions'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowSourceModal(true)}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Open full document verification inspector"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  <span>Inspect Citation</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowSourceText(!showSourceText)}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>{showSourceText ? 'Hide Source' : 'View Source'}</span>
                  {showSourceText ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {showSourceText && (
              <div className="p-3 rounded-lg bg-white border border-slate-200 text-slate-700 font-mono text-[11px] whitespace-pre-wrap leading-relaxed animate-in fade-in duration-150">
                {review.source_text || review.original_text}
              </div>
            )}
          </div>

          {/* Reviewer Clinical Notes */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-slate-700 font-semibold">
              Reviewer Clinical Notes (Optional Verification Log):
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Verified with attending note; continuation duration confirmed."
              className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
        </div>

        {/* Modal Footer with Functional Review Action Buttons */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <span>Current Status:</span>
            <span
              className={`font-bold px-2 py-0.5 rounded-md text-[10px] uppercase ${
                review.status === 'Approved'
                  ? 'bg-emerald-100 text-emerald-800'
                  : review.status === 'Needs Clarification'
                  ? 'bg-amber-100 text-amber-800'
                  : review.status === 'Resolved'
                  ? 'bg-indigo-100 text-indigo-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {review.status}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            {review.status !== 'Needs Review' && (
              <button
                onClick={() => handleAction('Needs Review')}
                disabled={loading}
                className="px-3 py-2 rounded-xl border border-rose-300 bg-white text-rose-700 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                title="Reopen and flag item for human clinical review"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>Reopen for Review</span>
              </button>
            )}

            <button
              onClick={() => handleAction('Needs Clarification')}
              disabled={loading}
              className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer ${
                review.status === 'Needs Clarification'
                  ? 'border-amber-400 bg-amber-100 text-amber-900 font-bold'
                  : 'border-amber-300 bg-white text-amber-800 hover:bg-amber-50'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Request Clarification</span>
            </button>

            <button
              onClick={() => handleAction('Resolved')}
              disabled={loading}
              className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer ${
                review.status === 'Resolved'
                  ? 'border-indigo-400 bg-indigo-100 text-indigo-900 font-bold'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              <CheckCheck className="w-3.5 h-3.5 text-slate-600" />
              <span>Mark Resolved</span>
            </button>

            <button
              onClick={() => handleAction('Approved')}
              disabled={loading}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50 cursor-pointer ${
                review.status === 'Approved'
                  ? 'bg-emerald-700 text-white ring-2 ring-emerald-400'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Approve Extraction</span>
            </button>
          </div>
        </div>
      </div>

      {/* Embedded Full Document Verification Inspector */}
      {showSourceModal && (
        <SourceModal
          item={review}
          isOpen={showSourceModal}
          onClose={() => setShowSourceModal(false)}
        />
      )}
    </div>
  );
}
