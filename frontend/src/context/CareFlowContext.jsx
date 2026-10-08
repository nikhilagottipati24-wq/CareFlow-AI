import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  SYNTHETIC_PATIENT,
  INITIAL_TASKS,
  INITIAL_REVIEWS,
  INITIAL_PROVIDERS,
  INITIAL_ACTIVITIES,
} from '../data/mockData';
import { apiService } from '../services/api';

const CareFlowContext = createContext(null);
const STORAGE_KEY = 'careflow_ai_state_v2';

export const CareFlowProvider = ({ children }) => {
  // Read saved local storage if available
  const getSavedState = () => {
    try {
      const item = localStorage.getItem(STORAGE_KEY);
      if (item) {
        return JSON.parse(item);
      }
    } catch (e) {
      console.warn("Failed to parse saved state", e);
    }
    return null;
  };

  const saved = getSavedState();

  const [patient, setPatient] = useState(saved?.patient || SYNTHETIC_PATIENT);
  const [tasks, setTasks] = useState(saved?.tasks || INITIAL_TASKS);
  const [reviews, setReviews] = useState(saved?.reviews || INITIAL_REVIEWS);
  const [providers, setProviders] = useState(saved?.providers || INITIAL_PROVIDERS);
  const [activities, setActivities] = useState(saved?.activities || INITIAL_ACTIVITIES);
  const [syntheticMode, setSyntheticMode] = useState(true);
  const [activeScenario, setActiveScenario] = useState('scenario_1');
  
  // Document state
  const [currentDocument, setCurrentDocument] = useState({
    fileName: 'Synthetic_Discharge_Summary_AlexJohnson.pdf',
    uploadDate: 'October 14, 2026',
    rawText: `SYNTHETIC HOSPITAL DISCHARGE SUMMARY - DEMO DATA ONLY
Patient Name: Alex Johnson
Patient ID: SYN-PT-80214
Age: 52 | Gender: Male | Language: English
Hospital: Synthetic General Hospital
Admission Date: October 11, 2026
Discharge Date: October 14, 2026
Attending Physician: Dr. Marcus Vance, MD (Cardiology)

PRIMARY DIAGNOSIS:
Acute Anterior ST-Elevation Myocardial Infarction (STEMI).
Successful Primary Percutaneous Coronary Intervention (PCI) with Drug-Eluting Stent (DES) to proximal LAD.

DISCHARGE MEDICATIONS:
1. Atorvastatin 40 mg oral tablet, take 1 tablet once daily in the evening with dinner. Duration: 90 days.
2. Aspirin 81 mg oral tablet, take 1 tablet once daily in the morning with food. Duration: 12 months.
3. Clopidogrel 75 mg oral tablet, take 1 tablet daily with water. Duration: 12 months (dual antiplatelet therapy).
4. Metoprolol Tartrate 25 mg oral tablet, take 1 tablet twice daily with meals. Duration: 30 days.

SCHEDULED APPOINTMENTS:
- Cardiology Follow-up Clinic: Scheduled with Dr. Arun Kumar at Synthetic General Hospital Outpatient Suite on October 20, 2026 at 10:30 AM.
- Surgical Wound Review: Scheduled at Outpatient Surgical Clinic on October 25, 2026 at 2:00 PM.

REQUIRED MEDICAL TESTS:
- Fasting Blood Test: Complete comprehensive metabolic panel, serum creatinine, and fasting lipid panel on October 15, 2026 prior to morning medication. Fasting required for 10 hours.

CARE AND WOUND INSTRUCTIONS:
- Puncture Site Care: Keep the right femoral catheter puncture site clean, dry, and covered for 48 hours. Sponge bathe only until October 17, 2026.
- Activity Restrictions: Strictly avoid lifting any heavy objects weighing greater than 10 pounds (4.5 kg) for 7 days. Avoid strenuous exertion or driving until cleared by cardiologist.

WARNING SIGNS AND EMERGENCY PROTOCOL:
- If you experience severe chest pain, pressure, radiating arm or jaw discomfort, shortness of breath, cold sweat, or sudden dizziness: CALL EMERGENCY MEDICAL SERVICES (911) IMMEDIATELY OR PROCEED TO THE NEAREST EMERGENCY DEPARTMENT.`,
  });

  // Modals and Drawers
  const [sourceEvidence, setSourceEvidence] = useState({ isOpen: false, data: null });
  const [reviewModal, setReviewModal] = useState({ isOpen: false, data: null });
  const [taskModal, setTaskModal] = useState({ isOpen: false, data: null });
  const [editPatientModal, setEditPatientModal] = useState({ isOpen: false });
  
  // AI Workflow Processing Screen
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [processingComplete, setProcessingComplete] = useState(false);
  const [identifiedItemsCount, setIdentifiedItemsCount] = useState(8);

  // Toast notifications
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'info' });
    }, 4000);
  };

  // Helper to persist state to localStorage
  const persistState = (newTasks, newReviews, newActivities = null, newPatient = null) => {
    try {
      const toSave = {
        patient: newPatient || patient,
        tasks: newTasks,
        reviews: newReviews,
        providers,
        activities: newActivities || activities,
        timestamp: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {
      console.warn("Error persisting state to localStorage", e);
    }
  };

  // Patient editing methods
  const openEditPatientModal = () => setEditPatientModal({ isOpen: true });
  const closeEditPatientModal = () => setEditPatientModal({ isOpen: false });

  const updatePatient = async (updates) => {
    const updated = { ...patient, ...updates };
    setPatient(updated);
    persistState(tasks, reviews, activities, updated);

    // If name changed, keep document in sync for consistent demo display
    if (updates.name && patient.name && updates.name !== patient.name) {
      setCurrentDocument(prev => ({
        ...prev,
        rawText: prev.rawText
          ? prev.rawText
              .replace(new RegExp(`Patient Name: ${patient.name}`, 'g'), `Patient Name: ${updates.name}`)
              .replace(new RegExp(patient.name, 'g'), updates.name)
          : prev.rawText
      }));
    }

    try {
      await apiService.updatePatient(updates);
      showToast(`Patient updated to ${updated.name} (Age: ${updated.age})`, 'success');
    } catch (e) {
      console.warn("Could not sync patient update with backend, kept in local state", e);
      showToast(`Patient updated locally to ${updated.name}`, 'success');
    }
  };

  // Sync with backend on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const p = await apiService.getPatient();
        if (p) setPatient(p);
        const t = await apiService.getTasks();
        if (t && t.length > 0) setTasks(t);
        const r = await apiService.getReviews();
        if (r && r.length > 0) setReviews(r);
        const prov = await apiService.getProviders();
        if (prov && prov.providers) setProviders(prov.providers);
        const acts = await apiService.getActivityLogs();
        if (acts && acts.length > 0) setActivities(acts);

        if (t && r) {
          persistState(t, r, acts);
        }
      } catch (err) {
        console.log("Operating with local persisted state", err);
      }
    };
    fetchData();
  }, []);

  // Update Task Status
  const updateTaskStatus = async (taskId, newStatus) => {
    const updated = tasks.map(t => (t.id === taskId ? { ...t, status: newStatus } : t));
    setTasks(updated);
    persistState(updated, reviews);
    showToast(`Task status updated to ${newStatus}`, 'success');

    try {
      await apiService.updateTaskStatus(taskId, newStatus);
    } catch (e) {
      // Handled in local state
    }
  };

  // Update Review Status and propagate duration & task changes
  const updateReviewStatus = async (reviewId, newStatus, notes = '', duration = '') => {
    // 1. Update review item
    const updatedReviews = reviews.map(r => {
      if (r.id === reviewId) {
        return {
          ...r,
          status: newStatus,
          resolution_notes: notes,
          duration: duration || r.duration,
        };
      }
      return r;
    });
    setReviews(updatedReviews);

    // 2. If approved or resolved, also update any related task in Needs Review
    const isResolved = ['resolved', 'approved'].includes(newStatus.toLowerCase());
    let updatedTasks = tasks;
    if (isResolved) {
      updatedTasks = tasks.map(t => {
        if (t.status === 'Needs Review') {
          return {
            ...t,
            status: 'Pending',
            description: duration ? `${t.description} (Confirmed duration: ${duration})` : t.description,
            patient_friendly_explanation: duration
              ? `${t.patient_friendly_explanation} Confirmed duration: ${duration}.`
              : t.patient_friendly_explanation,
          };
        }
        return t;
      });
      setTasks(updatedTasks);
    }

    // Add audit entry
    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      agent_name: 'Human Review Coordinator',
      action: `Review marked as ${newStatus}`,
      details: `Item was updated to ${newStatus} by clinician.${duration ? ` Confirmed duration: ${duration}.` : ''}`,
    };
    const updatedActs = [newLog, ...activities];
    setActivities(updatedActs);

    persistState(updatedTasks, updatedReviews, updatedActs);

    const durText = duration ? ` with duration: ${duration}` : '';
    showToast(`Review item marked as ${newStatus}${durText}`, 'success');

    // 3. Sync to backend API
    try {
      await apiService.updateReview(reviewId, newStatus, notes, duration);
      // Fetch latest from backend
      const latestTasks = await apiService.getTasks();
      if (latestTasks && latestTasks.length > 0) {
        setTasks(latestTasks);
        updatedTasks = latestTasks;
      }
      const latestReviews = await apiService.getReviews();
      if (latestReviews && latestReviews.length > 0) {
        setReviews(latestReviews);
      }
      persistState(latestTasks || updatedTasks, latestReviews || updatedReviews, updatedActs);
    } catch (e) {
      console.warn("Backend update finished with local persistence", e);
    }
  };

  // Source Evidence Drawer
  const openSourceEvidence = (sourceRef) => {
    if (!sourceRef) return;
    setSourceEvidence({ isOpen: true, data: sourceRef });
  };

  const closeSourceEvidence = () => {
    setSourceEvidence({ isOpen: false, data: null });
  };

  // Review Modal
  const openReviewModal = (reviewItem) => {
    setReviewModal({ isOpen: true, data: reviewItem });
  };

  const closeReviewModal = () => {
    setReviewModal({ isOpen: false, data: null });
  };

  // Task Modal
  const openTaskModal = (taskItem) => {
    setTaskModal({ isOpen: true, data: taskItem });
  };

  const closeTaskModal = () => {
    setTaskModal({ isOpen: false, data: null });
  };

  // AI Pipeline Workflow Simulator / Backend Executor
  const startAIAnalysis = async ({ rawText, fileName, scenarioId, onSuccess }) => {
    setIsProcessing(true);
    setProcessingStep(1);
    setProcessingComplete(false);

    // Progression of the 7 agentic steps
    const steps = [
      { step: 1, delay: 600 },  // Document uploaded
      { step: 2, delay: 700 },  // Reading discharge summary
      { step: 3, delay: 800 },  // Extracting follow-up instructions
      { step: 4, delay: 700 },  // Validating information
      { step: 5, delay: 800 },  // Creating tasks
      { step: 6, delay: 700 },  // Checking for review items
      { step: 7, delay: 800 },  // Building care timeline
    ];

    for (const s of steps) {
      await new Promise(resolve => setTimeout(resolve, s.delay));
      setProcessingStep(s.step);
    }

    // Try backend call
    try {
      const res = await apiService.analyzeDocument({
        raw_text: rawText,
        file_name: fileName,
        scenario_id: scenarioId,
      });

      if (res && res.tasks) {
        setTasks(res.tasks);
        setReviews(res.reviews || []);
        setActivities(res.activity_logs || []);
        setIdentifiedItemsCount(res.actionable_items_count || res.tasks.length);
        setCurrentDocument({
          fileName: fileName || 'Discharge_Summary.txt',
          uploadDate: 'October 14, 2026',
          rawText: rawText || currentDocument.rawText,
        });
        persistState(res.tasks, res.reviews || [], res.activity_logs || []);
      }
    } catch (e) {
      console.warn("Backend analysis failed, completing with local simulation", e);
      if (scenarioId === 'scenario_3') {
        setIdentifiedItemsCount(7);
      } else if (scenarioId === 'scenario_5') {
        setIdentifiedItemsCount(8);
      } else {
        setIdentifiedItemsCount(8);
      }
    }

    setProcessingComplete(true);
  };

  const finishProcessing = () => {
    setIsProcessing(false);
    setProcessingStep(0);
    setProcessingComplete(false);
  };

  // 1-Click Scenario Loader
  const loadScenario = async (scenarioId) => {
    setActiveScenario(scenarioId);
    try {
      await apiService.loadScenario(scenarioId);
      const t = await apiService.getTasks();
      if (t) setTasks(t);
      const r = await apiService.getReviews();
      if (r) setReviews(r);
      const acts = await apiService.getActivityLogs();
      if (acts) setActivities(acts);
      persistState(t || tasks, r || reviews, acts || activities);
      showToast(`Scenario loaded successfully`, 'info');
    } catch (e) {
      showToast(`Loaded scenario ${scenarioId} (offline mode)`, 'info');
    }
  };

  // Counts for dashboard
  const totalTasksCount = tasks.length;
  const pendingTasksCount = tasks.filter(t => t.status === 'Pending').length;
  const completedTasksCount = tasks.filter(t => t.status === 'Completed').length;
  
  // Unresolved reviews: items with status "Pending" or "Needs Review"
  const unresolvedReviews = reviews.filter(
    r => r.status === 'Pending' || r.status === 'Needs Review'
  );
  const tasksNeedingReview = tasks.filter(t => t.status === 'Needs Review');
  
  // Dynamic active review count
  const activeNeedsReviewCount = Math.max(unresolvedReviews.length, tasksNeedingReview.length);

  return (
    <CareFlowContext.Provider
      value={{
        patient,
        setPatient,
        updatePatient,
        editPatientModal,
        openEditPatientModal,
        closeEditPatientModal,
        tasks,
        reviews,
        unresolvedReviews,
        providers,
        activities,
        syntheticMode,
        setSyntheticMode,
        activeScenario,
        loadScenario,
        currentDocument,
        setCurrentDocument,
        updateTaskStatus,
        updateReviewStatus,
        sourceEvidence,
        openSourceEvidence,
        closeSourceEvidence,
        reviewModal,
        openReviewModal,
        closeReviewModal,
        taskModal,
        openTaskModal,
        closeTaskModal,
        isProcessing,
        processingStep,
        processingComplete,
        identifiedItemsCount,
        startAIAnalysis,
        finishProcessing,
        toast,
        showToast,
        counts: {
          total: totalTasksCount,
          pending: pendingTasksCount,
          completed: completedTasksCount,
          needsReview: activeNeedsReviewCount,
        },
      }}
    >
      {children}
    </CareFlowContext.Provider>
  );
};

export const useCareFlow = () => {
  const context = useContext(CareFlowContext);
  if (!context) {
    throw new Error('useCareFlow must be used within a CareFlowProvider');
  }
  return context;
};
