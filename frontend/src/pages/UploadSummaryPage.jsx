import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  FileText,
  FileUp,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Layers,
  Check,
} from 'lucide-react';
import { useCareFlow } from '../context/CareFlowContext';

export const UploadSummaryPage = () => {
  const { startAIAnalysis, showToast } = useCareFlow();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'paste' | 'scenarios'
  const [selectedFile, setSelectedFile] = useState(null);
  const [pastedText, setPastedText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // 5 Synthetic demo scenarios for 1-click loading
  const demoScenarios = [
    {
      id: 'scenario_1',
      title: 'Scenario 1 – Normal Discharge Plan',
      desc: 'Complete instructions with clear dates, medication, lab tests, and care instructions.',
      tag: 'Standard Flow',
      tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      id: 'scenario_2',
      title: 'Scenario 2 – Multiple Follow-ups & Referrals',
      desc: 'Multiple specialist clinics, physical rehab referral, and serial echo tests.',
      tag: 'Complex Care',
      tagColor: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    {
      id: 'scenario_3',
      title: 'Scenario 3 – Ambiguous Instructions',
      desc: 'Omitted follow-up date and unspecified medication duration. Demonstrates Needs Review.',
      tag: 'Human Review Trigger',
      tagColor: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      id: 'scenario_4',
      title: 'Scenario 4 – Conflicting Instructions',
      desc: 'Contradictory return dates (1-week nursing note vs 2-week surgical order).',
      tag: 'Discrepancy Trigger',
      tagColor: 'bg-rose-50 text-rose-700 border-rose-200',
    },
    {
      id: 'scenario_5',
      title: 'Scenario 5 – Clinically Sensitive Inquiry',
      desc: 'Patient question about stopping medication and bleeding symptoms. Enforces AI safety boundary.',
      tag: 'Safety Escalation',
      tagColor: 'bg-rose-50 text-rose-700 border-rose-200',
    },
  ];

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (activeTab === 'upload' && !selectedFile) {
      showToast('Please select or drop a discharge summary file (PDF or TXT)', 'error');
      return;
    }
    if (activeTab === 'paste' && !pastedText.trim()) {
      showToast('Please paste a discharge summary text into the box', 'error');
      return;
    }

    if (activeTab === 'upload' && selectedFile) {
      // Read file text
      const reader = new FileReader();
      reader.onload = async (event) => {
        const textContent = event.target.result;
        await startAIAnalysis({
          rawText: typeof textContent === 'string' ? textContent : 'Synthetic PDF Discharge Summary content',
          fileName: selectedFile.name,
        });
      };
      if (selectedFile.name.endsWith('.txt')) {
        reader.readAsText(selectedFile);
      } else {
        // For PDF, pass file name and execute
        await startAIAnalysis({
          rawText: '',
          fileName: selectedFile.name,
        });
      }
    } else if (activeTab === 'paste') {
      await startAIAnalysis({
        rawText: pastedText,
        fileName: 'Pasted_Discharge_Summary.txt',
      });
    }
  };

  const handleSelectScenario = async (scenarioId) => {
    await startAIAnalysis({
      scenarioId: scenarioId,
      fileName: `Discharge_Summary_${scenarioId}.txt`,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Title & Subtitle matching Section 9 */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-healthcare-700 bg-healthcare-50 px-2.5 py-1 rounded-md border border-healthcare-100">
          Agentic Document Ingestion
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
          Upload Discharge Summary
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          Upload a synthetic discharge summary and we'll organize the follow-up instructions for you.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center">
        <div className="inline-flex p-1 bg-slate-200/70 rounded-xl">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'upload'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            File Upload (PDF / TXT)
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'paste'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Paste Discharge Summary
          </button>
          <button
            onClick={() => setActiveTab('scenarios')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'scenarios'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Preloaded Synthetic Scenarios (5)
          </button>
        </div>
      </div>

      {/* Tab 1: File Upload */}
      {activeTab === 'upload' && (
        <div className="p-8 bg-white rounded-3xl border border-slate-200/80 shadow-2xs space-y-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer border-2 border-dashed rounded-2xl p-10 text-center transition-all ${
              isDragging
                ? 'border-healthcare-500 bg-healthcare-50/50 scale-[0.99]'
                : selectedFile
                ? 'border-emerald-400 bg-emerald-50/30'
                : 'border-slate-300 hover:border-healthcare-400 hover:bg-slate-50/50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.txt"
              className="hidden"
            />

            <div className="flex flex-col items-center justify-center">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-healthcare-50 text-healthcare-600 mb-4 border border-healthcare-100 shadow-sm">
                <FileUp className="w-7 h-7" />
              </div>

              {selectedFile ? (
                <div>
                  <p className="text-sm font-bold text-slate-900">{selectedFile.name}</p>
                  <p className="text-xs text-emerald-600 mt-1 font-semibold flex items-center justify-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Ready for AI Analysis ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}
                    className="mt-3 text-xs text-rose-600 hover:underline"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-base font-bold text-slate-800">
                    Drop your discharge summary here
                  </p>
                  <p className="text-xs text-slate-400 mt-1">or</p>
                  <button
                    type="button"
                    className="mt-2 px-4 py-2 rounded-lg bg-healthcare-50 text-healthcare-700 text-xs font-bold hover:bg-healthcare-100 transition-colors"
                  >
                    Browse Files
                  </button>
                  <p className="text-[11px] text-slate-400 mt-4">Supported: PDF / TXT</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Zero PHI processed. Synthetic healthcare testing only.</span>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={!selectedFile}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-healthcare-600 hover:bg-healthcare-700 text-white font-bold text-xs shadow-sm shadow-healthcare-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Analyze Summary</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Paste Summary */}
      {activeTab === 'paste' && (
        <div className="p-8 bg-white rounded-3xl border border-slate-200/80 shadow-2xs space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Paste Discharge Summary
            </label>
            <textarea
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste hospital discharge instructions, medication list, appointment notes, or warning sign protocols..."
              rows={12}
              className="w-full p-4 text-xs font-mono border border-slate-200 rounded-2xl focus:ring-2 focus:ring-healthcare-500 focus:outline-none bg-slate-50/50 text-slate-800 leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>English only. Instructions will be parsed verbatim.</span>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={!pastedText.trim()}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-healthcare-600 hover:bg-healthcare-700 text-white font-bold text-xs shadow-sm shadow-healthcare-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Analyze Summary</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Preloaded Synthetic Scenarios */}
      {activeTab === 'scenarios' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-sky-50 border border-sky-100 text-xs text-sky-900 leading-relaxed">
            Click any test scenario below to immediately trigger the multi-agent orchestration pipeline.
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            {demoScenarios.map((sc) => (
              <div
                key={sc.id}
                onClick={() => handleSelectScenario(sc.id)}
                className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:border-healthcare-400 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${sc.tagColor}`}>
                      {sc.tag}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-healthcare-700 transition-colors">
                      {sc.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 max-w-xl">{sc.desc}</p>
                </div>

                <button
                  type="button"
                  className="px-4 py-2 rounded-xl bg-slate-100 group-hover:bg-healthcare-600 group-hover:text-white text-slate-700 text-xs font-bold transition-all shrink-0 ml-4"
                >
                  Load & Run Pipeline →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
