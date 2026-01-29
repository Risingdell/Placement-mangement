// Base API configuration and helper functions

const API_BASE_URL = 'http://localhost:5000/api';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// API request helper with authentication
export const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
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
