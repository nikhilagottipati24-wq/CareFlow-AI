import React, { useState, useEffect } from 'react';
import {
  Search,
  UserCheck,
  Building,
  MapPin,
  Phone,
  Mail,
  Filter,
  ShieldCheck,
  Sparkles,
  Info
} from 'lucide-react';
import { CareFlowAPI } from '../services/api';

export const ProvidersPage = () => {
  const [providers, setProviders] = useState([]);
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('all');
  const [disclaimer, setDisclaimer] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    CareFlowAPI.getProviders({ search, specialty })
      .then((res) => {
        if (res?.data) {
          setProviders(res.data.providers || []);
          setDisclaimer(res.data.disclaimer || '');
        }
      })
      .catch(console.warn)
      .finally(() => setLoading(false));
  }, [search, specialty]);

  const specialties = [
    'all',
    'Cardiology',
    'Pulmonology',
    'Internal Medicine',
    'Orthopedics & Sports Medicine',
    'Pathology & Clinical Laboratory',
    'Pharmacotherapy & Transition Care'
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Provider Finder Directory
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Synthetic outpatient specialists matched to post-discharge care plans.
        </p>
      </div>

      {/* Prominent Synthetic Healthcare Notice */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Synthetic Provider Directory Notice</p>
          <p className="mt-0.5 text-amber-800">
            {disclaimer ||
              'Provider matches are based on synthetic data and do not guarantee availability, suitability, or clinical appropriateness.'}
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative min-w-[280px] flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search provider name, clinic, or facility..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Specialty:</span>
          <select
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 text-slate-700 rounded-lg px-2.5 py-1.5 font-medium focus:ring-2 focus:ring-blue-500"
          >
            {specialties.map((s) => (
              <option key={s} value={s}>
                {s === 'all' ? 'All Specialties' : s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Provider Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {providers.map((p) => (
          <div
            key={p.id}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{p.name}</h3>
                  <span className="inline-block text-xs font-semibold text-blue-600 mt-0.5">
                    {p.specialty}
                  </span>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                  Synthetic Provider
                </span>
              </div>

              <div className="space-y-1.5 mt-3 text-xs text-slate-600">
                <p className="flex items-center gap-2">
                  <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-medium text-slate-800">{p.facility}</span>
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{p.location}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-mono">{p.phone}</span>
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">Outpatient Network</span>
              <button
                onClick={() => alert(`Simulated coordination referral created with ${p.name}.`)}
                className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
              >
                Schedule Referral
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
