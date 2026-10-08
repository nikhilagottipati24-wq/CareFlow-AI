import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  Clock,
  UserCheck,
  AlertTriangle,
  Cpu,
  Settings,
  HeartPulse,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { useCareFlow } from '../context/CareFlowContext';

export const Sidebar = ({ isOpen, onClose }) => {
  const { counts, syntheticMode } = useCareFlow();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Discharge Summary', path: '/discharge-summary', icon: FileText },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare, badge: counts.pending },
    { name: 'Timeline', path: '/timeline', icon: Clock },
    { name: 'Providers', path: '/providers', icon: UserCheck },
    {
      name: 'Review Center',
      path: '/reviews',
      icon: AlertTriangle,
      badge: counts.needsReview > 0 ? counts.needsReview : null,
      badgeColor: 'bg-rose-500 text-white',
    },
    { name: 'AI Activity', path: '/activity', icon: Cpu },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-white border-r border-slate-200 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header matching Section 7 */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-healthcare-600 text-white shadow-sm shadow-healthcare-200">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
              CareFlow AI
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-healthcare-50 text-healthcare-700 border border-healthcare-200">
                PRO
              </span>
            </h1>
            <p className="text-xs font-medium text-slate-500">Post-Discharge Coordinator</p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-healthcare-50 text-healthcare-700 shadow-sm font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                  <span>{item.name}</span>
                </div>
                {item.badge !== undefined && item.badge !== null && item.badge > 0 && (
                  <span
                    className={`inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full ${
                      item.badgeColor || 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Safety Boundary Callout */}
        <div className="px-4 py-3 mx-3 my-2 rounded-xl bg-sky-50/70 border border-sky-100">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-healthcare-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-slate-800">Coordinator Only</p>
              <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                Non-diagnostic system. Escalates clinical ambiguities to human review.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Synthetic Data Mode badge matching Section 7 */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="relative flex w-2.5 h-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full w-2.5 h-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold text-slate-700">Synthetic Data Mode</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              Active
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
