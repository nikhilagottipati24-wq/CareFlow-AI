import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  // 1. Patient
  getPatient: async () => {
    try {
      const res = await client.get('/api/patient');
      return res.data;
    } catch (e) {
      console.warn("Backend not reached for getPatient, using local fallback", e);
      return {
        id: "SYN-PT-80214",
        name: "Alex Johnson",
        age: 52,
        gender: "Male",
        language: "English",
        hospital: "Synthetic General Hospital",
        discharge_date: "October 14, 2026",
        primary_diagnosis: "Acute Anterior STEMI (Post-PCI Status)",
        allergies: "No Known Drug Allergies (NKDA)",
      };
    }
  },

  updatePatient: async (payload) => {
    const res = await client.put('/api/patient', payload);
    return res.data;
  },

  // 2. Upload Document
  uploadDocument: async (formData) => {
    const res = await client.post('/api/discharge/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  // 3. Analyze Document
  analyzeDocument: async (payload) => {
    const res = await client.post('/api/discharge/analyze', payload);
    return res.data;
  },

  // 4. Get Current Discharge Summary
  getDischargeSummary: async (docId = 'default') => {
    const res = await client.get(`/api/discharge/${docId}`);
    return res.data;
  },

  // 5. Tasks
  getTasks: async (params = {}) => {
    const res = await client.get('/api/tasks', { params });
    return res.data;
  },

  updateTaskStatus: async (taskId, status) => {
    const res = await client.put(`/api/tasks/${taskId}/status`, { status });
    return res.data;
  },

  // 6. Timeline
  getTimeline: async () => {
    const res = await client.get('/api/timeline');
    return res.data;
  },

  // 7. Providers
  getProviders: async (params = {}) => {
    const res = await client.get('/api/providers', { params });
    return res.data;
  },

  // 8. Reviews
  getReviews: async (params = {}) => {
    const res = await client.get('/api/reviews', { params });
    return res.data;
  },

  getReview: async (reviewId) => {
    const res = await client.get(`/api/reviews/${reviewId}`);
    return res.data;
  },

  updateReview: async (reviewId, status, notes = '', duration = '') => {
    const res = await client.put(`/api/reviews/${reviewId}`, {
      status,
      resolution_notes: notes,
      duration: duration,
    });
    return res.data;
  },

  // 9. AI Activity
  getActivityLogs: async () => {
    const res = await client.get('/api/activity');
    return res.data;
  },

  // 10. Scenarios
  getScenarios: async () => {
    const res = await client.get('/api/scenarios');
    return res.data;
  },

  loadScenario: async (scenarioId) => {
    const res = await client.post(`/api/scenarios/${scenarioId}/load`);
    return res.data;
  },

  // 11. Safety Check
  checkSafety: async (query) => {
    const res = await client.post('/api/safety/check', { query });
    return res.data;
  },
};
