import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

export const getDashboard = async () => {
  const res = await api.get('/dashboard');
  return res.data;
};

export const getDischargeDocument = async (id = 'default') => {
  const res = await api.get(`/discharge/${id}`);
  return res.data;
};

export const getScenarios = async () => {
  const res = await api.get('/scenarios');
  return res.data;
};

export const uploadDischargeDocument = async (formData) => {
  const res = await api.post('/discharge/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const analyzeDischargeText = async (payload) => {
  const res = await api.post('/discharge/analyze', payload);
  return res.data;
};

export const getTasks = async (status = '', category = '') => {
  const params = {};
  if (status && status !== 'All') params.status = status;
  if (category && category !== 'All') params.category = category;
  const res = await api.get('/tasks', { params });
  return res.data;
};

export const updateTaskStatus = async (taskId, status) => {
  const res = await api.put(`/tasks/${taskId}/status`, { status });
  return res.data;
};

export const getTimeline = async () => {
  const res = await api.get('/timeline');
  return res.data;
};

export const getProviders = async (specialty = '', location = '', facility = '') => {
  const params = {};
  if (specialty && specialty !== 'All') params.specialty = specialty;
  if (location && location !== 'All') params.location = location;
  if (facility) params.facility = facility;
  const res = await api.get('/providers', { params });
  return res.data;
};

export const getReviews = async () => {
  const res = await api.get('/reviews');
  return res.data;
};

export const getReviewDetail = async (id) => {
  const res = await api.get(`/reviews/${id}`);
  return res.data;
};

export const updateReviewItem = async (id, status, reviewer_notes = '') => {
  const res = await api.put(`/reviews/${id}`, { status, reviewer_notes });
  return res.data;
};

export const getAuditLogs = async () => {
  const res = await api.get('/audit-logs');
  return res.data;
};

export const checkSafetyQuery = async (query, context = '') => {
  const res = await api.post('/safety/check-query', { query, context });
  return res.data;
};

export const escalateSafetyQuery = async (query, explanation = '') => {
  const res = await api.post('/safety/escalate', { query, explanation });
  return res.data;
};

export const getPatient = async () => {
  const res = await api.get('/patient');
  return res.data;
};

export const updatePatient = async (payload) => {
  const res = await api.put('/patient', payload);
  return res.data;
};

export const loginUser = async (payload) => {
  const res = await api.post('/auth/login', payload);
  return res.data;
};

export const registerUser = async (payload) => {
  const res = await api.post('/auth/register', payload);
  return res.data;
};

export default api;
