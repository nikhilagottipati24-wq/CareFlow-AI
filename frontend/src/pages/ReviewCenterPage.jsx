import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Clock,
  ShieldCheck,
  Eye,
  FileText,
  Check,
  CheckCheck,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  User,
  Info,
  Filter
} from 'lucide-react';
import { useReview } from '../context/ReviewContext';
import ReviewModal from '../components/ReviewModal';
import SourceModal from '../components/SourceModal';

export default function ReviewCenterPage() {
  const [searchParams] = useSearchParams();
  const {
    reviews,
    activeReviewCount,
    loading,
    updateReview,
    selectedReview,
    setSelectedReview,
    fetchReviews
  } = useReview();

  const [activeTab, setActiveTab] = useState('Needs Review');
  const [expandedSources, setExpandedSources] = useState({});
  const [selectedSourceItem, setSelectedSourceItem] = useState(null);

  useEffect(() => {
    if (fetchReviews) {
      fetchReviews();
    }
  }, [fetchReviews]);

  // Support deep-linking via query parameters (e.g., ?id=REV-001 or ?tab=Approved)
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
    const idParam = searchParams.get('id');
    if (idParam && reviews.length > 0) {
      const target = reviews.find(
        (r) => r.id.toUpperCase() === idParam.toUpperCase() ||
               r.id.toUpperCase().replace('-', '') === idParam.toUpperCase().replace('-', '')
      );
      if (target) {
        setSelectedReview(target);
        if (target.status) {
          setActiveTab(target.status);
        }
      }
    }
  }, [searchParams, reviews, setSelectedReview]);

  const toggleSource = (id) => {
    setExpandedSources((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleQuickAction = async (id, status) => {
    await updateReview(id, status);
  };

  const needsReviewList = reviews.filter((r) => r.status === 'Needs Review');
  const approvedList = reviews.filter((r) => r.status === 'Approved');
  const clarificationList = reviews.filter((r) => r.status === 'Needs Clarification');
  const resolvedList = reviews.filter((r) => r.status === 'Resolved');

  const displayedReviews =
    activeTab === 'Needs Review'
      ? needsReviewList
      : activeTab === 'Approved'
      ? approvedList
      : activeTab === 'Needs Clarification'
      ? clarificationList
      : activeTab === 'Resolved'
      ? resolvedList
      : reviews;

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
              Safety Guardrail Active
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">
              Clinical Clarification Queue
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
            Human Review Center
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1 max-w-3xl">
            Review unclear, ambiguous, or clinically sensitive items before they become verified care-plan actions.
          </p>
        </div>

        <div className="flex items-center gap-2.5 text-xs font-semibold shrink-0">
          <span className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-2xs">
            Total Flagged: <strong>{reviews.length}</strong>
          </span>
          <span className="px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
            Active Queue: <strong>{activeReviewCount}</strong>
          </span>
        </div>
      </div>

      {/* Safety Behavior Banner (Section 7 Requirement) */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-start gap-3 text-xs text-amber-900 shadow-xs">
        <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <div className="font-bold text-amber-950 uppercase tracking-wider text-[11px]">
            Healthcare Safety Guardrail
          </div>
          <p className="text-amber-900/90 leading-relaxed">
            Human Review is strictly for verifying extraction accuracy against the synthetic discharge summary. CareFlow AI does not provide diagnostic, treatment, or dosage modification recommendations. Original instructions are fully preserved.
          </p>
        </div>
      </div>

      {/* Unrecognized Document Alert Banner */}
      {reviews.some((r) => r.issue?.toLowerCase().includes('unrecognized') || r.issue?.toLowerCase().includes('non-discharge')) && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-xs text-rose-950 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-rose-900 uppercase tracking-wider text-[11px] flex items-center gap-2">
              <span>Unrecognized or Non-Discharge Document Flagged</span>
              <span className="bg-rose-200 text-rose-900 text-[10px] px-2 py-0.5 rounded-full font-bold">Action Required</span>
            </div>
            <p className="text-rose-900/90 leading-relaxed">
              The uploaded file does not contain standard hospital discharge summary sections (orders, medications, follow-up instructions, or attending notes). Review the item below to resolve it or re-upload a valid discharge summary.
            </p>
          </div>
        </div>
      )}

      {/* Tabs Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-slate-400 mr-1.5 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter Queue:
          </span>
          {[
            { id: 'Needs Review', label: 'Needs Review', count: needsReviewList.length, color: 'text-rose-700' },
            { id: 'Approved', label: 'Approved', count: approvedList.length, color: 'text-emerald-700' },
            { id: 'Needs Clarification', label: 'Needs Clarification', count: clarificationList.length, color: 'text-amber-700' },
            { id: 'Resolved', label: 'Resolved', count: resolvedList.length, color: 'text-indigo-700' },
            { id: 'All', label: 'All Items', count: reviews.length, color: 'text-slate-700' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-400 font-medium hidden md:block">
          Showing {displayedReviews.length} of {reviews.length} items
        </div>
      </div>

      {/* Review Items List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">Loading review items...</div>
      ) : displayedReviews.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3 shadow-xs">
          <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No Items in this View</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {activeTab === 'Needs Review'
              ? 'All review items have been resolved or clarified. Zero items currently require human review.'
              : `There are currently no items with status "${activeTab}".`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedReviews.map((item) => {
            const isHigh = item.priority === 'HIGH' || item.priority === 'High';
            const isMed = item.priority === 'MEDIUM' || item.priority === 'Medium';
            const isSourceOpen = !!expandedSources[item.id];

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs transition-all space-y-4 hover:shadow-sm ${
                  item.status === 'Needs Review'
                    ? 'border-rose-200/90'
                    : item.status === 'Approved'
                    ? 'border-emerald-200/90'
                    : item.status === 'Needs Clarification'
                    ? 'border-amber-200/90'
                    : 'border-slate-200'
                }`}
              >
                {/* Item Top Bar: ID, Priority, Patient, Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {item.id}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        isHigh
                          ? 'bg-rose-100 text-rose-800'
                          : isMed
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {item.priority} Priority
                    </span>
                    <span className="text-slate-300 hidden sm:inline">•</span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      Patient: <strong className="text-slate-800">{item.patient_name || 'Alex Johnson'}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">Status:</span>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                        item.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'Needs Clarification'
                          ? 'bg-amber-100 text-amber-800'
                          : item.status === 'Resolved'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>

                {/* Main Content: Issue and 3-Section Preview */}
                <div className="space-y-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {item.issue}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Source: {item.source_reference}
                    </p>
                  </div>

                  {/* 3 Information Blocks */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Block A: Original Instruction */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block flex items-center gap-1">
                        <FileText className="w-3 h-3 text-slate-500" />
                        Original Instruction
                      </span>
                      <p className="text-xs font-mono text-slate-800 leading-relaxed whitespace-pre-wrap">
                        "{item.original_text}"
                      </p>
                    </div>

                    {/* Block B: AI Interpretation */}
                    <div className="p-3.5 rounded-xl bg-sky-50/70 border border-sky-100 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 block">
                        AI Interpretation
                      </span>
                      <p className="text-xs text-sky-950 font-medium leading-relaxed">
                        {item.ai_interpretation}
                      </p>
                    </div>

                    {/* Block C: Reason for Review */}
                    <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                        Reason for Review
                      </span>
                      <p className="text-xs text-amber-950 leading-relaxed">
                        {item.reason}
                      </p>
                    </div>
                  </div>

                  {/* Source Evidence Expandable (Section 8 Requirement) */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-700">Source Evidence:</span>
                        <span>
                          {item.source_document || 'Synthetic Discharge Summary'} • Page {item.source_page || '2'} • {item.source_section || 'Medication Instructions'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedSourceItem(item)}
                          className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer transition-colors"
                          title="Open full document verification inspector"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                          <span>Inspect Citation</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleSource(item.id)}
                          className="text-xs font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <span>{isSourceOpen ? 'Hide Source' : 'View Source'}</span>
                          {isSourceOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {isSourceOpen && (
                      <div className="mt-2.5 p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] text-slate-700 whitespace-pre-wrap leading-relaxed animate-in fade-in duration-150">
                        {item.source_text || item.original_text}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <button
                    onClick={() => setSelectedReview(item)}
                    className="py-2 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Open Detailed Inspection</span>
                  </button>

                  {/* Functional Review Action Buttons */}
                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    {item.status !== 'Needs Review' && (
                      <button
                        onClick={() => handleQuickAction(item.id, 'Needs Review')}
                        className="py-1.5 px-3 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Reopen item for human review"
                      >
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                        <span>Reopen Review</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleQuickAction(item.id, 'Needs Clarification')}
                      className={`py-1.5 px-3 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                        item.status === 'Needs Clarification'
                          ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                          : 'border-amber-300 text-amber-800 hover:bg-amber-50'
                      }`}
                    >
                      <HelpCircle className="w-3 h-3 text-amber-600" />
                      <span>Request Clarification</span>
                    </button>

                    <button
                      onClick={() => handleQuickAction(item.id, 'Resolved')}
                      className={`py-1.5 px-3 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                        item.status === 'Resolved'
                          ? 'bg-indigo-100 text-indigo-900 border-indigo-300 font-bold'
                          : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <CheckCheck className="w-3 h-3 text-slate-600" />
                      <span>Mark Resolved</span>
                    </button>

                    <button
                      onClick={() => handleQuickAction(item.id, 'Approved')}
                      className={`py-1.5 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors shadow-2xs cursor-pointer ${
                        item.status === 'Approved'
                          ? 'bg-emerald-700 text-white ring-2 ring-emerald-300'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      <Check className="w-3 h-3" />
                      <span>Approve Extraction</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detailed Review Modal (3-section view + View Source) */}
      {selectedReview && (
        <ReviewModal
          review={selectedReview}
          isOpen={!!selectedReview}
          onClose={() => setSelectedReview(null)}
        />
      )}

      {/* Clinical Source Document Citation Modal */}
      {selectedSourceItem && (
        <SourceModal
          item={selectedSourceItem}
          isOpen={!!selectedSourceItem}
          onClose={() => setSelectedSourceItem(null)}
        />
      )}
    </div>
  );
}
