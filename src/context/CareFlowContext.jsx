import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CareFlowAPI } from '../services/api';

const CareFlowContext = createContext();

export const useCareFlow = () => {
  const context = useContext(CareFlowContext);
  if (!context) {
    throw new Error('useCareFlow must be used within a CareFlowProvider');
  }
  return context;
};

// Default initial state matching demo specification exactly
const INITIAL_PATIENT = {
  id: 'demo-patient-001',
  name: 'Alex Johnson',
  age: 52,
  hospital: 'Synthetic General Hospital',
  discharge_date: 'October 14, 2026',
  attending_physician: 'Dr. Robert Sterling, MD',
  diagnosis_summary: 'Acute uncomplicated congestive heart failure flare, stabilized on oral diuretic therapy.'
};

const INITIAL_SUMMARY = {
  total_tasks: 8,
  pending_tasks: 5,
  completed_tasks: 2,
  needs_review_tasks: 1,
  completion_rate: 25.0,
  upcoming_followups: 5,
  open_review_items: 1,
  scenario_id: 'scenario-1'
};

const getInitialTasks = () => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const formatYMD = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  const compDay1 = new Date(now);
  compDay1.setDate(now.getDate() - 2);
  const compDay2 = new Date(now);
  compDay2.setDate(now.getDate() - 1);
  const dueDay1 = new Date(now);
  dueDay1.setDate(now.getDate() + 1);
  const dueDay2 = new Date(now);
  dueDay2.setDate(now.getDate() + 3);
  const dueDay3 = new Date(now);
  dueDay3.setDate(now.getDate() + 5);
  const dueDay4 = new Date(now);
  dueDay4.setDate(now.getDate() + 7);
  const dueDay5 = new Date(now);
  dueDay5.setDate(now.getDate() + 10);

  return [
    {
      id: "task-101",
      patient_id: "demo-patient-001",
      task_type: "Medication",
      title: "Pick up Lisinopril 10mg from Pharmacy",
      description: "Obtain 30-day supply from designated outpatient pharmacy. Take once daily each morning with water.",
      due_date: formatYMD(compDay1),
      priority: "High",
      status: "Completed",
      category: "Medication",
      source_reference: "Section 4: Discharge Medications - Item 1",
      created_at: `${formatYMD(compDay1)}T09:00:00Z`,
      updated_at: `${formatYMD(compDay1)}T14:30:00Z`,
      completed_at: `${formatYMD(compDay1)}T14:30:00Z`
    },
    {
      id: "task-102",
      patient_id: "demo-patient-001",
      task_type: "Care",
      title: "Log Daily Morning Weight & Blood Pressure",
      description: "Weigh each morning after voiding and before breakfast. Alert care coordinator if weight increases >3 lbs in 24 hours.",
      due_date: formatYMD(compDay2),
      priority: "High",
      status: "Completed",
      category: "Care",
      source_reference: "Section 5: Daily Self-Monitoring Instructions",
      created_at: `${formatYMD(compDay2)}T08:00:00Z`,
      updated_at: `${formatYMD(compDay2)}T10:15:00Z`,
      completed_at: `${formatYMD(compDay2)}T10:15:00Z`
    },
    {
      id: "task-103",
      patient_id: "demo-patient-001",
      task_type: "Appointment",
      title: "Cardiology Post-Discharge Follow-up",
      description: "Clinic visit with Dr. Sarah Lin to evaluate therapy tolerance and review echocardiogram findings.",
      due_date: formatYMD(dueDay1),
      priority: "High",
      status: "Pending",
      category: "Appointment",
      source_reference: "Section 3: Follow-up Appointments - Cardiology",
      created_at: `${formatYMD(compDay1)}T10:00:00Z`,
      updated_at: `${formatYMD(compDay1)}T10:00:00Z`,
      completed_at: null
    },
    {
      id: "task-104",
      patient_id: "demo-patient-001",
      task_type: "Test",
      title: "Serum Electrolytes & Renal Function Panel",
      description: "Fasting blood draw for Basic Metabolic Panel (BUN, Creatinine, K+) 7 days post diuretic adjustment.",
      due_date: formatYMD(dueDay2),
      priority: "High",
      status: "Pending",
      category: "Test",
      source_reference: "Section 6: Required Diagnostic Tests - Lab Work",
      created_at: `${formatYMD(compDay1)}T10:00:00Z`,
      updated_at: `${formatYMD(compDay1)}T10:00:00Z`,
      completed_at: null
    },
    {
      id: "task-105",
      patient_id: "demo-patient-001",
      task_type: "Care",
      title: "Maintain 2,000 mg Low Sodium Diet Plan",
      description: "Adhere strictly to daily dietary sodium limit under 2 grams. Avoid processed meats and canned soups.",
      due_date: formatYMD(dueDay3),
      priority: "Medium",
      status: "Pending",
      category: "Care",
      source_reference: "Section 5: Dietary Guidance",
      created_at: `${formatYMD(compDay1)}T10:00:00Z`,
      updated_at: `${formatYMD(compDay1)}T10:00:00Z`,
      completed_at: null
    },
    {
      id: "task-106",
      patient_id: "demo-patient-001",
      task_type: "Follow-up",
      title: "Care Coordinator Phone Check-in",
      description: "Virtual 15-minute phone wellness assessment to confirm symptom stability and address questions.",
      due_date: formatYMD(dueDay4),
      priority: "Medium",
      status: "Pending",
      category: "Follow-up",
      source_reference: "Section 3: Care Team Check-ins",
      created_at: `${formatYMD(compDay1)}T10:00:00Z`,
      updated_at: `${formatYMD(compDay1)}T10:00:00Z`,
      completed_at: null
    },
    {
      id: "task-107",
      patient_id: "demo-patient-001",
      task_type: "Referral",
      title: "Cardiac Rehabilitation Intake Consultation",
      description: "Initial intake appointment for supervised Phase II outpatient cardiovascular exercise therapy.",
      due_date: formatYMD(dueDay5),
      priority: "Low",
      status: "Pending",
      category: "Referral",
      source_reference: "Section 7: Outpatient Referrals",
      created_at: `${formatYMD(compDay1)}T10:00:00Z`,
      updated_at: `${formatYMD(compDay1)}T10:00:00Z`,
      completed_at: null
    },
    {
      id: "task-108",
      patient_id: "demo-patient-001",
      task_type: "Medication",
      title: "Titration of Furosemide Dosage Duration",
      description: "Discharge summary states 'Continue Furosemide 40mg daily until edema resolves', which lacks an explicit review cutoff date.",
      due_date: null,
      priority: "High",
      status: "Needs Review",
      category: "Medication",
      source_reference: "Section 4: Discharge Medications - Furosemide Note",
      created_at: `${formatYMD(compDay1)}T10:00:00Z`,
      updated_at: `${formatYMD(compDay1)}T10:00:00Z`,
      completed_at: null
    }
  ];
};

const INITIAL_REVIEWS = [
  {
    id: "rev-101",
    patient_id: "demo-patient-001",
    issue: "Unclear medication duration for loop diuretic",
    issue_type: "Unclear medication instruction",
    priority: "High",
    reason: "Duration noted as 'until swelling subsides' without standard 14-day clinical reassessment parameter.",
    status: "Open",
    original_instruction: "Furosemide 40mg PO once daily in morning until edema fully resolves.",
    ai_interpretation: "Requires clinical pharmacist confirmation for a definitive 10 or 14 day check date.",
    source_reference: "Discharge Summary pg. 2, paragraph 4",
    created_at: new Date().toISOString(),
    resolved_at: null,
    resolution_notes: null
  }
];

export const CareFlowProvider = ({ children }) => {
  const [patient, setPatient] = useState(INITIAL_PATIENT);
  const [summary, setSummary] = useState(INITIAL_SUMMARY);
  const [tasks, setTasks] = useState(getInitialTasks);
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [activeScenario, setActiveScenario] = useState('scenario-1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumRes, taskRes, revRes] = await Promise.all([
        CareFlowAPI.getSummary(),
        CareFlowAPI.getTasks(),
        CareFlowAPI.getReviews()
      ]);

      if (sumRes?.data) {
        setSummary(sumRes.data);
        if (sumRes.data.patient) setPatient(sumRes.data.patient);
      }
      if (taskRes?.data) setTasks(taskRes.data);
      if (revRes?.data) setReviews(revRes.data);
    } catch (err) {
      console.warn('Backend API connection warning, using synchronized local store:', err.message);
      // Even if network fails, ensure summary is calculated from local tasks if tasks exist
      if (tasks.length > 0) {
        recalculateLocalSummary(tasks, reviews);
      }
    } finally {
      setLoading(false);
    }
  }, [tasks.length, reviews.length]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const recalculateLocalSummary = (currentTasks, currentReviews) => {
    const total = currentTasks.length;
    const pending = currentTasks.filter(t => t.status === 'Pending').length;
    const completed = currentTasks.filter(t => t.status === 'Completed').length;
    const needsReview = currentTasks.filter(t => t.status === 'Needs Review').length;
    const rate = total > 0 ? Number(((completed / total) * 100).toFixed(1)) : 0;
    const openReviews = currentReviews.filter(r => r.status === 'Open').length;

    setSummary(prev => ({
      ...prev,
      total_tasks: total,
      pending_tasks: pending,
      completed_tasks: completed,
      needs_review_tasks: needsReview,
      completion_rate: rate,
      open_review_items: openReviews
    }));
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    // Optimistic UI update
    const previousTasks = [...tasks];
    const updatedTasks = tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: newStatus,
          completed_at: newStatus === 'Completed' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        };
      }
      return t;
    });

    setTasks(updatedTasks);
    recalculateLocalSummary(updatedTasks, reviews);

    try {
      const res = await CareFlowAPI.updateTaskStatus(taskId, newStatus);
      if (res?.data?.summary) {
        setSummary(res.data.summary);
      }
      showToast(`Task marked as ${newStatus}`);
    } catch (err) {
      console.error('Error updating task status on server:', err);
      // Keep optimistic update or revert if desired, but keep consistent
      showToast(`Task status updated locally (${newStatus})`, 'info');
    }
  };

  const updateReview = async (reviewId, newStatus, notes = '') => {
    const updatedReviews = reviews.map(r => {
      if (r.id === reviewId) {
        return {
          ...r,
          status: newStatus,
          resolution_notes: notes,
          resolved_at: new Date().toISOString()
        };
      }
      return r;
    });

    setReviews(updatedReviews);
    recalculateLocalSummary(tasks, updatedReviews);

    try {
      const res = await CareFlowAPI.updateReview(reviewId, newStatus, notes);
      if (res?.data?.summary) {
        setSummary(res.data.summary);
      }
      showToast(`Review item updated to ${newStatus}`);
    } catch (err) {
      console.error('Error updating review:', err);
      showToast(`Review updated locally (${newStatus})`, 'info');
    }
  };

  const switchScenario = async (scenarioId) => {
    setLoading(true);
    try {
      const res = await CareFlowAPI.switchScenario(scenarioId);
      setActiveScenario(scenarioId);
      if (res?.data?.patient) setPatient(res.data.patient);
      if (res?.data?.summary) setSummary(res.data.summary);
      
      // Fetch fresh tasks & reviews for that scenario
      const [taskRes, revRes] = await Promise.all([
        CareFlowAPI.getTasks(),
        CareFlowAPI.getReviews()
      ]);
      if (taskRes?.data) setTasks(taskRes.data);
      if (revRes?.data) setReviews(revRes.data);

      showToast(`Switched scenario to ${scenarioId.replace('-', ' ').toUpperCase()}`);
    } catch (err) {
      console.error('Error switching scenario:', err);
      setActiveScenario(scenarioId);
      showToast(`Scenario changed`, 'info');
    } finally {
      setLoading(false);
    }
  };

  const updatePatient = async (fields) => {
    // Optimistic update
    setPatient((prev) => ({ ...prev, ...fields }));
    try {
      const res = await CareFlowAPI.updatePatient(fields);
      if (res?.data?.patient) {
        setPatient(res.data.patient);
      }
      showToast('Patient details updated successfully');
    } catch (err) {
      console.warn('Backend patient update warning, using optimistic update:', err.message);
      showToast('Patient details updated locally', 'info');
    }
  };

  return (
    <CareFlowContext.Provider
      value={{
        patient,
        summary,
        tasks,
        reviews,
        activeScenario,
        loading,
        error,
        toast,
        switchScenario,
        updateTaskStatus,
        updateReview,
        updatePatient,
        refreshData: fetchData,
        showToast
      }}
    >
      {children}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 bg-slate-900 text-white text-sm rounded-lg shadow-xl border border-slate-700 animate-slide-in">
          <span className={`w-2.5 h-2.5 rounded-full ${
            toast.type === 'error' ? 'bg-red-400' : toast.type === 'info' ? 'bg-blue-400' : 'bg-emerald-400'
          }`} />
          <span>{toast.message}</span>
        </div>
      )}
    </CareFlowContext.Provider>
  );
};
