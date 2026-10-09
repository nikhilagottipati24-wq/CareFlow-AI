import React, { useState, useEffect, useCallback } from 'react';
import {
  Download,
  RefreshCw,
  Filter,
  RotateCcw,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileSpreadsheet,
  Info
} from 'lucide-react';
import { useCareFlow } from '../context/CareFlowContext';
import { AnalyticsSummaryCards } from '../components/common/SummaryCards';
import { TaskStatusDonutChart } from '../components/charts/TaskStatusDonutChart';
import { DailyCompletionTrendChart } from '../components/charts/DailyCompletionTrendChart';
import { TasksByCategoryBarChart } from '../components/charts/TasksByCategoryBarChart';
import { UpcomingScheduleBarChart } from '../components/charts/UpcomingScheduleBarChart';
import { WeeklyProgressStackedChart } from '../components/charts/WeeklyProgressStackedChart';
import { HumanReviewIssuesChart } from '../components/charts/HumanReviewIssuesChart';
import { AIProcessingOverviewChart } from '../components/charts/AIProcessingOverviewChart';
import { CareFlowAPI } from '../services/api';

export const AnalyticsPage = () => {
  const { summary: globalSummary, activeScenario, updateTaskStatus } = useCareFlow();

  // Filter Toolbar State
  const [dateRange, setDateRange] = useState('30d'); // '7d', '30d', 'all'
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Chart States
  const [metrics, setMetrics] = useState(globalSummary);
  const [statusDonutData, setStatusDonutData] = useState(null);
  const [completionTrendData, setCompletionTrendData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [upcomingData, setUpcomingData] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const [reviewIssuesData, setReviewIssuesData] = useState([]);
  const [aiActivityData, setAiActivityData] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const [
        sumRes,
        statusRes,
        trendRes,
        catRes,
        upRes,
        weekRes,
        revRes,
        aiRes
      ] = await Promise.all([
        CareFlowAPI.getSummary({
          date_range: dateRange,
          category: categoryFilter,
          status: statusFilter
        }),
        CareFlowAPI.getTaskStatusDistribution({ category: categoryFilter }),
        CareFlowAPI.getCompletionTrend({ date_range: dateRange }),
        CareFlowAPI.getTasksByCategory({ status: statusFilter }),
        CareFlowAPI.getUpcomingFollowups(14),
        CareFlowAPI.getWeeklyProgress(),
        CareFlowAPI.getReviewIssues(),
        CareFlowAPI.getAIActivityOverview()
      ]);

      if (sumRes?.data) setMetrics(sumRes.data);
      if (statusRes?.data) setStatusDonutData(statusRes.data);
      if (trendRes?.data) setCompletionTrendData(trendRes.data);
      if (catRes?.data) setCategoryData(catRes.data);
      if (upRes?.data) setUpcomingData(upRes.data);
      if (weekRes?.data) setWeeklyData(weekRes.data);
      if (revRes?.data) setReviewIssuesData(revRes.data);
      if (aiRes?.data) setAiActivityData(aiRes.data);
    } catch (err) {
      console.warn('Analytics loading warning:', err);
    } finally {
      setLoading(false);
    }
  }, [dateRange, categoryFilter, statusFilter, activeScenario]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const handleResetFilters = () => {
    setDateRange('30d');
    setCategoryFilter('all');
    setStatusFilter('all');
  };

  const isFiltered = dateRange !== 'all' || categoryFilter !== 'all' || statusFilter !== 'all';

  const handleExportCSV = () => {
    const url = CareFlowAPI.getExportUrl({
      category: categoryFilter,
      status: statusFilter
    });
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Page Heading & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Care Plan Analytics
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Understand care-plan progress, upcoming follow-ups, task completion, and review activity.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={loadAnalytics}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            <span>Refresh Analytics</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Report (CSV)</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <span>Filters:</span>
          </div>

          {/* Date range */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
            <button
              onClick={() => setDateRange('7d')}
              className={`px-2.5 py-1 rounded-md transition ${
                dateRange === '7d' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setDateRange('30d')}
              className={`px-2.5 py-1 rounded-md transition ${
                dateRange === '30d' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setDateRange('all')}
              className={`px-2.5 py-1 rounded-md transition ${
                dateRange === 'all' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Time
            </button>
          </div>

          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 text-slate-700 rounded-lg px-2.5 py-1.5 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          >
            <option value="all">All Categories</option>
            <option value="Medication">Medication</option>
            <option value="Appointment">Appointment</option>
            <option value="Test">Test</option>
            <option value="Referral">Referral</option>
            <option value="Care">Care</option>
            <option value="Follow-up">Follow-up</option>
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 text-slate-700 rounded-lg px-2.5 py-1.5 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Needs Review">Needs Review</option>
          </select>
        </div>

        {/* Reset Filters & Filter Status Badge */}
        <div className="flex items-center gap-2">
          {isFiltered && (
            <span className="text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Filtered View Active (CSV export respects filter)
            </span>
          )}
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 px-2 py-1 rounded hover:bg-slate-100 transition"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Analytics Summary Cards */}
      <AnalyticsSummaryCards summary={metrics} />

      {/* CHARTS ROW 1: Donut (Status Distribution) & Line (Completion Trend) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 1: TASK STATUS DISTRIBUTION */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="mb-2">
            <h2 className="text-sm font-bold text-slate-900">1. Task Status Distribution</h2>
            <p className="text-xs text-slate-500">
              Interactive distribution across Pending, Completed, and Needs Review
            </p>
          </div>
          <TaskStatusDonutChart data={statusDonutData} height={280} />
          <p className="text-[11px] text-slate-400 text-center mt-2">
            Tip: Click any segment to navigate to the filtered Tasks view.
          </p>
        </div>

        {/* CHART 2: DAILY TASK COMPLETION TREND */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">2. Task Completion Trend</h2>
              <p className="text-xs text-slate-500">
                Daily completions calculated from recorded task status timestamps
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              {dateRange === '7d' ? '7 Days' : dateRange === '30d' ? '30 Days' : 'All Time'}
            </span>
          </div>
          <DailyCompletionTrendChart data={completionTrendData} height={280} />
          <p className="text-[11px] text-slate-400 text-center mt-2">
            Verified status audit records: does not fabricate past completion events.
          </p>
        </div>
      </div>

      {/* CHARTS ROW 2: Bar (Category Breakdown) & Bar (Upcoming Schedule) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 3: TASKS BY CATEGORY */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="mb-2">
            <h2 className="text-sm font-bold text-slate-900">3. Tasks by Category</h2>
            <p className="text-xs text-slate-500">
              Categorized care plan actions across 6 clinical domains
            </p>
          </div>
          <TasksByCategoryBarChart data={categoryData} height={280} />
          <p className="text-[11px] text-slate-400 text-center mt-2">
            Tip: Click any category bar to filter the task management list.
          </p>
        </div>

        {/* CHART 4: UPCOMING FOLLOW-UP SCHEDULE */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="mb-2">
            <h2 className="text-sm font-bold text-slate-900">4. Upcoming Follow-ups (Next 14 Days)</h2>
            <p className="text-xs text-slate-500">
              Chronologically scheduled appointments, diagnostics, and coordinator check-ins
            </p>
          </div>
          <UpcomingScheduleBarChart data={upcomingData} height={280} onUpdateTaskStatus={updateTaskStatus} />
          <p className="text-[11px] text-slate-400 text-center mt-2">
            Unscheduled items are isolated separately to prevent invented dates.
          </p>
        </div>
      </div>

      {/* CHARTS ROW 3: Stacked Bar (Weekly Progress) & Horizontal Bar (Review Issues) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 5: TASK COMPLETION BY WEEK */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="mb-2">
            <h2 className="text-sm font-bold text-slate-900">5. Weekly Task Progress</h2>
            <p className="text-xs text-slate-500">
              Cumulative completed, pending, and review tasks across weekly milestones
            </p>
          </div>
          <WeeklyProgressStackedChart data={weeklyData} height={280} />
          <p className="text-[11px] text-slate-400 text-center mt-2">
            Stacked cohorts reflect verified weekly task status history.
          </p>
        </div>

        {/* CHART 6: HUMAN REVIEW ANALYTICS */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="mb-2">
            <h2 className="text-sm font-bold text-slate-900">6. Review Items by Issue Type</h2>
            <p className="text-xs text-slate-500">
              Clinical safety escalation distribution and current unresolved count
            </p>
          </div>
          <HumanReviewIssuesChart data={reviewIssuesData} height={280} />
          <p className="text-[11px] text-slate-400 text-center mt-2">
            Tip: Click an issue bar to open Review Center with that issue filter applied.
          </p>
        </div>
      </div>

      {/* CHART 7: AI WORKFLOW ACTIVITY */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="mb-4">
          <h2 className="text-sm font-bold text-slate-900">7. AI Processing Overview</h2>
          <p className="text-xs text-slate-500">
            End-to-end pipeline funnel: from document ingestion to actionable task generation & human review
          </p>
        </div>
        <AIProcessingOverviewChart data={aiActivityData} />
      </div>
    </div>
  );
};
