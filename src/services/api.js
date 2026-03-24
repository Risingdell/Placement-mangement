// Base API configuration and helper functions

export const API_BASE_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';
const inFlightGetRequests = new Map();
const recentGetResponses = new Map();
const GET_CACHE_TTL_MS = 1500;

// Get auth token from localStorage
export const getAuthToken = () => {
  return localStorage.getItem('token');
};

// API request helper with authentication
export const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const method = (options.method || 'GET').toUpperCase();
  const isGet = method === 'GET';
  const requestKey = `${method}:${API_BASE_URL}${endpoint}:token:${token || 'none'}`;
  const now = Date.now();

  if (isGet) {
    const cached = recentGetResponses.get(requestKey);
    if (cached && now - cached.timestamp < GET_CACHE_TTL_MS) {
      return cached.data;
    }

    if (inFlightGetRequests.has(requestKey)) {
      return inFlightGetRequests.get(requestKey);
    }
  }

  const config = {
    ...options,
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const requestPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      if (isGet) {
        recentGetResponses.set(requestKey, { data, timestamp: Date.now() });
      }

      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    } finally {
      if (isGet) {
        inFlightGetRequests.delete(requestKey);
      }
    }
  })();

  if (isGet) {
    inFlightGetRequests.set(requestKey, requestPromise);
  }

  return requestPromise;
};

// API request for file uploads
export const apiUpload = async (endpoint, formData) => {
  const token = getAuthToken();

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Upload failed');
    }

    return data;
  } catch (error) {
    console.error('API Upload Error:', error);
    throw error;
  }
};

// Helper to resolve static file URLs
export const resolveFileUrl = (filePath) => {
  if (!filePath) return '';
  if (/^https?:\/\//i.test(filePath)) return filePath;

  const apiBaseOrigin = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${apiBaseOrigin}${filePath.startsWith('/') ? '' : '/'}${filePath}`;
};

// Helper to resolve Cloudinary URLs for inline preview (not download)
// NOTE: Removed fl_attachment:false transformation because:
// 1. It breaks the URL structure (returns 404)
// 2. Modern browsers handle PDF display in iframes automatically
// 3. The native browser PDF viewer is more reliable than forcing inline
export const resolveCloudinaryUrl = (cloudinaryPath) => {
  if (!cloudinaryPath) return '';
  // Return URL as-is - browser will handle PDF preview
  return cloudinaryPath;
};

export default {
  apiRequest,
  apiUpload,
  resolveFileUrl,
  resolveCloudinaryUrl,
};
