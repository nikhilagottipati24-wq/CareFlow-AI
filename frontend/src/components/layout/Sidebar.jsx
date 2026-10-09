import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  Calendar,
  UserCheck,
  AlertCircle,
  BarChart3,
  Activity,
  Settings,
  ShieldCheck,
  HeartPulse,
  X
} from 'lucide-react';
import { useCareFlow } from '../../context/CareFlowContext';

const navigationItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Discharge Summary', path: '/discharge', icon: FileText },
  { name: 'Tasks', path: '/tasks', icon: CheckSquare, badgeKey: 'pending_tasks' },
  { name: 'Timeline', path: '/timeline', icon: Calendar },
  { name: 'Providers', path: '/providers', icon: UserCheck },
  { name: 'Review Center', path: '/reviews', icon: AlertCircle, badgeKey: 'open_review_items', badgeColor: 'bg-red-500' },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'AI Activity', path: '/activity', icon: Activity },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export const Sidebar = ({ isOpen, onClose }) => {
  const { summary } = useCareFlow();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-200 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Branding */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <HeartPulse className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight leading-none">CareFlow AI</h1>
              <p className="text-xs text-blue-400 mt-1 font-medium">Post-Discharge Coordinator</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const badgeCount = item.badgeKey ? summary[item.badgeKey] : null;

            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </div>
                {badgeCount !== null && badgeCount > 0 && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full text-white font-semibold ${
                      item.badgeColor || 'bg-slate-700'
                    }`}
                  >
                    {badgeCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Responsible AI note & Synthetic Mode Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2 mb-2 text-xs text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Audit & Verification Mode</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-950/40 border border-emerald-800/50">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold text-emerald-300 tracking-wide">
              Synthetic Data Mode
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
