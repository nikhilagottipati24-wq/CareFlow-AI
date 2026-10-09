import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const CareFlowAPI = {
  // Summary & Analytics
  getSummary: (params = {}) => api.get('/analytics/summary', { params }),
  getTaskStatusDistribution: (params = {}) => api.get('/analytics/task-status', { params }),
  getCompletionTrend: (params = {}) => api.get('/analytics/completion-trend', { params }),
  getTasksByCategory: (params = {}) => api.get('/analytics/task-categories', { params }),
  getUpcomingFollowups: (params = 14) => {
    const query = typeof params === 'number' ? { days: params } : (params || { days: 14 });
    return api.get('/analytics/upcoming-followups', { params: query });
  },
  getWeeklyProgress: () => api.get('/analytics/weekly-progress'),
  getReviewIssues: () => api.get('/analytics/review-issues'),
  getAIActivityOverview: () => api.get('/analytics/ai-activity'),
  getPatient: () => api.get('/patient'),
  updatePatient: (data) => api.put('/patient', data),
  getExportUrl: (params = {}) => {
    const q = new URLSearchParams();
    if (params.category && params.category !== 'all') q.append('category', params.category);
    if (params.status && params.status !== 'all') q.append('status', params.status);
    return `${API_BASE}/analytics/export?${q.toString()}`;
  },

  // Tasks
  getTasks: (params = {}) => api.get('/tasks', { params }),
  getTask: (id) => api.get(`/tasks/${id}`),
  updateTaskStatus: (id, status, notes = '') => api.put(`/tasks/${id}/status`, { status, notes }),

  // Reviews
  getReviews: (params = {}) => api.get('/reviews', { params }),
  getReview: (id) => api.get(`/reviews/${id}`),
  updateReview: (id, status, resolution_notes = '') => api.put(`/reviews/${id}`, { status, resolution_notes }),

  // Timeline & Providers
  getTimeline: () => api.get('/timeline'),
  getProviders: (params = {}) => api.get('/providers', { params }),

  // Discharge & AI Pipeline
  uploadDischargeFile: (formData, onUploadProgress) => api.post('/discharge/upload', formData, {
    headers: { 'Content-Type': undefined },
    onUploadProgress,
  }),
  analyzeDischargeText: (raw_text, patient_id) => api.post('/discharge/analyze', { raw_text, patient_id }),
  getDischargeDoc: (id) => api.get(`/discharge/${id}`),

  // Scenarios & Activity
  switchScenario: (scenarioId) => api.post(`/scenarios/${scenarioId}/switch`),
  getActivityLogs: () => api.get('/activity'),
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 502) {
      error.message = 'Backend server is unavailable (HTTP 502 Bad Gateway). Ensure FastAPI is running on port 8000.';
    }
    return Promise.reject(error);
  }
);

export default api;
