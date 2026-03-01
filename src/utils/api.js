import axios from 'axios';

const API_BASE_URL = '';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// Admin API endpoints
export const adminAPI = {
  // Companies
  companies: {
    getAll: (params) => api.get('/api/admin/companies', { params }),
    getById: (id) => api.get(`/api/admin/companies/${id}`),
    create: (data) => api.post('/api/admin/companies', data),
    update: (id, data) => api.put(`/api/admin/companies/${id}`, data),
    delete: (id) => api.delete(`/api/admin/companies/${id}`),
    getShortlists: (id) => api.get(`/api/admin/companies/${id}/shortlists`),
    createShortlist: (id, data) => api.post(`/api/admin/companies/${id}/shortlists`, data),
  },

  // Students
  students: {
    getAll: (params) => api.get('/api/admin/students', { params }),
    getById: (id) => api.get(`/api/admin/students/${id}`),
    getStats: () => api.get('/api/admin/students/stats'),
    update: (id, data) => api.put(`/api/admin/students/${id}`, data),
    updatePlacementStatus: (id, data) => api.put(`/api/admin/students/${id}/placement-status`, data),
  },

  // Applications
  applications: {
    getAll: (params) => api.get('/api/admin/applications', { params }),
    getById: (id) => api.get(`/api/admin/applications/${id}`),
    getStats: () => api.get('/api/admin/applications/stats'),
    updateStatus: (id, data) => api.put(`/api/admin/applications/${id}/status`, data),
    bulkUpdateStatus: (data) => api.post('/api/admin/applications/bulk/update-status', data),
    export: (data) => api.post('/api/admin/applications/export', data),
  },

  // Messages
  messages: {
    getAll: (params) => api.get('/api/admin/messages', { params }),
    getById: (id) => api.get(`/api/admin/messages/${id}`),
    send: (data) => api.post('/api/admin/messages', data),
    reply: (id, data) => api.post(`/api/admin/messages/${id}/reply`, data),
    markAsRead: (id) => api.put(`/api/admin/messages/${id}/read`),
    delete: (id) => api.delete(`/api/admin/messages/${id}`),
  },

  // Notifications
  notifications: {
    getAll: (params) => api.get('/api/admin/notifications', { params }),
    getById: (id) => api.get(`/api/admin/notifications/${id}`),
    create: (data) => api.post('/api/admin/notifications', data),
    update: (id, data) => api.put(`/api/admin/notifications/${id}`, data),
    delete: (id) => api.delete(`/api/admin/notifications/${id}`),
    send: (id) => api.post(`/api/admin/notifications/${id}/send`),
    getRecipients: (id) => api.get(`/api/admin/notifications/${id}/recipients`),
  },

  // Statistics
  stats: {
    getDashboard: () => api.get('/api/admin/stats/dashboard'),
    getPlacement: (params) => api.get('/api/admin/stats/placement', { params }),
    getBranchWise: () => api.get('/api/admin/stats/branch-wise'),
    getCompanyWise: () => api.get('/api/admin/stats/company-wise'),
    getSalaryAnalysis: () => api.get('/api/admin/stats/salary-analysis'),
    getApplicationTrends: () => api.get('/api/admin/stats/application-trends'),
    exportReport: (data) => api.post('/api/admin/stats/export', data),
  },
};

export default api;
