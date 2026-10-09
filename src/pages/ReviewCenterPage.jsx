import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  HelpCircle,
  ShieldAlert,
  RotateCcw,
  FileCheck2,
  Clock,
  ExternalLink
} from 'lucide-react';
import { useCareFlow } from '../context/CareFlowContext';

export const ReviewCenterPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { reviews, updateReview, summary, showToast } = useCareFlow();

  const [issueFilter, setIssueFilter] = useState(searchParams.get('issue_type') || 'all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReview, setSelectedReview] = useState(null);
  const [actionNotes, setActionNotes] = useState('');

  useEffect(() => {
    const it = searchParams.get('issue_type');
    if (it) setIssueFilter(it);
  }, [searchParams]);

  const handleIssueFilterChange = (val) => {
    setIssueFilter(val);
    const newParams = new URLSearchParams(searchParams);
    if (val === 'all') newParams.delete('issue_type');
    else newParams.set('issue_type', val);
    setSearchParams(newParams);
  };

  const filteredReviews = reviews.filter((r) => {
    const matchIssue =
      issueFilter === 'all' || r.issue_type.toLowerCase() === issueFilter.toLowerCase();
    const matchStatus =
      statusFilter === 'all' || r.status.toLowerCase() === statusFilter.toLowerCase();
    return matchIssue && matchStatus;
  });

  const handleAction = (review, newStatus) => {
    updateReview(review.id, newStatus, actionNotes || `Action: ${newStatus}`);
    setActionNotes('');
    setSelectedReview(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Human Review Center
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Clinical supervisor queue for ambiguous orders, missing dates, and sensitive instructions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-red-100 text-red-800">
            Open Items: <strong>{summary.open_review_items}</strong>
          </span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700">
            Total Flagged: <strong>{reviews.length}</strong>
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-slate-600 uppercase">Issue Type:</span>
          <select
            value={issueFilter}
            onChange={(e) => handleIssueFilterChange(e.target.value)}
            className="p-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium"
          >
            <option value="all">All Issue Types</option>
            <option value="Missing follow-up date">Missing follow-up date</option>
            <option value="Unclear medication instruction">Unclear medication instruction</option>
            <option value="Conflicting instructions">Conflicting instructions</option>
            <option value="Missing appointment details">Missing appointment details</option>
            <option value="Other ambiguity">Other ambiguity</option>
          </select>

          <span className="font-bold text-slate-600 uppercase ml-2">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="Open">Open</option>
            <option value="Approved">Approved</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <button
          onClick={() => {
            setIssueFilter('all');
            setStatusFilter('all');
            setSearchParams({});
          }}
          className="flex items-center gap-1 text-slate-500 hover:text-slate-800"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Filters</span>
        </button>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="p-12 bg-white rounded-xl border border-dashed border-slate-300 text-center">
            <FileCheck2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">No Review Items Matching Criteria</p>
            <p className="text-xs text-slate-500 mt-1">
              Either all items have been resolved or filters exclude the active items.
            </p>
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className={`p-5 bg-white rounded-xl border transition-all shadow-2xs space-y-3 ${
                rev.status === 'Open'
                  ? 'border-red-300 bg-red-50/10'
                  : 'border-slate-200 bg-slate-50/40'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-100 text-red-800">
                    {rev.issue_type}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      rev.priority === 'High'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {rev.priority} Priority
                  </span>
                </div>

                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded ${
                    rev.status === 'Open'
                      ? 'bg-red-500 text-white'
                      : rev.status === 'Approved'
                      ? 'bg-blue-600 text-white'
                      : rev.status === 'Resolved'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-600 text-white'
                  }`}
                >
                  {rev.status}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900">{rev.issue}</h3>
                <p className="text-xs text-slate-700 mt-1">
                  <strong>Reason for Flag:</strong> {rev.reason}
                </p>
              </div>

              {/* Original text vs AI Interpretation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                <div className="p-3 rounded-lg bg-slate-100 border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-500 uppercase text-[10px] block">
                    Original Discharge Instruction
                  </span>
                  <p className="font-mono text-slate-800 text-[11px] leading-relaxed">
                    "{rev.original_instruction}"
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-200 space-y-1">
                  <span className="font-bold text-blue-700 uppercase text-[10px] block">
                    AI-Extracted Interpretation & Safeguard
                  </span>
                  <p className="text-blue-900 text-[11px] leading-relaxed">
                    {rev.ai_interpretation}
                  </p>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 italic">
                Source Reference: {rev.source_reference}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <span className="text-[11px] text-slate-500">
                  Logged: {new Date(rev.created_at).toLocaleString()}
                  {rev.resolved_at && ` • Resolved: ${new Date(rev.resolved_at).toLocaleString()}`}
                </span>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleAction(rev, 'Approved')}
                    className="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Approve Extraction
                  </button>

                  <button
                    onClick={() => handleAction(rev, 'Resolved')}
                    className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                  >
                    Mark Resolved
                  </button>

                  <button
                    onClick={() => {
                      const notes = prompt('Enter clarification request for ordering physician:');
                      if (notes) updateReview(rev.id, 'Open', `Clarification requested: ${notes}`);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition"
                  >
                    Request Clarification
                  </button>

                  <button
                    onClick={() => handleAction(rev, 'Rejected')}
                    className="px-3 py-1.5 text-xs font-semibold bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition"
                  >
                    Reject Extraction
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
