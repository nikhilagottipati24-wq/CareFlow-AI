import React from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  Activity,
  HeartPulse,
  Pill,
  ShieldCheck,
} from 'lucide-react';
import { useCareFlow } from '../context/CareFlowContext';

export const TimelinePage = () => {
  const { tasks, openSourceEvidence, openTaskModal } = useCareFlow();

  // Construct events timeline starting with October 14 Discharge
  const timelineEvents = [
    {
      id: "event-0",
      dateFormatted: "October 14, 2026",
      dateIso: "2026-10-14",
      title: "Hospital Discharge (Post-PCI)",
      category: "Discharge",
      status: "Completed",
      description: "Patient discharged from Synthetic General Hospital with dual antiplatelet regimen and outpatient recovery orders.",
      source: {
        document: "Discharge_Summary_AlexJohnson.pdf",
        page: 1,
        section: "Admission & Discharge Record",
        original_text: "Patient discharged in stable hemodynamic condition following successful PCI to LAD.",
        agent_name: "Document Extraction Agent",
        confidence: 0.99,
      }
    },
    ...tasks.map(t => ({
      id: `event-${t.id}`,
      dateFormatted: t.due_date_formatted || "October 20, 2026",
      dateIso: t.dueDate || "2026-10-20",
      title: t.name,
      category: t.task_type || "Care",
      status: t.status,
      description: t.patient_friendly_explanation || t.description,
      source: t.source_reference,
      rawTask: t,
    }))
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-healthcare-700 bg-healthcare-50 px-2.5 py-1 rounded-md border border-healthcare-100">
          Chronological Recovery Road
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          Post-Discharge Timeline
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Step-by-step sequential care itinerary from discharge day to outpatient stabilization
        </p>
      </div>

      {/* Vertical Timeline matching Section 13 */}
      <div className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-2xs relative">
        <div className="relative border-l-2 border-slate-200 ml-4 sm:ml-6 space-y-8 py-2">
          {timelineEvents.map((event, idx) => {
            const isCompleted = event.status === 'Completed';
            const isNeedsReview = event.status === 'Needs Review';

            return (
              <div key={event.id} className="relative pl-6 sm:pl-8 group">
                {/* Node icon on vertical line */}
                <div
                  className={`absolute -left-[17px] top-1 flex items-center justify-center w-8 h-8 rounded-full border-2 bg-white transition-all shadow-xs ${
                    isCompleted
                      ? 'border-emerald-500 text-emerald-600'
                      : isNeedsReview
                      ? 'border-rose-500 text-rose-600 animate-pulse'
                      : 'border-amber-500 text-amber-600'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 fill-emerald-50" />
                  ) : isNeedsReview ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : (
                    <Clock className="w-4 h-4" />
                  )}
                </div>

                {/* Event Card */}
                <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-healthcare-300 hover:bg-white transition-all shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-healthcare-700">
                        {event.dateFormatted}
                      </span>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                        {event.category}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full inline-block w-fit ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : isNeedsReview
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {event.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mt-2">
                    {event.title}
                  </h3>

                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {event.description}
                  </p>

                  {/* Source and details */}
                  <div className="pt-3 mt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">
                      Source: {event.source?.section || 'Discharge Record'}
                    </span>

                    <div className="flex items-center gap-3">
                      {event.rawTask && (
                        <button
                          onClick={() => openTaskModal(event.rawTask)}
                          className="font-bold text-slate-700 hover:text-healthcare-700"
                        >
                          View Details
                        </button>
                      )}

                      {event.source && (
                        <button
                          onClick={() => openSourceEvidence(event.source)}
                          className="text-healthcare-600 hover:text-healthcare-700 font-bold flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>View Source</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
