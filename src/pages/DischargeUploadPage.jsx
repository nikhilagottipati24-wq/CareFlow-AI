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
  HeartHandshake,
  RefreshCw,
  X
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
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadMeta, setUploadMeta] = useState(null);
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

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const uploadFile = async (fileToUpload) => {
    if (!fileToUpload) return;
    setUploading(true);
    setUploadProgress(0);
    setErrorMessage(null);
    setUploadSuccess(false);
    setUploadMeta(null);

    const formData = new FormData();
    formData.append('file', fileToUpload, fileToUpload.name);

    try {
      const res = await CareFlowAPI.uploadDischargeFile(formData, (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      if (res?.data?.full_text) {
        setRawText(res.data.full_text);
        setUploadMeta(res.data);
        setUploadSuccess(true);
        setUploadProgress(100);
        showToast(
          `${fileToUpload.name.endsWith('.pdf') ? 'PDF' : 'Document'} parsed successfully via PyMuPDF (${res.data.character_count} chars)`
        );
      } else {
        throw new Error('No text returned from document extraction.');
      }
    } catch (err) {
      let msg =
        err?.response?.data?.detail ||
        err?.friendlyMessage ||
        err?.message ||
        'Upload and extraction failed.';
      if (typeof msg === 'object') msg = JSON.stringify(msg);
      setErrorMessage(`Document upload / parsing failed: ${msg}`);
      setUploadSuccess(false);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    uploadFile(file);
  };

  const handleRetryUpload = () => {
    if (selectedFile) {
      uploadFile(selectedFile);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setUploadSuccess(false);
    setUploadMeta(null);
    setErrorMessage(null);
    setUploadProgress(0);
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
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          {selectedFile && !uploading && (
            <button
              onClick={handleRetryUpload}
              className="flex items-center gap-1 px-2.5 py-1 bg-red-600 text-white rounded text-[11px] font-semibold hover:bg-red-700 transition shrink-0"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          )}
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

            {!selectedFile ? (
              <label className="mt-4 flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50/30 transition-all text-center">
                <FileText className="w-10 h-10 text-slate-400 mb-2" />
                <span className="text-xs font-bold text-slate-800">
                  Drag and drop PDF / TXT here
                </span>
                <span className="text-[11px] text-slate-500 mt-1">
                  or click to browse your computer
                </span>
                <input
                  type="file"
                  accept=".pdf,.txt"
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="mt-4 p-4 border border-slate-200 rounded-xl bg-slate-50/80 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {formatFileSize(selectedFile.size)}
                        {uploadMeta?.page_count ? ` • ${uploadMeta.page_count} page(s)` : ''}
                      </p>
                    </div>
                  </div>
                  {!uploading && (
                    <button
                      onClick={handleClearFile}
                      className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-200 transition"
                      title="Clear file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Upload Progress Bar */}
                {uploading && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-blue-700 font-medium flex items-center gap-1.5">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        Uploading & parsing with PyMuPDF...
                      </span>
                      <span className="text-blue-700 font-bold">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${Math.max(5, uploadProgress)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Upload Success Status */}
                {uploadSuccess && !uploading && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Document uploaded & parsed successfully</span>
                    </div>
                    <p className="text-[11px] text-emerald-700">
                      PyMuPDF extracted {uploadMeta?.character_count?.toLocaleString()} characters
                      {uploadMeta?.page_count ? ` across ${uploadMeta.page_count} page(s)` : ''}.
                    </p>
                    {uploadMeta?.text_preview && (
                      <div className="mt-2 p-2 bg-white/80 rounded border border-emerald-200/60 font-mono text-[10px] text-slate-700 line-clamp-2">
                        {uploadMeta.text_preview}
                      </div>
                    )}
                  </div>
                )}

                {/* Retry Button if Error */}
                {errorMessage && !uploading && (
                  <div className="pt-1">
                    <button
                      onClick={handleRetryUpload}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Retry Upload</span>
                    </button>
                  </div>
                )}

                {/* Switch File Link */}
                {!uploading && (
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-200">
                    <label className="text-[11px] text-blue-600 font-semibold cursor-pointer hover:underline">
                      Choose a different file
                      <input
                        type="file"
                        accept=".pdf,.txt"
                        onChange={handleFileChange}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>
            )}
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
                disabled={uploading || analyzing}
                className="text-xs text-blue-600 font-semibold hover:underline disabled:opacity-50"
              >
                Load Sample
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Review or edit extracted discharge text before executing AI agents.
            </p>

            <textarea
              rows={11}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              disabled={uploading}
              className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden disabled:opacity-60"
              placeholder="Paste discharge note contents here or upload a document..."
            />
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              {rawText.length} characters
            </span>
            <button
              onClick={handleAnalyze}
              disabled={uploading || analyzing || !rawText.trim()}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-2xs disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
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
