import { apiRequest, apiUpload } from './api';

// Profile Services
export const getProfile = async () => {
  return await apiRequest('/profile', { method: 'GET' });
};

export const getEligibility = async () => {
  return await apiRequest('/profile/eligibility', { method: 'GET' });
};

export const updateAcademics = async (data) => {
  return await apiRequest('/profile/academics', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const uploadPhoto = async (file) => {
  const formData = new FormData();
  formData.append('photo', file);
  return await apiUpload('/profile/photo', formData);
};

export const uploadResume = async (file) => {
  const formData = new FormData();
  formData.append('resume', file);
  return await apiUpload('/profile/resume', formData);
};

// Skills
export const addSkill = async (data) => {
  return await apiRequest('/profile/skills', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const deleteSkill = async (id) => {
  return await apiRequest(`/profile/skills/${id}`, { method: 'DELETE' });
};

// Projects
export const addProject = async (data) => {
  return await apiRequest('/profile/projects', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateProject = async (id, data) => {
  return await apiRequest(`/profile/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteProject = async (id) => {
  return await apiRequest(`/profile/projects/${id}`, { method: 'DELETE' });
};

// Achievements
export const addAchievement = async (data) => {
  return await apiRequest('/profile/achievements', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const deleteAchievement = async (id) => {
  return await apiRequest(`/profile/achievements/${id}`, { method: 'DELETE' });
};

export default {
  getProfile,
  getEligibility,
  updateAcademics,
  uploadPhoto,
  uploadResume,
  addSkill,
  deleteSkill,
  addProject,
  updateProject,
  deleteProject,
  addAchievement,
  deleteAchievement,
};
