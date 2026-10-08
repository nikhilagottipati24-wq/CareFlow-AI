import React, { useState, useEffect } from 'react';
import {
  Settings,
  User,
  Bell,
  ShieldCheck,
  Database,
  CheckCircle2,
  Lock,
  Globe,
  RefreshCw,
  Pencil,
  Check,
  X,
} from 'lucide-react';
import { useCareFlow } from '../context/CareFlowContext';

export const SettingsPage = () => {
  const { patient, updatePatient, openEditPatientModal, syntheticMode, setSyntheticMode, loadScenario, showToast } = useCareFlow();

  const [smsReminders, setSmsReminders] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [reviewPush, setReviewPush] = useState(true);

  // Profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: patient.name || '',
    age: patient.age || 52,
    gender: patient.gender || 'Male',
    hospital: patient.hospital || '',
  });

  useEffect(() => {
    setProfileForm({
      name: patient.name || '',
      age: patient.age || 52,
      gender: patient.gender || 'Male',
      hospital: patient.hospital || '',
    });
  }, [patient]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      showToast('Patient name is required', 'error');
      return;
    }
    const ageNum = parseInt(profileForm.age, 10);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 125) {
      showToast('Please enter a valid age between 1 and 125', 'error');
      return;
    }
    await updatePatient({
      name: profileForm.name.trim(),
      age: ageNum,
      gender: profileForm.gender,
      hospital: profileForm.hospital.trim(),
    });
    setIsEditingProfile(false);
  };

  const handleResetData = () => {
    loadScenario('scenario_1');
    showToast('Demo data reset to baseline Scenario 1', 'info');
  };

  const responsibleAIChecklist = [
    'Synthetic/public data only',
    'No diagnosis',
    'No treatment recommendations',
    'No medication changes',
    'Original instructions preserved',
    'Unclear information escalated',
    'Human review available',
    'Provider matches are not guarantees',
    'AI outputs include source references',
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-healthcare-700 bg-healthcare-50 px-2.5 py-1 rounded-md border border-healthcare-100">
          Governance & Configuration
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          Settings & Responsible AI
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Patient profile, safety guardrails, notification preferences, and synthetic data controls
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Profile matching Section 24 - Editable */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-healthcare-600" />
              <h2 className="text-sm font-bold text-slate-900">Synthetic Patient Profile</h2>
            </div>
            {!isEditingProfile ? (
              <button
                type="button"
                onClick={() => setIsEditingProfile(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-healthcare-700 hover:text-healthcare-800 bg-healthcare-50 hover:bg-healthcare-100 rounded-lg border border-healthcare-200 transition-colors cursor-pointer"
              >
                <Pencil className="w-3 h-3" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
                <span>Cancel</span>
              </button>
            )}
          </div>

          {isEditingProfile ? (
            <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-600 block font-semibold mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  placeholder="e.g. Alex Johnson"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-healthcare-500/20 focus:border-healthcare-600 text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-600 block font-semibold mb-1">
                    Age <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="125"
                    required
                    value={profileForm.age}
                    onChange={(e) => setProfileForm({ ...profileForm, age: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-healthcare-500/20 focus:border-healthcare-600 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="text-slate-600 block font-semibold mb-1">Gender</label>
                  <select
                    value={profileForm.gender}
                    onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-healthcare-500/20 focus:border-healthcare-600 text-xs font-medium bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-Binary">Non-Binary</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-600 block font-semibold mb-1">Discharging Facility</label>
                <input
                  type="text"
                  value={profileForm.hospital}
                  onChange={(e) => setProfileForm({ ...profileForm, hospital: e.target.value })}
                  placeholder="e.g. Synthetic General Hospital"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-healthcare-500/20 focus:border-healthcare-600 text-xs font-medium"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-healthcare-600 hover:bg-healthcare-700 text-white rounded-lg font-semibold text-xs transition-colors shadow-sm shadow-healthcare-200 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
                <button
                  type="button"
                  onClick={openEditPatientModal}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-xs transition-colors cursor-pointer"
                  title="Open full edit dialog with presets"
                >
                  Presets & More...
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Full Name</span>
                <span className="font-semibold text-slate-800 text-sm">{patient.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block font-medium">Age & Gender</span>
                  <span className="font-semibold text-slate-800">{patient.age} • {patient.gender || 'Male'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Language</span>
                  <span className="font-semibold text-healthcare-700">English (Strictly English Only)</span>
                </div>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Discharging Facility</span>
                <span className="font-semibold text-slate-800">{patient.hospital}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Discharge Date</span>
                <span className="font-semibold text-slate-800">{patient.dischargeDate || patient.discharge_date}</span>
              </div>
            </div>
          )}
        </div>

        {/* Card 2: Notification Preferences matching Section 24 */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Bell className="w-4 h-4 text-purple-600" />
            <h2 className="text-sm font-bold text-slate-900">Notification Preferences</h2>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 cursor-pointer">
              <span className="text-slate-700 font-medium">Appointment SMS Reminders (24h prior)</span>
              <input
                type="checkbox"
                checked={smsReminders}
                onChange={(e) => setSmsReminders(e.target.checked)}
                className="w-4 h-4 accent-healthcare-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 cursor-pointer">
              <span className="text-slate-700 font-medium">Daily Fasting Lab & Pill Reminders</span>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 accent-healthcare-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 cursor-pointer">
              <span className="text-slate-700 font-medium">Human Review Status Notifications</span>
              <input
                type="checkbox"
                checked={reviewPush}
                onChange={(e) => setReviewPush(e.target.checked)}
                className="w-4 h-4 accent-healthcare-600 rounded"
              />
            </label>
          </div>
        </div>

        {/* Card 3: Responsible AI Checklist matching Section 23 */}
        <div className="md:col-span-2 p-6 sm:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-2xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-healthcare-600" />
              <div>
                <h2 className="text-base font-bold text-slate-900">Responsible AI & Clinical Safety</h2>
                <p className="text-xs text-slate-500">Strictly enforced operational boundaries</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              100% Guardrail Compliance
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {responsibleAIChecklist.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center gap-2.5 text-xs font-semibold text-slate-800"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100 text-xs text-slate-700 leading-relaxed">
            <strong>CareFlow AI Safety Pledge:</strong> This platform is designed solely to organize and clarify
            existing written discharge orders for patients and clinical care navigators. It will never provide diagnostic
            evaluations, adjust medical dosages, or replace the professional judgment of licensed physicians.
          </div>
        </div>

        {/* Card 4: Synthetic Data Mode & Reset */}
        <div className="md:col-span-2 p-6 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600" />
              <span>Synthetic Mode & Demo Data Controls</span>
            </h3>
            <p className="text-xs text-slate-500">
              This instance is running in strictly synthetic mode. Resetting restores baseline Scenario 1 values.
            </p>
          </div>

          <button
            onClick={handleResetData}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
