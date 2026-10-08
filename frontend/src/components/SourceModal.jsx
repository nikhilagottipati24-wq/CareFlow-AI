import React from 'react';
import { X, FileSearch, ShieldCheck } from 'lucide-react';

export default function SourceModal({ item, isOpen, onClose }) {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
              <FileSearch className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Source Document Verification
              </h3>
              <p className="text-xs text-slate-500">
                Clinical traceability & explainability
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs">
          <div>
            <label className="text-slate-500 font-semibold uppercase text-[11px] block mb-1">
              Item
            </label>
            <div className="text-sm font-bold text-slate-900">
              {item.issue || item.task_name || item.type || item.test_name || item.name || 'Clinical Item'}
            </div>
            {item.id && (
              <span className="inline-block mt-1 font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                ID: {item.id}
              </span>
            )}
          </div>

          <div>
            <label className="text-slate-500 font-semibold uppercase text-[11px] block mb-1">
              Document Citation & Location
            </label>
            <div className="p-3 bg-sky-50/70 border border-sky-100 rounded-xl text-sky-900 font-medium flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
              <span>
                {item.source_reference || item.source || (item.source_document ? `${item.source_document} – Page ${item.source_page || '1'} – ${item.source_section || 'Clinical Section'}` : 'Discharge Summary – Page 1')}
              </span>
            </div>
          </div>

          <div>
            <label className="text-slate-500 font-semibold uppercase text-[11px] block mb-1">
              Exact Snippet / Text as Written in Medical Record
            </label>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] text-slate-800 leading-relaxed whitespace-pre-wrap">
              "{item.source_text || item.original_text || item.instruction || item.description || item.notes || item.instructions || item.task_name}"
            </div>
          </div>

          {item.reason && (
            <div>
              <label className="text-slate-500 font-semibold uppercase text-[11px] block mb-1">
                Reason Flagged for Clinical Review
              </label>
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-amber-950 font-medium leading-relaxed">
                {item.reason}
              </div>
            </div>
          )}

          {(item.patient_friendly_explanation || item.ai_interpretation) && (
            <div>
              <label className="text-slate-500 font-semibold uppercase text-[11px] block mb-1">
                {item.ai_interpretation ? 'AI Clinical Interpretation' : 'Patient-Friendly Explanation (Agent 4)'}
              </label>
              <div className="p-3 bg-sky-50/60 border border-sky-100 rounded-xl text-sky-950">
                {item.ai_interpretation || item.patient_friendly_explanation}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-900 transition-colors"
          >
            Close Source Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
