import React, { useState } from 'react';
import {
  UserCheck,
  Search,
  MapPin,
  Building,
  ShieldCheck,
  Phone,
  AlertCircle,
  ExternalLink,
  Filter,
} from 'lucide-react';
import { useCareFlow } from '../context/CareFlowContext';

export const ProvidersPage = () => {
  const { providers, showToast } = useCareFlow();

  const [specialtyFilter, setSpecialtyFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState(null);

  const specialties = ['All', 'Cardiology', 'Endocrinology', 'Nephrology', 'Diagnostic Pathology & Blood Testing'];
  const locations = ['All', 'Chennai', 'Central District', 'Metro Central'];

  const filteredProviders = providers.filter((prov) => {
    const matchesSpec =
      specialtyFilter === 'All' ||
      prov.specialty.toLowerCase().includes(specialtyFilter.toLowerCase());

    const matchesLoc =
      locationFilter === 'All' ||
      prov.location.toLowerCase().includes(locationFilter.toLowerCase());

    const matchesSearch =
      prov.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prov.facility.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prov.specialty.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSpec && matchesLoc && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header matching Section 14 */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-healthcare-700 bg-healthcare-50 px-2.5 py-1 rounded-md border border-healthcare-100">
          Synthetic Care Directory
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          Care Provider Finder
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Find potential synthetic provider matches for follow-up needs.
        </p>
      </div>

      {/* Mandatory Disclaimer matching Section 14 */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/90 text-xs text-amber-900 flex items-start gap-3 shadow-2xs">
        <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
        <p className="leading-relaxed">
          <strong>Mandatory Healthcare Disclaimer:</strong> Provider matches are based on synthetic data and
          do not guarantee provider availability, suitability, or clinical appropriateness. CareFlow AI does not endorse
          or certify any individual medical practitioner.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search Query */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Search Doctor or Facility
          </label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. Arun Kumar, Cardiology..."
              className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-healthcare-500"
            />
          </div>
        </div>

        {/* Specialty Filter */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Required Specialty
          </label>
          <select
            value={specialtyFilter}
            onChange={(e) => setSpecialtyFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-healthcare-500 text-slate-700"
          >
            {specialties.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Location Filter */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Location
          </label>
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-healthcare-500 text-slate-700"
          >
            {locations.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Provider Cards matching Section 14 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProviders.map((provider) => (
          <div
            key={provider.id}
            className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-healthcare-300 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Top badge */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Synthetic Provider
                </span>
                <span className="text-[11px] font-semibold text-healthcare-700">
                  {provider.specialty}
                </span>
              </div>

              {/* Doctor Name */}
              <h3 className="text-base font-bold text-slate-900">{provider.name}</h3>

              {/* Facility & Location */}
              <div className="mt-2.5 space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{provider.facility}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{provider.location}</span>
                </div>
                {provider.phone && (
                  <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                    <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{provider.phone}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">Non-binding match</span>
              <button
                onClick={() => setSelectedProvider(provider)}
                className="px-3.5 py-1.5 rounded-lg bg-healthcare-50 hover:bg-healthcare-100 text-healthcare-700 font-bold text-xs transition-colors"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Provider Details Modal */}
      {selectedProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Synthetic Provider Profile
              </span>
              <button
                onClick={() => setSelectedProvider(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">{selectedProvider.name}</h3>
              <p className="text-xs font-semibold text-healthcare-700">{selectedProvider.specialty}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2 text-slate-700">
              <p><strong>Facility:</strong> {selectedProvider.facility}</p>
              <p><strong>Location:</strong> {selectedProvider.location}</p>
              <p><strong>Synthetic Contact:</strong> {selectedProvider.phone || '+91 44 2800 1001 (Synthetic)'}</p>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 leading-relaxed">
              {selectedProvider.disclaimer || "Provider matches are based on synthetic data and do not guarantee availability, suitability, or clinical appropriateness."}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedProvider(null)}
                className="px-4 py-2 text-xs font-bold text-white bg-healthcare-600 rounded-lg hover:bg-healthcare-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
