import { apiRequest } from './api';

// Placement Drive Services

export const getAllDrives = async (status = null) => {
  const params = status ? `?status=${status}` : '';
  return await apiRequest(`/drives${params}`, { method: 'GET' });
};

export const getDriveById = async (id) => {
  return await apiRequest(`/drives/${id}`, { method: 'GET' });
};

export const getUpcomingDrives = async () => {
  return await apiRequest('/drives/upcoming/preview', { method: 'GET' });
};

// Admin-only drive services
export const createDrive = async (data) =>
  apiRequest('/drives', { method: 'POST', body: JSON.stringify(data) });

export const updateDrive = async (id, data) =>
  apiRequest(`/drives/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteDrive = async (id) =>
  apiRequest(`/drives/${id}`, { method: 'DELETE' });

export default {
  getAllDrives,
  getDriveById,
  getUpcomingDrives,
  createDrive,
  updateDrive,
  deleteDrive,
};
