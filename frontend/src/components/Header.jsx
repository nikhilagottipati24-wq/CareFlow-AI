import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Info, AlertCircle, User, Edit2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header({ onOpenSafetyModal, reviewCount = 0 }) {
  const navigate = useNavigate();
  const { patient, getInitials, openNameModal } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
      {/* Safety Notice & Demo Banner */}
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
          <Info className="w-3.5 h-3.5 text-sky-600" />
          SYNTHETIC DEMO DATA
        </span>

        {/* Dynamic Patient indicator */}
        <button
          type="button"
          onClick={openNameModal}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer group"
          title="Click to change patient name"
        >
          <span className="w-4 h-4 rounded-full bg-sky-600 text-white flex items-center justify-center text-[9px] font-bold group-hover:scale-110 transition-transform">
            {getInitials(patient?.name)}
          </span>
          <span>Patient: <strong className="font-bold text-slate-900 group-hover:text-sky-700 transition-colors">{patient?.name || 'Alex Johnson'}</strong></span>
          <Edit2 className="w-3 h-3 text-slate-400 group-hover:text-sky-600 ml-0.5" />
        </button>

        <span className="hidden md:inline text-xs text-slate-500 font-normal">
          Non-Diagnostic Coordination System
        </span>
      </div>

      {/* Safety Boundary Check CTA & Status */}
      <div className="flex items-center gap-3">
        {reviewCount > 0 && (
          <button
            type="button"
            onClick={() => navigate('/review-center')}
            className="flex items-center gap-1.5 text-xs text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer"
            title="Open Review Center"
          >
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>{reviewCount} review {reviewCount === 1 ? 'item' : 'items'} pending</span>
          </button>
        )}

        <button
          onClick={onOpenSafetyModal}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 transition-colors shadow-2xs"
          title="Test AI clinical safety guardrails"
        >
          <ShieldAlert className="w-4 h-4 text-amber-600" />
          <span>Safety Guardrail Test</span>
        </button>
      </div>
    </header>
  );
}
