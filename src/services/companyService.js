import { apiRequest, API_BASE_URL, getAuthToken } from './api';

// Helper to send multipart form data (for logo uploads)
const apiFormData = async (endpoint, method, formData) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: { ...(token && { Authorization: `Bearer ${token}` }) },
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Request failed');
  return data;
};

// Get all companies
export const getAllCompanies = async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const endpoint = params ? `/admin/companies?${params}` : '/admin/companies';
    return apiRequest(endpoint, { method: 'GET' });
};

// Get company by ID
export const getCompanyById = async (id) =>
    apiRequest(`/admin/companies/${id}`, { method: 'GET' });

// Create new company (accepts FormData for logo upload)
export const createCompany = async (companyData) =>
    companyData instanceof FormData
        ? apiFormData('/admin/companies', 'POST', companyData)
        : apiRequest('/admin/companies', { method: 'POST', body: JSON.stringify(companyData) });

// Update company (accepts FormData for logo upload)
export const updateCompany = async (id, companyData) =>
    companyData instanceof FormData
        ? apiFormData(`/admin/companies/${id}`, 'PUT', companyData)
        : apiRequest(`/admin/companies/${id}`, { method: 'PUT', body: JSON.stringify(companyData) });

// Delete company
export const deleteCompany = async (id) =>
    apiRequest(`/admin/companies/${id}`, { method: 'DELETE' });

// Get eligible students based on criteria
export const getEligibleStudents = async (criteria) => {
    const params = new URLSearchParams();
    if (criteria.minCgpa) params.append('minCgpa', criteria.minCgpa);
    if (criteria.branches && criteria.branches.length > 0)
        params.append('branches', criteria.branches.join(','));
    if (criteria.maxBacklogs !== undefined && criteria.maxBacklogs !== '')
        params.append('maxBacklogs', criteria.maxBacklogs);
    if (criteria.batchYears && criteria.batchYears.length > 0)
        params.append('batchYears', criteria.batchYears.join(','));

    const qs = params.toString();
    return apiRequest(`/admin/companies/eligible-students${qs ? `?${qs}` : ''}`, { method: 'GET' });
};

// Get company shortlists
export const getCompanyShortlists = async (companyId) =>
    apiRequest(`/admin/companies/${companyId}/shortlists`, { method: 'GET' });

// Create a shortlist entry for a company
export const createShortlist = async (companyId, shortlistData) =>
    apiRequest(`/admin/companies/${companyId}/shortlists`, {
        method: 'POST', body: JSON.stringify(shortlistData)
    });

// Search students by name or USN
export const searchStudents = async (searchTerm) =>
    apiRequest(`/admin/students?search=${encodeURIComponent(searchTerm)}`, { method: 'GET' });

// Send bulk notifications to shortlisted students
export const notifyShortlistedStudents = async (companyId) =>
    apiRequest(`/admin/companies/${companyId}/notify`, { method: 'POST', body: JSON.stringify({}) });


export default {
    getAllCompanies,
    getCompanyById,
    createCompany,
    updateCompany,
    deleteCompany,
    getEligibleStudents,
    getCompanyShortlists,
    createShortlist,
    searchStudents,
    notifyShortlistedStudents
};
