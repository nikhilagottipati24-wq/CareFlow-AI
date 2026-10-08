import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  FileText,
  FileCheck,
  Sparkles,
  ClipboardPaste,
  ShieldAlert,
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { uploadDischargeDocument, analyzeDischargeText, getScenarios } from '../api';
import ProcessingModal from '../components/ProcessingModal';
import { useAuth } from '../context/AuthContext';
import { useReview } from '../context/ReviewContext';

export default function UploadPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { patient, updatePatientDetails } = useAuth();
  const { fetchReviews, setReviewsDirectly } = useReview();

  const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'paste'
  const [file, setFile] = useState(null);
  const [pasteText, setPasteText] = useState('');
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState('');
  const [patientName, setPatientName] = useState(patient?.name || 'Alex Johnson');
  const [patientAge, setPatientAge] = useState(patient?.age || 52);
  const [analysisResult, setAnalysisResult] = useState(null);

  useEffect(() => {
    if (patient?.name) {
      setPatientName(patient.name);
    }
    if (patient?.age) {
      setPatientAge(patient.age);
    }
  }, [patient?.name, patient?.age]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [taskCount, setTaskCount] = useState(8);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    getScenarios()
      .then((data) => {
        setScenarios(data);
        if (data.length > 0) {
          // Default to Scenario 1
          setSelectedScenarioId(data[0].id);
          setPasteText(data[0].text);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleScenarioSelect = (id) => {
    setSelectedScenarioId(id);
    const scen = scenarios.find((s) => s.id === id);
    if (scen) {
      setPasteText(scen.text);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setErrorMessage('');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setErrorMessage('');
    }
  };

  const handleAnalyze = async () => {
    setErrorMessage('');
    setIsProcessing(true);
    setIsComplete(false);

    try {
      let result;
      if (activeTab === 'upload' && file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('patient_name', patientName);
        formData.append('patient_age', patientAge);
        result = await uploadDischargeDocument(formData);
      } else {
        if (!pasteText.trim()) {
          setIsProcessing(false);
          setErrorMessage('Please paste or select a discharge summary.');
          return;
        }
        result = await analyzeDischargeText({
          raw_text: pasteText,
          scenario_id: selectedScenarioId,
          patient_name: patientName,
          patient_age: patientAge,
        });
      }

      setAnalysisResult(result);
      if (result?.reviews) {
        setReviewsDirectly(result.reviews);
      }
      if (fetchReviews) {
        await fetchReviews();
      }

      if (patientName && patientName.trim()) {
        updatePatientDetails({ name: patientName.trim(), age: patientAge });
      }

      setTaskCount(result?.tasks?.length || 0);
      // Wait for agent animation sequence to finish
      setTimeout(() => {
        setIsComplete(true);
      }, 3200);
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
      setErrorMessage(
        err.response?.data?.detail || 'Failed to process document. Please try again.'
      );
    }
  };

  return (
    <div className="flex-1 p-6 lg:p-10 max-w-5xl mx-auto w-full space-y-8">
      {/* Page Header (Section 9) */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          Multi-Agent Ingestion Pipeline
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Upload Discharge Summary
        </h1>
        <p className="text-sm text-slate-500">
          Upload a synthetic discharge summary and we'll organize the follow-up instructions for you.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 justify-center gap-8">
        <button
          onClick={() => setActiveTab('upload')}
          className={`pb-3 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'upload'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload PDF or TXT</span>
        </button>
        <button
          onClick={() => setActiveTab('paste')}
          className={`pb-3 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'paste'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <ClipboardPaste className="w-4 h-4" />
          <span>Paste Summary / Built-in Scenarios</span>
        </button>
      </div>

      {/* Tab 1: Upload Drag-and-Drop Area (Section 9) */}
      {activeTab === 'upload' && (
        <div className="space-y-6">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-sky-500 bg-white hover:bg-sky-50/20 rounded-2xl p-10 text-center cursor-pointer transition-all space-y-4 shadow-xs"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.txt"
              className="hidden"
            />
            <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div>
              <p className="text-base font-bold text-slate-800">
                Drop your discharge summary here
              </p>
              <p className="text-xs text-slate-400 mt-1">
                or <span className="text-sky-600 font-semibold underline">Browse Files</span> from your device
              </p>
              <p className="text-[11px] text-slate-400 mt-2">
                Supported formats: <strong className="font-semibold text-slate-600">PDF / TXT</strong> (Synthetic data only)
              </p>
            </div>

            {file && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span>Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
            )}
          </div>

          {/* Quick Demo File Helper */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <Info className="w-4 h-4 text-sky-600 shrink-0" />
              <span>
                Want to test with our pre-generated synthetic PDF?
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveTab('paste');
                handleScenarioSelect('scenario_1');
              }}
              className="font-semibold text-sky-600 hover:text-sky-700 underline"
            >
              Load Scenario 1 Demo Text
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Paste Discharge Summary & Scenario Presets */}
      {activeTab === 'paste' && (
        <div className="space-y-6">
          {/* 5 Synthetic Scenario Selectors */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select a Synthetic Test Scenario:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
              {scenarios.map((scen) => (
                <button
                  key={scen.id}
                  type="button"
                  onClick={() => handleScenarioSelect(scen.id)}
                  className={`text-left p-3 rounded-xl border text-xs transition-all ${
                    selectedScenarioId === scen.id
                      ? 'border-sky-500 bg-sky-50/70 text-sky-950 font-bold shadow-2xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="block text-[10px] uppercase font-semibold text-sky-600 mb-1">
                    {scen.badge}
                  </span>
                  <span className="font-bold block truncate">{scen.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Text Area */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Discharge Summary Content (Editable):
            </label>
            <textarea
              rows={11}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="Paste synthetic discharge summary text here..."
              className="w-full text-xs font-mono p-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white leading-relaxed text-slate-800"
            />
          </div>
        </div>
      )}

      {/* Patient Meta Input */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Synthetic Patient Name:
          </label>
          <input
            type="text"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Patient Age:
          </label>
          <input
            type="number"
            value={patientAge}
            onChange={(e) => setPatientAge(parseInt(e.target.value) || 52)}
            className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      {/* Analyze Button (Section 9) */}
      <div className="flex justify-center">
        <button
          onClick={handleAnalyze}
          disabled={isProcessing}
          className="px-8 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm transition-all shadow-md shadow-sky-200 flex items-center gap-2.5 disabled:opacity-50"
        >
          <Sparkles className="w-5 h-5" />
          <span>Analyze Summary</span>
        </button>
      </div>

      {/* AI Processing Screen Modal (Section 10) */}
      <ProcessingModal
        isOpen={isProcessing}
        isComplete={isComplete}
        taskCount={taskCount}
        onComplete={() => {
          setIsProcessing(false);
          const hasUnrecognized = analysisResult?.reviews?.some((r) =>
            r.issue?.toLowerCase().includes('unrecognized') || r.issue?.toLowerCase().includes('non-discharge')
          );
          if (hasUnrecognized) {
            navigate('/review-center');
          } else {
            navigate('/discharge');
          }
        }}
      />
    </div>
  );
}
