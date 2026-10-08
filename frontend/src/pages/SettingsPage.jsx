import React, { useState, useEffect } from 'react';
import {
  Settings,
  ShieldCheck,
  CheckCircle2,
  Bell,
  Lock,
  User,
  Database,
  Globe,
  Info,
  Edit2,
  Save,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SettingsPage() {
  const { patient, updatePatientDetails } = useAuth();

  const [editName, setEditName] = useState(patient?.name || 'Alex Johnson');
  const [editAge, setEditAge] = useState(patient?.age || 52);
  const [editHospital, setEditHospital] = useState(patient?.hospital || 'Synthetic General Hospital');
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (patient) {
      setEditName(patient.name);
      setEditAge(patient.age);
      setEditHospital(patient.hospital);
    }
  }, [patient]);

  const handleSavePatient = async (e) => {
    e.preventDefault();
    await updatePatientDetails({
      name: editName.trim(),
      age: parseInt(editAge) || 52,
      hospital: editHospital.trim()
    });
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const [notifications, setNotifications] = useState({
    sms: true,
    email: true,
    appointmentReminders: true,
    reviewAlerts: true,
  });

  const responsibleAiPrinciples = [
    'Synthetic/public data only — no real patient or PHI data used',
    'No diagnosis — system never evaluates or diagnoses diseases',
    'No treatment recommendations — clinical care stays with doctors',
    'No medication changes — dosages and medications never altered',
    'Original instructions preserved — verbatim fidelity guaranteed',
    'Unclear information escalated — automated pauses on ambiguity',
    'Human review available — clinical decision-maker always in the loop',
    'Provider matches are not guarantees — synthetic availability caveats',
    'AI outputs include source references — full document traceability',
  ];

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-8 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Settings & Governance
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Patient coordination profile, notifications, and Responsible AI safety policies.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 text-xs font-semibold shadow-xs">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Patient information updated! Name changed to "{patient?.name}" across the entire website.</span>
        </div>
      )}

      {/* Grid: Profile & Notifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Card (Interactive / Editable) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Patient Profile</h3>
                <p className="text-xs text-slate-500">Synthetic demographic parameters</p>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5 text-slate-500" />
              <span>{isEditing ? 'Cancel' : 'Edit Name'}</span>
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleSavePatient} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Patient Full Name:
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium text-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Age:
                </label>
                <input
                  type="number"
                  value={editAge}
                  onChange={(e) => setEditAge(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium text-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Discharging Facility:
                </label>
                <input
                  type="text"
                  value={editHospital}
                  onChange={(e) => setEditHospital(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium text-slate-900 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-medium text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Full Name</span>
                <span className="font-bold text-slate-900 text-sm">{patient?.name || 'Alex Johnson'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Age & Gender</span>
                <span className="font-bold text-slate-800">{patient?.age || 52} Years • {patient?.gender || 'Male'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Medical Record Number</span>
                <span className="font-mono font-bold text-slate-800">{patient?.mrn || 'SYN-883921'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Language Setting</span>
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  English Only
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Discharging Facility</span>
                <span className="font-bold text-slate-800">{patient?.hospital || 'Synthetic General Hospital'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Notification Preferences</h3>
              <p className="text-xs text-slate-500">Care alerts and reminder channels</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            {Object.entries({
              sms: 'SMS Text Reminders for Scheduled Labs',
              email: 'Email Digest of Care Plan Timeline',
              appointmentReminders: '24-Hour Follow-Up Appointment Alerts',
              reviewAlerts: 'Immediate Human Review Escalation Notifications',
            }).map(([key, label]) => (
              <label
                key={key}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                <span className="text-slate-700 font-medium">{label}</span>
                <input
                  type="checkbox"
                  checked={notifications[key]}
                  onChange={() =>
                    setNotifications({ ...notifications, [key]: !notifications[key] })
                  }
                  className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
                />
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Synthetic Data Mode Banner (Section 24) */}
      <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Database className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-emerald-950">
              Synthetic Data Mode Active
            </h4>
            <p className="text-xs text-emerald-800">
              All clinical records, doctor profiles, and dates are computer-generated for testing and safety validation.
            </p>
          </div>
        </div>
        <span className="px-3 py-1 bg-white text-emerald-800 rounded-lg text-xs font-bold border border-emerald-300 shadow-2xs">
          ENFORCED
        </span>
      </div>

      {/* RESPONSIBLE AI SECTION (Section 23 - Crucial Requirement) */}
      <div className="bg-white p-6 lg:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Responsible AI Principles & Safety Boundaries
            </h2>
            <p className="text-xs text-slate-500">
              CareFlow AI operates strictly within bounded administrative and coordination limits.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {responsibleAiPrinciples.map((principle, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 flex items-start gap-2.5 text-xs text-slate-800 font-medium"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{principle}</span>
            </div>
          ))}
        </div>

        <div className="p-4 bg-sky-50/60 rounded-xl border border-sky-100 text-xs text-sky-900 space-y-1">
          <strong className="block font-bold">Clinical Disclaimer:</strong>
          CareFlow AI is an organizational coordination tool designed to assist patients in understanding and tracking their discharge orders. It does not replace the professional judgment of licensed physicians, nurses, or pharmacists.
        </div>
      </div>
    </div>
  );
}
