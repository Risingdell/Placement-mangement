import { apiRequest } from './api';

// Application Services

export const getMyApplications = async () => {
  return await apiRequest('/applications', { method: 'GET' });
};

export const getApplicationById = async (id) => {
  return await apiRequest(`/applications/${id}`, { method: 'GET' });
};

export const applyForDrive = async (driveId) => {
  return await apiRequest('/applications', {
    method: 'POST',
    body: JSON.stringify({ driveId }),
  });
};

export const withdrawApplication = async (id) => {
  return await apiRequest(`/applications/${id}`, { method: 'DELETE' });
};

// Admin Application Services
export const getAdminApplications = async (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.search) params.append('search', filters.search);
  if (filters.status) params.append('status', filters.status);
  if (filters.company) params.append('company', filters.company);
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.order) params.append('order', filters.order);

  const queryString = params.toString();
  const url = `/admin/applications${queryString ? '?' + queryString : ''}`;

  return await apiRequest(url, { method: 'GET' });
};

export const getApplicationStats = async () => {
  return await apiRequest('/admin/applications/stats', { method: 'GET' });
};

export const updateApplicationStatus = async (applicationId, status, remarks = '') => {
  return await apiRequest(`/admin/applications/${applicationId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, remarks }),
  });
};

export const bulkUpdateApplicationStatus = async (applicationIds, status) => {
  return await apiRequest('/admin/applications/bulk/update-status', {
    method: 'POST',
    body: JSON.stringify({ applicationIds, status }),
  });
};

export default {
  getMyApplications,
  getApplicationById,
  applyForDrive,
  withdrawApplication,
  getAdminApplications,
  getApplicationStats,
  updateApplicationStatus,
  bulkUpdateApplicationStatus,
};
