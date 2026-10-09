import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  ClipboardPaste,
  ShieldCheck,
  Calendar,
  Pill,
  Activity,
  HeartHandshake
} from 'lucide-react';
import { CareFlowAPI } from '../services/api';
import { useCareFlow } from '../context/CareFlowContext';

const SAMPLE_SUMMARY = `DISCHARGE SUMMARY - SYNTHETIC GENERAL HOSPITAL
PATIENT: Alex Johnson  |  DOB: 03/12/1974  |  AGE: 52
ADMISSION: October 10, 2026  |  DISCHARGE: October 14, 2026
ATTENDING PHYSICIAN: Dr. Robert Sterling, MD
DIAGNOSIS: Congestive Heart Failure exacerbation, resolved with IV furosemide, transitioned to oral.

1. DISCHARGE MEDICATIONS:
- Lisinopril 10mg PO once daily in morning. Check BP regularly.
- Furosemide 40mg PO once daily in morning with potassium supplement.
- Atorvastatin 20mg PO at bedtime.

2. FOLLOW-UP APPOINTMENTS:
- Cardiology clinic follow-up with Dr. Sarah Lin in 7-10 days.
- Primary Care routine visit within 3-4 weeks.

3. REQUIRED DIAGNOSTIC TESTS:
- Fasting Basic Metabolic Panel (BUN/Creatinine/Potassium) in 5 days at Apex Diagnostic Labs.
- Repeat Echocardiogram in 6 months.

4. CARE & DIETARY INSTRUCTIONS:
- Restrict dietary sodium to under 2,000 mg/day.
- Daily morning weights: notify clinic if weight increases by >3 lbs in 24 hours.
- Cardiac Rehabilitation outpatient intake appointment.

5. WARNING SIGNS / EMERGENCY:
- Call clinic or seek emergency care if you experience sudden severe shortness of breath, chest pain, or rapid swelling in lower extremities.`;

export const DischargeUploadPage = () => {
  const navigate = useNavigate();
  const { refreshData, showToast } = useCareFlow();

  const [rawText, setRawText] = useState(SAMPLE_SUMMARY);
  const [selectedFile, setSelectedFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const stagesList = [
    'Document uploaded',
    'Reading discharge summary',
    'Extracting instructions',
    'Validating extracted information',
    'Creating actionable tasks',
    'Identifying review items',
    'Building care timeline'
  ];

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setErrorMessage(null);

    // If text file, read directly
    if (file.name.endsWith('.txt')) {
      const text = await file.text();
      setRawText(text);
      showToast(`Loaded ${file.name}`);
    } else if (file.name.endsWith('.pdf')) {
      // Upload to PyMuPDF backend extraction endpoint
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await CareFlowAPI.uploadDischargeFile(formData);
        if (res?.data?.full_text) {
          setRawText(res.data.full_text);
          showToast(`PDF parsed successfully via PyMuPDF (${res.data.character_count} chars)`);
        }
      } catch (err) {
        setErrorMessage(`PDF parsing failed: ${err?.response?.data?.detail || err.message}`);
      }
    }
  };

  const handleAnalyze = async () => {
    if (!rawText.trim()) {
      setErrorMessage('Please provide discharge text or upload a document.');
      return;
    }

    setAnalyzing(true);
    setErrorMessage(null);
    setAnalysisResult(null);

    // Progressive stage simulation
    for (let i = 1; i <= stagesList.length; i++) {
      setCurrentStage(i);
      await new Promise((r) => setTimeout(r, 220));
    }

    try {
      const res = await CareFlowAPI.analyzeDischargeText(rawText);
      setAnalysisResult(res.data);
      await refreshData();
      showToast('Discharge summary successfully analyzed by all 6 agents!');
    } catch (err) {
      setErrorMessage(`Analysis failed: ${err?.response?.data?.detail || err.message}`);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Discharge Summary Analysis
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Upload PDF/TXT discharge summaries to run the 6-agent clinical extraction and task generation pipeline.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Upload Box & Text Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Drag & Drop / File Input */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Upload className="w-4 h-4 text-blue-600" />
              Upload Discharge Document
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Supports hospital discharge PDFs (PyMuPDF OCR engine) or plain text TXT files.
            </p>

            <label className="mt-4 flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50/30 transition-all text-center">
              <FileText className="w-10 h-10 text-slate-400 mb-2" />
              <span className="text-xs font-bold text-slate-800">
                {selectedFile ? selectedFile.name : 'Drag and drop PDF / TXT here'}
              </span>
              <span className="text-[11px] text-slate-500 mt-1">
                or click to browse your computer
              </span>
              <input
                type="file"
                accept=".pdf,.txt"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
            <p className="font-semibold text-slate-700 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              Responsible AI Privacy Notice:
            </p>
            <p className="text-[11px] text-slate-500">
              Only synthetic, non-identifiable healthcare records are processed. No diagnosis or medication alterations are generated.
            </p>
          </div>
        </div>

        {/* Right: Paste Summary Textarea */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ClipboardPaste className="w-4 h-4 text-blue-600" />
                Discharge Summary Content
              </h2>
              <button
                onClick={() => setRawText(SAMPLE_SUMMARY)}
                className="text-xs text-blue-600 font-semibold hover:underline"
              >
                Load Sample
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Review or paste discharge text prior to agent execution.
            </p>

            <textarea
              rows={11}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              placeholder="Paste discharge note contents here..."
            />
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              {rawText.length} characters
            </span>
            <button
              onClick={handleAnalyze}
              disabled={analyzing || !rawText.trim()}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-2xs disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{analyzing ? 'Analyzing Summary...' : 'Analyze Summary'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Progress Stages Interface */}
      {analyzing && (
        <div className="bg-white p-6 rounded-xl border border-blue-200 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 animate-spin" />
              Agent Workflow Progress
            </h3>
            <span className="text-xs font-bold text-blue-600">
              Stage {currentStage} of {stagesList.length}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {stagesList.map((st, idx) => {
              const stepNum = idx + 1;
              const isDone = currentStage > stepNum;
              const isCurrent = currentStage === stepNum;

              return (
                <div
                  key={st}
                  className={`p-3 rounded-lg border text-xs flex items-center gap-2.5 transition-all ${
                    isDone
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : isCurrent
                      ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold ring-2 ring-blue-400'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isDone
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-blue-600 text-white animate-pulse'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {isDone ? '✓' : stepNum}
                  </span>
                  <span>{st}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Analysis Results Display */}
      {analysisResult && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Extraction & Synthesis Breakdown
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Outputs produced by Document Extraction, Validation, and Task Generation Agents
              </p>
            </div>
            <button
              onClick={() => navigate('/tasks')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition"
            >
              <span>View Generated Tasks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Extracted Appointments */}
            <div className="p-4 rounded-lg bg-cyan-50/60 border border-cyan-200 space-y-2">
              <h4 className="text-xs font-bold text-cyan-900 uppercase flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-cyan-700" />
                Appointments ({analysisResult.extracted?.appointments?.length || 0})
              </h4>
              <ul className="text-xs text-cyan-800 space-y-1">
                {analysisResult.extracted?.appointments?.map((a, i) => (
                  <li key={i} className="line-clamp-2">• {a.raw}</li>
                )) || <li>None</li>}
              </ul>
            </div>

            {/* Extracted Medications */}
            <div className="p-4 rounded-lg bg-blue-50/60 border border-blue-200 space-y-2">
              <h4 className="text-xs font-bold text-blue-900 uppercase flex items-center gap-1.5">
                <Pill className="w-3.5 h-3.5 text-blue-700" />
                Medications ({analysisResult.extracted?.medications?.length || 0})
              </h4>
              <ul className="text-xs text-blue-800 space-y-1">
                {analysisResult.extracted?.medications?.map((m, i) => (
                  <li key={i} className="line-clamp-2">• {m.raw}</li>
                )) || <li>None</li>}
              </ul>
            </div>

            {/* Extracted Tests */}
            <div className="p-4 rounded-lg bg-purple-50/60 border border-purple-200 space-y-2">
              <h4 className="text-xs font-bold text-purple-900 uppercase flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-purple-700" />
                Diagnostic Tests ({analysisResult.extracted?.tests?.length || 0})
              </h4>
              <ul className="text-xs text-purple-800 space-y-1">
                {analysisResult.extracted?.tests?.map((t, i) => (
                  <li key={i} className="line-clamp-2">• {t.raw}</li>
                )) || <li>None</li>}
              </ul>
            </div>

            {/* Extracted Care & Red Flags */}
            <div className="p-4 rounded-lg bg-amber-50/60 border border-amber-200 space-y-2">
              <h4 className="text-xs font-bold text-amber-900 uppercase flex items-center gap-1.5">
                <HeartHandshake className="w-3.5 h-3.5 text-amber-700" />
                Care & Warning Signs ({analysisResult.extracted?.care_instructions?.length || 0})
              </h4>
              <ul className="text-xs text-amber-800 space-y-1">
                {analysisResult.extracted?.care_instructions?.map((c, i) => (
                  <li key={i} className="line-clamp-2">• {c.raw}</li>
                )) || <li>None</li>}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
