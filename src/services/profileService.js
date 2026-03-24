import { apiRequest, apiUpload, getAuthToken, API_BASE_URL } from './api';

// Profile Services
export const getProfile = async () => {
  return await apiRequest('/profile', { method: 'GET' });
};

export const getEligibility = async () => {
  return await apiRequest('/profile/eligibility', { method: 'GET' });
};

export const getRanking = async () => {
  return await apiRequest('/profile/ranking', { method: 'GET' });
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

export const deleteResume = async () => {
  return await apiRequest('/profile/resume', { method: 'DELETE' });
};

export const getResumeUrl = (download = false) => {
  const token = getAuthToken();
  const params = new URLSearchParams();
  if (token) {
    params.set('token', token);
  }
  if (download) {
    params.set('download', 'true');
  }
  return `${API_BASE_URL}/profile/resume/stream?${params.toString()}`;
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

export const uploadAchievementCertificate = async (id, file) => {
  const formData = new FormData();
  formData.append('certificate', file);
  return await apiUpload(`/profile/achievements/${id}/certificate`, formData);
};

// Portfolios
export const addPortfolio = async (data) => {
  return await apiRequest('/profile/portfolios', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updatePortfolio = async (id, data) => {
  return await apiRequest(`/profile/portfolios/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deletePortfolio = async (id) => {
  return await apiRequest(`/profile/portfolios/${id}`, { method: 'DELETE' });
};

// Basic Info
export const updateBasicInfo = async (data) => {
  return await apiRequest('/profile/basic', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

// Internships
export const addInternship = async (data) => {
  return await apiRequest('/profile/internships', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateInternship = async (id, data) => {
  return await apiRequest(`/profile/internships/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteInternship = async (id) => {
  return await apiRequest(`/profile/internships/${id}`, { method: 'DELETE' });
};

export default {
  getProfile,
  getEligibility,
  getRanking,
  updateBasicInfo,
  uploadAchievementCertificate,
  updateAcademics,
  uploadPhoto,
  uploadResume,
  deleteResume,
  getResumeUrl,
  addSkill,
  deleteSkill,
  addProject,
  updateProject,
  deleteProject,
  addAchievement,
  deleteAchievement,
  addPortfolio,
  updatePortfolio,
  deletePortfolio,
  addInternship,
  updateInternship,
  deleteInternship,
};
