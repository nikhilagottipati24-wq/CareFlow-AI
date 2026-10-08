import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  Calendar,
  UserCheck,
  AlertTriangle,
  Activity,
  Settings,
  UploadCloud,
  ShieldCheck,
  User,
  Edit2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ reviewCount = 0 }) {
  const navigate = useNavigate();
  const { patient, getInitials, openNameModal } = useAuth();
  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/discharge', label: 'Discharge Summary', icon: FileText },
    { to: '/tasks', label: 'Tasks', icon: CheckSquare },
    { to: '/timeline', label: 'Timeline', icon: Calendar },
    { to: '/providers', label: 'Providers', icon: UserCheck },
    {
      to: '/review-center',
      label: 'Review Center',
      icon: AlertTriangle,
      badge: reviewCount > 0 ? reviewCount : null,
      badgeColor: 'bg-rose-500 text-white'
    },
    { to: '/activity', label: 'AI Activity', icon: Activity },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-sky-200">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-900 tracking-tight leading-none">
              CareFlow AI
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Post-Discharge Coordinator
            </p>
          </div>
        </div>

        {/* Quick Action Upload CTA */}
        <NavLink
          to="/upload"
          className={({ isActive }) =>
            `mt-4 flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
              isActive
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-100'
            }`
          }
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload Summary</span>
        </NavLink>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 py-2">
          Care Coordination
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Patient Card & Synthetic Data Indicator */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/70 space-y-3">
        {/* Active Patient info (Dynamic) */}
        <div
          onClick={openNameModal}
          className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200/80 text-xs shadow-2xs hover:border-sky-300 hover:shadow-xs transition-all cursor-pointer group"
          title="Click to change patient name"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-teal-400 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              {getInitials(patient?.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-800 truncate group-hover:text-sky-700 transition-colors" title={patient?.name}>
                {patient?.name || 'Alex Johnson'}
              </p>
              <p className="text-slate-500 text-[11px] truncate">
                Age {patient?.age || 52} • {patient?.gender || 'Patient'}
              </p>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              openNameModal();
            }}
            className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors shrink-0"
            title="Edit Patient Name"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>

        {/* Synthetic Mode Indicator (Section 7) */}
        <div className="flex items-center justify-between px-2 py-1.5 rounded-md bg-emerald-50 border border-emerald-200/60 text-xs text-emerald-800 font-medium">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Synthetic Data Mode</span>
          </div>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        </div>
      </div>
    </aside>
  );
}
