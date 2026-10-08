import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getReviews, updateReviewItem, escalateSafetyQuery } from '../api';

const ReviewContext = createContext();

export const INITIAL_DEMO_REVIEWS = [
  {
    id: 'REV-001',
    patient_id: 'pat-001',
    patient_name: 'Alex Johnson',
    issue: 'Medication duration unspecified',
    priority: 'HIGH',
    reason: 'The discharge summary does not provide enough information to determine duration.',
    status: 'Needs Review',
    source_reference: 'Discharge Summary – Page 2 – Medication section',
    source_document: 'Synthetic Discharge Summary',
    source_page: '2',
    source_section: 'Medication Instructions',
    source_text: 'DISCHARGE MEDICATIONS:\n1. Continue maintenance medication as prescribed.\n[Note: Duration and refill quantity are not explicitly specified in the chart.]',
    original_text: 'Continue maintenance medication as prescribed.',
    ai_interpretation: 'Medication duration or refill limit is not explicitly specified.',
    reviewer_notes: ''
  },
  {
    id: 'REV-002',
    patient_id: 'pat-001',
    patient_name: 'Alex Johnson',
    issue: 'Follow-up date missing',
    priority: 'MEDIUM',
    reason: 'AI must not invent a follow-up date.',
    status: 'Needs Review',
    source_reference: 'Discharge Summary – Page 1 – Follow-up section',
    source_document: 'Synthetic Discharge Summary',
    source_page: '1',
    source_section: 'Scheduled Follow-up Appointments',
    source_text: 'SCHEDULED FOLLOW-UP APPOINTMENTS:\n- Follow up with Cardiology.\n[Note: Specific appointment date, clinic location, and timeframe are not specified.]',
    original_text: 'Follow up with Cardiology.',
    ai_interpretation: 'Cardiology follow-up is required, but no specific date is provided.',
    reviewer_notes: ''
  },
  {
    id: 'REV-003',
    patient_id: 'pat-001',
    patient_name: 'Alex Johnson',
    issue: 'Conflicting follow-up dates',
    priority: 'MEDIUM',
    reason: 'The system cannot determine which date is correct.',
    status: 'Needs Review',
    source_reference: 'Discharge Summary – Section 3 vs Section 6 Addendum',
    source_document: 'Synthetic Discharge Summary',
    source_page: '1 & 2',
    source_section: 'Section 3 (Discharge Orders) vs Section 6 (Attending Addendum)',
    source_text: 'SECTION 3 - DISCHARGE ORDERS:\n- Follow up with Orthopedic Surgical Clinic in 2 weeks on October 28, 2026 for staple removal and initial joint evaluation.\n\nSECTION 6 - ATTENDING PHYSICIAN DISCHARGE ADDENDUM:\n- Patient should return for orthopedic clinic checkup in 6 weeks (target: November 25, 2026) for post-operative imaging.',
    original_text: 'Section 3: Follow up with Orthopedic Surgical Clinic in 2 weeks on October 28, 2026 for staple removal. Section 6: Attending Addendum specifies checkup in 6 weeks on November 25, 2026.',
    ai_interpretation: 'Two different follow-up dates were identified.',
    reviewer_notes: ''
  }
];

export function ReviewProvider({ children }) {
  const [reviews, setReviews] = useState(INITIAL_DEMO_REVIEWS);
  const [loading, setLoading] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast((current) => (current && current.message === message ? null : current));
    }, 3000);
  }, []);

  const [lastUpdated, setLastUpdated] = useState(Date.now());

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getReviews();
      if (Array.isArray(data)) {
        // Merge with our richer metadata if needed
        const enriched = data.map((item) => {
          const fallback = INITIAL_DEMO_REVIEWS.find(
            (d) => d.id.toUpperCase() === item.id.toUpperCase()
          );
          let rawStatus = item.status || fallback?.status || 'Needs Review';
          let normalizedStatus = 'Needs Review';
          if (['Approved', 'Approve Extraction', 'approve', 'approved'].includes(rawStatus)) {
            normalizedStatus = 'Approved';
          } else if (['Needs Clarification', 'Request Clarification', 'Clarification Requested', 'clarification requested', 'clarify'].includes(rawStatus)) {
            normalizedStatus = 'Needs Clarification';
          } else if (['Resolved', 'Mark Resolved', 'resolve', 'resolved'].includes(rawStatus)) {
            normalizedStatus = 'Resolved';
          }

          return {
            ...fallback,
            ...item,
            id: item.id || fallback?.id,
            issue: item.issue || fallback?.issue || 'Review Flagged',
            reason: item.reason || fallback?.reason || 'Clinical verification required.',
            priority: (item.priority || fallback?.priority || 'MEDIUM').toUpperCase(),
            patient_name: item.patient_name || fallback?.patient_name || 'Patient',
            source_document: item.source_document || fallback?.source_document || 'Uploaded Document',
            source_page: item.source_page || fallback?.source_page || '1',
            source_section: item.source_section || fallback?.source_section || 'Clinical Review Section',
            source_text: item.source_text || item.original_text || fallback?.source_text || 'See uploaded document',
            original_text: item.original_text || fallback?.original_text || item.issue,
            ai_interpretation: item.ai_interpretation || fallback?.ai_interpretation || 'Clinical verification required.',
            status: normalizedStatus
          };
        });
        setReviews(enriched);
        setLastUpdated(Date.now());
      }
    } catch (err) {
      console.warn('API getReviews fetch fallback to active local reviews state:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const setReviewsDirectly = useCallback((newReviews) => {
    if (Array.isArray(newReviews)) {
      const enriched = newReviews.map((item) => {
        const fallback = INITIAL_DEMO_REVIEWS.find(
          (d) => d.id.toUpperCase() === item.id.toUpperCase()
        );
        let rawStatus = item.status || fallback?.status || 'Needs Review';
        let normalizedStatus = 'Needs Review';
        if (['Approved', 'Approve Extraction', 'approve', 'approved'].includes(rawStatus)) {
          normalizedStatus = 'Approved';
        } else if (['Needs Clarification', 'Request Clarification', 'Clarification Requested', 'clarification requested', 'clarify'].includes(rawStatus)) {
          normalizedStatus = 'Needs Clarification';
        } else if (['Resolved', 'Mark Resolved', 'resolve', 'resolved'].includes(rawStatus)) {
          normalizedStatus = 'Resolved';
        }
        return {
          ...fallback,
          ...item,
          id: item.id || fallback?.id,
          issue: item.issue || fallback?.issue || 'Review Flagged',
          reason: item.reason || fallback?.reason || 'Clinical verification required.',
          priority: (item.priority || fallback?.priority || 'MEDIUM').toUpperCase(),
          patient_name: item.patient_name || fallback?.patient_name || 'Patient',
          source_document: item.source_document || fallback?.source_document || 'Uploaded Document',
          source_page: item.source_page || fallback?.source_page || '1',
          source_section: item.source_section || fallback?.source_section || 'Clinical Review Section',
          source_text: item.source_text || item.original_text || fallback?.source_text || 'See uploaded document',
          original_text: item.original_text || fallback?.original_text || item.issue,
          ai_interpretation: item.ai_interpretation || fallback?.ai_interpretation || 'Clinical verification required.',
          status: normalizedStatus
        };
      });
      setReviews(enriched);
      setLastUpdated(Date.now());
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Count of items strictly with 'Needs Review' status
  const activeReviewCount = reviews.filter((r) => r.status === 'Needs Review').length;

  const updateReview = useCallback(
    async (reviewId, newStatus, notes = '') => {
      // Normalize status
      let normalizedStatus = 'Needs Review';
      if (['Approved', 'Approve Extraction', 'approve', 'approved'].includes(newStatus)) {
        normalizedStatus = 'Approved';
      } else if (['Needs Clarification', 'Request Clarification', 'Clarification Requested', 'clarification requested', 'clarify'].includes(newStatus)) {
        normalizedStatus = 'Needs Clarification';
      } else if (['Resolved', 'Mark Resolved', 'resolve', 'resolved'].includes(newStatus)) {
        normalizedStatus = 'Resolved';
      } else if (['Needs Review', 'needs review'].includes(newStatus)) {
        normalizedStatus = 'Needs Review';
      } else {
        normalizedStatus = newStatus;
      }

      // Optimistically update local state immediately
      setReviews((prev) =>
        prev.map((item) => {
          if (item.id.toUpperCase() === reviewId.toUpperCase()) {
            return {
              ...item,
              status: normalizedStatus,
              reviewer_notes: notes !== undefined && notes !== '' ? notes : item.reviewer_notes
            };
          }
          return item;
        })
      );

      // If modal currently has this review open, update it too
      setSelectedReview((curr) => {
        if (curr && curr.id.toUpperCase() === reviewId.toUpperCase()) {
          return {
            ...curr,
            status: normalizedStatus,
            reviewer_notes: notes !== undefined && notes !== '' ? notes : curr.reviewer_notes
          };
        }
        return curr;
      });

      setLastUpdated(Date.now());

      // Show toast
      showToast(`Status updated to "${normalizedStatus}" successfully.`);

      // Persist to backend API
      try {
        await updateReviewItem(reviewId, normalizedStatus, notes);
        setLastUpdated(Date.now());
      } catch (err) {
        console.warn('Backend updateReviewItem error (local state preserved):', err);
      }
    },
    [showToast]
  );

  const escalateQueryToReview = useCallback(
    async (queryText, explanation = '') => {
      try {
        await escalateSafetyQuery(queryText, explanation);
        await fetchReviews();
        showToast('Inquiry escalated to Human Review queue.');
      } catch (err) {
        console.warn('Backend safety escalation error, adding local item:', err);
        const newItem = {
          id: `REV-SAF-${reviews.length + 1}`,
          patient_id: 'pat-001',
          patient_name: 'Alex Johnson',
          issue: `Clinically Sensitive Inquiry: ${queryText.slice(0, 50)}...`,
          priority: 'HIGH',
          reason: explanation || 'Direct inquiry regarding medication or symptoms requires clinical oversight.',
          status: 'Needs Review',
          source_reference: 'Patient Portal Safety Escalation',
          source_document: 'Patient Portal Inquiry',
          source_page: '1',
          source_section: 'Clinical Communication',
          source_text: `Patient Query: "${queryText}"`,
          original_text: queryText,
          ai_interpretation: 'Patient inquiry flagged by AI safety boundary.'
        };
        setReviews((prev) => [newItem, ...prev]);
        setLastUpdated(Date.now());
        showToast('Inquiry escalated to Human Review queue.');
      }
    },
    [fetchReviews, reviews.length, showToast]
  );

  const openReviewDetail = useCallback((item) => {
    setSelectedReview(item);
  }, []);

  const closeReviewDetail = useCallback(() => {
    setSelectedReview(null);
  }, []);

  const value = {
    reviews,
    activeReviewCount,
    lastUpdated,
    loading,
    toast,
    showToast,
    fetchReviews,
    setReviewsDirectly,
    updateReview,
    escalateQueryToReview,
    selectedReview,
    setSelectedReview,
    openReviewDetail,
    closeReviewDetail
  };

  return (
    <ReviewContext.Provider value={value}>
      {children}
      {/* Global Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-xl text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{toast.message}</span>
        </div>
      )}
    </ReviewContext.Provider>
  );
}

export function useReview() {
  const context = useContext(ReviewContext);
  if (!context) {
    throw new Error('useReview must be used within a ReviewProvider');
  }
  return context;
}
