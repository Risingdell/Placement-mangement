import { createContext, useContext, useState } from 'react';
import profileService from '../services/profileService';

const StudentContext = createContext();

export const useStudent = () => {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error('useStudent must be used within StudentProvider');
  }
  return context;
};

export const StudentProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await profileService.getProfile();
      if (response.success) {
        setProfile(response.data);
      }
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEligibility = async () => {
    try {
      const response = await profileService.getEligibility();
      if (response.success) {
        setEligibility(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch eligibility:', err);
    }
  };

  const updateAcademics = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await profileService.updateAcademics(data);
      if (response.success) {
        await fetchProfile();
        await fetchEligibility();
        return true;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addSkill = async (data) => {
    try {
      const response = await profileService.addSkill(data);
      if (response.success) {
        await fetchProfile();
        return true;
      }
    } catch (err) {
      throw err;
    }
  };

  const deleteSkill = async (id) => {
    try {
      const response = await profileService.deleteSkill(id);
      if (response.success) {
        await fetchProfile();
        return true;
      }
    } catch (err) {
      throw err;
    }
  };

  const addProject = async (data) => {
    try {
      const response = await profileService.addProject(data);
      if (response.success) {
        await fetchProfile();
        await fetchEligibility();
        return true;
      }
    } catch (err) {
      throw err;
    }
  };

  const updateProject = async (id, data) => {
    try {
      const response = await profileService.updateProject(id, data);
      if (response.success) {
        await fetchProfile();
        await fetchEligibility();
        return true;
      }
    } catch (err) {
      throw err;
    }
  };

  const deleteProject = async (id) => {
    try {
      const response = await profileService.deleteProject(id);
      if (response.success) {
        await fetchProfile();
        await fetchEligibility();
        return true;
      }
    } catch (err) {
      throw err;
    }
  };

  const addAchievement = async (data) => {
    try {
      const response = await profileService.addAchievement(data);
      if (response.success) {
        await fetchProfile();
        return true;
      }
    } catch (err) {
      throw err;
    }
  };

  const deleteAchievement = async (id) => {
    try {
      const response = await profileService.deleteAchievement(id);
      if (response.success) {
        await fetchProfile();
        return true;
      }
    } catch (err) {
      throw err;
    }
  };

  const uploadPhoto = async (file) => {
    try {
      const response = await profileService.uploadPhoto(file);
      if (response.success) {
        await fetchProfile();
        return true;
      }
    } catch (err) {
      throw err;
    }
  };

  const uploadResume = async (file) => {
    try {
      const response = await profileService.uploadResume(file);
      if (response.success) {
        await fetchProfile();
        return true;
      }
    } catch (err) {
      throw err;
    }
  };

  const value = {
    profile,
    eligibility,
    loading,
    error,
    fetchProfile,
    fetchEligibility,
    updateAcademics,
    addSkill,
    deleteSkill,
    addProject,
    updateProject,
    deleteProject,
    addAchievement,
    deleteAchievement,
    uploadPhoto,
    uploadResume,
  };

  return <StudentContext.Provider value={value}>{children}</StudentContext.Provider>;
};

export default StudentContext;
