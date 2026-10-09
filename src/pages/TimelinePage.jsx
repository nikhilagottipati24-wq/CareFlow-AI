import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Hospital,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { useCareFlow } from '../context/CareFlowContext';
import { CareFlowAPI } from '../services/api';

export const TimelinePage = () => {
  const { patient, summary, updateTaskStatus } = useCareFlow();
  const [timelineData, setTimelineData] = useState({ scheduled: [], unscheduled: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    CareFlowAPI.getTimeline()
      .then((res) => {
        if (res?.data) setTimelineData(res.data);
      })
      .catch(console.warn)
      .finally(() => setLoading(false));
  }, [summary]);

  const scheduled = timelineData.scheduled || [];
  const unscheduled = timelineData.unscheduled || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Care Plan Timeline
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Chronological milestone progression of outpatient follow-ups, testing, and care evaluations.
        </p>
      </div>

      {/* Patient Recovery Header Banner */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <Hospital className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">{patient.hospital}</h2>
            <p className="text-xs text-slate-500">
              Discharge Date: <strong>{patient.discharge_date}</strong> • Attending: {patient.attending_physician}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200">
            {scheduled.length} Scheduled Events
          </span>
          {unscheduled.length > 0 && (
            <span className="px-2.5 py-1 rounded bg-amber-50 text-amber-800 font-semibold border border-amber-200">
              {unscheduled.length} Unscheduled (Needs Date)
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Chronological Timeline */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
          <h3 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            Scheduled Chronological Pathway
          </h3>

          <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {/* Milestone: Hospital Discharge */}
            <div className="relative">
              <span className="absolute -left-[27px] top-1 w-4 h-4 rounded-full bg-blue-600 ring-4 ring-blue-100 flex items-center justify-center" />
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                  Origin Milestone
                </span>
                <h4 className="text-xs font-bold text-blue-950 mt-0.5">
                  Hospital Discharge & Transition to Outpatient Care
                </h4>
                <p className="text-[11px] text-blue-800 mt-1">
                  Discharge instructions finalized. Patient transitioned to post-discharge care coordination.
                </p>
                <span className="text-[10px] font-mono text-blue-600 block mt-1">
                  Date: {patient.discharge_date}
                </span>
              </div>
            </div>

            {/* Scheduled Tasks */}
            {scheduled.map((task) => (
              <div key={task.id} className="relative group">
                <span
                  className={`absolute -left-[27px] top-1 w-4 h-4 rounded-full ring-4 transition-all ${
                    task.status === 'Completed'
                      ? 'bg-emerald-500 ring-emerald-100'
                      : task.status === 'Needs Review'
                      ? 'bg-red-500 ring-red-100'
                      : 'bg-amber-400 ring-amber-100'
                  }`}
                />

                <div
                  className={`p-4 rounded-lg border transition-all ${
                    task.status === 'Completed'
                      ? 'bg-slate-50/70 border-slate-200'
                      : 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-xs'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-bold font-mono text-blue-600">
                      {task.due_date}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {task.category}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          task.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : task.status === 'Needs Review'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {task.status}
                      </span>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900">{task.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{task.description}</p>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                    <span className="italic">Source: {task.source_reference}</span>
                    {task.status !== 'Completed' ? (
                      <button
                        onClick={() => updateTaskStatus(task.id, 'Completed')}
                        className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Completed</span>
                      </button>
                    ) : (
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Finished</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Unscheduled Items Section */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs h-fit space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Unscheduled Items ({unscheduled.length})
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Instructions that lack explicit appointment or execution calendar dates in the discharge record.
            </p>
          </div>

          {unscheduled.length === 0 ? (
            <p className="text-xs text-slate-500 italic p-4 text-center bg-slate-50 rounded-lg">
              All active instructions have verified dates.
            </p>
          ) : (
            <div className="space-y-3">
              {unscheduled.map((task) => (
                <div
                  key={task.id}
                  className="p-3.5 rounded-lg border border-amber-200 bg-amber-50/50 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                      {task.category}
                    </span>
                    <span className="text-[10px] font-bold text-red-600">Pending Date</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">{task.title}</h4>
                  <p className="text-xs text-slate-600">{task.description}</p>
                  <p className="text-[11px] text-slate-400 italic pt-1">
                    Source: {task.source_reference}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
            <span className="font-semibold block text-slate-800">Responsible AI Safeguard:</span>
            CareFlow AI will never invent missing clinic dates. Vague entries remain unscheduled until confirmed by clinical staff.
          </div>
        </div>
      </div>
    </div>
  );
};
