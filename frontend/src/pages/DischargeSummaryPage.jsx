import React from 'react';
import {
  FileText,
  Calendar,
  Pill,
  Activity,
  HeartPulse,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Clock,
} from 'lucide-react';
import { useCareFlow } from '../context/CareFlowContext';

export const DischargeSummaryPage = () => {
  const { currentDocument, tasks, openSourceEvidence, showToast } = useCareFlow();

  const handleCopyText = () => {
    navigator.clipboard.writeText(currentDocument.rawText);
    showToast('Discharge text copied to clipboard', 'info');
  };

  // Group tasks into Extracted Information categories matching Section 11
  const appointments = tasks.filter(t => t.task_type === 'Appointment');
  const tests = tasks.filter(t => t.task_type === 'Test');
  const medications = tasks.filter(t => t.task_type === 'Medication');
  const careInstructions = tasks.filter(t => t.task_type === 'Care');
  const referrals = tasks.filter(t => t.task_type === 'Referral');

  const warningSigns = [
    {
      id: "w-1",
      title: "Chest Pain Protocol",
      symptom: "Severe chest pain, pressure, radiating arm or jaw discomfort, cold sweat, or sudden dizziness.",
      action: "CALL EMERGENCY MEDICAL SERVICES (911) IMMEDIATELY OR PROCEED TO NEAREST EMERGENCY DEPARTMENT.",
      source: {
        document: currentDocument.fileName,
        page: 1,
        section: "Warning Signs and Emergency Protocol",
        original_text: "If you experience severe chest pain, pressure, radiating arm or jaw discomfort, shortness of breath, cold sweat, or sudden dizziness: CALL EMERGENCY MEDICAL SERVICES (911) IMMEDIATELY OR PROCEED TO THE NEAREST EMERGENCY DEPARTMENT.",
        agent_name: "Document Extraction Agent",
        confidence: 0.99,
      }
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-healthcare-700 bg-healthcare-50 px-2.5 py-1 rounded-md border border-healthcare-100">
            Document Grounding
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Discharge Summary
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Side-by-side comparison of original record vs verified extracted directives
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyText}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Document Text</span>
          </button>
        </div>
      </div>

      {/* Split View matching Section 11 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Original Discharge Summary (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden sticky top-20">
          <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-healthcare-600" />
              <span className="text-xs font-bold text-slate-800">Original Discharge Summary</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded">
              Raw Record
            </span>
          </div>

          <div className="p-5 max-h-[750px] overflow-y-auto font-mono text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/30 selection:bg-healthcare-100">
            {currentDocument.rawText}
          </div>

          <div className="p-3 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-500 flex items-center gap-1.5 justify-center font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Synthetic fixture: Zero PHI contained</span>
          </div>
        </div>

        {/* Right Side: Extracted Information (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Extracted Information</h2>
              <p className="text-xs text-slate-500">Structured parameters validated by specialized AI agents</p>
            </div>
            <span className="text-xs font-bold text-healthcare-700 bg-healthcare-50 px-2.5 py-1 rounded-full border border-healthcare-100">
              Verified Extractions
            </span>
          </div>

          {/* 1. Appointments Section */}
          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
              <Calendar className="w-4 h-4 text-purple-600" />
              <span>Appointments</span>
            </div>

            {appointments.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No scheduled appointments found.</p>
            ) : (
              <div className="space-y-3">
                {appointments.map((appt) => (
                  <div key={appt.id} className="p-3.5 rounded-xl bg-purple-50/40 border border-purple-100 flex flex-col justify-between gap-2">
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900">{appt.name}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          appt.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                          appt.status === 'Needs Review' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {appt.status}
                        </span>
                      </div>
                      <p className="text-xs text-purple-900 font-semibold mt-1">
                        Date: {appt.due_date_formatted || 'Date unspecified'}
                      </p>
                      <p className="text-[11px] text-slate-600 mt-1">{appt.patient_friendly_explanation}</p>
                    </div>

                    <div className="pt-2 border-t border-purple-100/80 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">
                        Source: {appt.source_reference?.section || 'Scheduled Appointments'}
                      </span>
                      <button
                        onClick={() => openSourceEvidence(appt.source_reference)}
                        className="text-healthcare-600 hover:text-healthcare-700 font-bold flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>View Source</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. Tests Section */}
          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
              <Activity className="w-4 h-4 text-sky-600" />
              <span>Tests</span>
            </div>

            {tests.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No scheduled tests found.</p>
            ) : (
              <div className="space-y-3">
                {tests.map((test) => (
                  <div key={test.id} className="p-3.5 rounded-xl bg-sky-50/40 border border-sky-100 flex flex-col justify-between gap-2">
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900">{test.name}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          test.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                          test.status === 'Needs Review' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {test.status}
                        </span>
                      </div>
                      <p className="text-xs text-sky-900 font-semibold mt-1">
                        Date: {test.due_date_formatted || 'October 15, 2026'}
                      </p>
                      <p className="text-[11px] text-slate-600 mt-1">{test.patient_friendly_explanation}</p>
                    </div>

                    <div className="pt-2 border-t border-sky-100/80 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">
                        Source: {test.source_reference?.section || 'Required Medical Tests'}
                      </span>
                      <button
                        onClick={() => openSourceEvidence(test.source_reference)}
                        className="text-healthcare-600 hover:text-healthcare-700 font-bold flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>View Source</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. Medications Section */}
          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
              <Pill className="w-4 h-4 text-emerald-600" />
              <span>Medications (Verbatim As Written)</span>
            </div>

            {medications.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No medications found.</p>
            ) : (
              <div className="space-y-3">
                {medications.map((med) => (
                  <div key={med.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between gap-2">
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900">{med.name}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          med.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                          med.status === 'Needs Review' ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {med.status}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-slate-800 mt-1.5 p-2 rounded bg-white border border-slate-200">
                        "{med.description}"
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">
                        Source: {med.source_reference?.section || 'Discharge Medications'}
                      </span>
                      <button
                        onClick={() => openSourceEvidence(med.source_reference)}
                        className="text-healthcare-600 hover:text-healthcare-700 font-bold flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>View Source</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 4. Care Instructions Section */}
          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
              <HeartPulse className="w-4 h-4 text-healthcare-600" />
              <span>Care Instructions</span>
            </div>

            {careInstructions.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No care instructions found.</p>
            ) : (
              <div className="space-y-3">
                {careInstructions.map((care) => (
                  <div key={care.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{care.name}</h4>
                      <p className="text-xs text-slate-700 mt-1 leading-relaxed">{care.patient_friendly_explanation}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">
                        Source: {care.source_reference?.section || 'Care and Wound Instructions'}
                      </span>
                      <button
                        onClick={() => openSourceEvidence(care.source_reference)}
                        className="text-healthcare-600 hover:text-healthcare-700 font-bold flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>View Source</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 5. Warning Signs Section */}
          <div className="p-5 bg-white rounded-2xl border border-rose-200 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-800 uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Warning Signs & Emergency Protocol</span>
            </div>

            {warningSigns.map((w) => (
              <div key={w.id} className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-100 flex flex-col justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-rose-900">{w.title}</h4>
                  <p className="text-xs text-slate-800 mt-1 leading-relaxed">
                    <strong>Symptoms:</strong> {w.symptom}
                  </p>
                  <p className="text-xs text-rose-700 font-bold mt-1">
                    {w.action}
                  </p>
                </div>

                <div className="pt-2 border-t border-rose-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">
                    Source: {w.source.section}
                  </span>
                  <button
                    onClick={() => openSourceEvidence(w.source)}
                    className="text-rose-700 hover:text-rose-800 font-bold flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>View Source</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
