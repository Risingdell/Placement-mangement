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

export default {
  getMyApplications,
  getApplicationById,
  applyForDrive,
  withdrawApplication,
};
