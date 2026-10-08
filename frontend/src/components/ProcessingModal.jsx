import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Sparkles, ArrowRight } from 'lucide-react';

const STEPS = [
  'Document uploaded',
  'Reading discharge summary',
  'Extracting follow-up instructions',
  'Validating information',
  'Creating tasks',
  'Checking for review items',
  'Building care timeline'
];

export default function ProcessingModal({ isOpen, isComplete, taskCount = 8, onComplete }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStepIndex(0);
      return;
    }

    // Step through the pipeline steps with realistic animation
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < STEPS.length - 1) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 450);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const allDone = isComplete && currentStepIndex >= STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 p-6 space-y-6">
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 mb-2">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <h3 className="font-bold text-lg text-slate-900">
            {allDone ? 'Analysis Complete' : 'AI Agent Coordination in Progress'}
          </h3>
          <p className="text-xs text-slate-500">
            {allDone
              ? `${taskCount} actionable items identified across discharge instructions.`
              : 'Multi-agent pipeline extracting, validating, and structuring clinical tasks...'}
          </p>
        </div>

        {/* Step-by-step agent checklist */}
        <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
          {STEPS.map((step, idx) => {
            const isFinished = idx <= currentStepIndex;
            const isCurrent = idx === currentStepIndex && !allDone;

            return (
              <div
                key={step}
                className={`flex items-center gap-3 text-xs transition-colors ${
                  isFinished ? 'text-slate-900 font-medium' : 'text-slate-400'
                }`}
              >
                {isFinished && (idx < currentStepIndex || allDone) ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-sky-600 animate-spin shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                )}
                <span>{step}</span>
              </div>
            );
          })}
        </div>

        {/* Completion CTA */}
        {allDone ? (
          <div className="space-y-2">
            <button
              onClick={onComplete}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-sky-600 text-white hover:bg-sky-700 transition-all flex items-center justify-center gap-2 shadow-md shadow-sky-200"
            >
              <span>View Care Plan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="text-center text-xs text-slate-400 italic">
            Coordinating Agents 1 through 6...
          </div>
        )}
      </div>
    </div>
  );
}
