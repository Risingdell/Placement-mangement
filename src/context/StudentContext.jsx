import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
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
  const profileRequestRef = useRef(null);
  const eligibilityRequestRef = useRef(null);
  const profileCacheRef = useRef(null);
  const eligibilityCacheRef = useRef(null);
  const profileFetchedAtRef = useRef(0);
  const eligibilityFetchedAtRef = useRef(0);

  useEffect(() => {
    profileCacheRef.current = profile;
  }, [profile]);

  useEffect(() => {
    eligibilityCacheRef.current = eligibility;
  }, [eligibility]);

  const fetchProfile = useCallback(async ({ force = false } = {}) => {
    const now = Date.now();
    const isFresh = now - profileFetchedAtRef.current < 10000;
    if (!force && profileCacheRef.current) {
      return { success: true, data: profileCacheRef.current };
    }

    if (profileRequestRef.current) {
      return profileRequestRef.current;
    }

    profileRequestRef.current = (async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await profileService.getProfile();
        if (response.success) {
          setProfile(response.data);
          profileFetchedAtRef.current = Date.now();
        }
        return response;
      } catch (err) {
        setError(err.message);
        console.error('Failed to fetch profile:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    })();

    try {
      return await profileRequestRef.current;
    } finally {
      profileRequestRef.current = null;
    }
  }, []);

  const fetchEligibility = useCallback(async ({ force = false } = {}) => {
    const now = Date.now();
    const isFresh = now - eligibilityFetchedAtRef.current < 10000;
    if (!force && eligibilityCacheRef.current) {
      return { success: true, data: eligibilityCacheRef.current };
    }

    if (eligibilityRequestRef.current) {
      return eligibilityRequestRef.current;
    }

    eligibilityRequestRef.current = (async () => {
      try {
        const response = await profileService.getEligibility();
        if (response.success) {
          setEligibility(response.data);
          eligibilityFetchedAtRef.current = Date.now();
        }
        return response;
      } catch (err) {
        console.error('Failed to fetch eligibility:', err);
        throw err;
      }
    })();

    try {
      return await eligibilityRequestRef.current;
    } finally {
      eligibilityRequestRef.current = null;
    }
  }, []);

  const updateAcademics = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await profileService.updateAcademics(data);
      if (response.success) {
        await fetchProfile({ force: true });
        await fetchEligibility({ force: true });
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
        await fetchProfile({ force: true });
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
        await fetchProfile({ force: true });
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
        await fetchProfile({ force: true });
        await fetchEligibility({ force: true });
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
        await fetchProfile({ force: true });
        await fetchEligibility({ force: true });
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
        await fetchProfile({ force: true });
        await fetchEligibility({ force: true });
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
        await fetchProfile({ force: true });
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
        await fetchProfile({ force: true });
        return true;
      }
    } catch (err) {
      throw err;
    }
  };

  const uploadAchievementCertificate = async (id, file) => {
    try {
      const response = await profileService.uploadAchievementCertificate(id, file);
      if (response.success) {
        await fetchProfile({ force: true });
        return response;
      }
    } catch (err) {
      throw err;
    }
  };

  const uploadPhoto = async (file) => {
    try {
      const response = await profileService.uploadPhoto(file);
      if (response.success) {
        await fetchProfile({ force: true });
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
        await fetchProfile({ force: true });
        return true;
      }
    } catch (err) {
      throw err;
    }
  };

  const addPortfolio = async (data) => {
    try {
      const response = await profileService.addPortfolio(data);
      if (response.success) {
        await fetchProfile({ force: true });
        return true;
      }
    } catch (err) {
      throw err;
    }
  };

  const updatePortfolio = async (id, data) => {
    try {
      const response = await profileService.updatePortfolio(id, data);
      if (response.success) {
        await fetchProfile({ force: true });
        return true;
      }
    } catch (err) {
      throw err;
    }
  };

  const deletePortfolio = async (id) => {
    try {
      const response = await profileService.deletePortfolio(id);
      if (response.success) {
        await fetchProfile({ force: true });
        return true;
      }
    } catch (err) {
      throw err;
    }
  };

  const deleteResume = async () => {
    try {
      const response = await profileService.deleteResume();
      if (response.success) {
        await fetchProfile({ force: true });
        return true;
      }
    } catch (err) {
      throw err;
    }
  };

  const updateBasicInfo = async (data) => {
    try {
      const response = await profileService.updateBasicInfo(data);
      if (response.success) {
        await fetchProfile({ force: true });
        return true;
      }
    } catch (err) {
      throw err;
    }
  };

  const addInternship = async (data) => {
    try {
      const response = await profileService.addInternship(data);
      if (response.success) {
        await fetchProfile({ force: true });
        return true;
      }
    } catch (err) {
      throw err;
    }
  };

  const updateInternship = async (id, data) => {
    try {
      const response = await profileService.updateInternship(id, data);
      if (response.success) {
        await fetchProfile({ force: true });
        return true;
      }
    } catch (err) {
      throw err;
    }
  };

  const deleteInternship = async (id) => {
    try {
      const response = await profileService.deleteInternship(id);
      if (response.success) {
        await fetchProfile({ force: true });
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
    updateBasicInfo,
    updateAcademics,
    addSkill,
    deleteSkill,
    addProject,
    updateProject,
    deleteProject,
    addAchievement,
    deleteAchievement,
    uploadAchievementCertificate,
    addPortfolio,
    updatePortfolio,
    deletePortfolio,
    uploadPhoto,
    uploadResume,
    deleteResume,
    addInternship,
    updateInternship,
    deleteInternship,
  };

  return <StudentContext.Provider value={value}>{children}</StudentContext.Provider>;
};

export default StudentContext;

