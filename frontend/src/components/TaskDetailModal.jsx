import React from 'react';
import { X, Calendar, CheckSquare, AlertTriangle, FileText, CheckCircle2, Clock } from 'lucide-react';
import { useCareFlow } from '../context/CareFlowContext';

export const TaskDetailModal = () => {
  const { taskModal, closeTaskModal, updateTaskStatus, openSourceEvidence, openReviewModal } = useCareFlow();
  const { isOpen, data } = taskModal;

  if (!isOpen || !data) return null;

  const isCompleted = data.status === 'Completed';

  const handleToggleStatus = () => {
    updateTaskStatus(data.id, isCompleted ? 'Pending' : 'Completed');
    closeTaskModal();
  };

  const handleSendToReview = () => {
    closeTaskModal();
    openReviewModal({
      id: `rev-${data.id}`,
      issue: `Review requested for task: ${data.name}`,
      priority: data.priority || 'Medium',
      reason: 'User flagged this task for human review or ambiguity confirmation.',
      original_text: data.description,
      ai_interpretation: data.patient_friendly_explanation,
      source_reference: data.source_reference,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl text-white ${
              data.status === 'Completed' ? 'bg-emerald-600' :
              data.status === 'Needs Review' ? 'bg-rose-600' : 'bg-amber-500'
            }`}>
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {data.task_type || data.category}
                </span>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  data.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                  data.status === 'Needs Review' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {data.status}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">{data.name}</h3>
            </div>
          </div>
          <button
            onClick={closeTaskModal}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs">
          {/* Due date & priority */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 text-slate-700">
              <Calendar className="w-4 h-4 text-healthcare-600" />
              <span>Target Due: <strong>{data.due_date_formatted || data.dueDateFormatted || 'As scheduled'}</strong></span>
            </div>
            <span className="font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px]">
              Priority: {data.priority || 'Medium'}
            </span>
          </div>

          {/* Patient-Friendly Explanation */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
              Patient-Friendly Summary (Plain English)
            </label>
            <div className="p-3.5 rounded-xl bg-healthcare-50/60 border border-healthcare-100 text-healthcare-900 text-sm leading-relaxed">
              {data.patient_friendly_explanation || data.description}
            </div>
          </div>

          {/* Verbatim Discharge Order */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
              Verbatim Discharge Order
            </label>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-mono text-xs">
              "{data.description}"
            </div>
          </div>

          {/* Source Link */}
          {data.source_reference && (
            <div className="pt-2">
              <button
                onClick={() => {
                  closeTaskModal();
                  openSourceEvidence(data.source_reference);
                }}
                className="flex items-center gap-1.5 text-healthcare-600 hover:text-healthcare-700 font-semibold"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>View Exact Source Evidence</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/80">
          <button
            onClick={handleSendToReview}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Send to Reviewer</span>
          </button>

          <button
            onClick={handleToggleStatus}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg text-white shadow-sm transition-colors ${
              isCompleted
                ? 'bg-slate-600 hover:bg-slate-700'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isCompleted ? 'Mark Pending' : 'Mark Completed'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
