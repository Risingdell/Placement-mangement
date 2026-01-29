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

export default {
  getAllDrives,
  getDriveById,
  getUpcomingDrives,
};
