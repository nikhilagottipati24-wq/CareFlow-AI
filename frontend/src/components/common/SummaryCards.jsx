import React from 'react';
import { CheckCircle2, Clock, AlertCircle, ListTodo, Calendar, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DashboardSummaryCards = ({ summary }) => {
  const navigate = useNavigate();

  const total = summary?.total_tasks ?? 8;
  const pending = summary?.pending_tasks ?? 5;
  const completed = summary?.completed_tasks ?? 2;
  const needsReview = summary?.needs_review_tasks ?? 1;

  const cards = [
    {
      title: 'Total Tasks',
      value: total,
      subtext: 'Active care plan items',
      icon: ListTodo,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
      onClick: () => navigate('/tasks'),
    },
    {
      title: 'Pending Tasks',
      value: pending,
      subtext: 'Awaiting patient or clinic action',
      icon: Clock,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100',
      onClick: () => navigate('/tasks?status=Pending'),
    },
    {
      title: 'Completed Tasks',
      value: completed,
      subtext: 'Verified finished actions',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
      onClick: () => navigate('/tasks?status=Completed'),
    },
    {
      title: 'Needs Review',
      value: needsReview,
      subtext: 'Ambiguous or conflicting items',
      icon: AlertCircle,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-100',
      onClick: () => navigate('/reviews'),
      highlight: needsReview > 0,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.title}
            onClick={c.onClick}
            className={`p-5 rounded-xl bg-white border ${c.borderColor} shadow-2xs hover:shadow-md transition-all cursor-pointer group relative overflow-hidden`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {c.title}
                </p>
                <p className="text-3xl font-extrabold text-slate-900 mt-1">{c.value}</p>
              </div>
              <div
                className={`w-12 h-12 rounded-xl ${c.bgColor} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}
              >
                <Icon className={`w-6 h-6 ${c.iconColor}`} />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2 font-medium">{c.subtext}</p>
          </div>
        );
      })}
    </div>
  );
};

export const AnalyticsSummaryCards = ({ summary }) => {
  const navigate = useNavigate();

  const total = summary?.total_tasks ?? 8;
  const completionRate = summary?.completion_rate ?? 25.0;
  const upcomingFollowups = summary?.upcoming_followups ?? 5;
  const openReviewItems = summary?.open_review_items ?? 1;

  const cards = [
    {
      title: 'Total Tasks',
      value: total,
      subtext: 'Current care plan records',
      icon: ListTodo,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      onClick: () => navigate('/tasks'),
    },
    {
      title: 'Completion Rate',
      value: `${completionRate}%`,
      subtext: 'Tasks marked completed',
      icon: TrendingUp,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      onClick: () => navigate('/tasks?status=Completed'),
    },
    {
      title: 'Upcoming Follow-ups',
      value: upcomingFollowups,
      subtext: 'Scheduled next 14 days',
      icon: Calendar,
      iconColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      onClick: () => navigate('/timeline'),
    },
    {
      title: 'Open Review Items',
      value: openReviewItems,
      subtext: 'Unresolved clinical flags',
      icon: AlertCircle,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-50',
      onClick: () => navigate('/reviews'),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.title}
            onClick={c.onClick}
            className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {c.title}
                </p>
                <p className="text-3xl font-extrabold text-slate-900 mt-1">{c.value}</p>
              </div>
              <div
                className={`w-12 h-12 rounded-xl ${c.bgColor} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}
              >
                <Icon className={`w-6 h-6 ${c.iconColor}`} />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2 font-medium">{c.subtext}</p>
          </div>
        );
      })}
    </div>
  );
};
