import React, { useState } from 'react';
import { Menu, RefreshCw, User, Hospital, Sparkles, Edit2, Check, X } from 'lucide-react';
import { useCareFlow } from '../../context/CareFlowContext';

export const Header = ({ onOpenSidebar }) => {
  const { patient, activeScenario, switchScenario, refreshData, loading, updatePatient } = useCareFlow();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState(patient.name);
  const [editAge, setEditAge] = useState(patient.age);

  const scenarios = [
    { id: 'scenario-1', label: 'Scenario 1: Normal Discharge (8 Tasks: 5 Pending, 2 Completed, 1 Review)' },
    { id: 'scenario-2', label: 'Scenario 2: Multiple Follow-ups (Cardio, Pulm, PT, Labs)' },
    { id: 'scenario-3', label: 'Scenario 3: Ambiguous Instructions (Missing Date & Duration)' },
    { id: 'scenario-4', label: 'Scenario 4: Conflicting Dates (3 Days vs 2-3 Weeks)' },
    { id: 'scenario-5', label: 'Scenario 5: Clinical Escalation (Anticoagulant Safety Flag)' },
  ];

  const handleOpenEdit = () => {
    setEditName(patient.name);
    setEditAge(patient.age);
    setIsEditModalOpen(true);
  };

  const handleSavePatient = (e) => {
    e.preventDefault();
    if (!editName.trim()) return;
    const parsedAge = parseInt(editAge, 10);
    updatePatient({
      name: editName.trim(),
      age: isNaN(parsedAge) ? patient.age : parsedAge
    });
    setIsEditModalOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 lg:px-8 py-3 transition-all">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Left side: Hamburger & Patient Banner */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSidebar}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {/* Clickable Patient Badge */}
            <button
              onClick={handleOpenEdit}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 text-xs sm:text-sm font-semibold transition group cursor-pointer text-left"
              title="Click to edit patient name and age"
            >
              <User className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{patient.name}</span>
              <span className="text-blue-500 font-normal">| Age {patient.age}</span>
              <span className="flex items-center gap-1 text-[11px] text-blue-600 font-medium opacity-70 group-hover:opacity-100 ml-1">
                <Edit2 className="w-3 h-3" />
                <span className="hidden sm:inline">Edit</span>
              </span>
            </button>

            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Hospital className="w-3.5 h-3.5 text-slate-400" />
              <span>{patient.hospital}</span>
            </div>

            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
              SYNTHETIC DEMO DATA
            </span>
          </div>
        </div>

        {/* Right side: Scenario Switcher & Refresh Button */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0 hidden sm:block" />
            <select
              value={activeScenario}
              onChange={(e) => switchScenario(e.target.value)}
              className="text-xs sm:text-sm bg-slate-50 border border-slate-300 text-slate-800 rounded-lg px-2.5 py-1.5 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 max-w-[280px] sm:max-w-none truncate cursor-pointer"
              title="Select synthetic test scenario"
            >
              {scenarios.map((sc) => (
                <option key={sc.id} value={sc.id}>
                  {sc.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={refreshData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs disabled:opacity-50"
            title="Refresh shared data across application"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Edit Patient Name and Age Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-5 space-y-4 border border-slate-200 animate-scale-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                Edit Patient Profile
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePatient} className="space-y-3">
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

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
