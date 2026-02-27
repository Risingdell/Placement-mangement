const API_URL = 'http://localhost:5000/api/admin/authorized-emails';

// Get authorization token
const getAuthHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json'
});

// Get all authorized emails
export const getAllAuthorizedEmails = async (filters = {}) => {
  const params = new URLSearchParams();

  // Add filter parameters
  if (filters.search) params.append('search', filters.search);
  if (filters.status) params.append('status', filters.status);
  if (filters.batch_year) params.append('batch_year', filters.batch_year);
  if (filters.branch) params.append('branch', filters.branch);
  if (filters.limit) params.append('limit', filters.limit);
  if (filters.offset) params.append('offset', filters.offset);
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.order) params.append('order', filters.order);

  const endpoint = params.toString() ? `${API_URL}?${params.toString()}` : API_URL;

  const res = await fetch(endpoint, {
    headers: getAuthHeaders()
  });

  if (!res.ok) {
    let message = 'Failed to fetch authorized emails';
    try {
      const error = await res.json();
      if (error?.message) message = error.message;
      if (error?.error) message = `${message}: ${error.error}`;
    } catch (_) {
      // Keep default message when response is not JSON
    }
    throw new Error(message);
  }

  return res.json();
};

// Get email by ID
export const getAuthorizedEmailById = async (id) => {
  const res = await fetch(`${API_URL}/${id}`, {
    headers: getAuthHeaders()
  });

  if (!res.ok) {
    throw new Error('Failed to fetch email details');
  }

  return res.json();
};

// Create single authorized email
export const createAuthorizedEmail = async (emailData) => {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(emailData)
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to authorize email');
  }

  return res.json();
};

// Bulk create authorized emails
export const bulkCreateAuthorizedEmails = async (emailsArray) => {
  const res = await fetch(`${API_URL}/bulk`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ emails: emailsArray })
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to bulk authorize emails');
  }

  return res.json();
};

// Update authorized email
export const updateAuthorizedEmail = async (id, emailData) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(emailData)
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to update authorized email');
  }

  return res.json();
};

// Delete authorized email
export const deleteAuthorizedEmail = async (id) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to delete authorized email');
  }

  return res.json();
};

// Toggle email active status
export const toggleEmailStatus = async (id) => {
  const res = await fetch(`${API_URL}/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders()
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to toggle email status');
  }

  return res.json();
};

// Get statistics
export const getStatistics = async () => {
  const res = await fetch(`${API_URL}/statistics`, {
    headers: getAuthHeaders()
  });

  if (!res.ok) {
    throw new Error('Failed to fetch statistics');
  }

  return res.json();
};

// Check if email is authorized (public endpoint - NO authentication required)
export const checkEmailAuthorization = async (email) => {
  try {
    // Uses the auth route - completely public, no admin middleware
    const res = await fetch(`http://localhost:5000/api/auth/check-email/${encodeURIComponent(email)}`);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error checking email:', error);
    // On network error, allow form to proceed (registration will do final check)
    return {
      success: true,
      authorized: true,
      reason: 'Could not verify email, proceeding'
    };
  }
};

// Parse CSV file content
export const parseCSV = (csvContent) => {
  const lines = csvContent.trim().split('\n');

  if (lines.length < 2) {
    return [];
  }

  // Parse header row (case-insensitive)
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

  const emails = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.length === 0) continue;

    const values = line.split(',').map(v => v.trim());
    const emailObj = {};

    headers.forEach((header, index) => {
      if (values[index]) {
        emailObj[header] = values[index];
      }
    });

    // Only add if email exists
    if (emailObj.email) {
      emails.push(emailObj);
    }
  }

  return emails;
};

export default {
  getAllAuthorizedEmails,
  getAuthorizedEmailById,
  createAuthorizedEmail,
  bulkCreateAuthorizedEmails,
  updateAuthorizedEmail,
  deleteAuthorizedEmail,
  toggleEmailStatus,
  getStatistics,
  checkEmailAuthorization,
  parseCSV
};
