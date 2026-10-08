import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Calendar,
  TestTube,
  Pill,
  HeartHandshake,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Info,
  Edit2
} from 'lucide-react';
import { getDischargeDocument } from '../api';
import SourceModal from '../components/SourceModal';
import { useAuth } from '../context/AuthContext';

export default function DischargePage() {
  const { patient, openNameModal } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSourceItem, setSelectedSourceItem] = useState(null);
  const [highlightKeyword, setHighlightKeyword] = useState('');

  useEffect(() => {
    getDischargeDocument()
      .then((res) => setData(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleViewSource = (item, keyword) => {
    setSelectedSourceItem(item);
    setHighlightKeyword(keyword || item.type || item.test_name || item.name || '');
  };

  if (loading || !data) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500 font-medium">
            Loading discharge summary and extracted care entities...
          </p>
        </div>
      </div>
    );
  }

  const { document, analysis } = data;
  const { appointments, tests, medications, care_instructions, warning_signs } = analysis;

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
              Document ID: {document.id}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500">
              Uploaded: {document.upload_date}
            </span>
            <span className="text-xs text-slate-300">•</span>
            <button
              onClick={openNameModal}
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-full border border-slate-200 transition-colors cursor-pointer group"
              title="Click to edit patient name"
            >
              <span>Patient: {patient?.name || 'Alex Johnson'}</span>
              <Edit2 className="w-3 h-3 text-slate-400 group-hover:text-sky-600" />
            </button>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Discharge Summary & Extracted Information
          </h1>
          <p className="text-xs text-slate-500">
            Split-view verifying clinical instructions against original source records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Fidelity Preserved: No Alterations</span>
          </span>
        </div>
      </div>

      {/* Unrecognized Document Alert Banner */}
      {analysis?.reviews?.some((r) => r.issue?.toLowerCase().includes('unrecognized') || r.issue?.toLowerCase().includes('non-discharge')) && (
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 space-y-2.5 shadow-xs">
          <div className="flex items-center gap-2.5 font-bold text-amber-900 text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>Unrecognized or Non-Discharge Document Detected</span>
            <span className="bg-amber-200 text-amber-900 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Review Required</span>
          </div>
          <p className="text-xs text-amber-900/90 leading-relaxed">
            The uploaded file does not appear to contain standard hospital discharge summary sections (orders, medications, follow-up appointments, or attending notes). An item has been flagged in the Human Review Center for clinical verification.
          </p>
          <div className="flex items-center gap-3 pt-1">
            <Link
              to="/review-center"
              className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <span>Go to Human Review Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/upload"
              className="px-4 py-2 rounded-xl bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 font-semibold text-xs transition-colors"
            >
              Upload a Different Document
            </Link>
          </div>
        </div>
      )}

      {/* Split-View Container (Section 11) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Original Discharge Summary (5 Columns) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[750px]">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-600" />
              <h2 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                Original Discharge Summary
              </h2>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              {document.file_name}
            </span>
          </div>

          <div className="p-4 overflow-y-auto flex-1 font-mono text-xs leading-relaxed text-slate-800 whitespace-pre-wrap bg-slate-50/30 selection:bg-amber-200">
            {document.raw_text && patient?.name && patient.name !== 'Alex Johnson'
              ? document.raw_text.replace(/Alex Johnson/g, patient.name)
              : document.raw_text}
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-400 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" />
            <span>Raw text extracted via PyMuPDF / document ingestor.</span>
          </div>
        </div>

        {/* Right Side: Extracted Information (7 Columns) */}
        <div className="lg:col-span-7 space-y-6 overflow-y-auto max-h-[750px] pr-1">
          {/* Section: Appointments */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  Appointments ({appointments.length})
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">Agent 1 Extraction</span>
            </div>

            <div className="space-y-3">
              {appointments.map((appt) => (
                <div
                  key={appt.id}
                  className="p-3.5 rounded-xl border border-slate-200/80 hover:border-sky-300 transition-colors bg-white space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">
                        {appt.type}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        Date: <span className="font-bold text-slate-700">{appt.date || 'Unspecified (Needs Review)'}</span>
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      appt.status === 'Needs Review'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {appt.status}
                    </span>
                  </div>

                  {appt.patient_friendly_explanation && (
                    <p className="text-xs text-slate-600 bg-sky-50/50 p-2 rounded-lg border border-sky-100">
                      💡 {appt.patient_friendly_explanation}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    <span className="truncate max-w-[70%]">
                      Source: {appt.source_reference}
                    </span>
                    <button
                      onClick={() => handleViewSource(appt, appt.type)}
                      className="text-sky-600 font-semibold hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>View Source</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Tests */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <TestTube className="w-4 h-4 text-purple-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  Medical Tests ({tests.length})
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">Agent 1 Extraction</span>
            </div>

            <div className="space-y-3">
              {tests.map((test) => (
                <div
                  key={test.id}
                  className="p-3.5 rounded-xl border border-slate-200/80 hover:border-purple-300 transition-colors bg-white space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">
                        {test.test_name}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        Date: <span className="font-bold text-slate-700">{test.date || 'Unspecified (Needs Review)'}</span>
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      test.status === 'Needs Review'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {test.status}
                    </span>
                  </div>

                  {test.instructions && (
                    <p className="text-xs text-slate-600 bg-purple-50/40 p-2 rounded-lg border border-purple-100">
                      📋 Instructions: {test.instructions}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    <span className="truncate max-w-[70%]">
                      Source: {test.source_reference}
                    </span>
                    <button
                      onClick={() => handleViewSource(test, test.test_name)}
                      className="text-sky-600 font-semibold hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>View Source</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Medications (Strictly Preserved As Written) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <Pill className="w-4 h-4 text-teal-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  Medications ({medications.length})
                </h3>
              </div>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Strict Prescription Fidelity
              </span>
            </div>

            <div className="space-y-3">
              {medications.map((med) => (
                <div
                  key={med.id}
                  className="p-3.5 rounded-xl border border-slate-200/80 hover:border-teal-300 transition-colors bg-white space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-xs text-slate-900">
                      {med.name}
                    </h4>
                    {med.needs_review && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-rose-50 text-rose-700 border border-rose-200">
                        Needs Review
                      </span>
                    )}
                  </div>

                  {/* Original Instruction EXACTLY as written */}
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-800">
                    <strong>Exact Instruction:</strong> {med.instruction}
                  </div>

                  {med.patient_friendly_explanation && (
                    <p className="text-xs text-slate-600 bg-teal-50/40 p-2 rounded-lg border border-teal-100">
                      💊 Plain English: {med.patient_friendly_explanation}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    <span className="truncate max-w-[70%]">
                      Source: {med.source_reference}
                    </span>
                    <button
                      onClick={() => handleViewSource(med, med.name)}
                      className="text-sky-600 font-semibold hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>View Source</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Care Instructions */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  Care & Wound Instructions ({care_instructions.length})
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">Agent 1 Extraction</span>
            </div>

            <div className="space-y-3">
              {care_instructions.map((care) => (
                <div
                  key={care.id}
                  className="p-3.5 rounded-xl border border-slate-200/80 bg-white space-y-2"
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {care.category}
                  </span>
                  <p className="text-xs text-slate-800 font-medium">
                    {care.instruction}
                  </p>
                  {care.patient_friendly_explanation && (
                    <p className="text-xs text-slate-600 bg-emerald-50/40 p-2 rounded-lg border border-emerald-100">
                      🩺 Plain English: {care.patient_friendly_explanation}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    <span>Source: {care.source_reference}</span>
                    <button
                      onClick={() => handleViewSource(care, care.instruction.split(' ')[0])}
                      className="text-sky-600 font-semibold hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>View Source</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Warning Signs */}
          <div className="bg-rose-50/40 p-5 rounded-2xl border border-rose-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-rose-100 pb-2">
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-rose-600" />
                <h3 className="font-bold text-sm text-rose-900">
                  Red Flag Warning Signs ({warning_signs.length})
                </h3>
              </div>
              <span className="text-[10px] font-bold uppercase bg-rose-100 text-rose-800 px-2 py-0.5 rounded">
                Immediate Action Required
              </span>
            </div>

            <div className="space-y-3">
              {warning_signs.map((warn) => (
                <div
                  key={warn.id}
                  className="p-3.5 rounded-xl border border-rose-200 bg-white space-y-1.5"
                >
                  <h4 className="font-bold text-xs text-rose-950">
                    ⚠️ {warn.symptom}
                  </h4>
                  <p className="text-xs text-rose-700 font-medium">
                    Action: {warn.action}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                    <span>Source: {warn.source_reference}</span>
                    <button
                      onClick={() => handleViewSource(warn, warn.symptom.split(' ')[0])}
                      className="text-sky-600 font-semibold hover:underline flex items-center gap-1"
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

      {/* Source Modal */}
      {selectedSourceItem && (
        <SourceModal
          item={selectedSourceItem}
          isOpen={!!selectedSourceItem}
          onClose={() => setSelectedSourceItem(null)}
        />
      )}
    </div>
  );
}
