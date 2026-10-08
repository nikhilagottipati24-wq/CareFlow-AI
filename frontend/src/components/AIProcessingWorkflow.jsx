import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Loader2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileText,
  Clock,
  Layers,
} from 'lucide-react';
import { useCareFlow } from '../context/CareFlowContext';

export const AIProcessingWorkflow = () => {
  const { isProcessing, processingStep, processingComplete, identifiedItemsCount, finishProcessing } = useCareFlow();
  const navigate = useNavigate();

  if (!isProcessing) return null;

  const steps = [
    { id: 1, label: 'Document uploaded' },
    { id: 2, label: 'Reading discharge summary' },
    { id: 3, label: 'Extracting follow-up instructions' },
    { id: 4, label: 'Validating information' },
    { id: 5, label: 'Creating tasks' },
    { id: 6, label: 'Checking for review items' },
    { id: 7, label: 'Building care timeline' },
  ];

  const handleViewCarePlan = () => {
    finishProcessing();
    navigate('/');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl p-7 text-center overflow-hidden">
        {/* Decorative subtle background aura */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-healthcare-100/50 rounded-full blur-3xl -z-10" />

        {/* Top Icon */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-healthcare-50 text-healthcare-600 border border-healthcare-100 mb-4 shadow-sm">
          {processingComplete ? (
            <Sparkles className="w-7 h-7 text-healthcare-600 animate-bounce" />
          ) : (
            <Loader2 className="w-7 h-7 text-healthcare-600 animate-spin" />
          )}
        </div>

        <h3 className="text-xl font-bold text-slate-900 tracking-tight">
          {processingComplete ? 'Analysis Complete' : 'AI Discharge Coordination Pipeline'}
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          {processingComplete
            ? `${identifiedItemsCount} actionable items identified and verified.`
            : 'Coordinating multi-agent extraction, clinical boundary checking, and task synthesis.'}
        </p>

        {/* 7-Step Progress List matching Section 10 */}
        <div className="my-6 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 text-left space-y-3">
          {steps.map((step) => {
            const isDone = processingStep > step.id || processingComplete;
            const isCurrent = processingStep === step.id && !processingComplete;
            const isPending = processingStep < step.id;

            return (
              <div key={step.id} className="flex items-center gap-3 text-xs">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-healthcare-600 animate-spin shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                )}

                <span
                  className={`font-medium transition-colors ${
                    isDone
                      ? 'text-slate-800'
                      : isCurrent
                      ? 'text-healthcare-700 font-bold'
                      : 'text-slate-400'
                  }`}
                >
                  {isDone ? `✓ ${step.label}` : step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Action Button when Complete matching Section 10 */}
        {processingComplete ? (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
              ✓ {identifiedItemsCount} actionable items identified across appointments, medications & tests.
            </div>
            <button
              onClick={handleViewCarePlan}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-healthcare-600 hover:bg-healthcare-700 text-white font-bold text-sm shadow-md shadow-healthcare-200 transition-all hover:scale-[1.01] active:scale-95"
            >
              <span>View Care Plan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 text-xs font-medium text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-healthcare-600" />
            <span>Enforcing Responsible AI boundaries & source grounding</span>
          </div>
        )}
      </div>
    </div>
  );
};
