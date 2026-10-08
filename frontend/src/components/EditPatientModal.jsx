import React, { useState, useEffect } from 'react';
import { X, User, Check, Sparkles, Building2, Stethoscope, Calendar, RefreshCw } from 'lucide-react';
import { useCareFlow } from '../context/CareFlowContext';

const DEMO_PRESETS = [
  { name: 'Alex Johnson', age: 52, gender: 'Male', hospital: 'Synthetic General Hospital', primary_diagnosis: 'Acute Anterior STEMI (Post-PCI Status)' },
  { name: 'Elena Rostova', age: 64, gender: 'Female', hospital: 'St. Jude Heart Institute', primary_diagnosis: 'Congestive Heart Failure Exacerbation' },
  { name: 'Marcus Chen', age: 45, gender: 'Male', hospital: 'City Medical Center', primary_diagnosis: 'Post-Coronary Artery Bypass Graft (CABG)' },
  { name: 'Sarah Miller', age: 38, gender: 'Female', hospital: 'Metropolitan General Hospital', primary_diagnosis: 'Acute Pericarditis Recovery' },
];

export const EditPatientModal = () => {
  const { patient, updatePatient, editPatientModal, closeEditPatientModal } = useCareFlow();
  const { isOpen } = editPatientModal;

  const [formData, setFormData] = useState({
    name: '',
    age: 52,
    gender: 'Male',
    hospital: '',
    primary_diagnosis: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Sync form state when modal opens or patient changes
  useEffect(() => {
    if (patient) {
      setFormData({
        name: patient.name || '',
        age: patient.age || 52,
        gender: patient.gender || 'Male',
        hospital: patient.hospital || 'Synthetic General Hospital',
        primary_diagnosis: patient.primaryDiagnosis || patient.primary_diagnosis || '',
      });
      setError('');
    }
  }, [patient, isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        closeEditPatientModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeEditPatientModal]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'age' ? (value === '' ? '' : parseInt(value, 10) || 0) : value,
    }));
    if (error) setError('');
  };

  const handleApplyPreset = (preset) => {
    setFormData({
      name: preset.name,
      age: preset.age,
      gender: preset.gender,
      hospital: preset.hospital,
      primary_diagnosis: preset.primary_diagnosis,
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Patient name is required');
      return;
    }
    const ageNum = Number(formData.age);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 125) {
      setError('Please enter a valid age between 1 and 125');
      return;
    }

    setIsSubmitting(true);
    try {
      await updatePatient({
        name: formData.name.trim(),
        age: ageNum,
        gender: formData.gender,
        hospital: formData.hospital.trim(),
        primary_diagnosis: formData.primary_diagnosis.trim(),
      });
      closeEditPatientModal();
    } catch (err) {
      setError('Failed to update patient. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-healthcare-600 text-white shadow-sm shadow-healthcare-200">
              <User className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-healthcare-700">
                Patient Management
              </span>
              <h3 className="text-base font-bold text-slate-900">Edit Patient Details</h3>
            </div>
          </div>
          <button
            onClick={closeEditPatientModal}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Preview Card */}
        <div className="px-6 pt-5 pb-1">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-healthcare-100 text-healthcare-700 flex items-center justify-center font-bold text-xs">
                {(formData.name || 'P')[0]?.toUpperCase()}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <span>{formData.name || 'Unnamed Patient'}</span>
                  <span className="text-[11px] font-normal text-slate-500">
                    ({formData.age || '—'} {formData.gender?.[0] || 'M'})
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                    Live Preview
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 truncate max-w-[280px]">
                  {formData.hospital || 'Hospital'} • {formData.primary_diagnosis || 'Post-discharge'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="px-6 pt-3 pb-1">
          <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
            Quick Demo Presets:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {DEMO_PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border transition-all ${
                  formData.name === preset.name && formData.age === preset.age
                    ? 'bg-healthcare-50 border-healthcare-300 text-healthcare-700 font-semibold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {preset.name} ({preset.age})
              </button>
            ))}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Full Name Input */}
            <div className="sm:col-span-2 space-y-1">
              <label htmlFor="patient-name-input" className="block font-semibold text-slate-700">
                Patient Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="patient-name-input"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Alex Johnson"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-healthcare-500/20 focus:border-healthcare-600 transition-all font-medium text-xs"
                />
              </div>
            </div>

            {/* Age Input */}
            <div className="space-y-1">
              <label htmlFor="patient-age-input" className="block font-semibold text-slate-700">
                Age (Years) <span className="text-rose-500">*</span>
              </label>
              <input
                id="patient-age-input"
                name="age"
                type="number"
                min="1"
                max="125"
                required
                value={formData.age}
                onChange={handleChange}
                placeholder="e.g. 52"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-healthcare-500/20 focus:border-healthcare-600 transition-all font-medium text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Gender Select */}
            <div className="space-y-1">
              <label htmlFor="patient-gender-input" className="block font-semibold text-slate-700">
                Gender
              </label>
              <select
                id="patient-gender-input"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-healthcare-500/20 focus:border-healthcare-600 transition-all font-medium text-xs bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-Binary">Non-Binary</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Discharging Facility */}
            <div className="space-y-1">
              <label htmlFor="patient-hospital-input" className="block font-semibold text-slate-700">
                Discharging Facility / Hospital
              </label>
              <input
                id="patient-hospital-input"
                name="hospital"
                type="text"
                value={formData.hospital}
                onChange={handleChange}
                placeholder="e.g. Synthetic General Hospital"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-healthcare-500/20 focus:border-healthcare-600 transition-all font-medium text-xs"
              />
            </div>
          </div>

          {/* Primary Diagnosis */}
          <div className="space-y-1">
            <label htmlFor="patient-diagnosis-input" className="block font-semibold text-slate-700">
              Primary Diagnosis / Condition
            </label>
            <input
              id="patient-diagnosis-input"
              name="primary_diagnosis"
              type="text"
              value={formData.primary_diagnosis}
              onChange={handleChange}
              placeholder="e.g. Acute Anterior STEMI (Post-PCI Status)"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-healthcare-500/20 focus:border-healthcare-600 transition-all font-medium text-xs"
            />
          </div>

          {/* Explanatory note */}
          <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
            Changes to the patient name and age update globally across the top navigation chip, care timeline, dashboard greeting, and clinical records.
          </p>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={closeEditPatientModal}
              className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2 font-semibold text-white bg-healthcare-600 hover:bg-healthcare-700 active:scale-98 rounded-xl shadow-sm shadow-healthcare-200 transition-all text-xs disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
