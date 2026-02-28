// Base API configuration and helper functions

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const inFlightGetRequests = new Map();
const recentGetResponses = new Map();
const GET_CACHE_TTL_MS = 1500;

// Get auth token from localStorage
const getAuthToken = () => {
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

export default {
  apiRequest,
  apiUpload,
};
