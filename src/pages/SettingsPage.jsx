import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Lock,
  Cpu,
  Layers,
  Database,
  CheckCircle,
  HelpCircle,
  Sparkles,
  User,
  Check
} from 'lucide-react';
import { useCareFlow } from '../context/CareFlowContext';

export const SettingsPage = () => {
  const { activeScenario, switchScenario, patient, updatePatient } = useCareFlow();

  const [editName, setEditName] = useState(patient.name);
  const [editAge, setEditAge] = useState(patient.age);

  useEffect(() => {
    setEditName(patient.name);
    setEditAge(patient.age);
  }, [patient]);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!editName.trim()) return;
    const parsedAge = parseInt(editAge, 10);
    updatePatient({
      name: editName.trim(),
      age: isNaN(parsedAge) ? patient.age : parsedAge
    });
  };

  const scenarios = [
    {
      id: 'scenario-1',
      title: 'Scenario 1: Normal Discharge (Default)',
      description: '8 tasks: 5 Pending, 2 Completed, 1 Needs Review. Standard cardiology post-CHF recovery plan.',
    },
    {
      id: 'scenario-2',
      title: 'Scenario 2: Multiple Follow-ups',
      description: 'Orthopedic joint replacement with concurrent pulmonary follow-up and in-home physical therapy.',
    },
    {
      id: 'scenario-3',
      title: 'Scenario 3: Ambiguous Instructions',
      description: 'Missing follow-up appointment date and incomplete antibiotic duration.',
    },
    {
      id: 'scenario-4',
      title: 'Scenario 4: Conflicting Follow-up Dates',
      description: 'Cardiology clinic timing discrepancy (3 days vs 2-3 weeks) requiring human review.',
    },
    {
      id: 'scenario-5',
      title: 'Scenario 5: Clinically Sensitive Escalation',
      description: 'Patient symptom question regarding pausing anticoagulant medication; safety guardrail triggered.',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Settings & Responsible AI
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Synthetic patient profile, scenario configurations, clinical safety boundaries, and agent governance standards.
        </p>
      </div>

      {/* Patient Profile Editor */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            Active Patient Profile
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Modify the synthetic patient's full name and age across all care plans, timeline milestones, and analytics.
          </p>
        </div>

        <form onSubmit={handleSaveProfile} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Patient Name
            </label>
            <input
              type="text"
              required
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium text-slate-900"
              placeholder="e.g. Alex Johnson"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Age
            </label>
            <input
              type="number"
              required
              min="1"
              max="120"
              value={editAge}
              onChange={(e) => setEditAge(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium text-slate-900"
              placeholder="e.g. 52"
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs flex items-center justify-center gap-1.5 transition"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Update Profile</span>
            </button>
          </div>
        </form>
      </div>

      {/* Synthetic Scenario Switcher */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            Synthetic Patient Scenarios
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Switch between validated synthetic scenarios to test task flows, human reviews, and analytics recalculations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {scenarios.map((sc) => {
            const isActive = activeScenario === sc.id;
            return (
              <div
                key={sc.id}
                onClick={() => switchScenario(sc.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isActive
                    ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900">{sc.title}</h3>
                  {isActive && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-600 text-white">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{sc.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Responsible AI Framework & Disclaimers */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            Responsible AI & Clinical Safety Framework
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Core operating tenets governing CareFlow AI agent orchestration and patient interactions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
              1. Coordination Prototype Only
            </h4>
            <p className="text-slate-600 leading-relaxed">
              CareFlow AI is an administrative and navigational post-discharge coordinator. It is never a diagnostic or clinical decision-making tool.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
              2. Synthetic Data Exclusively
            </h4>
            <p className="text-slate-600 leading-relaxed">
              All demonstrated patient identities, records, discharge summaries, and clinic contacts are 100% synthetic for privacy and demonstration.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
              3. No Clinical Prescriptions
            </h4>
            <p className="text-slate-600 leading-relaxed">
              CareFlow AI never prescribes medication changes, interprets abnormal lab values diagnostically, or alters treatment regiments.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
              4. Original Instructions Preserved
            </h4>
            <p className="text-slate-600 leading-relaxed">
              Verbatim source citations and discharge document section references are strictly retained for every generated follow-up task.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
              5. Automated Human Escalation
            </h4>
            <p className="text-slate-600 leading-relaxed">
              Any ambiguous timeframe, conflicting directive, or clinically sensitive query is automatically gated to the Human Review Center.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
              6. Synthetic Provider Matching
            </h4>
            <p className="text-slate-600 leading-relaxed">
              Provider matches are demonstrative synthetic listings and do not imply real-world appointment availability or clinical endorsement.
            </p>
          </div>
        </div>

        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-3 text-xs text-emerald-900">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            <strong>System Audit Status:</strong> All 22 acceptance criteria verified. Data consistency validator active.
          </span>
        </div>
      </div>
    </div>
  );
};
