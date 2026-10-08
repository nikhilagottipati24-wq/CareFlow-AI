import React, { useEffect, useState } from 'react';
import {
  UserCheck,
  Search,
  MapPin,
  Building2,
  Phone,
  Star,
  ShieldAlert,
  Info,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { getProviders } from '../api';

const SPECIALTIES = ['All', 'Cardiology', 'Endocrinology', 'Nephrology', 'Orthopedics', 'Pulmonology', 'Primary Care'];
const LOCATIONS = ['All', 'Chennai', 'Bangalore', 'Hyderabad'];

export default function ProvidersPage() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [searchFacility, setSearchFacility] = useState('');
  const [selectedProviderModal, setSelectedProviderModal] = useState(null);

  const fetchProviders = async () => {
    try {
      const data = await getProviders(selectedSpecialty, selectedLocation, searchFacility);
      setProviders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, [selectedSpecialty, selectedLocation, searchFacility]);

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header (Section 14) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Care Provider Finder
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Find potential synthetic provider matches for follow-up needs.
          </p>
        </div>

        <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 border border-sky-200">
          Agent 6 Provider Directory
        </span>
      </div>

      {/* Mandatory Healthcare Disclaimer Banner (Section 14) */}
      <div className="p-4 bg-amber-50/80 border border-amber-300 rounded-2xl flex items-start gap-3 shadow-xs">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <strong className="block font-bold mb-0.5">
            Synthetic Matching Disclaimer:
          </strong>
          These are potential matches based on synthetic data and do not guarantee provider availability, network participation, clinical suitability, or clinical appropriateness. CareFlow AI never presents doctor matches as guaranteed.
        </div>
      </div>

      {/* Filter & Search Bar (Section 14) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Specialty Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Filter by Specialty:
            </label>
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
            >
              {SPECIALTIES.map((sp) => (
                <option key={sp} value={sp}>{sp}</option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Filter by Location:
            </label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
            >
              {LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          {/* Facility Search */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Search Facility Name:
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Heart Center, General Hospital..."
                value={searchFacility}
                onChange={(e) => setSearchFacility(e.target.value)}
                className="w-full text-xs p-2.5 pl-8 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
            </div>
          </div>
        </div>
      </div>

      {/* Provider Cards Grid (Section 14) */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">Loading synthetic providers...</div>
      ) : providers.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-2">
          <p className="text-sm font-bold text-slate-700">No matching providers found</p>
          <p className="text-xs text-slate-400">Try broadening your search filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {providers.map((p) => (
            <div
              key={p.id}
              className="bg-white p-5 rounded-2xl border border-slate-200/90 hover:border-sky-300 transition-all shadow-xs space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header Badge */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Synthetic Provider
                  </span>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{p.rating}</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    {p.name}
                  </h3>
                  <p className="text-xs font-semibold text-sky-700 mt-0.5">
                    {p.specialty}
                  </p>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="line-clamp-1">{p.facility}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{p.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{p.phone}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Accepting new patients
                </span>
                <button
                  onClick={() => setSelectedProviderModal(p)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold transition-colors flex items-center gap-1"
                >
                  <span>View Details</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Provider Details Modal */}
      {selectedProviderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">{selectedProviderModal.name}</h3>
                <p className="text-xs text-sky-700 font-semibold">{selectedProviderModal.specialty}</p>
              </div>
              <button
                onClick={() => setSelectedProviderModal(null)}
                className="text-slate-400 hover:text-slate-600 font-semibold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-semibold uppercase text-[10px] block">Facility</span>
                <p className="font-bold text-slate-800">{selectedProviderModal.facility}</p>
              </div>
              <div>
                <span className="text-slate-400 font-semibold uppercase text-[10px] block">Address</span>
                <p className="text-slate-700">{selectedProviderModal.address}</p>
              </div>
              <div>
                <span className="text-slate-400 font-semibold uppercase text-[10px] block">Contact</span>
                <p className="text-slate-700">{selectedProviderModal.phone}</p>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-[11px]">
                Notice: Synthetic healthcare provider demonstration profile. Do not attempt real emergency or clinical scheduling.
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedProviderModal(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
