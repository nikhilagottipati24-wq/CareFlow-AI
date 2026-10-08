import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  Upload,
  AlertTriangle,
  User,
  ShieldAlert,
  ChevronDown,
  Layers,
  Pencil,
} from 'lucide-react';
import { useCareFlow } from '../context/CareFlowContext';

export const TopNav = ({ onToggleSidebar }) => {
  const { patient, counts, activeScenario, loadScenario, openEditPatientModal } = useCareFlow();
  const navigate = useNavigate();

  const handleScenarioChange = (e) => {
    const val = e.target.value;
    loadScenario(val);
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-slate-500 rounded-lg lg:hidden hover:bg-slate-100 focus:outline-none"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Patient header chip matching Section 22 - Clickable to edit */}
        <button
          type="button"
          onClick={openEditPatientModal}
          title="Click to edit patient name, age, or hospital"
          className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-100/80 hover:bg-slate-200/70 border border-slate-200 hover:border-healthcare-300 text-xs transition-all group text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-healthcare-500/20"
        >
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-200 group-hover:bg-healthcare-100 text-slate-700 group-hover:text-healthcare-700 transition-colors">
            <User className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
              <span className="group-hover:text-healthcare-700 transition-colors">{patient.name}</span>
              <span className="text-[11px] font-normal text-slate-500">
                ({patient.age} {patient.gender ? patient.gender[0] : 'M'})
              </span>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 text-[10px] font-medium rounded bg-white/80 border border-slate-200 group-hover:border-healthcare-300 text-slate-500 group-hover:text-healthcare-700 transition-colors">
                <Pencil className="w-2.5 h-2.5" />
                <span>Edit</span>
              </span>
            </div>
            <div className="text-[10px] text-slate-500">
              {patient.hospital} • Discharged {patient.dischargeDate || patient.discharge_date}
            </div>
          </div>
        </button>

        {/* Prominent Demo Data Badge */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          SYNTHETIC DEMO DATA
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Scenario Switcher Dropdown */}
        <div className="hidden md:flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-slate-400" />
          <select
            value={activeScenario}
            onChange={handleScenarioChange}
            className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-healthcare-500"
          >
            <option value="scenario_1">Scenario 1: Normal Plan</option>
            <option value="scenario_2">Scenario 2: Multiple Follow-ups</option>
            <option value="scenario_3">Scenario 3: Ambiguous (Needs Review)</option>
            <option value="scenario_4">Scenario 4: Conflicting Dates</option>
            <option value="scenario_5">Scenario 5: Clinically Sensitive</option>
          </select>
        </div>

        {/* Review Center Alert Button */}
        {counts.needsReview > 0 && (
          <Link
            to="/reviews"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold hover:bg-rose-100 transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span className="hidden sm:inline">Review Required:</span>
            <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[10px] font-bold">
              {counts.needsReview}
            </span>
          </Link>
        )}

        {/* Upload Summary CTA Button */}
        <Link
          to="/upload"
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white transition-all rounded-lg bg-healthcare-600 hover:bg-healthcare-700 shadow-sm shadow-healthcare-200 active:scale-95"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Summary</span>
        </Link>
      </div>
    </header>
  );
};
