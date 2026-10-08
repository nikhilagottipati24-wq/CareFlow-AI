import React from 'react';
import {
  Cpu,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Activity,
  Layers,
} from 'lucide-react';
import { useCareFlow } from '../context/CareFlowContext';

export const AIActivityPage = () => {
  const { activities } = useCareFlow();

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header matching Section 17 */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-healthcare-700 bg-healthcare-50 px-2.5 py-1 rounded-md border border-healthcare-100">
          Agentic Audit Trail
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          AI Activity Log
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time chronological telemetry showing multi-agent reasoning, validation passes, and safety escalations
        </p>
      </div>

      {/* Audit Trail Card */}
      <div className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-2xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-healthcare-600" />
            <h2 className="text-base font-bold text-slate-900">Coordination Pipeline Events</h2>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Live Telemetry
          </span>
        </div>

        {/* Chronological Log Stream matching Section 17 */}
        <div className="space-y-4">
          {activities.map((act) => {
            const isAlert =
              act.action.toLowerCase().includes('escalated') ||
              act.action.toLowerCase().includes('ambiguous');

            return (
              <div
                key={act.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isAlert
                    ? 'bg-rose-50/30 border-rose-200/80'
                    : 'bg-slate-50/60 border-slate-200/80 hover:bg-white'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                      isAlert
                        ? 'bg-rose-100 text-rose-600'
                        : 'bg-healthcare-50 text-healthcare-600'
                    }`}
                  >
                    {isAlert ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{act.action}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.2 rounded bg-slate-200/70 text-slate-700">
                        {act.agent_name || 'Agent Pipeline'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{act.details}</p>
                  </div>
                </div>

                <div className="text-xs font-mono font-semibold text-slate-400 shrink-0 self-end sm:self-center">
                  {act.timestamp}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Explanatory Callout */}
      <div className="p-4 rounded-2xl bg-slate-100/70 border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-healthcare-600 mt-0.5 shrink-0" />
        <p className="leading-relaxed">
          Every entity extraction, validation check, and safety escalation produces an unalterable audit entry.
          This ensures full transparency for hospital risk management, clinical coordinators, and patient safety officers.
        </p>
      </div>
    </div>
  );
};
