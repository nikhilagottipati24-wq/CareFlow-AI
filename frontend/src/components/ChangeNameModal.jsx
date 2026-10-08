import React, { useState, useEffect, useRef } from 'react';
import { X, User, Check, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ChangeNameModal({ isOpen, onClose }) {
  const { patient, updatePatientName, getInitials } = useAuth();
  const [nameInput, setNameInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setNameInput(patient?.name || 'Alex Johnson');
      setSavedSuccess(false);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 50);
    }
  }, [isOpen, patient?.name]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed) return;

    setIsSaving(true);
    try {
      await updatePatientName(trimmed);
      setSavedSuccess(true);
      setTimeout(() => {
        setIsSaving(false);
        onClose();
      }, 400);
    } catch (err) {
      console.error('Failed to update name:', err);
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-sm shadow-2xs">
              {getInitials(nameInput || patient?.name)}
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Change Patient Name</h3>
              <p className="text-xs text-slate-500">Updates across the entire website & care plan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="patient-name-input" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Full Name
            </label>
            <div className="relative">
              <input
                id="patient-name-input"
                ref={inputRef}
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Enter patient full name..."
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm font-semibold text-slate-900 placeholder:text-slate-400 transition-all shadow-2xs"
              />
              <div className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">
                {nameInput.trim() ? `${getInitials(nameInput)}` : ''}
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-500 shrink-0" />
              <span>Greeting, dashboard, instructions, and header will update immediately.</span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !nameInput.trim()}
              className={`px-5 py-2 text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 ${
                savedSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-sky-600 hover:bg-sky-700 text-white disabled:opacity-50'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{savedSuccess ? 'Updated!' : isSaving ? 'Saving...' : 'Save Name'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
